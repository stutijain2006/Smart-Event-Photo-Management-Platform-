from rest_framework.permissions import BasePermission , SAFE_METHODS
from django.db.models import Q
from .models import UserRole

ROLE_ADMIN = "ADMIN"
ROLE_EVENT_MANAGER = "EVENT_MANAGER"
ROLE_PHOTOGRAPHER = "PHOTOGRAPHER" 
ROLE_USER = "USER"
ROLE_IMG_MEMBER = "IMG_MEMBER"

def user_has_role(user, role_name : str , event = None) -> bool:
    if not user or not user.is_authenticated:
        return False
    if user.is_superuser:
        return True
    qs = UserRole.objects.filter(user_id = user, role_id__role_name = role_name)
    if event:
        qs = qs.filter(event_id = event)
    return qs.exists()

def is_admin(user) -> bool:
    return(
        user.is_superuser or 
        user_has_role(user, ROLE_ADMIN)
    )

class IsEventManagerOrAdmin(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        user = request.user
        return user.is_authenticated and (
            is_admin(user) or 
            user_has_role(user, ROLE_EVENT_MANAGER)
        )
    
class IsPhotographerOrAdmin(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        user = request.user
        return user.is_authenticated and (
            is_admin(user) or 
            user_has_role(user, ROLE_PHOTOGRAPHER)
        )
    
class IsNotUser(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        user = request.user
        return user.is_authenticated and (
            not user_has_role(user, ROLE_USER)
        )
    
class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        if request.user.is_superuser:
            return True

        if request.method in SAFE_METHODS:
            return True

        return user_has_role(request.user, ROLE_ADMIN)  
    