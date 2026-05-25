const STORAGE_KEY = "yz_cloud_database_v1";
const STUDENT_KEY = "yz_cloud_student_v1";
const REPORT_KEY = "yz_cloud_report_v1";

const $ = (selector) => document.querySelector(selector);
const app = $("#app");
let page = "intake";
let student = load(STUDENT_KEY, {
  name: "演示学生",
  phone: "13800000000",
  examYear: "2026",
  province: "广东省",
  city: "广州市",
  district: "天河区",
  schoolId: "hs-gd-1",
  schoolName: "华南师范大学附属中学",
  subject: "物理类",
  score: "610",
  bonus: "0",
  targetCluster: "土木建筑",
  locationPreference: "不限",
});
let report = load(REPORT_KEY, null);
let adminUnlocked = false;
let analyzingTimer = null;

function getCatalogSeed() {
  const catalog = window.YZ_CATALOG || {};
  const fallbackRegions = [{ province: "广东省", cities: [{ name: "广州市", districts: ["天河区", "越秀区", "海珠区"] }] }];
  const fallbackDirections = [{ name: "土木建筑", majors: ["土木工程", "建筑学", "城乡规划", "智能建造"] }, { name: "不限", majors: ["按分数优先"] }];
  return {
    source: catalog.source || "内置兜底数据",
    regions: Array.isArray(catalog.regions) && catalog.regions.length ? catalog.regions : fallbackRegions,
    highSchools: Array.isArray(catalog.highSchools) ? catalog.highSchools : [],
    professionalDirections: Array.isArray(catalog.professionalDirections) && catalog.professionalDirections.length ? catalog.professionalDirections : fallbackDirections,
    universities: Array.isArray(catalog.universities) ? catalog.universities : []
  };
}

