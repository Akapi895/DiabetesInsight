import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { calculateTOPSIS, TopsisMatrix, TopsisResult } from '../utils/topsis';
import '../styles/TopsisAnalysis.css';

// Ma trận thuốc mẫu cứng
const mockDrugMatrix: TopsisMatrix = {
  matrix: [
    // Hypoglycemia Risk (1=thấp, 10=cao)
    [3, 8, 1, 1, 2, 2, 8],
    // Weight Effect (1=giảm, 10=tăng)
    [5, 8, 3, 5, 1, 2, 8],
    // Renal/GU Effect (1=tốt, 10=xấu)
    [8, 3, 5, 5, 7, 3, 2],
    // GI Side Effects (1=ít, 10=nhiều)
    [8, 3, 4, 7, 1, 8, 2],
    // CHF Risk (1=thấp, 10=cao)
    [2, 7, 8, 2, 1, 2, 7],
    // CVD Effect (1=tốt, 10=xấu)
    [4, 5, 5, 2, 1, 3, 5],
    // Bone Effect (1=tốt, 10=xấu)
    [2, 3, 8, 5, 3, 2, 3],
    // Cost (1=rẻ, 10=đắt)
    [1, 3, 6, 8, 7, 9, 4]
  ],
  weights: [0.20, 0.15, 0.15, 0.10, 0.15, 0.10, 0.05, 0.10],
  criteriaTypes: ['cost', 'cost', 'cost', 'cost', 'cost', 'cost', 'cost', 'cost'],
  criteriaLabels: [
    'Hypoglycemia',
    'Weight',
    'Renal/GU',
    'GI Side',
    'CHF',
    'CVD',
    'Bone',
    'Cost'
  ],
  drugLabels: [
    'MET',
    'SU',
    'TZDs',
    'DPP-4',
    'SGLT2',
    'GLP-1',
    'Insulins'
  ]
};

