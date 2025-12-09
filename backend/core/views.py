import uuid
from django.contrib.auth import login , logout
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import Person , EmailOTP , OmniportAccount
from .serializers import (
    RegisterSerializer,
    LoginSerializer,
    VerifyEmailSerializer,
    PersonSerializer
)
from .utils import (
    generate_otp,
    get_omniport_authorize_url,
    omniport_exchange_code_for_tokens,
    omniport_user_data,
    omniport_revoke_token
)

class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        user = serializer.save()
        otp = generate_otp()
        EmailOTP.objects.create(user=user, otp=otp)
        return Response({'otp': otp}, {"message": "User created successfully"}, status=status.HTTP_201_CREATED)
    
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
    permissions_classes = [permissions.AllowAny]
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        user = serializer.validated_data['user']
        login(request, user)
        return Response({"message": "User logged in successfully"}, status=status.HTTP_200_OK)
    
class LogOut(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request):
        logout(request)
        return Response ({"message": "User logged out successfully"}, status=status.HTTP_200_OK)
    
class OmniportLoginURLView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        state = uuid.uuid4().hex
        request.session['state'] = state
        authorize_url = get_omniport_authorize_url(state)
        return Response({'authorize_url': authorize_url}, status=status.HTTP_200_OK)
    
class OmniportCallBackView(APIView):
    permission_classes = [permissions.AllowAny]
    def get(self, request):
        code = request.GET.get('code')
        state = request.GET.get('state')

        if not code or not state:
            return Response({'error': 'Missing code or state'}, status=status.HTTP_400_BAD_REQUEST)
        expected_state = request.session.get('omniport_state')
        if not expected_state or expected_state != state:
            return Response({'error': 'Invalid state'}, status=status.HTTP_400_BAD_REQUEST)

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
        person = user_data.get("person" or {}) or {}
        contact_info = user_data.get("contactInformation" or {}) or {}
        full_name = person.get("name" or {}) or {}
        email_id = contact_info.get("email" or {}) or {}

        if not omniport_user_id or not email_id:
            return Response({"error": "Missing omniport_user_id or email_id"}, status=status.HTTP_400_BAD_REQUEST)
        
        user, created = Person.objects.get_or_create(omniport_user_id=omniport_user_id)
        user.email_id = email_id
        user.person_name = full_name
        user.is_active = True
        user.is_email_verified = True
        user.save()
        
        omniport_account, acc_created = OmniportAccount.objects.get_or_create(person_id=user, omniport_user_id=omniport_user_id)
        omniport_account.access_token = access_token
        omniport_account.refresh_token = refresh_token
        omniport_account.save()

        if not acc_created:
            omniport_account.person_id = user
            omniport_account.omniport_user_id = omniport_user_id
            omniport_account.access_token = access_token
            omniport_account.refresh_token = refresh_token
            omniport_account.save()

        login(request, user)
        return Response({"message": "User logged in successfully"}, status=status.HTTP_200_OK)