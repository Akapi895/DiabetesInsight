# from app.sparql_utils import query_rdf
import sqlite3
import os
import uuid
from typing import List, Dict, Any, Optional
from datetime import datetime

DATABASE_PATH = os.path.join(os.path.dirname(__file__), "../diabetes.db")
AVATAR_DIR = os.path.join(os.path.dirname(__file__), "../static/avatars")

# Đảm bảo thư mục avatar tồn tại
os.makedirs(AVATAR_DIR, exist_ok=True)

# def handle_sparql_query(sparql_query: str):
#     return {"result": query_rdf(sparql_query)}

def add_patient_logic(data: dict, avatar_data: Optional[dict] = None) -> dict:
    """
    Thêm bệnh nhân mới vào database, cả thông tin cá nhân và dữ liệu diabetes
    
    Args:
        data: Dictionary chứa thông tin cá nhân của bệnh nhân
        avatar_data: Dictionary chứa dữ liệu avatar (nếu có)
        
    Returns:
        Dict chứa thông báo kết quả và ID của bệnh nhân mới
    """
    try:
        # Tạo ID cho bệnh nhân mới
        patient_id = str(uuid.uuid4())
        
        # Kết nối tới database
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()
        
        # Lưu avatar nếu có
        avatar_filename = None
        if avatar_data:
            # Tạo tên file dựa trên tên ban đầu + patient_id để đảm bảo không trùng
            # Giả sử avatar_data['filename'] chứa tên file ban đầu
            original_filename = avatar_data.get('filename', '')
            if original_filename:
                # Lấy phần mở rộng của file
                _, extension = os.path.splitext(original_filename)
                avatar_filename = f"{patient_id}{extension}"
                
                # Đường dẫn đầy đủ để lưu file
                avatar_path = os.path.join(AVATAR_DIR, avatar_filename)
                
                # Lưu file
                with open(avatar_path, 'wb') as f:
                    f.write(avatar_data['content'])
        
        # Chuẩn bị thông tin bệnh nhân cho bảng personal
        cursor.execute(
            """
            INSERT INTO personal (
                patient_id, name, age, gender, phone, email, address, avatar_path
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                patient_id,
                data['name'],
                data['age'],
                data['gender'],
                data.get('phone', None),
                data.get('email', None),
                data.get('address', None),
                avatar_filename
            )
        )
        
        # Thêm dữ liệu mặc định cho bảng diabete
        cursor.execute(
            """
            INSERT INTO diabete (
                patient_id, type_of_diabetes, disease_duration, hba1c, hypoglycemia,
                created_date
            ) VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                patient_id,
                "Type 2",  # Giá trị mặc định
                0,         # Thời gian mắc bệnh mặc định (0 năm)
                7.0,       # HbA1c mặc định
                "Low",     # Nguy cơ hạ đường huyết mặc định
                datetime.now().strftime("%Y-%m-%d")  # Ngày tạo
            )
        )
        
        # Commit giao dịch và đóng kết nối
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

def get_patient_logic(patient_id: str):
    # Giả định trả về thông tin bệnh nhân
    return {
        "id": patient_id,
        "name": "John Doe",
        "status": "Loại 2"
    }

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
            p.avatar_path,
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
            avatar_url = None
            if row["avatar_path"]:
                avatar_url = f"/static/avatars/{row['avatar_path']}"
                
            patient = {
                "id": row["patient_id"],
                "name": row["name"],
                "age": row["age"],
                "avatar": avatar_url,
                "diabetesType": row["type_of_diabetes"],
                "diseaseDuration": row["disease_duration"],
                "hba1cLevel": row["hba1c"],
                "hypoglycemiaRisk": row["hypoglycemia"]
            }
            patients.append(patient)
        
        conn.close()
        return patients
        
    except sqlite3.Error as e:
        # Log lỗi
        print(f"Database error: {e}")
        raise Exception(f"Database error: {e}")
        
    except Exception as e:
        # Log lỗi khác
        print(f"Error fetching patients: {e}")
        raise Exception(f"Error fetching patients: {e}")