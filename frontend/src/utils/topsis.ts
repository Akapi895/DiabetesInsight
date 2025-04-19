export interface TopsisMatrix {
    drugLabels: string[];
    criteriaLabels: string[];
    matrix: number[][];
    weights: number[];
    criteriaTypes: ('benefit' | 'cost')[];
  }
  
  export interface TopsisResult {
    // Dữ liệu đầu vào
    matrix: number[][];
    normalizedMatrix: number[][];
    weightedNormalizedMatrix: number[][];
    idealSolution: number[];
    negativeSolution: number[];
    
    // Khoảng cách
    distanceToIdeal: number[];
    distanceToNegative: number[];
    
    // Kết quả
    relativeCloseness: number[];
    rankedIndices: number[];
    
    // Thông tin bổ sung để hiển thị
    drugLabels: string[];
    criteriaLabels: string[];
    weights: number[];
    criteriaTypes: ('benefit' | 'cost')[];
  }
  
  /**
   * Chuẩn hóa ma trận quyết định
   */
  function normalizeMatrix(matrix: number[][]): number[][] {
    const rows = matrix.length;
    const cols = matrix[0].length;
    const normalizedMatrix: number[][] = [];
  
    // Tạo ma trận chuẩn hóa với giá trị 0
    for (let i = 0; i < rows; i++) {
      normalizedMatrix[i] = Array(cols).fill(0);
    }
  
    // Tính chuẩn cho từng cột
    for (let j = 0; j < cols; j++) {
      // Tính căn bậc hai của tổng bình phương
      let sumOfSquares = 0;
      for (let i = 0; i < rows; i++) {
        sumOfSquares += Math.pow(matrix[i][j], 2);
      }
      const norm = Math.sqrt(sumOfSquares);
  
      // Chuẩn hóa
      for (let i = 0; i < rows; i++) {
        normalizedMatrix[i][j] = matrix[i][j] / norm;
      }
    }
  
    return normalizedMatrix;
  }
  
  /**
   * Áp dụng trọng số vào ma trận chuẩn hóa
   */
  function applyWeights(normalizedMatrix: number[][], weights: number[]): number[][] {
    const rows = normalizedMatrix.length;
    const cols = normalizedMatrix[0].length;
    const weightedMatrix: number[][] = [];
  
    for (let i = 0; i < rows; i++) {
      weightedMatrix[i] = Array(cols).fill(0);
      for (let j = 0; j < cols; j++) {
        weightedMatrix[i][j] = normalizedMatrix[i][j] * weights[j];
      }
    }
  
    return weightedMatrix;
  }
  
  /**
   * Xác định các giải pháp lý tưởng và tiêu cực
   */
  function findIdealSolutions(
    weightedMatrix: number[][], 
    criteriaTypes: ('benefit' | 'cost')[]
  ): { ideal: number[], negative: number[] } {
    const rows = weightedMatrix.length;
    const cols = weightedMatrix[0].length;
  
    const ideal: number[] = Array(cols).fill(0);
    const negative: number[] = Array(cols).fill(0);
  
    for (let j = 0; j < cols; j++) {
      let columnValues: number[] = [];
      for (let i = 0; i < rows; i++) {
        columnValues.push(weightedMatrix[i][j]);
      }
  
      if (criteriaTypes[j] === 'benefit') {
        ideal[j] = Math.max(...columnValues);
        negative[j] = Math.min(...columnValues);
      } else { // 'cost'
        ideal[j] = Math.min(...columnValues);
        negative[j] = Math.max(...columnValues);
      }
    }
  
    return { ideal, negative };
  }
  
  /**
   * Tính khoảng cách đến giải pháp lý tưởng và tiêu cực
   */
  function calculateDistances(
    weightedMatrix: number[][], 
    ideal: number[], 
    negative: number[]
  ): { distanceToIdeal: number[], distanceToNegative: number[] } {
    const rows = weightedMatrix.length;
    const cols = weightedMatrix[0].length;
  
    const distanceToIdeal: number[] = Array(rows).fill(0);
    const distanceToNegative: number[] = Array(rows).fill(0);
  
    for (let i = 0; i < rows; i++) {
      let sumIdeal = 0;
      let sumNegative = 0;
  
      for (let j = 0; j < cols; j++) {
        sumIdeal += Math.pow(weightedMatrix[i][j] - ideal[j], 2);
        sumNegative += Math.pow(weightedMatrix[i][j] - negative[j], 2);
      }
  
      distanceToIdeal[i] = Math.sqrt(sumIdeal);
      distanceToNegative[i] = Math.sqrt(sumNegative);
    }
  
    return { distanceToIdeal, distanceToNegative };
  }
  
  /**
   * Tính độ gần tương đối và xếp hạng các giải pháp
   */
  function calculateRelativeCloseness(
    distanceToIdeal: number[], 
    distanceToNegative: number[]
  ): { relativeCloseness: number[], rankedIndices: number[] } {
    const rows = distanceToIdeal.length;
    const relativeCloseness: number[] = Array(rows).fill(0);
  
    for (let i = 0; i < rows; i++) {
      relativeCloseness[i] = distanceToNegative[i] / (distanceToIdeal[i] + distanceToNegative[i]);
    }
  
    // Tạo mảng chỉ số và sắp xếp theo độ gần tương đối giảm dần
    const rankedIndices = Array.from({ length: rows }, (_, i) => i);
    rankedIndices.sort((a, b) => relativeCloseness[b] - relativeCloseness[a]);
  
    return { relativeCloseness, rankedIndices };
  }
  
  /**
   * Hàm thực hiện đầy đủ quy trình TOPSIS
   */
  export function calculateTOPSIS(topsisMatrix: TopsisMatrix): TopsisResult {
    const { matrix, weights, criteriaTypes, drugLabels, criteriaLabels } = topsisMatrix;
    
    // Bước 2: Chuẩn hóa ma trận quyết định
    const normalizedMatrix = normalizeMatrix(matrix);
    
    // Bước 4: Áp dụng trọng số vào ma trận chuẩn hóa
    const weightedNormalizedMatrix = applyWeights(normalizedMatrix, weights);
    
    // Bước 5: Xác định các giải pháp lý tưởng và tiêu cực
    const { ideal, negative } = findIdealSolutions(weightedNormalizedMatrix, criteriaTypes);
    
    // Bước 6: Tính khoảng cách đến giải pháp lý tưởng và tiêu cực
    const { distanceToIdeal, distanceToNegative } = calculateDistances(
      weightedNormalizedMatrix, 
      ideal, 
      negative
    );
    
    // Bước 7: Tính độ gần tương đối và xếp hạng các giải pháp
    const { relativeCloseness, rankedIndices } = calculateRelativeCloseness(
      distanceToIdeal, 
      distanceToNegative
    );
    
    return {
      matrix,
      normalizedMatrix,
      weightedNormalizedMatrix,
      idealSolution: ideal,
      negativeSolution: negative,
      distanceToIdeal,
      distanceToNegative,
      relativeCloseness,
      rankedIndices,
      drugLabels,
      criteriaLabels,
      weights,
      criteriaTypes
    };
  }
  
  // Dữ liệu mẫu cho thuốc đái tháo đường
  export const defaultDrugMatrix: TopsisMatrix = {
    drugLabels: [
      "Metformin", 
      "Sulfonylureas", 
      "Thiazolidinediones", 
      "DPP-4 inhibitors", 
      "SGLT2 inhibitors", 
      "GLP-1 receptor agonists", 
      "Insulin"
    ],
    criteriaLabels: [
      "Hypoglycemia Risk", 
      "Weight Effect", 
      "Renal/GU Effect", 
      "GI Side Effects", 
      "CHF Risk", 
      "CVD Effect", 
      "Bone Effect", 
      "Cost"
    ],
    matrix: [
      [1, 7, 1, 1, 1, 1, 9], // Hypoglycemia Risk (1 = low, 10 = high)
      [3, 6, 7, 4, 1, 1, 6], // Weight Effect (1 = weight loss, 10 = weight gain)
      [3, 2, 1, 2, 8, 1, 2], // Renal/GU Effect (1 = favorable, 10 = unfavorable)
      [7, 2, 1, 3, 1, 6, 1], // GI Side Effects (1 = minimal, 10 = severe)
      [1, 2, 9, 3, 2, 1, 3], // CHF Risk (1 = low, 10 = high)
      [5, 5, 4, 5, 1, 1, 5], // CVD Effect (1 = beneficial, 10 = harmful)
      [2, 2, 8, 2, 2, 2, 2], // Bone Effect (1 = low fracture risk, 10 = high)
      [1, 2, 6, 8, 9, 10, 7]  // Cost (1 = inexpensive, 10 = expensive)
    ],
    weights: [0.18, 0.15, 0.12, 0.10, 0.12, 0.15, 0.08, 0.10],
    criteriaTypes: [
      'cost', // Hypoglycemia - thấp là tốt
      'cost', // Weight - thấp là tốt (ưu tiên giảm cân)
      'cost', // Renal/GU - thấp là tốt (ít tác dụng phụ)
      'cost', // GI Side Effects - thấp là tốt (ít tác dụng phụ)
      'cost', // CHF Risk - thấp là tốt
      'cost', // CVD Effect - thấp là tốt (có lợi)
      'cost', // Bone Effect - thấp là tốt (ít nguy cơ gãy xương)
      'cost'  // Cost - thấp là tốt (ít chi phí)
    ]
  };