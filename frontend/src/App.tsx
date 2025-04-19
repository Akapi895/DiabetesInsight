import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AddPatient from './pages/AddPatient';
import PatientList from './pages/PatientList';
import PatientDetail from './pages/PatientDetail';
import HbA1cSteps from './pages/HbA1cSteps';
import TopsisAnalysis from './pages/TopsisAnalysis';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PatientList />} /> 
        <Route path="/add-patient" element={<AddPatient />} />
        <Route path="/patient-list" element={<PatientList />} />
        <Route path="/patients/:id" element={<PatientDetail />} />
        <Route path="/hba1c-steps/:id" element={<HbA1cSteps />} />
        <Route path="/topsis-analysis/:id" element={<TopsisAnalysis />} />
      </Routes>
    </Router>
  );
}

export default App;