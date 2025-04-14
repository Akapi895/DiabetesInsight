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
  hypoglycemiaRisk: string;
  avatar?: string;
}

const PatientList = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const navigate = useNavigate();

//   useEffect(() => {
//     const fetchPatients = async () => {
//       try {
//         setLoading(true);
//         // Replace with your actual API endpoint
//         const response = await fetch('http://localhost:5000/api/patients');
        
//         if (!response.ok) {
//           throw new Error('Failed to fetch patients');
//         }
        
//         const data = await response.json();
//         setPatients(data);
//         setLoading(false);
//       } catch (err) {
//         setError('Error fetching patient data. Please try again later.');
//         setLoading(false);
//         console.error('Error fetching patients:', err);
//       }
//     };

//     fetchPatients();
//   }, []);

  // For demo purposes, using mock data if API is not ready
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && !patients.length && loading) {
      // Mock data for development
      const mockPatients: Patient[] = [
        {
          id: 'PT001',
          name: 'John Smith',
          age: 56,
          diabetesType: 'Type 2',
          diseaseDuration: 8,
          hba1cLevel: 7.2,
          hypoglycemiaRisk: 'Low'
        },
        {
          id: 'PT002',
          name: 'Emma Johnson',
          age: 42,
          diabetesType: 'Type 1',
          diseaseDuration: 15,
          hba1cLevel: 6.8,
          hypoglycemiaRisk: 'Medium'
        },
        {
          id: 'PT003',
          name: 'Michael Chen',
          age: 67,
          diabetesType: 'Type 2',
          diseaseDuration: 12,
          hba1cLevel: 8.1,
          hypoglycemiaRisk: 'High'
        },
        {
          id: 'PT004',
          name: 'Sarah Williams',
          age: 35,
          diabetesType: 'Type 1',
          diseaseDuration: 20,
          hba1cLevel: 6.5,
          hypoglycemiaRisk: 'Low'
        },
        {
          id: 'PT005',
          name: 'Robert Garcia',
          age: 59,
          diabetesType: 'Type 2',
          diseaseDuration: 5,
          hba1cLevel: 7.8,
          hypoglycemiaRisk: 'Medium'
        }
      ];
      
      setPatients(mockPatients);
      setLoading(false);
    }
  }, [patients.length, loading]);

  const filteredPatients = patients.filter(patient => 
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewPatient = (id: string) => {
    navigate(`/patients/${id}`);
  };

  const handleAddNewPatient = () => {
    navigate('/add-patient');
  };

  const getRiskClass = (risk: string): string => {
    switch (risk.toLowerCase()) {
      case 'low':
        return 'risk-low';
      case 'medium':
        return 'risk-medium';
      case 'high':
        return 'risk-high';
      default:
        return '';
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
                    {patient.avatar && (
                      <img 
                        src={patient.avatar} 
                        alt={`${patient.name}'s avatar`} 
                        className="patient-avatar" 
                      />
                    )}
                    {patient.name}
                  </td>
                  <td>{patient.age}</td>
                  <td>{patient.diabetesType}</td>
                  <td>{patient.diseaseDuration}</td>
                  <td>{patient.hba1cLevel}%</td>
                  <td>
                    <span className={`risk-badge ${getRiskClass(patient.hypoglycemiaRisk)}`}>
                      {patient.hypoglycemiaRisk}
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