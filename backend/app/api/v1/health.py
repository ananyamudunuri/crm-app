# backend/app/api/v1/health.py
from fastapi import APIRouter

router = APIRouter(tags=["Health"])

@router.get("/health")
def health_check():
    return {"status": "healthy", "message": "API is running"}

@router.get("/")
def root():
    return {
        "name": "Customer CRM API",
        "version": "1.0.0",
        "status": "running"
    }