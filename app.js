/* =========================================================
   FULL SURVEY FLOW (clean rebuild) — MASTER (CORRECT)
   - screens config drives everything
   - answers stored in state.answers
   - scoring stored in state.score + state.auditTrail
   - BEFORE results page: collects Email + Phone, then submits to FormSpark
     FormSpark ID: 2kIN1hL95
   ========================================================= */

/* ------- FormSpark ------- */
const FORMSPARK_ENDPOINT = "https://submit-form.com/2kIN1hL95";

/* ------- Interstitial #2 config ------- */
const TARGET_PERCENT = 78;
const FILL_DURATION_MS = 2400;
const STAR_COUNT = 90;

/* ------- Global state ------- */
const state = {
  idx: 0,
  answers: {},
  score: { STABILITY: 0, EXPANSION: 0, LUXURY: 0, RESET: 0 },
  auditTrail: []
};

/* ------- Elements (single source of truth) ------- */
const screenEl = document.getElementById("screen");
const stepLabel = document.getElementById("stepLabel");
const progressFill = document.getElementById("progressFill");
const backBtn = document.getElementById("backBtn");

/* =========================================================
   SCREENS CONFIG
   ========================================================= */
const screens = [
  {
    id: "gender",
    type: "choice",
    title: "Select your gender to start",
    subtitle: "",
    options: [
      { value: "female", label: "Female", icon: "♀" },
      { value: "male", label: "Male", icon: "♂" },
      { value: "nonbinary", label: "Non-binary", icon: "⚧" }
    ],
    nextOnSelect: true
  },
  {
    id: "firstName",
    type: "input",
    title: "What’s your first name?",
    subtitle: "We’ll personalize your blueprint as you go.",
    fields: [{ key: "firstName", label: "First name", placeholder: "Type your first name..." }],
    validate: (vals) => !!vals.firstName?.trim()
  },
  {
    id: "dob",
    type: "dobWheel",
    title: (s) => `Nice to meet you, ${s.answers.firstName || "love"}. When were you born?`,
    subtitle: "Scroll month, day, and year."
  },
  {
    id: "birthTime",
    type: "tobWheel",
    title: "Do you know your birth time?",
    subtitle: "This helps us find out where planets were placed in the sky at the moment of your birth",
    rememberLinkText: "I don’t remember"
  },
  {
    id: "birthPlace",
    type: "input",
    title: "Where were you born?",
    subtitle: "City and province/state (ex: Dallas, TX).",
    fields: [{ key: "birthPlace", label: "Birthplace", placeholder: "City, Province/State" }],
    validate: (vals) => !!vals.birthPlace?.trim()
  },

  /* -------- Interstitial #1 -------- */
  {
    id: "interstitial1",
    type: "interstitialCalc",
    title: "Collecting Your Charts...",
    subtitle: "Your money blueprint has an energetic imprint from when you were born. One moment while we connect the dots.",
    rows: [
      { icon: "✨", text: "Reading your birth set points vs. expansion baseline" },
      { icon: "🧠", text: "Detecting your internal safety DNA around money" },
      { icon: "🧬", text: "Mapping your energetic coding markers" },
      { icon: "🧿", text: "Reading the energetic birth imprint" },
      { icon: "🔮", text: "Generating the next questions based on your money blueprint" }
    ],
    finishMessage: "Your cosmic details have been collected. Let’s personalize your report.",
    ctaText: "Continue"
  },

  /* -------- Archetype questions -------- */
  {
    id: "incomeNow",
    type: "choice",
    title: (s) => `Great, ${s.answers.firstName || "love"}… first, how does money come to you right now?`,
    subtitle: "Pick the closest match.",
    options: [
      { value: "job", label: "Job / employment income", icon: "💼", score: { STABILITY: 2 } },
      { value: "self", label: "Self-employed or contract work", icon: "🧾", score: { EXPANSION: 2 } },
      { value: "owner", label: "Business owner (systems or team)", icon: "🏗️", score: { LUXURY: 1, EXPANSION: 2 } },
      { value: "creator", label: "Side income / creator work", icon: "📱", score: { EXPANSION: 2 } },
      { value: "spouse", label: "Family / spouse provides most income", icon: "🏡", score: { STABILITY: 1, RESET: 1 } },
      { value: "gov", label: "Government support / grants", icon: "🧾", score: { RESET: 2 } }
    ],
    nextOnSelect: true
  },
  {
    id: "moneyEmotion",
    type: "choice",
    title: (s) => `Thanks ${s.answers.firstName || ""}. When you think about money… which feels closest to your reality right now?`,
    subtitle: "No judgment. Just data.",
    options: [
      { value: "comfortable", label: "Comfortable – bills covered + a little extra", icon: "🙂", score: { STABILITY: 2 } },
      { value: "expansive", label: "Expansive – I can spend on a whim without stress", icon: "🌬️", score: { EXPANSION: 2 } },
      { value: "luxury", label: "Luxury – I don’t think twice about bills or desires", icon: "💎", score: { LUXURY: 3 } },
      { value: "stressful", label: "Stressful – paycheck to paycheck", icon: "😬", score: { RESET: 2 } },
      { value: "debt", label: "Debt – I feel like I’m moving backward", icon: "🧱", score: { RESET: 3 } }
    ],
    nextOnSelect: true
  },
  {
    id: "manifestation",
    type: "choice",
    title: "Do you use any mindset / manifestation tools now?",
    subtitle: "Pick the closest one.",
    options: [
      { value: "daily", label: "Yes – it’s a daily practice", icon: "🧘", score: { EXPANSION: 1, LUXURY: 1 } },
      { value: "sometimes", label: "Sometimes – when I remember", icon: "🌙", score: { EXPANSION: 1 } },
      { value: "curious", label: "Not really… but I’m curious", icon: "👀", score: { STABILITY: 1 } },
      { value: "no", label: "No – I’m more practical/logic-led", icon: "📊", score: { STABILITY: 2 } }
    ],
    nextOnSelect: true
  },
  {
    id: "commitment",
    type: "choice",
    title: "How willing are you to do what it takes to hit your money goals?",
    subtitle: "Be honest with your current bandwidth.",
    options: [
      { value: "allin", label: "All in. I’m done playing small.", icon: "🔥", score: { EXPANSION: 2, LUXURY: 1 } },
      { value: "steady", label: "Steady. I’ll do consistent steps.", icon: "✅", score: { STABILITY: 2 } },
      { value: "overwhelm", label: "I want it… but I’m overwhelmed.", icon: "🫠", score: { RESET: 2 } },
      { value: "skeptical", label: "I’m skeptical / need proof first.", icon: "🧩", score: { STABILITY: 1 } }
    ],
    nextOnSelect: true
  },

  /* -------- Interstitial #2 -------- */
  {
    id: "interstitial2",
    type: "interstitialBubble",
    title: "Forecast accuracy",
    subtitle: "Calculating the accuracy of your personalized blueprint...",
    speech: "Drop the Share a bit more to reveal what’s driving you to get a more accurate reading!",
    ctaText: "Continue",
    autoAdvance: false
  },

  {
    id: "moneyQuestion1",
    type: "textarea",
    title: "What’s the biggest question about money you want this blueprint to reveal?",
    subtitle: "Type N/A if you don’t have one right now. Just know it will limit the personalization of the report.",
    placeholder: "Type here...",
    validate: (vals) => !!vals.moneyQuestion1?.trim()
  },
  {
    id: "moneyQuestion2",
    type: "textarea",
    title: "If this blueprint answered one money question for you… what would you want it to be?",
    subtitle: "Type N/A if you don’t have one right now. Just know it will limit the level of detail inside the report.",
    placeholder: "Type here...",
    validate: (vals) => !!vals.moneyQuestion2?.trim()
  },

  /* -------- EMAIL + PHONE (SUBMIT TO FORMSPARK BEFORE RESULTS) -------- */
  {
    id: "contact",
    type: "contact",
    title: (s) => `Perfect, ${s.answers.firstName || "love"}… where should we send your results?`,
    subtitle: "Enter your email + phone so we can deliver your personalized money blueprint.",
    ctaText: "Send my results",
    validate: (vals) => isValidEmail(vals.email) && isValidPhone(vals.phone)
  },

  /* -------- Results -------- */
  {
    id: "results",
    type: "results",
    title: "Audit Mode Results",
    subtitle: "Here’s exactly how your archetype was calculated."
  }
];