function defaultDb() {
  const seed = getCatalogSeed();
  return {
    version: "2026.05-national-plus",
    updatedAt: "2026-05-25",
    adminPassword: "admin123",
    dataSource: seed.source,
    dataPolicy: "省市区县来自公开行政区划数据包；高中名录、大学院校和常见专业方向为基础名录，正式上线需按教育主管部门学校名录、院校招生章程和省考试院招生计划导入核验；院校投档线必须以省教育考试院官方数据为准。",
    regions: seed.regions,
    professionalDirections: seed.professionalDirections,
    highSchools: seed.highSchools,
    universities: [
      {
        id: "u-huananligong",
        name: "华南理工大学",
        province: "广东省",
        city: "广州市",
        type: "985 / 双一流 / 理工",
        tier: "冲稳核心",
        features: ["建筑学", "土木工程", "智能建造"],
        majors: [
          { name: "建筑学", cluster: "土木建筑", heat: 92, employmentIndex: 88 },
          { name: "土木工程", cluster: "土木建筑", heat: 83, employmentIndex: 82 },
          { name: "智能建造", cluster: "土木建筑", heat: 86, employmentIndex: 86 },
          { name: "计算机科学与技术", cluster: "计算机", heat: 96, employmentIndex: 93 }
        ],
        cutoffs: [
          { province: "广东省", year: 2025, category: "物理类", minScore: 617, minRank: 12400, batch: "本科批", source: "后台样例：请导入广东省教育考试院官方投档线", verified: false },
          { province: "广东省", year: 2024, category: "物理类", minScore: 610, minRank: 15200, batch: "本科批", source: "后台样例：请导入官方投档线", verified: false },
          { province: "广东省", year: 2023, category: "物理类", minScore: 613, minRank: 13700, batch: "本科批", source: "后台样例：请导入官方投档线", verified: false }
        ]
      },
      {
        id: "u-shenzhen",
        name: "深圳大学",
        province: "广东省",
        city: "深圳市",
        type: "省重点 / 综合",
        tier: "稳妥优选",
        features: ["建筑学", "土木工程", "电子信息"],
        majors: [
          { name: "建筑学", cluster: "土木建筑", heat: 88, employmentIndex: 84 },
          { name: "土木工程", cluster: "土木建筑", heat: 77, employmentIndex: 80 },
          { name: "城乡规划", cluster: "土木建筑", heat: 74, employmentIndex: 78 },
          { name: "软件工程", cluster: "计算机", heat: 95, employmentIndex: 94 }
        ],
        cutoffs: [
          { province: "广东省", year: 2025, category: "物理类", minScore: 598, minRank: 28600, batch: "本科批", source: "后台样例：请导入广东省教育考试院官方投档线", verified: false },
          { province: "广东省", year: 2024, category: "物理类", minScore: 592, minRank: 32000, batch: "本科批", source: "后台样例：请导入官方投档线", verified: false },
          { province: "广东省", year: 2023, category: "物理类", minScore: 595, minRank: 30500, batch: "本科批", source: "后台样例：请导入官方投档线", verified: false }
        ]
      },
      {
        id: "u-guanggong",
        name: "广东工业大学",
        province: "广东省",
        city: "广州市",
        type: "省重点 / 理工",
        tier: "稳保结合",
        features: ["土木工程", "工程管理", "自动化"],
        majors: [
          { name: "土木工程", cluster: "土木建筑", heat: 72, employmentIndex: 78 },
          { name: "工程管理", cluster: "土木建筑", heat: 68, employmentIndex: 76 },
          { name: "智能建造", cluster: "土木建筑", heat: 79, employmentIndex: 82 },
          { name: "自动化", cluster: "智能制造", heat: 86, employmentIndex: 88 }
        ],
        cutoffs: [
          { province: "广东省", year: 2025, category: "物理类", minScore: 566, minRank: 56500, batch: "本科批", source: "后台样例：请导入广东省教育考试院官方投档线", verified: false },
          { province: "广东省", year: 2024, category: "物理类", minScore: 558, minRank: 61200, batch: "本科批", source: "后台样例：请导入官方投档线", verified: false },
          { province: "广东省", year: 2023, category: "物理类", minScore: 556, minRank: 63400, batch: "本科批", source: "后台样例：请导入官方投档线", verified: false }
        ]
      },
      {
        id: "u-guangzhou",
        name: "广州大学",
        province: "广东省",
        city: "广州市",
        type: "省市共建 / 综合",
        tier: "保底稳妥",
        features: ["土木工程", "建筑环境与能源应用工程", "地理信息"],
        majors: [
          { name: "土木工程", cluster: "土木建筑", heat: 70, employmentIndex: 77 },
          { name: "建筑环境与能源应用工程", cluster: "土木建筑", heat: 64, employmentIndex: 74 },
          { name: "工程管理", cluster: "土木建筑", heat: 66, employmentIndex: 75 },
          { name: "人工智能", cluster: "计算机", heat: 91, employmentIndex: 90 }
        ],
        cutoffs: [
          { province: "广东省", year: 2025, category: "物理类", minScore: 552, minRank: 72100, batch: "本科批", source: "后台样例：请导入广东省教育考试院官方投档线", verified: false },
          { province: "广东省", year: 2024, category: "物理类", minScore: 545, minRank: 78200, batch: "本科批", source: "后台样例：请导入官方投档线", verified: false },
          { province: "广东省", year: 2023, category: "物理类", minScore: 544, minRank: 79000, batch: "本科批", source: "后台样例：请导入官方投档线", verified: false }
        ]
      },
      {
        id: "u-hunan",
        name: "湖南大学",
        province: "湖南省",
        city: "长沙市",
        type: "985 / 双一流 / 综合",
        tier: "外省冲刺",
        features: ["土木工程", "建筑环境", "车辆工程"],
        majors: [
          { name: "土木工程", cluster: "土木建筑", heat: 86, employmentIndex: 84 },
          { name: "建筑环境与能源应用工程", cluster: "土木建筑", heat: 72, employmentIndex: 79 },
          { name: "城乡规划", cluster: "土木建筑", heat: 75, employmentIndex: 78 }
        ],
        cutoffs: [
          { province: "广东省", year: 2025, category: "物理类", minScore: 613, minRank: 14100, batch: "本科批", source: "后台样例：请导入广东省教育考试院官方投档线", verified: false },
          { province: "广东省", year: 2024, category: "物理类", minScore: 606, minRank: 16800, batch: "本科批", source: "后台样例：请导入官方投档线", verified: false },
          { province: "广东省", year: 2023, category: "物理类", minScore: 609, minRank: 15800, batch: "本科批", source: "后台样例：请导入官方投档线", verified: false }
        ]
      },
      {
        id: "u-changsha-science",
        name: "长沙理工大学",
        province: "湖南省",
        city: "长沙市",
        type: "省重点 / 理工",
        tier: "外省保底",
        features: ["土木工程", "道路桥梁", "交通工程"],
        majors: [
          { name: "土木工程", cluster: "土木建筑", heat: 71, employmentIndex: 80 },
          { name: "道路桥梁与渡河工程", cluster: "土木建筑", heat: 69, employmentIndex: 78 },
          { name: "交通工程", cluster: "交通运输", heat: 72, employmentIndex: 79 }
        ],
        cutoffs: [
          { province: "广东省", year: 2025, category: "物理类", minScore: 545, minRank: 80100, batch: "本科批", source: "后台样例：请导入广东省教育考试院官方投档线", verified: false },
          { province: "广东省", year: 2024, category: "物理类", minScore: 540, minRank: 85200, batch: "本科批", source: "后台样例：请导入官方投档线", verified: false },
          { province: "广东省", year: 2023, category: "物理类", minScore: 538, minRank: 87300, batch: "本科批", source: "后台样例：请导入官方投档线", verified: false }
        ]
      },
      {
        id: "u-southeast",
        name: "东南大学",
        province: "江苏省",
        city: "南京市",
        type: "985 / 双一流 / 建筑强校",
        tier: "高位冲刺",
        features: ["建筑学", "土木工程", "城乡规划"],
        majors: [
          { name: "建筑学", cluster: "土木建筑", heat: 96, employmentIndex: 91 },
          { name: "城乡规划", cluster: "土木建筑", heat: 88, employmentIndex: 84 },
          { name: "土木工程", cluster: "土木建筑", heat: 89, employmentIndex: 85 }
        ],
        cutoffs: [
          { province: "广东省", year: 2025, category: "物理类", minScore: 639, minRank: 5700, batch: "本科批", source: "后台样例：请导入广东省教育考试院官方投档线", verified: false },
          { province: "广东省", year: 2024, category: "物理类", minScore: 636, minRank: 6200, batch: "本科批", source: "后台样例：请导入官方投档线", verified: false },
          { province: "广东省", year: 2023, category: "物理类", minScore: 638, minRank: 5900, batch: "本科批", source: "后台样例：请导入官方投档线", verified: false }
        ]
      }
    ]
  };
}

