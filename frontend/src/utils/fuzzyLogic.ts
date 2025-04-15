export interface FuzzySet {
  name: string;
  // Hàm thành viên - nhận giá trị crisp và trả về mức độ thành viên (0-1)
  membershipFunction: (x: number) => number;
  // Giá trị đại diện của tập mờ
  representativeValue?: number;
  // Mô tả ngữ nghĩa của tập mờ
  description?: string;
}

/**
 * Giao diện định nghĩa một giá trị mờ hóa
 */
export interface FuzzifiedValue {
  setName: string;
  membershipDegree: number;
  // Thêm biểu diễn đồ họa
  graphPoints?: {x: number[], y: number[]}; // Dùng cho biểu diễn biểu đồ
}

/**
 * Giao diện định nghĩa một luật mờ
 */
export interface FuzzyRule {
  id: string; // ID duy nhất của luật
  description: string; // Mô tả rõ ràng về luật
  inputs: {
    hypoglycemiaRisk?: string;
    diseaseDuration?: string;
    lifeExpectancy?: string;
    comorbidities?: string;
    vascularComplications?: string;
    patientAttitude?: string;
    resourcesSupport?: string;
  };
  output: string;
  weight: number; // Trọng số của luật (0-1)
}

/**
 * Giao diện cho kết quả một luật được kích hoạt
 */
export interface RuleActivation {
  rule: FuzzyRule;
  activation: number; // Mức độ kích hoạt (0-1)
  outputSet: string; // Tập mờ đầu ra
  explanation: string; // Giải thích lý do tại sao luật này được kích hoạt
}

/**
 * Kết quả quá trình tính toán logic mờ
 */
export interface FuzzyCalculationResult {
  // Kết quả mờ hóa đầu vào
  fuzzifiedInputs: {
    hypoglycemiaRisk: FuzzifiedValue[];
    diseaseDuration: FuzzifiedValue[];
    lifeExpectancy: FuzzifiedValue[];
    comorbidities: FuzzifiedValue[];
    vascularComplications: FuzzifiedValue[];
    patientAttitude: FuzzifiedValue[];
    resourcesSupport: FuzzifiedValue[];
  };
  // Luật được kích hoạt
  ruleActivations: RuleActivation[];
  // Đầu ra sau khi khử mờ
  defuzzifiedOutput: {
    crispValue: number;
    aggregatedMembershipFunction: {x: number[], y: number[]}; // Cho biểu đồ tổng hợp
    centroidCalculation: {x: number, weightedSum: number, weightSum: number};
  };
  // Giá trị HbA1c target cuối cùng
  hba1cTarget: number;
}

// 2. ĐỊNH NGHĨA CÁC TẬP MỜ ĐẦU VÀO
// ===========================================

/**
 * Tạo các tập mờ đầu vào cho tất cả các biến
 */
