// Add Wuhan (wh) 15th Five-Year Plan evidence to city-plan-evidence.json
// Source: https://www.wuhan.gov.cn/sy/whyw/202605/t20260508_2762026.shtml
// 武汉市国民经济和社会发展第十五个五年规划纲要, extracted 2026-06-07

const fs = require("fs");
const path = require("path");

const planPath = path.resolve(__dirname, "../data/city-plan-evidence.json");
const plan = JSON.parse(fs.readFileSync(planPath, "utf-8"));

const SOURCE = "武汉市十五五规划纲要";
const SOURCE_URL = "https://www.wuhan.gov.cn/sy/whyw/202605/t20260508_2762026.shtml";

const wuhanPlan = {
  semiconductor: {
    signal: "集成电路列为光电子信息支柱产业核心，2030年目标1.5万亿元，打造世界光谷",
    summary_14: "",
    summary_15:
      "加强光芯片及器件、集成电路（存算一体）、新型显示、智能终端、移动通信等领域布局。高端芯片列为未来产业新赛道。2030年光电子信息产业规模达到1.5万亿元。打造世界光谷，做强存算一体、化合物半导体产业集群。",
    concrete_items: [
      { category: "量化目标", text: "2030年光电子信息产业规模达到1.5万亿元" },
      { category: "产业平台", text: "世界光谷——东湖新技术开发区，存算一体、化合物半导体" },
      { category: "工程项目", text: "高端芯片新赛道：硅光芯片、光子芯片、汽车芯片" },
    ],
    source: SOURCE,
    source_url: SOURCE_URL,
    intensity: "强落地",
  },

  manufacturing: {
    signal: "工业母机列为高端装备支柱产业，2030年高端装备和新材料目标8000亿元",
    summary_14: "",
    summary_15:
      "打造世界一流工业母机先进制造业集群。高端装备和新材料列为九大支柱产业之一，2030年规模达到8000亿元。建设先进装备技术和产业创新基地。",
    concrete_items: [
      { category: "量化目标", text: "2030年高端装备和新材料产业规模达到8000亿元（合并口径）" },
      { category: "工程项目", text: "打造世界一流工业母机先进制造业集群" },
    ],
    source: SOURCE,
    source_url: SOURCE_URL,
    intensity: "强落地",
  },

  "new-materials": {
    signal: "新材料列为九大支柱产业之一，聚焦'3+5+N'领域，2030年目标8000亿元（与高端装备合并）",
    summary_14: "",
    summary_15:
      "聚焦'3+5+N'领域，打造全国新材料创新及应用策源地。石墨烯、3D打印、钙钛矿、纳米、量子点等前沿材料列入未来材料方向。高端装备和新材料2030年规模8000亿元。",
    concrete_items: [
      { category: "量化目标", text: "2030年高端装备和新材料规模8000亿元（合并口径）" },
      { category: "产业平台", text: "全国新材料创新及应用策源地——'3+5+N'领域布局" },
      { category: "工程项目", text: "未来材料：石墨烯、3D打印、钙钛矿、纳米、量子点" },
    ],
    source: SOURCE,
    source_url: SOURCE_URL,
    intensity: "强落地",
  },

  "industrial-software": {
    signal: "基础软硬件列入关键核心技术攻关，软件信息归入高附加值生产性服务业（9600亿营收目标）",
    summary_14: "",
    summary_15:
      "聚焦基础软硬件、基础零部件、关键基础材料、关键仪器设备和试剂等领域关键核心技术攻关。高附加值生产性服务业（含软件信息）2030年营收9600亿元。",
    concrete_items: [
      { category: "工程项目", text: "基础软硬件列入关键核心技术攻关" },
      { category: "量化目标", text: "高附加值生产性服务业（含软件信息）2030年营收9600亿元" },
    ],
    source: SOURCE,
    source_url: SOURCE_URL,
    intensity: "弱落地",
  },

  biomanufacturing: {
    signal: "生物制造列入五大未来产业之未来健康方向，着力抢占新赛道",
    summary_14: "",
    summary_15:
      "着力在生物制造、核聚变能等领域抢占新赛道。细胞与基因治疗、合成生物等产业列入未来健康方向。细胞工程、酶制剂、新型食品、医药中间体为具体方向。",
    concrete_items: [
      { category: "产业平台", text: "未来健康：细胞与基因治疗、合成生物、酶制剂、医药中间体" },
    ],
    source: SOURCE,
    source_url: SOURCE_URL,
    intensity: "有落地",
  },

  ai: {
    signal: "人工智能列为六大新兴产业首位，2030年目标2000亿元，全面实施'AI+'行动",
    summary_14: "",
    summary_15:
      "2030年人工智能产业规模达到2000亿元。全面实施'人工智能+'行动，推动AI+生物医药、AI+智能网联汽车、AI+高端装备。打造垂直行业大模型和智能体产品矩阵，打造数智经济一线城市。",
    concrete_items: [
      { category: "量化目标", text: "2030年人工智能产业规模达到2000亿元" },
      { category: "工程项目", text: "全面实施'人工智能+'行动，AI+生物医药、AI+汽车、AI+装备" },
      { category: "产业平台", text: "垂直行业大模型和智能体产品矩阵" },
    ],
    source: SOURCE,
    source_url: SOURCE_URL,
    intensity: "强落地",
  },

  "quantum-tech": {
    signal: "量子科技列入未来产业新赛道，争创量子精密测量国家技术创新中心",
    summary_14: "",
    summary_15:
      "量子科技、合成生物、第六代移动通信等领域前沿技术突破。量子精密测量、量子通信、量子计算为三大方向。在量子精密测量领域争创国家技术创新中心。",
    concrete_items: [
      { category: "产业平台", text: "争创量子精密测量国家技术创新中心" },
      { category: "工程项目", text: "量子精密测量、量子通信、量子计算三大方向" },
    ],
    source: SOURCE,
    source_url: SOURCE_URL,
    intensity: "有落地",
  },

  robotics: {
    signal: "具身智能列入未来产业新赛道，大力发展工业/服务/特种机器人",
    summary_14: "",
    summary_15:
      "着力在具身智能、未来显示、第六代移动通信等领域抢占新赛道。重点发展未来显示、智能机器人等产业。大力发展工业机器人、服务机器人、特种机器人。",
    concrete_items: [
      { category: "产业平台", text: "未来制造：智能机器人、工业/服务/特种机器人" },
    ],
    source: SOURCE,
    source_url: SOURCE_URL,
    intensity: "有落地",
  },

  "brain-computer": {
    signal: "脑机接口列入未来产业之未来健康方向",
    summary_14: "",
    summary_15:
      "类脑科学与脑机接口列入未来健康产业方向。脑机接口设备、类脑芯片与硬件、类脑感知、类脑算法、脑机接口应用产品。推动医疗辅助治疗、智能人机交互等领域应用示范。",
    concrete_items: [
      { category: "产业平台", text: "脑机接口设备、类脑芯片、类脑算法、应用产品全链条" },
      { category: "工程项目", text: "医疗辅助治疗、智能人机交互应用示范" },
    ],
    source: SOURCE,
    source_url: SOURCE_URL,
    intensity: "有落地",
  },

  "six-g": {
    signal: "6G列入未来产业新赛道之未来信息方向",
    summary_14: "",
    summary_15:
      "着力在具身智能、未来显示、第六代移动通信等领域抢占新赛道。第六代移动通信、卫星互联网列入未来信息方向。推进下一代移动通信网络建设。",
    concrete_items: [
      { category: "产业平台", text: "未来信息：第六代移动通信、卫星互联网" },
    ],
    source: SOURCE,
    source_url: SOURCE_URL,
    intensity: "有落地",
  },

  "hydrogen-fusion": {
    signal: "氢能列为六大新兴产业之一（低碳和氢能5700亿），核聚变列入未来能源新赛道",
    summary_14: "",
    summary_15:
      "低碳和氢能2030年规模5700亿元。构建氢能研发、制备、储运、试验测试、应用完整产业链，加快国家氢能示范基地建设。核聚变能列入未来能源方向，磁约束氘氘聚变中子源预研装置建设，积极开展核聚变能商业化探索。",
    concrete_items: [
      { category: "量化目标", text: "2030年低碳和氢能产业规模5700亿元（合并口径）" },
      { category: "产业平台", text: "国家氢能示范基地——氢能研制备储运试应用全链条" },
      { category: "工程项目", text: "磁约束氘氘聚变中子源预研装置建设，核聚变能商业化探索" },
    ],
    source: SOURCE,
    source_url: SOURCE_URL,
    intensity: "强落地",
  },

  "new-energy": {
    signal: "2030年新能源装机350万千瓦以上，持续提高新能源供给比重",
    summary_14: "",
    summary_15:
      "2030年新能源装机总容量达到350万千瓦以上。推动风光发电资源集约高效开发，持续提高新能源供给比重。大力发展新型储能和分布式能源。推广绿色船舶，推进电化、气化、氢化、醇化长江建设。",
    concrete_items: [
      { category: "量化目标", text: "2030年新能源装机总容量350万千瓦以上" },
      { category: "工程项目", text: "风光发电集约开发，新型储能和分布式能源" },
    ],
    source: SOURCE,
    source_url: SOURCE_URL,
    intensity: "有落地",
  },

  "energy-storage": {
    signal: "新型储能列入未来能源方向，含锂电/液流/钠电/飞轮等多技术路线",
    summary_14: "",
    summary_15:
      "新型储能建设列入能源基础设施。锂离子电池、液流电池、钠离子电池、铅碳电池、超级电容器、压缩空气储能、飞轮储能等多技术路线列入未来能源。首义新能源光储充换电一体站等项目。",
    concrete_items: [
      { category: "工程项目", text: "新型储能多技术路线：锂电/液流/钠电/铅碳/超容/压缩空气/飞轮" },
    ],
    source: SOURCE,
    source_url: SOURCE_URL,
    intensity: "弱落地",
  },

  "low-altitude-economy": {
    signal: "低空经济列为六大新兴产业之一，2030年产值1000亿元、商业航线80条",
    summary_14: "",
    summary_15:
      "2030年低空经济产值1000亿元，低空商业航线数达到80条。推进垂直起降航空器、工业级无人机、新型通用航空器研发制造。做优设施、通信、航路、服务'四张网'。低空经济纳入中国星谷范畴。",
    concrete_items: [
      { category: "量化目标", text: "2030年低空经济产值1000亿元，商业航线80条" },
      { category: "产业平台", text: "垂直起降航空器、工业级无人机、通用航空器研发制造" },
      { category: "工程项目", text: "做优设施、通信、航路、服务'四张网'" },
    ],
    source: SOURCE,
    source_url: SOURCE_URL,
    intensity: "强落地",
  },

  "digital-economy": {
    signal: "打造数智经济一线城市，数字经济嵌入全产业链",
    summary_14: "",
    summary_15:
      "打造数智经济一线城市。数字经济核心产业增加值年均增长超过10%（十四五成就）。推动城市全域数字化转型。人工智能、数据和网络安全、高附加值生产性服务业均含数字经济元素。",
    concrete_items: [
      { category: "量化目标", text: "数据和网络安全产业2030年规模2500亿元" },
      { category: "产业平台", text: "数智经济一线城市，全域数字化转型" },
    ],
    source: SOURCE,
    source_url: SOURCE_URL,
    intensity: "有落地",
  },

  "commercial-space": {
    signal: "航空航天和空天信息列为六大新兴产业之一，2030年目标2000亿元，打造中国星谷",
    summary_14: "",
    summary_15:
      "2030年航空航天和空天信息产业规模2000亿元。建设具有全球影响力的商业航天产业基地。构建'箭、星、芯、端、网、数（图）、用'全产业链。打造全国北斗产业创新发展高地。中国星谷（新洲区）聚焦商业航天。",
    concrete_items: [
      { category: "量化目标", text: "2030年航空航天和空天信息产业规模2000亿元" },
      { category: "产业平台", text: "中国星谷——新洲区，商业航天全产业链'箭星芯端网数用'" },
      { category: "工程项目", text: "全国北斗产业创新发展高地" },
    ],
    source: SOURCE,
    source_url: SOURCE_URL,
    intensity: "强落地",
  },

  biomedicine: {
    signal: "生命健康列为九大支柱产业之一，2030年目标1万亿元，打造中国药谷和国际医疗创新高地",
    summary_14: "",
    summary_15:
      "2030年生命健康产业规模达到1万亿元。打造国际一流的医学科技创新中心、生物医药产业中心、创新药和医疗器械研发制造高地、国际医疗创新高地。中国药谷（东湖高新+江夏区）为核心载体。",
    concrete_items: [
      { category: "量化目标", text: "2030年生命健康产业规模达到1万亿元" },
      { category: "产业平台", text: "中国药谷——东湖高新+江夏区，国际医疗创新高地" },
      { category: "工程项目", text: "创新药和医疗器械研发制造高地" },
    ],
    source: SOURCE,
    source_url: SOURCE_URL,
    intensity: "强落地",
  },

  "autonomous-driving": {
    signal: "打造全球'自动驾驶第一城'，全面推进车路云一体化，汽车产业2030年7000亿元",
    summary_14: "",
    summary_15:
      "打造全球'自动驾驶第一城'。全面推进'车路云一体化'应用试点。传统汽车制造基地向智能网联新能源汽车产业创新高地跃升。汽车制造和服务2030年规模7000亿元。世界车谷聚焦'车能软芯材'。",
    concrete_items: [
      { category: "量化目标", text: "2030年汽车制造和服务产业规模7000亿元" },
      { category: "产业平台", text: "世界车谷——武汉经开区，'车能软芯材'五位一体" },
      { category: "工程项目", text: "全球'自动驾驶第一城'，全面推进车路云一体化" },
    ],
    source: SOURCE,
    source_url: SOURCE_URL,
    intensity: "强落地",
  },

  "power-grid": {
    signal: "加快打造一流城市电网，数智化坚强电网建设，多个500kV/220kV/110kV扩建工程",
    summary_14: "",
    summary_15:
      "加快打造一流城市电网，数智化坚强电网建设，探索绿电直连、微电网等新模式。江夏500千伏扩建、钢都500千伏扩建、宋岗三220千伏输变电、新河110千伏输变电等具体工程。",
    concrete_items: [
      { category: "工程项目", text: "一流城市电网：江夏/钢都500kV扩建，宋岗三220kV，新河110kV" },
    ],
    source: SOURCE,
    source_url: SOURCE_URL,
    intensity: "有落地",
  },

  "data-elements": {
    signal: "2030年数据交易总额50亿元，建设武汉数据交易所，高水平建设国家数据流通利用试点",
    summary_14: "",
    summary_15:
      "2030年数据交易总额达到50亿元。探索数据要素归集、共享、利用、交易的技术路线和监管模式。建设武汉数据交易所（暂定）。高水平建设国家数据流通利用建设试点示范城市。一体化数字资源管理体系。",
    concrete_items: [
      { category: "量化目标", text: "2030年数据交易总额达到50亿元" },
      { category: "产业平台", text: "武汉数据交易所（暂定），国家数据流通利用试点示范城市" },
    ],
    source: SOURCE,
    source_url: SOURCE_URL,
    intensity: "强落地",
  },

  "deep-sea": {
    signal: "深海装备列入高端装备方向之一，对接海洋强国战略",
    summary_14: "",
    summary_15:
      "深地深海深空装备列入高端装备方向。对接海洋强国战略，积极发展海洋工程装备产业。关注深海等新业态新领域安全风险。",
    concrete_items: [
      { category: "工程项目", text: "深地深海深空装备——海洋工程装备产业" },
    ],
    source: SOURCE,
    source_url: SOURCE_URL,
    intensity: "弱落地",
  },

  "domestic-aircraft": {
    signal: "",
    summary_14: "",
    summary_15: "",
    concrete_items: [],
    source: SOURCE,
    source_url: SOURCE_URL,
    intensity: "弱落地",
  },

  // New industries not yet in plan file
  "medical-devices": {
    signal: "医疗器械列入生命健康支柱产业方向，创新药和医疗器械研发制造高地",
    summary_14: "",
    summary_15:
      "聚焦发展生物医药、中医药、医疗器械、医药流通、健康服务和健康食品。创新药和医疗器械研发制造高地。实施医疗器械分级监管，健全风险监测防控机制。生命健康2030年总目标1万亿元。",
    concrete_items: [
      { category: "产业平台", text: "医疗器械纳入生命健康支柱产业（2030年1万亿）" },
      { category: "工程项目", text: "创新药和医疗器械研发制造高地" },
    ],
    source: SOURCE,
    source_url: SOURCE_URL,
    intensity: "有落地",
  },

  nev: {
    signal: "智能网联新能源汽车列入汽车支柱产业核心方向，2030年7000亿元，打造世界车谷",
    summary_14: "",
    summary_15:
      "传统汽车制造基地向智能网联新能源汽车产业创新高地跃升。推动汽车向电动化、智能化、低碳化和全球化转型升级。2030年汽车制造和服务规模7000亿元。世界车谷（武汉经开区）打造世界智能网联新能源汽车创新城市。",
    concrete_items: [
      { category: "量化目标", text: "2030年汽车制造和服务产业规模7000亿元" },
      { category: "产业平台", text: "世界车谷——智能网联新能源汽车创新城市" },
      { category: "工程项目", text: "汽车电动化、智能化、低碳化、全球化转型" },
    ],
    source: SOURCE,
    source_url: SOURCE_URL,
    intensity: "强落地",
  },

  "seed-industry": {
    signal: "深入实施种业振兴行动，推进'武汉·中国种都'建设，列入现代都市农业支柱",
    summary_14: "",
    summary_15:
      "深入实施种业振兴行动。聚焦遗传育种、细胞育种、基因工程育种等关键领域。推进'武汉·中国种都'建设。分子育种、微生物农药、动物生物制品等研发平台。现代都市农业2030年目标5200亿元。",
    concrete_items: [
      { category: "量化目标", text: "现代都市农业（含种业）2030年规模5200亿元" },
      { category: "产业平台", text: "武汉·中国种都——遗传/细胞/基因工程育种" },
      { category: "工程项目", text: "分子育种、微生物农药、动物生物制品研发平台" },
    ],
    source: SOURCE,
    source_url: SOURCE_URL,
    intensity: "有落地",
  },

  agritech: {
    signal: "生物育种、数智农业、工厂农业列入农业新领域，武汉国家农创中心",
    summary_14: "",
    summary_15:
      "生物育种、生物制造、数智农业、工厂农业等农业新领域。武汉国家现代农业产业科技创新中心。洪山实验室为平台支撑。形成农业新技术和新品种研发转化体系。",
    concrete_items: [
      { category: "产业平台", text: "武汉国家现代农业产业科技创新中心、洪山实验室" },
      { category: "工程项目", text: "生物育种、数智农业、工厂农业新领域" },
    ],
    source: SOURCE,
    source_url: SOURCE_URL,
    intensity: "有落地",
  },

  "traditional-chinese-medicine": {
    signal: "中医药列入生命健康支柱产业方向，实施中医药振兴发展工程，建设特色中医名城",
    summary_14: "",
    summary_15:
      "聚焦发展生物医药、中医药、医疗器械、医药流通、健康服务和健康食品。实施中医药振兴发展工程，大力发展中医药产业。'特色中医名城工程'为命名工程。时珍实验室为湖北实验室之一。",
    concrete_items: [
      { category: "产业平台", text: "时珍实验室——中医药湖北实验室" },
      { category: "工程项目", text: "中医药振兴发展工程、特色中医名城工程" },
    ],
    source: SOURCE,
    source_url: SOURCE_URL,
    intensity: "有落地",
  },

  "green-finance": {
    signal: "大力发展科技金融和碳金融，打造区域金融中心，现代金融2030年增加值2000亿元",
    summary_14: "",
    summary_15:
      "大力发展科技金融和碳金融。绿色金融、普惠金融、养老金融、数字金融五大金融方向。引导金融机构面向重点产业集群开发定制化绿色信贷和融资方案。现代金融2030年增加值2000亿元。",
    concrete_items: [
      { category: "量化目标", text: "2030年现代金融增加值2000亿元" },
      { category: "产业平台", text: "科技金融和碳金融——定制化绿色信贷和融资方案" },
    ],
    source: SOURCE,
    source_url: SOURCE_URL,
    intensity: "有落地",
  },

  "carbon-market": {
    signal: "打造全国碳市场中心、全国碳金融中心，中碳登落户武汉，争取碳清算所",
    summary_14: "",
    summary_15:
      "碳市场成交量居全球首位（十四五成就）。打造全国碳市场中心、全国碳金融中心。中碳登落户武汉。积极争取碳清算所落户武汉。加快建设环沙湖'双碳'经济带。研究发布'中碳指数'产品。",
    concrete_items: [
      { category: "产业平台", text: "中碳登——全国碳市场中心、碳金融中心" },
      { category: "工程项目", text: "争取碳清算所落户、环沙湖双碳经济带、中碳指数" },
    ],
    source: SOURCE,
    source_url: SOURCE_URL,
    intensity: "强落地",
  },

  "silver-economy": {
    signal: "银发经济列入新型消费模式，大力发展银发经济",
    summary_14: "",
    summary_15:
      "发展悦己经济、银发经济、宠物经济、谷子经济等新型消费。推进老年友好型社会建设列入公共服务章节。",
    concrete_items: [
      { category: "产业平台", text: "银发经济列入新型消费发展方向" },
    ],
    source: SOURCE,
    source_url: SOURCE_URL,
    intensity: "弱落地",
  },

  "ice-snow-economy": {
    signal: "冰雪经济列入体育消费方向，培育冰雪特色IP",
    summary_14: "",
    summary_15:
      "发展冰雪、露营经济，打造新型体育消费集聚区。重点培育赛车、电竞、冰雪等特色IP项目。文化旅游和体育2030年规模1万亿元。",
    concrete_items: [
      { category: "产业平台", text: "冰雪列入新型体育消费，培育特色IP" },
    ],
    source: SOURCE,
    source_url: SOURCE_URL,
    intensity: "弱落地",
  },

  "platform-economy": {
    signal: "建设平台经济枢纽城市，打造工业互联网/供应链/直播电商/数字文创四大平台",
    summary_14: "",
    summary_15:
      "推动平台经济发展，打造工业互联网枢纽、数字贸易枢纽。建设平台经济枢纽城市。打造工业互联网、供应链、直播电商、数字文创等重点特色平台。",
    concrete_items: [
      { category: "产业平台", text: "平台经济枢纽城市——工业互联网/供应链/直播电商/数字文创" },
    ],
    source: SOURCE,
    source_url: SOURCE_URL,
    intensity: "有落地",
  },
};

// Merge into plan JSON
let added = 0;
let created = 0;
for (const [industryId, whData] of Object.entries(wuhanPlan)) {
  if (plan[industryId]) {
    plan[industryId].wh = whData;
    added++;
  } else {
    plan[industryId] = { wh: whData };
    created++;
  }
}

fs.writeFileSync(planPath, JSON.stringify(plan, null, 2) + "\n", "utf-8");
console.log(
  `Added Wuhan plan evidence: ${added} updated, ${created} new industries created`
);
