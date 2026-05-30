"""Helpers for reading/writing images with local or S3-compatible cloud storage."""

from io import BytesIO

from django.core.files.base import ContentFile
from PIL import Image


def open_image_from_field(image_field) -> Image.Image:
    """Open a Django ImageField/FileField as a PIL Image (works with local disk or S3)."""
    with image_field.open("rb") as f:
        return Image.open(f).convert("RGB")


def save_bytes_to_image_field(image_field, data: bytes, name: str, *, save: bool = True) -> None:
    image_field.save(name, ContentFile(data), save=save)
