from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import Person , Events , Album , Photo , EmailOTP , PhotoLike , Comments, Download, PersonTag, RoleChangeRequest

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
        ]

class EventSerializer(serializers.ModelSerializer):
    created_by = serializers.ReadOnlyField(source="created_by.person_name")
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
    class Meta:
        model = Photo
        fields = [
            "photo_id",
            "event_id",
            "album_id",
            "uploaded_by",
            "file_path_original",
            "file_path_watermarked",
            "file_path_thumbnail",
            "uploaded_at",
            "taken_at",
            "status",
            "like_count",
            "view_count",
            "download_count",
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
    class Meta:
        model = RoleChangeRequest
        fields = [
            "request_id",
            "user_id",
            "target_role_id",
            "event_id",
            "reason",
            "status",
            "created_at"
        ]

class AlbumAddPhotoSerializer(serializers.ModelSerializer):
    photo_id = serializers.UUIDField()