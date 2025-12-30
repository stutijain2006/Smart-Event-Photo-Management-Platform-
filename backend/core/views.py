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
from .models import Person , EmailOTP, UserRole , OmniportAccount, Photo, Album, Events, PhotoLike , Comments, Download, PersonTag, RoleChangeRequest, PhotoMetaData, OAuthState
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
    AdminPeopleSerializer
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

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        user, created = Person.objects.get_or_create(
            email_id=serializer.validated_data['email_id'],
            defaults={
                'person_name': serializer.validated_data['person_name'],
                'is_active': True,
            }
        )
        if not created and user.is_email_verified:
            return Response({
                "message": "User already exists and is verified. Please Login.",
            }, status=status.HTTP_400_BAD_REQUEST)
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
        request.session['omniport_oauth_state'] = state
        request.session.modified = True
        authorize_url = get_omniport_authorize_url(state)
        return redirect(authorize_url)
    
class OmniportCallBackView(APIView):
    permission_classes = [permissions.AllowAny]
    def get(self, request):
        code = request.GET.get('code')
        state = request.GET.get('state')

        if not code or not state:
            return Response({'error': 'Missing code or state'}, status=status.HTTP_400_BAD_REQUEST)
        expected_state = request.session.get('omniport_oauth_state')
        if not expected_state or expected_state != state:
            return Response({'error': 'Invalid state'}, status=status.HTTP_400_BAD_REQUEST)
        del request.session['omniport_oauth_state']
        try:
            token_data = omniport_exchange_code_for_tokens(code)
        except Exception as e:
            return Response({'error': 'Failed to exchange code for tokens'}, status=status.HTTP_400_BAD_REQUEST)
        
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
        roles = [
            r.get("role")
            for r in person.get("roles", [])
            if r.get("activeStatus") == "ActiveStatus.IS_ACTIVE"
        ]
        department = (
            student.get("branch", {}).get("department", {}).get("name")
        )
        current_year = student.get("currentYear")
        email= contact_info.get("instituteWebmailAddress")
        email_verified = contact_info.get("emailAddressVerified", False)

        if not omniport_user_id or not email:
            return Response({"error": "Missing omniport_user_id or email_id"}, status=status.HTTP_400_BAD_REQUEST)
        
        user, created = Person.objects.get_or_create(omniport_user_id=omniport_user_id)
        user.username = username
        user.email_id = email
        user.is_email_verified = email_verified
        user.department = department
        user.current_year = current_year
        user.profile_picture = profile_photo
        user.person_name = full_name
        user.roles = roles
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

        login(request, user)
        return Response({"message": "User logged in successfully"}, status=status.HTTP_200_OK)
    

class EventListCreateView(generics.ListCreateAPIView):
    authentication_classes= [CsrfExemptSessionAuthentication]
    queryset = Events.objects.all().order_by("-start_time")
    serializer_class = EventSerializer

    def get_permissions(self):
        if self.request.method in permissions.SAFE_METHODS:
            return [permissions.AllowAny()]
        return[permissions.IsAuthenticated(), IsEventManagerOrAdmin()]
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class AlbumListCreateView(generics.ListCreateAPIView):
    queryset = Album.objects.all().order_by("-created_at")
    serializer_class = AlbumSerializer

    def get_permissions(self):
        if self.request.method in permissions.SAFE_METHODS:
            return permissions.AllowAny()
        return[permissions.IsAuthenticated(), IsPhotographerOrAdmin()]
    
    def get_queryset(self):
        qs= super().get_queryset()
        event_id = self.request.query_params.get('event_id')
        if event_id is not None:
            qs = qs.filter(event_id=event_id)
        return qs
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class PhotoListCreateView(generics.ListCreateAPIView):
    queryset = Photo.objects.all().order_by("-uploaded_at")
    serializer_class = PhotoSerializer

    def get_permissions(self):
        if self.request.method in permissions.SAFE_METHODS:
            return permissions.AllowAny()
        return[permissions.IsAuthenticated(), IsPhotographerOrAdmin()]
    
    def get_queryset(self):
        qs= super().get_queryset()
        event_id = self.request.query_params.get('event_id')
        album_id = self.request.query_params.get('album_id')
        if event_id is not None:
            qs = qs.filter(event_id=event_id)
        if album_id is not None:
            qs = qs.filter(album_id=album_id)
        return qs
    
    def perform_create(self, serializer):
        serializer.save(uploaded_by = self.request.user)

