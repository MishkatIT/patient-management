from django.contrib.auth.base_user import BaseUserManager


class PatientManager(BaseUserManager):
    use_in_migrations = True

    def create_user(self, mobile, password=None, **extra_fields):
        if not mobile:
            raise ValueError("The mobile number is required.")
        patient = self.model(mobile=mobile, **extra_fields)
        patient.set_password(password)
        patient.save(using=self._db)
        return patient

    def create_superuser(self, mobile, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_active", True)
        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")
        return self.create_user(mobile, password, **extra_fields)
