# DiabetesInsight

**DiabetesInsight** is a clinical decision support system for doctors in the management and treatment of diabetes patients, utilizing multi-criteria analysis methods (TOPSIS) and fuzzy logic to personalize drug selection and HbA1c target recommendations.

---

## Technologies Used

- **Backend:** FastAPI (Python)
- **Frontend:** React + TypeScript
- **Database:** SQLite
- **Ontology:** RDFLib

---

## Installation & Running Guide

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/DiabetesInsight.git
cd DiabetesInsight
pip install -r requirements.txt
```

### 2. Backend Setup

Open a **split terminal** in VS Code (Ctrl+Shift+5 or the split terminal icon).

In the first terminal, navigate to the backend folder and start the FastAPI backend:

```bash
cd backend
uvicorn app.main:app --reload
```

> By default, the backend runs at [http://127.0.0.1:8000](http://127.0.0.1:8000)

### 3. Frontend Setup

In the second terminal, navigate to the frontend folder:

```bash
cd frontend
npm install
```

Start the React + TypeScript frontend:

```bash
npm run dev
```

> By default, the frontend runs at http://localhost:5173

---

## Usage

- Access [http://localhost:5173](http://localhost:5173) to use the web interface.
- The FastAPI backend provides APIs for the frontend, handles data processing, ontology, and database queries.
- The frontend uses TypeScript for type safety and a better user experience.

---

## Notes

- Make sure Python and Node.js are installed on your machine.
- If you encounter CORS errors, check the `allow_origins` configuration in the backend.
- If you change the ontology or database, restart the backend.

---

**Note:** This system is for decision support only and does not replace professional medical advice.
