from fastapi import APIRouter, Query, HTTPException, Form, UploadFile, File
from app.logic import (
    get_all_patients_logic, 
    add_patient_logic,
    get_patient_logic,
    update_t2dm_logic,
    update_hba1c_logic,
    get_patient_history_logic,
    update_patient_history_logic
)
from app.sparql_utils import get_suitable_drugs
from app.schemas import PatientData, t2dmData, HbA1cUpdateData, PatientHistoryData

router = APIRouter()

@router.get("/")
def root():
    return {"message": "API running"}

@router.get("/patients/all") # Done
def get_all_patients():
    try:
        return get_all_patients_logic()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/patients/add") # Done
async def add_patient(patient_data: PatientData):
    try:
        result = add_patient_logic(patient_data)
        return result
        
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid age value")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.get("/patients/{patient_id}") # Done
def get_patient(patient_id: int):
    try:
        patient = get_patient_logic(patient_id)
        if not patient:
            raise HTTPException(status_code=404, detail="Patient not found")
        return patient
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/patients/update/t2dm")
def update_t2dm(patient_data: t2dmData):
    try:
        result = update_t2dm_logic(patient_data)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.put("/patients/update/hba1c")
def update_hba1c(update_data: HbA1cUpdateData):
    try:
        result = update_hba1c_logic(update_data.patient_id, update_data.hba1c_level)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.get("/patients/history/{patient_id}")
def get_patient_history(patient_id: int):
    try:
        history = get_patient_history_logic(patient_id)
        return history
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.put("/patients/update/history")
def update_patient_history(history_data: PatientHistoryData):
    try:
        result = update_patient_history_logic(history_data.patient_id, history_data.dict())
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.get("/patients/{patient_id}/suitable-drugs")
def suitable_drugs(patient_id: int):
    try:
        drugs = get_suitable_drugs(patient_id)
        return {"suitable_drugs": drugs}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))