export const createInputFuzzySets = () => {
  // Nguy cơ hạ đường huyết (0-4 scale)
  const hypoglycemiaRiskSets: FuzzySet[] = [
    {
      name: 'Low',
      description: 'Nguy cơ hạ đường huyết thấp',
      representativeValue: 0,
      membershipFunction: (x: number) => x <= 0 ? 1 : x <= 1 ? 1 - x : 0
    },
    {
      name: 'Low-Medium',
      description: 'Nguy cơ hạ đường huyết thấp đến trung bình',
      representativeValue: 1,
      membershipFunction: (x: number) => 
        x <= 0 ? 0 : 
        x <= 1 ? x : 
        x <= 2 ? 2 - x : 0
    },
    {
      name: 'Medium',
      description: 'Nguy cơ hạ đường huyết trung bình',
      representativeValue: 2,
      membershipFunction: (x: number) => 
        x <= 1 ? 0 : 
        x <= 2 ? x - 1 : 
        x <= 3 ? 3 - x : 0
    },
    {
      name: 'Medium-High',
      description: 'Nguy cơ hạ đường huyết trung bình đến cao',
      representativeValue: 3,
      membershipFunction: (x: number) => 
        x <= 2 ? 0 : 
        x <= 3 ? x - 2 : 
        x <= 4 ? 4 - x : 0
    },
    {
      name: 'High',
      description: 'Nguy cơ hạ đường huyết cao',
      representativeValue: 4,
      membershipFunction: (x: number) => x <= 3 ? 0 : x <= 4 ? x - 3 : 1
    }
  ];

  // Thời gian mắc bệnh (0-4 scale)
  const diseaseDurationSets: FuzzySet[] = [
    {
      name: 'Newly Diagnosed',
      description: 'Mới được chẩn đoán (< 1 năm)',
      representativeValue: 0,
      membershipFunction: (x: number) => x <= 0 ? 1 : x <= 1 ? 1 - x : 0
    },
    {
      name: 'Short',
      description: 'Thời gian ngắn (1-5 năm)',
      representativeValue: 1,
      membershipFunction: (x: number) => 
        x <= 0 ? 0 : 
        x <= 1 ? x : 
        x <= 2 ? 2 - x : 0
    },
    {
      name: 'Moderate',
      description: 'Thời gian trung bình (5-10 năm)',
      representativeValue: 2,
      membershipFunction: (x: number) => 
        x <= 1 ? 0 : 
        x <= 2 ? x - 1 : 
        x <= 3 ? 3 - x : 0
    },
    {
      name: 'Extended',
      description: 'Thời gian kéo dài (10-15 năm)',
      representativeValue: 3,
      membershipFunction: (x: number) => 
        x <= 2 ? 0 : 
        x <= 3 ? x - 2 : 
        x <= 4 ? 4 - x : 0
    },
    {
      name: 'Long-Standing',
      description: 'Thời gian rất dài (>15 năm)',
      representativeValue: 4,
      membershipFunction: (x: number) => x <= 3 ? 0 : x <= 4 ? x - 3 : 1
    }
  ];

  // Tuổi thọ (0-4 scale)
  const lifeExpectancySets: FuzzySet[] = [
    {
      name: 'Very Long',
      description: 'Tuổi thọ dự kiến rất dài (>15 năm)',
      representativeValue: 0,
      membershipFunction: (x: number) => x <= 0 ? 1 : x <= 1 ? 1 - x : 0
    },
    {
      name: 'Long',
      description: 'Tuổi thọ dự kiến dài (10-15 năm)',
      representativeValue: 1,
      membershipFunction: (x: number) => 
        x <= 0 ? 0 : 
        x <= 1 ? x : 
        x <= 2 ? 2 - x : 0
    },
    {
      name: 'Moderate',
      description: 'Tuổi thọ dự kiến trung bình (5-10 năm)',
      representativeValue: 2,
      membershipFunction: (x: number) => 
        x <= 1 ? 0 : 
        x <= 2 ? x - 1 : 
        x <= 3 ? 3 - x : 0
    },
    {
      name: 'Limited',
      description: 'Tuổi thọ dự kiến giới hạn (2-5 năm)',
      representativeValue: 3,
      membershipFunction: (x: number) => 
        x <= 2 ? 0 : 
        x <= 3 ? x - 2 : 
        x <= 4 ? 4 - x : 0
    },
    {
      name: 'Short',
      description: 'Tuổi thọ dự kiến ngắn (<2 năm)',
      representativeValue: 4,
      membershipFunction: (x: number) => x <= 3 ? 0 : x <= 4 ? x - 3 : 1
    }
  ];

  // Bệnh đồng mắc (0-4 scale)
  const comorbiditiesSets: FuzzySet[] = [
    {
      name: 'Absent',
      description: 'Không có bệnh đồng mắc',
      representativeValue: 0,
      membershipFunction: (x: number) => x <= 0 ? 1 : x <= 1 ? 1 - x : 0
    },
    {
      name: 'Minimal',
      description: 'Bệnh đồng mắc tối thiểu',
      representativeValue: 1,
      membershipFunction: (x: number) => 
        x <= 0 ? 0 : 
        x <= 1 ? x : 
        x <= 2 ? 2 - x : 0
    },
    {
      name: 'Mild',
      description: 'Bệnh đồng mắc nhẹ',
      representativeValue: 2,
      membershipFunction: (x: number) => 
        x <= 1 ? 0 : 
        x <= 2 ? x - 1 : 
        x <= 3 ? 3 - x : 0
    },
    {
      name: 'Moderate',
      description: 'Bệnh đồng mắc vừa',
      representativeValue: 3,
      membershipFunction: (x: number) => 
        x <= 2 ? 0 : 
        x <= 3 ? x - 2 : 
        x <= 4 ? 4 - x : 0
    },
    {
      name: 'Severe',
      description: 'Bệnh đồng mắc nặng',
      representativeValue: 4,
      membershipFunction: (x: number) => x <= 3 ? 0 : x <= 4 ? x - 3 : 1
    }
  ];

  // Biến chứng mạch máu (0-4 scale)
  const vascularComplicationsSets: FuzzySet[] = [
    {
      name: 'None',
      description: 'Không có biến chứng mạch máu',
      representativeValue: 0,
      membershipFunction: (x: number) => x <= 0 ? 1 : x <= 1 ? 1 - x : 0
    },
    {
      name: 'Minimal',
      description: 'Biến chứng mạch máu tối thiểu',
      representativeValue: 1,
      membershipFunction: (x: number) => 
        x <= 0 ? 0 : 
        x <= 1 ? x : 
        x <= 2 ? 2 - x : 0
    },
    {
      name: 'Mild',
      description: 'Biến chứng mạch máu nhẹ',
      representativeValue: 2,
      membershipFunction: (x: number) => 
        x <= 1 ? 0 : 
        x <= 2 ? x - 1 : 
        x <= 3 ? 3 - x : 0
    },
    {
      name: 'Moderate',
      description: 'Biến chứng mạch máu vừa',
      representativeValue: 3,
      membershipFunction: (x: number) => 
        x <= 2 ? 0 : 
        x <= 3 ? x - 2 : 
        x <= 4 ? 4 - x : 0
    },
    {
      name: 'Severe',
      description: 'Biến chứng mạch máu nặng',
      representativeValue: 4,
      membershipFunction: (x: number) => x <= 3 ? 0 : x <= 4 ? x - 3 : 1
    }
  ];

  // Thái độ của bệnh nhân (0-4 scale)
  const patientAttitudeSets: FuzzySet[] = [
    {
      name: 'Highly motivated',
      description: 'Bệnh nhân rất có động lực',
      representativeValue: 0,
      membershipFunction: (x: number) => x <= 0 ? 1 : x <= 1 ? 1 - x : 0
    },
    {
      name: 'Very motivated',
      description: 'Bệnh nhân có động lực cao',
      representativeValue: 1,
      membershipFunction: (x: number) => 
        x <= 0 ? 0 : 
        x <= 1 ? x : 
        x <= 2 ? 2 - x : 0
    },
    {
      name: 'Moderately motivated',
      description: 'Bệnh nhân có động lực trung bình',
      representativeValue: 2,
      membershipFunction: (x: number) => 
        x <= 1 ? 0 : 
        x <= 2 ? x - 1 : 
        x <= 3 ? 3 - x : 0
    },
    {
      name: 'Somewhat motivated',
      description: 'Bệnh nhân có ít động lực',
      representativeValue: 3,
      membershipFunction: (x: number) => 
        x <= 2 ? 0 : 
        x <= 3 ? x - 2 : 
        x <= 4 ? 4 - x : 0
    },
    {
      name: 'Less motivated',
      description: 'Bệnh nhân không có nhiều động lực',
      representativeValue: 4,
      membershipFunction: (x: number) => x <= 3 ? 0 : x <= 4 ? x - 3 : 1
    }
  ];

  // Nguồn lực và hệ thống hỗ trợ (0-4 scale)
  const resourcesSupportSets: FuzzySet[] = [
    {
      name: 'Readily available',
      description: 'Nguồn lực sẵn có đầy đủ',
      representativeValue: 0,
      membershipFunction: (x: number) => x <= 0 ? 1 : x <= 1 ? 1 - x : 0
    },
    {
      name: 'Available',
      description: 'Nguồn lực có sẵn',
      representativeValue: 1,
      membershipFunction: (x: number) => 
        x <= 0 ? 0 : 
        x <= 1 ? x : 
        x <= 2 ? 2 - x : 0
    },
    {
      name: 'Moderate',
      description: 'Nguồn lực trung bình',
      representativeValue: 2,
      membershipFunction: (x: number) => 
        x <= 1 ? 0 : 
        x <= 2 ? x - 1 : 
        x <= 3 ? 3 - x : 0
    },
    {
      name: 'Restricted',
      description: 'Nguồn lực hạn chế',
      representativeValue: 3,
      membershipFunction: (x: number) => 
        x <= 2 ? 0 : 
        x <= 3 ? x - 2 : 
        x <= 4 ? 4 - x : 0
    },
    {
      name: 'Limited',
      description: 'Nguồn lực rất hạn chế',
      representativeValue: 4,
      membershipFunction: (x: number) => x <= 3 ? 0 : x <= 4 ? x - 3 : 1
    }
  ];

  return {
    hypoglycemiaRiskSets,
    diseaseDurationSets,
    lifeExpectancySets,
    comorbiditiesSets,
    vascularComplicationsSets,
    patientAttitudeSets,
    resourcesSupportSets
  };
};

