from pydantic import BaseModel
from typing import Optional

class PatientData(BaseModel):
    name: str
    age: int
    gender: str
    phoneNumber: str
    email: str
    address: str

class t2dmData(BaseModel):
    id: int
    name: str 
    age: int
    diabetesType: str
    diseaseDuration: int
    hba1cLevel: float
    hypoglycemiaRisk: str
    lifeExpectancy: str
    importantComorbidities: str
    establishedVascularComplications: str
    patientAttitude: str
    resourcesSupport: str
    timestamp: Optional[int] = None

class HbA1cUpdateData(BaseModel):
    patient_id: int
    hba1c_level: float

class PatientHistoryData(BaseModel):
    patient_id: int
    cvd: list[str] = []
    renalGu: list[str] = []
    others: list[str] = []
    hypo: list[str] = []
    weight: list[str] = []
    bone: list[str] = []
    giSx: list[str] = []
    chf: list[str] = []
    adrs: list[str] = []