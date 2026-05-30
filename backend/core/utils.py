import os
import random
from io import BytesIO

import requests
from django.conf import settings
from django.core.files.base import ContentFile
from PIL import Image

from .storage_utils import open_image_from_field, save_bytes_to_image_field

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

def _image_stem(image_field) -> str:
    return os.path.splitext(os.path.basename(image_field.name))[0]


def generate_variants(photo):
    """Build compressed + watermarked copies and save via default storage (local or cloud)."""
    original = open_image_from_field(photo.file_original)
    stem = _image_stem(photo.file_original)

    compressed_buf = BytesIO()
    original.save(
        compressed_buf,
        format="JPEG",
        optimize=True,
        quality=40,
        subsampling=2,
    )
    save_bytes_to_image_field(
        photo.file_compressed,
        compressed_buf.getvalue(),
        f"{stem}.jpg",
        save=False,
    )

    watermark_logo_path = os.path.join(settings.BASE_DIR, "static", "watermark.png")
    if os.path.exists(watermark_logo_path):
        watermarked_buf = BytesIO()
        base = original.copy()
        if base.mode != "RGBA":
            base = base.convert("RGBA")
        with Image.open(watermark_logo_path).convert("RGBA") as watermark:
            watermark = watermark.resize(
                (int(base.width * 0.2), int(base.height * 0.2))
            )
            x = base.width - watermark.width - 20
            y = base.height - watermark.height - 20
            base.paste(watermark, (x, y), watermark)
            base.convert("RGB").save(watermarked_buf, format="JPEG")
        save_bytes_to_image_field(
            photo.file_watermarked,
            watermarked_buf.getvalue(),
            f"{stem}.jpg",
            save=False,
        )
    else:
        save_bytes_to_image_field(
            photo.file_watermarked,
            compressed_buf.getvalue(),
            f"{stem}.jpg",
            save=False,
        )

    photo.save()