// 3. ĐỊNH NGHĨA CÁC TẬP MỜ ĐẦU RA
// ===========================================

/**
 * Tạo các tập mờ đầu ra cho mục tiêu HbA1c
 */
export const createOutputFuzzySets = () => {
  const hba1cTargetSets: FuzzySet[] = [
    {
      name: 'More-Stringent', 
      description: 'Kiểm soát nghiêm ngặt hơn (≤6.5%)',
      representativeValue: 6.5,
      membershipFunction: (x: number) => x <= 6.0 ? 1 : x <= 7.0 ? (7.0 - x) / 1.0 : 0
    },
    {
      name: 'Mild-Stringent', 
      description: 'Kiểm soát nghiêm ngặt vừa phải (~7.0%)',
      membershipFunction: (x: number) => 
        x <= 6.0 ? 0 : 
        x <= 7.0 ? (x - 6.0) / 1.0 : 
        x <= 7.5 ? (7.5 - x) / 0.5 : 0
    },
    {
      name: 'Less-Stringent',
      description: 'Kiểm soát ít nghiêm ngặt hơn (~7.5%)',
      representativeValue: 7.5,
      membershipFunction: (x: number) => 
        x <= 7.0 ? 0 : 
        x <= 7.5 ? (x - 7.0) / 0.5 : 
        x <= 8.0 ? (8.0 - x) / 0.5 : 0
    },
    {
      name: 'Very-Less-Stringent',
      description: 'Kiểm soát rất ít nghiêm ngặt (≥8.0%)',
      representativeValue: 8.0,
      membershipFunction: (x: number) => x <= 7.5 ? 0 : x <= 8.5 ? (x - 7.5) / 1.0 : 1
    }
  ];

  return hba1cTargetSets;
};

// 4. ĐỊNH NGHĨA CÁC LUẬT MỜ
// ===========================================

/**
 * Tạo danh sách các luật mờ
 */