/* =========================================================
   HEADER / FLOW HELPERS
   ========================================================= */
function totalSteps() { return screens.length; }

function setHeaderProgress() {
  const stepText = `${state.idx + 1}/${totalSteps()}`;
  if (stepLabel) stepLabel.textContent = stepText;

  const pct = Math.round(((state.idx + 1) / totalSteps()) * 100);
  if (progressFill) progressFill.style.width = pct + "%";

  if (backBtn) backBtn.style.visibility = state.idx === 0 ? "hidden" : "visible";
}

function clearScreen() { if (screenEl) screenEl.innerHTML = ""; }

function h2Title(text) {
  const h = document.createElement("h2");
  h.className = "title";
  h.textContent = text;
  return h;
}

function pSub(text) {
  const p = document.createElement("p");
  p.className = "subtitle";
  p.textContent = text || "";
  return p;
}

function next() { if (state.idx < screens.length - 1) { state.idx++; render(); } }
function back() { if (state.idx > 0) { state.idx--; render(); } }

/* ----- scoring helper ----- */
function applyScore(screen, option) {
  if (!option?.score) return;

  Object.entries(option.score).forEach(([k, v]) => {
    state.score[k] = (state.score[k] || 0) + v;
  });

  state.auditTrail.push({
    qid: screen.id,
    question: typeof screen.title === "function" ? screen.title(state) : screen.title,
    answerLabel: option.label,
    scoreDelta: option.score
  });
}

/* =========================================================
   VALIDATION + NORMALIZERS
   ========================================================= */
function isValidEmail(email) {
  const e = String(email || "").trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

function normalizePhone(phone) {
  let p = String(phone || "").trim();
  const hasPlus = p.startsWith("+");
  p = p.replace(/[^\d]/g, "");
  if (hasPlus) p = "+" + p;
  return p;
}

function isValidPhone(phone) {
  const p = normalizePhone(phone);
  const digits = p.replace(/[^\d]/g, "");
  return digits.length >= 10;
}

/* =========================================================
   BUILD FLAT FORMSPARK PAYLOAD
   ========================================================= */
function getWinningArchetype() {
  const entries = Object.entries(state.score);
  entries.sort((a, b) => b[1] - a[1]);
  return { archetype: entries[0][0], score: entries[0][1], sorted: entries };
}

function getQuestionScreensInOrder() {
  return screens.filter(s =>
    ["choice", "input", "textarea", "dobWheel", "tobWheel", "contact"].includes(s.type)
  );
}

function getScreenQuestionText(scr) {
  const t = typeof scr.title === "function" ? scr.title(state) : scr.title;
  return String(t || scr.id);
}

function getScreenAnswerValue(scr) {
  if (scr.type === "input") {
    const f = (scr.fields || [])[0];
    if (!f) return "";
    return String(state.answers[f.key] || "");
  }

  if (scr.type === "dobWheel") return String(state.answers.dob || "");
  if (scr.type === "tobWheel") return String(state.answers.birthTime || "");

  if (scr.type === "contact") {
    return `email: ${(state.answers.email || "").trim()} | phone: ${normalizePhone(state.answers.phone || "")}`;
  }

  return String(state.answers[scr.id] || "");
}

function buildFormSparkPayloadFlat() {
  const win = getWinningArchetype();
  const qs = getQuestionScreensInOrder();

  const payload = {};
  payload.submittedAt = new Date().toISOString();
  payload.Email = (state.answers.email || "").trim();
  payload.Phone = normalizePhone(state.answers.phone || "");

  payload.topPattern = win.archetype;
  payload.score_STABILITY = state.score.STABILITY ?? 0;
  payload.score_EXPANSION = state.score.EXPANSION ?? 0;
  payload.score_LUXURY = state.score.LUXURY ?? 0;
  payload.score_RESET = state.score.RESET ?? 0;

  qs.forEach((scr, i) => {
    const n = i + 1;
    payload[`Q${n}`] = getScreenAnswerValue(scr);
    payload[`Q${n}_question`] = getScreenQuestionText(scr);
  });

  payload.scoreTotals =
    `STABILITY ${payload.score_STABILITY} • EXPANSION ${payload.score_EXPANSION} • LUXURY ${payload.score_LUXURY} • RESET ${payload.score_RESET}`;

  return payload;
}

async function submitToFormSpark() {
  const payload = buildFormSparkPayloadFlat();

  // 1) JSON POST
  try {
    const res = await fetch(FORMSPARK_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(payload)
    });
    if (res && res.ok) return true;
  } catch (err) {
    console.warn("FormSpark JSON POST failed. Falling back.", err);
  }

  // 2) no-cors urlencoded
  try {
    const params = new URLSearchParams();
    Object.entries(payload).forEach(([k, v]) => params.append(k, String(v ?? "")));

    await fetch(FORMSPARK_ENDPOINT, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
      body: params.toString()
    });
    return true;
  } catch (err2) {
    console.warn("FormSpark no-cors POST failed. Falling back to sendBeacon.", err2);
  }

  // 3) sendBeacon
  try {
    const blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
    const ok = navigator.sendBeacon(FORMSPARK_ENDPOINT, blob);
    if (ok) return true;
  } catch (err3) {
    console.warn("sendBeacon failed.", err3);
  }

  throw new Error("All submit methods failed.");
}