class PhotoCommentListCreateView(generics.ListCreateAPIView):
    queryset = Comments.objects.all().order_by("-created_at")
    serializer_class = CommentSerializer

    def get_permissions(self):
        if self.request.method in permissions.SAFE_METHODS:
            return permissions.AllowAny()
        return[permissions.IsAuthenticated(), IsNotUser()]
    
    def get_queryset(self):
        photo_id = self.kwargs('photo_id')
        return Comments.objects.filter(photo_id=photo_id).order_by('-created_at')
    
    def perform_create(self, serializer):
        photo_id = self.kwargs('photo_id')
        serializer.save(photo_id=photo_id, user_id=self.request.user)

class PhotoLikeView(APIView):
    permission_classes = [permissions.IsAuthenticated | IsNotUser]
    def post(self, request, photo_id):
        photo = Photo.objects.get(photo_id=photo_id)
        user = request.user
        existing = PhotoLike.objects.filter(photo_id=photo, user_id=user).first()

        if existing:
            existing.delete()
            photo.like_count = PhotoLike.objects.filter(photo_id=photo).count()
            photo.save(update_fields=["like_count"])
            return Response({"message": "Like removed successfully"}, status=status.HTTP_200_OK)
        else:
            like = PhotoLike.objects.create(photo_id=photo, user_id=user)
            photo.like_count = PhotoLike.objects.filter(photo_id=photo).count()
            photo.save(update_fields=["like_count"])
            serializer = PhotoLikeSerializer(like)
            return Response({"message": "Like added successfully"}, status=status.HTTP_200_OK)

class DownloadPhoto(APIView):
    permission_classes = [permissions.IsAuthenticated | IsNotUser]
    def post(self, request, photo_id):
        photo = Photo.objects.get(photo_id=photo_id)
        user = request.user
        variant = request.data.get("variant")
        if variant == "original":
            file_url = Photo.file_path_original
        elif variant == "watermarked":
            file_url = Photo.file_path_watermarked or Photo.file_path_original
        else:
            file_url = Photo.file_path_thumbnail or Photo.file_path_original

        download = Download.objects.create(photo_id=photo, user_id=user, variant=variant)
        photo.download_count = Download.objects.filter(photo_id=photo).count()
        photo.save(update_fields=["download_count"])
        serializer = DownloadSerializer(download)
        return Response(serializer.data, status=status.HTTP_200_OK)        
        
class AlbumPhotoManage(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request, album_id):
        album = Album.objects.get(album_id=album_id)
        if album.created_by != request.user and not request.user.is_superuser:
            return Response({"message": "You are not authorized to perform this action"}, status=status.HTTP_403_FORBIDDEN)
        serializer = AlbumAddPhotoSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        photo_id = serializer.validated_data['photo_id']
        photo = Photo.objects.get(photo_id=photo_id)
        album.photos.add(photo)
        return Response({"message": "Photo added to album successfully"}, status=status.HTTP_200_OK)
    
    def delete(self, request, album_id):
        album = Album.objects.get(album_id=album_id)
        if album.created_by != request.user:
            return Response({"message": "You are not authorized to perform this action"}, status=status.HTTP_403_FORBIDDEN)
        serializer = AlbumAddPhotoSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        photo_id = serializer.validated_data['photo_id']
        photo = Photo.objects.get(photo_id=photo_id)
        album.photos.remove(photo)
        return Response({"message": "Photo removed from album successfully"}, status=status.HTTP_200_OK)
    
