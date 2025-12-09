from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

# Register your models here.
from .models import (
    Person, Role, Events, Photo, Album, PhotoLike, Comments, PersonTag, PhotoMetaData, Download, UserRole, EmailOTP, OmniportAccount
)

admin.site.register(Role)
admin.site.register(Events)
admin.site.register(Photo)
admin.site.register(Album)
admin.site.register(PhotoLike)
admin.site.register(Comments)
admin.site.register(PersonTag)
admin.site.register(PhotoMetaData)
admin.site.register(Download)
admin.site.register(UserRole)
admin.site.register(OmniportAccount)
admin.site.register(EmailOTP)

class PersonAdmin(UserAdmin):
    model = Person
    list_display= ("email_id", "person_name", "is_email_verified", "is_staff","is_superuser")
    list_filter = ("is_email_verified", "is_staff","is_superuser")
    search_fields = ("email_id", "person_name")
    ordering = ("email_id",)

    fieldsets = (
        (None, {"fields": ("email_id", "password")}),
        ("Personal info", {"fields": ("person_name","profile_picture", "short_bio", "batch", "department",)}),
        ("Permissions", {"fields":("is_active","is_staff","is_superuser", "is_email_verified","groups", "user_permissions",)}),
        ("Important dates", {"fields": ("last_login", "date_joined")})
    )
    add_fieldsets =(
        (None, {
            "classes": ("wide",),
            "fields": ("email_id","person_name", "password1", "password2", "is_staff", "is_superuser")
        },),
    )

admin.site.register(Person, PersonAdmin)

class RoleAdmin(admin.ModelAdmin):
    list_display = ("role_name", "role_description")
    search_fields = ("role_name")

class UserRoleAdmin(admin.ModelAdmin):
    list_display = ("user_id", "role_id", "event_id")
    list_filter = ("role_id", "event_id")
    search_fields = ("user_id__email_id", "user_id__person_name")

class EventsAdmin(admin.ModelAdmin):
    list_display= ("event_id", "event_name","event_date", "location", "created_by")
    list_filter = ("event_date")
    search_filter = ("event_name", "location")

class AlbumAdmin(admin.ModelAdmin):
    list_display = ("album_name", "event_id","created_at", "created_by")
    list_filter = ("event_id","created_at")
    search_fields = ("album_name")

class PhotoAdmin(admin.ModelAdmin):
    list_display = ("photo_id","event_id" ,"album_id", "uploaded_at","uploaded_by", "status")
    list_filter = ("album_id", "event_id", "status")
    search_fields = ("photo_id", "uploaded_by__person_name")

class PhotoMetaDataAdmin(admin.ModelAdmin):
    list_display = ("photo_id","camera_make","camera_model", "iso","focal_length", "width", "height", "size")

class DownloadAdmin(admin.ModelAdmin):
    list_display = ("photo_id", "variant", "user_id", "created_at")
    list_filter = ("variant", "created_at")

class PhotoLikeAdmin(admin.ModelAdmin):
    list_display = ("photo_id", "user_id", "created_at")

class CommentsAdmin(admin.ModelAdmin):
    list_display=("photo_id", "user_id", "created_at", "updated_at")
    search_fields =("description")

class PersonTagAdmin(admin.ModelAdmin):
    list_display = ("person_tag_id", "user_id","tagged_by", "created_at")
    search_fields = ('photo_id', 'user_id__person_name')

class EmailOTPAdmin(admin.ModelAdmin):
    list_display = ("email_id", "otp", "created_at", "is_used")
    list_filter = ("email_id", "is_used", "created_at")
    search_fields = ("email_id", "otp")

class OmniportAccountAdmin(admin.ModelAdmin):
    list_display = ("person_id", "omniport_user_id", "created_at")
    search_fields = ("person_id__email_id", "omniport_user_id")