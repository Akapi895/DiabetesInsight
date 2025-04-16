from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from app.endpoints import router as api_router

app = FastAPI(title="Diabetes Advisor API")

STATIC_DIR = os.path.join(os.path.dirname(__file__), "../static")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"], 
    allow_headers=["*"],
)

# Mount thư mục static để phục vụ tệp tĩnh như avatar
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

app.include_router(api_router, prefix="/api", tags=["api"])