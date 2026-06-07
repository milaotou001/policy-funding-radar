// Add Wuhan (wh) evidence to city-evidence-matrix.json
// Source: https://www.wuhan.gov.cn/zwgk/xxgk/ghjh/zfgzbg/202602/t20260210_2727545.shtml
// Wuhan 2026 Government Work Report, extracted 2026-06-07

const fs = require("fs");
const path = require("path");

const matrixPath = path.resolve(__dirname, "../data/city-evidence-matrix.json");
const matrix = JSON.parse(fs.readFileSync(matrixPath, "utf-8"));

const wuhanEvidence = {
  semiconductor: {
    mention: "集成电路产业规模突破千亿元，长江存储三期、武汉新芯三期建设，做强存储产业创新街区",
    detail:
      "2025年集成电路圆片产量增长21.9%，产业规模突破千亿。长江存储三期、奕斯伟大硅谷项目开工。2026年推进长江存储三期、武汉新芯三期，建成先导化合物半导体等项目150个，打造世界级存算一体化产业基地。化合物半导体形成领跑之势。",
    action_level: "重点推进",
  },
  manufacturing: {
    mention: "国家工业母机创新研究中心获批，大力发展工业母机产业，实施高端装备三年行动",
    detail:
      "国家工业母机创新研究中心等6家创新平台获批建设。2026年大力发展商业航天、低空经济、工业母机产业，实施新一轮高端装备产业高质量发展三年行动。",
    action_level: "重点推进",
  },
  "industrial-software": {
    mention: "获批全国首个国家级工业软件中试验证平台试点，建成国家工业软件生态共性平台",
    detail:
      "软件产业规模增长16.7%。获批全国首个国家级工业软件中试验证平台试点。2026年建成国家工业软件生态共性平台。",
    action_level: "重点推进",
  },
  biomanufacturing: {
    mention: "稻米造血实现产业化突破，重点布局合成生物等新赛道",
    detail:
      "稻米造血实现产业化突破。2026年重点布局合成生物等未来赛道，归入早期培育类新赛道方向。",
    action_level: "早期培育",
  },
  ai: {
    mention: "人工智能产业规模增长20%+，实施AI+行动，建设光谷/汉江湾AI产业园，新落地大模型10+个",
    detail:
      "2025年人工智能产业规模增长20%以上。2026年实施'人工智能+'行动，推动武汉国家新一代人工智能创新发展试验区，建设光谷、汉江湾等人工智能产业园，新增示范应用场景20个。争创国家人工智能应用中试基地，新落地垂直行业大模型10个以上，开发建设10个城市大模型应用场景。",
    action_level: "重点推进",
  },
  "quantum-tech": {
    mention: "重点布局量子科技等新赛道",
    detail:
      "2026年重点布局量子科技等面向未来的新赛道，归入早期培育类方向。",
    action_level: "早期培育",
  },
  robotics: {
    mention: "工业机器人产量增长21.5%，重点布局具身智能等新赛道",
    detail:
      "2025年工业机器人产量增长21.5%。2026年重点布局具身智能等面向未来的新赛道。",
    action_level: "早期培育",
  },
  "brain-computer": {
    mention: "脑机接口实现产业化突破，重点布局脑机接口新赛道",
    detail:
      "2025年脑机接口实现产业化突破。2026年继续重点布局脑机接口等未来赛道。",
    action_level: "早期培育",
  },
  "six-g": {
    mention: "重点布局6G等面向未来的新赛道",
    detail: "2026年将6G列为面向未来的新赛道之一，归入早期培育方向。",
    action_level: "早期培育",
  },
  "hydrogen-fusion": {
    mention: "氢能产业规模增长20%+，获批国家氢能区域试点，推进氢化长江，建设磁约束氘氘聚变中子源",
    detail:
      "2025年氢能产业规模增长20%以上，获批国家能源领域氢能区域试点。2026年推进电化、气化、氢化长江，重点布局氢能和核聚变能新赛道，加快建设磁约束氘氘聚变中子源等3个大科学设施。",
    action_level: "重点推进",
  },
  "low-altitude-economy": {
    mention: "低空经济规模增长20%+，大力发展低空经济，开展城际低空货运航线试点",
    detail:
      "2025年低空经济产业规模增长20%以上。2026年大力发展商业航天、低空经济、工业母机产业，聚焦低空经济等领域共建都市圈产业园区，开展汉襄宜城际低空货运航线试点。",
    action_level: "重点推进",
  },
  "digital-economy": {
    mention: "数字经济核心产业增加值占比提高6个百分点，推动数智经济创新发展，加快全域数字化转型",
    detail:
      "十四五数字经济核心产业增加值占比提高6个百分点。2026年推动数智经济创新发展，加快城市全域数字化转型，十五五目标为数智经济一线城市。",
    action_level: "重点推进",
  },
  "commercial-space": {
    mention: "大力发展商业航天，联动新洲区/东西湖区打造中国星谷，做强国家航天产业基地",
    detail:
      "2026年大力发展商业航天、低空经济、工业母机产业，联动新洲区、东西湖区打造'中国星谷'，做强武汉国家航天产业基地。",
    action_level: "重点推进",
  },
  biomedicine: {
    mention: "3个一类创新药上市创历史新高，加强创新药/医疗器械研发制造，联动江夏区建设中国药谷",
    detail:
      "2025年3个一类创新药上市，数量创历史新高。2026年加强创新药、医疗器械研发制造，打造国际医疗创新高地，联动江夏区加快建设'中国药谷'。",
    action_level: "重点推进",
  },
  "power-grid": {
    mention: "推动一流城市电网建设，新改建输电线路260公里，新增变电容量200万千伏安",
    detail:
      "2026年推动一流城市电网建设，完成新改建输电线路260公里，新增变电容量200万千伏安。十五五加强水网、电网、路网三网建设。",
    action_level: "重点推进",
  },
  "medical-devices": {
    mention: "加强医疗器械研发制造，国家药品和医疗器械审评检查华中分中心在汉挂牌",
    detail:
      "2025年国家药品和医疗器械审评检查华中分中心在汉挂牌。2026年加强创新药、医疗器械研发制造，打造国际医疗创新高地。",
    action_level: "重点推进",
  },
  nev: {
    mention: "新能源汽车产量增长40.2%，岚图产量翻番，支持东风/吉利/小鹏等推出新车型，打造世界车谷",
    detail:
      "2025年新能源汽车产量增长40.2%，岚图汽车产量实现翻番。2026年支持东风奕派、吉利银河新能源、上汽通用等推出新车型，推动小鹏汽车产能提升、中创新航增产扩产，持续打好汽车产业转型攻坚战，加快打造'世界车谷'。",
    action_level: "重点推进",
  },
  "data-elements": {
    mention: "深化'数据要素×'行动，推进公共数据全量编目统一归集，做强国家数据产业集聚区",
    detail:
      "2026年深化'数据要素×'行动，推进公共数据全量编目、统一归集、统一供数，做强国家数据产业集聚区。",
    action_level: "重点推进",
  },
  agritech: {
    mention: "全国首个种业大科学装置（神农设施）启动建设，建设武汉国家农创中心和'武汉·中国种都'",
    detail:
      "2025年全国首个种业大科学装置（神农设施）启动建设。2026年深入实施种业振兴行动，高水平建设武汉国家农创中心和'武汉·中国种都'，形成农业新技术10项以上，孵化农业科技企业40家。",
    action_level: "重点推进",
  },
  "traditional-chinese-medicine": {
    mention: "加快建设3个国家中西医协同旗舰医院，推进中医药传承创新",
    detail:
      "2026年加快建设3个国家中西医协同'旗舰'医院，推进中医药传承创新。",
    action_level: "重点推进",
  },
  "seed-industry": {
    mention: "全国首个种业大科学装置启动，深入实施种业振兴行动，建设中国种都",
    detail:
      "2025年全国首个种业大科学装置（神农设施）启动建设。2026年深入实施种业振兴行动，高水平建设'武汉·中国种都'。",
    action_level: "重点推进",
  },
  "green-finance": {
    mention: "依托中碳登打造全国碳市场中心、碳金融中心，办好2026年中国碳市场大会",
    detail:
      "2026年依托'中碳登'打造全国碳市场中心、碳金融中心，办好2026年中国碳市场大会。6只AIC股权直投基金落地。",
    action_level: "重点推进",
  },
  "silver-economy": {
    mention: "大力发展银发经济，推进老年友好型社会建设，推行长期护理保险",
    detail:
      "2026年大力发展首发经济、银发经济、冰雪经济，推进老年友好型社会建设，推行长期护理保险。",
    action_level: "重点推进",
  },
  "ice-snow-economy": {
    mention: "大力发展冰雪经济",
    detail:
      "2026年大力发展首发经济、票根经济、夜间经济、银发经济、冰雪经济。",
    action_level: "重点推进",
  },
  "carbon-market": {
    mention: "依托中碳登打造全国碳市场中心，办好2026年中国碳市场大会，实施节能降碳项目30个",
    detail:
      "2026年依托'中碳登'打造全国碳市场中心、碳金融中心，办好2026年中国碳市场大会。强化碳排放总量和强度双控，实施节能降碳项目30个，开展产品碳足迹标识认证，推广'武碳江湖'。",
    action_level: "重点推进",
  },
};

// Add wh entry to each industry
let added = 0;
for (const [industryId, whData] of Object.entries(wuhanEvidence)) {
  if (matrix[industryId]) {
    matrix[industryId].wh = whData;
    added++;
  } else {
    console.warn(`Industry ${industryId} not in matrix, skipped`);
  }
}

// Write back
fs.writeFileSync(matrixPath, JSON.stringify(matrix, null, 2) + "\n", "utf-8");
console.log(
  `Added Wuhan evidence for ${added} industries to city-evidence-matrix.json`
);
