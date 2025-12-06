from django.contrib.auth.models import BaseUserManager

class PersonManager(BaseUserManager):
    def create_user(self, email_id,password=None, **extra_fields):
        if not email_id:
            raise ValueError("No Email Id")
        email_id = self.normalize_email(email_id)
        user = self.model(email_id=email_id, **extra_fields)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save(using = self._db)
        return user


    def create_superuser(self, email_id, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email_id, password, **extra_fields)