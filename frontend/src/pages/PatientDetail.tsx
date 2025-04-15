import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/PatientDetail.css';

interface Patient {
    id: string;
    name: string;
    age: number;
    diabetesType: string;
    diseaseDuration: string;
    hba1cLevel: number;
    hypoglycemiaRisk: string;
    avatar?: string;
    lifeExpectancy: string;
    importantComorbidities: string;
    establishedVascularComplications: string;
    patientAttitude: string;
    resourcesSupport: string;
    giSx: string[];
    cvd: string[];
    renalGu: string[];
    others: string[];
    hypo: string[];
    weight: string[];
    bone: string[];
    chf: string[];
    adrs: string[];
}

const PatientDetail = () => {
  const { id } = useParams<{ id: string }>(); // Lấy ID từ URL
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('basic');
  // Thêm state để lưu kết quả tính toán HbA1c
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
  
  // Hàm xử lý khi checkbox được click
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
    
    const updatedPatient = { ...patient };
    
    switch (factor) {
      case 'hypoglycemiaRisk':
        updatedPatient.hypoglycemiaRisk = value === 0 ? 'Low' : 
                                         value === 1 ? 'Low-Medium' :
                                         value === 2 ? 'Medium' :
                                         value === 3 ? 'Medium-High' : 'High';
        break;
      case 'diseaseDuration':
        updatedPatient.diseaseDuration = value === 0 ? 'Newly diagnosed' :
                                         value === 1 ? 'Short duration (1-5 years)' :
                                         value === 2 ? 'Moderate duration (5-10 years)' :
                                         value === 3 ? 'Extended duration (10-15 years)' : 'Long-standing (>15 years)';
        break;
      case 'lifeExpectancy':
        updatedPatient.lifeExpectancy = value === 0 ? 'Very Long' :
                                       value === 1 ? 'Long' :
                                       value === 2 ? 'Moderate' :
                                       value === 3 ? 'Limited' : 'Short';
        break;
      case 'comorbidities':
        updatedPatient.importantComorbidities = value === 0 ? 'Absent' :
                                              value === 1 ? 'Minimal' :
                                              value === 2 ? 'Mild' :
                                              value === 3 ? 'Moderate' : 'Severe';
        break;
      case 'vascularComplications':
        updatedPatient.establishedVascularComplications = value === 0 ? 'None' :
                                                        value === 1 ? 'Minimal' :
                                                        value === 2 ? 'Mild' :
                                                        value === 3 ? 'Moderate' : 'Severe';
        break;
      case 'patientAttitude':
        updatedPatient.patientAttitude = value === 0 ? 'Highly motivated' :
                                        value === 1 ? 'Very motivated' :
                                        value === 2 ? 'Moderately motivated' :
                                        value === 3 ? 'Somewhat motivated' : 'Less motivated';
        break;
      case 'resourcesSupport':
        updatedPatient.resourcesSupport = value === 0 ? 'Readily available' :
                                         value === 1 ? 'Available' :
                                         value === 2 ? 'Moderate' :
                                         value === 3 ? 'Restricted' : 'Limited';
        break;
    }
    
    // setPatient(updatedPatient);
    setPatient(updatedPatient as Patient);
  };

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        setLoading(true);
        // TODO: Thay thế bằng API endpoint thực tế
        const response = await fetch(`http://localhost:5000/api/patients/${id}`);

        if (!response.ok) {
          throw new Error('Failed to fetch patient details');
        }

        const data = await response.json();
        setPatient(data);
        setLoading(false);
      } catch (err) {
        setError('Error fetching patient details. Please try again later.');
        setLoading(false);
        console.error('Error fetching patient:', err);
      }
    };

    // Dùng mock data cho mục đích demo
    if (process.env.NODE_ENV === 'development') {
      const mockPatient: Patient = {
        id: 'PT001',
        name: 'John Smith',
        age: 56,
        diabetesType: 'Type 2',
        diseaseDuration: 'Newly diagnosed',
        hba1cLevel: 7.2,
        hypoglycemiaRisk: 'Low',
        lifeExpectancy: 'Long',
        importantComorbidities: 'Mild',
        establishedVascularComplications: 'None',
        patientAttitude: 'Highly motivated',
        resourcesSupport: 'Readily available',
        giSx: ['Gastrointestinal', 'Acute pancreatitis', 'Vitamin B12 deficiency'],
        chf: ['Edaema', 'Heart failure', 'Heart failure hospitalizations'],
        cvd: ['Blunts myocardial ischemic preconditioning', 'Increase Heart rate', 'Increase LDL-C', 'MI', 'Volume depletion/hypotension/dizziness', 'Contraindications hyproxia', 'Contraindications dehydration'],
        renalGu: ['Increase Cr:  transient', 'Lactic acidosis risk: rare', 'Contraindications CKD', 'Contraindications acidosis', 'Genitourinary infections', 'Polyuria'],
        others: ['Low durability', 'Agioedema/urticaria', 'C-cell hyperplasia/medullary thyroid tumors', 'Injectable', 'Training requirements', 'Mitogenic effects', 'Patient reluctance about injection'],
        hypo: ['Hypoglycemia'],
        weight: ['Weight gain'],
        bone: ['Bone fractures'],
        adrs: ['Biguanides (MET)', 'Sulfonylureas (SU)', 'TZDs', 'DPP-4', 'SGLT2', 'GLP-1', 'Insulins'],
      };
      setPatient(mockPatient);
      setLoading(false);
    } else {
      fetchPatient();
    }
  }, [id]);

  useEffect(() => {
    // Tải dữ liệu bệnh nhân và thiết lập state ban đầu
    if (patient) {
      // Tạo đối tượng theo dõi checkbox
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
      
      // Nếu muốn một số mục được chọn sẵn, bạn có thể thêm logic ở đây
      // Ví dụ:
      // patient.giSx.forEach(item => {
      //   initialCheckedItems.giSx[item] = true;
      // });
      
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
      // Tạo đối tượng chứa dữ liệu cần thiết cho tính toán HbA1c
      const patientFactorsData = {
        id: patient.id,
        name: patient.name,
        age: patient.age,
        diabetesType: patient.diabetesType,
        diseaseDuration: patient.diseaseDuration,
        hba1cLevel: patient.hba1cLevel,
        hypoglycemiaRisk: patient.hypoglycemiaRisk,
        lifeExpectancy: patient.lifeExpectancy,
        importantComorbidities: patient.importantComorbidities,
        establishedVascularComplications: patient.establishedVascularComplications,
        patientAttitude: patient.patientAttitude,
        resourcesSupport: patient.resourcesSupport,
        // Thêm thời gian lưu để có thể kiểm tra tính mới của dữ liệu sau này nếu cần
        timestamp: new Date().getTime()
      };
  
      // Lưu vào sessionStorage (dữ liệu chỉ tồn tại trong phiên làm việc hiện tại)
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
        <h1>Patient Details: {patient.name}</h1>
        <div className="header-actions">
          <button className="back-button" onClick={() => navigate('/patient-list')}>
            Back to Patient List
          </button>
        </div>
      </div>

      <div className="patient-card">
        <div className="patient-summary">
          <div className="patient-id-name">
            <h2>{patient.name}</h2>
            <span className="patient-id">ID: {patient.id}</span>
          </div>
          <div className="patient-key-metrics">
            <div className="metric">
              <span className="metric-label">Age:</span>
              <span className="metric-value">{patient.age}</span>
            </div>
            <div className="metric">
              <span className="metric-label">Type:</span>
              <span className="metric-value">{patient.diabetesType}</span>
            </div>
            <div className="metric">
              <span className="metric-label">HbA1c:</span>
              <span className="metric-value">{patient.hba1cLevel}%</span>
            </div>
            <div className="metric">
              <span className="metric-label">Risk:</span>
              <span className={`risk-badge ${getRiskClass(patient.hypoglycemiaRisk)}`}>{patient.hypoglycemiaRisk}</span>
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
                  <span>{patient.name}</span>
                </div>
                <div className="info-item">
                  <label>Age:</label>
                  <span>{patient.age}</span>
                </div>
                <div className="info-item">
                  <label>Type of Diabetes:</label>
                  <span>{patient.diabetesType}</span>
                </div>
                <div className="info-item">
                  <label>Disease Duration:</label>
                  <span>{patient.diseaseDuration} years</span>
                </div>
                <div className="info-item">
                  <label>HbA1c Level:</label>
                  <span>{patient.hba1cLevel}%</span>
                </div>
                <div className="info-item">
                  <label>Risk of Hypoglycemia:</label>
                  {/* <span className={`risk-badge ${getRiskClass(patient.hypoglycemiaRisk)}`}> */}
                  <span>
                    {patient.hypoglycemiaRisk}
                  </span>
                </div>
                <div className="info-item">
                  <label>Life Expectancy:</label>
                  <span>{patient.lifeExpectancy}</span>
                </div>
                <div className="info-item">
                  <label>Important Comorbidities:</label>
                  <span>{patient.importantComorbidities}</span>
                </div>
                <div className="info-item">
                  <label>Vascular Complications:</label>
                  <span>{patient.establishedVascularComplications}</span>
                </div>
                <div className="info-item">
                  <label>Patient Attitude:</label>
                  <span>{patient.patientAttitude}</span>
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
                      className={`option-cell ${patient.hypoglycemiaRisk === 'Low' ? 'selected' : ''}`}
                      title="Low"
                      onClick={() => handleOptionClick('hypoglycemiaRisk', 0)}
                    >
                      <div className="option-marker"></div>
                    </td>
                    <td 
                      className={`option-cell ${patient.hypoglycemiaRisk === 'Low-Medium' ? 'selected' : ''}`}
                      title="Low-Medium"
                      onClick={() => handleOptionClick('hypoglycemiaRisk', 1)}
                    >
                      <div className="option-marker"></div>
                    </td>
                    <td 
                      className={`option-cell ${patient.hypoglycemiaRisk === 'Medium' ? 'selected' : ''}`}
                      title="Medium"
                      onClick={() => handleOptionClick('hypoglycemiaRisk', 2)}
                    >
                      <div className="option-marker"></div>
                    </td>
                    <td 
                      className={`option-cell ${patient.hypoglycemiaRisk === 'Medium-High' ? 'selected' : ''}`}
                      title="Medium-High"
                      onClick={() => handleOptionClick('hypoglycemiaRisk', 3)}
                    >
                      <div className="option-marker"></div>
                    </td>
                    <td 
                      className={`option-cell ${patient.hypoglycemiaRisk === 'High' ? 'selected' : ''}`}
                      title="High"
                      onClick={() => handleOptionClick('hypoglycemiaRisk', 4)}
                    >
                      <div className="option-marker"></div>
                    </td>
                  </tr>
                  <tr>
                    <td>Disease Duration</td>
                    <td 
                      className={`option-cell ${patient.diseaseDuration === 'Newly diagnosed' ? 'selected' : ''}`}
                      title="Newly diagnosed"
                      onClick={() => handleOptionClick('diseaseDuration', 0)}
                    >
                      <div className="option-marker"></div>
                    </td>
                    <td 
                      className={`option-cell ${patient.diseaseDuration === 'Short duration (1-5 years)' ? 'selected' : ''}`}
                      title="Short duration (1-5 years)"
                      onClick={() => handleOptionClick('diseaseDuration', 1)}
                    >
                      <div className="option-marker"></div>
                    </td>
                    <td 
                      className={`option-cell ${patient.diseaseDuration === 'Moderate duration (5-10 years)' ? 'selected' : ''}`}
                      title="Moderate duration (5-10 years)"
                      onClick={() => handleOptionClick('diseaseDuration', 2)}
                    >
                      <div className="option-marker"></div>
                    </td>
                    <td 
                      className={`option-cell ${patient.diseaseDuration === 'Extended duration (10-15 years)' ? 'selected' : ''}`}
                      title="Extended duration (10-15 years)"
                      onClick={() => handleOptionClick('diseaseDuration', 3)}
                    >
                      <div className="option-marker"></div>
                    </td>
                    <td 
                      className={`option-cell ${patient.diseaseDuration === 'Long-standing (>15 years)' ? 'selected' : ''}`}
                      title="Long-standing (>15 years)"
                      onClick={() => handleOptionClick('diseaseDuration', 4)}
                    >
                      <div className="option-marker"></div>
                    </td>
                  </tr>
                  <tr>
                    <td>Life Expectancy</td>
                    <td 
                      className={`option-cell ${patient.lifeExpectancy === 'Very Long' ? 'selected' : ''}`}
                      title="Very Long"
                      onClick={() => handleOptionClick('lifeExpectancy', 0)}
                    >
                      <div className="option-marker"></div>
                    </td>
                    <td 
                      className={`option-cell ${patient.lifeExpectancy === 'Long' ? 'selected' : ''}`}
                      title="Long"
                      onClick={() => handleOptionClick('lifeExpectancy', 1)}
                    >
                      <div className="option-marker"></div>
                    </td>
                    <td 
                      className={`option-cell ${patient.lifeExpectancy === 'Moderate' ? 'selected' : ''}`}
                      title="Moderate"
                      onClick={() => handleOptionClick('lifeExpectancy', 2)}
                    >
                      <div className="option-marker"></div>
                    </td>
                    <td 
                      className={`option-cell ${patient.lifeExpectancy === 'Limited' ? 'selected' : ''}`}
                      title="Limited"
                      onClick={() => handleOptionClick('lifeExpectancy', 3)}
                    >
                      <div className="option-marker"></div>
                    </td>
                    <td 
                      className={`option-cell ${patient.lifeExpectancy === 'Short' ? 'selected' : ''}`}
                      title="Short"
                      onClick={() => handleOptionClick('lifeExpectancy', 4)}
                    >
                      <div className="option-marker"></div>
                    </td>
                  </tr>
                  <tr>
                    <td>Important Comorbidities</td>
                    <td 
                      className={`option-cell ${patient.importantComorbidities === 'Absent' ? 'selected' : ''}`}
                      title="Absent"
                      onClick={() => handleOptionClick('comorbidities', 0)}
                    >
                      <div className="option-marker"></div>
                    </td>
                    <td 
                      className={`option-cell ${patient.importantComorbidities === 'Minimal' ? 'selected' : ''}`}
                      title="Minimal"
                      onClick={() => handleOptionClick('comorbidities', 1)}
                    >
                      <div className="option-marker"></div>
                    </td>
                    <td 
                      className={`option-cell ${patient.importantComorbidities === 'Mild' ? 'selected' : ''}`}
                      title="Mild"
                      onClick={() => handleOptionClick('comorbidities', 2)}
                    >
                      <div className="option-marker"></div>
                    </td>
                    <td 
                      className={`option-cell ${patient.importantComorbidities === 'Moderate' ? 'selected' : ''}`}
                      title="Moderate"
                      onClick={() => handleOptionClick('comorbidities', 3)}
                    >
                      <div className="option-marker"></div>
                    </td>
                    <td 
                      className={`option-cell ${patient.importantComorbidities === 'Severe' ? 'selected' : ''}`}
                      title="Severe"
                      onClick={() => handleOptionClick('comorbidities', 4)}
                    >
                      <div className="option-marker"></div>
                    </td>
                  </tr>
                  <tr>
                    <td>Established Vascular Complications</td>
                    <td 
                      className={`option-cell ${patient.establishedVascularComplications === 'None' ? 'selected' : ''}`}
                      title="None"
                      onClick={() => handleOptionClick('vascularComplications', 0)}
                    >
                      <div className="option-marker"></div>
                    </td>
                    <td 
                      className={`option-cell ${patient.establishedVascularComplications === 'Minimal' ? 'selected' : ''}`}
                      title="Minimal"
                      onClick={() => handleOptionClick('vascularComplications', 1)}
                    >
                      <div className="option-marker"></div>
                    </td>
                    <td 
                      className={`option-cell ${patient.establishedVascularComplications === 'Mild' ? 'selected' : ''}`}
                      title="Mild"
                      onClick={() => handleOptionClick('vascularComplications', 2)}
                    >
                      <div className="option-marker"></div>
                    </td>
                    <td 
                      className={`option-cell ${patient.establishedVascularComplications === 'Moderate' ? 'selected' : ''}`}
                      title="Moderate"
                      onClick={() => handleOptionClick('vascularComplications', 3)}
                    >
                      <div className="option-marker"></div>
                    </td>
                    <td 
                      className={`option-cell ${patient.establishedVascularComplications === 'Severe' ? 'selected' : ''}`}
                      title="Severe"
                      onClick={() => handleOptionClick('vascularComplications', 4)}
                    >
                      <div className="option-marker"></div>
                    </td>
                  </tr>
                  <tr>
                    <td>Patient Attitude</td>
                    <td 
                      className={`option-cell ${patient.patientAttitude === 'Highly motivated' ? 'selected' : ''}`}
                      title="Highly motivated"
                      onClick={() => handleOptionClick('patientAttitude', 0)}
                    >
                      <div className="option-marker"></div>
                    </td>
                    <td 
                      className={`option-cell ${patient.patientAttitude === 'Very motivated' ? 'selected' : ''}`}
                      title="Very motivated"
                      onClick={() => handleOptionClick('patientAttitude', 1)}
                    >
                      <div className="option-marker"></div>
                    </td>
                    <td 
                      className={`option-cell ${patient.patientAttitude === 'Moderately motivated' ? 'selected' : ''}`}
                      title="Moderately motivated"
                      onClick={() => handleOptionClick('patientAttitude', 2)}
                    >
                      <div className="option-marker"></div>
                    </td>
                    <td 
                      className={`option-cell ${patient.patientAttitude === 'Somewhat motivated' ? 'selected' : ''}`}
                      title="Somewhat motivated"
                      onClick={() => handleOptionClick('patientAttitude', 3)}
                    >
                      <div className="option-marker"></div>
                    </td>
                    <td 
                      className={`option-cell ${patient.patientAttitude === 'Less motivated' ? 'selected' : ''}`}
                      title="Less motivated"
                      onClick={() => handleOptionClick('patientAttitude', 4)}
                    >
                      <div className="option-marker"></div>
                    </td>
                  </tr>
                  <tr>
                    <td>Resources and Support System</td>
                    <td 
                      className={`option-cell ${patient.resourcesSupport === 'Readily available' ? 'selected' : ''}`}
                      title="Readily available"
                      onClick={() => handleOptionClick('resourcesSupport', 0)}
                    >
                      <div className="option-marker"></div>
                    </td>
                    <td 
                      className={`option-cell ${patient.resourcesSupport === 'Available' ? 'selected' : ''}`}
                      title="Available"
                      onClick={() => handleOptionClick('resourcesSupport', 1)}
                    >
                      <div className="option-marker"></div>
                    </td>
                    <td 
                      className={`option-cell ${patient.resourcesSupport === 'Moderate' ? 'selected' : ''}`}
                      title="Moderate"
                      onClick={() => handleOptionClick('resourcesSupport', 2)}
                    >
                      <div className="option-marker"></div>
                    </td>
                    <td 
                      className={`option-cell ${patient.resourcesSupport === 'Restricted' ? 'selected' : ''}`}
                      title="Restricted"
                      onClick={() => handleOptionClick('resourcesSupport', 3)}
                    >
                      <div className="option-marker"></div>
                    </td>
                    <td 
                      className={`option-cell ${patient.resourcesSupport === 'Limited' ? 'selected' : ''}`}
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
                    // Xử lý trường hợp lỗi
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
                    {/* <span className={`current-value ${getRiskClass(patient.hypoglycemiaRisk)}`}> */}
                    <span>
                      {patient.hypoglycemiaRisk}
                    </span>
                  </span>
                </div>
                <div className="scale-item">
                  <span className="scale-label">Disease Duration:</span>
                  <span className="scale-value">
                    <span className="current-value">
                      {patient.diseaseDuration}
                    </span>
                  </span>
                </div>
                <div className="scale-item">
                  <span className="scale-label">Life Expectancy:</span>
                  <span className="scale-value">
                    <span className="current-value">
                      {patient.lifeExpectancy}
                    </span>
                  </span>
                </div>
                <div className="scale-item">
                  <span className="scale-label">Important Comorbidities:</span>
                  <span className="scale-value">
                    <span className="current-value">
                      {patient.importantComorbidities}
                    </span>
                  </span>
                </div>
                <div className="scale-item">
                  <span className="scale-label">Vascular Complications:</span>
                  <span className="scale-value">
                    <span className="current-value">
                      {patient.establishedVascularComplications}
                    </span>
                  </span>
                </div>
                <div className="scale-item">
                  <span className="scale-label">Patient Attitude:</span>
                  <span className="scale-value">
                    <span className="current-value">
                      {patient.patientAttitude}
                    </span>
                  </span>
                </div>
                <div className="scale-item">
                  <span className="scale-label">Resources and Support:</span>
                  <span className="scale-value">
                    <span className="current-value">
                      {patient.resourcesSupport}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="patient-history-section">
              <div className="history-grid">
                
                <div className="history-item">
                  <h3>CVD</h3>
                  <div className="checkbox-list">
                    {patient.cvd.map((item, index) => (
                      <div key={index} className="checkbox-item">
                        <input
                          type="checkbox"
                          id={`cvd-${index}`}
                          checked={!!checkedItems.cvd[item]}
                          onChange={() => handleCheckboxChange('cvd', item)}
                        />
                        <label htmlFor={`cvd-${index}`}>{item}</label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="history-item">
                  <h3>Renal/GU</h3>
                  <div className="checkbox-list">
                    {patient.renalGu.map((item, index) => (
                      <div key={index} className="checkbox-item">
                        <input
                          type="checkbox"
                          id={`renalGu-${index}`}
                          checked={!!checkedItems.renalGu[item]}
                          onChange={() => handleCheckboxChange('renalGu', item)}
                        />
                        <label htmlFor={`renalGu-${index}`}>{item}</label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="history-item">
                  <h3>Others</h3>
                  <div className="checkbox-list">
                    {patient.others.map((item, index) => (
                      <div key={index} className="checkbox-item">
                        <input
                          type="checkbox"
                          id={`others-${index}`}
                          checked={!!checkedItems.others[item]}
                          onChange={() => handleCheckboxChange('others', item)}
                        />
                        <label htmlFor={`others-${index}`}>{item}</label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="history-item">
                  <h3>Hypo</h3>
                  <div className="checkbox-list">
                    {patient.hypo.map((item, index) => (
                      <div key={index} className="checkbox-item">
                        <input
                          type="checkbox"
                          id={`hypo-${index}`}
                          checked={!!checkedItems.hypo[item]}
                          onChange={() => handleCheckboxChange('hypo', item)}
                        />
                        <label htmlFor={`hypo-${index}`}>{item}</label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="history-item">
                  <h3>Weight</h3>
                  <div className="checkbox-list">
                    {patient.weight.map((item, index) => (
                      <div key={index} className="checkbox-item">
                        <input
                          type="checkbox"
                          id={`weight-${index}`}
                          checked={!!checkedItems.weight[item]}
                          onChange={() => handleCheckboxChange('weight', item)}
                        />
                        <label htmlFor={`weight-${index}`}>{item}</label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="history-item">
                  <h3>Bone</h3>
                  <div className="checkbox-list">
                    {patient.bone.map((item, index) => (
                      <div key={index} className="checkbox-item">
                        <input
                          type="checkbox"
                          id={`bone-${index}`}
                          checked={!!checkedItems.bone[item]}
                          onChange={() => handleCheckboxChange('bone', item)}
                        />
                        <label htmlFor={`bone-${index}`}>{item}</label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="history-item">
                  <h3>GI Sx</h3>
                  <div className="checkbox-list">
                    {patient.giSx.map((item, index) => (
                      <div key={index} className="checkbox-item">
                        <input
                          type="checkbox"
                          id={`giSx-${index}`}
                          checked={!!checkedItems.giSx[item]}
                          onChange={() => handleCheckboxChange('giSx', item)}
                        />
                        <label htmlFor={`giSx-${index}`}>{item}</label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="history-item">
                  <h3>CHF</h3>
                  <div className="checkbox-list">
                    {patient.chf.map((item, index) => (
                      <div key={index} className="checkbox-item">
                        <input
                          type="checkbox"
                          id={`chf-${index}`}
                          checked={!!checkedItems.bone[item]}
                          onChange={() => handleCheckboxChange('chf', item)}
                        />
                        <label htmlFor={`chf-${index}`}>{item}</label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="history-item history-item-wide">
                  <h3>Adverse Drug Reactions (ADRs)</h3>
                  <div className="checkbox-list drugs-list">
                    {patient.adrs.map((item, index) => (
                      <div key={index} className="checkbox-item drug-checkbox-item">
                        <input
                          type="checkbox"
                          id={`adrs-${index}`}
                          checked={!!checkedItems.adrs[item]}
                          onChange={() => handleCheckboxChange('adrs', item)}
                        />
                        <label htmlFor={`adrs-${index}`} className="drug-label">{item}</label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="history-actions">
                <button className="save-history-button">
                  Save Changes
                </button>
                <button className="reset-history-button" onClick={() => setCheckedItems({
                  giSx: {},
                  cvd: {},
                  renalGu: {},
                  others: {},
                  hypo: {},
                  weight: {},
                  bone: {},
                  adrs: {}
                })}>
                  Reset Selection
                </button>
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