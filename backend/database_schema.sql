-- ┌─────────────────────────────────────────────────────────────────────────┐
-- │                          DATABASE SCHEMA                                 │
-- └─────────────────────────────────────────────────────────────────────────┘

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. CUSTOMERS TABLE
CREATE TABLE customers (
    customer_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_name VARCHAR(255) NOT NULL UNIQUE,
    industry VARCHAR(255),
    phone VARCHAR(500),  -- Can store multiple numbers
    email VARCHAR(255),
    location TEXT,
    website VARCHAR(255),
    linkedin_url VARCHAR(255),
    no_of_employees INTEGER,
    established_year INTEGER,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' 
        CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED')),
    created_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    version INTEGER DEFAULT 1  -- For optimistic locking
);

-- Indexes for performance
CREATE INDEX idx_customers_name ON customers(customer_name);
CREATE INDEX idx_customers_status ON customers(status);
CREATE INDEX idx_customers_industry ON customers(industry);
CREATE INDEX idx_customers_created_at ON customers(created_at);

-- 2. AFFILIATIONS TABLE (Self-referential relationship)
CREATE TABLE affiliations (
    affiliation_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_customer_id UUID NOT NULL REFERENCES customers(customer_id) ON DELETE CASCADE,
    affiliate_customer_id UUID NOT NULL REFERENCES customers(customer_id) ON DELETE CASCADE,
    relationship_type VARCHAR(50) DEFAULT 'AFFILIATE' 
        CHECK (relationship_type IN ('AFFILIATE', 'SUBSIDIARY', 'PARTNER', 'VENDOR')),
    notes TEXT,
    status VARCHAR(20) DEFAULT 'ACTIVE' 
        CHECK (status IN ('ACTIVE', 'INACTIVE', 'PENDING')),
    created_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Prevent self-affiliation and duplicates
    CONSTRAINT no_self_affiliation CHECK (parent_customer_id != affiliate_customer_id),
    UNIQUE(parent_customer_id, affiliate_customer_id, relationship_type)
);

CREATE INDEX idx_affiliations_parent ON affiliations(parent_customer_id);
CREATE INDEX idx_affiliations_affiliate ON affiliations(affiliate_customer_id);
CREATE INDEX idx_affiliations_status ON affiliations(status);

-- 3. CUSTOMER_NOTES TABLE (Append-only history)
CREATE TABLE customer_notes (
    note_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(customer_id) ON DELETE CASCADE,
    note_text TEXT NOT NULL,
    note_type VARCHAR(50) DEFAULT 'GENERAL' 
        CHECK (note_type IN ('GENERAL', 'IMPORTANT', 'FOLLOW_UP', 'MEETING', 'CALL')),
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Note is immutable once created
    is_edited BOOLEAN DEFAULT FALSE,
    edited_at TIMESTAMP WITH TIME ZONE,
    edited_by VARCHAR(255)
);

CREATE INDEX idx_notes_customer ON customer_notes(customer_id);
CREATE INDEX idx_notes_created_at ON customer_notes(created_at);
CREATE INDEX idx_notes_type ON customer_notes(note_type);

-- 4. AUDIT_LOGS TABLE (Tracks all data mutations)
CREATE TABLE audit_logs (
    log_id BIGSERIAL PRIMARY KEY,
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    action VARCHAR(20) NOT NULL 
        CHECK (action IN ('INSERT', 'UPDATE', 'DELETE', 'SOFT_DELETE', 'RESTORE')),
    old_data JSONB,
    new_data JSONB,
    changed_by VARCHAR(255) NOT NULL,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);

CREATE INDEX idx_audit_record ON audit_logs(table_name, record_id);
CREATE INDEX idx_audit_changed_at ON audit_logs(changed_at);
CREATE INDEX idx_audit_action ON audit_logs(action);

-- 5. AUTO-UPDATE TRIGGER FOR updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_customers_updated_at 
    BEFORE UPDATE ON customers 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_affiliations_updated_at 
    BEFORE UPDATE ON affiliations 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 6. AUDIT TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
DECLARE
    old_data_json JSONB;
    new_data_json JSONB;
    action_type VARCHAR(20);
    record_id_val UUID;
    table_name_val VARCHAR(100);
BEGIN
    -- Determine action type and get IDs
    IF (TG_OP = 'INSERT') THEN
        action_type := 'INSERT';
        new_data_json := to_jsonb(NEW);
        record_id_val := NEW.customer_id;
        table_name_val := TG_TABLE_NAME;
    ELSIF (TG_OP = 'UPDATE') THEN
        action_type := 'UPDATE';
        old_data_json := to_jsonb(OLD);
        new_data_json := to_jsonb(NEW);
        record_id_val := NEW.customer_id;
        table_name_val := TG_TABLE_NAME;
    ELSIF (TG_OP = 'DELETE') THEN
        action_type := 'DELETE';
        old_data_json := to_jsonb(OLD);
        record_id_val := OLD.customer_id;
        table_name_val := TG_TABLE_NAME;
    END IF;
    
    -- Insert audit record
    INSERT INTO audit_logs (table_name, record_id, action, old_data, new_data, changed_by, ip_address)
    VALUES (table_name_val, record_id_val, action_type, old_data_json, new_data_json, 
            COALESCE(current_setting('app.current_user', true), 'SYSTEM'),
            COALESCE(inet_client_addr(), NULL::inet));
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply audit triggers
CREATE TRIGGER audit_customers_trigger
    AFTER INSERT OR UPDATE OR DELETE ON customers
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_affiliations_trigger
    AFTER INSERT OR UPDATE OR DELETE ON affiliations
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Soft delete view (only active customers)
CREATE VIEW active_customers AS
    SELECT * FROM customers WHERE status = 'ACTIVE';

-- Customer summary view
CREATE VIEW customer_summary AS
SELECT 
    c.customer_id,
    c.customer_name,
    c.industry,
    c.status,
    c.created_at,
    COUNT(DISTINCT a.affiliate_customer_id) as affiliate_count,
    COUNT(DISTINCT cn.note_id) as note_count,
    STRING_AGG(DISTINCT a2.customer_name, ', ') as affiliates_list
FROM customers c
LEFT JOIN affiliations a ON c.customer_id = a.parent_customer_id AND a.status = 'ACTIVE'
LEFT JOIN customers a2 ON a.affiliate_customer_id = a2.customer_id
LEFT JOIN customer_notes cn ON c.customer_id = cn.customer_id
WHERE c.status = 'ACTIVE'
GROUP BY c.customer_id, c.customer_name, c.industry, c.status, c.created_at;