export const createFuzzyRules = (): FuzzyRule[] => {
  return [
    // Các luật về nguy cơ hạ đường huyết
    { 
      id: "R1",
      description: "Nếu nguy cơ hạ đường huyết cao thì mục tiêu HbA1c ít nghiêm ngặt hơn",
      inputs: { hypoglycemiaRisk: 'High' }, 
      output: 'Less-Stringent', 
      weight: 0.9 
    },
    { 
      id: "R2",
      description: "Nếu nguy cơ hạ đường huyết thấp và không có bệnh đồng mắc và không có biến chứng mạch máu thì mục tiêu HbA1c nghiêm ngặt hơn",
      inputs: { 
        hypoglycemiaRisk: 'Low',
        comorbidities: 'Absent',
        vascularComplications: 'None'
      }, 
      output: 'More-Stringent', 
      weight: 0.9 
    },
    
    // Các luật về thời gian mắc bệnh
    { 
      id: "R3",
      description: "Nếu thời gian mắc bệnh kéo dài thì mục tiêu HbA1c ít nghiêm ngặt hơn",
      inputs: { diseaseDuration: 'Long-Standing' }, 
      output: 'Less-Stringent', 
      weight: 0.8 
    },
    { 
      id: "R4",
      description: "Nếu mới được chẩn đoán thì mục tiêu HbA1c nghiêm ngặt hơn",
      inputs: { diseaseDuration: 'Newly Diagnosed' }, 
      output: 'More-Stringent', 
      weight: 0.8 
    },
    
    // Các luật về tuổi thọ dự kiến
    { 
      id: "R5",
      description: "Nếu tuổi thọ ngắn thì mục tiêu HbA1c ít nghiêm ngặt hơn",
      inputs: { lifeExpectancy: 'Short' }, 
      output: 'Less-Stringent', 
      weight: 0.9 
    },
    { 
      id: "R6",
      description: "Nếu tuổi thọ dài thì mục tiêu HbA1c nghiêm ngặt hơn",
      inputs: { lifeExpectancy: 'Long' }, 
      output: 'More-Stringent', 
      weight: 0.8 
    },
    
    // Các luật về bệnh đồng mắc
    { 
      id: "R7",
      description: "Nếu bệnh đồng mắc nặng thì mục tiêu HbA1c ít nghiêm ngặt hơn",
      inputs: { comorbidities: 'Severe' }, 
      output: 'Less-Stringent', 
      weight: 0.8 
    },
    { 
      id: "R8",
      description: "Nếu bệnh đồng mắc nhẹ thì mục tiêu HbA1c nghiêm ngặt vừa phải",
      inputs: { comorbidities: 'Mild' }, 
      output: 'Mild-Stringent', 
      weight: 0.7 
    },
    
    // Các luật về biến chứng mạch máu
    { 
      id: "R9",
      description: "Nếu biến chứng mạch máu nặng thì mục tiêu HbA1c ít nghiêm ngặt hơn",
      inputs: { vascularComplications: 'Severe' }, 
      output: 'Less-Stringent', 
      weight: 0.8 
    },
    { 
      id: "R10",
      description: "Nếu biến chứng mạch máu nhẹ thì mục tiêu HbA1c nghiêm ngặt vừa phải",
      inputs: { vascularComplications: 'Mild' }, 
      output: 'Mild-Stringent', 
      weight: 0.7 
    },
    
    // Các luật về thái độ bệnh nhân
    { 
      id: "R11",
      description: "Nếu bệnh nhân rất có động lực thì mục tiêu HbA1c nghiêm ngặt hơn",
      inputs: { patientAttitude: 'Highly motivated' }, 
      output: 'More-Stringent', 
      weight: 0.9 
    },
    
    // Các luật về nguồn lực và hỗ trợ
    { 
      id: "R12",
      description: "Nếu nguồn lực đầy đủ thì mục tiêu HbA1c nghiêm ngặt hơn",
      inputs: { resourcesSupport: 'Readily available' }, 
      output: 'More-Stringent', 
      weight: 0.7 
    },
    
    // Luật kết hợp các yếu tố
    { 
      id: "R13",
      description: "Nếu bệnh đồng mắc nhẹ và biến chứng mạch máu nhẹ thì mục tiêu HbA1c ít nghiêm ngặt hơn",
      inputs: { 
        comorbidities: 'Mild', 
        vascularComplications: 'Mild' 
      }, 
      output: 'Less-Stringent', 
      weight: 0.8 
    }
  ];
};

// 5. BƯỚC 1: MỜ HÓA CÁC GIÁ TRỊ ĐẦU VÀO
// ===========================================

/**
 * Mờ hóa giá trị đầu vào - BƯỚC 1 của logic mờ
 * @param crisp Giá trị rõ (0-4)
 * @param fuzzySets Các tập mờ để đánh giá thành viên
 * @returns Danh sách các giá trị mờ có chứa mức độ thành viên
 */
