# from app.sparql_utils import query_rdf
import sqlite3
import os
import uuid
from typing import List, Dict, Any, Optional
from datetime import datetime
from app.schemas import PatientData, t2dmData

DATABASE_PATH = os.path.join(os.path.dirname(__file__), "../diabetes.db")

def add_patient_logic(data: PatientData) -> dict:
    try:        
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()

        cursor.execute(
            """
            INSERT INTO personal (
                name, age, gender, phone, email, address
            ) VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                data.name,       
                data.age,        
                data.gender,     
                data.phoneNumber,
                data.email,      
                data.address 
            )
        )
        conn.commit()

        cursor.execute("SELECT last_insert_rowid()")
        patient_id = cursor.fetchone()[0]

        
        cursor.execute(
            """
            INSERT INTO diabete (
                patient_id, type_of_diabetes, disease_duration, hba1c, hypoglycemia,
                life_expectancy, important_comorbidities, vascular_complications,
                attitude, resources
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                patient_id,
                0, 
                0,       
                7.0,  
                0,
                0,
                0,
                0,
                0,
                0
            )
        )
        
        conn.commit()
        conn.close()
        
        return {
            "message": "Patient added successfully",
            "patient_id": patient_id
        }
        
    except sqlite3.Error as e:
        # Rollback nếu có lỗi
        if conn:
            conn.rollback()
            conn.close()
        print(f"Database error: {e}")
        raise Exception(f"Database error: {e}")
        
    except Exception as e:
        # Đảm bảo đóng kết nối nếu có lỗi
        if conn:
            conn.rollback()
            conn.close()
        print(f"Error adding patient: {e}")
        raise Exception(f"Error adding patient: {e}")

def get_all_patients_logic() -> List[Dict[str, Any]]:
    try:
        # Kết nối đến database
        conn = sqlite3.connect(DATABASE_PATH)
        conn.row_factory = sqlite3.Row  
        cursor = conn.cursor()
        
        query = """
        SELECT 
            p.patient_id, 
            p.name, 
            p.age, 
            d.type_of_diabetes, 
            d.disease_duration, 
            d.hba1c, 
            d.hypoglycemia
        FROM 
            personal p
        JOIN 
            diabete d ON p.patient_id = d.patient_id
        ORDER BY 
            p.name
        """
        
        cursor.execute(query)
        rows = cursor.fetchall()
        
        # Chuyển đổi kết quả thành danh sách các dictionary
        patients = []
        for row in rows:
                
            patient = {
                "id": row["patient_id"],
                "name": row["name"],
                "age": row["age"],
                "diabetesType": row["type_of_diabetes"],
                "diseaseDuration": row["disease_duration"],
                "hba1cLevel": row["hba1c"],
                "hypoglycemiaRisk": row["hypoglycemia"]
            }
            patients.append(patient)
        
        conn.close()
        sorted_patients = sorted(patients, key=lambda x: x["id"])
        return sorted_patients
        
    except sqlite3.Error as e:
        # Log lỗi
        print(f"Database error: {e}")
        raise Exception(f"Database error: {e}")
        
    except Exception as e:
        # Log lỗi khác
        print(f"Error fetching patients: {e}")
        raise Exception(f"Error fetching patients: {e}")
        
