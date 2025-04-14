// Định nghĩa các tập mờ (Fuzzy Sets)
export interface FuzzySet {
    name: string;
    membershipFunction: (x: number) => number;
  }
  
  // Tập mờ cho các biến đầu vào
  export const createInputFuzzySets = () => {
    // Nguy cơ hạ đường huyết (0-4 scale)
    const hypoglycemiaRiskSets: FuzzySet[] = [
      {
        name: 'Low',
        membershipFunction: (x: number) => x <= 1 ? 1 : x <= 2 ? 2 - x : 0
      },
      {
        name: 'Medium',
        membershipFunction: (x: number) => x <= 1 ? 0 : x <= 2 ? x - 1 : x <= 3 ? 3 - x : 0
      },
      {
        name: 'High',
        membershipFunction: (x: number) => x <= 2 ? 0 : x <= 3 ? x - 2 : 1
      }
    ];
  
    // Thời gian mắc bệnh (0-4 scale ~ 0 đến >15 năm)
    const diseaseDurationSets: FuzzySet[] = [
      {
        name: 'Short',
        membershipFunction: (x: number) => x <= 1 ? 1 : x <= 2 ? 2 - x : 0
      },
      {
        name: 'Moderate',
        membershipFunction: (x: number) => x <= 1 ? 0 : x <= 2 ? x - 1 : x <= 3 ? 3 - x : 0
      },
      {
        name: 'Long',
        membershipFunction: (x: number) => x <= 2 ? 0 : x <= 3 ? x - 2 : 1
      }
    ];
  
    // Tuổi thọ (0-4 scale)
    const lifeExpectancySets: FuzzySet[] = [
      {
        name: 'Short',
        membershipFunction: (x: number) => x >= 3 ? 1 : x >= 2 ? x - 2 : 0
      },
      {
        name: 'Moderate',
        membershipFunction: (x: number) => x <= 1 ? 0 : x <= 2 ? x - 1 : x <= 3 ? 3 - x : 0
      },
      {
        name: 'Long',
        membershipFunction: (x: number) => x <= 1 ? 1 : x <= 2 ? 2 - x : 0
      }
    ];
  
    // Bệnh đồng mắc (0-4 scale)
    const comorbiditiesSets: FuzzySet[] = [
      {
        name: 'Absent',
        membershipFunction: (x: number) => x <= 1 ? 1 : x <= 2 ? 2 - x : 0
      },
      {
        name: 'Mild',
        membershipFunction: (x: number) => x <= 1 ? 0 : x <= 2 ? x - 1 : x <= 3 ? 3 - x : 0
      },
      {
        name: 'Severe',
        membershipFunction: (x: number) => x <= 2 ? 0 : x <= 3 ? x - 2 : 1
      }
    ];
  
    // Biến chứng mạch máu (0-4 scale)
    const vascularComplicationsSets: FuzzySet[] = [
      {
        name: 'Absent',
        membershipFunction: (x: number) => x <= 1 ? 1 : x <= 2 ? 2 - x : 0
      },
      {
        name: 'Mild',
        membershipFunction: (x: number) => x <= 1 ? 0 : x <= 2 ? x - 1 : x <= 3 ? 3 - x : 0
      },
      {
        name: 'Severe',
        membershipFunction: (x: number) => x <= 2 ? 0 : x <= 3 ? x - 2 : 1
      }
    ];
  
    // Thái độ của bệnh nhân (0-4 scale)
    const patientAttitudeSets: FuzzySet[] = [
      {
        name: 'HighlyMotivated',
        membershipFunction: (x: number) => x <= 1 ? 1 : x <= 2 ? 2 - x : 0
      },
      {
        name: 'ModeratelyMotivated',
        membershipFunction: (x: number) => x <= 1 ? 0 : x <= 2 ? x - 1 : x <= 3 ? 3 - x : 0
      },
      {
        name: 'LessMotivated',
        membershipFunction: (x: number) => x <= 2 ? 0 : x <= 3 ? x - 2 : 1
      }
    ];
  
    return {
      hypoglycemiaRiskSets,
      diseaseDurationSets,
      lifeExpectancySets,
      comorbiditiesSets,
      vascularComplicationsSets,
      patientAttitudeSets
    };
  };
  
  // Tập mờ cho biến đầu ra (mục tiêu HbA1c)
  export const createOutputFuzzySets = () => {
    const hba1cTargetSets: FuzzySet[] = [
      {
        name: 'Strict',
        membershipFunction: (x: number) => x <= 6.5 ? 1 : x <= 7.0 ? (7.0 - x) / 0.5 : 0
      },
      {
        name: 'Standard',
        membershipFunction: (x: number) => x <= 6.5 ? 0 : x <= 7.0 ? (x - 6.5) / 0.5 : x <= 7.5 ? (7.5 - x) / 0.5 : 0
      },
      {
        name: 'Relaxed',
        membershipFunction: (x: number) => x <= 7.0 ? 0 : x <= 7.5 ? (x - 7.0) / 0.5 : x <= 8.0 ? 1 : x <= 8.5 ? (8.5 - x) / 0.5 : 0
      },
      {
        name: 'VeryRelaxed',
        membershipFunction: (x: number) => x <= 8.0 ? 0 : x <= 8.5 ? (x - 8.0) / 0.5 : 1
      }
    ];
  
    return hba1cTargetSets;
  };
  
  // Định nghĩa luật fuzzy (Rule base)
  export interface FuzzyRule {
    inputs: {
      hypoglycemiaRisk?: string;
      diseaseDuration?: string;
      lifeExpectancy?: string;
      comorbidities?: string;
      vascularComplications?: string;
      patientAttitude?: string;
    };
    output: string;
    weight: number; // Trọng số của luật
  }
  
  export const fuzzyRules: FuzzyRule[] = [
    // Luật cơ bản dựa trên nguy cơ hạ đường huyết
    { inputs: { hypoglycemiaRisk: 'Low' }, output: 'Strict', weight: 0.8 },
    { inputs: { hypoglycemiaRisk: 'Medium' }, output: 'Standard', weight: 0.8 },
    { inputs: { hypoglycemiaRisk: 'High' }, output: 'Relaxed', weight: 0.9 },
    
    // Luật dựa trên thời gian mắc bệnh
    { inputs: { diseaseDuration: 'Short' }, output: 'Strict', weight: 0.7 },
    { inputs: { diseaseDuration: 'Moderate' }, output: 'Standard', weight: 0.7 },
    { inputs: { diseaseDuration: 'Long' }, output: 'Relaxed', weight: 0.7 },
    
    // Luật dựa trên tuổi thọ
    { inputs: { lifeExpectancy: 'Long' }, output: 'Strict', weight: 0.7 },
    { inputs: { lifeExpectancy: 'Moderate' }, output: 'Standard', weight: 0.7 },
    { inputs: { lifeExpectancy: 'Short' }, output: 'VeryRelaxed', weight: 0.8 },
    
    // Luật dựa trên bệnh đồng mắc
    { inputs: { comorbidities: 'Absent' }, output: 'Strict', weight: 0.6 },
    { inputs: { comorbidities: 'Mild' }, output: 'Standard', weight: 0.6 },
    { inputs: { comorbidities: 'Severe' }, output: 'Relaxed', weight: 0.8 },
    
    // Luật dựa trên biến chứng mạch máu
    { inputs: { vascularComplications: 'Absent' }, output: 'Strict', weight: 0.6 },
    { inputs: { vascularComplications: 'Mild' }, output: 'Standard', weight: 0.7 },
    { inputs: { vascularComplications: 'Severe' }, output: 'Relaxed', weight: 0.8 },
    
    // Luật dựa trên thái độ bệnh nhân
    { inputs: { patientAttitude: 'HighlyMotivated' }, output: 'Strict', weight: 0.9 },
    { inputs: { patientAttitude: 'ModeratelyMotivated' }, output: 'Standard', weight: 0.7 },
    { inputs: { patientAttitude: 'LessMotivated' }, output: 'Relaxed', weight: 0.8 },
    
    // Luật kết hợp các yếu tố
    { 
      inputs: { 
        hypoglycemiaRisk: 'Low', 
        patientAttitude: 'HighlyMotivated' 
      }, 
      output: 'Strict', 
      weight: 0.9 
    },
    { 
      inputs: { 
        hypoglycemiaRisk: 'High', 
        lifeExpectancy: 'Short' 
      }, 
      output: 'VeryRelaxed', 
      weight: 0.9 
    },
    { 
      inputs: { 
        diseaseDuration: 'Long', 
        vascularComplications: 'Severe' 
      }, 
      output: 'Relaxed', 
      weight: 0.9 
    }
  ];
  
  // Tính mức độ kích hoạt của luật
  export const evaluateRuleActivation = (
    rule: FuzzyRule,
    hypoglycemiaRisk: number,
    diseaseDuration: number,
    lifeExpectancy: number,
    comorbidities: number,
    vascularComplications: number,
    patientAttitude: number
  ) => {
    const inputSets = createInputFuzzySets();
    let activationLevel = 1; // Min of all membership values
    
    if (rule.inputs.hypoglycemiaRisk) {
      const set = inputSets.hypoglycemiaRiskSets.find(s => s.name === rule.inputs.hypoglycemiaRisk);
      if (set) {
        const membershipValue = set.membershipFunction(hypoglycemiaRisk);
        activationLevel = Math.min(activationLevel, membershipValue);
      }
    }
    
    if (rule.inputs.diseaseDuration) {
      const set = inputSets.diseaseDurationSets.find(s => s.name === rule.inputs.diseaseDuration);
      if (set) {
        const membershipValue = set.membershipFunction(diseaseDuration);
        activationLevel = Math.min(activationLevel, membershipValue);
      }
    }
    
    if (rule.inputs.lifeExpectancy) {
      const set = inputSets.lifeExpectancySets.find(s => s.name === rule.inputs.lifeExpectancy);
      if (set) {
        const membershipValue = set.membershipFunction(lifeExpectancy);
        activationLevel = Math.min(activationLevel, membershipValue);
      }
    }
    
    if (rule.inputs.comorbidities) {
      const set = inputSets.comorbiditiesSets.find(s => s.name === rule.inputs.comorbidities);
      if (set) {
        const membershipValue = set.membershipFunction(comorbidities);
        activationLevel = Math.min(activationLevel, membershipValue);
      }
    }
    
    if (rule.inputs.vascularComplications) {
      const set = inputSets.vascularComplicationsSets.find(s => s.name === rule.inputs.vascularComplications);
      if (set) {
        const membershipValue = set.membershipFunction(vascularComplications);
        activationLevel = Math.min(activationLevel, membershipValue);
      }
    }
    
    if (rule.inputs.patientAttitude) {
      const set = inputSets.patientAttitudeSets.find(s => s.name === rule.inputs.patientAttitude);
      if (set) {
        const membershipValue = set.membershipFunction(patientAttitude);
        activationLevel = Math.min(activationLevel, membershipValue);
      }
    }
    
    // Nhân với trọng số của luật
    return activationLevel * rule.weight;
  };
  
  // Giải mờ sử dụng phương pháp trọng tâm (Centroid defuzzification)
  export const defuzzify = (
    hypoglycemiaRisk: number,
    diseaseDuration: number,
    lifeExpectancy: number,
    comorbidities: number,
    vascularComplications: number,
    patientAttitude: number
  ): {
    target: number,
    ruleActivations: { rule: FuzzyRule, activation: number }[]
  } => {
    const outputSets = createOutputFuzzySets();
    const ruleActivations = fuzzyRules.map(rule => ({
      rule,
      activation: evaluateRuleActivation(
        rule,
        hypoglycemiaRisk,
        diseaseDuration,
        lifeExpectancy,
        comorbidities,
        vascularComplications,
        patientAttitude
      )
    }));
    
    // Lấy ra các luật có mức độ kích hoạt > 0
    const activeRules = ruleActivations.filter(r => r.activation > 0);
    
    if (activeRules.length === 0) {
      return { target: 7.0, ruleActivations }; // Default value if no rules are activated
    }
    
    // Giá trị đầu ra đại diện cho mỗi tập mờ
    const outputValues = {
      'Strict': 6.5,
      'Standard': 7.0,
      'Relaxed': 7.5,
      'VeryRelaxed': 8.0
    };
    
    // Tính tổng trọng số
    const weightSum = activeRules.reduce((sum, r) => sum + r.activation, 0);
    // Tính tổng trọng số * giá trị
    const weightedSum = activeRules.reduce((sum, r) => {
      const outputValue = outputValues[r.rule.output as keyof typeof outputValues];
      return sum + (r.activation * outputValue);
    }, 0);
    
    // Tính giá trị đầu ra defuzzified
    const defuzzifiedValue = weightedSum / weightSum;
    
    // Đảm bảo kết quả nằm trong khoảng hợp lý
    const finalTarget = Math.max(6.0, Math.min(8.5, defuzzifiedValue));
    
    return {
      target: Math.round(finalTarget * 10) / 10, // Làm tròn đến 1 chữ số thập phân
      ruleActivations
    };
  };
  
  // Chuyển đổi giá trị language sang giá trị trên thang đo 0-4
  export const mapLanguageToNumeric = (
    hypoglycemiaRisk: string,
    diseaseDuration: number, // Đã là số năm
    lifeExpectancy: string,
    comorbidities: string,
    vascularComplications: string,
    patientAttitude: string
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
    if (diseaseDuration <= 1) diseaseDurationValue = 0;
    else if (diseaseDuration <= 5) diseaseDurationValue = 1;
    else if (diseaseDuration <= 10) diseaseDurationValue = 2;
    else if (diseaseDuration <= 15) diseaseDurationValue = 3;
    else diseaseDurationValue = 4;
    
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
    
    return {
      hypoglycemiaRiskValue,
      diseaseDurationValue,
      lifeExpectancyValue,
      comorbiditiesValue,
      vascularComplicationsValue,
      patientAttitudeValue
    };
  };
  
  // Hàm tính toán chỉ số HbA1c target
  export const calculateHbA1cTarget = (
    hypoglycemiaRisk: string,
    diseaseDuration: number,
    lifeExpectancy: string,
    comorbidities: string,
    vascularComplications: string,
    patientAttitude: string
  ) => {
    // Chuyển đổi từ ngôn ngữ sang giá trị số
    const {
      hypoglycemiaRiskValue,
      diseaseDurationValue,
      lifeExpectancyValue,
      comorbiditiesValue,
      vascularComplicationsValue,
      patientAttitudeValue
    } = mapLanguageToNumeric(
      hypoglycemiaRisk,
      diseaseDuration,
      lifeExpectancy,
      comorbidities,
      vascularComplications,
      patientAttitude
    );
    
    // Sử dụng logic mờ để tính toán target
    return defuzzify(
      hypoglycemiaRiskValue,
      diseaseDurationValue,
      lifeExpectancyValue,
      comorbiditiesValue,
      vascularComplicationsValue,
      patientAttitudeValue
    );
  };