export const fuzzify = (
  crisp: number, 
  fuzzySets: FuzzySet[]
): FuzzifiedValue[] => {
  // Tính toán mức độ thành viên trong mỗi tập mờ
  const fuzzifiedValues = fuzzySets.map(set => {
    const membershipDegree = set.membershipFunction(crisp);
    
    // Tạo dữ liệu điểm cho biểu đồ hiển thị
    const graphPoints = {
      x: Array.from({length: 41}, (_, i) => i / 10), // Tạo điểm từ 0-4 với bước 0.1
      y: Array.from({length: 41}, (_, i) => set.membershipFunction(i / 10))
    };
    
    return {
      setName: set.name,
      membershipDegree,
      graphPoints
    };
  });
  
  // Chỉ trả về các tập có mức độ thành viên > 0
  return fuzzifiedValues.filter(v => v.membershipDegree > 0);
};

/**
 * Mờ hóa tất cả các giá trị đầu vào - BƯỚC 1 đầy đủ
 */
export const fuzzifyAllInputs = (
  hypoglycemiaRisk: number,
  diseaseDuration: number,
  lifeExpectancy: number,
  comorbidities: number,
  vascularComplications: number,
  patientAttitude: number,
  resourcesSupport: number
) => {
  const inputSets = createInputFuzzySets();
  
  return {
    hypoglycemiaRisk: fuzzify(hypoglycemiaRisk, inputSets.hypoglycemiaRiskSets),
    diseaseDuration: fuzzify(diseaseDuration, inputSets.diseaseDurationSets),
    lifeExpectancy: fuzzify(lifeExpectancy, inputSets.lifeExpectancySets),
    comorbidities: fuzzify(comorbidities, inputSets.comorbiditiesSets),
    vascularComplications: fuzzify(vascularComplications, inputSets.vascularComplicationsSets),
    patientAttitude: fuzzify(patientAttitude, inputSets.patientAttitudeSets),
    resourcesSupport: fuzzify(resourcesSupport, inputSets.resourcesSupportSets)
  };
};

// 6. BƯỚC 2: ÁP DỤNG CÁC LUẬT MỜ (FUZZY REASONING)
// ===========================================

/**
 * Đánh giá mức độ kích hoạt của một luật mờ - BƯỚC 2 của logic mờ
 */
