from rest_framework import serializers
from django.contrib.auth import authenticate
from django.db.models import F
from .models import Person , Events , Album , Photo , EmailOTP , PhotoLike , Comments, Download, PersonTag, RoleChangeRequest, UserRole, PhotoMetaData, Role

class PersonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Person
        fields = [
            "user_id",
            "username",
            "email_id",
            "person_name",
            "profile_picture",
            "short_bio",
            "batch",
            "department",
            "is_email_verified",
            "roles"
        ]

    def get_profile_picture(self, obj):
        if obj.profile_picture:
            return obj.profile_picture.url
        return None
    
    def get_roles(self, obj):
        roles = UserRole.objects.filter(user_id = obj).select_related('role_id')
        return[
            {
                "role_name": ur.role_id.role_name,
                "event_id": ur.event_id_id
            }
            for ur in roles
        ]

class EventSerializer(serializers.ModelSerializer):
    created_by = serializers.ReadOnlyField(source="created_by.person_name")
    members = serializers.SerializerMethodField()
    class Meta:
        model = Events
        fields = [
            "event_id",
            "event_name",
            "event_description",
            "event_date",
            "location",
            "start_time",
            "end_time",
            "created_by",
            "event_url",
            "event_qr_code",
            "members" 
        ]
    
    def get_members(self, obj):
        user_roles = (
            UserRole.objects.filter(event_id = obj).select_related("user_id", "role_id")
        )
        return [
            {
                "user_id":ur.user_id.user_id,
                "user_name":ur.user_id.person_name,
                "role_name":ur.role_id.role_name
            }
            for ur in user_roles
        ]

class AlbumSerializer(serializers.ModelSerializer):
    created_by = serializers.ReadOnlyField(source="created_by.person_name")
    class Meta:
        model = Album
        fields = [
            "album_id",
            "event_id",
            "album_name",
            "description",
            "created_by",
            "created_at",
        ]

class PhotoSerializer(serializers.ModelSerializer):
    created_by = serializers.ReadOnlyField(source="created_by.person_name") 
    file_original = serializers.ImageField(read_only=True)
    file_watermarked = serializers.ImageField(read_only=True)
    file_compressed = serializers.ImageField(read_only=True)

    class Meta:
        model = Photo
        fields = [
            "photo_id",
            "event_id",
            "uploaded_by",
            "file_original",
            "file_watermarked",
            "file_compressed",
            "uploaded_at",
            "taken_at",
            "status",
            "like_count",
            "view_count",
            "download_count",
            "created_by"
        ]

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        required=True,
        min_length=8,
    )

    class Meta:
        model = Person
        fields = [
            "email_id",
            "person_name",
            "password"
        ]

    def create (self, validated_data):
        password = validated_data.pop("password")
        user= Person.objects.create(**validated_data)
        user.set_password(password)
        user.is_active = False
        user.is_email_verified = False
        user.save()
        return user
    
    def validate_email_id(self, value):
        existing = Person.objects.filter(email_id=value).first()
        if existing and existing.is_email_verified:
            raise serializers.ValidationError("Email is already registered and verified.")
        return value
 
class VerifyEmailSerializer(serializers.Serializer):
    model = EmailOTP
    email_id = serializers.EmailField()
    otp = serializers.CharField(max_length=6)

class LoginSerializer(serializers.Serializer):
    email_id = serializers.EmailField()
    password = serializers.CharField()

    def validate(self, data):
        email_id = data.get("email_id")
        password = data.get("password")

        user = authenticate(email_id=email_id, password=password)
        if not user:
            raise serializers.ValidationError("Invalid credentials")
        if not user.is_email_verified:
            raise serializers.ValidationError("Email is not verified")
        if not user.is_active:
            raise serializers.ValidationError("User is not active")

        data["user"] = user
        return data

class PhotoLikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = PhotoLike
        fields = [
            "like_id",
            "photo_id",
            "user_id",
            "created_at"
        ]

class CommentSerializer(serializers.ModelSerializer):
    user_name = serializers.ReadOnlyField(source="user_id.person_name")
    class Meta:
        model = Comments
        fields = [
            "comment_id",
            "photo_id",
            "user_id",
            "user_name",
            "description",
            "created_at",
            "updated_at"
        ]
        read_only_fields = [
            "comment_id",
            "photo_id",
            "user_id",
            "created_at",
            "updated_at"
        ]

class DownloadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Download
        fields = [
            "download_id",
            "photo_id",
            "user_id",
            "variant",
            "created_at"
        ]

class PhotoMetaDataSerializer(serializers.ModelSerializer):
    class Meta:
        model= PhotoMetaData
        exclude = ["photo_id"]

class PersonTagSerializer(serializers.ModelSerializer):
    class Meta:
        model = PersonTag
        fields =[
            "person_tag_id",
            "photo_id",
            "user_id",
            "tagged_by",
            "created_at"
        ]

class RoleChangeRequestSerializer(serializers.ModelSerializer):
    user_name= serializers.CharField(source = "user_id.person_name", read_only = True)
    email= serializers.EmailField(source = "user_id.email_id", read_only = True)
    event_name = serializers.CharField(source="event_id.event_name", read_only = True)
    target_role_name = serializers.CharField(source = "target_role_id.role_name", read_only = True)
    class Meta:
        model = RoleChangeRequest
        fields = [
            "request_id",
            "user_id",
            "user_name",
            "email",
            "event_name",
            "target_role_id",
            "target_role_name",
            "event_id",
            "reason",
            "status",
            "created_at"
        ]
        read_only_fields = [
            "request_id",
            "user_id",
            "status",
            "created_at"
        ]

class AlbumAddPhotoSerializer(serializers.Serializer):
    photo_id = serializers.UUIDField()

class AdminPeopleSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source="person_name")
    email_id = serializers.EmailField()
    roles = serializers.SerializerMethodField()

    class Meta:
        model = Person
        fields = [
            "user_id",
            "name",
            "email_id",
            "roles"
        ]
    
    def get_roles(self, obj):
        return list(
            obj.userrole_set.select_related("role_id").values_list("role_id__role_name", flat = True)
        )
    
class MeSerializer(serializers.ModelSerializer):
    profile_picture = serializers.SerializerMethodField()
    roles = serializers.SerializerMethodField()
    class Meta:
        model = Person
        fields = [
            "user_id",
            "email_id",
            "person_name",
            "short_bio",
            "profile_picture",
            "batch",
            "roles",
            "department",
            "is_email_verified"
        ]

    def get_profile_picture(self, obj):
        if obj.profile_picture:
            return obj.profile_picture.url
        return None
    
    def get_roles(self, obj):
        roles = UserRole.objects.filter(user_id = obj)
        return [
            {
                "role_name": r.role_id.role_name,
                "event_name": str(r.event_id_id) if r.event_id else None
            }
            for r in roles
        ]

class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = [
            "role_id",
            "role_name"
        ]