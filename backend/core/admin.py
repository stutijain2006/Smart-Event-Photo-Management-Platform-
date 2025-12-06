from django.contrib import admin

# Register your models here.
from .models import (
    Person, Role, Events, Photo, Album, PhotoLike, Comments, PersonTag, PhotoMetaData, Download, UserRole
)

admin.site.register(Person)
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