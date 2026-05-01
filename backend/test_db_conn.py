# test_db_connection.py
from sqlalchemy import create_engine, text
from app.config import settings

def test_connection():
    print(f"Testing connection to: {settings.DATABASE_URL}")
    
    try:
        engine = create_engine(settings.DATABASE_URL)
        with engine.connect() as conn:
            result = conn.execute(text("SELECT version()"))
            version = result.fetchone()[0]
            print(f"✅ Connected successfully!")
            print(f"PostgreSQL version: {version}")
        engine.dispose()
        return True
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        return False

if __name__ == "__main__":
    test_connection()