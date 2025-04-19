import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/PatientList.css';

interface Patient {
  id: string;
  name: string;
  age: number;
  diabetesType: string;
  diseaseDuration: number;
  hba1cLevel: number;
  hypoglycemiaRisk: number;
}

const PatientList = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        // API endpoint thực
        const response = await fetch('http://127.0.0.1:8000/api/patients/all');
        
        if (!response.ok) {
          throw new Error('Failed to fetch patients');
        }
        
        const data = await response.json();
        setPatients(data);
        setLoading(false);
      } catch (err) {
        setError('Error fetching patient data. Please try again later.');
        setLoading(false);
        console.error('Error fetching patients:', err);
      }
    };
  
    fetchPatients();
  }, []);

  const filteredPatients = patients.filter(patient => 
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewPatient = (id: string) => {
    console.log(`Viewing details for patient ID: ${id}`);
    navigate(`/patients/${id}`);
  };

  const handleAddNewPatient = () => {
    navigate('/add-patient');
  };

  const getRiskClass = (risk: number): string => {
    switch (risk) {
      case 0: return 'Low';
      case 1: return 'Low-Medium';
      case 2: return 'Medium';
      case 3: return 'Medium-High';
      case 4: return 'High';
      default: return 'Unknown';
    }
  };

  if (loading) {
    return <div className="loading-state">Loading patient data...</div>;
  }

  if (error) {
    return <div className="error-state">{error}</div>;
  }

  return (
    <div className="patient-list-container">
      <div className="patient-list-header">
        <h1>Patient List</h1>
        <div className="actions-container">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <button className="add-patient-button" onClick={handleAddNewPatient}>
            Add New Patient
          </button>
        </div>
      </div>

      {filteredPatients.length === 0 ? (
        <div className="no-patients">
          <p>No patients found. Try a different search or add a new patient.</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="patient-table">
            <thead>
              <tr>
                <th>Patient ID</th>
                <th>Name</th>
                <th>Age</th>
                <th>Type of Diabetes</th>
                <th>Disease Duration (years)</th>
                <th>HbA1c Level</th>
                <th>Risk of Hypoglycemia</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.map((patient) => (
                <tr key={patient.id} onClick={() => handleViewPatient(patient.id)}>
                  <td>{patient.id}</td>
                  <td className="patient-name">
                    {patient.name}
                  </td>
                  <td>{patient.age}</td>
                  <td>{patient.diabetesType}</td>
                  <td>{patient.diseaseDuration}</td>
                  <td>{patient.hba1cLevel}%</td>
                  <td>
                    <span className={`risk-badge ${getRiskClass(patient.hypoglycemiaRisk)}`}>
                      {getRiskClass(patient.hypoglycemiaRisk)}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="view-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewPatient(patient.id);
                      }}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PatientList;