/* =========================================================
   SCREEN RENDERERS
   ========================================================= */
function renderChoice(screen) {
  const title = typeof screen.title === "function" ? screen.title(state) : screen.title;

  screenEl.appendChild(h2Title(title));
  if (screen.subtitle) screenEl.appendChild(pSub(screen.subtitle));

  const list = document.createElement("div");
  list.className = "optionList";

  screen.options.forEach(opt => {
    const btn = document.createElement("button");
    btn.className = "optionBtn";
    btn.type = "button";

    const ico = document.createElement("div");
    ico.className = "optionIcon";
    ico.textContent = opt.icon || "•";

    const txt = document.createElement("div");
    txt.textContent = opt.label;

    btn.appendChild(ico);
    btn.appendChild(txt);

    btn.addEventListener("click", () => {
      state.answers[screen.id] = opt.value;
      applyScore(screen, opt);
      if (screen.nextOnSelect) next();
      else render();
    });

    list.appendChild(btn);
  });

  screenEl.appendChild(list);

  if (!screen.nextOnSelect) {
    const cta = document.createElement("button");
    cta.className = "cta";
    cta.textContent = "Continue";
    cta.disabled = !state.answers[screen.id];
    cta.addEventListener("click", next);
    screenEl.appendChild(cta);
  }
}

function renderInput(screen) {
  const title = typeof screen.title === "function" ? screen.title(state) : screen.title;

  screenEl.appendChild(h2Title(title));
  if (screen.subtitle) screenEl.appendChild(pSub(screen.subtitle));

  const wrap = document.createElement("div");
  wrap.className = "formWrap";

  const cta = document.createElement("button");
  cta.className = "cta";
  cta.textContent = "Continue";
  cta.type = "button";

  screen.fields.forEach(f => {
    const field = document.createElement("div");
    field.className = "field";

    const label = document.createElement("div");
    label.className = "label";
    label.textContent = f.label;

    const input = document.createElement("input");
    input.className = "input";
    input.placeholder = f.placeholder || "";
    input.value = state.answers[f.key] || "";

    input.addEventListener("input", () => {
      state.answers[f.key] = input.value;
      cta.disabled = screen.validate ? !screen.validate(state.answers) : false;
    });

    field.appendChild(label);
    field.appendChild(input);
    wrap.appendChild(field);
  });

  screenEl.appendChild(wrap);

  cta.disabled = screen.validate ? !screen.validate(state.answers) : false;
  cta.addEventListener("click", next);
  screenEl.appendChild(cta);
}

function renderTextarea(screen) {
  const title = typeof screen.title === "function" ? screen.title(state) : screen.title;

  screenEl.appendChild(h2Title(title));
  if (screen.subtitle) screenEl.appendChild(pSub(screen.subtitle));

  const wrap = document.createElement("div");
  wrap.className = "formWrap";

  const field = document.createElement("div");
  field.className = "field";

  const label = document.createElement("div");
  label.className = "label";
  label.textContent = "Your answer";

  const ta = document.createElement("textarea");
  ta.className = "input";
  ta.style.height = "120px";
  ta.style.paddingTop = "12px";
  ta.style.resize = "none";
  ta.placeholder = screen.placeholder || "";
  ta.value = state.answers[screen.id] || "";

  field.appendChild(label);
  field.appendChild(ta);
  wrap.appendChild(field);
  screenEl.appendChild(wrap);

  const cta = document.createElement("button");
  cta.className = "cta";
  cta.type = "button";
  cta.textContent = "Continue";

  function validateNow() {
    state.answers[screen.id] = ta.value;
    cta.disabled = screen.validate ? !screen.validate(state.answers) : false;
  }
  ta.addEventListener("input", validateNow);
  validateNow();

  cta.addEventListener("click", next);
  screenEl.appendChild(cta);
}

/* =========================================================
   DOB WHEEL
   ========================================================= */