export const evaluateRule = (
  rule: FuzzyRule,
  fuzzifiedInputs: ReturnType<typeof fuzzifyAllInputs>
): RuleActivation => {
  let activationLevel = 1; // Sử dụng toán tử MIN cho AND
  let explanation = "Luật được kích hoạt vì ";
  let hasExplanation = false;
  
  // Kiểm tra mỗi đầu vào trong luật
  if (rule.inputs.hypoglycemiaRisk) {
    const matchingFuzzifiedValue = fuzzifiedInputs.hypoglycemiaRisk.find(
      fv => fv.setName === rule.inputs.hypoglycemiaRisk
    );
    if (matchingFuzzifiedValue) {
      activationLevel = Math.min(activationLevel, matchingFuzzifiedValue.membershipDegree);
      explanation += `nguy cơ hạ đường huyết '${rule.inputs.hypoglycemiaRisk}' (${Math.round(matchingFuzzifiedValue.membershipDegree * 100)}%), `;
      hasExplanation = true;
    } else {
      // Không tìm thấy tập mờ phù hợp cho đầu vào này
      return {
        rule,
        activation: 0,
        outputSet: rule.output,
        explanation: "Luật không được kích hoạt vì điều kiện nguy cơ hạ đường huyết không khớp"
      };
    }
  }
  
  if (rule.inputs.diseaseDuration) {
    const matchingFuzzifiedValue = fuzzifiedInputs.diseaseDuration.find(
      fv => fv.setName === rule.inputs.diseaseDuration
    );
    if (matchingFuzzifiedValue) {
      activationLevel = Math.min(activationLevel, matchingFuzzifiedValue.membershipDegree);
      explanation += `thời gian mắc bệnh '${rule.inputs.diseaseDuration}' (${Math.round(matchingFuzzifiedValue.membershipDegree * 100)}%), `;
      hasExplanation = true;
    } else {
      return {
        rule,
        activation: 0,
        outputSet: rule.output,
        explanation: "Luật không được kích hoạt vì điều kiện thời gian mắc bệnh không khớp"
      };
    }
  }
  
  if (rule.inputs.lifeExpectancy) {
    const matchingFuzzifiedValue = fuzzifiedInputs.lifeExpectancy.find(
      fv => fv.setName === rule.inputs.lifeExpectancy
    );
    if (matchingFuzzifiedValue) {
      activationLevel = Math.min(activationLevel, matchingFuzzifiedValue.membershipDegree);
      explanation += `tuổi thọ dự kiến '${rule.inputs.lifeExpectancy}' (${Math.round(matchingFuzzifiedValue.membershipDegree * 100)}%), `;
      hasExplanation = true;
    } else {
      return {
        rule,
        activation: 0,
        outputSet: rule.output,
        explanation: "Luật không được kích hoạt vì điều kiện tuổi thọ không khớp"
      };
    }
  }
  
  if (rule.inputs.comorbidities) {
    const matchingFuzzifiedValue = fuzzifiedInputs.comorbidities.find(
      fv => fv.setName === rule.inputs.comorbidities
    );
    if (matchingFuzzifiedValue) {
      activationLevel = Math.min(activationLevel, matchingFuzzifiedValue.membershipDegree);
      explanation += `tình trạng bệnh đồng mắc '${rule.inputs.comorbidities}' (${Math.round(matchingFuzzifiedValue.membershipDegree * 100)}%), `;
      hasExplanation = true;
    } else {
      return {
        rule,
        activation: 0,
        outputSet: rule.output,
        explanation: "Luật không được kích hoạt vì điều kiện bệnh đồng mắc không khớp"
      };
    }
  }
  
  if (rule.inputs.vascularComplications) {
    const matchingFuzzifiedValue = fuzzifiedInputs.vascularComplications.find(
      fv => fv.setName === rule.inputs.vascularComplications
    );
    if (matchingFuzzifiedValue) {
      activationLevel = Math.min(activationLevel, matchingFuzzifiedValue.membershipDegree);
      explanation += `biến chứng mạch máu '${rule.inputs.vascularComplications}' (${Math.round(matchingFuzzifiedValue.membershipDegree * 100)}%), `;
      hasExplanation = true;
    } else {
      return {
        rule,
        activation: 0,
        outputSet: rule.output,
        explanation: "Luật không được kích hoạt vì điều kiện biến chứng mạch máu không khớp"
      };
    }
  }
  
  if (rule.inputs.patientAttitude) {
    const matchingFuzzifiedValue = fuzzifiedInputs.patientAttitude.find(
      fv => fv.setName === rule.inputs.patientAttitude
    );
    if (matchingFuzzifiedValue) {
      activationLevel = Math.min(activationLevel, matchingFuzzifiedValue.membershipDegree);
      explanation += `thái độ bệnh nhân '${rule.inputs.patientAttitude}' (${Math.round(matchingFuzzifiedValue.membershipDegree * 100)}%), `;
      hasExplanation = true;
    } else {
      return {
        rule,
        activation: 0,
        outputSet: rule.output,
        explanation: "Luật không được kích hoạt vì điều kiện thái độ bệnh nhân không khớp"
      };
    }
  }
  
  if (rule.inputs.resourcesSupport) {
    const matchingFuzzifiedValue = fuzzifiedInputs.resourcesSupport.find(
      fv => fv.setName === rule.inputs.resourcesSupport
    );
    if (matchingFuzzifiedValue) {
      activationLevel = Math.min(activationLevel, matchingFuzzifiedValue.membershipDegree);
      explanation += `nguồn lực hỗ trợ '${rule.inputs.resourcesSupport}' (${Math.round(matchingFuzzifiedValue.membershipDegree * 100)}%), `;
      hasExplanation = true;
    } else {
      return {
        rule,
        activation: 0,
        outputSet: rule.output,
        explanation: "Luật không được kích hoạt vì điều kiện nguồn lực hỗ trợ không khớp"
      };
    }
  }
  
  // Nhân với trọng số của luật
  const weightedActivation = activationLevel * rule.weight;
  
  // Hoàn thiện giải thích
  if (hasExplanation) {
    explanation = explanation.slice(0, -2); // Loại bỏ dấu phẩy và khoảng trắng cuối cùng
  } else {
    explanation = "Luật được kích hoạt với mức độ thấp";
  }
  
  return {
    rule,
    activation: weightedActivation,
    outputSet: rule.output,
    explanation: `${explanation}. Mức độ kích hoạt cuối cùng: ${Math.round(weightedActivation * 100)}%`
  };
};

/**
 * Đánh giá tất cả các luật mờ - BƯỚC 2 đầy đủ
 */
export const evaluateAllRules = (
  fuzzifiedInputs: ReturnType<typeof fuzzifyAllInputs>
): RuleActivation[] => {
  const rules = createFuzzyRules();
  
  // Đánh giá từng luật và lọc ra những luật có mức kích hoạt > 0
  const ruleActivations = rules
    .map(rule => evaluateRule(rule, fuzzifiedInputs))
    .filter(activation => activation.activation > 0);
  
  // Sắp xếp theo mức độ kích hoạt giảm dần
  return ruleActivations.sort((a, b) => b.activation - a.activation);
};

// 7. BƯỚC 3: TỔNG HỢP ĐẦU RA (AGGREGATION)
// ===========================================

/**
 * Tổng hợp đầu ra từ các luật được kích hoạt - BƯỚC 3 của logic mờ
 */
export const aggregateOutputs = (
  ruleActivations: RuleActivation[]
): {x: number[], y: number[]} => {
  // Nếu không có luật nào được kích hoạt
  if (ruleActivations.length === 0) {
    return { x: [], y: [] };
  }
  
  const outputSets = createOutputFuzzySets();
  
  // Tạo mảng giá trị x từ 6.0 đến 8.5 với bước 0.1
  const xValues = Array.from({length: 26}, (_, i) => 6.0 + i * 0.1);
  
  // Tính toán giá trị y cho mỗi điểm x bằng phương pháp MAX
  const yValues = xValues.map(x => {
    let maxMembershipValue = 0;
    
    // Với mỗi luật được kích hoạt
    ruleActivations.forEach(activation => {
      // Tìm tập mờ đầu ra tương ứng
      const outputSet = outputSets.find(set => set.name === activation.outputSet);
      
      if (outputSet) {
        // Tính giá trị thành viên cho x, giới hạn bởi mức độ kích hoạt luật
        const membershipValue = Math.min(
          outputSet.membershipFunction(x),
          activation.activation
        );
        
        // Lấy giá trị MAX giữa tất cả các luật
        maxMembershipValue = Math.max(maxMembershipValue, membershipValue);
      }
    });
    
    return maxMembershipValue;
  });
  
  return { x: xValues, y: yValues };
};

