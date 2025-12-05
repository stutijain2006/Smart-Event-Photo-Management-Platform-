from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings
import uuid

class Person (AbstractUser):
    user_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    username = None
    email_id = models.EmailField(unique=True)
    person_name = models.CharField(max_length=100)
    profile_pciture = models.ImageField(upload_to = "profiles/", null=True, blank=True)
    short_bio = models.TextField(max_length=300, blank=True)
    batch = models.CharField(max_length=10, blank=True)
    department = models.CharField(max_length=50, blank=True)

    USERNAME_FIELD = 'email_id'
    REQUIRED_FIELDS = ['person_name']

    def __str__(self):
        return self.person_name or self.email_id


class Role(models.Model):
    role_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    role_name = models.CharField(max_length=50, unique=True)
    description = models.TextField(max_length=300, blank=True)

    def __str__(self):
        return self.role_name
    
class Events(models.Model):
    event_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    event_name = models.CharField(max_length=100)
    event_description = models.TextField(max_length=500, blank=True)  
    event_date = models.DateField()
    location = models.CharField(max_length=200)
    start_time = models.TimeField()
    end_time = models.TimeField()
    created_by = models.ForeignKey("Person", on_delete=models.CASCADE, related_name= "events_created")
    event_url = models.URLField(max_length=200, blank=True)
    event_qr_code = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return self.event_name
    
class UserRole(models.Model):
    user_role_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user_id = models.ForeignKey("Person", on_delete=models.CASCADE)
    role_id= models.ForeignKey(Role, on_delete=models.CASCADE)
    event_id = models.ForeignKey("Events", on_delete=models.CASCADE, null=True, blank=True, related_name='event_role')

    class Meta:
        unique_together = ('user_id', 'role_id', 'event_id')

    def __str__(self):
        if self.event_id:
            return f"{self.user_id} - {self.role_id} @ {self.event_id}"
        return f"{self.user_id} - {self.role_id}"
    
class Album(models.Model):
    album_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    event_id = models.ForeignKey("Events", on_delete=models.CASCADE, null=True, blank=True)
    album_name = models.CharField(max_length=100)
    description = models.TextField(max_length=500, blank=True)
    created_by = models.ForeignKey("Person", on_delete=models.CASCADE, related_name= "albums_created")
    created_at = models.DateField(auto_now_add=True)

    def __str__(self):
        return self.album_name
    
class Photo(models.Model):
    photo_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    event_id= models.ForeignKey("Events", on_delete=models.CASCADE, null=True, blank=True)
    album_id = models.ForeignKey("Album", on_delete=models.CASCADE, null=True, blank=True)
    uploaded_by = models.ForeignKey("Person", on_delete=models.CASCADE, null=True, blank=True, related_name= "photos_uploaded")
    file_path_original = models.URLField(max_length=200)
    file_path_watermarked= models.URLField(max_length=200, null=True, blank=True)
    file_path_thumbnail= models.URLField(max_length=200, null=True, blank=True)
    uploaded_at = models.DateField(auto_now_add=True)
    taken_at= models.TimeField(null=True, blank=True)   
    status = models.CharField(max_length=50, default="pending")
    like_count = models.IntegerField(default=0)
    view_count = models.IntegerField(default=0)
    download_count = models.IntegerField(default=0) 

    def __str__(self):
        return f"Photo: {self.photo_id}-{self.event_id}"
    
class PhotoMetaData(models.Model):
    photo_metadata_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    photo_id = models.ForeignKey("Photo", on_delete=models.CASCADE, null=False, blank=False, unique=True)
    camera_make = models.CharField(max_length=50, null=True, blank=True)
    camera_model = models.CharField(max_length=50, null=True, blank=True)
    lens_model = models.CharField(max_length=50, null=True, blank=True)
    focal_length = models.CharField(max_length=50, null=True, blank=True)
    aperture = models.CharField(max_length=50, null=True, blank=True)
    exposure_time = models.CharField(max_length=50, null=True, blank=True)
    iso = models.CharField(max_length=50, null=True, blank=True)
    flash = models.CharField(max_length=50, null=True, blank=True)
    gps_coordinates = models.CharField(max_length=50, null=True, blank=True)
    width = models.CharField(max_length=50, null=True, blank=True)
    height = models.CharField(max_length=50, null=True, blank=True)

    def __str__(self):
        return f"PhotoMetaData: {self.photo_metadata_id}-{self.photo_id}"
    
class Download (models.Model):
    download_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    photo_id = models.ForeignKey("Photo", on_delete=models.CASCADE, null=False, blank=False, related_name="downloads")
    user_id = models.ForeignKey("Person", on_delete=models.CASCADE, null=False, blank=False, related_name="downloads")
    variant = models.CharField(max_length=50, null=True, blank=True, default="original")
    created_at = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"{self.photo_id} Downloaded as {self.variant}"
    
class PhotoLike(models.Model):
    like_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    photo_id = models.ForeignKey("Photo", on_delete=models.CASCADE, null=False, blank=False, related_name="likes")
    user_id = models.ForeignKey("Person", on_delete=models.CASCADE, null=False, blank=False, related_name="likes")
    created_at = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"{self.photo_id} Liked by {self.user_id}"

class Comments(models.Model):
    comment_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    photo_id = models.ForeignKey("Photo", on_delete=models.CASCADE, null=False, blank=False, related_name="comments")
    user_id = models.ForeignKey("Person", on_delete=models.CASCADE, null=False, blank=False, related_name="comments")
    description = models.TextField(max_length=500)
    created_at = models.DateField(auto_now_add=True)
    updated_at = models.DateField(auto_now=True)

    def __str__(self):
        return f"{self.photo_id} Commented by {self.user_id}"
    
class PersonTag(models.Model):
    person_tag_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    photo_id = models.ForeignKey("Photo", on_delete=models.CASCADE, null=False, blank=False, related_name="person_tags")
    user_id = models.ForeignKey("Person", on_delete=models.CASCADE, null=False, blank=False, related_name="person_tags")
    tagged_by = models.ForeignKey("Person", on_delete=models.CASCADE, null=False, blank=False)
    created_at = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"{self.photo_id} Tagged by {self.user_id}"