function renderDobWheel(screen) {
  const title = typeof screen.title === "function" ? screen.title(state) : screen.title;

  screenEl.appendChild(h2Title(title));
  if (screen.subtitle) screenEl.appendChild(pSub(screen.subtitle));

  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const days = Array.from({ length: 31 }, (_, i) => String(i + 1));
  const thisYear = new Date().getFullYear();
  const years = Array.from({ length: 120 }, (_, i) => String(thisYear - i));

  const wrap = document.createElement("div");
  wrap.className = "dobWrap";

  const wheelBox = document.createElement("div");
  wheelBox.className = "dobWheelBox";

  const cols = document.createElement("div");
  cols.className = "dobCols";

  const cta = document.createElement("button");
  cta.className = "cta";
  cta.type = "button";
  cta.textContent = "Continue";

  function getItemHeight(scroller) {
    const item = scroller.querySelector(".dobItem");
    return item ? item.getBoundingClientRect().height : 44;
  }

  function setDobString() {
    const m = state.answers.month;
    const d = state.answers.day;
    const y = state.answers.year;
    if (!m || !d || !y) { state.answers.dob = ""; return; }
    const mm = String(months.indexOf(m) + 1).padStart(2, "0");
    const dd = String(d).padStart(2, "0");
    state.answers.dob = `${y}-${mm}-${dd}`;
  }

  function setSelected(scroller, chosenEl) {
    scroller.querySelectorAll(".dobItem").forEach(el => el.classList.remove("isSelected"));
    chosenEl.classList.add("isSelected");

    const key = scroller.getAttribute("data-key");
    const val = chosenEl.getAttribute("data-value");
    state.answers[key] = val;

    setDobString();
    cta.disabled = !state.answers.dob;
  }

  function scrollToValue(scroller, value, immediate = false) {
    const item = scroller.querySelector(`.dobItem[data-value="${CSS.escape(value)}"]`);
    if (!item) return;

    const itemH = getItemHeight(scroller);
    const padH = itemH * 2;
    const items = Array.from(scroller.querySelectorAll(".dobItem"));
    const idx = items.indexOf(item);

    const top = padH + idx * itemH;
    const target = top - itemH;

    scroller.scrollTo({ top: target, behavior: immediate ? "auto" : "smooth" });
    setSelected(scroller, item);
  }

  function snapToNearest(scroller) {
    const itemH = getItemHeight(scroller);
    const padH = itemH * 2;

    const raw = scroller.scrollTop + itemH;
    const idx = Math.round((raw - padH) / itemH);

    const items = Array.from(scroller.querySelectorAll(".dobItem"));
    const clamped = Math.max(0, Math.min(items.length - 1, idx));
    const chosen = items[clamped];
    if (!chosen) return;

    scrollToValue(scroller, chosen.getAttribute("data-value"), false);
  }

  function makeWheel({ label, key, items }) {
    const col = document.createElement("div");
    col.className = "dobCol";

    const head = document.createElement("div");
    head.className = "dobColLabel";
    head.textContent = label;

    const scroller = document.createElement("div");
    scroller.className = "dobWheel";
    scroller.setAttribute("data-key", key);

    const topPad = document.createElement("div");
    topPad.className = "dobPad";
    const botPad = document.createElement("div");
    botPad.className = "dobPad";

    scroller.appendChild(topPad);

    items.forEach((val) => {
      const row = document.createElement("div");
      row.className = "dobItem";
      row.textContent = val;
      row.setAttribute("data-value", val);
      row.addEventListener("click", () => scrollToValue(scroller, val));
      scroller.appendChild(row);
    });

    scroller.appendChild(botPad);

    let t;
    scroller.addEventListener("scroll", () => {
      clearTimeout(t);
      t = setTimeout(() => snapToNearest(scroller), 90);
    });

    const existing = state.answers[key];
    const defaultVal =
      key === "month" ? months[new Date().getMonth()]
      : key === "day" ? String(new Date().getDate())
      : String(new Date().getFullYear());

    requestAnimationFrame(() => {
      scrollToValue(scroller, (existing && items.includes(existing)) ? existing : defaultVal, true);
    });

    col.appendChild(head);
    col.appendChild(scroller);
    return col;
  }

  cols.appendChild(makeWheel({ label: "Month", key: "month", items: months }));
  cols.appendChild(makeWheel({ label: "Day", key: "day", items: days }));
  cols.appendChild(makeWheel({ label: "Year", key: "year", items: years }));

  wheelBox.appendChild(cols);

  const lines = document.createElement("div");
  lines.className = "dobLines";
  wheelBox.appendChild(lines);

  wrap.appendChild(wheelBox);
  screenEl.appendChild(wrap);

  setDobString();
  cta.disabled = !state.answers.dob;
  cta.addEventListener("click", next);
  screenEl.appendChild(cta);
}

/* =========================================================
   TOB WHEEL
   ========================================================= */
function renderTobWheel(screen) {
  const title = typeof screen.title === "function" ? screen.title(state) : screen.title;

  screenEl.appendChild(h2Title(title));
  if (screen.subtitle) screenEl.appendChild(pSub(screen.subtitle));

  const hours = Array.from({ length: 12 }, (_, i) => String(i + 1));
  const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));
  const meridiems = ["AM", "PM"];

  const wrap = document.createElement("div");
  wrap.className = "dobWrap";

  const wheelBox = document.createElement("div");
  wheelBox.className = "dobWheelBox";

  const cols = document.createElement("div");
  cols.className = "dobCols";

  const cta = document.createElement("button");
  cta.className = "cta";
  cta.textContent = "Continue";
  cta.type = "button";

  const remember = document.createElement("button");
  remember.type = "button";
  remember.className = "tobRemember";
  remember.textContent = screen.rememberLinkText || "I don’t remember";

  function getItemHeight(scroller) {
    const item = scroller.querySelector(".dobItem");
    return item ? item.getBoundingClientRect().height : 44;
  }

  function setBirthTimeString() {
    if (state.answers.birthTime === "Unknown") return;

    const h = state.answers.tobHour;
    const m = state.answers.tobMinute;
    const ap = state.answers.tobMeridiem;

    if (!h || !m || !ap) { state.answers.birthTime = ""; return; }
    state.answers.birthTime = `${h}:${m} ${ap}`;
  }

  function setSelected(scroller, chosenEl) {
    scroller.querySelectorAll(".dobItem").forEach(el => el.classList.remove("isSelected"));
    chosenEl.classList.add("isSelected");

    const key = scroller.getAttribute("data-key");
    const val = chosenEl.getAttribute("data-value");
    state.answers[key] = val;

    if (state.answers.birthTime === "Unknown") state.answers.birthTime = "";

    setBirthTimeString();
    cta.disabled = !state.answers.birthTime;
  }

  function scrollToValue(scroller, value, immediate = false) {
    const item = scroller.querySelector(`.dobItem[data-value="${CSS.escape(value)}"]`);
    if (!item) return;

    const itemH = getItemHeight(scroller);
    const padH = itemH * 2;

    const items = Array.from(scroller.querySelectorAll(".dobItem"));
    const idx = items.indexOf(item);

    const top = padH + idx * itemH;
    const target = top - itemH;

    scroller.scrollTo({ top: target, behavior: immediate ? "auto" : "smooth" });
    setSelected(scroller, item);
  }

  function snapToNearest(scroller) {
    const itemH = getItemHeight(scroller);
    const padH = itemH * 2;

    const raw = scroller.scrollTop + itemH;
    const idx = Math.round((raw - padH) / itemH);

    const items = Array.from(scroller.querySelectorAll(".dobItem"));
    const clamped = Math.max(0, Math.min(items.length - 1, idx));
    const chosen = items[clamped];
    if (!chosen) return;

    scrollToValue(scroller, chosen.getAttribute("data-value"), false);
  }

  function makeWheel({ key, items, defaultVal }) {
    const col = document.createElement("div");
    col.className = "dobCol";

    const scroller = document.createElement("div");
    scroller.className = "dobWheel";
    scroller.setAttribute("data-key", key);

    const topPad = document.createElement("div");
    topPad.className = "dobPad";
    const botPad = document.createElement("div");
    botPad.className = "dobPad";

    scroller.appendChild(topPad);

    items.forEach((val) => {
      const row = document.createElement("div");
      row.className = "dobItem";
      row.textContent = val;
      row.setAttribute("data-value", val);
      row.addEventListener("click", () => scrollToValue(scroller, val));
      scroller.appendChild(row);
    });

    scroller.appendChild(botPad);

    let t;
    scroller.addEventListener("scroll", () => {
      clearTimeout(t);
      t = setTimeout(() => snapToNearest(scroller), 90);
    });

    const existing = state.answers[key];
    const initVal = (existing && items.includes(existing)) ? existing : defaultVal;

    requestAnimationFrame(() => scrollToValue(scroller, initVal, true));

    col.appendChild(scroller);
    return col;
  }

  const now = new Date();
  let hh = now.getHours();
  const ap = hh >= 12 ? "PM" : "AM";
  hh = hh % 12; if (hh === 0) hh = 12;
  const mm = String(now.getMinutes()).padStart(2, "0");

  cols.appendChild(makeWheel({ key: "tobHour", items: hours, defaultVal: String(hh) }));
  cols.appendChild(makeWheel({ key: "tobMinute", items: minutes, defaultVal: mm }));
  cols.appendChild(makeWheel({ key: "tobMeridiem", items: meridiems, defaultVal: ap }));

  wheelBox.appendChild(cols);

  const lines = document.createElement("div");
  lines.className = "dobLines";
  wheelBox.appendChild(lines);

  wrap.appendChild(wheelBox);
  screenEl.appendChild(wrap);

  const actions = document.createElement("div");
  actions.className = "tobActions";
  actions.appendChild(remember);
  actions.appendChild(cta);
  screenEl.appendChild(actions);

  remember.addEventListener("click", () => {
    state.answers.birthTime = "Unknown";
    cta.disabled = false;
    wrap.querySelectorAll(".dobItem").forEach(el => el.classList.remove("isSelected"));
  });

  requestAnimationFrame(() => {
    setBirthTimeString();
    cta.disabled = !state.answers.birthTime;
  });

  cta.addEventListener("click", (e) => {
    e.preventDefault();
    if (cta.disabled) return;
    next();
  });
}

