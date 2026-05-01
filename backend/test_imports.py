# test_imports.py
import fastapi
import uvicorn
import sqlalchemy
import psycopg2
import alembic
from pydantic_settings import BaseSettings

print("All imports successful!")
print(f"FastAPI version: {fastapi.__version__}")
print(f"SQLAlchemy version: {sqlalchemy.__version__}")