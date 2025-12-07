from django.urls import path
from .views import (
    RegisterView,
    VerifyEmail,
    LoginView,
    LogOut,
    OmniportLoginURLView,
    OmniportCallBackView
)

urlpatterns =[
    path("auth/register", RegisterView.as_view(), name="register"),
    path("auth/login", LoginView.as_view(), name="login"),
    path("auth/logout", LogOut.as_view(), name="logout"),
    path("auth/verify-email", VerifyEmail.as_view(), name="verify-email"),
    path("auth/omniport-login-url", OmniportLoginURLView.as_view(), name="omniport-login-url"),
    path("auth/omniport-callback", OmniportCallBackView.as_view(), name="omniport-callback"),
]