// 8. BƯỚC 4: KHỬ MỜ (DEFUZZIFICATION)
// ===========================================

/**
 * Phương pháp khử mờ trọng tâm - BƯỚC 4 của logic mờ
 */
export const defuzzify = (
  aggregatedOutput: {x: number[], y: number[]}
): {crispValue: number, centroidCalculation: {x: number, weightedSum: number, weightSum: number}} => {
  const { x, y } = aggregatedOutput;
  
  // Nếu không có điểm nào, trả về giá trị mặc định
  if (x.length === 0 || y.length === 0) {
    return {
      crispValue: 7.0,
      centroidCalculation: {x: 7.0, weightedSum: 0, weightSum: 0}
    };
  }
  
  // Tính tổng trọng số
  let weightSum = 0;
  // Tính tổng trọng số * giá trị
  let weightedSum = 0;
  
  // Vòng lặp qua từng điểm
  for (let i = 0; i < x.length; i++) {
    weightSum += y[i];
    weightedSum += x[i] * y[i];
  }
  
  // Nếu weightSum = 0, trả về giá trị mặc định
  if (weightSum === 0) {
    return {
      crispValue: 7.0,
      centroidCalculation: {x: 7.0, weightedSum: 0, weightSum: 0}
    };
  }
  
  // Tính giá trị crisp là trọng tâm của diện tích
  const centroidX = weightedSum / weightSum;
  
  // Đảm bảo kết quả nằm trong khoảng hợp lý
  const crispValue = Math.max(6.0, Math.min(8.5, centroidX));
  
  // Làm tròn đến 1 chữ số thập phân
  const roundedValue = Math.round(crispValue * 10) / 10;
  
  return {
    crispValue: roundedValue,
    centroidCalculation: {
      x: centroidX,
      weightedSum,
      weightSum
    }
  };
};


// 9. QUY TRÌNH TÍNH TOÁN HbA1c TARGET ĐẦY ĐỦ
// ===========================================

/**
 * Chuyển đổi giá trị ngôn ngữ thành giá trị số trong thang đo 0-4
 */
export const mapLanguageToNumeric = (
  hypoglycemiaRisk: string,
  diseaseDuration: number, // Đã là số năm
  lifeExpectancy: string,
  comorbidities: string,
  vascularComplications: string,
  patientAttitude: string,
  resourcesSupport: string
) => {
  // Chuyển đổi hypoglycemia risk
  let hypoglycemiaRiskValue: number;
  switch (hypoglycemiaRisk) {
    case 'Low': hypoglycemiaRiskValue = 0; break;
    case 'Low-Medium': hypoglycemiaRiskValue = 1; break;
    case 'Medium': hypoglycemiaRiskValue = 2; break;
    case 'Medium-High': hypoglycemiaRiskValue = 3; break;
    case 'High': hypoglycemiaRiskValue = 4; break;
    default: hypoglycemiaRiskValue = 2; // Default to Medium
  }
  
  // Chuyển đổi disease duration từ năm sang thang đo 0-4
  let diseaseDurationValue: number;
  if (diseaseDuration <= 1) diseaseDurationValue = 0; // Newly Diagnosed
  else if (diseaseDuration <= 5) diseaseDurationValue = 1; // Short
  else if (diseaseDuration <= 10) diseaseDurationValue = 2; // Moderate
  else if (diseaseDuration <= 15) diseaseDurationValue = 3; // Extended
  else diseaseDurationValue = 4; // Long-Standing
  
  // Chuyển đổi life expectancy
  let lifeExpectancyValue: number;
  switch (lifeExpectancy) {
    case 'Very Long': lifeExpectancyValue = 0; break;
    case 'Long': lifeExpectancyValue = 1; break;
    case 'Moderate': lifeExpectancyValue = 2; break;
    case 'Limited': lifeExpectancyValue = 3; break;
    case 'Short': lifeExpectancyValue = 4; break;
    default: lifeExpectancyValue = 2; // Default to Moderate
  }
  
  // Chuyển đổi comorbidities
  let comorbiditiesValue: number;
  switch (comorbidities) {
    case 'Absent': comorbiditiesValue = 0; break;
    case 'Minimal': comorbiditiesValue = 1; break;
    case 'Mild': comorbiditiesValue = 2; break;
    case 'Moderate': comorbiditiesValue = 3; break;
    case 'Severe': comorbiditiesValue = 4; break;
    default: comorbiditiesValue = 2; // Default to Mild
  }
  
  // Chuyển đổi vascular complications
  let vascularComplicationsValue: number;
  switch (vascularComplications) {
    case 'None': vascularComplicationsValue = 0; break;
    case 'Minimal': vascularComplicationsValue = 1; break;
    case 'Mild': vascularComplicationsValue = 2; break;
    case 'Moderate': vascularComplicationsValue = 3; break;
    case 'Severe': vascularComplicationsValue = 4; break;
    default: vascularComplicationsValue = 2; // Default to Mild
  }
  
  // Chuyển đổi patient attitude
  let patientAttitudeValue: number;
  switch (patientAttitude) {
    case 'Highly motivated': patientAttitudeValue = 0; break;
    case 'Very motivated': patientAttitudeValue = 1; break;
    case 'Moderately motivated': patientAttitudeValue = 2; break;
    case 'Somewhat motivated': patientAttitudeValue = 3; break;
    case 'Less motivated': patientAttitudeValue = 4; break;
    default: patientAttitudeValue = 2; // Default to Moderately motivated
  }
  
  // Chuyển đổi resources and support
  let resourcesSupportValue: number;
  switch (resourcesSupport) {
    case 'Readily available': resourcesSupportValue = 0; break;
    case 'Available': resourcesSupportValue = 1; break;
    case 'Moderate': resourcesSupportValue = 2; break;
    case 'Restricted': resourcesSupportValue = 3; break;
    case 'Limited': resourcesSupportValue = 4; break;
    default: resourcesSupportValue = 2; // Default to Moderate
  }
  
  return {
    hypoglycemiaRiskValue,
    diseaseDurationValue,
    lifeExpectancyValue,
    comorbiditiesValue,
    vascularComplicationsValue,
    patientAttitudeValue,
    resourcesSupportValue
  };
};