const TopsisAnalysis = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // States
  const [patient, setPatient] = useState<any>(null);
  const [patientHistory, setPatientHistory] = useState<any>(null);
  const [topsisData, setTopsisData] = useState<TopsisMatrix>(mockDrugMatrix);
  const [topsisResult, setTopsisResult] = useState<TopsisResult | null>(null);
  const [customWeights, setCustomWeights] = useState<number[]>(mockDrugMatrix.weights);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [suitableDrugs, setSuitableDrugs] = useState<string[] | null>(null);

  // Lấy thông tin bệnh nhân
  useEffect(() => {
    fetch(`http://127.0.0.1:8000/api/patients/${id}`)
      .then(res => res.json())
      .then(data => setPatient(data))
      .catch(() => setError("Không lấy được thông tin bệnh nhân"));
  }, [id]);

  // Lấy lịch sử bệnh nhân
  useEffect(() => {
    fetch(`http://127.0.0.1:8000/api/patients/history/${id}`)
      .then(res => res.json())
      .then(data => setPatientHistory(data))
      .catch(() => setError("Không lấy được lịch sử bệnh nhân"));
  }, [id]);

  // Tính toán trọng số tùy chỉnh dựa trên lịch sử bệnh nhân
  const calculateCustomWeightsFromHistory = (history: any) => {
    const weights = [...mockDrugMatrix.weights]; // Copy mảng trọng số mặc định
    
    // Nếu bệnh nhân có tiền sử hạ đường huyết, tăng trọng số cho tiêu chí này
    if (history.hypo && history.hypo.length > 0) {
      weights[0] = weights[0] * 1.5; // Tăng trọng số cho Hypoglycemia Risk
    }
    
    // Nếu bệnh nhân có vấn đề về cân nặng
    if (history.weight && history.weight.length > 0) {
      weights[1] = weights[1] * 1.3; // Tăng trọng số cho Weight Effect
    }
    
    // Nếu bệnh nhân có vấn đề về thận
    if (history.renalGu && history.renalGu.length > 0) {
      weights[2] = weights[2] * 1.4; // Tăng trọng số cho Renal/GU Effect
    }
    
    // Nếu bệnh nhân có vấn đề về đường tiêu hóa
    if (history.giSx && history.giSx.length > 0) {
      weights[3] = weights[3] * 1.4; // Tăng trọng số cho GI Side Effects
    }
    
    // Nếu bệnh nhân có vấn đề về tim
    if (history.chf && history.chf.length > 0) {
      weights[4] = weights[4] * 1.5; // Tăng trọng số cho CHF Risk
    }
    
    // Nếu bệnh nhân có vấn đề về bệnh tim mạch
    if (history.cvd && history.cvd.length > 0) {
      weights[5] = weights[5] * 1.4; // Tăng trọng số cho CVD Effect
    }
    
    // Nếu bệnh nhân có vấn đề về xương
    if (history.bone && history.bone.length > 0) {
      weights[6] = weights[6] * 1.3; // Tăng trọng số cho Bone Effect
    }
    
    // Chuẩn hóa trọng số để tổng bằng 1
    const sum = weights.reduce((a, b) => a + b, 0);
    const normalizedWeights = weights.map(w => w / sum);
    
    return normalizedWeights;
  };

  // Khi patientHistory thay đổi, tính lại trọng số
  useEffect(() => {
    if (!patientHistory) return;
    const weights = calculateCustomWeightsFromHistory(patientHistory);
    setCustomWeights(weights);

    // Cập nhật topsisData với trọng số mới
    setTopsisData(prev => ({
      ...prev,
      weights
    }));
  }, [patientHistory]);

  // Khởi tạo dữ liệu và tính toán TOPSIS khi component mount
  useEffect(() => {
    const initializeTopsisData = () => {
      try {
        setLoading(true);
        
        // Tính toán trọng số dựa trên lịch sử bệnh
        const weights = calculateCustomWeightsFromHistory(patientHistory || {});
        setCustomWeights(weights);
        
        // Cập nhật topsis data với trọng số mới
        const updatedTopsisData = {
          ...mockDrugMatrix,
          weights
        };
        setTopsisData(updatedTopsisData);
        
        // Tính toán TOPSIS và đảm bảo kết quả không null
        const result = calculateTOPSIS(updatedTopsisData);
        setTopsisResult(result);
        
        // Chỉ khi tính toán xong mới đặt loading = false
        setLoading(false);
      } catch (error) {
        console.error('Error initializing TOPSIS data:', error);
        setError('Đã xảy ra lỗi khi khởi tạo dữ liệu. Vui lòng thử lại sau.');
        setLoading(false);
      }
    };

    if (patientHistory) {
      initializeTopsisData();
    }
  }, [patientHistory]);

  // Lấy danh sách thuốc phù hợp từ API
  useEffect(() => {
    fetch(`http://127.0.0.1:8000/api/patients/${id}/suitable-drugs`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data.suitable_drugs)) {
          setSuitableDrugs(data.suitable_drugs);
        } else {
          setSuitableDrugs([]);
        }
      });
  }, [id]);

  // Khi suitableDrugs đã có, lọc lại ma trận và labels
  useEffect(() => {
    if (!suitableDrugs) return;

    // Lấy index các thuốc phù hợp trong drugLabels
    const indices = mockDrugMatrix.drugLabels
      .map((label, idx) => suitableDrugs.some(drug => label.includes(drug) || drug.includes(label)) ? idx : -1)
      .filter(idx => idx !== -1);

    // Lọc lại drugLabels và các ma trận theo indices
    const filteredDrugLabels = indices.map(idx => mockDrugMatrix.drugLabels[idx]);
    const filteredMatrix = mockDrugMatrix.matrix.map(row => indices.map(idx => row[idx]));

    // Tạo ma trận mới cho TOPSIS
    const filteredTopsisMatrix = {
      ...mockDrugMatrix,
      drugLabels: filteredDrugLabels,
      matrix: filteredMatrix
    };

    setTopsisData(filteredTopsisMatrix);
    const result = calculateTOPSIS(filteredTopsisMatrix);
    setTopsisResult(result);
  }, [suitableDrugs]);

  // Xử lý thay đổi trọng số từ người dùng
  const handleWeightChange = (index: number, value: number) => {
    const newWeights = [...customWeights];
    newWeights[index] = value;
    
    // Chuẩn hóa để tổng = 1
    const sum = newWeights.reduce((a, b) => a + b, 0);
    const normalizedWeights = newWeights.map(w => w / sum);
    
    setCustomWeights(normalizedWeights);
    
    // Cập nhật dữ liệu và tính toán lại
    const updatedTopsisData = {
      ...topsisData,
      weights: normalizedWeights
    };
    setTopsisData(updatedTopsisData);
    const result = calculateTOPSIS(updatedTopsisData);
    setTopsisResult(result);
  };

  // Định dạng số với 3 chữ số thập phân
  const formatNumber = (num: number | undefined) => {
    if (num === undefined || num === null) return "N/A";
    return num.toFixed(3);
  };

  if (!patient || !patientHistory || loading) {
    return <div className="loading-state">Đang tải dữ liệu phân tích thuốc...</div>;
  }
  
  if (error) {
    return <div className="error-state">{error}</div>;
  }

  return (
    <div className="topsis-analysis-container">
      <header className="topsis-header">
        <button 
          className="back-button"
          onClick={() => navigate(`/patients/${id}`)}
        >
          Quay lại hồ sơ bệnh nhân
        </button>
        <h1>Phân tích lựa chọn thuốc điều trị đái tháo đường</h1>
      </header>
      
      {/* Thông tin tóm tắt bệnh nhân */}
      <div className="patient-summary">
        <div className="patient-info">
          <h2>{patient?.personal?.name}</h2>
          <span className="patient-id">ID: {patient?.id}</span>
        </div>
        <div className="patient-metrics">
          <div className="metric-item">
            <span className="metric-label">Tuổi:</span>
            <span className="metric-value">{patient?.personal?.age}</span>
          </div>
          <div className="metric-item">
            <span className="metric-label">Loại đái tháo đường:</span>
            <span className="metric-value">
              {patient?.diabetes?.diabetesType === 1 ? 'Type 1' : 
               patient?.diabetes?.diabetesType === 2 ? 'Type 2' : 'Khác'}
            </span>
          </div>
          <div className="metric-item">
            <span className="metric-label">HbA1c:</span>
            <span className="metric-value">{patient?.diabetes?.hba1cLevel}%</span>
          </div>
        </div>
      </div>

      {/* Mục lục các bước TOPSIS */}
      <div className="topsis-toc">
        <h2>Các bước phân tích TOPSIS:</h2>
        <ol>
          <li><a href="#step1">Xây dựng ma trận quyết định</a></li>
          <li><a href="#step2">Chuẩn hóa ma trận quyết định</a></li>
          <li><a href="#step3">Xác định trọng số cho các tiêu chí</a></li>
          <li><a href="#step4">Xây dựng ma trận quyết định chuẩn hóa có trọng số</a></li>
          <li><a href="#step5">Xác định các giải pháp lý tưởng và tiêu cực</a></li>
          <li><a href="#step6">Tính toán khoảng cách đến giải pháp lý tưởng và tiêu cực</a></li>
          <li><a href="#step7">Tính toán độ gần tương đối và xếp hạng các giải pháp</a></li>
        </ol>
      </div>

      {/* Bước 1: Ma trận quyết định */}
      <section id="step1" className="topsis-step">
        <div className="step-header">
          <h2>Bước 1: Xây dựng ma trận quyết định</h2>
        </div>
        
        <div className="step-content">
          <div className="step-explanation">
            <p>
              Ma trận quyết định là ma trận m hàng n cột, trong đó m là số tiêu chí đánh giá và 
              n là số thuốc cần so sánh. Mỗi ô trong ma trận thể hiện mức độ tác động của một loại thuốc 
              đối với một tiêu chí nhất định (1 = tốt, 10 = xấu).
            </p>
          </div>
          
        {topsisResult && (
            <div className="matrix-container">
                <table className="topsis-matrix">
                <thead>
                    <tr>
                    <th>Thuốc / Tiêu chí</th>
                    {topsisResult.criteriaLabels.map((criterion, index) => (
                        <th key={index}>{criterion}</th>
                    ))}
                    </tr>
                </thead>
                <tbody>
                  {topsisResult.drugLabels.map((drug, j) => (
                    <tr key={j}>
                      <td>{drug}</td>
                      {topsisResult.criteriaLabels.map((_, i) => (
                        <td key={i}>{topsisResult.matrix[i][j]}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
                </table>
            </div>
        )}     

          <div className="matrix-explanation">
            <h4>Chú thích:</h4>
            <ul>
              <li><strong>Hypoglycemia Risk</strong>: Nguy cơ hạ đường huyết (1 = thấp, 10 = cao)</li>
              <li><strong>Weight Effect</strong>: Tác động đến cân nặng (1 = giảm cân, 10 = tăng cân)</li>
              <li><strong>Renal/GU Effect</strong>: Tác động đến thận (1 = có lợi, 10 = bất lợi)</li>
              <li><strong>GI Side Effects</strong>: Tác dụng phụ tiêu hóa (1 = ít, 10 = nhiều)</li>
              <li><strong>CHF Risk</strong>: Nguy cơ suy tim (1 = thấp, 10 = cao)</li>
              <li><strong>CVD Effect</strong>: Tác động tim mạch (1 = có lợi, 10 = bất lợi)</li>
              <li><strong>Bone Effect</strong>: Tác động đến xương (1 = ít nguy cơ gãy, 10 = nhiều)</li>
              <li><strong>Cost</strong>: Chi phí (1 = rẻ, 10 = đắt)</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Bước 2: Chuẩn hóa ma trận quyết định */}
      <section id="step2" className="topsis-step">
        <div className="step-header">
          <h2>Bước 2: Chuẩn hóa ma trận quyết định</h2>
        </div>
        
        <div className="step-content">
          <div className="step-explanation">
            <p>
              Chuẩn hóa ma trận quyết định để tất cả các tiêu chí có cùng đơn vị đo lường.
              Giá trị chuẩn hóa r<sub>ij</sub> được tính bằng công thức:
            </p>
            <div className="formula">
              r<sub>ij</sub> = x<sub>ij</sub> / √(Σx<sub>ij</sub>²)
            </div>
          </div>
          
          {topsisResult && (
            <div className="matrix-container">
                <table className="topsis-matrix">
                <thead>
                    <tr>
                    <th>Thuốc / Tiêu chí</th>
                    {topsisResult.criteriaLabels.map((criterion, index) => (
                        <th key={index}>{criterion}</th>
                    ))}
                    </tr>
                </thead>
                <tbody>
                    {topsisResult.drugLabels.map((drug, j) => (
                    <tr key={j}>
                        <td>{drug}</td>
                        {topsisResult.criteriaLabels.map((_, i) => (
                        <td key={i}>{formatNumber(topsisResult.normalizedMatrix[i][j])}</td>
                        ))}
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
            )}
          
          <div className="matrix-explanation">
            <p>
              Sau khi chuẩn hóa, các giá trị nằm trong khoảng từ 0 đến 1. 
              Điều này giúp so sánh các tiêu chí khác nhau một cách công bằng.
            </p>
          </div>
        </div>
      </section>

      {/* Bước 3: Xác định trọng số */}
      <section id="step3" className="topsis-step">
        <div className="step-header">
          <h2>Bước 3: Xác định trọng số cho các tiêu chí</h2>
        </div>
        
        <div className="step-content">
          <div className="step-explanation">
            <p>
              Mỗi tiêu chí được gán một trọng số để phản ánh tầm quan trọng của nó.
              Trọng số được tính toán dựa trên lịch sử bệnh của bệnh nhân.
            </p>
          </div>
          
          {topsisResult && (
            <div className="weights-container">
              <table className="weights-table">
                <thead>
                  <tr>
                    <th>Tiêu chí</th>
                    <th>Trọng số</th>
                    <th>Loại tiêu chí</th>
                    <th>Điều chỉnh</th>
                  </tr>
                </thead>
                <tbody>
                  {topsisResult.criteriaLabels.map((criterion, index) => (
                    <tr key={index}>
                      <td>{criterion}</td>
                      <td>{formatNumber(topsisResult.weights[index])}</td>
                      <td>{topsisResult.criteriaTypes[index] === 'benefit' ? 'Benefit (càng cao càng tốt)' : 'Cost (càng thấp càng tốt)'}</td>
                      <td>
                        <input 
                          type="range" 
                          min="0.05" 
                          max="0.3" 
                          step="0.01" 
                          value={customWeights[index]} 
                          onChange={(e) => handleWeightChange(index, parseFloat(e.target.value))}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          <div className="patient-relevance">
            <h4>Trọng số được điều chỉnh theo lịch sử bệnh:</h4>
            <div className="history-relevance">
              {patientHistory?.hypo && patientHistory.hypo.length > 0 && (
                <div className="relevance-item">
                  <strong>Hypoglycemia Risk:</strong> Trọng số cao hơn do bệnh nhân có tiền sử hạ đường huyết
                </div>
              )}
              {patientHistory?.weight && patientHistory.weight.length > 0 && (
                <div className="relevance-item">
                  <strong>Weight Effect:</strong> Trọng số cao hơn do bệnh nhân có vấn đề về cân nặng
                </div>
              )}
              {patientHistory?.renalGu && patientHistory.renalGu.length > 0 && (
                <div className="relevance-item">
                  <strong>Renal/GU Effect:</strong> Trọng số cao hơn do bệnh nhân có vấn đề về thận
                </div>
              )}
              {patientHistory?.giSx && patientHistory.giSx.length > 0 && (
                <div className="relevance-item">
                  <strong>GI Side Effects:</strong> Trọng số cao hơn do bệnh nhân có vấn đề tiêu hóa
                </div>
              )}
              {patientHistory?.chf && patientHistory.chf.length > 0 && (
                <div className="relevance-item">
                  <strong>CHF Risk:</strong> Trọng số cao hơn do bệnh nhân có vấn đề về tim
                </div>
              )}
              {patientHistory?.cvd && patientHistory.cvd.length > 0 && (
                <div className="relevance-item">
                  <strong>CVD Effect:</strong> Trọng số cao hơn do bệnh nhân có vấn đề về tim mạch
                </div>
              )}
              {patientHistory?.bone && patientHistory.bone.length > 0 && (
                <div className="relevance-item">
                  <strong>Bone Effect:</strong> Trọng số cao hơn do bệnh nhân có vấn đề về xương
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Bước 4: Ma trận quyết định chuẩn hóa có trọng số */}
      <section id="step4" className="topsis-step">
        <div className="step-header">
          <h2>Bước 4: Xây dựng ma trận quyết định chuẩn hóa có trọng số</h2>
        </div>
        
        <div className="step-content">
          <div className="step-explanation">
            <p>
              Nhân ma trận chuẩn hóa với các trọng số tương ứng:
              v<sub>ij</sub> = w<sub>j</sub> × r<sub>ij</sub>
            </p>
          </div>
          
          {topsisResult && (
            <div className="matrix-container">
                <table className="topsis-matrix">
                <thead>
                    <tr>
                    <th>Thuốc / Tiêu chí</th>
                    {topsisResult.criteriaLabels.map((criterion, index) => (
                        <th key={index}>{criterion}</th>
                    ))}
                    </tr>
                </thead>
                <tbody>
                    {topsisResult.drugLabels.map((drug, j) => (
                    <tr key={j}>
                        <td>{drug}</td>
                        {topsisResult.criteriaLabels.map((_, i) => (
                        <td key={i}>{formatNumber(topsisResult.weightedNormalizedMatrix[i][j])}</td>
                        ))}
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
            )}        
    </div>
      </section>

      {/* Bước 5: Xác định giải pháp lý tưởng và tiêu cực */}
      <section id="step5" className="topsis-step">
        <div className="step-header">
          <h2>Bước 5: Xác định các giải pháp lý tưởng và tiêu cực</h2>
        </div>
        
        <div className="step-content">
          <div className="step-explanation">
            <p>
              Giải pháp lý tưởng (A*) bao gồm các giá trị tốt nhất cho mỗi tiêu chí.<br />
              Giải pháp tiêu cực (A-) bao gồm các giá trị xấu nhất cho mỗi tiêu chí.
            </p>
          </div>
          
          {topsisResult && (
            <div className="solutions-container">
              <table className="solutions-table">
                <thead>
                  <tr>
                    <th>Tiêu chí</th>
                    <th>Loại</th>
                    <th>Giải pháp lý tưởng (A*)</th>
                    <th>Giải pháp tiêu cực (A-)</th>
                  </tr>
                </thead>
                <tbody>
                  {topsisResult.criteriaLabels.map((criterion, index) => (
                    <tr key={index}>
                      <td>{criterion}</td>
                      <td>{topsisResult.criteriaTypes[index]}</td>
                      <td>{formatNumber(topsisResult.idealSolution[index])}</td>
                      <td>{formatNumber(topsisResult.negativeSolution[index])}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          <div className="solutions-explanation">
            <p>
              Đối với tiêu chí thuộc loại <strong>benefit</strong>, giá trị tốt nhất là 
              giá trị lớn nhất và giá trị xấu nhất là giá trị nhỏ nhất.
            </p>
            <p>
              Đối với tiêu chí thuộc loại <strong>cost</strong>, giá trị tốt nhất là 
              giá trị nhỏ nhất và giá trị xấu nhất là giá trị lớn nhất.
            </p>
          </div>
        </div>
      </section>

      {/* Bước 6: Tính khoảng cách */}
      <section id="step6" className="topsis-step">
        <div className="step-header">
          <h2>Bước 6: Tính toán khoảng cách đến giải pháp lý tưởng và tiêu cực</h2>
        </div>
        
        <div className="step-content">
          <div className="step-explanation">
            <p>
              Khoảng cách Euclidean từ mỗi phương án đến giải pháp lý tưởng (S*) và giải pháp tiêu cực (S-).
            </p>
            <div className="formula">
              S*<sub>i</sub> = √(Σ(v<sub>ij</sub> - v<sub>j</sub>*)²)<br />
              S-<sub>i</sub> = √(Σ(v<sub>ij</sub> - v<sub>j</sub>-)²)
            </div>
          </div>
          
          {topsisResult && (
            <div className="distances-container">
              <table className="distances-table">
                <thead>
                  <tr>
                    <th>Thuốc</th>
                    <th>Khoảng cách đến giải pháp lý tưởng (S*)</th>
                    <th>Khoảng cách đến giải pháp tiêu cực (S-)</th>
                  </tr>
                </thead>
                <tbody>
                  {topsisResult.drugLabels.map((drug, index) => (
                    <tr key={index}>
                      <td>{drug}</td>
                      <td>{formatNumber(topsisResult.distanceToIdeal[index])}</td>
                      <td>{formatNumber(topsisResult.distanceToNegative[index])}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          <div className="distances-explanation">
            <p>
              Khoảng cách nhỏ đến giải pháp lý tưởng (S*) và khoảng cách lớn đến giải pháp tiêu cực (S-) 
              cho thấy một giải pháp tốt hơn.
            </p>
          </div>
        </div>
      </section>

      {/* Bước 7: Tính toán độ gần tương đối và xếp hạng */}
      <section id="step7" className="topsis-step">
        <div className="step-header">
          <h2>Bước 7: Tính toán độ gần tương đối và xếp hạng các giải pháp</h2>
        </div>
        
        <div className="step-content">
          <div className="step-explanation">
            <p>
              Độ gần tương đối (C*) của mỗi giải pháp so với giải pháp lý tưởng được tính theo công thức:
            </p>
            <div className="formula">
              C*<sub>i</sub> = S-<sub>i</sub> / (S*<sub>i</sub> + S-<sub>i</sub>)
            </div>
            <p>
              Giá trị C* nằm trong khoảng [0,1]. Giá trị càng gần 1 thì giải pháp càng tốt.
            </p>
          </div>
          
          {topsisResult && (
            <div className="rankings-container">
              <h4>Xếp hạng các loại thuốc theo độ phù hợp với bệnh nhân:</h4>
              <table className="rankings-table">
                <thead>
                  <tr>
                    <th>Xếp hạng</th>
                    <th>Thuốc</th>
                    <th>Độ gần tương đối (C*)</th>
                    <th>Đánh giá mức độ phù hợp</th>
                  </tr>
                </thead>
                <tbody>
                  {topsisResult.rankedIndices
                    .filter(index => !!topsisResult.drugLabels[index]) // chỉ lấy các thuốc có tên
                    .map((index, rank) => (
                      <tr key={index} className={rank === 0 ? 'top-rank' : ''}>
                        <td>{rank + 1}</td>
                        <td>{topsisResult.drugLabels[index]}</td>
                        <td>{formatNumber(topsisResult.relativeCloseness[index])}</td>
                        <td>
                          <div className="rating-bar-container">
                            <div 
                              className="rating-bar" 
                              style={{width: `${topsisResult.relativeCloseness[index] * 100}%`}}
                            ></div>
                            <span className="rating-text">
                              {
                                topsisResult.relativeCloseness[index] > 0.8 ? 'Rất phù hợp' :
                                topsisResult.relativeCloseness[index] > 0.6 ? 'Phù hợp' :
                                topsisResult.relativeCloseness[index] > 0.4 ? 'Trung bình' :
                                topsisResult.relativeCloseness[index] > 0.2 ? 'Ít phù hợp' :
                                'Không phù hợp'
                              }
                            </span>
                          </div>
                        </td>
                      </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* Kết luận và khuyến nghị */}
      <section className="topsis-conclusion">
        <h2>Kết luận và khuyến nghị điều trị</h2>
        
        {topsisResult && topsisResult.rankedIndices.length > 0 && (
          <div className="drug-recommendation">
            <p className="recommendation-summary">
              Dựa vào phân tích TOPSIS và lịch sử bệnh của bệnh nhân, 
              <strong> {topsisResult.drugLabels[topsisResult.rankedIndices[0]]}</strong> là lựa chọn 
              phù hợp nhất với điểm số {formatNumber(topsisResult.relativeCloseness[topsisResult.rankedIndices[0]])}.
            </p>
            
            <div className="recommendation-details">
              <h4>Lý do lựa chọn:</h4>
              <ul>
                {patientHistory?.hypo && patientHistory.hypo.length > 0 && (
                  <li>
                    Bệnh nhân có tiền sử hạ đường huyết: 
                    {topsisResult.matrix[0][topsisResult.rankedIndices[0]] <= 3 ? 
                      ` ${topsisResult.drugLabels[topsisResult.rankedIndices[0]]} có nguy cơ hạ đường huyết thấp.` : 
                      ` Cần theo dõi nguy cơ hạ đường huyết khi sử dụng ${topsisResult.drugLabels[topsisResult.rankedIndices[0]]}.`}
                  </li>
                )}
                
                {patientHistory?.weight && patientHistory.weight.length > 0 && (
                  <li>
                    Bệnh nhân có vấn đề về cân nặng: 
                    {topsisResult.matrix[1][topsisResult.rankedIndices[0]] <= 3 ? 
                      ` ${topsisResult.drugLabels[topsisResult.rankedIndices[0]]} có thể giúp giảm cân.` : 
                      ` Thuốc có thể gây tăng cân, cần tư vấn chế độ ăn uống và vận động.`}
                  </li>
                )}
                
                {patientHistory?.renalGu && patientHistory.renalGu.length > 0 && (
                  <li>
                    Bệnh nhân có vấn đề về thận: 
                    {topsisResult.matrix[2][topsisResult.rankedIndices[0]] <= 3 ? 
                      ` ${topsisResult.drugLabels[topsisResult.rankedIndices[0]]} ít tác động đến thận.` : 
                      ` Cần theo dõi chức năng thận khi sử dụng thuốc này.`}
                  </li>
                )}
                
                {patientHistory?.giSx && patientHistory.giSx.length > 0 && (
                  <li>
                    Bệnh nhân có vấn đề tiêu hóa: 
                    {topsisResult.matrix[3][topsisResult.rankedIndices[0]] <= 3 ? 
                      ` ${topsisResult.drugLabels[topsisResult.rankedIndices[0]]} ít gây tác dụng phụ tiêu hóa.` : 
                      ` Cần theo dõi các vấn đề tiêu hóa khi sử dụng thuốc này.`}
                  </li>
                )}
                
                {patientHistory?.chf && patientHistory.chf.length > 0 && (
                  <li>
                    Bệnh nhân có vấn đề về tim: 
                    {topsisResult.matrix[4][topsisResult.rankedIndices[0]] <= 3 ? 
                      ` ${topsisResult.drugLabels[topsisResult.rankedIndices[0]]} an toàn đối với bệnh nhân có vấn đề tim mạch.` : 
                      ` Cần theo dõi chức năng tim khi sử dụng thuốc này.`}
                  </li>
                )}
              </ul>
            </div>
            
            <div className="alternative-drugs">
              <h4>Lựa chọn thay thế:</h4>
              <p>
                {topsisResult.drugLabels[topsisResult.rankedIndices[1]]} 
                (điểm số: {formatNumber(topsisResult.relativeCloseness[topsisResult.rankedIndices[1]])}) và 
                {' '}{topsisResult.drugLabels[topsisResult.rankedIndices[2]]} 
                (điểm số: {formatNumber(topsisResult.relativeCloseness[topsisResult.rankedIndices[2]])}) 
                cũng là những lựa chọn tốt nếu có chống chỉ định với thuốc ưu tiên.
              </p>
            </div>
          </div>
        )}
      </section>

      {/* Nút actions */}
      <div className="topsis-actions">
        <button 
          className="print-button"
          onClick={() => window.print()}
        >
          In báo cáo
        </button>
        
        <button 
          className="back-to-patient-button"
          onClick={() => navigate(`/patients/${id}`)}
        >
          Trở về hồ sơ bệnh nhân
        </button>
      </div>
    </div>
  );
};

export default TopsisAnalysis;