/* =========================================================
   Interstitial #1 (Collecting Your Charts...)
   ========================================================= */
function buildCalcOrbSparkles(orbEl, count = 26) {
  const wrap = document.createElement("div");
  wrap.className = "orbSparkles";
  orbEl.appendChild(wrap);

  for (let i = 0; i < count; i++) {
    const sp = document.createElement("span");
    const angle = Math.random() * Math.PI * 2;
    const radius = 18 + Math.random() * 44;
    const x = 50 + Math.cos(angle) * radius;
    const y = 50 + Math.sin(angle) * radius;
    const size = Math.random() < 0.25 ? 3 : 2;
    const op = 0.18 + Math.random() * 0.6;

    sp.style.setProperty("--x", x + "%");
    sp.style.setProperty("--y", y + "%");
    sp.style.setProperty("--sz", size + "px");
    sp.style.setProperty("--op", op.toFixed(2));
    sp.style.setProperty("--tw", (1600 + Math.random() * 2400) + "ms");
    sp.style.setProperty("--dr", (4200 + Math.random() * 3800) + "ms");
    sp.style.setProperty("--dl", (Math.random() * 1800) + "ms");
    sp.style.setProperty("--dx", (-8 + Math.random() * 16) + "px");
    sp.style.setProperty("--dy", (-10 + Math.random() * 20) + "px");
    wrap.appendChild(sp);
  }
}

