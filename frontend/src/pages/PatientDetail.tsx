import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/PatientDetail.css';

interface Patient {
    id: string;
    name: string;
    age: number;
    diabetesType: string;
    diseaseDuration: number;
    hba1cLevel: number;
    hypoglycemiaRisk: string;
    avatar?: string;
    lifeExpectancy: string;
    importantComorbidities: string;
    establishedVascularComplications: string;
    patientAttitude: string;
    resourcesSupport: string; // Thêm trường mới này
    giSx: string[];
    cvd: string[];
    renalGu: string[];
    others: string[];
    hypo: string[];
    weight: string[];
    bone: string[];
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

// Thêm hàm tính toán HbA1c Target
const calculateHbA1cTarget = () => {
  // Khởi tạo giá trị HbA1c cơ sở là 7.0%
  let baseTarget = 7.0;
  
  // Điều chỉnh dựa trên các yếu tố rủi ro
  
  // Điều chỉnh dựa trên nguy cơ hạ đường huyết
  if (patient.hypoglycemiaRisk === 'Low') {
    baseTarget -= 0.5; // Mục tiêu nghiêm ngặt hơn khi nguy cơ thấp
  } else if (patient.hypoglycemiaRisk === 'High') {
    baseTarget += 0.5; // Mục tiêu nới lỏng hơn khi nguy cơ cao
  }
  
  // Điều chỉnh dựa trên tuổi tác và thời gian mắc bệnh
  if (patient.age > 65) {
    baseTarget += 0.5; // Mục tiêu nới lỏng hơn cho người cao tuổi
  }
  
  if (patient.diseaseDuration > 10) {
    baseTarget += 0.3; // Mục tiêu nới lỏng hơn cho bệnh lâu năm
  }
  
  // Điều chỉnh dựa trên biến chứng mạch máu
  if (patient.establishedVascularComplications === 'Severe') {
    baseTarget += 0.5; // Mục tiêu nới lỏng hơn khi có biến chứng nghiêm trọng
  }
  
  // Điều chỉnh dựa trên thái độ bệnh nhân
  if (patient.patientAttitude === 'Highly motivated') {
    baseTarget -= 0.3; // Mục tiêu nghiêm ngặt hơn cho bệnh nhân có động lực
  } else if (patient.patientAttitude === 'Less motivated') {
    baseTarget += 0.3; // Mục tiêu nới lỏng hơn cho bệnh nhân ít động lực
  }
  
  // Giới hạn kết quả trong khoảng an toàn
  baseTarget = Math.max(6.0, Math.min(8.5, baseTarget));
  
  // Làm tròn đến 1 chữ số thập phân
  baseTarget = Math.round(baseTarget * 10) / 10;
  
  // Cập nhật state
  setHba1cTarget(baseTarget.toFixed(1));
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
        diseaseDuration: 8,
        hba1cLevel: 7.2,
        hypoglycemiaRisk: 'Low',
        lifeExpectancy: 'Long',
        importantComorbidities: 'Mild',
        establishedVascularComplications: 'None',
        patientAttitude: 'Highly motivated',
        giSx: ['Gastrointestinal issues', 'Nausea', 'Vomiting'],
        cvd: ['Increase heart rate', 'Palpitations', 'Arrhythmia'],
        renalGu: ['Increase Cr transient', 'Reduced eGFR', 'Proteinuria'],
        others: ['Low durability', 'Fatigue', 'Weakness'],
        hypo: ['Hypoglycemia', 'Night sweats', 'Dizziness'],
        weight: ['Weight gain', 'BMI increase of 2+ points'],
        bone: ['Bone fractures', 'Osteoporosis risk'],
        adrs: ['Biguanides (MET)', 'Sulfonylureas (SU)', 'DPP4 inhibitors', 'GLP-1 RA', 'SGLT2 inhibitors'],
      };
      setPatient(mockPatient);
      setLoading(false);
    } else {
      fetchPatient();
    }
  }, [id]);

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
          >
            <div className="option-marker"></div>
          </td>
          <td 
            className={`option-cell ${patient.hypoglycemiaRisk === 'Low-Medium' ? 'selected' : ''}`}
            title="Low-Medium"
          >
            <div className="option-marker"></div>
          </td>
          <td 
            className={`option-cell ${patient.hypoglycemiaRisk === 'Medium' ? 'selected' : ''}`}
            title="Medium"
          >
            <div className="option-marker"></div>
          </td>
          <td 
            className={`option-cell ${patient.hypoglycemiaRisk === 'Medium-High' ? 'selected' : ''}`}
            title="Medium-High"
          >
            <div className="option-marker"></div>
          </td>
          <td 
            className={`option-cell ${patient.hypoglycemiaRisk === 'High' ? 'selected' : ''}`}
            title="High"
          >
            <div className="option-marker"></div>
          </td>
        </tr>
        <tr>
          <td>Disease Duration</td>
          <td 
            className={`option-cell ${patient.diseaseDuration <= 1 ? 'selected' : ''}`}
            title="Newly diagnosed"
          >
            <div className="option-marker"></div>
          </td>
          <td 
            className={`option-cell ${patient.diseaseDuration > 1 && patient.diseaseDuration <= 5 ? 'selected' : ''}`}
            title="Short duration (1-5 years)"
          >
            <div className="option-marker"></div>
          </td>
          <td 
            className={`option-cell ${patient.diseaseDuration > 5 && patient.diseaseDuration <= 10 ? 'selected' : ''}`}
            title="Moderate duration (5-10 years)"
          >
            <div className="option-marker"></div>
          </td>
          <td 
            className={`option-cell ${patient.diseaseDuration > 10 && patient.diseaseDuration <= 15 ? 'selected' : ''}`}
            title="Extended duration (10-15 years)"
          >
            <div className="option-marker"></div>
          </td>
          <td 
            className={`option-cell ${patient.diseaseDuration > 15 ? 'selected' : ''}`}
            title="Long-standing (>15 years)"
          >
            <div className="option-marker"></div>
          </td>
        </tr>
        <tr>
          <td>Life Expectancy</td>
          <td 
            className={`option-cell ${patient.lifeExpectancy === 'Very Long' ? 'selected' : ''}`}
            title="Very Long"
          >
            <div className="option-marker"></div>
          </td>
          <td 
            className={`option-cell ${patient.lifeExpectancy === 'Long' ? 'selected' : ''}`}
            title="Long"
          >
            <div className="option-marker"></div>
          </td>
          <td 
            className={`option-cell ${patient.lifeExpectancy === 'Moderate' ? 'selected' : ''}`}
            title="Moderate"
          >
            <div className="option-marker"></div>
          </td>
          <td 
            className={`option-cell ${patient.lifeExpectancy === 'Limited' ? 'selected' : ''}`}
            title="Limited"
          >
            <div className="option-marker"></div>
          </td>
          <td 
            className={`option-cell ${patient.lifeExpectancy === 'Short' ? 'selected' : ''}`}
            title="Short"
          >
            <div className="option-marker"></div>
          </td>
        </tr>
        <tr>
          <td>Important Comorbidities</td>
          <td 
            className={`option-cell ${patient.importantComorbidities === 'Absent' ? 'selected' : ''}`}
            title="Absent"
          >
            <div className="option-marker"></div>
          </td>
          <td 
            className={`option-cell ${patient.importantComorbidities === 'Minimal' ? 'selected' : ''}`}
            title="Minimal"
          >
            <div className="option-marker"></div>
          </td>
          <td 
            className={`option-cell ${patient.importantComorbidities === 'Mild' ? 'selected' : ''}`}
            title="Mild"
          >
            <div className="option-marker"></div>
          </td>
          <td 
            className={`option-cell ${patient.importantComorbidities === 'Moderate' ? 'selected' : ''}`}
            title="Moderate"
          >
            <div className="option-marker"></div>
          </td>
          <td 
            className={`option-cell ${patient.importantComorbidities === 'Severe' ? 'selected' : ''}`}
            title="Severe"
          >
            <div className="option-marker"></div>
          </td>
        </tr>
        <tr>
          <td>Established Vascular Complications</td>
          <td 
            className={`option-cell ${patient.establishedVascularComplications === 'None' ? 'selected' : ''}`}
            title="None"
          >
            <div className="option-marker"></div>
          </td>
          <td 
            className={`option-cell ${patient.establishedVascularComplications === 'Minimal' ? 'selected' : ''}`}
            title="Minimal"
          >
            <div className="option-marker"></div>
          </td>
          <td 
            className={`option-cell ${patient.establishedVascularComplications === 'Mild' ? 'selected' : ''}`}
            title="Mild"
          >
            <div className="option-marker"></div>
          </td>
          <td 
            className={`option-cell ${patient.establishedVascularComplications === 'Moderate' ? 'selected' : ''}`}
            title="Moderate"
          >
            <div className="option-marker"></div>
          </td>
          <td 
            className={`option-cell ${patient.establishedVascularComplications === 'Severe' ? 'selected' : ''}`}
            title="Severe"
          >
            <div className="option-marker"></div>
          </td>
        </tr>
        <tr>
          <td>Patient Attitude</td>
          <td 
            className={`option-cell ${patient.patientAttitude === 'Highly motivated' ? 'selected' : ''}`}
            title="Highly motivated"
          >
            <div className="option-marker"></div>
          </td>
          <td 
            className={`option-cell ${patient.patientAttitude === 'Very motivated' ? 'selected' : ''}`}
            title="Very motivated"
          >
            <div className="option-marker"></div>
          </td>
          <td 
            className={`option-cell ${patient.patientAttitude === 'Moderately motivated' ? 'selected' : ''}`}
            title="Moderately motivated"
          >
            <div className="option-marker"></div>
          </td>
          <td 
            className={`option-cell ${patient.patientAttitude === 'Somewhat motivated' ? 'selected' : ''}`}
            title="Somewhat motivated"
          >
            <div className="option-marker"></div>
          </td>
          <td 
            className={`option-cell ${patient.patientAttitude === 'Less motivated' ? 'selected' : ''}`}
            title="Less motivated"
          >
            <div className="option-marker"></div>
          </td>
        </tr>
        <tr>
          <td>Resources and Support System</td>
          <td 
            className={`option-cell ${patient.resourcesSupport === 'Readily available' ? 'selected' : ''}`}
            title="Readily available"
          >
            <div className="option-marker"></div>
          </td>
          <td 
            className={`option-cell ${patient.resourcesSupport === 'Available' ? 'selected' : ''}`}
            title="Available"
          >
            <div className="option-marker"></div>
          </td>
          <td 
            className={`option-cell ${patient.resourcesSupport === 'Moderate' ? 'selected' : ''}`}
            title="Moderate"
          >
            <div className="option-marker"></div>
          </td>
          <td 
            className={`option-cell ${patient.resourcesSupport === 'Restricted' ? 'selected' : ''}`}
            title="Restricted"
          >
            <div className="option-marker"></div>
          </td>
          <td 
            className={`option-cell ${patient.resourcesSupport === 'Limited' ? 'selected' : ''}`}
            title="Limited"
          >
            <div className="option-marker"></div>
          </td>
        </tr>
      </tbody>
    </table>

    <div className="target-calculation">
    <button 
        onClick={() => navigate(`/hba1c-steps/${patient.id}`)} 
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
        <span className="scale-value">Low → High</span>
      </div>
      <div className="scale-item">
        <span className="scale-label">Disease Duration:</span>
        <span className="scale-value">Newly diagnosed → Long-standing</span>
      </div>
      <div className="scale-item">
        <span className="scale-label">Life Expectancy:</span>
        <span className="scale-value">Long → Short</span>
      </div>
      <div className="scale-item">
        <span className="scale-label">Important Comorbidities:</span>
        <span className="scale-value">Absent → Severe</span>
      </div>
      <div className="scale-item">
        <span className="scale-label">Vascular Complications:</span>
        <span className="scale-value">Absent → Severe</span>
      </div>
      <div className="scale-item">
        <span className="scale-label">Patient Attitude:</span>
        <span className="scale-value">Highly motivated → Less motivated</span>
      </div>
      <div className="scale-item">
        <span className="scale-label">Resources and Support:</span>
        <span className="scale-value">Readily available → Limited</span>
      </div>
    </div>
  </div>
)}

          {activeTab === 'history' && (
            <div className="patient-history-section">
              <div className="history-grid">
                <div className="history-item">
                  <h3>GI Sx</h3>
                  <ul>
                    {patient.giSx.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="history-item">
                  <h3>CVD</h3>
                  <ul>
                    {patient.cvd.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="history-item">
                  <h3>Renal/GU</h3>
                  <ul>
                    {patient.renalGu.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="history-item">
                  <h3>Others</h3>
                  <ul>
                    {patient.others.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="history-item">
                  <h3>Hypo</h3>
                  <ul>
                    {patient.hypo.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="history-item">
                  <h3>Weight</h3>
                  <ul>
                    {patient.weight.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="history-item">
                  <h3>Bone</h3>
                  <ul>
                    {patient.bone.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="history-item history-item-wide">
                  <h3>Adverse Drug Reactions (ADRs)</h3>
                  <ul className="drug-list">
                    {patient.adrs.map((item, index) => (
                      <li key={index} className="drug-item">{item}</li>
                    ))}
                  </ul>
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