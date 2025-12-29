import random
import requests
from django.conf import settings

def generate_otp() -> str:
    return f"{random.randint(100000, 999999)}"

def get_omniport_authorize_url(state: str) -> str:
    base = settings.OMNIPORT_BASE_URL.strip("/")
    return (
        f"{base}/oauth/authorise/?"
        f"client_id={settings.OMNIPORT_CLIENT_ID}"
        f"&redirect_uri={settings.OMNIPORT_REDIRECT_URI}"
        f"&response_type=code"
        f"&state={state}"
        )

def omniport_exchange_code_for_tokens(code: str) -> dict:
    base = settings.OMNIPORT_BASE_URL.strip("/")
    token_url = f"{base}/open_auth/token/"

    data = {
        "client_id": settings.OMNIPORT_CLIENT_ID,
        "client_secret": settings.OMNIPORT_CLIENT_SECRET,
        "grant_type": "authorization_code",
        "redirect_uri": settings.OMNIPORT_REDIRECT_URI,
        "code": code,
    }

    response = requests.post(token_url, data=data)
    response.raise_for_status()
    return response.json()

def omniport_user_data(access_token: str) -> dict:
    base = settings.OMNIPORT_BASE_URL.strip("/")
    user_data_url = f"{base}/open_auth/get_user_data/"

    headers = {
        "Authorization": f"Bearer {access_token}"
    }
    response = requests.get(user_data_url, headers=headers)
    response.raise_for_status()
    return response.json()

def omniport_revoke_token(token: str, token_type_hint : str = "access_token") -> dict:
    base = settings.OMNIPORT_BASE_URL.strip("/")
    token_url = f"{base}/open_auth/token/"

    data = {
        "client_id": settings.OMNIPORT_CLIENT_ID,
        "client_secret": settings.OMNIPORT_CLIENT_SECRET,
        "token": token,
        "token_type_hint": token_type_hint,
    }

    response = requests.post(token_url, data=data)
    response.raise_for_status()
    return response.json()
