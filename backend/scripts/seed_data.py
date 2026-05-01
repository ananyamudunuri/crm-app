# backend/scripts/seed_data.py (updated version)
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.config import settings
from app.models import Customer, Affiliation, CustomerNote

# Sample customers data
SAMPLE_CUSTOMERS = [
    {"customer_name": "AT&T", "industry": "Telecommunications", "phone": "+1-800-331-0500", 
     "email": "support@att.com", "location": "Dallas, Texas, USA", "status": "ACTIVE"},
    {"customer_name": "Accenture", "industry": "IT Services and Consulting", 
     "phone": "+1-877-889-9009", "email": "contact@accenture.com", "location": "Dublin, Ireland", 
     "status": "ACTIVE"},
    {"customer_name": "Collabera", "industry": "Information Technology & Services", 
     "phone": "+18772646424", "email": "info@collabera.com", 
     "location": "Basking Ridge, NJ, USA", "status": "ACTIVE"},
    {"customer_name": "T-Mobile", "industry": "Telecommunications", "phone": "+1-800-937-8997", 
     "email": "customercare@t-mobile.com", "location": "Bellevue, Washington, USA", "status": "ACTIVE"},
    {"customer_name": "Ascendion", "industry": "IT Services and IT Consulting", 
     "phone": "+1-650-555-0123", "email": "info@ascendion.com", "location": "New York, NY, USA", 
     "status": "ACTIVE"},
    {"customer_name": "Best Buy", "industry": "Retail", "phone": "+1-888-237-8289", 
     "email": "support@bestbuy.com", "location": "Richfield, Minnesota, USA", "status": "ACTIVE"},
    {"customer_name": "TechLadder Corporation", "industry": "IT Services", 
     "phone": "+1-408-555-0123", "email": "contact@techladder.com", "location": "San Jose, CA, USA", 
     "status": "ACTIVE"},
    {"customer_name": "Skilzmatrix Digital LLC", "industry": "Digital Transformation", 
     "phone": "+1-512-555-0456", "email": "info@skilzmatrix.com", "location": "Austin, TX, USA", 
     "status": "ACTIVE"},
    {"customer_name": "Brevitii", "industry": "IT Consulting", "phone": "+1-312-555-0789", 
     "email": "info@brevitii.com", "location": "Chicago, IL, USA", "status": "ACTIVE"},
    {"customer_name": "TCS", "industry": "IT Services", "phone": "+1-732-555-0123", 
     "email": "contact@tcs.com", "location": "Mumbai, India", "status": "ACTIVE"},
]

SAMPLE_AFFILIATIONS = [
    ("TechLadder Corporation", "Skilzmatrix Digital LLC", "AFFILIATE", "Strategic partnership"),
    ("Brevitii", "Collabera", "PARTNER", "Joint venture for cloud solutions"),
    ("Accenture", "Collabera", "VENDOR", "Staff augmentation"),
    ("AT&T", "Accenture", "VENDOR", "Digital transformation"),
    ("T-Mobile", "Accenture", "VENDOR", "Customer experience"),
    ("Best Buy", "Accenture", "VENDOR", "E-commerce platform"),
]

SAMPLE_NOTES = [
    ("Accenture", "Initial meeting with account team.", "SYSTEM", "MEETING"),
    ("Collabera", "Sent proposal for managed services.", "SYSTEM", "FOLLOW_UP"),
    ("T-Mobile", "Project kickoff scheduled.", "SYSTEM", "MEETING"),
    ("AT&T", "Quarterly business review completed.", "SYSTEM", "IMPORTANT"),
]

def seed_database():
    print("\n🌱 Starting database seeding...")
    
    engine = create_engine(settings.DATABASE_URL)
    SessionLocal = sessionmaker(bind=engine)
    db = SessionLocal()
    
    try:
        # Disable autoflush to avoid the issue
        db.autoflush = False
        
        # Create customers
        customer_objects = {}
        print("\n📝 Creating customers...")
        
        for customer_data in SAMPLE_CUSTOMERS:
            existing = db.query(Customer).filter(
                Customer.customer_name == customer_data["customer_name"]
            ).first()
            
            if existing:
                customer_objects[customer_data["customer_name"]] = existing
                print(f"  ⚠️ Customer '{customer_data['customer_name']}' already exists")
            else:
                customer = Customer(**customer_data, created_by="SYSTEM")
                db.add(customer)
                customer_objects[customer_data["customer_name"]] = customer
                print(f"  ✅ Created customer: {customer.customer_name}")
        
        # Flush customers to get IDs without committing
        db.flush()
        print(f"\n✅ Total customers: {len(customer_objects)}")
        
        # Create affiliations
        print("\n🔗 Creating affiliations...")
        affiliation_count = 0
        
        for parent_name, affiliate_name, rel_type, notes in SAMPLE_AFFILIATIONS:
            if parent_name not in customer_objects or affiliate_name not in customer_objects:
                print(f"  ⚠️ Skipping {parent_name} -> {affiliate_name}: customer not found")
                continue
            
            existing = db.query(Affiliation).filter(
                Affiliation.parent_customer_id == customer_objects[parent_name].customer_id,
                Affiliation.affiliate_customer_id == customer_objects[affiliate_name].customer_id
            ).first()
            
            if existing:
                print(f"  ⚠️ Affiliation already exists: {parent_name} -> {affiliate_name}")
                continue
            
            affiliation = Affiliation(
                parent_customer_id=customer_objects[parent_name].customer_id,
                affiliate_customer_id=customer_objects[affiliate_name].customer_id,
                relationship_type=rel_type,
                notes=notes,
                created_by="SYSTEM"
            )
            db.add(affiliation)
            affiliation_count += 1
            print(f"  🔗 Created: {parent_name} -> {affiliate_name}")
        
        # Create notes
        print("\n📝 Creating notes...")
        note_count = 0
        
        for customer_name, note_text, created_by, note_type in SAMPLE_NOTES:
            if customer_name not in customer_objects:
                print(f"  ⚠️ Skipping note for {customer_name}: customer not found")
                continue
            
            note = CustomerNote(
                customer_id=customer_objects[customer_name].customer_id,
                note_text=note_text,
                note_type=note_type,
                created_by=created_by
            )
            db.add(note)
            note_count += 1
            print(f"  📝 Added note for {customer_name}")
        
        # Commit everything
        db.commit()
        
        print("\n" + "="*60)
        print("📊 SEEDING SUMMARY")
        print("="*60)
        print(f"✅ Customers: {len(customer_objects)}")
        print(f"✅ Affiliations: {affiliation_count}")
        print(f"✅ Notes: {note_count}")
        print("="*60)
        print("\n🎉 Database seeding completed successfully!")
        
    except Exception as e:
        print(f"\n❌ Seeding failed: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()