import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.config import settings
from app.models import Customer
import uuid

# Sample data
customers_data = [
    {'customer_name': 'AT&T', 'industry': 'Telecommunications', 'phone': '+1-800-331-0500', 
     'email': 'support@att.com', 'location': 'Dallas, Texas', 'status': 'ACTIVE', 'created_by': 'SEED'},
    {'customer_name': 'Accenture', 'industry': 'IT Services', 'phone': '+1-877-889-9009', 
     'email': 'contact@accenture.com', 'location': 'Dublin, Ireland', 'status': 'ACTIVE', 'created_by': 'SEED'},
    {'customer_name': 'Collabera', 'industry': 'IT Services', 'phone': '+1-877-264-6424', 
     'email': 'info@collabera.com', 'location': 'New Jersey', 'status': 'ACTIVE', 'created_by': 'SEED'},
    {'customer_name': 'T-Mobile', 'industry': 'Telecommunications', 'phone': '+1-800-937-8997', 
     'email': 'support@t-mobile.com', 'location': 'Washington', 'status': 'ACTIVE', 'created_by': 'SEED'},
    {'customer_name': 'Best Buy', 'industry': 'Retail', 'phone': '+1-888-237-8289', 
     'email': 'support@bestbuy.com', 'location': 'Minnesota', 'status': 'ACTIVE', 'created_by': 'SEED'},
]

def seed():
    print('🌱 Seeding database...')
    print(f'📡 Database URL: {settings.DATABASE_URL}')
    
    engine = create_engine(settings.DATABASE_URL, echo=True)
    Session = sessionmaker(bind=engine)
    db = Session()
    
    try:
        # Check existing count
        existing_count = db.query(Customer).count()
        print(f'📊 Existing customers: {existing_count}')
        
        # Clear existing data
        deleted = db.query(Customer).delete()
        print(f'🗑️  Deleted {deleted} existing customers')
        db.commit()
        
        # Add new customers with explicit UUIDs
        for data in customers_data:
            customer = Customer(
                customer_id=uuid.uuid4(),
                customer_name=data['customer_name'],
                industry=data['industry'],
                phone=data['phone'],
                email=data['email'],
                location=data['location'],
                status=data['status'],
                created_by=data['created_by']
            )
            db.add(customer)
            print(f'  ➕ Added: {data["customer_name"]} (ID: {customer.customer_id})')
        
        # Commit the transaction
        db.commit()
        print('💾 Committed to database')
        
        # Verify the data was saved
        new_count = db.query(Customer).count()
        print(f'📊 New customer count: {new_count}')
        
        # Display the customers
        customers = db.query(Customer).all()
        print('\n📋 Customers in database:')
        for c in customers:
            print(f'  - {c.customer_name}: {c.customer_id} ({c.status})')
        
        print(f'\n✅ Seeded {len(customers_data)} customers successfully!')
        
    except Exception as e:
        print(f'❌ Error: {e}')
        db.rollback()
        import traceback
        traceback.print_exc()
    finally:
        db.close()
        engine.dispose()

if __name__ == '__main__':
    seed()