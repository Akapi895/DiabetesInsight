import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  calculateHbA1cTarget, 
  // FuzzyRule, 
  FuzzyCalculationResult, 
  FuzzifiedValue, 
  // RuleActivation 
} from '../utils/fuzzyLogic';
import '../styles/HbA1cSteps.css';
import Chart from 'chart.js/auto';
import annotationPlugin from 'chartjs-plugin-annotation';

// Register the annotation plugin
Chart.register(annotationPlugin);

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

type ActiveStep = 'summary' | 'fuzzification' | 'rules' | 'aggregation' | 'defuzzification';

const HbA1cSteps = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [calculationResult, setCalculationResult] = useState<FuzzyCalculationResult | null>(null);
  const [activeStep, setActiveStep] = useState<ActiveStep>('summary');
  const [updatingHbA1c, setUpdatingHbA1c] = useState<boolean>(false);

  const handleUpdateHbA1c = async () => {
    if (!patient || !calculationResult) return;
    
    try {
      setUpdatingHbA1c(true);
      
      const response = await fetch('http://127.0.0.1:8000/api/patients/update/hba1c', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patient_id: parseInt(patient.id),
          hba1c_level: calculationResult.hba1cTarget
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('HbA1c target updated successfully:', result);
      
      // Hiển thị thông báo thành công
      alert(`Đã cập nhật mục tiêu HbA1c thành ${calculationResult.hba1cTarget}% cho bệnh nhân ${patient.name}`);
      
      // Cập nhật sessionStorage với giá trị HbA1c mới
      const storedData = sessionStorage.getItem('diabetesInsight_patientFactors');
      if (storedData) {
        const patientData = JSON.parse(storedData);
        patientData.hba1cLevel = calculationResult.hba1cTarget;
        sessionStorage.setItem('diabetesInsight_patientFactors', JSON.stringify(patientData));
      }
      
      // Chuyển hướng về trang chi tiết bệnh nhân
      navigate(`/patients/${patient.id}`);
      
    } catch (error) {
      // console.error('Error updating HbA1c target:', error);
      alert('Có lỗi xảy ra khi cập nhật mục tiêu HbA1c. Vui lòng thử lại sau.');
    } finally {
      setUpdatingHbA1c(false);
    }
  };
  
  // Refs cho charts
  const fuzzificationChartRefs = useRef<{ [key: string]: HTMLCanvasElement | null }>({
    hypoglycemiaRisk: null,
    diseaseDuration: null,
    lifeExpectancy: null,
    comorbidities: null,
    vascularComplications: null,
    patientAttitude: null
  });
  const aggregationChartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstances = useRef<{ [key: string]: Chart | null }>({});

  const updatePatientT2dmData = async (patientData: Patient) => {
    try {
      console.log('Updating T2DM data for patient:', patientData.id);
      
      const response = await fetch('http://127.0.0.1:8000/api/patients/update/t2dm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: parseInt(patientData.id),  
          name: patientData.name,
          age: patientData.age,
          diabetesType: patientData.diabetesType,
          diseaseDuration: patientData.diseaseDuration,
          hba1cLevel: patientData.hba1cLevel,
          hypoglycemiaRisk: patientData.hypoglycemiaRisk,
          lifeExpectancy: patientData.lifeExpectancy,
          importantComorbidities: patientData.importantComorbidities,
          establishedVascularComplications: patientData.establishedVascularComplications,
          patientAttitude: patientData.patientAttitude,
          resourcesSupport: patientData.resourcesSupport,
          timestamp: new Date().getTime()
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('T2DM data updated successfully:', result);
      
    } catch (error) {
      setError('Failed to update T2DM data. Please try again later.');
      console.error('Failed to update T2DM data:', error);
    }
  };
  
  useEffect(() => {
    try {
      setLoading(true);
      const storedData = sessionStorage.getItem('diabetesInsight_patientFactors');
      
      if (storedData) {
        const patientData = JSON.parse(storedData);
        
        if (patientData.id == id) { 
          setPatient(patientData);
          setLoading(false);

          updatePatientT2dmData(patientData);
          return; 
        } else {
          console.log('Stored patient ID does not match current ID.');
        }
      } else {
        console.log('No patient data found in session storage.');
      }
      
      setLoading(false);
      alert('Không thể tải dữ liệu bệnh nhân để tính toán HbA1c. Vui lòng quay lại trang chi tiết bệnh nhân và thử lại.');
      
      navigate(`/patients/${id}`);
      
    } catch (error) {
      console.error('Error retrieving patient data from session storage:', error);
      setLoading(false);
      alert('Đã xảy ra lỗi khi tải dữ liệu bệnh nhân. Vui lòng quay lại trang chi tiết bệnh nhân và thử lại.');
      
      navigate(`/patients/${id}`);
    }
  }, [id, navigate]);
  
  // Tính toán HbA1c target khi patient data sẵn sàng
  useEffect(() => {
    if (patient) {
      const result = calculateHbA1cTarget(
        patient.hypoglycemiaRisk,
        patient.diseaseDuration,
        patient.lifeExpectancy,
        patient.importantComorbidities,
        patient.establishedVascularComplications,
        patient.patientAttitude,
        patient.resourcesSupport
      );
      
      setCalculationResult(result);
    }
  }, [patient]);
  
  // Vẽ biểu đồ mờ hóa khi thay đổi tab hoặc có dữ liệu mới
  useEffect(() => {
    if (activeStep === 'fuzzification' && calculationResult) {
      Object.keys(chartInstances.current).forEach(key => {
        if (chartInstances.current[key]) {
          chartInstances.current[key]!.destroy();
          chartInstances.current[key] = null;
        }
      });
      
      // Tạo biểu đồ mờ hóa cho từng đầu vào
      const createFuzzificationChart = (
        canvasRef: HTMLCanvasElement | null, 
        fuzzifiedValues: FuzzifiedValue[], 
        factorName: string,
        currentValue: number
      ) => {
        if (!canvasRef) return;
        
        const ctx = canvasRef.getContext('2d');
        if (!ctx) return;
        
        const datasets = fuzzifiedValues.map((fv, _) => {
          // Chọn màu dựa trên tên tập mờ
          let backgroundColor, borderColor;
  
  if (fv.setName.includes('Low') || 
      fv.setName.includes('Absent') || 
      fv.setName.includes('Long') ||
      fv.setName.includes('Newly-Diagnosed') ||
      fv.setName.includes('Highly_Motivated') || 
      fv.setName.includes('Readily-Available')) {
    backgroundColor = 'rgba(46, 204, 113, 0.2)';
    borderColor = 'rgba(46, 204, 113, 1)';
  } else if (fv.setName.includes('Few-Or-Mild')) {
    backgroundColor = 'rgba(241, 196, 15, 0.2)';
    borderColor = 'rgba(241, 196, 15, 1)'; 
  } else {
    // High, Severe, Long-Standing, Less_Motivated, Limited, Short
    backgroundColor = 'rgba(231, 76, 60, 0.2)';
    borderColor = 'rgba(231, 76, 60, 1)';
  }
          
          return {
            label: `${fv.setName} (${Math.round(fv.membershipDegree * 100)}%)`,
            data: fv.graphPoints ? fv.graphPoints.y.map((y, i) => ({x: fv.graphPoints!.x[i], y})) : [],
            borderColor,
            backgroundColor,
            borderWidth: 2,
            pointRadius: 0,
            fill: true
          };
        });
        
        // Thêm đường dọc chỉ giá trị hiện tại
        const annotation = {
          type: 'line' as const,
          xMin: currentValue,
          xMax: currentValue,
          scaleID: 'x',
          borderColor: 'rgba(52, 152, 219, 1)',
          borderWidth: 2,
          label: {
            content: `Patient Value: ${currentValue}`, 
            display: true,
            position: 'start' as const // top
          }
        };
        
        const chart = new Chart(ctx, {
          type: 'line',
          data: {
            datasets
          },
          options: {
            responsive: true,
            plugins: {
              title: {
                display: true,
                text: `Mờ hóa của ${factorName}`,
                font: {
                  size: 16
                }
              },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    const label = context.dataset.label || '';
                    const value = context.parsed.y;
                    return `${label}: ${Math.round(value * 100)}%`;
                  }
                }
              },
              annotation: {
                annotations: {
                  line1: annotation
                }
              },
              legend: {
                position: 'top',
              }
            },
            scales: {
              x: {
                type: 'linear',
                title: {
                  display: true,
                  text: 'Giá trị đầu vào (0-4)'
                },
                min: 0,
                max: 4
              },
              y: {
                title: {
                  display: true,
                  text: 'Mức độ thành viên'
                },
                min: 0,
                max: 1
              }
            }
          }
        });
        
        // Lưu instance chart để có thể hủy sau này
        chartInstances.current[factorName] = chart;
      };

      const getNumericValueFromSetName = (setName: string): number => {
        // Đây là đoạn logic chuyển đổi tên tập thành giá trị từ 0-4
        // Cần điều chỉnh dựa trên quy tắc đặt tên tập mờ của bạn
        if (setName.includes('Low') || setName.includes('Newly') || 
            setName.includes('Very Long') || setName.includes('Absent') || 
            setName.includes('None') || setName.includes('Highly') || 
            setName.includes('Readily')) {
          return 0;
        } else if (setName.includes('Low-Medium') || setName.includes('Short') || 
                   setName.includes('Long') || setName.includes('Minimal') || 
                   setName.includes('Very')) {
          return 1;
        } else if (setName.includes('Medium') || setName.includes('Moderate') || 
                   setName.includes('Mild')) {
          return 2;
        } else if (setName.includes('Medium-High') || setName.includes('Extended') || 
                   setName.includes('Limited') || setName.includes('Moderate') || 
                   setName.includes('Somewhat')) {
          return 3;
        } else if (setName.includes('High') || setName.includes('Long-Standing') || 
                   setName.includes('Short') || setName.includes('Severe') || 
                   setName.includes('Less')) {
          return 4;
        }
        return 2; // Giá trị mặc định
      };
      
      // Tạo các biểu đồ cho từng yếu tố
      const { fuzzifiedInputs } = calculationResult;
      const hypoglycemiaRiskValue = getNumericValueFromSetName(
        calculationResult.fuzzifiedInputs.hypoglycemiaRisk.find(
          v => v.membershipDegree > 0
        )?.setName || 'Medium'
      );
      
      const diseaseDurationValue = getNumericValueFromSetName(
        calculationResult.fuzzifiedInputs.diseaseDuration.find(
          v => v.membershipDegree > 0
        )?.setName || 'Moderate'
      );
      
      const lifeExpectancyValue = getNumericValueFromSetName(
        calculationResult.fuzzifiedInputs.lifeExpectancy.find(
          v => v.membershipDegree > 0
        )?.setName || 'Moderate'
      );
      
      const comorbiditiesValue = getNumericValueFromSetName(
        calculationResult.fuzzifiedInputs.comorbidities.find(
          v => v.membershipDegree > 0
        )?.setName || 'Mild'
      );
      
      const vascularComplicationsValue = getNumericValueFromSetName(
        calculationResult.fuzzifiedInputs.vascularComplications.find(
          v => v.membershipDegree > 0
        )?.setName || 'Mild'
      );
      
      const patientAttitudeValue = getNumericValueFromSetName(
        calculationResult.fuzzifiedInputs.patientAttitude.find(
          v => v.membershipDegree > 0
        )?.setName || 'Moderately motivated'
      );
      
      setTimeout(() => {
        if (fuzzificationChartRefs.current.hypoglycemiaRisk) {
          createFuzzificationChart(
            fuzzificationChartRefs.current.hypoglycemiaRisk,
            fuzzifiedInputs.hypoglycemiaRisk,
            'Nguy cơ hạ đường huyết',
            hypoglycemiaRiskValue
          );
        }
        
        if (fuzzificationChartRefs.current.diseaseDuration) {
          createFuzzificationChart(
            fuzzificationChartRefs.current.diseaseDuration,
            fuzzifiedInputs.diseaseDuration,
            'Thời gian mắc bệnh',
            diseaseDurationValue
          );
        }
        
        if (fuzzificationChartRefs.current.lifeExpectancy) {
          createFuzzificationChart(
            fuzzificationChartRefs.current.lifeExpectancy,
            fuzzifiedInputs.lifeExpectancy,
            'Tuổi thọ dự kiến',
            lifeExpectancyValue
          );
        }
        
        if (fuzzificationChartRefs.current.comorbidities) {
          createFuzzificationChart(
            fuzzificationChartRefs.current.comorbidities,
            fuzzifiedInputs.comorbidities,
            'Bệnh đồng mắc',
            comorbiditiesValue
          );
        }
        
        if (fuzzificationChartRefs.current.vascularComplications) {
          createFuzzificationChart(
            fuzzificationChartRefs.current.vascularComplications,
            fuzzifiedInputs.vascularComplications,
            'Biến chứng mạch máu',
            vascularComplicationsValue
          );
        }
        
        if (fuzzificationChartRefs.current.patientAttitude) {
          createFuzzificationChart(
            fuzzificationChartRefs.current.patientAttitude,
            fuzzifiedInputs.patientAttitude,
            'Thái độ bệnh nhân',
            patientAttitudeValue
          );
        }
      }, 100);
    }
  }, [activeStep, calculationResult]);
  
  // Vẽ biểu đồ tổng hợp đầu ra
  useEffect(() => {
    if (activeStep === 'aggregation' && calculationResult && aggregationChartRef.current) {
      // Dọn dẹp biểu đồ cũ
      if (chartInstances.current['aggregation']) {
        chartInstances.current['aggregation']!.destroy();
        chartInstances.current['aggregation'] = null;
      }
      
      const ctx = aggregationChartRef.current.getContext('2d');
      if (!ctx) return;
      
      const { aggregatedMembershipFunction } = calculationResult.defuzzifiedOutput;
      const { x, y } = aggregatedMembershipFunction;
      
      const chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: x,
          datasets: [
            {
              label: 'Hàm tổng hợp đầu ra',
              data: y,
              borderColor: 'rgba(52, 152, 219, 1)',
              backgroundColor: 'rgba(52, 152, 219, 0.2)',
              borderWidth: 2,
              fill: true,
              tension: 0.1
            }
          ]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: 'Tổng hợp đầu ra',
              font: {
                size: 16
              }
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const label = context.dataset.label || '';
                  const value = context.parsed.y;
                  return `${label}: ${Math.round(value * 100)}%`;
                }
              }
            },
            annotation: {
              annotations: {
                line1: {
                  type: 'line',
                  xMin: calculationResult.hba1cTarget,
                  xMax: calculationResult.hba1cTarget,
                  scaleID: 'x',
                  borderColor: 'rgba(231, 76, 60, 1)',
                  borderWidth: 2,
                  label: {
                    content: `HbA1c Target: ${calculationResult.hba1cTarget}%`,
                    display: true,
                    position: 'start' as const // top
                  }
                }
              }
            }
          },
          scales: {
            x: {
              title: {
                display: true,
                text: 'HbA1c (%)'
              },
              min: 6.0,
              max: 8.5
            },
            y: {
              title: {
                display: true,
                text: 'Mức độ thành viên'
              },
              min: 0,
              max: 1
            }
          }
        }
      });
      
      // Lưu instance chart
      chartInstances.current['aggregation'] = chart;
    }
  }, [activeStep, calculationResult]);
  
  const getTargetClass = (target: number): string => {
    if (target <= 6.5) return 'target-strict';
    if (target <= 7.0) return 'target-standard';
    if (target <= 7.5) return 'target-relaxed';
    return 'target-very-relaxed';
  };
  
  const getTargetDescription = (target: number): string => {
    if (target <= 6.5) return 'More-Stringent control (≤6.5%)';
    if (target <= 7.0) return 'Mild-Stringent control (≤7.0%)';
    if (target <= 7.5) return 'Less-Stringent control (≤7.5%)';
    return 'Very relaxed control (>7.5%)';
  };

  // Hiển thị component cho từng bước logic mờ
  const renderStepContent = () => {
    if (!calculationResult) return null;

    switch (activeStep) {
      case 'summary':
        return (
          <div className="step-content summary-step">
            <div className="target-result">
              <div className={`target-value ${calculationResult.hba1cTarget ? getTargetClass(calculationResult.hba1cTarget) : ''}`}>
                {calculationResult.hba1cTarget !== null ? `${calculationResult.hba1cTarget}%` : 'Đang tính toán...'}
              </div>
              <div className="target-description">
                {calculationResult.hba1cTarget !== null ? getTargetDescription(calculationResult.hba1cTarget) : ''}
              </div>
            </div>
            
            <div className="summary-explanation">
              <p>
                Mục tiêu HbA1c được tính toán dựa trên phương pháp logic mờ, xem xét <strong>6 yếu tố chính</strong> của 
                bệnh nhân. Kết quả phản ánh sự cân bằng giữa việc kiểm soát đường huyết và các rủi ro liên quan.
              </p>
              <p>
                Theo dõi chi tiết từng bước tính toán bằng cách sử dụng các tab trên đầu trang.
              </p>
            </div>
            
            <div className="recommendation-section">
              <h3>Clinical Recommendations</h3>
              
              <div className="recommendation-card">
                <p>
                  Based on the calculated target of <strong>{calculationResult.hba1cTarget}%</strong>, the following guidelines are recommended:
                </p>
                
                <ul className="recommendations-list">
                  {calculationResult.hba1cTarget <= 6.5 && (
                    <>
                      <li>Consider more stringent glucose monitoring</li>
                      <li>Emphasize lifestyle modifications and medication adherence</li>
                      <li>Schedule more frequent follow-up appointments (every 3 months)</li>
                      <li>Consider combination therapy if not at target</li>
                    </>
                  )}
                  
                  {calculationResult.hba1cTarget > 6.5 && calculationResult.hba1cTarget <= 7.0 && (
                    <>
                      <li>Maintain standard monitoring schedule</li>
                      <li>Review medication regimen every 3-6 months</li>
                      <li>Consider moderate lifestyle interventions</li>
                      <li>Balance glycemic control with hypoglycemia avoidance</li>
                    </>
                  )}
                  
                  {calculationResult.hba1cTarget > 7.0 && calculationResult.hba1cTarget <= 8.0 && (
                    <>
                      <li>Focus on preventing hypoglycemia and symptom control</li>
                      <li>Simplify medication regimen if appropriate</li>
                      <li>Emphasize safer glucose targets</li>
                      <li>Monitor for signs of complications regularly</li>
                    </>
                  )}
                  
                  {calculationResult.hba1cTarget > 8.0 && (
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
                    Current HbA1c: <strong>{patient?.hba1cLevel}%</strong><br />
                    Target HbA1c: <strong>{calculationResult.hba1cTarget}%</strong><br />
                    Difference: <strong className={patient && patient.hba1cLevel > calculationResult.hba1cTarget ? 'gap-negative' : 'gap-positive'}>
                      {patient ? Math.abs(patient.hba1cLevel - calculationResult.hba1cTarget).toFixed(1) : '?'}%
                      {patient && patient.hba1cLevel > calculationResult.hba1cTarget ? ' above target' : ' below target'}
                    </strong>
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'fuzzification':
        return (
          <div className="step-content fuzzification-step">
            <div className="step-explanation">
              <h3>Bước 1: Mờ hóa các giá trị đầu vào</h3>
              <p>
                Trong bước này, các giá trị đầu vào (như nguy cơ hạ đường huyết, thời gian mắc bệnh...) được chuyển đổi thành 
                giá trị <strong>mờ</strong> - tức là có thể thuộc vào nhiều tập mờ với các mức độ thành viên khác nhau.
                Biểu đồ dưới đây hiển thị mức độ thành viên của từng đầu vào trong các tập mờ tương ứng.
              </p>
            </div>
            
            <div className="fuzzification-charts">
              <div className="chart-row">
                <div className="chart-container">
                  <canvas ref={ref => { fuzzificationChartRefs.current.hypoglycemiaRisk = ref; }}></canvas>
                </div>
                <div className="chart-container">
                  <canvas ref={ref => { fuzzificationChartRefs.current.diseaseDuration = ref; }}></canvas>
                </div>
              </div>
              <div className="chart-row">
                <div className="chart-container">
                  <canvas ref={ref => { fuzzificationChartRefs.current.lifeExpectancy = ref; }}></canvas>
                </div>
                <div className="chart-container">
                  <canvas ref={ref => { fuzzificationChartRefs.current.comorbidities = ref; }}></canvas>
                </div>
              </div>
              <div className="chart-row">
                <div className="chart-container">
                  <canvas ref={ref => { fuzzificationChartRefs.current.vascularComplications = ref; }}></canvas>
                </div>
                <div className="chart-container">
                  <canvas ref={ref => { fuzzificationChartRefs.current.patientAttitude = ref; }}></canvas>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'rules':
        return (
          <div className="step-content rules-step">
            <div className="step-explanation">
              <h3>Bước 2: Đánh giá các luật mờ</h3>
              <p>
                Sau khi mờ hóa các đầu vào, hệ thống áp dụng một tập hợp các <strong>luật mờ</strong> để xác định mục tiêu HbA1c. 
                Mỗi luật được kích hoạt với mức độ khác nhau tùy thuộc vào đầu vào. Dưới đây là các luật quan trọng nhất 
                ảnh hưởng đến kết quả tính toán.
              </p>
            </div>
            
            <div className="rules-list-container">
              <h4>Các luật được kích hoạt:</h4>
              <ul className="rules-list">
                {calculationResult.ruleActivations
                  .filter(ra => ra.activation > 0.1)
                  .slice(0, 10)
                  .map((ra, index) => (
                    <li key={index} className="rule-item">
                      <div className="rule-header">
                        <div className="rule-id">{ra.rule.id}</div>
                        <div className="rule-activation-value">
                          Kích hoạt: {Math.round(ra.activation * 100)}%
                        </div>
                      </div>
                      <div className="rule-content">
                        <span className="rule-strength" style={{ width: `${Math.min(100, ra.activation * 100)}%` }}></span>
                        <div className="rule-text">
                          <div className="rule-description">{ra.rule.description}</div>
                          <div className="rule-io">
                            <div className="rule-inputs">
                              <strong>Đầu vào:</strong> {Object.entries(ra.rule.inputs)
                                .map(([key, value]) => {
                                  // Tạo tên dễ đọc hơn cho các đầu vào
                                  const readableName = {
                                    hypoglycemiaRisk: "Nguy cơ hạ đường huyết",
                                    diseaseDuration: "Thời gian mắc bệnh",
                                    lifeExpectancy: "Tuổi thọ dự kiến",
                                    comorbidities: "Bệnh đồng mắc",
                                    vascularComplications: "Biến chứng mạch máu",
                                    patientAttitude: "Thái độ bệnh nhân",
                                    resourcesSupport: "Nguồn lực hỗ trợ"
                                  }[key] || key;
                                  return `${readableName}: ${value}`;
                                })
                                .join(', ')}
                            </div>
                            <div className="rule-output">
                              <strong>Đầu ra:</strong> HbA1c {ra.rule.output} control
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="rule-explanation">
                        {ra.explanation}
                      </div>
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        );
        
      case 'aggregation':
        return (
          <div className="step-content aggregation-step">
            <div className="step-explanation">
              <h3>Bước 3: Tổng hợp đầu ra</h3>
              <p>
                Sau khi đánh giá tất cả các luật, các đầu ra của từng luật được tổng hợp lại thành một hình dạng 
                mờ duy nhất. Phương pháp tổng hợp này sử dụng toán tử MAX để kết hợp các luật, tạo ra một hàm thành viên 
                đại diện cho tất cả các hàm đầu ra của luật.
              </p>
            </div>
            
            <div className="aggregation-chart-container">
              <canvas ref={aggregationChartRef}></canvas>
            </div>
            
            <div className="aggregation-explanation">
              <p>
                <strong>Đường cong trên thể hiện:</strong> Hình dạng tổng hợp từ tất cả các luật được kích hoạt. 
                Càng cao ở một điểm, càng có nhiều bằng chứng từ các luật cho mục tiêu HbA1c đó.
              </p>
              <p>
                <strong>Đường đỏ dọc:</strong> Vị trí của mục tiêu HbA1c cuối cùng được tính bằng phương pháp khử mờ trọng tâm (defuzzification).
              </p>
            </div>
          </div>
        );
        
      case 'defuzzification':
        return (
          <div className="step-content defuzzification-step">
            <div className="step-explanation">
              <h3>Bước 4: Khử mờ kết quả</h3>
              <p>
                Bước cuối cùng là chuyển đổi hình dạng mờ thành một giá trị rõ ràng - đây là mục tiêu HbA1c cuối cùng.
                Phương pháp <strong>trọng tâm (centroid)</strong> được sử dụng để tính giá trị này, cân nhắc 
                "trung bình có trọng số" của tất cả các giá trị có thể.
              </p>
            </div>
            
            <div className="defuzzification-calculation">
              <h4>Tính toán giá trị rõ (crisp value):</h4>
              
              <div className="calculation-formula">
                <div className="formula-name">Phương pháp trọng tâm:</div>
                <div className="formula">
                  x = ∑(μ(x) · x) / ∑μ(x)
                </div>
              </div>
              
              <div className="calculation-steps">
                <div className="step">
                  <span className="step-label">Tổng trọng số * giá trị (∑(μ(x) · x)):</span> 
                  <span className="step-value">{calculationResult.defuzzifiedOutput.centroidCalculation.weightedSum.toFixed(2)}</span>
                </div>
                <div className="step">
                  <span className="step-label">Tổng trọng số (∑μ(x)):</span> 
                  <span className="step-value">{calculationResult.defuzzifiedOutput.centroidCalculation.weightSum.toFixed(2)}</span>
                </div>
                <div className="step">
                  <span className="step-label">Trọng tâm (x = ∑(μ(x) · x) / ∑μ(x)):</span> 
                  <span className="step-value">{calculationResult.defuzzifiedOutput.centroidCalculation.x.toFixed(3)}</span>
                </div>
                <div className="step final-step">
                  <span className="step-label">Giá trị HbA1c cuối cùng (làm tròn):</span> 
                  <span className="step-value final-value">{calculationResult.hba1cTarget}%</span>
                </div>
              </div>
            </div>
            
            <div className="defuzzification-explanation">
              <p>
                Giá trị trọng tâm đại diện cho "điểm cân bằng" của hình dạng mờ tổng hợp. Đây là giá trị 
                tốt nhất đại diện cho tất cả các luật đã được kích hoạt và mức độ kích hoạt của chúng.
              </p>
              <p>
                Dựa trên phương pháp khử mờ này, mục tiêu HbA1c được đề xuất cho <strong>{patient?.name}</strong> là 
                <strong className={`target-highlight ${getTargetClass(calculationResult.hba1cTarget)}`}>
                  {calculationResult.hba1cTarget}%
                </strong>
                ({getTargetDescription(calculationResult.hba1cTarget)}).
              </p>
            </div>
          </div>
        );
        
      default:
        return null;
    }
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
        onClick={() => {
          const storedData = sessionStorage.getItem('diabetesInsight_patientFactors');
          
          if (storedData) {
            try {
              const patientData = JSON.parse(storedData);
              
              const cleanedData = {
                id: patientData.id,
                name: patientData.name,
                age: patientData.age,
                diabetesType: patientData.diabetesType,
                hba1cLevel: patientData.hba1cLevel,
                timestamp: new Date().getTime()
              };
              
              sessionStorage.setItem('diabetesInsight_patientFactors', JSON.stringify(cleanedData));
              console.log('Cleaned patient data in session storage:', cleanedData);
            } catch (error) {
              console.error('Error cleaning patient data in session storage:', error);
            }
          }
          
          navigate(`/patients/${id}`);
        }}
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
        
        <div className="fuzzy-logic-steps">
          <div className="steps-nav">
            <button 
              className={`step-tab ${activeStep === 'summary' ? 'active' : ''}`}
              onClick={() => setActiveStep('summary')}
            >
              <div className="step-number">Tổng quan</div>
              <div className="step-name">Kết quả</div>
            </button>
            <button 
              className={`step-tab ${activeStep === 'fuzzification' ? 'active' : ''}`}
              onClick={() => setActiveStep('fuzzification')}
            >
              <div className="step-number">Bước 1</div>
              <div className="step-name">Mờ hóa</div>
            </button>
            <button 
              className={`step-tab ${activeStep === 'rules' ? 'active' : ''}`}
              onClick={() => setActiveStep('rules')}
            >
              <div className="step-number">Bước 2</div>
              <div className="step-name">Luật mờ</div>
            </button>
            <button 
              className={`step-tab ${activeStep === 'aggregation' ? 'active' : ''}`}
              onClick={() => setActiveStep('aggregation')}
            >
              <div className="step-number">Bước 3</div>
              <div className="step-name">Tổng hợp</div>
            </button>
            <button 
              className={`step-tab ${activeStep === 'defuzzification' ? 'active' : ''}`}
              onClick={() => setActiveStep('defuzzification')}
            >
              <div className="step-number">Bước 4</div>
              <div className="step-name">Khử mờ</div>
            </button>
          </div>
          
          <div className="step-content-container">
            {renderStepContent()}
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
            className="update-hba1c-button"
            onClick={handleUpdateHbA1c}
            disabled={updatingHbA1c}
          >
            {updatingHbA1c ? 'Đang cập nhật...' : 'Cập nhật mục tiêu HbA1c'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default HbA1cSteps;