/**
 * Hàm tính toán đầy đủ theo quy trình logic mờ
 * 1. Chuyển đổi giá trị ngôn ngữ sang số
 * 2. Mờ hóa đầu vào
 * 3. Áp dụng luật mờ
 * 4. Tổng hợp đầu ra
 * 5. Khử mờ để có kết quả cuối cùng
 */
export const calculateHbA1cTarget = (
  hypoglycemiaRisk: string,
  diseaseDuration: number,
  lifeExpectancy: string,
  comorbidities: string,
  vascularComplications: string,
  patientAttitude: string,
  resourcesSupport: string = 'Moderate' // Giá trị mặc định nếu không cung cấp
): FuzzyCalculationResult => {
  // BƯỚC 0: Chuyển đổi giá trị ngôn ngữ sang thang đo 0-4
  const {
    hypoglycemiaRiskValue,
    diseaseDurationValue,
    lifeExpectancyValue,
    comorbiditiesValue,
    vascularComplicationsValue,
    patientAttitudeValue,
    resourcesSupportValue
  } = mapLanguageToNumeric(
    hypoglycemiaRisk,
    diseaseDuration,
    lifeExpectancy,
    comorbidities,
    vascularComplications,
    patientAttitude,
    resourcesSupport
  );
  
  // BƯỚC 1: Mờ hóa tất cả đầu vào
  const fuzzifiedInputs = fuzzifyAllInputs(
    hypoglycemiaRiskValue,
    diseaseDurationValue,
    lifeExpectancyValue,
    comorbiditiesValue,
    vascularComplicationsValue,
    patientAttitudeValue,
    resourcesSupportValue
  );
  
  // BƯỚC 2: Đánh giá tất cả luật mờ
  const ruleActivations = evaluateAllRules(fuzzifiedInputs);
  
  // BƯỚC 3: Tổng hợp đầu ra
  const aggregatedOutput = aggregateOutputs(ruleActivations);
  
  // BƯỚC 4: Khử mờ để có kết quả cuối cùng
  const defuzzifiedResult = defuzzify(aggregatedOutput);
  
  // Tạo kết quả cuối cùng
  const finalResult: FuzzyCalculationResult = {
    fuzzifiedInputs,
    ruleActivations,
    defuzzifiedOutput: {
      crispValue: defuzzifiedResult.crispValue,
      aggregatedMembershipFunction: aggregatedOutput,
      centroidCalculation: defuzzifiedResult.centroidCalculation
    },
    hba1cTarget: defuzzifiedResult.crispValue
  };
  
  return finalResult;
};

/**
 * Phiên bản đơn giản hơn của hàm tính toán target HbA1c
 * Chỉ trả về kết quả cuối cùng và các luật đã kích hoạt
 */
export const calculateHbA1cTargetSimplified = (
  hypoglycemiaRisk: string,
  diseaseDuration: number,
  lifeExpectancy: string,
  comorbidities: string,
  vascularComplications: string,
  patientAttitude: string,
  resourcesSupport: string = 'Moderate' // Giá trị mặc định nếu không cung cấp
): {
  target: number,
  ruleActivations: { rule: FuzzyRule, activation: number }[]
} => {
  const fullResult = calculateHbA1cTarget(
    hypoglycemiaRisk,
    diseaseDuration,
    lifeExpectancy,
    comorbidities,
    vascularComplications,
    patientAttitude,
    resourcesSupport
  );
  
  const simplifiedRuleActivations = fullResult.ruleActivations.map(ra => ({
    rule: ra.rule,
    activation: ra.activation
  }));
  
  return {
    target: fullResult.hba1cTarget,
    ruleActivations: simplifiedRuleActivations
  };
};