class CreatePersonTag(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request):
        user_to_tag_id = request.data.get("user_id")
        typ = request.data.get("type")
        object_id = request.data.get("object_id")

        if not (user_to_tag_id and typ and object_id):
            return Response({"message": "Missing required fields"}, status=status.HTTP_400_BAD_REQUEST)
        typ = typ.strip().lower()
        
        from .permissions import user_has_role
        if not (user_has_role(request.user, "ADMIN") or user_has_role(request.user, "EVENT_MANAGER") or user_has_role(request.user, "PHOTOGRAPHER")):
            return Response({"message": "You are not authorized to perform this action"}, status=status.HTTP_403_FORBIDDEN)
        
        target_user = get_object_or_404(Person, user_id=user_to_tag_id)

        exists = PersonTag.objects.filter(user_id=target_user, 
                                          photo_id = photo if typ == "photo" else None,
                                          album_id = album if typ == "album" else None,
                                          event_id = event if typ == "event" else None
                                          ).exists()
        if exists:
            return Response({"message": "Person tag already exists"}, status=status.HTTP_400_BAD_REQUEST)
        
        if typ == "photo":
            photo = Photo.objects.get(photo_id=object_id)
            PersonTag.objects.create(user_id=target_user, photo_id=photo, album_id = None, event_id = None, tagged_by = request.user)
        elif typ == "album":
            album = Album.objects.get(album_id=object_id)
            PersonTag.objects.create(user_id=target_user, tagged_by = request.user, album_id=album, photo_id = None, event_id = None)
        elif typ == "event":
            event = Events.objects.get(event_id=object_id)
            PersonTag.objects.create(user_id=target_user, tagged_by = request.user, album_id = None, photo_id = None, event_id=event)
        else:
            return Response({"message": "Invalid type"}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({"message": "Person tag created successfully"}, status=status.HTTP_200_OK)
    
class RoleChangeRequestCreate(generics.CreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    queryset = RoleChangeRequest.objects.all()
    serializer_class = RoleChangeRequestSerializer
    
    def perform_create(self, sequelizer):
        sequelizer.save(user_id=self.request.user, status = "PENDING")

class RoleChangeRequestList(generics.ListAPIView):
    permission_classes = [permissions.IsAdminUser]
    queryset = RoleChangeRequest.objects.all().order_by("-created_at")
    serializer_class = RoleChangeRequestSerializer


class RoleChangeRequestReview(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, request_id):
        action = request.data.get("status")
        action = action.strip().lower()
        if action not in ("pending", "approve"):
            return Response({"message": "Invalid action"}, status=status.HTTP_400_BAD_REQUEST)
        role_request = get_object_or_404(RoleChangeRequest, request_id=request_id)
        if action == "approve":
            with transaction.atomic():
                UserRole.objects.get_or_create(
                    user_id = role_request.user_id,
                    role_id = role_request.target_role_id,
                    event_id = role_request.event_id
                )
                role_request.approve(role_request.user)
            return Response({"message": "Role change request approved successfully"}, status=status.HTTP_200_OK)
        else:
            role_request.reject(role_request.reviewed_by)
            return Response({"message": "Role change request rejected successfully"}, status=status.HTTP_200_OK)
        

class PhotoUpload(APIView):
    permission_classes = [permissions.IsAuthenticated, IsPhotographerOrAdmin]

    def post(self, request):
        uploaded_files = request.FILES.getlist('files') or request.FILES.getlist('file')
        if not uploaded_files:
            return Response({"message": "No file uploaded"}, status=status.HTTP_400_BAD_REQUEST)
        
        event_id = request.data.get("event_id")
        album_id = request.data.get("album_id")
        taken_at = request.data.get("taken_at")

        event = Events.object.filter(event_id = event_id).first() if event_id else None
        album = Album.object.filter(album_id = album_id).first() if album_id else None

        created_files = []
        for f in uploaded_files:
            filename = uploaded_files.name
            save_path = os.path.join("photos", f"{uuid.uuid4()}.{filename}")
            saved_path = default_storage.save(save_path, f)
       
        try:
            file_url = default_storage.url(saved_path)
        except FileNotFoundError:
            file_url = None

        photo = Photo.objects.create(
            event_id = Events.objects.get(event_id = event_id) if event_id else None,
            album_id = Album.objects.get(album_id = album_id) if album_id else None,
            uploaded_by = request.user,
            file_path_original = file_url,
            file_path_thumbnail = None,
            file_path_watermarked = None,
            taken_at = taken_at or None,
            status = "processing"
        )
        try:
            extract_and_save_metadata(photo)
        except Exception as e:
            photo.status = "processing"
            photo.save()      
        serializer = PhotoSerializer(photo)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

def get_exif(img: Image.Image) -> dict:
    raw_exif = {}
    try:
        raw_exif = img._getexif()
    except Exception:
        pass
    exif = {}
    for tag, value in raw_exif.items():
        decoded_tag = ExifTags.TAGS.get(tag, tag)
        exif[decoded_tag] = value
    return exif

def extract_and_save_metadata(photo: Photo):
    image_path = photo.file_path_original
    if not image_path:
        return
    img = get_exif(Image.open(image_path))
    camera_make = img.get("Make")
    camera_model = img.get("Model")
    aperture = img.get("FNumber")
    lens_model = None
    focal_length = img.get("FocalLength")
    exposure_time = img.get("ExposureTime")
    iso = img.get("ISOSpeedRatings") or img.get("PhotometricInterpretation")
    flash = img.get("Flash")
    width = img.get("ExifImageWidth")
    height = img.get("ExifImageHeight")
    gps_info = img.get("GPSInfo")
    gps_cords = None
    if gps_info:
        try:
            def _conv(coord):
                return coord[0] + coord[1] / 60 + coord[2] / 3600
            lat = _conv(gps_info[2])
            long = _conv(gps_info[4])
            gps_cords = (lat, long)
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

    def post(self, request, photo_id):
        photo = Photo.objects.get(photo_id=photo_id)
        if photo.uploaded_by or photo.uploaded_by != request.user and not request.user.is_superuser:
            return Response({"message": "You are not authorized to perform this action"}, status=status.HTTP_403_FORBIDDEN)
        try:
            extract_and_save_metadata(photo)
            from .serializers import PhotoSerializer
            return Response({"detail": "Metadata extracted successfully","photo": PhotoSerializer(photo).data}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class MyFavourite(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self,request):
        likes = PhotoLike.objects.filter(user_id = request.user).select_related("photo_id").order_by("-created_at")
        photos = [like.photo_id for like in likes]
        serializer = PhotoSerializer(photos, many=True)
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
                photos.append(tag.photo_id.photo_id)
            elif tag.album_id:
                albums.append(tag.album_id.album_id)
            elif tag.event_id:
                events.append(tag.event_id.event_id)
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
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]

    def post(self, request):
        user_id = request.data.get("user_id")
        role_id = request.data.get("role_id")
        event_id = request.data.get("event_id")
        if not user_id or not role_id or not event_id:
            return Response({"message": "Missing required fields"}, status=status.HTTP_400_BAD_REQUEST)
        UserRole.objects.get_or_create(user_id = user_id, role_id = role_id, event_id = event_id)
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
        user = request.user
        print("AUTH:", request.user, request.user.is_authenticated)
        roles = UserRole.objects.filter(user_id = user).select_related("role_id", "event_id")
        roles_data = [
            {
                "role_name": r.role_id.role_name,
                "event_name": str(r.event_id_id) if r.event_id else None
            }
            for r in roles
        ]
        return Response({"user_id": str(user.user_id),
                        "email_id" : user.email_id,
                        "person_name": user.person_name,
                        "roles": roles_data,
                        "short_bio" : user.short_bio,
                        "batch": user.batch,
                        "department": user.department,
                        "profile_picture": user.profile_picture,
                        "is_email_verified": user.is_email_verified
                        })
    
    def put(self, request):
        user = request.user
        user.person_name = request.data.get("person_name", user.person_name)
        user.batch = request.data.get("batch", user.batch)
        user.department = request.data.get("department", user.department)
        user.short_bio = request.data.get("short_bio", user.short_bio)
        user.profile_picture = request.data.get("profile_picture", user.profile_picture)
        user.save()
        return Response({"message": "Profile updated successfully"}, status=status.HTTP_200_OK)


class AdminPeople(APIView):
    permission_classes= [permissions.IsAuthenticated, IsAdmin] 
    def get(self, request): 
        people = Person.objects.all().order_by("person_name")
        serializer = AdminPeopleSerializer(people, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class PhotoBatchDelete(APIView):
    permission_classes= [permissions.IsAuthenticated, IsPhotographerOrAdmin]

    def post(self, request):
        ids = request.data.get("photo_ids", [])
        Photo.objects.filter(photo_id__in = ids).delete()
        return Response({"message": "Photos deleted successfully"}, status=status.HTTP_200_OK)
    
class AlbumBatchDelete(APIView):
    permission_classes= [permissions.IsAuthenticated, IsPhotographerOrAdmin]

    def post(self, request):
        ids = request.data.get("album_ids", [])
        Album.objects.filter(album_id__in = ids).delete()
        return Response({"message": "Albums deleted successfully"}, status=status.HTTP_200_OK)
    
class EventBatchDelete(APIView):
    permission_classes= [permissions.IsAuthenticated, IsPhotographerOrAdmin]

    def post(self, request):
        ids = request.data.get("event_ids", [])
        Events.objects.filter(event_id__in = ids).delete()
        return Response({"message": "Events deleted successfully"}, status=status.HTTP_200_OK)
    
class PeopleBatchDeactivate(APIView):
    permission_classes= [permissions.IsAuthenticated, IsAdmin]

    def post(self, request):
        ids = request.data.get("person_ids", [])
        Person.objects.filter(person_id__in = ids).update(is_active = False)
        return Response({"message": "People deactivated successfully"}, status=status.HTTP_200_OK)