function initOrbConstellationPersistent(orbEl, icons = ["✨"]) {
  const canvas = document.createElement("canvas");
  canvas.className = "orbCanvas";
  const ctx = canvas.getContext("2d");
  orbEl.appendChild(canvas);

  const nodesWrap = document.createElement("div");
  nodesWrap.className = "orbNodes";
  orbEl.appendChild(nodesWrap);

  let rafId = null;
  let stopped = false;

  const COUNT = Math.max(7, Math.min(12, icons.length || 9));
  const REVEAL_WINDOW_MS = 1400;
  const MIN_DELAY_MS = 80;

  const nodes = [];
  const rand = (min, max) => min + Math.random() * (max - min);

  function resize() {
    const r = orbEl.getBoundingClientRect();
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    canvas.width = Math.floor(r.width * dpr);
    canvas.height = Math.floor(r.height * dpr);
    canvas.style.width = `${r.width}px`;
    canvas.style.height = `${r.height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function makeNodes() {
    nodesWrap.innerHTML = "";
    nodes.length = 0;

    const rect = orbEl.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    const cx = w / 2;
    const cy = h / 2;
    const baseR = Math.min(w, h) * 0.30;

    const delays = Array.from({ length: COUNT }, () => rand(MIN_DELAY_MS, REVEAL_WINDOW_MS))
      .sort((a, b) => a - b);

    for (let i = 0; i < COUNT; i++) {
      const angle = (Math.PI * 2 * i) / COUNT + rand(-0.18, 0.18);
      const radius = baseR + rand(-12, 14);

      const x = cx + Math.cos(angle) * radius;
      const y = cy + Math.sin(angle) * radius;

      const el = document.createElement("div");
      el.className = "orbNode";
      el.textContent = icons[i % icons.length] || "✨";
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
      el.style.setProperty("--a", "0");
      el.style.setProperty("--s", "0.7");

      nodesWrap.appendChild(el);
      nodes.push({ el, x, y, alpha: 0, revealAt: delays[i] });
    }
  }

  let start = null;

  function draw(ts) {
    if (stopped) return;
    if (start == null) start = ts;
    const t = ts - start;

    const rect = orbEl.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;

    ctx.clearRect(0, 0, w, h);

    for (const n of nodes) {
      const age = t - n.revealAt;

      if (age <= 0) {
        n.alpha = 0;
        n.el.style.setProperty("--a", "0");
        continue;
      }

      const a = Math.min(1, age / 420);
      n.alpha = a;

      const popPhase = Math.max(0, 1 - age / 520);
      const pop = 1 + popPhase * 0.28;

      n.el.style.setProperty("--a", a.toFixed(3));
      n.el.style.setProperty("--s", pop.toFixed(3));
    }

    const maxDist = Math.min(w, h) * 0.42;
    ctx.lineWidth = 1;

    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      if (a.alpha <= 0.05) continue;

      const dists = [];
      for (let j = 0; j < nodes.length; j++) {
        if (i === j) continue;
        const b = nodes[j];
        if (b.alpha <= 0.05) continue;
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        dists.push({ j, d });
      }

      dists.sort((p, q) => p.d - q.d);
      const neighbors = dists.slice(0, 2);

      for (const nb of neighbors) {
        const b = nodes[nb.j];
        const d = nb.d;
        if (d > maxDist) continue;

        const strength = (1 - d / maxDist) * Math.min(a.alpha, b.alpha);
        if (strength <= 0.02) continue;

        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = `rgba(0,0,0,${0.55 * strength})`;
        ctx.stroke();
      }
    }

    rafId = requestAnimationFrame(draw);
  }

  resize();
  makeNodes();

  const onResize = () => {
    if (stopped) return;
    resize();
    makeNodes();
    start = null;
  };
  window.addEventListener("resize", onResize);

  rafId = requestAnimationFrame(draw);

  return function stop() {
    stopped = true;
    if (rafId) cancelAnimationFrame(rafId);
    window.removeEventListener("resize", onResize);
    canvas.remove();
    nodesWrap.remove();
  };
}

function renderInterstitialCalc(screen) {
  const title = typeof screen.title === "function" ? screen.title(state) : screen.title;

  screenEl.appendChild(h2Title(title));
  if (screen.subtitle) screenEl.appendChild(pSub(screen.subtitle));

  const wrap = document.createElement("div");
  wrap.className = "calcWrap";

  const orb = document.createElement("div");
  orb.className = "calcOrb";

  buildCalcOrbSparkles(orb, 26);

  const rings = document.createElement("div");
  rings.className = "radarRings";
  orb.appendChild(rings);

  const list = document.createElement("div");
  list.className = "calcList";

  const rowEls = (screen.rows || []).map((r) => {
    const row = document.createElement("div");
    row.className = "calcRow";

    const left = document.createElement("div");
    left.className = "calcLeft";

    const badge = document.createElement("div");
    badge.className = "calcBadge";
    badge.textContent = r.icon || "✨";

    const txt = document.createElement("div");
    txt.textContent = r.text;

    left.appendChild(badge);
    left.appendChild(txt);

    const status = document.createElement("div");
    status.className = "calcStatus";
    status.textContent = "Calculating";

    const check = document.createElement("div");
    check.className = "calcCheck";

    row.appendChild(left);
    row.appendChild(status);
    row.appendChild(check);

    list.appendChild(row);
    return { row, status, check };
  });

  wrap.appendChild(orb);
  wrap.appendChild(list);

  const finishMsg = document.createElement("div");
  finishMsg.className = "calcFinishMsg";
  finishMsg.textContent =
    screen.finishMessage || "Your cosmic details have been collected. Let’s personalize your report.";
  wrap.appendChild(finishMsg);

  const cta = document.createElement("button");
  cta.className = "cta ctaGhost";
  cta.type = "button";
  cta.textContent = screen.ctaText || "Continue";
  cta.addEventListener("click", next);
  wrap.appendChild(cta);

  screenEl.appendChild(wrap);

  const icons = (screen.rows || []).map(r => r.icon).filter(Boolean);
  initOrbConstellationPersistent(orb, icons.length ? icons : ["✨"]);

  rowEls.forEach((obj, i) => setTimeout(() => obj.row.classList.add("show"), i * 380));

  rowEls.forEach((obj, i) => {
    setTimeout(() => {
      obj.status.textContent = "Complete";
      obj.check.classList.add("done");
    }, 900 + i * 520);
  });

  const lastCompleteAt = 900 + (rowEls.length - 1) * 520;
  const showMsgAt = lastCompleteAt + 450;
  const showBtnAt = showMsgAt + 650;

  setTimeout(() => finishMsg.classList.add("show"), showMsgAt);
  setTimeout(() => cta.classList.add("show"), showBtnAt);
}

/* =========================================================
   Interstitial #2 (Forecast Accuracy) — bubbleWrap version
   - Matches your "INTERSTITIAL #2 ONLY" CSS classnames
   - Speech + Continue appear ONLY after fill completes
   ========================================================= */

const ORBIT_DOT_COUNT = 12;
const LIQUID_SPARKLE_COUNT = 18;

function buildCosmosStars(el, count = STAR_COUNT) {
  el.innerHTML = "";
  for (let i = 0; i < count; i++) {
    const s = document.createElement("span");
    s.style.left = Math.random() * 100 + "%";
    s.style.top = Math.random() * 100 + "%";
    s.style.width = s.style.height = Math.random() < 0.18 ? "2px" : "1px";
    s.style.setProperty("--op", (0.25 + Math.random() * 0.6).toFixed(2));
    s.style.setProperty("--tw", 1200 + Math.random() * 2800 + "ms");
    s.style.setProperty("--dr", 6000 + Math.random() * 9000 + "ms");
    el.appendChild(s);
  }
}

function buildOrbitDots(el, count = ORBIT_DOT_COUNT) {
  el.innerHTML = "";
  for (let i = 0; i < count; i++) {
    const d = document.createElement("span");
    d.className = "orbitDot";
    d.style.setProperty("--a", Math.random() * 360 + "deg");
    d.style.setProperty("--r", 112 + Math.random() * 44 + "px");
    d.style.setProperty("--d", 10 + Math.random() * 16 + "s");
    d.style.setProperty("--sz", Math.random() < 0.25 ? "4px" : "3px");
    el.appendChild(d);
  }
}

function buildLiquidSparkles(el) {
  el.innerHTML = "";
  for (let i = 0; i < LIQUID_SPARKLE_COUNT; i++) {
    const s = document.createElement("span");
    s.style.left = Math.random() * 100 + "%";
    s.style.top = 70 + Math.random() * 40 + "%";
    s.style.setProperty("--rise", 2200 + Math.random() * 2200 + "ms");
    s.style.setProperty("--tw", 900 + Math.random() * 1600 + "ms");
    s.style.setProperty("--op", (0.15 + Math.random() * 0.7).toFixed(2));
    s.style.animationDelay = Math.random() * 2400 + "ms";
    s.style.width = s.style.height = Math.random() < 0.35 ? "2px" : "3px";
    el.appendChild(s);
  }
}

function animateFill(percentEl, liquidEl, target, duration, onDone) {
  const start = performance.now();
  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

  function tick(now) {
    const t = Math.min(1, (now - start) / duration);
    const eased = easeOutCubic(t);
    const value = Math.round(target * eased);

    percentEl.textContent = value + "%";
    liquidEl.style.height = value + "%";

    if (t < 1) requestAnimationFrame(tick);
    else if (typeof onDone === "function") onDone();
  }

  requestAnimationFrame(tick);
}

function renderInterstitialBubble(screen) {
  const title = typeof screen.title === "function" ? screen.title(state) : screen.title;

  // Title/subtitle use your existing global helpers (.title/.subtitle)
  screenEl.appendChild(h2Title(title));
  screenEl.appendChild(pSub(screen.subtitle || "Calculating the accuracy of your personalized blueprint..."));

  const wrap = document.createElement("div");
  wrap.className = "bubbleWrap";

  const cosmos = document.createElement("div");
  cosmos.className = "cosmos";
  const cosmosStars = document.createElement("div");
  cosmosStars.className = "cosmosStars";
  cosmos.appendChild(cosmosStars);
  wrap.appendChild(cosmos);

  const halo = document.createElement("div");
  halo.className = "bubbleHalo";
  wrap.appendChild(halo);

  const orbit = document.createElement("div");
  orbit.className = "bubbleOrbit";
  wrap.appendChild(orbit);

  const bubble = document.createElement("div");
  bubble.className = "bubble";

  const glass = document.createElement("div");
  glass.className = "bubbleGlass";

  const aurora = document.createElement("div");
  aurora.className = "aurora oilslick";

  const liquid = document.createElement("div");
  liquid.className = "liquid";
  liquid.style.height = "0%";

  const waveBack = document.createElement("div");
  waveBack.className = "wave waveBack";

  const waveFront = document.createElement("div");
  waveFront.className = "wave waveFront";

  const sparkles = document.createElement("div");
  sparkles.className = "liquidSparkles";

  const percent = document.createElement("div");
  percent.className = "percent";
  percent.textContent = "0%";

  liquid.appendChild(waveBack);
  liquid.appendChild(waveFront);
  liquid.appendChild(sparkles);

  bubble.appendChild(glass);
  bubble.appendChild(aurora);
  bubble.appendChild(liquid);
  bubble.appendChild(percent);

  wrap.appendChild(bubble);
  screenEl.appendChild(wrap);

  // Speech (hidden until done)
  const speech = document.createElement("div");
  speech.className = "speech";
  speech.style.opacity = "0";
  speech.style.transform = "translateY(8px)";
  speech.style.pointerEvents = "none";

  const speechBubble = document.createElement("div");
  speechBubble.className = "speechBubble";
  speechBubble.textContent =
    screen.speech || "Drop the Share a bit more to reveal what’s driving you to get a more accurate reading!";

  const dot = document.createElement("div");
  dot.className = "avatarDot";

  speech.appendChild(speechBubble);
  speech.appendChild(dot);
  screenEl.appendChild(speech);

  // CTA (hidden until done)
  const cta = document.createElement("button");
  cta.className = "cta";
  cta.type = "button";
  cta.textContent = screen.ctaText || "Continue";
  cta.style.opacity = "0";
  cta.style.transform = "translateY(10px)";
  cta.style.pointerEvents = "none";
  cta.addEventListener("click", next);
  screenEl.appendChild(cta);

  // Visuals
  buildCosmosStars(cosmosStars, STAR_COUNT);
  buildOrbitDots(orbit, ORBIT_DOT_COUNT);
  buildLiquidSparkles(sparkles);

  // Fill → then show speech + CTA
  animateFill(percent, liquid, TARGET_PERCENT, FILL_DURATION_MS, () => {
    speech.style.transition = "opacity .35s ease, transform .35s ease";
    speech.style.opacity = "1";
    speech.style.transform = "translateY(0)";
    speech.style.pointerEvents = "auto";

    cta.style.transition = "opacity .4s ease, transform .4s ease";
    cta.style.opacity = "1";
    cta.style.transform = "translateY(0)";
    cta.style.pointerEvents = "auto";
  });
}


/* =========================================================
   CONTACT SCREEN (Email + Phone) + SUBMIT TO FORMSPARK
   ========================================================= */
function renderContact(screen) {
  const title = typeof screen.title === "function" ? screen.title(state) : screen.title;

  screenEl.appendChild(h2Title(title));
  if (screen.subtitle) screenEl.appendChild(pSub(screen.subtitle));

  const wrap = document.createElement("div");
  wrap.className = "formWrap";

  // Email
  const emailField = document.createElement("div");
  emailField.className = "field";

  const emailLabel = document.createElement("div");
  emailLabel.className = "label";
  emailLabel.textContent = "Email";

  const emailInput = document.createElement("input");
  emailInput.className = "input";
  emailInput.type = "email";
  emailInput.inputMode = "email";
  emailInput.autocomplete = "email";
  emailInput.placeholder = "you@domain.com";
  emailInput.value = state.answers.email || "";

  const emailHint = document.createElement("div");
  emailHint.className = "miniHint";
  emailHint.textContent = "We’ll send your results here.";

  emailField.appendChild(emailLabel);
  emailField.appendChild(emailInput);
  emailField.appendChild(emailHint);

  // Phone
  const phoneField = document.createElement("div");
  phoneField.className = "field";

  const phoneLabel = document.createElement("div");
  phoneLabel.className = "label";
  phoneLabel.textContent = "Phone number";

  const phoneInput = document.createElement("input");
  phoneInput.className = "input";
  phoneInput.type = "tel";
  phoneInput.inputMode = "tel";
  phoneInput.autocomplete = "tel";
  phoneInput.placeholder = "+1 306 555 5555";
  phoneInput.value = state.answers.phone || "";

  const phoneHint = document.createElement("div");
  phoneHint.className = "miniHint";
  phoneHint.textContent = "Used for delivery + important updates about your blueprint.";

  phoneField.appendChild(phoneLabel);
  phoneField.appendChild(phoneInput);
  phoneField.appendChild(phoneHint);

  wrap.appendChild(emailField);
  wrap.appendChild(phoneField);
  screenEl.appendChild(wrap);

  const error = document.createElement("div");
  error.className = "formError";
  error.textContent = "";
  screenEl.appendChild(error);

  const cta = document.createElement("button");
  cta.className = "cta";
  cta.type = "button";
  cta.textContent = screen.ctaText || "Send my results";

  screenEl.appendChild(cta);

  function validateNow(showErrors = false) {
    state.answers.email = emailInput.value;
    state.answers.phone = phoneInput.value;

    const ok = screen.validate ? screen.validate(state.answers) : true;
    cta.disabled = !ok;

    if (!showErrors) {
      error.textContent = "";
      return;
    }

    if (!isValidEmail(state.answers.email)) error.textContent = "Enter a valid email address.";
    else if (!isValidPhone(state.answers.phone)) error.textContent = "Enter a valid phone number (10+ digits).";
    else error.textContent = "";
  }

  emailInput.addEventListener("input", () => validateNow(false));
  phoneInput.addEventListener("input", () => validateNow(false));
  validateNow(false);

  cta.addEventListener("click", async () => {
    validateNow(true);
    if (cta.disabled) return;

    error.textContent = "";
    cta.disabled = true;
    const originalText = cta.textContent;
    cta.textContent = "Sending...";

    try {
      await submitToFormSpark();
      cta.textContent = "Sent ✓";
      setTimeout(() => next(), 250);
    } catch (e) {
      console.error(e);
      error.textContent = "Hmm… something didn’t send. Try again.";
      cta.textContent = originalText;
      cta.disabled = false;
    }
  });
}

/* =========================================================
   RESULTS / AUDIT VIEW
   ========================================================= */
function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderResults(screen) {
  screenEl.appendChild(h2Title(screen.title));
  if (screen.subtitle) screenEl.appendChild(pSub(screen.subtitle));

  const win = getWinningArchetype();

  const card = document.createElement("div");
  card.className = "audit";

  const head = document.createElement("div");
  head.className = "auditHeader";

  const left = document.createElement("div");
  left.innerHTML = `<strong>Winning Archetype:</strong> ${win.archetype}`;

  const right = document.createElement("div");
  right.style.opacity = ".85";
  right.textContent = `Totals: ${win.sorted.map(([k, v]) => `${k} ${v}`).join(" • ")}`;

  head.appendChild(left);
  head.appendChild(right);

  const body = document.createElement("div");
  body.className = "auditBody";

  const meta = document.createElement("div");
  meta.className = "auditRow";
  meta.innerHTML = `
    <div class="auditQ">Captured inputs</div>
    <div class="auditA">
      <div><strong>Name:</strong> ${escapeHtml(state.answers.firstName || "")}</div>
      <div><strong>Gender:</strong> ${escapeHtml(state.answers.gender || "")}</div>
      <div><strong>DOB:</strong> ${escapeHtml(state.answers.dob || "")}</div>
      <div><strong>Birth Time:</strong> ${escapeHtml(state.answers.birthTime || "")}</div>
      <div><strong>Birthplace:</strong> ${escapeHtml(state.answers.birthPlace || "")}</div>
      <div><strong>Email:</strong> ${escapeHtml(state.answers.email || "")}</div>
      <div><strong>Phone:</strong> ${escapeHtml(normalizePhone(state.answers.phone || ""))}</div>
    </div>
  `;
  body.appendChild(meta);

  state.auditTrail.forEach(item => {
    const row = document.createElement("div");
    row.className = "auditRow";

    const q = document.createElement("div");
    q.className = "auditQ";
    q.textContent = item.question;

    const a = document.createElement("div");
    a.className = "auditA";
    a.textContent = `Answer: ${item.answerLabel}`;

    const s = document.createElement("div");
    s.className = "auditS";
    s.textContent = `Scoring: ${Object.entries(item.scoreDelta).map(([k, v]) => `+${v} ${k}`).join(" • ")}`;

    row.appendChild(q);
    row.appendChild(a);
    row.appendChild(s);
    body.appendChild(row);
  });

  const open1 = document.createElement("div");
  open1.className = "auditRow";
  open1.innerHTML = `
    <div class="auditQ">Open response</div>
    <div class="auditA"><strong>Q:</strong> ${escapeHtml(screens.find(x => x.id === "moneyQuestion1")?.title || "")}<br>
      <strong>A:</strong> ${escapeHtml(state.answers.moneyQuestion1 || "")}
    </div>
  `;
  body.appendChild(open1);

  const open2 = document.createElement("div");
  open2.className = "auditRow";
  open2.innerHTML = `
    <div class="auditQ">Open response</div>
    <div class="auditA"><strong>Q:</strong> ${escapeHtml(screens.find(x => x.id === "moneyQuestion2")?.title || "")}<br>
      <strong>A:</strong> ${escapeHtml(state.answers.moneyQuestion2 || "")}
    </div>
  `;
  body.appendChild(open2);

  card.appendChild(head);
  card.appendChild(body);
  screenEl.appendChild(card);

  const restart = document.createElement("button");
  restart.className = "cta";
  restart.type = "button";
  restart.textContent = "Restart";
  restart.addEventListener("click", () => {
    state.idx = 0;
    state.answers = {};
    state.score = { STABILITY: 0, EXPANSION: 0, LUXURY: 0, RESET: 0 };
    state.auditTrail = [];
    render();
  });
  screenEl.appendChild(restart);
}

/* =========================================================
   MAIN RENDER SWITCH
   ========================================================= */
function render() {
  clearScreen();
  setHeaderProgress();

  const scr = screens[state.idx];

  switch (scr.type) {
    case "choice": renderChoice(scr); break;
    case "input": renderInput(scr); break;
    case "textarea": renderTextarea(scr); break;
    case "dobWheel": renderDobWheel(scr); break;
    case "tobWheel": renderTobWheel(scr); break;
    case "interstitialCalc": renderInterstitialCalc(scr); break;
    case "interstitialBubble": renderInterstitialBubble(scr); break;
    case "contact": renderContact(scr); break;
    case "results": renderResults(scr); break;
    default: screenEl.textContent = "Unknown screen type.";
  }
}

/* =========================================================
   EVENTS + INIT
   ========================================================= */
if (backBtn) backBtn.addEventListener("click", back);
render();
