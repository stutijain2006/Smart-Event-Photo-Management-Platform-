import uuid
import os
import io
from django.core.files.storage import default_storage
from django.core.mail import send_mail
from django.conf import settings
from PIL import Image, ExifTags
from django.db.models import Q
from django.contrib.auth import login , logout
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from rest_framework import status,generics,  permissions
from django.db import transaction
from django.shortcuts import redirect
from django.contrib.auth import authenticate
from rest_framework.authentication import SessionAuthentication
from rest_framework.exceptions import ValidationError
from django.http import FileResponse
from .utils import generate_variants
from .notifications.utils import send_notification  
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from rest_framework.generics import ListAPIView
from .auto_tagging import generate_tags
from django.shortcuts import redirect
from .models import Person , EmailOTP, UserRole , OmniportAccount, Photo, Album, Events, PhotoLike , Comments, Download, PersonTag, Role, RoleChangeRequest, PhotoMetaData, OAuthState, Notification
from .serializers import (
    RegisterSerializer,
    LoginSerializer,
    VerifyEmailSerializer,
    PersonSerializer,
    PhotoSerializer,
    AlbumSerializer,
    EventSerializer,
    PhotoLikeSerializer,
    CommentSerializer,
    DownloadSerializer,
    PersonTagSerializer,
    AlbumAddPhotoSerializer,
    RoleChangeRequestSerializer,
    AdminPeopleSerializer,
    PhotoMetaDataSerializer,
    MeSerializer,
    RoleSerializer,
    NotificationSerializer
)
from .permissions import (  
    IsEventManagerOrAdmin,
    IsPhotographerOrAdmin,
    IsNotUser,
    IsAdmin
)
from .utils import (
    generate_otp,
    get_omniport_authorize_url,
    omniport_exchange_code_for_tokens,
    omniport_user_data,
    omniport_revoke_token
)

class CsrfExemptSessionAuthentication(SessionAuthentication):
    def enforce_csrf(self, request):
        return

class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = [CsrfExemptSessionAuthentication]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        email_id=serializer.validated_data['email_id']
        password = serializer.validated_data['password']
        person_name = serializer.validated_data['person_name']

        user = Person.objects.filter(email_id=email_id).first()
        if user and user.is_email_verified:
            return Response({
                "message": "User already exists and is verified. Please Login.",
            }, status=status.HTTP_400_BAD_REQUEST)

        if user and not user.is_email_verified:
            user.set_password(password)
            user.person_name = person_name
            user.save()

        if not user:
            user = Person.objects.create(
                email_id=email_id,
                person_name=person_name,
                is_active=True,
                is_email_verified=False,
            )
            user.set_password(serializer.validated_data['password'])
            user.save()

        EmailOTP.objects.filter(email_id=user.email_id, is_used=False).update(is_used=True)
        otp = generate_otp()
        EmailOTP.objects.create(email_id=user.email_id, otp=otp)
        send_mail(
            'Verify your email',
            f'Your OTP for email verification is: {otp}',
            settings.DEFAULT_FROM_EMAIL,
            [user.email_id],
            fail_silently=False,
        )
        return Response({
            "message": "User registered successfully. Please verify your email.",
            "otp": otp
        }, status=status.HTTP_201_CREATED)
    
class VerifyEmail(APIView):
    permissions_classes = [permissions.AllowAny]
    def post(self, request):
        serializer = VerifyEmailSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        email_id = serializer.validated_data['email_id']
        otp = serializer.validated_data['otp']
        
        try:
            email_otp = EmailOTP.objects.get(email_id=email_id, otp=otp)
        except EmailOTP.DoesNotExist:
            return Response({'error': 'Invalid OTP'}, status=status.HTTP_400_BAD_REQUEST)
        
        if email_otp.is_used:
            return Response({'error': 'OTP already used'}, status=status.HTTP_400_BAD_REQUEST)
        
        email_otp.is_used = True
        email_otp.save()
        
        user = Person.objects.get(email_id=email_id)
        user.is_email_verified = True
        user.save()
        
        return Response({'message': 'Email verified successfully'}, status=status.HTTP_200_OK)
    
