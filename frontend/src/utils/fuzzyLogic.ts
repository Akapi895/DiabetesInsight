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
  graphPoints?: { x: number[]; y: number[] }; // Dùng cho biểu diễn biểu đồ
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
    aggregatedMembershipFunction: { x: number[]; y: number[] }; // Cho biểu đồ tổng hợp
    centroidCalculation: { x: number; weightedSum: number; weightSum: number };
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
      name: "Low",
      description: "Nguy cơ hạ đường huyết thấp",
      representativeValue: 0,
      membershipFunction: (x: number) =>
        x <= 0.5 ? 1 : x <= 2.5 ? -0.5 * x + 1.25 : 0,
    },
    {
      name: "High",
      description: "Nguy cơ hạ đường huyết cao",
      representativeValue: 4,
      membershipFunction: (x: number) =>
        x <= 1.5 ? 0 : x <= 3.5 ? 0.5 * x - 0.75 : 1,
    },
  ];

  // Thời gian mắc bệnh (0-4 scale)
  const diseaseDurationSets: FuzzySet[] = [
    {
      name: "Newly-Diagnosed",
      description: "Mới được chẩn đoán",
      representativeValue: 0,
      membershipFunction: (x: number) =>
        x <= 0.5 ? 1 : x <= 2.5 ? -0.5 * x + 1.25 : 0,
    },
    {
      name: "Long-Standing",
      description: "Thời gian kéo dài",
      representativeValue: 4,
      membershipFunction: (x: number) =>
        x <= 1.5 ? 0 : x <= 3.5 ? 0.5 * x - 0.75 : 1,
    },
  ];

  // Tuổi thọ (0-4 scale)
  const lifeExpectancySets: FuzzySet[] = [
    {
      name: "Long",
      description: "Tuổi thọ dự kiến dài",
      representativeValue: 0,
      membershipFunction: (x: number) =>
        x <= 0.5 ? 1 : x <= 2.5 ? -0.5 * x + 1.25 : 0,
    },
    {
      name: "Short",
      description: "Tuổi thọ dự kiến ngắn",
      representativeValue: 4,
      membershipFunction: (x: number) =>
        x <= 1.5 ? 0 : x <= 3.5 ? 0.5 * x - 0.75 : 1,
    },
  ];

  // Bệnh lý đi kèm (0-4 scale)
  const comorbiditiesSets: FuzzySet[] = [
    {
      name: "Absent",
      description: "Bệnh lý nhẹ hoặc không có",
      representativeValue: 0,
      membershipFunction: (x: number) =>
        x <= 0.5 ? 1 : x <= 2.0 ? (-2 / 3) * x + 4 / 3 : 0,
    },
    {
      name: "Few-Or-Mild",
      description: "Bệnh lý vừa",
      representativeValue: 2,
      membershipFunction: (x: number) =>
        x <= 0.5 ? 0 : x <= 2.0 ? (2 / 3) * x - 1 / 3 : x <= 3.5 ? (-2 / 3) * x + 7 / 3 : 0,
    },
    {
      name: "Severe",
      description: "Bệnh lý nặng",
      representativeValue: 4,
      membershipFunction: (x: number) =>
        x <= 2.0 ? 0 : x <= 3.5 ? (2 / 3) * x - 4 / 3 : 1,
    },
  ];

  // Biến chứng mạch máu (0-4 scale)
  const vascularComplicationsSets: FuzzySet[] = [
    {
      name: "Absent",
      description: "Biến chứng mạch máu nhẹ hoặc không có",
      representativeValue: 0,
      membershipFunction: (x: number) =>
        x <= 0.5 ? 1 : x <= 2.0 ? (-2 / 3) * x + 4 / 3 : 0,
    },
    {
      name: "Few-Or-Mild",
      description: "Biến chứng mạch máu vừa",
      representativeValue: 2,
      membershipFunction: (x: number) =>
        x <= 0.5 ? 0 : x <= 2.0 ? (2 / 3) * x - 1 / 3 : x <= 3.5 ? (-2 / 3) * x + 7 / 3 : 0,
    },
    {
      name: "Severe",
      description: "Biến chứng mạch máu nặng",
      representativeValue: 4,
      membershipFunction: (x: number) =>
        x <= 2.0 ? 0 : x <= 3.5 ? (2 / 3) * x - 4 / 3 : 1,
    },
  ];

  // Thái độ của bệnh nhân (0-4 scale)
  const patientAttitudeSets: FuzzySet[] = [
    {
      name: "Highly-Motivated",
      description: "Động lực cao",
      representativeValue: 0,
      membershipFunction: (x: number) =>
        x <= 0.5 ? 1 : x <= 2.5 ? -0.5 * x + 1.25 : 0,
    },
    {
      name: "Less-Motivated",
      description: "Động lực kém",
      representativeValue: 4,
      membershipFunction: (x: number) =>
        x <= 1.5 ? 0 : x <= 3.5 ? 0.5 * x - 0.75 : 1,
    },
  ];

  // Nguồn lực và hệ thống hỗ trợ (0-4 scale)
  const resourcesSupportSets: FuzzySet[] = [
    {
      name: "Readily-Available",
      description: "Nguồn lực sẵn sàng",
      representativeValue: 0,
      membershipFunction: (x: number) =>
        x <= 0.5 ? 1 : x <= 2.5 ? -0.5 * x + 1.25 : 0,
    },
    {
      name: "Limited",
      description: "Nguồn lực bị giới hạn",
      representativeValue: 4,
      membershipFunction: (x: number) =>
        x <= 1.5 ? 0 : x <= 3.5 ? 0.5 * x - 0.75 : 1,
    },
  ];

  return {
    hypoglycemiaRiskSets,
    diseaseDurationSets,
    lifeExpectancySets,
    comorbiditiesSets,
    vascularComplicationsSets,
    patientAttitudeSets,
    resourcesSupportSets,
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
      name: "More-Stringent",
      description: "Kiểm soát nghiêm ngặt hơn",
      representativeValue: 6.5,
      membershipFunction: (x: number) =>
        x <= 6.5 ? 1 : x <= 7.5 ? -x + 7.5 : 0,
    },
    {
      name: "Mild-Stringent",
      description: "Kiểm soát nghiêm ngặt vừa phải",
      representativeValue: 7.7,
      membershipFunction: (x: number) =>
        x <= 6.5
          ? 0
          : x <= 7.7
          ? (5 / 6.0) * x - 65 / 12.0
          : x <= 9.0
          ? (-10 / 13.0) * x + 90 / 13.0
          : 0,
    },
    {
      name: "Less-Stringent",
      description: "Kiểm soát ít nghiêm ngặt hơn",
      representativeValue: 7.5,
      membershipFunction: (x: number) =>
        x <= 8.0 ? 0 : x <= 9.0 ? x - 8.0 : 1,
    },
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
    {
      id: "R1",
      description: "Nếu nguy cơ hạ đường huyết cao thì mục tiêu HbA1c ít nghiêm ngặt hơn",
      inputs: { hypoglycemiaRisk: "High" },
      output: "Less-Stringent",
      weight: 0.9,
    },
    {
      id: "R2",
      description: "Nếu thời gian mắc bệnh kéo dài thì mục tiêu HbA1c ít nghiêm ngặt hơn",
      inputs: { diseaseDuration: "Long-Standing" },
      output: "Less-Stringent",
      weight: 0.8,
    },
    {
      id: "R3",
      description: "Nếu tuổi thọ ngắn thì mục tiêu HbA1c ít nghiêm ngặt hơn",
      inputs: { lifeExpectancy: "Short" },
      output: "Less-Stringent",
      weight: 0.9,
    },
    {
      id: "R4",
      description: "Nếu bệnh lý nặng thì mục tiêu HbA1c ít nghiêm ngặt hơn",
      inputs: { comorbidities: "Severe" },
      output: "Less-Stringent",
      weight: 0.8,
    },
    {
      id: "R5",
      description: "Nếu biến chứng mạch máu nặng thì mục tiêu HbA1c ít nghiêm ngặt hơn",
      inputs: { vascularComplications: "Severe" },
      output: "Less-Stringent",
      weight: 0.8,
    },
    {
      id: "R6",
      description: "Nếu mới được chẩn đoán thì mục tiêu HbA1c nghiêm ngặt hơn",
      inputs: { diseaseDuration: "Newly-Diagnosed" },
      output: "More-Stringent",
      weight: 0.8,
    },
    {
      id: "R7",
      description: "Nếu tuổi thọ dài thì mục tiêu HbA1c nghiêm ngặt hơn",
      inputs: { lifeExpectancy: "Long" },
      output: "More-Stringent",
      weight: 0.8,
    },
    {
      id: "R8",
      description: "Nếu bệnh nhân rất có động lực thì mục tiêu HbA1c nghiêm ngặt hơn",
      inputs: { patientAttitude: "Highly-Motivated" },
      output: "More-Stringent",
      weight: 0.9,
    },
    {
      id: "R9",
      description: "Nếu nguồn lực sẵn sàng thì mục tiêu HbA1c nghiêm ngặt hơn",
      inputs: { resourcesSupport: "Readily-Available" },
      output: "More-Stringent",
      weight: 0.7,
    },
    {
      id: "R10",
      description:
        "Nếu nguy cơ hạ đường huyết thấp và không có bệnh đồng mắc và không có biến chứng mạch máu thì mục tiêu HbA1c nghiêm ngặt hơn",
      inputs: {
        hypoglycemiaRisk: "Low",
        comorbidities: "Absent",
        vascularComplications: "Absent",
      },
      output: "More-Stringent",
      weight: 0.9,
    },
    {
      id: "R11",
      description: "Nếu bệnh lý nhẹ thì mục tiêu HbA1c nghiêm ngặt vừa phải",
      inputs: { comorbidities: "Few-Or-Mild" },
      output: "Mild-Stringent",
      weight: 0.7,
    },
    {
      id: "R12",
      description: "Nếu biến chứng mạch máu nhẹ thì mục tiêu HbA1c nghiêm ngặt vừa phải",
      inputs: { vascularComplications: "Few-Or-Mild" },
      output: "Mild-Stringent",
      weight: 0.7,
    },
    {
      id: "R13",
      description:
        "Nếu bệnh lý nhẹ và biến chứng mạch máu nhẹ thì mục tiêu HbA1c ít nghiêm ngặt hơn",
      inputs: {
        comorbidities: "Few-Or-Mild",
        vascularComplications: "Few-Or-Mild",
      },
      output: "Less-Stringent",
      weight: 0.8,
    },
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
export const fuzzify = (crisp: number, fuzzySets: FuzzySet[]): FuzzifiedValue[] => {
  // Tính toán mức độ thành viên trong mỗi tập mờ
  const fuzzifiedValues = fuzzySets.map((set) => {
    const membershipDegree = set.membershipFunction(crisp);

    // Tạo dữ liệu điểm cho biểu đồ hiển thị
    const graphPoints = {
      x: Array.from({ length: 41 }, (_, i) => i / 10), // Tạo điểm từ 0-4 với bước 0.1
      y: Array.from({ length: 41 }, (_, i) => set.membershipFunction(i / 10)),
    };

    return {
      setName: set.name,
      membershipDegree,
      graphPoints,
    };
  });

  // Chỉ trả về các tập có mức độ thành viên > 0
  return fuzzifiedValues.filter((v) => v.membershipDegree > 0);
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
    vascularComplications: fuzzify(
      vascularComplications,
      inputSets.vascularComplicationsSets
    ),
    patientAttitude: fuzzify(patientAttitude, inputSets.patientAttitudeSets),
    resourcesSupport: fuzzify(resourcesSupport, inputSets.resourcesSupportSets),
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
      (fv) => fv.setName === rule.inputs.hypoglycemiaRisk
    );
    if (matchingFuzzifiedValue) {
      activationLevel = Math.min(activationLevel, matchingFuzzifiedValue.membershipDegree);
      explanation += `nguy cơ hạ đường huyết '${rule.inputs.hypoglycemiaRisk}' (${Math.round(
        matchingFuzzifiedValue.membershipDegree * 100
      )}%), `;
      hasExplanation = true;
    } else {
      // Không tìm thấy tập mờ phù hợp cho đầu vào này
      return {
        rule,
        activation: 0,
        outputSet: rule.output,
        explanation: "Luật không được kích hoạt vì điều kiện nguy cơ hạ đường huyết không khớp",
      };
    }
  }

  if (rule.inputs.diseaseDuration) {
    const matchingFuzzifiedValue = fuzzifiedInputs.diseaseDuration.find(
      (fv) => fv.setName === rule.inputs.diseaseDuration
    );
    if (matchingFuzzifiedValue) {
      activationLevel = Math.min(activationLevel, matchingFuzzifiedValue.membershipDegree);
      explanation += `thời gian mắc bệnh '${rule.inputs.diseaseDuration}' (${Math.round(
        matchingFuzzifiedValue.membershipDegree * 100
      )}%), `;
      hasExplanation = true;
    } else {
      return {
        rule,
        activation: 0,
        outputSet: rule.output,
        explanation: "Luật không được kích hoạt vì điều kiện thời gian mắc bệnh không khớp",
      };
    }
  }

  if (rule.inputs.lifeExpectancy) {
    const matchingFuzzifiedValue = fuzzifiedInputs.lifeExpectancy.find(
      (fv) => fv.setName === rule.inputs.lifeExpectancy
    );
    if (matchingFuzzifiedValue) {
      activationLevel = Math.min(activationLevel, matchingFuzzifiedValue.membershipDegree);
      explanation += `tuổi thọ dự kiến '${rule.inputs.lifeExpectancy}' (${Math.round(
        matchingFuzzifiedValue.membershipDegree * 100
      )}%), `;
      hasExplanation = true;
    } else {
      return {
        rule,
        activation: 0,
        outputSet: rule.output,
        explanation: "Luật không được kích hoạt vì điều kiện tuổi thọ không khớp",
      };
    }
  }

  if (rule.inputs.comorbidities) {
    const matchingFuzzifiedValue = fuzzifiedInputs.comorbidities.find(
      (fv) => fv.setName === rule.inputs.comorbidities
    );
    if (matchingFuzzifiedValue) {
      activationLevel = Math.min(activationLevel, matchingFuzzifiedValue.membershipDegree);
      explanation += `tình trạng bệnh lý '${rule.inputs.comorbidities}' (${Math.round(
        matchingFuzzifiedValue.membershipDegree * 100
      )}%), `;
      hasExplanation = true;
    } else {
      return {
        rule,
        activation: 0,
        outputSet: rule.output,
        explanation: "Luật không được kích hoạt vì điều kiện bệnh lý không khớp",
      };
    }
  }

  if (rule.inputs.vascularComplications) {
    const matchingFuzzifiedValue = fuzzifiedInputs.vascularComplications.find(
      (fv) => fv.setName === rule.inputs.vascularComplications
    );
    if (matchingFuzzifiedValue) {
      activationLevel = Math.min(activationLevel, matchingFuzzifiedValue.membershipDegree);
      explanation += `biến chứng mạch máu '${rule.inputs.vascularComplications}' (${Math.round(
        matchingFuzzifiedValue.membershipDegree * 100
      )}%), `;
      hasExplanation = true;
    } else {
      return {
        rule,
        activation: 0,
        outputSet: rule.output,
        explanation: "Luật không được kích hoạt vì điều kiện biến chứng mạch máu không khớp",
      };
    }
  }

  if (rule.inputs.patientAttitude) {
    const matchingFuzzifiedValue = fuzzifiedInputs.patientAttitude.find(
      (fv) => fv.setName === rule.inputs.patientAttitude
    );
    if (matchingFuzzifiedValue) {
      activationLevel = Math.min(activationLevel, matchingFuzzifiedValue.membershipDegree);
      explanation += `thái độ bệnh nhân '${rule.inputs.patientAttitude}' (${Math.round(
        matchingFuzzifiedValue.membershipDegree * 100
      )}%), `;
      hasExplanation = true;
    } else {
      return {
        rule,
        activation: 0,
        outputSet: rule.output,
        explanation: "Luật không được kích hoạt vì điều kiện thái độ bệnh nhân không khớp",
      };
    }
  }

  if (rule.inputs.resourcesSupport) {
    const matchingFuzzifiedValue = fuzzifiedInputs.resourcesSupport.find(
      (fv) => fv.setName === rule.inputs.resourcesSupport
    );
    if (matchingFuzzifiedValue) {
      activationLevel = Math.min(activationLevel, matchingFuzzifiedValue.membershipDegree);
      explanation += `nguồn lực hỗ trợ '${rule.inputs.resourcesSupport}' (${Math.round(
        matchingFuzzifiedValue.membershipDegree * 100
      )}%), `;
      hasExplanation = true;
    } else {
      return {
        rule,
        activation: 0,
        outputSet: rule.output,
        explanation: "Luật không được kích hoạt vì điều kiện nguồn lực hỗ trợ không khớp",
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
    explanation: `${explanation}. Mức độ kích hoạt cuối cùng: ${Math.round(
      weightedActivation * 100
    )}%`,
  };
};

/**
 * Đánh giá tất cả các luật mờ - BƯỚC 2 đầy đủ
 */
export const evaluateAllRules = (
  fuzzifiedInputs: ReturnType<typeof fuzzifyAllInputs>
): RuleActivation[] => {
  const rules = createFuzzyRules();

  // Kiểm tra nếu không có luật nào
  if (!rules || rules.length == 0) {
    console.warn("Không có luật mờ nào được kích hoạt.");
    return [];
  }

  // Đánh giá từng luật và lọc ra những luật có mức kích hoạt > 0
  const ruleActivations = rules
    .map((rule) => evaluateRule(rule, fuzzifiedInputs))
    .filter((activation) => activation.activation > 0);

  return ruleActivations;
};

// 7. BƯỚC 3: TỔNG HỢP ĐẦU RA (AGGREGATION)
// ===========================================

/**
 * Tổng hợp đầu ra từ các luật được kích hoạt - BƯỚC 3 của logic mờ
 */
export const aggregateOutputs = (
  ruleActivations: RuleActivation[],
  config: { xMin?: number; xMax?: number; xStep?: number } = {}
): { x: number[]; y: number[]; membershipBySet: Record<string, number[]> } => {
  // Nếu không có luật nào được kích hoạt
  if (ruleActivations.length === 0) {
    return { x: [], y: [], membershipBySet: {} };
  }

  const outputSets = createOutputFuzzySets();

  // Kiểm tra nếu không có tập mờ đầu ra
  if (!outputSets || outputSets.length === 0) {
    console.warn("Không có tập mờ đầu ra nào được định nghĩa.");
    return { x: [], y: [], membershipBySet: {} };
  }

  // Cấu hình phạm vi x (mặc định: 6.5 đến 9.0, bước 0.1)
  const xMin = config.xMin ?? 6.5;
  const xMax = config.xMax ?? 9.0;
  const xStep = config.xStep ?? 0.1;
  const xValues = Array.from(
    { length: Math.floor((xMax - xMin) / xStep) + 1 },
    (_, i) => xMin + i * xStep
  );

  // Lưu trữ giá trị thành viên cho từng tập mờ đầu ra
  const membershipBySet: Record<string, number[]> = {
    "More-Stringent": new Array(xValues.length).fill(0),
    "Mild-Stringent": new Array(xValues.length).fill(0),
    "Less-Stringent": new Array(xValues.length).fill(0),
  };

  // Tính toán giá trị y cho mỗi điểm x bằng phương pháp MAX
  const yValues = xValues.map((x, index) => {
    let maxMembershipValue = 0;

    // Với mỗi luật được kích hoạt
    ruleActivations.forEach((activation) => {
      // Tìm tập mờ đầu ra tương ứng
      const outputSet = outputSets.find((set) => set.name === activation.outputSet);

      if (outputSet) {
        // Tính giá trị thành viên cho x, giới hạn bởi mức độ kích hoạt luật
        const membershipValue = Math.min(
          outputSet.membershipFunction(x),
          activation.activation
        );

        // Cập nhật giá trị thành viên cho tập mờ cụ thể
        if (membershipBySet[outputSet.name]) {
          membershipBySet[outputSet.name][index] = Math.max(
            membershipBySet[outputSet.name][index],
            membershipValue
          );
        }

        // Lấy giá trị MAX giữa tất cả các luật
        maxMembershipValue = Math.max(maxMembershipValue, membershipValue);
      }
    });

    return maxMembershipValue;
  });

  return { x: xValues, y: yValues, membershipBySet };
};

// 8. BƯỚC 4: KHỬ MỜ (DEFUZZIFICATION)
// ===========================================

/**
 * Phương pháp khử mờ trung bình có trọng số - BƯỚC 4 của logic mờ
 */
export const defuzzify = (
  aggregatedOutput: {
    x: number[];
    y: number[];
    membershipBySet: Record<string, number[]>;
  }
): { crispValue: number; centroidCalculation: { x: number; weightedSum: number; weightSum: number } } => {
  const { membershipBySet } = aggregatedOutput;

  // Định nghĩa giá trị trung bình của từng tập mờ (theo mô tả)
  const setCenters: Record<string, number> = {
    "More-Stringent": 6.5,
    "Mild-Stringent": 7.7,
    "Less-Stringent": 9.0,
  };

  // Nếu không có dữ liệu hoặc membershipBySet rỗng, trả về giá trị mặc định
  if (!membershipBySet || Object.keys(membershipBySet).length === 0) {
    return {
      crispValue: 6.5,
      centroidCalculation: { x: 6.5, weightedSum: 0, weightSum: 0 },
    };
  }

  // Tính tổng trọng số và tổng trọng số * giá trị
  let weightedSum = 0;
  let weightSum = 0;

  // Lặp qua từng tập mờ (More-Stringent, Mild-Stringent, Less-Stringent)
  for (const setName in membershipBySet) {
    if (setCenters[setName]) {
      // Lấy giá trị thành viên tối đa của tập mờ này
      const membershipValues = membershipBySet[setName];
      const maxMembership = Math.max(...membershipValues);

      // Nếu giá trị thành viên > 0, thêm vào phép tính
      if (maxMembership > 0) {
        const centerValue = setCenters[setName];
        weightedSum += centerValue * maxMembership;
        weightSum += maxMembership;
      }
    }
  }

  // Nếu weightSum = 0, trả về giá trị mặc định
  if (weightSum === 0) {
    return {
      crispValue: 6.5,
      centroidCalculation: { x: 6.5, weightedSum: 0, weightSum: 0 },
    };
  }

  // Tính giá trị crisp là trung bình có trọng số
  const crispValue = weightedSum / weightSum;

  // Làm tròn đến 1 chữ số thập phân
  const roundedValue = Math.round(crispValue * 10) / 10;

  return {
    crispValue: roundedValue,
    centroidCalculation: {
      x: roundedValue, // Thêm trường x, sử dụng giá trị crispValue đã tính
      weightedSum,
      weightSum,
    },
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
    case "Low":
      hypoglycemiaRiskValue = 0;
      break;
    case "High":
      hypoglycemiaRiskValue = 4;
      break;
    default:
      hypoglycemiaRiskValue = 2; // Default to Medium
  }

  // Chuyển đổi disease duration từ năm sang thang đo 0-4
  let diseaseDurationValue: number;
  if (diseaseDuration <= 5) diseaseDurationValue = 0; // Newly Diagnosed
  else if (diseaseDuration >= 10) diseaseDurationValue = 4; // Long-Standing
  else diseaseDurationValue = 2;

  // Chuyển đổi life expectancy
  let lifeExpectancyValue: number;
  switch (lifeExpectancy) {
    case "Long":
      lifeExpectancyValue = 0;
      break;
    case "Short":
      lifeExpectancyValue = 4;
      break;
    default:
      lifeExpectancyValue = 2; // Default to Moderate
  }

  // Chuyển đổi comorbidities
  let comorbiditiesValue: number;
  switch (comorbidities) {
    case "Absent":
      comorbiditiesValue = 0;
      break;
    case "Few-Or-Mild":
      comorbiditiesValue = 2;
      break;
    case "Severe":
      comorbiditiesValue = 4;
      break;
    default:
      comorbiditiesValue = 2; // Default to Mild
  }

  // Chuyển đổi vascular complications
  let vascularComplicationsValue: number;
  switch (vascularComplications) {
    case "None":
      vascularComplicationsValue = 0;
      break;
    case "Few-Or-Mild":
      vascularComplicationsValue = 2;
      break;
    case "Severe":
      vascularComplicationsValue = 4;
      break;
    default:
      vascularComplicationsValue = 2; // Default to Mild
  }

  // Chuyển đổi patient attitude
  let patientAttitudeValue: number;
  switch (patientAttitude) {
    case "Highly-Motivated":
      patientAttitudeValue = 0;
      break;
    case "Less-Motivated":
      patientAttitudeValue = 4;
      break;
    default:
      patientAttitudeValue = 2; // Default to Moderately motivated
  }

  // Chuyển đổi resources and support
  let resourcesSupportValue: number;
  switch (resourcesSupport) {
    case "Readily-Available":
      resourcesSupportValue = 0;
      break;
    case "Limited":
      resourcesSupportValue = 4;
      break;
    default:
      resourcesSupportValue = 2; // Default to Moderate
  }

  return {
    hypoglycemiaRiskValue,
    diseaseDurationValue,
    lifeExpectancyValue,
    comorbiditiesValue,
    vascularComplicationsValue,
    patientAttitudeValue,
    resourcesSupportValue,
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
  resourcesSupport: string = "Moderate" // Giá trị mặc định nếu không cung cấp
): FuzzyCalculationResult => {
  // BƯỚC 0: Chuyển đổi giá trị ngôn ngữ sang thang đo 0-4
  const {
    hypoglycemiaRiskValue,
    diseaseDurationValue,
    lifeExpectancyValue,
    comorbiditiesValue,
    vascularComplicationsValue,
    patientAttitudeValue,
    resourcesSupportValue,
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
  const aggregatedOutput = aggregateOutputs(ruleActivations, {
    xMin: 6.5,
    xMax: 9.0,
    xStep: 0.1,
  });

  // BƯỚC 4: Khử mờ để có kết quả cuối cùng
  const defuzzifiedResult = defuzzify(aggregatedOutput);

  // Tạo kết quả cuối cùng
  const finalResult: FuzzyCalculationResult = {
    fuzzifiedInputs,
    ruleActivations,
    defuzzifiedOutput: {
      crispValue: defuzzifiedResult.crispValue,
      aggregatedMembershipFunction: {
        x: aggregatedOutput.x,
        y: aggregatedOutput.y,
      },
      centroidCalculation: defuzzifiedResult.centroidCalculation,
    },
    hba1cTarget: defuzzifiedResult.crispValue,
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
  resourcesSupport: string = "Moderate" // Giá trị mặc định nếu không cung cấp
): {
  target: number;
  ruleActivations: { rule: FuzzyRule; activation: number }[];
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

  const simplifiedRuleActivations = fullResult.ruleActivations.map((ra) => ({
    rule: ra.rule,
    activation: ra.activation,
  }));

  return {
    target: fullResult.hba1cTarget,
    ruleActivations: simplifiedRuleActivations,
  };
};