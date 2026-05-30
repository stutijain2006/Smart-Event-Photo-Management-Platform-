"""Upload a small test file to the configured default storage (local or S3)."""

from django.conf import settings
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Verify file storage by writing and reading a test object."

    def handle(self, *args, **options):
        use_s3 = getattr(settings, "USE_S3", False)
        self.stdout.write(f"USE_S3={use_s3}")
        if use_s3:
            self.stdout.write(f"Bucket: {settings.AWS_STORAGE_BUCKET_NAME}")
            endpoint = getattr(settings, "AWS_S3_ENDPOINT_URL", None)
            if endpoint:
                self.stdout.write(f"Endpoint: {endpoint}")

        key = "healthchecks/storage-test.txt"
        body = b"cloud storage ok"

        if default_storage.exists(key):
            default_storage.delete(key)

        default_storage.save(key, ContentFile(body))
        if not default_storage.exists(key):
            self.stderr.write(self.style.ERROR("Upload failed: object not found after save."))
            return

        with default_storage.open(key, "rb") as f:
            read_back = f.read()

        default_storage.delete(key)

        if read_back != body:
            self.stderr.write(self.style.ERROR("Read back content did not match."))
            return

        self.stdout.write(self.style.SUCCESS("Cloud/local storage test passed."))
        if use_s3:
            self.stdout.write(
                "Upload a photo in the app and confirm the API returns https:// URLs for file_original."
            )
