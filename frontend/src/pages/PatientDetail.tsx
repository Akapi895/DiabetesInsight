import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/PatientDetail.css';

// Định nghĩa interfaces mới phản ánh cấu trúc API
interface PersonalInfo {
  name: string;
  age: number;
  gender: string;
  phoneNumber: string;
  email: string;
  address: string;
}

interface DiabetesInfo {
  diabetesType: number;
  diseaseDuration: number;
  hba1cLevel: number;
  hypoglycemiaRisk: number;
  lifeExpectancy: number;
  importantComorbidities: number;
  vascularComplications: number;
  patientAttitude: number;
  resourcesSupport: number;
}

interface AdverseReaction {
  drug: string;
}

interface MedicalHistoryItem {
  category: string;
  condition: string;
}

interface Patient {
  id: number;
  personal: PersonalInfo;
  diabetes: DiabetesInfo;
  adverseReactions: AdverseReaction[];
  medicalHistory: MedicalHistoryItem[];
}

const PatientDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('basic');
  const [hba1cTarget, setHba1cTarget] = useState<string | null>(null);

  const [patientFactors, setPatientFactors] = useState({
    hypoglycemiaRisk: 0,
    diseaseDuration: 0,
    lifeExpectancy: 0,
    comorbidities: 0,
    vascularComplications: 0,
    patientAttitude: 0,
    resourcesSupport: 0
  });

  const [checkedItems, setCheckedItems] = useState<{[key: string]: {[key: string]: boolean}}>({
    giSx: {},
    cvd: {},
    renalGu: {},
    others: {},
    hypo: {},
    weight: {},
    bone: {},
    chf: {},
    adrs: {}
  });

  const handleCheckboxChange = (category: string, item: string) => {
    setCheckedItems(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [item]: !prev[category][item]
      }
    }));
  };

  const handleOptionClick = (factor: string, value: number) => {
    setPatientFactors(prev => ({
      ...prev,
      [factor]: value
    }));
    
    if (!patient) return;
    
    const updatedPatient = { ...patient };
    
    switch (factor) {
      case 'hypoglycemiaRisk':
        updatedPatient.diabetes.hypoglycemiaRisk = value;
        break;
      case 'diseaseDuration':
        updatedPatient.diabetes.diseaseDuration = value;
        break;
      case 'lifeExpectancy':
        updatedPatient.diabetes.lifeExpectancy = value;
        break;
      case 'comorbidities':
        updatedPatient.diabetes.importantComorbidities = value;
        break;
      case 'vascularComplications':
        updatedPatient.diabetes.vascularComplications = value;
        break;
      case 'patientAttitude':
        updatedPatient.diabetes.patientAttitude = value;
        break;
      case 'resourcesSupport':
        updatedPatient.diabetes.resourcesSupport = value;
        break;
    }
    
    setPatient(updatedPatient);
  };

  const mapRiskLevel = (value: number): string => {
    switch (value) {
      case 0: return 'Low';
      case 1: return 'Low-Medium';
      case 2: return 'Medium';
      case 3: return 'Medium-High';
      case 4: return 'High';
      default: return 'Unknown';
    }
  };

  const mapDurationLevel = (value: number): string => {
    switch (value) {
      case 0: return 'Newly diagnosed';
      case 1: return 'Short duration (1-5 years)';
      case 2: return 'Moderate duration (5-10 years)';
      case 3: return 'Extended duration (10-15 years)';
      case 4: return 'Long-standing (>15 years)';
      default: return 'Unknown';
    }
  };

  const mapLifeExpectancy = (value: number): string => {
    switch (value) {
      case 0: return 'Very Long';
      case 1: return 'Long';
      case 2: return 'Moderate';
      case 3: return 'Limited';
      case 4: return 'Short';
      default: return 'Unknown';
    }
  };

  const mapComorbidities = (value: number): string => {
    switch (value) {
      case 0: return 'Absent';
      case 1: return 'Minimal';
      case 2: return 'Mild';
      case 3: return 'Moderate';
      case 4: return 'Severe';
      default: return 'Unknown';
    }
  };

  const mapVascularComplications = (value: number): string => {
    switch (value) {
      case 0: return 'None';
      case 1: return 'Minimal';
      case 2: return 'Mild';
      case 3: return 'Moderate';
      case 4: return 'Severe';
      default: return 'Unknown';
    }
  };

  const mapPatientAttitude = (value: number): string => {
    switch (value) {
      case 0: return 'Highly motivated';
      case 1: return 'Very motivated';
      case 2: return 'Moderately motivated';
      case 3: return 'Somewhat motivated';
      case 4: return 'Less motivated';
      default: return 'Unknown';
    }
  };

  const mapResourcesSupport = (value: number): string => {
    switch (value) {
      case 0: return 'Readily available';
      case 1: return 'Available';
      case 2: return 'Moderate';
      case 3: return 'Restricted';
      case 4: return 'Limited';
      default: return 'Unknown';
    }
  };
  

  useEffect(() => {
    const fetchPatient = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const response = await fetch(`http://127.0.0.1:8000/api/patients/${id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch patient details');
        }
        
        const data = await response.json();
        setPatient(data);
        
        // Cập nhật patientFactors từ dữ liệu mới
        if (data.diabetes) {
          setPatientFactors({
            hypoglycemiaRisk: data.diabetes.hypoglycemiaRisk,
            diseaseDuration: data.diabetes.diseaseDuration,
            lifeExpectancy: data.diabetes.lifeExpectancy,
            comorbidities: data.diabetes.importantComorbidities,
            vascularComplications: data.diabetes.vascularComplications,
            patientAttitude: data.diabetes.patientAttitude,
            resourcesSupport: data.diabetes.resourcesSupport
          });
        }
        
        setError(null);
      } catch (err) {
        setError('Error fetching patient details. Please try again later.');
        console.error('Error fetching patient:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPatient();
  }, [id]);

  useEffect(() => {
    if (patient) {
      const initialCheckedItems = {
        giSx: {},
        cvd: {},
        renalGu: {},
        others: {},
        hypo: {},
        weight: {},
        bone: {},
        chf: {},
        adrs: {}
      };
      setCheckedItems(initialCheckedItems);
    }
  }, [patient]);

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

  const savePatientToSession = () => {
    if (patient) {
      const patientFactorsData = {
        id: patient.id,
        name: patient.personal.name,
        age: patient.personal.age,
        diabetesType: patient.diabetes.diabetesType === 1 ? 'Type 1' : 'Type 2',
        diseaseDuration: patient.diabetes.diseaseDuration,
        hba1cLevel: patient.diabetes.hba1cLevel,
        hypoglycemiaRisk: mapRiskLevel(patient.diabetes.hypoglycemiaRisk),
        lifeExpectancy: mapLifeExpectancy(patient.diabetes.lifeExpectancy),
        importantComorbidities: mapComorbidities(patient.diabetes.importantComorbidities),
        establishedVascularComplications: mapVascularComplications(patient.diabetes.vascularComplications),
        patientAttitude: mapPatientAttitude(patient.diabetes.patientAttitude),
        resourcesSupport: mapResourcesSupport(patient.diabetes.resourcesSupport),
        timestamp: new Date().getTime()
      };
  
      sessionStorage.setItem('diabetesInsight_patientFactors', JSON.stringify(patientFactorsData));
      console.log('Patient data saved to session storage:', patientFactorsData);
      
      return true;
    }
    return false;
  };

  if (loading) {
    return <div className="loading-state">Loading patient details...</div>;
  }

  if (error || !patient) {
    return <div className="error-state">{error || 'Patient not found.'}</div>;
  }

  return (
    <div className="patient-detail-container">
      <div className="patient-detail-header">
        <h1>Patient Details: {patient.personal.name}</h1>
        <div className="header-actions">
          <button className="back-button" onClick={() => navigate('/patient-list')}>
            Back to Patient List
          </button>
        </div>
      </div>

      <div className="patient-card">
        <div className="patient-summary">
          <div className="patient-id-name">
            <h2>{patient.personal.name}</h2>
            <span className="patient-id">ID: {patient.id}</span>
          </div>
          <div className="patient-key-metrics">
            <div className="metric">
              <span className="metric-label">Age:</span>
              <span className="metric-value">{patient.personal.age}</span>
            </div>
            <div className="metric">
              <span className="metric-label">Type:</span>
              <span className="metric-value">
                {patient.diabetes.diabetesType === 1 ? 'Type 1' : 
                 patient.diabetes.diabetesType === 2 ? 'Type 2' : 
                 'None'}
              </span>
            </div>
            <div className="metric">
              <span className="metric-label">HbA1c:</span>
              <span className="metric-value">{patient.diabetes.hba1cLevel}%</span>
            </div>
            <div className="metric">
              <span className="metric-label">Risk:</span>
              <span className={`risk-badge risk-${mapRiskLevel(patient.diabetes.hypoglycemiaRisk).toLowerCase()}`}>
                {mapRiskLevel(patient.diabetes.hypoglycemiaRisk)}
              </span>
            </div>
          </div>
        </div>

        <div className="patient-tabs">
          <button 
            className={`tab-button ${activeTab === 'basic' ? 'active' : ''}`}
            onClick={() => setActiveTab('basic')}
          >
            Basic Information
          </button>
          <button 
            className={`tab-button ${activeTab === 'modification' ? 'active' : ''}`}
            onClick={() => setActiveTab('modification')}
          >
            T2DM Modification
          </button>
          <button 
            className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            History & ADRs
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'basic' && (
            <div className="patient-info-section">
              <div className="patient-info-grid">
                <div className="info-item">
                  <label>Patient ID:</label>
                  <span>{patient.id}</span>
                </div>
                <div className="info-item">
                  <label>Name:</label>
                  <span>{patient.personal.name}</span>
                </div>
                <div className="info-item">
                  <label>Age:</label>
                  <span>{patient.personal.age}</span>
                </div>
                <div className="info-item">
                  <label>Gender:</label>
                  <span>{patient.personal.gender}</span>
                </div>
                <div className="info-item">
                  <label>Phone Number:</label>
                  <span>{patient.personal.phoneNumber}</span>
                </div>
                <div className="info-item">
                  <label>Email:</label>
                  <span>{patient.personal.email}</span>
                </div>
                <div className="info-item">
                  <label>Address:</label>
                  <span>{patient.personal.address}</span>
                </div>
                <div className="info-item">
                  <label>Type of Diabetes:</label>
                  <span>
                    {patient.diabetes.diabetesType === 1 ? 'Type 1' : 
                    patient.diabetes.diabetesType === 2 ? 'Type 2' : 'Other'}
                  </span>
                </div>
                <div className="info-item">
                  <label>Disease Duration:</label>
                  <span>{mapDurationLevel(patient.diabetes.diseaseDuration)}</span>
                </div>
                <div className="info-item">
                  <label>HbA1c Level:</label>
                  <span>{patient.diabetes.hba1cLevel}%</span>
                </div>
                <div className="info-item">
                  <label>Risk of Hypoglycemia:</label>
                  <span>{mapRiskLevel(patient.diabetes.hypoglycemiaRisk)}</span>
                </div>
                <div className="info-item">
                  <label>Life Expectancy:</label>
                  <span>{mapLifeExpectancy(patient.diabetes.lifeExpectancy)}</span>
                </div>
                <div className="info-item">
                  <label>Important Comorbidities:</label>
                  <span>{mapComorbidities(patient.diabetes.importantComorbidities)}</span>
                </div>
                <div className="info-item">
                  <label>Vascular Complications:</label>
                  <span>{mapVascularComplications(patient.diabetes.vascularComplications)}</span>
                </div>
                <div className="info-item">
                  <label>Patient Attitude:</label>
                  <span>{mapPatientAttitude(patient.diabetes.patientAttitude)}</span>
                </div>
                <div className="info-item">
                  <label>Resources and Support:</label>
                  <span>{mapResourcesSupport(patient.diabetes.resourcesSupport)}</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'modification' && (
            <div className="patient-modification-section">
              <table className="modification-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>0</th>
                    <th>1</th>
                    <th>2</th>
                    <th>3</th>
                    <th>4</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Risks of Hypoglycemia or Drug Effects</td>
                    <td 
                      className={`option-cell ${patient.diabetes.hypoglycemiaRisk === 0 ? 'selected' : ''}`}
                      title="Low"
                      onClick={() => handleOptionClick('hypoglycemiaRisk', 0)}
                    >
                      <div className="option-marker"></div>
                    </td>
                    <td 
                      className={`option-cell ${patient.diabetes.hypoglycemiaRisk === 1 ? 'selected' : ''}`}
                      title="Low-Medium"
                      onClick={() => handleOptionClick('hypoglycemiaRisk', 1)}
                    >
                      <div className="option-marker"></div>
                    </td>
                    <td 
                      className={`option-cell ${patient.diabetes.hypoglycemiaRisk === 2 ? 'selected' : ''}`}
                      title="Medium"
                      onClick={() => handleOptionClick('hypoglycemiaRisk', 2)}
                    >
                      <div className="option-marker"></div>
                    </td>
                    <td 
                      className={`option-cell ${patient.diabetes.hypoglycemiaRisk === 3 ? 'selected' : ''}`}
                      title="Medium-High"
                      onClick={() => handleOptionClick('hypoglycemiaRisk', 3)}
                    >
                      <div className="option-marker"></div>
                    </td>
                    <td 
                      className={`option-cell ${patient.diabetes.hypoglycemiaRisk === 4 ? 'selected' : ''}`}
                      title="High"
                      onClick={() => handleOptionClick('hypoglycemiaRisk', 4)}
                    >
                      <div className="option-marker"></div>
                    </td>
                  </tr>
                  <tr>
                    <td>Disease Duration</td>
                    <td 
                      className={`option-cell ${patient.diabetes.diseaseDuration === 0 ? 'selected' : ''}`}
                      title="Newly diagnosed"
                      onClick={() => handleOptionClick('diseaseDuration', 0)}
                    >
                      <div className="option-marker"></div>
                    </td>
                    <td 
                      className={`option-cell ${patient.diabetes.diseaseDuration === 1 ? 'selected' : ''}`}
                      title="Short duration (1-5 years)"
                      onClick={() => handleOptionClick('diseaseDuration', 1)}
                    >
                      <div className="option-marker"></div>
                    </td>
                    <td 
                      className={`option-cell ${patient.diabetes.diseaseDuration === 2 ? 'selected' : ''}`}
                      title="Moderate duration (5-10 years)"
                      onClick={() => handleOptionClick('diseaseDuration', 2)}
                    >
                      <div className="option-marker"></div>
                    </td>
                    <td 
                      className={`option-cell ${patient.diabetes.diseaseDuration === 3 ? 'selected' : ''}`}
                      title="Extended duration (10-15 years)"
                      onClick={() => handleOptionClick('diseaseDuration', 3)}
                    >
                      <div className="option-marker"></div>
                    </td>
                    <td 
                      className={`option-cell ${patient.diabetes.diseaseDuration === 4 ? 'selected' : ''}`}
                      title="Long-standing (>15 years)"
                      onClick={() => handleOptionClick('diseaseDuration', 4)}
                    >
                      <div className="option-marker"></div>
                    </td>
                  </tr>
                  <tr>
                    <td>Life Expectancy</td>
                    <td 
                      className={`option-cell ${patient.diabetes.lifeExpectancy === 0 ? 'selected' : ''}`}
                      title="Very Long"
                      onClick={() => handleOptionClick('lifeExpectancy', 0)}
                    >
                      <div className="option-marker"></div>
                    </td>
                    <td 
                      className={`option-cell ${patient.diabetes.lifeExpectancy === 1 ? 'selected' : ''}`}
                      title="Long"
                      onClick={() => handleOptionClick('lifeExpectancy', 1)}
                    >
                      <div className="option-marker"></div>
                    </td>
                    <td 
                      className={`option-cell ${patient.diabetes.lifeExpectancy === 2 ? 'selected' : ''}`}
                      title="Moderate"
                      onClick={() => handleOptionClick('lifeExpectancy', 2)}
                    >
                      <div className="option-marker"></div>
                    </td>
                    <td 
                      className={`option-cell ${patient.diabetes.lifeExpectancy === 3 ? 'selected' : ''}`}
                      title="Limited"
                      onClick={() => handleOptionClick('lifeExpectancy', 3)}
                    >
                      <div className="option-marker"></div>
                    </td>
                    <td 
                      className={`option-cell ${patient.diabetes.lifeExpectancy === 4 ? 'selected' : ''}`}
                      title="Short"
                      onClick={() => handleOptionClick('lifeExpectancy', 4)}
                    >
                      <div className="option-marker"></div>
                    </td>
                  </tr>
                  <tr>
                    <td>Important Comorbidities</td>
                    <td 
                      className={`option-cell ${patient.diabetes.importantComorbidities === 0 ? 'selected' : ''}`}
                      title="Absent"
                      onClick={() => handleOptionClick('comorbidities', 0)}
                    >
                      <div className="option-marker"></div>
                    </td>
                    <td 
                      className={`option-cell ${patient.diabetes.importantComorbidities === 1 ? 'selected' : ''}`}
                      title="Minimal"
                      onClick={() => handleOptionClick('comorbidities', 1)}
                    >
                      <div className="option-marker"></div>
                    </td>
                    <td 
                      className={`option-cell ${patient.diabetes.importantComorbidities === 2 ? 'selected' : ''}`}
                      title="Mild"
                      onClick={() => handleOptionClick('comorbidities', 2)}
                    >
                      <div className="option-marker"></div>
                    </td>
                    <td 
                      className={`option-cell ${patient.diabetes.importantComorbidities === 3 ? 'selected' : ''}`}
                      title="Moderate"
                      onClick={() => handleOptionClick('comorbidities', 3)}
                    >
                      <div className="option-marker"></div>
                    </td>
                    <td 
                      className={`option-cell ${patient.diabetes.importantComorbidities === 4 ? 'selected' : ''}`}
                      title="Severe"
                      onClick={() => handleOptionClick('comorbidities', 4)}
                    >
                      <div className="option-marker"></div>
                    </td>
                  </tr>
                  <tr>
                    <td>Established Vascular Complications</td>
                    <td 
                      className={`option-cell ${patient.diabetes.vascularComplications === 0 ? 'selected' : ''}`}
                      title="None"
                      onClick={() => handleOptionClick('vascularComplications', 0)}
                    >
                      <div className="option-marker"></div>
                    </td>
                    <td 
                      className={`option-cell ${patient.diabetes.vascularComplications === 1 ? 'selected' : ''}`}
                      title="Minimal"
                      onClick={() => handleOptionClick('vascularComplications', 1)}
                    >
                      <div className="option-marker"></div>
                    </td>
                    <td 
                      className={`option-cell ${patient.diabetes.vascularComplications === 2 ? 'selected' : ''}`}
                      title="Mild"
                      onClick={() => handleOptionClick('vascularComplications', 2)}
                    >
                      <div className="option-marker"></div>
                    </td>
                    <td 
                      className={`option-cell ${patient.diabetes.vascularComplications === 3 ? 'selected' : ''}`}
                      title="Moderate"
                      onClick={() => handleOptionClick('vascularComplications', 3)}
                    >
                      <div className="option-marker"></div>
                    </td>
                    <td 
                      className={`option-cell ${patient.diabetes.vascularComplications === 4 ? 'selected' : ''}`}
                      title="Severe"
                      onClick={() => handleOptionClick('vascularComplications', 4)}
                    >
                      <div className="option-marker"></div>
                    </td>
                  </tr>
                  <tr>
                    <td>Patient Attitude</td>
                    <td 
                      className={`option-cell ${patient.diabetes.patientAttitude === 0 ? 'selected' : ''}`}
                      title="Highly motivated"
                      onClick={() => handleOptionClick('patientAttitude', 0)}
                    >
                      <div className="option-marker"></div>
                    </td>
                    <td 
                      className={`option-cell ${patient.diabetes.patientAttitude === 1 ? 'selected' : ''}`}
                      title="Very motivated"
                      onClick={() => handleOptionClick('patientAttitude', 1)}
                    >
                      <div className="option-marker"></div>
                    </td>
                    <td 
                      className={`option-cell ${patient.diabetes.patientAttitude === 2 ? 'selected' : ''}`}
                      title="Moderately motivated"
                      onClick={() => handleOptionClick('patientAttitude', 2)}
                    >
                      <div className="option-marker"></div>
                    </td>
                    <td 
                      className={`option-cell ${patient.diabetes.patientAttitude === 3 ? 'selected' : ''}`}
                      title="Somewhat motivated"
                      onClick={() => handleOptionClick('patientAttitude', 3)}
                    >
                      <div className="option-marker"></div>
                    </td>
                    <td 
                      className={`option-cell ${patient.diabetes.patientAttitude === 4 ? 'selected' : ''}`}
                      title="Less motivated"
                      onClick={() => handleOptionClick('patientAttitude', 4)}
                    >
                      <div className="option-marker"></div>
                    </td>
                  </tr>
                  <tr>
                    <td>Resources and Support System</td>
                    <td 
                      className={`option-cell ${patient.diabetes.resourcesSupport === 0 ? 'selected' : ''}`}
                      title="Readily available"
                      onClick={() => handleOptionClick('resourcesSupport', 0)}
                    >
                      <div className="option-marker"></div>
                    </td>
                    <td 
                      className={`option-cell ${patient.diabetes.resourcesSupport === 1 ? 'selected' : ''}`}
                      title="Available"
                      onClick={() => handleOptionClick('resourcesSupport', 1)}
                    >
                      <div className="option-marker"></div>
                    </td>
                    <td 
                      className={`option-cell ${patient.diabetes.resourcesSupport === 2 ? 'selected' : ''}`}
                      title="Moderate"
                      onClick={() => handleOptionClick('resourcesSupport', 2)}
                    >
                      <div className="option-marker"></div>
                    </td>
                    <td 
                      className={`option-cell ${patient.diabetes.resourcesSupport === 3 ? 'selected' : ''}`}
                      title="Restricted"
                      onClick={() => handleOptionClick('resourcesSupport', 3)}
                    >
                      <div className="option-marker"></div>
                    </td>
                    <td 
                      className={`option-cell ${patient.diabetes.resourcesSupport === 4 ? 'selected' : ''}`}
                      title="Limited"
                      onClick={() => handleOptionClick('resourcesSupport', 4)}
                    >
                      <div className="option-marker"></div>
                    </td>
                  </tr>
                </tbody>
              </table>

              <div className="target-calculation">
              <button 
                onClick={() => {
                  if (savePatientToSession()) {
                    navigate(`/hba1c-steps/${patient.id}`);
                  } else {
                    alert("Could not save patient data. Please try again.");
                  }
                }} 
                className="calculate-button"
              >
                Calculate HbA1c Target
              </button>
              
              {hba1cTarget && (
                  <div className="target-result">
                  <h3>Recommended HbA1c Target</h3>
                  <div className="target-value">{hba1cTarget}%</div>
                  <p className="target-note">
                      Based on patient's specific characteristics and risk factors
                  </p>
                  </div>
              )}
              </div>

              <div className="scale-legend">
                <div className="scale-item">
                  <span className="scale-label">Risks of Hypoglycemia:</span>
                  <span className="scale-value">
                    <span>
                      {mapRiskLevel(patient.diabetes.hypoglycemiaRisk)}
                    </span>
                  </span>
                </div>
                <div className="scale-item">
                  <span className="scale-label">Disease Duration:</span>
                  <span className="scale-value">
                    <span className="current-value">
                      {mapDurationLevel(patient.diabetes.diseaseDuration)}
                    </span>
                  </span>
                </div>
                <div className="scale-item">
                  <span className="scale-label">Life Expectancy:</span>
                  <span className="scale-value">
                    <span className="current-value">
                      {mapLifeExpectancy(patient.diabetes.lifeExpectancy)}
                    </span>
                  </span>
                </div>
                <div className="scale-item">
                  <span className="scale-label">Important Comorbidities:</span>
                  <span className="scale-value">
                    <span className="current-value">
                      {mapComorbidities(patient.diabetes.importantComorbidities)}
                    </span>
                  </span>
                </div>
                <div className="scale-item">
                  <span className="scale-label">Vascular Complications:</span>
                  <span className="scale-value">
                    <span className="current-value">
                      {mapVascularComplications(patient.diabetes.vascularComplications)}
                    </span>
                  </span>
                </div>
                <div className="scale-item">
                  <span className="scale-label">Patient Attitude:</span>
                  <span className="scale-value">
                    <span className="current-value">
                      {mapPatientAttitude(patient.diabetes.patientAttitude)}
                    </span>
                  </span>
                </div>
                <div className="scale-item">
                  <span className="scale-label">Resources and Support:</span>
                  <span className="scale-value">
                    <span className="current-value">
                      {mapResourcesSupport(patient.diabetes.resourcesSupport)}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="patient-history-section">
              {/* Adverse Reactions */}
              <div className="history-section">
                <h3>Adverse Drug Reactions</h3>
                <div className="drug-list">
                  {patient.adverseReactions.map((reaction, index) => (
                    <div key={index} className="drug-item">
                      {reaction.drug}
                    </div>
                  ))}
                  {patient.adverseReactions.length === 0 && (
                    <div className="no-data-message">No adverse drug reactions recorded</div>
                  )}
                </div>
              </div>
              
              {/* Medical History */}
              <div className="history-section">
                <h3>Medical History</h3>
                <div className="medical-history-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Category</th>
                        <th>Condition</th>
                      </tr>
                    </thead>
                    <tbody>
                      {patient.medicalHistory.map((item, index) => (
                        <tr key={index}>
                          <td>{item.category}</td>
                          <td>{item.condition}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {patient.medicalHistory.length === 0 && (
                    <div className="no-data-message">No medical history recorded</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="action-buttons">
        <button className="treatment-button" onClick={() => navigate(`/treatment/${patient.id}`)}>
          Treatment Guidelines
        </button>
        <button className="report-button" onClick={() => window.print()}>
          Print Report
        </button>
      </div>
    </div>
  );
};

export default PatientDetail;