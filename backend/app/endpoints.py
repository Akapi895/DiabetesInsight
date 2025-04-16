from fastapi import APIRouter, Query, HTTPException, Form, UploadFile, File
from app.logic import (
    get_all_patients_logic, 
    add_patient_logic 
)
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

# Model cho dữ liệu bệnh nhân
class PatientData(BaseModel):
    name: str
    age: int
    gender: str
    phoneNumber: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None

@router.get("/")
def root():
    return {"message": "API running"}

@router.get("/patients/all") # Done
def get_all_patients():
    try:
        return get_all_patients_logic()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/patients/add")
async def add_patient(
    name: str = Form(...),
    age: str = Form(...),
    gender: str = Form(...),
    phoneNumber: Optional[str] = Form(None),
    email: Optional[str] = Form(None),
    address: Optional[str] = Form(None),
    avatar: Optional[UploadFile] = File(None)
):
    try:
        # Chuyển đổi age thành kiểu số
        age_int = int(age)
        
        # Chuẩn bị dữ liệu bệnh nhân
        patient_data = {
            "name": name,
            "age": age_int,
            "gender": gender,
            "phone": phoneNumber,
            "email": email,
            "address": address
        }
        
        # Xử lý avatar nếu được tải lên
        avatar_data = None
        if avatar:
            avatar_content = await avatar.read()
            avatar_data = {
                "filename": avatar.filename,
                "content": avatar_content
            }
            
        # Gọi logic để thêm bệnh nhân
        result = add_patient_logic(patient_data, avatar_data)
        return result
        
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid age value")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))