class LoginView(APIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = [CsrfExemptSessionAuthentication]
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        user = serializer.validated_data['user']
        user.backend = "django.contrib.auth.backends.ModelBackend"
        login(request, user)
        return Response({"message": "User logged in successfully"}, status=status.HTTP_200_OK)
    
class LogOut(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request):
        logout(request)
        return Response ({"message": "User logged out successfully"}, status=status.HTTP_200_OK)
    
class OmniportLoginURLView(APIView):
    permission_classes = [permissions.AllowAny]
    def get(self, request):
        state = uuid.uuid4().hex
        # Store state in database instead of session for OAuth redirect reliability
        try:
            oauth_state = OAuthState.objects.create(state=state)
            print("STATE SET IN DB:", state)
            print("STATE ID:", oauth_state.id)
            # Verify it was saved
            verify_state = OAuthState.objects.filter(state=state).exists()
            print("STATE VERIFIED IN DB:", verify_state)
        except Exception as e:
            print("ERROR CREATING STATE:", str(e))
            raise
        authorize_url = get_omniport_authorize_url(state)
        return redirect(authorize_url)
    
class OmniportCallBackView(APIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = [CsrfExemptSessionAuthentication]
    
    def get(self, request):
        code = request.GET.get('code')
        state = request.GET.get('state')

        if not code or not state:
            return Response({'error': 'Missing code or state'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            with transaction.atomic():
                oauth_state = OAuthState.objects.select_for_update().get(state=state)
        except OAuthState.DoesNotExist:
            return Response({'error': 'Invalid or already used state'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            token_data = omniport_exchange_code_for_tokens(code)
        except Exception as e:
            if hasattr(e, 'response') and e.response is not None:
                try:
                    error_text = e.response.text
                    if 'invalid_grant' in error_text.lower():
                        return Response({
                            'error': 'Authorization code has already been used or expired. Please try logging in again.'
                        }, status=status.HTTP_400_BAD_REQUEST)
                except:
                    pass
            return Response({
                'error': 'Failed to exchange code for tokens',
                'detail': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
        
        
        access_token = token_data.get('access_token')
        refresh_token = token_data.get('refresh_token')
        if not access_token:
            return Response ({'error': 'Access token not found'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user_data = omniport_user_data(access_token)
        except Exception as e:
            return Response({"error": "Failed to get user data"}, status=status.HTTP_400_BAD_REQUEST)
        
        omniport_user_id = str(user_data.get('userId') or user_data.get("username"))
        username = user_data.get("username")
        person = user_data.get("person") or {}
        student= user_data.get("student") or {}
        contact_info = user_data.get("contactInformation") or {}
        full_name = person.get("fullName") or {}
        profile_photo = person.get("displayPicture") or {}
        if profile_photo:
            if profile_photo.startswith("/"):
                profile_photo = f"https://channeli.in{profile_photo}"
        department = (
            student.get("branch department name")
        )
        email= contact_info.get("emailAddress")
        email_verified = contact_info.get("emailAddressVerified", False)

        if not omniport_user_id or not email:
            return Response({"error": "Missing omniport_user_id or email_id"}, status=status.HTTP_400_BAD_REQUEST)
        
        user, created = Person.objects.get_or_create(omniport_user_id=omniport_user_id)
        user.username = username
        user.email_id = email
        user.is_email_verified = email_verified
        user.department = department
        user.omniport_profile_picture = profile_photo
        user.person_name = full_name
        user.is_active = True
        user.save()
        
        omniport_account, acc_created = OmniportAccount.objects.get_or_create( omniport_user_id=omniport_user_id, defaults={
            "person_id" : user,
            "access_token" : access_token,
            "refresh_token" : refresh_token
        })
        omniport_account.save()

        if not acc_created:
            omniport_account.person_id = user
            omniport_account.omniport_user_id = omniport_user_id
            omniport_account.access_token = access_token
            omniport_account.refresh_token = refresh_token
            omniport_account.save()

        user.backend="django.contrib.auth.backends.ModelBackend"
        login(request, user)
        oauth_state.delete()
        return redirect("http://localhost:3000/omniport/callback")
    

class EventListCreateView(generics.ListCreateAPIView):
    authentication_classes= [CsrfExemptSessionAuthentication]
    queryset = Events.objects.all().order_by("-start_time")
    serializer_class = EventSerializer

    def get_permissions(self):
        if self.request.method in permissions.SAFE_METHODS:
            return [permissions.AllowAny()]
        return[
            permissions.IsAuthenticated(),
            IsEventManagerOrAdmin()
            ]
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class AlbumListCreateView(generics.ListCreateAPIView):
    authentication_classes= [CsrfExemptSessionAuthentication]
    queryset = Album.objects.all().order_by("-created_at")
    serializer_class = AlbumSerializer

    def get_permissions(self):
        if self.request.method in permissions.SAFE_METHODS:
            return [permissions.AllowAny()]
        return[
            permissions.IsAuthenticated(),
            IsPhotographerOrAdmin()
            ]
    
    def get_queryset(self):
        qs= super().get_queryset()
        event_id = self.request.query_params.get('event_id')
        if event_id is not None:
            qs = qs.filter(event_id=event_id)
        return qs
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class PhotoListCreateView(generics.ListCreateAPIView):
    authentication_classes= [CsrfExemptSessionAuthentication]
    queryset = Photo.objects.all().order_by("-uploaded_at")
    serializer_class = PhotoSerializer
    
    def get_queryset(self):
        qs = Photo.objects.all().order_by("-uploaded_at")
        event_id = self.request.query_params.get("event_id")
        album_id = self.request.query_params.get("album_id")
        search = self.request.query_params.get("search")   

        if event_id:
            qs = qs.filter(event_id=event_id)
        if album_id:
            qs = qs.filter(album_id=album_id)

        if search:
            qs = qs.filter(
                Q(photo_id__icontains=search) |
                Q(uploaded_by__person_name__icontains=search) |
                Q(tags__icontains=search)
            )
        return qs

    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)

class PhotoLikeView(APIView):
    authentication_classes = [CsrfExemptSessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, photo_id):
        photo = get_object_or_404(Photo, photo_id = photo_id)
        user = request.user

        with transaction.atomic():
            like, created = PhotoLike.objects.get_or_create(user_id=user, photo_id=photo)
            if not created:
                like.delete()
                liked= False
            else:
                liked= True
            photo.like_count = PhotoLike.objects.filter(photo_id=photo).count()
            photo.save(update_fields=["like_count"])
        return Response({"liked": liked}, status=status.HTTP_200_OK)

class PhotoCommentListCreateView(generics.ListCreateAPIView):
    authentication_classes= [CsrfExemptSessionAuthentication]
    queryset = Comments.objects.all().order_by("-created_at")
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        photo_id = self.kwargs['photo_id']
        return Comments.objects.filter(photo_id__photo_id=photo_id).order_by('-created_at')
    
    def perform_create(self, serializer):
        photo_id = self.kwargs['photo_id']
        photo = Photo.objects.get(photo_id=photo_id)
        serializer.save(photo_id=photo, user_id=self.request.user)

class DownloadPhoto(APIView):
    authentication_classes = [CsrfExemptSessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request, photo_id):
        photo = get_object_or_404(Photo, photo_id=photo_id)
        user = request.user
        variant = request.data.get("variant", "original")
        if variant == "compressed":
            file_field = photo.file_compressed or photo.file_original
        elif variant == "watermarked":
            file_field = photo.file_watermarked or photo.file_original
        else:
            file_field = photo.file_original
        
        Download.objects.create(
            photo_id=photo,
            user_id= user,
            variant=variant
        )    
        photo.download_count += 1
        photo.save(update_fields=["download_count"]) 
        response = FileResponse(
            open(file_field.path, "rb"),
            content_type="image/jpeg"
        )
        response["Content-Disposition"] = (f"attachment; filename={file_field.name}")
        return response
        

class AlbumPhotoManage(APIView):
    authentication_classes= [CsrfExemptSessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, album_id):
        album = get_object_or_404(Album, album_id=album_id)
        photos = album.photos.all()
        serializer = PhotoSerializer(photos, many=True, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def post(self, request, album_id):
        album = Album.objects.get(album_id=album_id)
        if album.created_by != request.user and not request.user.is_superuser:
            return Response({"message": "You are not authorized to perform this action"}, status=status.HTTP_403_FORBIDDEN)
        serializer = AlbumAddPhotoSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        photos = get_object_or_404(Photo, photo_id = serializer.validated_data['photo_id'])
        album.photos.add(photos)
        return Response({"message": "Photo added to album successfully"}, status=status.HTTP_200_OK)
    
    def delete(self, request, album_id):
        album = Album.objects.get(album_id=album_id)
        if album.created_by != request.user:
            return Response({"message": "You are not authorized to perform this action"}, status=status.HTTP_403_FORBIDDEN)
        serializer = AlbumAddPhotoSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        photos= get_object_or_404(Photo, photo_id = serializer.validated_data['photo_id'])
        album.photos.remove(photos)
        return Response({"message": "Photo removed from album successfully"}, status=status.HTTP_200_OK)
    
class CreatePersonTag(APIView):
    authentication_classes = [CsrfExemptSessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request):
        user_id = request.data.get("user_id")
        tag_type = request.data.get("type")
        object_id = request.data.get("object_id")

        if not (user_id and tag_type and object_id):
            return Response({"message": "Missing required fields"}, status=status.HTTP_400_BAD_REQUEST)
        tag_type = tag_type.strip().lower()
        
        from .permissions import user_has_role
        if not (user_has_role(request.user, "ADMIN") or user_has_role(request.user, "EVENT_MANAGER") or user_has_role(request.user, "PHOTOGRAPHER")):
            return Response({"message": "You are not authorized to perform this action"}, status=status.HTTP_403_FORBIDDEN)
        
        target_user = get_object_or_404(Person, user_id=user_id)
        tag_data = {
            "user_id": target_user,
            "tagged_by": request.user
        }
        
        if tag_type == "photo":
            photo = Photo.objects.get(photo_id=object_id)
            tag_data["photo_id"] = photo
            send_notification(
                user = target_user,
                message = f"You were tagged in a photo",
                notif_type="TAG_PHOTO",
                object_id=photo.photo_id
            )
        elif tag_type == "album":
            album = Album.objects.get(album_id=object_id)
            tag_data["album_id"] = album
            send_notification(
                user = target_user,
                message = f"You were tagged in a album",
                notif_type="TAG_ALBUM",
                object_id=album.album_id
            )
        elif tag_type == "event":
            event = Events.objects.get(event_id=object_id)
            tag_data["event_id"] = event
            send_notification(
                user = target_user,
                message = f"You were tagged in an event",
                notif_type="TAG_EVENT",
                object_id=event.event_id
            )
        else:
            return Response({"message": "Invalid type"}, status=status.HTTP_400_BAD_REQUEST)
        
        PersonTag.objects.create(**tag_data)
        return Response({"message": "Person tag created successfully"}, status=status.HTTP_200_OK)
    
    
    
class RoleChangeRequestCreate(generics.CreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    queryset = RoleChangeRequest.objects.all()
    serializer_class = RoleChangeRequestSerializer
    
    def perform_create(self, serializer):
        if not serializer.validated_data.get("target_role_id"):
            raise ValidationError("target_role_id is required")
        serializer.save(user_id=self.request.user, status="PENDING") 

class RoleChangeRequestList(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated,  IsAdmin]
    queryset = RoleChangeRequest.objects.all().order_by("-created_at")
    serializer_class = RoleChangeRequestSerializer


class RoleChangeRequestReview(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdmin]
    authentication_classes = [CsrfExemptSessionAuthentication]

    def post(self, request, role_request_id):
        action = request.data.get("status")
        action = action.strip().lower()
        if action not in ("reject", "approve"):
            return Response({"message": "Invalid action"}, status=status.HTTP_400_BAD_REQUEST)
        role_request = get_object_or_404(RoleChangeRequest, request_id=role_request_id)
        if action == "approve":
            with transaction.atomic():
                UserRole.objects.get_or_create(
                    user_id = role_request.user_id,
                    role_id = role_request.target_role_id,
                    event_id = role_request.event_id
                )
                role_request.approve(request.user)
            return Response({"message": "Role change request approved successfully"}, status=status.HTTP_200_OK)
        else:
            role_request.reject(request.user)
            return Response({"message": "Role change request rejected successfully"}, status=status.HTTP_200_OK)
        

class PhotoUpload(APIView):
    authentication_classes = [CsrfExemptSessionAuthentication]
    permission_classes = [permissions.IsAuthenticated, IsPhotographerOrAdmin]

    def post(self, request):
        uploaded_files = request.FILES.getlist('files') or request.FILES.getlist('file')
        print(uploaded_files)

        if not uploaded_files:
            return Response({"message": "No file uploaded"}, status=status.HTTP_400_BAD_REQUEST)
        
        event_id = request.data.get("event_id")
        taken_at = request.data.get("taken_at")

        event = Events.objects.filter(event_id = event_id).first() if event_id else None
        created_photos = []
        channel_layer = get_channel_layer()

        for f in uploaded_files:
            photo = Photo.objects.create(
                event_id = event,
                uploaded_by = request.user,
                file_original = f,
                taken_at = taken_at or None,
                status = "processing"
            )
            generate_variants(photo)
            try:
                extract_and_save_metadata(photo)
                tags = generate_tags(photo.file_original.path)
                photo.tags = tags
                photo.status = "ready"
            except Exception as e:
                photo.status = "processing"
            photo.save()  
            created_photos.append(photo) 

            if event: 
                notified_user_ids = set()
                if event.created_by and event.created_by != request.user.user_id:
                    notified_user_ids.add(event.created_by)

                roles = UserRole.objects.filter(event_id = event).values_list("user_id", flat=True)
                for r in roles:
                    if r != request.user.user_id:
                        notified_user_ids.add(r)

                tagged_users = PersonTag.objects.filter(event_id = event).values_list("user_id", flat=True)
                for t in tagged_users:
                    if t != request.user.user_id:
                        notified_user_ids.add(t)   

                for user in notified_user_ids:
                    send_notification(
                        user = user,
                        message = "New Photo uploaded in an Event",
                        notif_type="NEW_PHOTO",
                        object_id=photo.photo_id
                    ) 
        serializer = PhotoSerializer(created_photos, many=True, context={"request": request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)

def get_exif(img: Image.Image) -> dict:
    raw_exif = {}
    try:
        raw_exif = img._getexif() or {}
    except Exception:
        pass
    exif = {}
    for tag, value in raw_exif.items():
        decoded_tag = ExifTags.TAGS.get(tag, tag)
        exif[decoded_tag] = value
    return exif

def extract_and_save_metadata(photo: Photo):
    if not photo.file_original:
        raise Exception("Image not found")
    full_path = photo.file_original.path
    if not os.path.exists(full_path):
        raise Exception("Image not found")
    exif = Image.open(full_path)
    img = get_exif(exif)

    def _str(v):
        return str(v) if v is not None else None 
    
    camera_make = _str(img.get("Make"))
    camera_model = _str(img.get("Model"))
    aperture = _str(img.get("FNumber"))
    lens_model = None
    focal_length = _str(img.get("FocalLength"))
    exposure_time = _str(img.get("ExposureTime"))
    iso = _str(img.get("ISOSpeedRatings")) or _str(img.get("PhotometricInterpretation"))
    flash = _str(img.get("Flash"))
    width = str(exif.width)
    height = str(exif.height)
    gps_info = img.get("GPSInfo")
    gps_cords = None
    if gps_info:
        try:
            def _conv(coord):
                return coord[0] + coord[1] / 60 + coord[2] / 3600
            lat = _conv(gps_info[2])
            long = _conv(gps_info[4])
            gps_cords = f"{lat}, {long}"
        except Exception:
            pass

    meta_vals = {
        "camera_make": camera_make,
        "camera_model": camera_model,
        "lens_model": lens_model,
        "focal_length": focal_length,
        "aperture": aperture,
        "exposure_time": exposure_time,
        "iso": iso,
        "flash": flash,
        "gps_coordinates": gps_cords,
        "width": width,
        "height": height,
    }

    meta, created = PhotoMetaData.objects.update_or_create(
        photo_id = photo,
        defaults = meta_vals
    )
    photo.status = "done"
    photo.save(update_fields=["status"])
    return meta

class PhotoMetaDataExtractionView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [CsrfExemptSessionAuthentication]

    def get(self, request, photo_id):
        photo = get_object_or_404(Photo, photo_id=photo_id)
        if not hasattr(photo, "photo_metadata"):
            return Response(
                {"metadata" : None},
                status=status.HTTP_200_OK
            )
        from .serializers import PhotoMetaDataSerializer
        return Response({"metadata": PhotoMetaDataSerializer(photo.photo_metadata).data}, status=status.HTTP_200_OK)
    
    def post(self, request, photo_id):
        photo = get_object_or_404(Photo, photo_id=photo_id)
        if photo.uploaded_by != request.user and not request.user.is_superuser:
            return Response({"message": "You are not authorized to perform this action"}, status=status.HTTP_403_FORBIDDEN)
        try:
            extract_and_save_metadata(photo)
            from .serializers import PhotoMetaDataSerializer
            return Response({"message": "Metadata extracted successfully","metadata": PhotoMetaDataSerializer(photo.photo_metadata).data}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class MyFavourite(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self,request):
        likes = PhotoLike.objects.filter(user_id = request.user).select_related("photo_id").order_by("-created_at")
        photos = [like.photo_id for like in likes]
        serializer = PhotoSerializer(photos, many=True, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)
    
class MyTaggedView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        tags = PersonTag.objects.filter(user_id = request.user)
        photos = []
        albums = []
        events= []
        for tag in tags:
            if tag.photo_id:
                photos.append(tag.photo_id)
            elif tag.album_id:
                albums.append(tag.album_id)
            elif tag.event_id:
                events.append(tag.event_id)

        albums = list(set(albums))
        photos = list(set(photos))
        events = list(set(events))
        return Response({
            "photos": PhotoSerializer(photos, many=True).data,
            "albums": AlbumSerializer(albums, many=True).data,
            "events": EventSerializer(events, many=True).data
        }, status=status.HTTP_200_OK)
    
class MyAlbumView(APIView):
    permission_classes =  [permissions.IsAuthenticated]

    def get(self, request):
        albums = Album.objects.filter(created_by = request.user).order_by("-created_at")
        serializer = AlbumSerializer(albums, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    

class AdminAssignRole(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdmin]
    authentication_classes = [CsrfExemptSessionAuthentication]

    def post(self, request):
        print("DATA RECEIVED", request.data)
        user_id = request.data.get("user_id")
        role_name= request.data.get("role_name")
        event_id = request.data.get("event_id")
        if not user_id or not role_name :
            return Response({"message": "Missing required fields"}, status=status.HTTP_400_BAD_REQUEST)
        user = get_object_or_404(Person, user_id=user_id)
        role = get_object_or_404(Role, role_name = role_name)
        event = None
        if event_id :
            event = get_object_or_404(Events, event_id=event_id)
        UserRole.objects.update_or_create(user_id=user, event_id=event, defaults={"role_id": role})
        return Response({"message": "Role assigned successfully"}, status=status.HTTP_200_OK)

class PhotoSearch(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class= PhotoSerializer

    def get_queryset(self):
        qs = Photo.objects.all().order_by("-uploaded_at")
        q= self.request.query_params.get('q')
        event_id = self.request.query_params.get('event_id')
        album_id = self.request.query_params.get('album_id')
        photographer = self.request.query_params.get('photographer')
        date_from = self.request.query_params.get('date_from')
        date_to = self.request.query_params.get('date_to')

        if q:
            qs = qs.filter(
                Q(album_id__album_name__icontains=q) | Q(uploaded_by__person_name__icontains = q)
            )
        if event_id:
            qs= qs.filter(event_id__event_id = event_id)
        elif album_id:
            qs = qs.filter(album_id__album_id = album_id)
        elif photographer:
            qs = qs.filter(Q(uploaded_by__email_id__icontains = photographer) | Q(uploaded_by__person_name__icontains = photographer))
        elif date_to:
            qs = qs.filter(uploaded_at__lte = date_to)
        elif date_from:
            qs = qs.filter(uploaded_at__gte = date_from)
        return qs

class MeView(APIView):
    authentication_classes = [CsrfExemptSessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        return Response(MeSerializer(request.user).data)
    
    def put(self, request):
        user = request.user
        user.person_name = request.data.get("person_name", user.person_name)
        user.batch = request.data.get("batch", user.batch)
        user.department = request.data.get("department", user.department)
        user.short_bio = request.data.get("short_bio", user.short_bio)
        if "profile_picture" in request.FILES:
            user.profile_picture = request.FILES["profile_picture"]
        user.save()
        return Response({"message": "Profile updated successfully", "user": MeSerializer(user).data}, status=status.HTTP_200_OK)


class AdminPeople(APIView):
    permission_classes= [
        permissions.IsAuthenticated,
        IsAdmin] 
    def get(self, request): 
        events= Events.objects.all()
        response = []
        for event in events:
            user_roles = UserRole.objects.filter(event_id = event).select_related(
                "user_id", "role_id"
            )
            roles_data = [
                {
                    "user_id": ur.user_id.user_id,
                    "user_name": ur.user_id.person_name,
                    "role_name":ur.role_id.role_name
                }
                for ur in user_roles
            ]
            response.append({
                "event_id": event.event_id,
                "name": event.event_name,
                "roles": roles_data
            })
        return Response(response)

class PhotoBatchDelete(APIView):
    permission_classes= [permissions.IsAuthenticated, IsPhotographerOrAdmin]
    authentication_classes = [CsrfExemptSessionAuthentication]  

    def post(self, request):
        ids = request.data.get("ids", [])
        Photo.objects.filter(photo_id__in = ids).delete()
        return Response({"message": "Photos deleted successfully"}, status=status.HTTP_200_OK)
    
class AlbumBatchDelete(APIView):
    permission_classes= [permissions.IsAuthenticated, IsPhotographerOrAdmin]
    authentication_classes = [CsrfExemptSessionAuthentication]

    def post(self, request):
        ids = request.data.get("ids", [])
        Album.objects.filter(album_id__in = ids).delete()
        return Response({"message": "Albums deleted successfully"}, status=status.HTTP_200_OK)
    
class EventBatchDelete(APIView):
    permission_classes= [permissions.IsAuthenticated, IsPhotographerOrAdmin]
    authentication_classes = [CsrfExemptSessionAuthentication]

    def post(self, request):
        ids = request.data.get("ids", [])
        Events.objects.filter(event_id__in = ids).delete()
        return Response({"message": "Events deleted successfully"}, status=status.HTTP_200_OK)
    
class PeopleBatchDeactivate(APIView):
    permission_classes= [permissions.IsAuthenticated, IsAdmin]
    authentication_classes = [CsrfExemptSessionAuthentication]

    def post(self, request):
        ids = request.data.get("ids", [])
        Person.objects.filter(person_id__in = ids).update(is_active = False)
        return Response({"message": "People deactivated successfully"}, status=status.HTTP_200_OK)
    
class RoleListView(generics.ListAPIView):
    queryset= Role.objects.all()
    serializer_class = RoleSerializer


class AdminPeopleList(APIView):
    permission_classes= [permissions.IsAuthenticated, IsAdmin]

    def get(self, request):
        users = Person.objects.all().prefetch_related(
            "userrole_set__event_id", "userrole_set__role_id"
        )
        data = []
        for user in users:
            roles = [
                {
                    "role_name": ur.role_id.role_name,
                    "event_name": str(ur.event_id_id) if ur.event_id else None
                }
                for ur in user.userrole_set.all()
            ]

            data.append({
                "user_id": user.user_id,
                "person_name": user.person_name,
                "email_id": user.email_id,
                "roles": roles
            })

        return Response(data)
    

class MyNotifications(APIView):
    permission_classes= [permissions.IsAuthenticated]

    def get(self, request):
        qs= Notification.objects.filter(user = request.user).order_by("-created_at")
        serializer = NotificationSerializer(qs, many=True)
        return Response(serializer.data)
    
class MarkNotificationRead(APIView):
    permission_classes= [permissions.IsAuthenticated]

    def post(self, request, notification_id):
        notif= get_object_or_404(
            Notification, notification_id= notification_id, user= request.user
        )
        notif.is_read = True
        notif.save()
        return Response({"message": "Notification marked as read successfully"}, status=status.HTTP_200_OK)
    
class MyPhotoListView(ListAPIView):
    authentication_classes= [CsrfExemptSessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = PhotoSerializer

    def get_queryset(self):
        user = self.request.user
        qs_uploaded = Photo.objects.filter(uploaded_by = user)
        tagged_photo_ids = PersonTag.objects.filter(
            user_id = user,
            photo_id__isnull = False
        ).values_list("photo_id", flat=True)

        event_ids = PersonTag.objects.filter(
            user_id = user,
            event_id__isnull = False
        ).values_list("event_id", flat=True)

        role_event_ids = UserRole.objects.filter(
            user_id = user,
        ).values_list("event_id", flat=True)

        all_event_ids = set(event_ids) | set(role_event_ids)
        qs_events = Photo.objects.filter(event_id__in = all_event_ids)

        album_ids = PersonTag.objects.filter(
            user_id = user,
            album_id__isnull = False
        ).values_list("album_id", flat=True)

        qs_albums = Photo.objects.filter(albums__album_id__in = album_ids)
        qs = (qs_uploaded | Photo.objects.filter(photo_id__in = tagged_photo_ids) | qs_events | qs_albums)
        return qs.distinct().order_by("-uploaded_at")