def get_patient_logic(patient_id: int):
    try:
        conn = sqlite3.connect(DATABASE_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        # 1. Lấy thông tin cá nhân từ bảng personal
        cursor.execute(
            """
            SELECT 
                name, age, gender, phone, email, address
            FROM 
                personal 
            WHERE 
                patient_id = ?
            """, 
            (patient_id,)
        )
        
        person_row = cursor.fetchone()
        
        if not person_row:
            conn.close()
            return None  # Bệnh nhân không tồn tại
            
        # Chuyển row thành dict
        personal_info = {
            "name": person_row["name"],
            "age": person_row["age"],
            "gender": person_row["gender"],
            "phoneNumber": person_row["phone"],
            "email": person_row["email"],
            "address": person_row["address"]
        }
        
        # 2. Lấy thông tin bệnh tiểu đường từ bảng diabete
        cursor.execute(
            """
            SELECT 
                type_of_diabetes, disease_duration, hba1c, hypoglycemia,
                life_expectancy, important_comorbidities, vascular_complications,
                attitude, resources
            FROM 
                diabete 
            WHERE 
                patient_id = ?
            """, 
            (patient_id,)
        )
        
        diabetes_row = cursor.fetchone()
        
        if diabetes_row:
            diabetes_info = {
                "diabetesType": diabetes_row["type_of_diabetes"],
                "diseaseDuration": diabetes_row["disease_duration"],
                "hba1cLevel": diabetes_row["hba1c"],
                "hypoglycemiaRisk": diabetes_row["hypoglycemia"],
                "lifeExpectancy": diabetes_row["life_expectancy"],
                "importantComorbidities": diabetes_row["important_comorbidities"],
                "vascularComplications": diabetes_row["vascular_complications"],
                "patientAttitude": diabetes_row["attitude"],
                "resourcesSupport": diabetes_row["resources"]
            }
        else:
            # Nếu không có thông tin bệnh tiểu đường, tạo dict trống
            diabetes_info = {
                "diabetesType": None,
                "diseaseDuration": None,
                "hba1cLevel": None,
                "hypoglycemiaRisk": None,
                "lifeExpectancy": None,
                "importantComorbidities": None,
                "vascularComplications": None,
                "patientAttitude": None,
                "resourcesSupport": None
            }
        
        # 3. Lấy tất cả phản ứng phụ từ bảng adverse_reaction
        cursor.execute(
            """
            SELECT 
                drug
            FROM 
                adverse_reaction 
            WHERE 
                patient_id = ?
            """, 
            (patient_id,)
        )
        
        adverse_reactions = []
        for row in cursor.fetchall():
            reaction = {
                "drug": row["drug"]
            }
            adverse_reactions.append(reaction)
        
        # 4. Lấy tiền sử bệnh từ bảng medical_history
        cursor.execute(
            """
            SELECT 
                category, condition
            FROM 
                medical_history 
            WHERE 
                patient_id = ?
            ORDER BY 
                category
            """, 
            (patient_id,)
        )
        
        medical_history = []
        for row in cursor.fetchall():
            history = {
                "category": row["category"],
                "condition": row["condition"]
            }
            medical_history.append(history)
        
        # Đóng kết nối database
        conn.close()
        
        # Kết hợp tất cả thông tin vào một dict
        patient_data = {
            "id": patient_id,
            "personal": personal_info,
            "diabetes": diabetes_info,
            "adverseReactions": adverse_reactions,
            "medicalHistory": medical_history
        }
        
        return patient_data
        
    except sqlite3.Error as e:
        print(f"Database error: {e}")
        raise Exception(f"Database error: {e}")
        
    except Exception as e:
        print(f"Error fetching patient data: {e}")
        raise Exception(f"Error fetching patient data: {e}")
    
def update_t2dm_logic(data: t2dmData) -> dict:
    try:
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()
        
        hypoglycemia_map = {
            "Low": 0, "Low-Medium": 1, "Medium": 2, "Medium-High": 3, "High": 4
        }
        
        life_expectancy_map = {
            "Very Long": 0, "Long": 1, "Moderate": 2, "Limited": 3, "Short": 4
        }
        
        comorbidities_map = {
            "Absent": 0, "Minimal": 1, "Mild": 2, "Moderate": 3, "Severe": 4
        }
        
        vascular_complications_map = {
            "None": 0, "Minimal": 1, "Mild": 2, "Moderate": 3, "Severe": 4
        }
        
        patient_attitude_map = {
            "Highly motivated": 0, "Very motivated": 1, "Moderately motivated": 2, 
            "Somewhat motivated": 3, "Less motivated": 4
        }
        
        resources_support_map = {
            "Readily available": 0, "Available": 1, "Moderate": 2, "Restricted": 3, "Limited": 4
        }
        
        # Xóa thông tin hiện tại (nếu có)
        cursor.execute(
            "DELETE FROM diabete WHERE patient_id = ?",
            (data.id,)
        )
        
        # Chuyển diabetes type từ chuỗi sang số
        diabetes_type = 1 if data.diabetesType == "Type 1" else 2
        
        # Thêm thông tin mới
        cursor.execute(
            """
            INSERT INTO diabete (
                patient_id, type_of_diabetes, disease_duration, hba1c, hypoglycemia,
                life_expectancy, important_comorbidities, vascular_complications,
                attitude, resources
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                data.id,
                diabetes_type,
                data.diseaseDuration,
                data.hba1cLevel,
                hypoglycemia_map.get(data.hypoglycemiaRisk, 0),
                life_expectancy_map.get(data.lifeExpectancy, 2),
                comorbidities_map.get(data.importantComorbidities, 0),
                vascular_complications_map.get(data.establishedVascularComplications, 0),
                patient_attitude_map.get(data.patientAttitude, 2),
                resources_support_map.get(data.resourcesSupport, 2)
            )
        )
        
        conn.commit()
        conn.close()
        
        return {
            "message": "T2DM data updated successfully",
            "patient_id": data.id
        }
        
    except sqlite3.Error as e:
        if conn:
            conn.rollback()
            conn.close()
        print(f"Database error: {e}")
        raise Exception(f"Database error: {e}")
        
    except Exception as e:
        if conn:
            conn.rollback()
            conn.close()
        print(f"Error updating T2DM data: {e}")
        raise Exception(f"Error updating T2DM data: {e}")

def update_hba1c_logic(patient_id: int, hba1c_level: float) -> dict:
    try:
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()
        
        cursor.execute(
            "SELECT COUNT(*) FROM personal WHERE patient_id = ?",
            (patient_id,)
        )
        
        if cursor.fetchone()[0] == 0:
            conn.close()
            raise Exception(f"Patient with ID {patient_id} not found")
        
        cursor.execute(
            """
            UPDATE diabete 
            SET hba1c = ? 
            WHERE patient_id = ?
            """,
            (hba1c_level, patient_id)
        )
        
        if cursor.rowcount == 0:
            cursor.execute(
                """
                INSERT INTO diabete (
                    patient_id, type_of_diabetes, disease_duration, hba1c, hypoglycemia,
                    life_expectancy, important_comorbidities, vascular_complications,
                    attitude, resources
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    patient_id,
                    2,  # Type 2 mặc định
                    0,  # Disease duration mặc định
                    hba1c_level,  # HbA1c mới
                    0,  # Hypoglycemia risk mặc định
                    0,  # Life expectancy mặc định
                    0,  # Important comorbidities mặc định
                    0,  # Vascular complications mặc định
                    0,  # Patient attitude mặc định
                    0   # Resources mặc định
                )
            )
        
        conn.commit()
        conn.close()
        
        return {
            "message": "HbA1c updated successfully",
            "patient_id": patient_id,
            "hba1c_level": hba1c_level
        }
        
    except sqlite3.Error as e:
        if conn:
            conn.rollback()
            conn.close()
        print(f"Database error: {e}")
        raise Exception(f"Database error: {e}")
        
    except Exception as e:
        if conn:
            conn.close()
        print(f"Error updating HbA1c: {e}")
        raise Exception(f"Error updating HbA1c: {e}")