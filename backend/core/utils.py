import random
import requests
from django.conf import settings
from PIL import Image
from django.core.files import File
import os
import numpy as np
from PIL import Image
import tensorflow as tf

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

    print(f"TOKEN URL: {token_url}")
    print(f"REDIRECT URI: {settings.OMNIPORT_REDIRECT_URI}")
    print(f"CLIENT ID: {settings.OMNIPORT_CLIENT_ID[:10]}..." if settings.OMNIPORT_CLIENT_ID else "CLIENT ID: None")
    
    response = requests.post(token_url, data=data)
    
    if not response.ok:
        print(f"TOKEN EXCHANGE FAILED - Status: {response.status_code}")
        print(f"Response: {response.text}")
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

def generate_variants(photo):
    original_path = photo.file_original.path
    base_dir = os.path.dirname(original_path)
    filename= os.path.splitext(os.path.basename(original_path))[0]
    
    compressed_dir = base_dir.replace("photos/original", "photos/compressed")
    os.makedirs(compressed_dir, exist_ok=True)
    compressed_path = os.path.join(compressed_dir, f"{filename}.jpg")

    with Image.open(original_path) as img:
        img.convert("RGB").save(
            compressed_path,
            format="JPEG",
            optimize=True,
            quality=40,
            progressive=True
        )
    photo.file_compressed.save(
        f"{filename}.jpg",
        File(open(compressed_path, "rb")),
        save=False
    )

    watermark_logo_path = os.path.join(settings.BASE_DIR, "static", "watermark.png")
    if not os.path.exists(watermark_logo_path):
        raise FileNotFoundError("Watermark not found")

    watermarked_dir = base_dir.replace("photos/original", "photos/watermarked")
    os.makedirs(watermarked_dir, exist_ok=True)
    watermarked_path = os.path.join(watermarked_dir, f"{filename}.jpg")

    with Image.open(original_path) as img:
        base = img.convert("RGBA").copy()
        with Image.open(watermark_logo_path).convert("RGBA") as watermark:
            watermark = watermark.resize(
                (int(base.width * 0.2), int(base.height * 0.2))
            )

            x = base.width - watermark.width - 20
            y = base.height - watermark.height - 20
            base.paste(watermark, (x, y), watermark)

            base.convert("RGB").save(watermarked_path, format="JPEG")

    photo.file_watermarked.save(
        f"{filename}.jpg",
        File(open(watermarked_path, "rb")),
        save=False
    )

    photo.save()

 
