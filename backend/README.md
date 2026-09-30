# Backend

## Prerequisites

Python 3.11+ and PostgreSQL with `pip` available.

## Setup

From the repository root:

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

macOS/Linux activation: `source venv/bin/activate`.

Create the database and user with PostgreSQL, then copy `.env.example` to `.env` and set `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`, `SECRET_KEY`, `DEBUG`, `ALLOWED_HOSTS`, and `CORS_ALLOWED_ORIGINS`. `SEED_DEFAULT_PASSWORD` controls the password assigned to newly seeded patients.

```sql
CREATE USER patient_admin WITH PASSWORD 'change-me';
CREATE DATABASE patient_management OWNER patient_admin;
```

Run migrations and create an admin account:

```powershell
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

The API is available at `http://localhost:8000/api/`. The custom user logs in with a mobile number.

## Seed data

```powershell
python seed_patients.py
```

The script is idempotent and uses mobile as its unique key. It splits names on the first space and only applies the configured password when creating a patient; visit totals and passwords on existing records are preserved. The default seed password is `Patient123!` unless `SEED_DEFAULT_PASSWORD` is set.

## Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/login/` | Obtain access and refresh JWTs |
| POST | `/api/auth/token/refresh/` | Refresh an access token |
| GET/POST | `/api/patients/` | Paginated list and create |
| GET/PATCH/PUT/DELETE | `/api/patients/<id>/` | Patient detail operations |
| POST | `/api/patient-visits/` | Create a visit and update counters |

Patient CRUD is intentionally open for this assessment. Visits use a transaction, lock the patient, increment `total_visits`, and retain the latest visit date. Future dates are rejected, deleting a patient cascades to visits, and staff users are hidden from the patient list.

## Tests

```powershell
python manage.py test
```

## Troubleshooting

- Connection refused or authentication failure: check PostgreSQL is running and the DB values in `.env`.
- `psycopg` installation problems: update pip or use a supported Python version.
- `relation does not exist`: run `python manage.py migrate`.
- Custom user migration conflicts: recreate the database before the first migration.
