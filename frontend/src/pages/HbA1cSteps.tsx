import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { calculateHbA1cTarget, FuzzyRule } from '../utils/fuzzyLogic';
import '../styles/HbA1cSteps.css';

interface Patient {
  id: string;
  name: string;
  age: number;
  diabetesType: string;
  diseaseDuration: number;
  hba1cLevel: number;
  hypoglycemiaRisk: string;
  lifeExpectancy: string;
  importantComorbidities: string;
  establishedVascularComplications: string;
  patientAttitude: string;
  resourcesSupport: string;
}

const HbA1cSteps = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [hba1cTarget, setHba1cTarget] = useState<number | null>(null);
  const [activeRules, setActiveRules] = useState<{ rule: FuzzyRule, activation: number }[]>([]);
  const [showDetails, setShowDetails] = useState<boolean>(false);
  
  useEffect(() => {
    const fetchPatient = async () => {
      try {
        setLoading(true);
        // TODO: Replace with actual API endpoint
        const response = await fetch(`http://localhost:5000/api/patients/${id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch patient details');
        }
        
        const data = await response.json();
        setPatient(data);
        setLoading(false);
      } catch (err) {
        setError('Error fetching patient data. Please try again later.');
        setLoading(false);
        console.error('Error fetching patient:', err);
      }
    };

    // Use mock data for development
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
        resourcesSupport: 'Available',
      };
      setPatient(mockPatient);
      setLoading(false);
    } else {
      fetchPatient();
    }
  }, [id]);
  
  useEffect(() => {
    // Tính toán HbA1c target khi patient data sẵn sàng
    if (patient) {
      const result = calculateHbA1cTarget(
        patient.hypoglycemiaRisk,
        patient.diseaseDuration,
        patient.lifeExpectancy,
        patient.importantComorbidities,
        patient.establishedVascularComplications,
        patient.patientAttitude
      );
      
      setHba1cTarget(result.target);
      // Lấy các luật có mức độ kích hoạt > 0 và sắp xếp theo mức độ kích hoạt giảm dần
      const significantRules = result.ruleActivations
        .filter(r => r.activation > 0.1)
        .sort((a, b) => b.activation - a.activation);
      
      setActiveRules(significantRules.slice(0, 5)); // Lấy tối đa 5 luật quan trọng nhất
    }
  }, [patient]);
  
  const getTargetClass = (target: number): string => {
    if (target <= 6.5) return 'target-strict';
    if (target <= 7.0) return 'target-standard';
    if (target <= 7.5) return 'target-relaxed';
    return 'target-very-relaxed';
  };
  
  const getTargetDescription = (target: number): string => {
    if (target <= 6.5) return 'Strict control (≤6.5%)';
    if (target <= 7.0) return 'Standard control (≤7.0%)';
    if (target <= 7.5) return 'Relaxed control (≤7.5%)';
    return 'Very relaxed control (>7.5%)';
  };
  
  if (loading) {
    return <div className="loading-state">Loading patient data...</div>;
  }
  
  if (error || !patient) {
    return <div className="error-state">{error || 'Patient not found.'}</div>;
  }
  
  return (
    <div className="hba1c-steps-container">
      <header className="hba1c-header">
        <button 
          className="back-button"
          onClick={() => navigate(`/patients/${id}`)}
        >
          Back to Patient
        </button>
        <h1>HbA1c Target Calculation</h1>
      </header>
      
      <div className="patient-summary-card">
        <div className="patient-info">
          <h2>{patient.name}</h2>
          <span className="patient-id">ID: {patient.id}</span>
        </div>
        <div className="patient-metrics">
          <div className="metric-item">
            <span className="metric-label">Age:</span>
            <span className="metric-value">{patient.age}</span>
          </div>
          <div className="metric-item">
            <span className="metric-label">Type:</span>
            <span className="metric-value">{patient.diabetesType}</span>
          </div>
          <div className="metric-item">
            <span className="metric-label">Current HbA1c:</span>
            <span className="metric-value">{patient.hba1cLevel}%</span>
          </div>
        </div>
      </div>
      
      <div className="calculation-section">
        <h2>Fuzzy Logic HbA1c Target Calculation</h2>
        
        <div className="input-factors">
          <h3>Patient Factors Considered:</h3>
          <div className="factors-grid">
            <div className="factor-item">
              <span className="factor-label">Hypoglycemia Risk:</span>
              <span className="factor-value">{patient.hypoglycemiaRisk}</span>
            </div>
            <div className="factor-item">
              <span className="factor-label">Disease Duration:</span>
              <span className="factor-value">{patient.diseaseDuration} years</span>
            </div>
            <div className="factor-item">
              <span className="factor-label">Life Expectancy:</span>
              <span className="factor-value">{patient.lifeExpectancy}</span>
            </div>
            <div className="factor-item">
              <span className="factor-label">Comorbidities:</span>
              <span className="factor-value">{patient.importantComorbidities}</span>
            </div>
            <div className="factor-item">
              <span className="factor-label">Vascular Complications:</span>
              <span className="factor-value">{patient.establishedVascularComplications}</span>
            </div>
            <div className="factor-item">
              <span className="factor-label">Patient Attitude:</span>
              <span className="factor-value">{patient.patientAttitude}</span>
            </div>
          </div>
        </div>
        
        <div className="result-section">
          <h3>Calculated Target HbA1c</h3>
          
          <div className="target-result">
            <div className={`target-value ${hba1cTarget ? getTargetClass(hba1cTarget) : ''}`}>
              {hba1cTarget !== null ? `${hba1cTarget}%` : 'Calculating...'}
            </div>
            <div className="target-description">
              {hba1cTarget !== null ? getTargetDescription(hba1cTarget) : ''}
            </div>
          </div>
          
          <button 
            className="toggle-details-button"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? 'Hide Details' : 'Show Calculation Details'}
          </button>
          
          {showDetails && activeRules.length > 0 && (
            <div className="calculation-details">
              <h4>Key Fuzzy Rules Applied:</h4>
              <ul className="rules-list">
                {activeRules.map((ruleData, index) => {
                  const { rule, activation } = ruleData;
                  const inputFactors = Object.entries(rule.inputs)
                    .map(([key, value]) => {
                      const readableKey = key.replace(/([A-Z])/g, ' $1').toLowerCase();
                      return `${readableKey}: ${value}`;
                    })
                    .join(', ');
                  
                  return (
                    <li key={index} className="rule-item">
                      <div className="rule-content">
                        <span className="rule-strength" style={{ width: `${Math.min(100, activation * 100)}%` }}></span>
                        <div className="rule-text">
                          <span className="rule-if">IF</span> {inputFactors} <span className="rule-then">THEN</span> {rule.output}
                        </div>
                      </div>
                      <div className="rule-activation">
                        Strength: {Math.round(activation * 100)}%
                      </div>
                    </li>
                  );
                })}
              </ul>
              
              <div className="methodology-note">
                <h4>About Fuzzy Logic Methodology:</h4>
                <p>
                  This calculation uses fuzzy logic to consider multiple patient characteristics simultaneously.
                  Each patient factor (e.g., hypoglycemia risk, comorbidities) is converted into fuzzy sets,
                  and rules are applied to determine the appropriate HbA1c target range. The final target
                  is calculated using a center-of-gravity defuzzification method, which balances all
                  applicable rules based on their activation strength.
                </p>
              </div>
            </div>
          )}
        </div>
        
        <div className="recommendation-section">
          <h3>Clinical Recommendations</h3>
          
          <div className="recommendation-card">
            <p>
              Based on the calculated target of <strong>{hba1cTarget}%</strong>, the following guidelines are recommended:
            </p>
            
            <ul className="recommendations-list">
              {hba1cTarget !== null && hba1cTarget <= 6.5 && (
                <>
                  <li>Consider more stringent glucose monitoring</li>
                  <li>Emphasize lifestyle modifications and medication adherence</li>
                  <li>Schedule more frequent follow-up appointments (every 3 months)</li>
                  <li>Consider combination therapy if not at target</li>
                </>
              )}
              
              {hba1cTarget !== null && hba1cTarget > 6.5 && hba1cTarget <= 7.0 && (
                <>
                  <li>Maintain standard monitoring schedule</li>
                  <li>Review medication regimen every 3-6 months</li>
                  <li>Consider moderate lifestyle interventions</li>
                  <li>Balance glycemic control with hypoglycemia avoidance</li>
                </>
              )}
              
              {hba1cTarget !== null && hba1cTarget > 7.0 && hba1cTarget <= 8.0 && (
                <>
                  <li>Focus on preventing hypoglycemia and symptom control</li>
                  <li>Simplify medication regimen if appropriate</li>
                  <li>Emphasize safer glucose targets</li>
                  <li>Monitor for signs of complications regularly</li>
                </>
              )}
              
              {hba1cTarget !== null && hba1cTarget > 8.0 && (
                <>
                  <li>Prioritize safety and quality of life</li>
                  <li>Use simplified medication regimens</li>
                  <li>Focus on preventing acute complications</li>
                  <li>Consider geriatric assessment if appropriate</li>
                </>
              )}
            </ul>
            
            <div className="gap-difference">
              <h4>Gap Analysis:</h4>
              <p>
                Current HbA1c: <strong>{patient.hba1cLevel}%</strong><br />
                Target HbA1c: <strong>{hba1cTarget}%</strong><br />
                Difference: <strong className={patient.hba1cLevel > (hba1cTarget || 7) ? 'gap-negative' : 'gap-positive'}>
                  {hba1cTarget !== null ? Math.abs(patient.hba1cLevel - hba1cTarget).toFixed(1) : '?'}%
                  {hba1cTarget !== null && patient.hba1cLevel > hba1cTarget ? ' above target' : ' below target'}
                </strong>
              </p>
            </div>
          </div>
        </div>
        
        <div className="action-buttons">
          <button 
            className="print-button"
            onClick={() => window.print()}
          >
            Print Report
          </button>
          <button 
            className="treatment-button"
            onClick={() => navigate('/treatment-guideline')}
          >
            View Treatment Guidelines
          </button>
        </div>
      </div>
    </div>
  );
};

export default HbA1cSteps;