function load(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
}
function save(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
function getDb() {
  const stored = load(STORAGE_KEY, null);
  if (stored) {
    const normalized = normalizeDb(stored);
    save(STORAGE_KEY, normalized);
    return normalized;
  }
  const db = normalizeDb(defaultDb());
  save(STORAGE_KEY, db);
  return db;
}
function normalizeDb(db) {
  const seed = getCatalogSeed();
  db.version = ["2026.05-demo", "2026.05-national-seed"].includes(db.version) ? "2026.05-national-plus" : (db.version || "2026.05-national-plus");
  db.dataSource = db.dataSource || seed.source;
  db.dataPolicy = db.dataPolicy || "省市区县来自公开行政区划数据包；高中名录和分数线需后台核验。";
  if (!Array.isArray(db.regions) || db.regions.length < seed.regions.length) db.regions = seed.regions;
  if (!Array.isArray(db.professionalDirections) || db.professionalDirections.length < seed.professionalDirections.length) db.professionalDirections = seed.professionalDirections;
  if (!Array.isArray(db.highSchools)) db.highSchools = [];
  const schoolKeys = new Set(db.highSchools.map((s) => `${s.province}|${s.city}|${s.name}`));
  const missingSchools = seed.highSchools.filter((s) => !schoolKeys.has(`${s.province}|${s.city}|${s.name}`));
  if (missingSchools.length) db.highSchools = [...db.highSchools, ...missingSchools];
  if (!Array.isArray(db.universities)) db.universities = [];
  const universityKeys = new Set(db.universities.map((u) => `${u.province}|${u.city}|${u.name}`));
  const missingUniversities = seed.universities.filter((u) => !universityKeys.has(`${u.province}|${u.city}|${u.name}`));
  if (missingUniversities.length) db.universities = [...db.universities, ...missingUniversities];
  return db;
}
function saveDb(db) { db.updatedAt = new Date().toISOString().slice(0, 10); save(STORAGE_KEY, db); }
function esc(value = "") { return String(value).replace(/[&<>'"]/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[m])); }
function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }
function avg(arr) { return arr.reduce((sum, n) => sum + n, 0) / Math.max(1, arr.length); }
function uid(prefix) { return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`; }
function options(items, selected) { return items.map((item) => `<option value="${esc(item)}" ${item === selected ? "selected" : ""}>${esc(item)}</option>`).join(""); }
function directionNames(db) {
  const names = (db.professionalDirections || []).map((item) => item.name);
  return [...new Set([...names, "不限"])];
}

function setPage(next) {
  page = next;
  document.querySelectorAll(".tab").forEach((tab) => tab.classList.toggle("active", tab.dataset.page === page));
  render();
}

document.querySelectorAll(".tab").forEach((tab) => tab.addEventListener("click", () => setPage(tab.dataset.page)));
$("#resetDemo").addEventListener("click", () => {
  if (!confirm("确认恢复内置演示数据？当前后台维护的数据会被覆盖。")) return;
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(REPORT_KEY);
  report = null;
  setPage("intake");
});

function render() {
  if (analyzingTimer) clearInterval(analyzingTimer);
  if (page === "intake") renderIntake();
  if (page === "waiting") renderWaiting();
  if (page === "report") renderReport();
  if (page === "admin") renderAdmin();
}

function currentRegion(db) {
  const region = db.regions.find((r) => r.province === student.province) || db.regions[0];
  const city = region.cities.find((c) => c.name === student.city) || region.cities[0];
  return { region, city };
}

function renderIntake() {
  const db = getDb();
  const { region, city } = currentRegion(db);
  const selectedSchool = db.highSchools.find((s) => s.id === student.schoolId);
  app.innerHTML = `
    <section class="hero">
      <p class="eyebrow">新高考 · 院校专业组 · 土建方向</p>
      <h2>用分数线与地区数据，缩小志愿选择。</h2>
      <p>填写个人信息、所在地区、高中院校与预估分，系统将模拟 AI 分析并生成 3 所院校推荐、概率与专业建议。</p>
    </section>
    <div class="notice">为保证真实性，系统不伪造“全量官方数据”。当前为可运行产品原型：所有院校、分数线、高中名录均可在后台导入、校验来源并替换为官方数据。</div>
    <form id="intakeForm" class="card featured">
      <div class="card-title"><h3>个人注册信息</h3><span class="badge">本地加密前端演示</span></div>
      <div class="grid-2">
        <div class="field"><label>学生姓名</label><input name="name" value="${esc(student.name)}" placeholder="请输入姓名" /></div>
        <div class="field"><label>联系电话</label><input name="phone" value="${esc(student.phone)}" placeholder="家长/学生手机号" inputmode="tel" /></div>
      </div>
      <div class="grid-3">
        <div class="field"><label>省份</label><select name="province" id="provinceSelect">${options(db.regions.map((r) => r.province), region.province)}</select></div>
        <div class="field"><label>城市</label><select name="city" id="citySelect">${options(region.cities.map((c) => c.name), city.name)}</select></div>
        <div class="field"><label>区县</label><select name="district" id="districtSelect">${options(city.districts, student.district)}</select></div>
      </div>
      <div class="field search-box">
        <label>高中院校名称</label>
        <input id="schoolSearch" autocomplete="off" value="${esc(selectedSchool?.name || student.schoolName || "")}" placeholder="输入学校名称，下拉选择" />
        <input type="hidden" name="schoolId" value="${esc(student.schoolId)}" />
        <div id="schoolDropdown" class="dropdown"></div>
      </div>
      <div class="grid-2">
        <div class="field"><label>高考年份</label><select name="examYear">${options(["2026", "2025", "2024"], student.examYear)}</select></div>
        <div class="field"><label>科类</label><select name="subject">${options(["物理类", "历史类", "综合改革", "理科", "文科"], student.subject)}</select></div>
      </div>
      <div class="grid-2">
        <div class="field"><label>预估总分</label><input name="score" value="${esc(student.score)}" type="number" min="0" max="750" placeholder="如 610" /></div>
        <div class="field"><label>政策附加分</label><input name="bonus" value="${esc(student.bonus)}" type="number" min="0" max="50" placeholder="无则填 0" /></div>
      </div>
      <div class="grid-2">
        <div class="field"><label>意向专业方向</label><select name="targetCluster">${options(directionNames(db), student.targetCluster)}</select></div>
        <div class="field"><label>地域偏好</label><select name="locationPreference">${options(["不限", "本省优先", "一线/新一线", "外省可接受"], student.locationPreference)}</select></div>
      </div>
      <button class="primary-btn" type="submit">开始 AI 分析</button>
    </form>
    <div class="kpi-grid">
      <div class="kpi"><strong>${db.universities.length}</strong><span>院校库</span></div>
      <div class="kpi"><strong>${db.highSchools.length}</strong><span>高中名录</span></div>
      <div class="kpi"><strong>${db.universities.reduce((n, u) => n + (u.cutoffs || []).length, 0)}</strong><span>分数线</span></div>
    </div>`;

  $("#provinceSelect").addEventListener("change", (e) => {
    student = { ...collectForm(), province: e.target.value };
    const nextRegion = db.regions.find((r) => r.province === student.province) || db.regions[0];
    student.city = nextRegion.cities[0].name;
    student.district = nextRegion.cities[0].districts[0];
    save(STUDENT_KEY, student);
    renderIntake();
  });
  $("#citySelect").addEventListener("change", (e) => {
    student = { ...collectForm(), city: e.target.value };
    const nextCity = (db.regions.find((r) => r.province === student.province)?.cities || [])[0];
    const realCity = db.regions.find((r) => r.province === student.province)?.cities.find((c) => c.name === student.city) || nextCity;
    student.district = realCity?.districts[0] || "";
    save(STUDENT_KEY, student);
    renderIntake();
  });
  bindSchoolSearch(db);
  $("#intakeForm").addEventListener("submit", (event) => {
    event.preventDefault();
    student = collectForm();
    if (!student.name.trim()) student.name = "演示学生";
    if (!student.phone.trim()) student.phone = "13800000000";
    const score = Number(student.score) + Number(student.bonus || 0);
    if (!student.province || !student.schoolId || !score) {
      alert("请完整选择地区、高中院校并填写预估分。若找不到高中，可先到后台添加。 ");
      return;
    }
    save(STUDENT_KEY, student);
    setPage("waiting");
    startAnalysis();
  });
}

function collectForm() {
  const form = $("#intakeForm");
  if (!form) return student;
  const data = Object.fromEntries(new FormData(form).entries());
  const schoolName = $("#schoolSearch")?.value || student.schoolName || "";
  return { ...student, ...data, schoolName };
}

function bindSchoolSearch(db) {
  const input = $("#schoolSearch");
  const hidden = document.querySelector("input[name='schoolId']");
  const dropdown = $("#schoolDropdown");
  const draw = () => {
    const query = input.value.trim().toLowerCase();
    const candidates = db.highSchools
      .filter((s) => {
        const keywordHit = !query || `${s.name}${s.province}${s.city}${s.district}`.toLowerCase().includes(query);
        if (!keywordHit) return false;
        if (query) return true;
        if (student.district && s.district === student.district) return true;
        if (student.city && s.city === student.city) return true;
        return !student.province || s.province === student.province;
      })
      .sort((a, b) => Number(b.city === student.city) - Number(a.city === student.city) || Number(b.district === student.district) - Number(a.district === student.district))
      .slice(0, 20);
    dropdown.innerHTML = candidates.length ? candidates.map((s) => `<div class="option" data-id="${esc(s.id)}" data-name="${esc(s.name)}">${esc(s.name)}<small>${esc(s.province)} · ${esc(s.city)} · ${esc(s.district)} · ${esc(s.level)}</small></div>`).join("") : `<div class="option">未找到，可到“数据后台”添加高中名录</div>`;
    dropdown.classList.add("show");
  };
  input.addEventListener("focus", draw);
  input.addEventListener("input", () => { hidden.value = ""; draw(); });
  dropdown.addEventListener("click", (event) => {
    const option = event.target.closest(".option[data-id]");
    if (!option) return;
    input.value = option.dataset.name;
    hidden.value = option.dataset.id;
    student.schoolId = option.dataset.id;
    student.schoolName = option.dataset.name;
    dropdown.classList.remove("show");
  });
  document.addEventListener("click", (event) => {
    if (!event.target.closest(".search-box")) dropdown.classList.remove("show");
  }, { once: true });
}

function renderWaiting() {
  document.querySelectorAll(".tab").forEach((tab) => tab.classList.toggle("active", false));
  app.innerHTML = `
    <section class="loader-page">
      <div class="orbit"></div>
      <p class="eyebrow">AI Recommendation Engine</p>
      <h2>正在生成志愿报告</h2>
      <p class="meta">匹配地区批次、近三年分数线、院校层级、土建类专业热度与风险梯度。</p>
      <div class="progress"><div id="progressBar"></div></div>
      <ul class="steps">
        <li>1. 校验学生地区、高中与分数结构</li>
        <li>2. 按省份/科类筛选院校投档线</li>
        <li>3. 计算冲稳保概率并压缩专业清单</li>
        <li>4. 生成可解释推荐报告</li>
      </ul>
    </section>`;
}

function startAnalysis() {
  const bar = $("#progressBar");
  let value = 8;
  analyzingTimer = setInterval(() => {
    value = Math.min(96, value + Math.random() * 14);
    if (bar) bar.style.width = `${value}%`;
  }, 230);
  setTimeout(() => {
    if (analyzingTimer) clearInterval(analyzingTimer);
    report = generateReport(student, getDb());
    save(REPORT_KEY, report);
    setPage("report");
  }, 2100);
}

function generateReport(profile, db) {
  const effectiveScore = Number(profile.score || 0) + Number(profile.bonus || 0);
  const highSchool = db.highSchools.find((s) => s.id === profile.schoolId);
  const scored = db.universities.map((u) => scoreUniversity(u, profile, effectiveScore)).filter(Boolean);
  const riskOrder = { "冲刺": 0, "稳妥": 1, "保底": 2 };
  const buckets = {
    "冲刺": scored.filter((x) => x.risk === "冲刺").sort((a, b) => b.qualityScore - a.qualityScore),
    "稳妥": scored.filter((x) => x.risk === "稳妥").sort((a, b) => b.qualityScore - a.qualityScore),
    "保底": scored.filter((x) => x.risk === "保底").sort((a, b) => b.qualityScore - a.qualityScore)
  };
  const picked = [];
  ["冲刺", "稳妥", "保底"].forEach((key) => { if (buckets[key][0]) picked.push(buckets[key][0]); });
  scored.sort((a, b) => (riskOrder[a.risk] - riskOrder[b.risk]) || b.qualityScore - a.qualityScore);
  scored.forEach((item) => { if (picked.length < 3 && !picked.some((p) => p.id === item.id)) picked.push(item); });
  const recommendations = picked.slice(0, 3);
  return {
    createdAt: new Date().toLocaleString("zh-CN"),
    profile: { ...profile, effectiveScore, highSchool },
    recommendations,
    summary: makeSummary(profile, highSchool, effectiveScore, recommendations),
    dataIntegrity: {
      verifiedLines: db.universities.flatMap((u) => u.cutoffs).filter((l) => l.verified).length,
      totalLines: db.universities.flatMap((u) => u.cutoffs).length,
      policy: db.dataPolicy,
      updatedAt: db.updatedAt
    }
  };
}

function scoreUniversity(u, profile, effectiveScore) {
  const cutoffs = u.cutoffs || [];
  const lines = cutoffs.filter((line) => line.province === profile.province && line.category === profile.subject);
  const usable = lines.length ? lines : cutoffs.filter((line) => line.category === profile.subject || line.province === profile.province);
  if (!usable.length) return null;
  const latest = [...usable].sort((a, b) => b.year - a.year).slice(0, 3);
  const avgLine = Math.round(avg(latest.map((l) => l.minScore)));
  const diff = effectiveScore - avgLine;
  const clusterMajors = profile.targetCluster === "不限" ? u.majors : u.majors.filter((m) => m.cluster === profile.targetCluster);
  const majorBoost = clusterMajors.length ? 5 : -6;
  const localBoost = profile.locationPreference === "本省优先" && u.province === profile.province ? 5 : 0;
  const probability = clamp(Math.round(54 + diff * 2.15 + majorBoost + localBoost), 6, 96);
  const risk = probability >= 76 ? "保底" : probability >= 55 ? "稳妥" : probability >= 32 ? "冲刺" : "高风险";
  const qualityScore = probability + (u.type.includes("985") ? 12 : 0) + (clusterMajors.length ? 8 : 0) + (u.province === profile.province ? 4 : 0);
  return {
    id: u.id,
    name: u.name,
    province: u.province,
    city: u.city,
    type: u.type,
    tier: u.tier,
    features: u.features,
    probability,
    risk,
    avgLine,
    diff,
    latest,
    majors: reduceMajors(u.majors, profile.targetCluster, probability),
    qualityScore,
    advice: makeAdvice(diff, probability, clusterMajors.length, u)
  };
}

function reduceMajors(majors, targetCluster, probability) {
  const pool = targetCluster === "不限" ? majors : majors.filter((m) => m.cluster === targetCluster);
  const source = pool.length ? pool : majors;
  return source
    .sort((a, b) => (b.employmentIndex + b.heat * 0.35) - (a.employmentIndex + a.heat * 0.35))
    .slice(0, probability < 45 ? 2 : 3)
    .map((m) => ({ ...m, reason: probability < 45 ? "冲刺院校建议减少热门专业暴露" : "匹配分数段与就业热度" }));
}

function makeAdvice(diff, probability, hasMajor, u) {
  if (probability < 45) return `与近三年平均线相差 ${diff} 分，建议仅作为冲刺志愿；若选择 ${u.name}，应降低专业热度并服从调剂。`;
  if (probability < 76) return `分差 ${diff >= 0 ? "+" : ""}${diff} 分，属于稳妥区间；优先保留 ${hasMajor ? "目标专业方向" : "相近专业"}，同时配置一所保底院校。`;
  return `分差 ${diff >= 0 ? "+" : ""}${diff} 分，录取安全垫较好；可在专业选择上适度提高，仍需关注专业组内热门专业拥挤度。`;
}

function makeSummary(profile, highSchool, effectiveScore, recommendations) {
  const topRisk = recommendations.map((r) => r.risk).join(" / ");
  return `${profile.name} 来自 ${profile.province}${profile.city}${profile.district}，高中为 ${highSchool?.name || profile.schoolName}。预估总分 ${profile.score}，附加分 ${profile.bonus || 0}，有效参考分 ${effectiveScore}。系统建议采用“冲稳保”梯度：${topRisk}，并围绕 ${profile.targetCluster} 方向缩小专业范围，避免全部集中在超热门专业。`;
}

function renderReport() {
  if (!report) {
    app.innerHTML = `<div class="empty">暂无报告。请先完成“报考测评”。</div>`;
    return;
  }
  const p = report.profile;
  app.innerHTML = `
    <section class="report-head">
      <p class="eyebrow">Personal Admission Report</p>
      <h2>${esc(p.name)} 的志愿推荐报告</h2>
      <p>${esc(report.summary)}</p>
    </section>
    <div class="kpi-grid">
      <div class="kpi"><strong>${p.effectiveScore}</strong><span>有效参考分</span></div>
      <div class="kpi"><strong>${report.recommendations.length}</strong><span>推荐院校</span></div>
      <div class="kpi"><strong>${report.dataIntegrity.verifiedLines}/${report.dataIntegrity.totalLines}</strong><span>已核验线</span></div>
    </div>
    ${report.recommendations.map(renderRecommendation).join("")}
    <section class="card">
      <div class="card-title"><h3>专业意见与数据说明</h3><span class="badge warn">需官方复核</span></div>
      <p class="meta">1. 正式填报前必须以省教育考试院公布的一分一段表、招生计划、专业组投档线和学校招生章程为准。</p>
      <p class="meta">2. 后台已为每条分数线预留 source/verified 字段，可导入官方数据后重新生成报告。</p>
      <p class="meta">3. 对土木建筑方向，建议优先比较：建筑学学制与选科要求、土木工程细分方向、智能建造/工程管理的就业弹性。</p>
      <div class="source-line">数据版本：${esc(report.dataIntegrity.updatedAt)} · ${esc(report.dataIntegrity.policy)}</div>
      <button class="ghost-btn" id="backAnalyze" type="button">返回修改信息</button>
    </section>
    <div class="footer-space"></div>`;
  $("#backAnalyze").addEventListener("click", () => setPage("intake"));
}

function renderRecommendation(item, index) {
  const riskClass = item.risk === "冲刺" ? "warn" : item.risk === "保底" ? "" : "warn";
  return `
    <section class="card rec-card">
      <div class="rec-top">
        <div>
          <span class="badge ${riskClass}">志愿 ${index + 1} · ${esc(item.risk)}</span>
          <h3>${esc(item.name)}</h3>
          <div class="meta">${esc(item.province)} · ${esc(item.city)} · ${esc(item.type)} · ${esc(item.tier)}</div>
        </div>
        <div class="prob" style="--p:${item.probability}%"><span>${item.probability}%</span></div>
      </div>
      <p class="meta">近三年均线 ${item.avgLine}，与当前有效分差 ${item.diff >= 0 ? "+" : ""}${item.diff} 分。${esc(item.advice)}</p>
      <table class="cutoff-table">
        <thead><tr><th>年份</th><th>批次</th><th>最低分</th><th>位次</th></tr></thead>
        <tbody>${item.latest.map((line) => `<tr><td>${line.year}</td><td>${esc(line.batch)}</td><td>${line.minScore}</td><td>${line.minRank}</td></tr>`).join("")}</tbody>
      </table>
      <div class="major-list">${item.majors.map((m) => `<span class="major">${esc(m.name)} · ${m.employmentIndex}</span>`).join("")}</div>
      <div class="source-line">专业压缩逻辑：保留与 ${esc(student.targetCluster)} 匹配、就业指数较高且风险暴露较低的专业；冲刺院校控制为 2 个核心专业。</div>
    </section>`;
}

function renderAdmin() {
  const db = getDb();
  if (!adminUnlocked) {
    app.innerHTML = `
      <section class="admin-lock">
        <p class="eyebrow">Data Management</p>
        <h2>数据后台管理</h2>
        <p>管理省市区县、高中名录、院校库、近年分数线和来源校验。演示密码：admin123。生产环境请迁移到 CloudBase 鉴权与数据库。</p>
        <input id="adminPassword" type="password" placeholder="请输入后台密码" />
        <button class="primary-btn" id="adminLogin" type="button">进入后台</button>
      </section>`;
    $("#adminLogin").addEventListener("click", () => {
      if ($("#adminPassword").value === db.adminPassword) { adminUnlocked = true; renderAdmin(); }
      else alert("密码错误");
    });
    return;
  }
  app.innerHTML = `
    <section class="card featured">
      <div class="card-title"><h3>数据资产概览</h3><span class="badge">${esc(db.version)}</span></div>
      <div class="kpi-grid">
        <div class="kpi"><strong>${db.regions.length}</strong><span>省级地区</span></div>
        <div class="kpi"><strong>${db.regions.reduce((n, r) => n + r.cities.length, 0)}</strong><span>城市</span></div>
        <div class="kpi"><strong>${db.highSchools.length}</strong><span>高中</span></div>
        <div class="kpi"><strong>${db.professionalDirections.length}</strong><span>专业方向</span></div>
        <div class="kpi"><strong>${db.universities.length}</strong><span>院校</span></div>
        <div class="kpi"><strong>${db.universities.reduce((n, u) => n + (u.cutoffs || []).length, 0)}</strong><span>分数线</span></div>
      </div>
      <div class="source-line">数据源：${esc(db.dataSource || "本地数据")}。上线建议：接入 CloudBase 数据库，按 province/year/category 建索引；每条数据保留 source、verified、operator、updatedAt。</div>
    </section>
    <section class="card">
      <div class="card-title"><h3>专业方向库</h3><span class="badge">${db.professionalDirections.length} 类</span></div>
      ${db.professionalDirections.map((item) => `<div class="record"><strong>${esc(item.name)}</strong><small>${esc((item.majors || []).join("、"))}</small></div>`).join("")}
    </section>
    <section class="card">
      <div class="card-title"><h3>新增高中名录</h3><span class="badge warn">支持检索下拉</span></div>
      <form id="highSchoolForm">
        <div class="grid-2"><div class="field"><label>学校名称</label><input name="name" required placeholder="如 广州市第二中学" /></div><div class="field"><label>等级</label><input name="level" placeholder="省示范/市重点" /></div></div>
        <div class="grid-3"><div class="field"><label>省份</label><input name="province" value="${esc(student.province)}" /></div><div class="field"><label>城市</label><input name="city" value="${esc(student.city)}" /></div><div class="field"><label>区县</label><input name="district" value="${esc(student.district)}" /></div></div>
        <button class="primary-btn" type="submit">保存高中</button>
      </form>
    </section>
    <section class="card">
      <div class="card-title"><h3>新增院校与分数线</h3><span class="badge warn">来源必填</span></div>
      <form id="universityForm">
        <div class="grid-2"><div class="field"><label>院校名称</label><input name="name" required placeholder="如 XX大学" /></div><div class="field"><label>院校类型</label><input name="type" placeholder="双一流 / 理工" /></div></div>
        <div class="grid-2"><div class="field"><label>省份</label><input name="province" required /></div><div class="field"><label>城市</label><input name="city" required /></div></div>
        <div class="field"><label>特色专业（逗号分隔）</label><input name="majors" placeholder="土木工程,建筑学,智能建造" /></div>
        <div class="grid-3"><div class="field"><label>分数线省份</label><input name="lineProvince" value="${esc(student.province)}" /></div><div class="field"><label>年份</label><input name="year" type="number" value="2025" /></div><div class="field"><label>科类</label><input name="category" value="${esc(student.subject)}" /></div></div>
        <div class="grid-3"><div class="field"><label>最低分</label><input name="minScore" type="number" required /></div><div class="field"><label>最低位次</label><input name="minRank" type="number" /></div><div class="field"><label>批次</label><input name="batch" value="本科批" /></div></div>
        <div class="field"><label>官方来源/备注</label><input name="source" required placeholder="如 省教育考试院投档线链接/文件编号" /></div>
        <button class="primary-btn" type="submit">保存院校</button>
      </form>
    </section>
    <section class="card">
      <div class="card-title"><h3>数据导入导出</h3><span class="badge">JSON</span></div>
      <textarea id="jsonBox" placeholder="点击导出生成 JSON；或粘贴完整数据库 JSON 后导入"></textarea>
      <button class="ghost-btn" id="exportJson" type="button">导出当前数据</button>
      <button class="primary-btn" id="importJson" type="button">导入并覆盖</button>
    </section>
    <section class="card">
      <div class="card-title"><h3>院校库</h3><span class="badge">${db.universities.length} 所</span></div>
      ${db.universities.map((u) => `<div class="record"><strong>${esc(u.name)}</strong><small>${esc(u.province)} · ${esc(u.city)} · ${esc(u.type)}<br/>分数线 ${(u.cutoffs || []).length} 条 · 专业 ${(u.majors || []).length} 个<br/>${esc((u.features || (u.majors || []).map((m) => m.name)).slice(0, 6).join("、"))}</small><div class="source-line">${esc(u.source || "后台维护院校数据；招生专业以当年招生计划为准")}</div><div class="row-actions"><button data-delete-uni="${esc(u.id)}" type="button">删除院校</button></div></div>`).join("")}
    </section>
    <section class="card">
      <div class="card-title"><h3>高中名录</h3><span class="badge">${db.highSchools.length} 所</span></div>
      ${db.highSchools.map((s) => `<div class="record"><strong>${esc(s.name)}</strong><small>${esc(s.province)} · ${esc(s.city)} · ${esc(s.district)} · ${esc(s.level || "未分级")}</small><div class="source-line">${esc(s.source || "后台维护高中名录")}</div><div class="row-actions"><button data-delete-school="${esc(s.id)}" type="button">删除高中</button></div></div>`).join("")}
    </section>`;
  bindAdmin(db);
}

function bindAdmin(db) {
  $("#highSchoolForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    db.highSchools.unshift({ id: uid("hs"), source: "后台手工录入", ...data });
    saveDb(db);
    renderAdmin();
  });
  $("#universityForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    const majors = (data.majors || "").split(/[,，]/).map((name) => name.trim()).filter(Boolean).map((name) => ({ name, cluster: name.includes("土木") || name.includes("建") || name.includes("规划") ? "土木建筑" : "不限", heat: 70, employmentIndex: 75 }));
    db.universities.unshift({
      id: uid("u"), name: data.name, province: data.province, city: data.city, type: data.type || "普通本科", tier: "后台新增", features: majors.map((m) => m.name), majors,
      cutoffs: [{ province: data.lineProvince, year: Number(data.year), category: data.category, minScore: Number(data.minScore), minRank: Number(data.minRank || 0), batch: data.batch || "本科批", source: data.source, verified: false }]
    });
    saveDb(db);
    renderAdmin();
  });
  $("#exportJson").addEventListener("click", () => { $("#jsonBox").value = JSON.stringify(db, null, 2); });
  $("#importJson").addEventListener("click", () => {
    try {
      const next = JSON.parse($("#jsonBox").value);
      if (!next.regions || !next.highSchools || !next.universities) throw new Error("结构缺少 regions/highSchools/universities");
      saveDb(next);
      alert("导入成功");
      renderAdmin();
    } catch (error) { alert(`导入失败：${error.message}`); }
  });
  document.querySelectorAll("[data-delete-uni]").forEach((btn) => btn.addEventListener("click", () => {
    if (!confirm("确认删除该院校？")) return;
    db.universities = db.universities.filter((u) => u.id !== btn.dataset.deleteUni);
    saveDb(db);
    renderAdmin();
  }));
  document.querySelectorAll("[data-delete-school]").forEach((btn) => btn.addEventListener("click", () => {
    if (!confirm("确认删除该高中？")) return;
    db.highSchools = db.highSchools.filter((s) => s.id !== btn.dataset.deleteSchool);
    saveDb(db);
    renderAdmin();
  }));
}

render();
