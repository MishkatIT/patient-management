import os

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

import django

django.setup()

from decouple import config
from django.contrib.auth.hashers import make_password
from django.db import transaction
from patients.models import Patient

PATIENTS = [
    ("Ab.Kader", "MALE", 25, "O+", "01677307926"),
    ("Morshed Khan", "MALE", 29, "O+", "01674205677"),
    ("Jhorna", "FEMALE", 26, "B+", "01675216052"),
    ("Dhuku Miah", "MALE", 32, "B+", "01860280511"),
    ("Aklima", "FEMALE", 30, "AB+", "01912850072"),
    ("Aslam", "MALE", 29, "B+", "01854558127"),
    ("Kobir", "MALE", 33, "A+", "01984605450"),
    ("Kamruzzaman", "MALE", 35, "B+", "01925704524"),
    ("Munna", "MALE", 42, "O+", "01747497279"),
    ("Ashraful", "MALE", 38, "O+", "01910786529"),
]


def split_name(name):
    parts = name.split(maxsplit=1)
    return parts[0], parts[1] if len(parts) == 2 else ""


def run():
    password_hash = make_password(config("SEED_DEFAULT_PASSWORD", default="Patient123!"))
    created = updated = failed = 0
    for name, gender, age, blood_group, mobile in PATIENTS:
        first_name, last_name = split_name(name)
        profile = {
            "first_name": first_name,
            "last_name": last_name,
            "gender": gender,
            "age": age,
            "blood_group": blood_group,
            "address": "",
        }
        try:
            with transaction.atomic():
                _, was_created = Patient.objects.update_or_create(
                    mobile=mobile,
                    defaults=profile,
                    create_defaults={**profile, "password": password_hash},
                )
            if was_created:
                created += 1
            else:
                updated += 1
        except Exception as error:
            failed += 1
            print(f"Failed {mobile}: {error}")
    print(f"Created: {created} | Updated: {updated} | Failed: {failed}")


if __name__ == "__main__":
    run()
