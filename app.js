/* =========================================================
   FULL SURVEY FLOW (clean rebuild)
   - screens config drives everything
   - answers stored in state.answers (by field keys + screen ids where relevant)
   - scoring stored in state.score + state.auditTrail
   ========================================================= */

/* ------- Interstitial #2 config ------- */
const TARGET_PERCENT = 78;
const FILL_DURATION_MS = 2400;
const STAR_COUNT = 40;
const SPARKLE_COUNT = 18;

/* ------- Global state ------- */
const state = {
  idx: 0,
  answers: {},        // stores values by key (e.g., firstName, dob, month/day/year, etc.)
  score: {            // archetype totals
    STABILITY: 0,
    EXPANSION: 0,
    LUXURY: 0,
    RESET: 0
  },
  auditTrail: []      // [{qid, question, answerLabel, scoreDelta:{...}}]
};

/* ------- Elements ------- */
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

  /* DOB WHEEL (not free text) */
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

  },

  /* -------- Archetype questions (examples) -------- */
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
    subtitle: "Calculating your cosmic energy and personalized blueprint...",
    speech: "Share a bit more to reveal what’s driving you to get a more accurate reading!",
    autoAdvance: false
  },

  /* -------- Open responses -------- */
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

  /* -------- Results -------- */
  {
    id: "results",
    type: "results",
    title: "Audit Mode Results",
    subtitle: "Here’s exactly how your archetype was calculated."
  }
];

/* =========================================================
   RENDERING HELPERS
   ========================================================= */
function totalSteps() {
  return screens.length;
}

function setHeaderProgress() {
  const stepText = `${state.idx + 1}/${totalSteps()}`;
  if (stepLabel) stepLabel.textContent = stepText;

  const pct = Math.round(((state.idx + 1) / totalSteps()) * 100);
  if (progressFill) progressFill.style.width = pct + "%";

  if (backBtn) backBtn.style.visibility = state.idx === 0 ? "hidden" : "visible";
}

function clearScreen() {
  if (screenEl) screenEl.innerHTML = "";
}

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

function next() {
  if (state.idx < screens.length - 1) {
    state.idx++;
    render();
  }
}

function back() {
  if (state.idx > 0) {
    state.idx--;
    render();
  }
}

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
      state.answers[f.key] = input.value; // store by key
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
  screenEl.appendChild(h2Title(screen.title));
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
   DOB WHEEL (3-column scroll + snap)
   Stores:
   - state.answers.month (Month name)
   - state.answers.day (1..31)
   - state.answers.year (yyyy)
   - state.answers.dob ("YYYY-MM-DD") for downstream
   ========================================================= */
function renderDobWheel(screen) {
  const title = typeof screen.title === "function" ? screen.title(state) : screen.title;

  screenEl.appendChild(h2Title(title));
  if (screen.subtitle) screenEl.appendChild(pSub(screen.subtitle));

  const months = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];
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
  cta.textContent = "Continue";

  function getItemHeight(scroller) {
    const item = scroller.querySelector(".dobItem");
    return item ? item.getBoundingClientRect().height : 44;
  }

  function setDobString() {
    const m = state.answers.month;
    const d = state.answers.day;
    const y = state.answers.year;
    if (!m || !d || !y) {
      state.answers.dob = "";
      return;
    }
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

    // initialize selection
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
   TOB WHEEL (Hour + Minute + AM/PM scroll + snap)
   Stores:
   - state.answers.tobHour ("1".."12")
   - state.answers.tobMinute ("00".."59")
   - state.answers.tobMeridiem ("AM"|"PM")
   - state.answers.birthTime ("HH:MM AM/PM" OR "Unknown")
   ========================================================= */
function renderTobWheel(screen) {
  const title = typeof screen.title === "function" ? screen.title(state) : screen.title;

  screenEl.appendChild(h2Title(title));
  if (screen.subtitle) screenEl.appendChild(pSub(screen.subtitle));

  const hours = Array.from({ length: 12 }, (_, i) => String(i + 1));               // 1..12
  const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));// 00..59
  const meridiems = ["AM", "PM"];

  const wrap = document.createElement("div");
  wrap.className = "dobWrap"; // reuse same layout container

  const wheelBox = document.createElement("div");
  wheelBox.className = "dobWheelBox";

  const cols = document.createElement("div");
  cols.className = "dobCols";

  const cta = document.createElement("button");
  cta.className = "cta";
  cta.textContent = "Continue";
  cta.type = "button"; // IMPORTANT

  const remember = document.createElement("button");
  remember.type = "button";
  remember.className = "tobRemember";
  remember.textContent = screen.rememberLinkText || "I don’t remember";

  function getItemHeight(scroller) {
    const item = scroller.querySelector(".dobItem");
    return item ? item.getBoundingClientRect().height : 44;
  }

  function setBirthTimeString() {
    // If user clicked "I don't remember"
    if (state.answers.birthTime === "Unknown") return;

    const h = state.answers.tobHour;
    const m = state.answers.tobMinute;
    const ap = state.answers.tobMeridiem;

    if (!h || !m || !ap) {
      state.answers.birthTime = "";
      return;
    }
    state.answers.birthTime = `${h}:${m} ${ap}`;
  }

  function setSelected(scroller, chosenEl) {
    scroller.querySelectorAll(".dobItem").forEach(el => el.classList.remove("isSelected"));
    chosenEl.classList.add("isSelected");

    const key = scroller.getAttribute("data-key");
    const val = chosenEl.getAttribute("data-value");
    state.answers[key] = val;

    // If they were previously "Unknown", switching wheel should clear that
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

  function makeWheel({ label, key, items, defaultVal }) {
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

    // initialize selection
    const existing = state.answers[key];
    const initVal = (existing && items.includes(existing)) ? existing : defaultVal;

    requestAnimationFrame(() => scrollToValue(scroller, initVal, true));

    col.appendChild(head);
    col.appendChild(scroller);
    return col;
  }

  // Defaults (feel free to change)
  const now = new Date();
  let hh = now.getHours();                 // 0..23
  const ap = hh >= 12 ? "PM" : "AM";
  hh = hh % 12; if (hh === 0) hh = 12;     // 1..12
  const mm = String(now.getMinutes()).padStart(2, "0");

  cols.appendChild(makeWheel({ label: "", key: "tobHour", items: hours, defaultVal: String(hh) }));
  cols.appendChild(makeWheel({ label: "", key: "tobMinute", items: minutes, defaultVal: mm }));
  cols.appendChild(makeWheel({ label: "", key: "tobMeridiem", items: meridiems, defaultVal: ap }));

  wheelBox.appendChild(cols);

  const lines = document.createElement("div");
  lines.className = "dobLines";
  wheelBox.appendChild(lines);

  wrap.appendChild(wheelBox);
  screenEl.appendChild(wrap);

  // "I don't remember" link (sets Unknown + enables Continue)
  remember.addEventListener("click", () => {
    state.answers.birthTime = "Unknown";
    cta.disabled = false;

    // Optional: visually de-emphasize selection (ONLY within this screen)
    wrap.querySelectorAll(".dobItem").forEach(el => el.classList.remove("isSelected"));
  });

  // Actions wrapper so link ALWAYS sits between box + button (desktop + mobile)
  const actions = document.createElement("div");
  actions.className = "tobActions";
  actions.appendChild(remember);
  actions.appendChild(cta);
  screenEl.appendChild(actions);

  // Ensure computed time is set AFTER initial wheel selection paints
  requestAnimationFrame(() => {
    setBirthTimeString();
    cta.disabled = !state.answers.birthTime;
  });

  // Continue
  cta.addEventListener("click", (e) => {
    e.preventDefault();
    if (cta.disabled) return;
    next();
  });
}

/* =========================================================
   Interstitial #1: calculating rows (compact)
   - rows complete → collapse → remove
   - AFTER all rows removed: show "cosmic details..." message (stays)
   - THEN show Continue under the orb/message
   ========================================================= */
function smoothCollapseAndRemove(el) {
  // Freeze current height so the collapse is animated, not snapped
  const h = el.getBoundingClientRect().height;

  el.style.height = h + "px";
  el.style.maxHeight = h + "px";
  el.style.overflow = "hidden";
  el.style.willChange = "height, opacity, transform";

  // Ensure transition is applied (even if class styles change later)
  el.style.transition =
    "height 320ms ease, max-height 320ms ease, opacity 220ms ease, transform 220ms ease, margin 320ms ease, padding 320ms ease, border-width 320ms ease";

  // Next frame → animate to collapsed
  requestAnimationFrame(() => {
    el.style.opacity = "0";
    el.style.transform = "translateY(-6px)";

    el.style.height = "0px";
    el.style.maxHeight = "0px";
    el.style.paddingTop = "0px";
    el.style.paddingBottom = "0px";
    el.style.marginTop = "0px";
    el.style.marginBottom = "0px";
    el.style.borderWidth = "0px";
  });

  // Remove after transition completes
  const onEnd = (e) => {
    // Only act on height end (avoids multiple fires)
    if (e.propertyName !== "height") return;
    el.removeEventListener("transitionend", onEnd);
    el.remove();
  };
  el.addEventListener("transitionend", onEnd);
}

function renderInterstitialCalc(screen) {
  screenEl.appendChild(h2Title(screen.title));
  if (screen.subtitle) screenEl.appendChild(pSub(screen.subtitle));

  const wrap = document.createElement("div");
  wrap.className = "calcWrap calcWrap--compact";

  const orb = document.createElement("div");
  orb.className = "calcOrb";

  const rings = document.createElement("div");
  rings.className = "radarRings";
  orb.appendChild(rings);

  const list = document.createElement("div");
  list.className = "calcList";

  // ✅ message that stays on screen (hidden until done)
  const doneMsg = document.createElement("div");
  doneMsg.className = "calcDoneMsg";
  doneMsg.textContent = "Your cosmic details have been collected. Let’s personalize your report.";
  doneMsg.style.display = "none";

  // ✅ CTA hidden until after message appears
  const cta = document.createElement("button");
  cta.className = "cta calcCta";
  cta.type = "button";
  cta.textContent = "Continue";
  cta.style.display = "none";
  cta.addEventListener("click", next);

  // build rows
  const rowEls = (screen.rows || []).map((r) => {
    const row = document.createElement("div");
    row.className = "calcRow";

    const left = document.createElement("div");
    left.className = "calcLeft";

    const badge = document.createElement("div");
    badge.className = "calcBadge";
    badge.textContent = r.icon || "✨";

    const txt = document.createElement("div");
    txt.className = "calcText";
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
  wrap.appendChild(doneMsg);
  wrap.appendChild(cta);
  screenEl.appendChild(wrap);

  // constellation
  const icons = (screen.rows || []).map(r => r.icon).filter(Boolean);
  const stopConstellation = initOrbConstellation(orb, icons.length ? icons : ["✨"]);

  // timings (tweak if needed)
  const REVEAL_STAGGER = 220;
  const COMPLETE_STAGGER = 420;
  const COMPLETE_DELAY = 700;
  const COLLAPSE_AFTER = 260;
  const REMOVE_AFTER = 360;

  // show rows
  rowEls.forEach((obj, i) => {
    setTimeout(() => obj.row.classList.add("show"), i * REVEAL_STAGGER);
  });

  // complete → collapse → remove
  rowEls.forEach((obj, i) => {
    setTimeout(() => {
      obj.status.textContent = "Complete";
      obj.check.classList.add("done");
      obj.row.classList.add("isComplete");

      setTimeout(() => {
      smoothCollapseAndRemove(obj.row);

// check for “all gone” after the collapse finishes (not immediately)
setTimeout(() => {
  if (!list.querySelector(".calcRow")) {
    try { stopConstellation && stopConstellation(); } catch(e) {}

    doneMsg.style.display = "block";
    doneMsg.classList.add("calcDoneMsg--reveal");

    setTimeout(() => {
      cta.style.display = "block";
      cta.classList.add("calcCta--reveal");
    }, 260);
  }
}, 360); // slightly > collapse duration

      }, COLLAPSE_AFTER);
    }, COMPLETE_DELAY + i * COMPLETE_STAGGER);
  });
}


function initOrbConstellation(orbEl, icons = ["✨"]) {
  const canvas = document.createElement("canvas");
  canvas.className = "orbCanvas";
  const ctx = canvas.getContext("2d");
  orbEl.appendChild(canvas);

  const nodesWrap = document.createElement("div");
  nodesWrap.className = "orbNodes";
  orbEl.appendChild(nodesWrap);

  let rafId = null;
  let stopped = false;

  // tweak these for vibe
  const COUNT = Math.max(6, Math.min(12, icons.length || 8));
  const REVEAL_WINDOW_MS = 1600;   // all nodes revealed by this time
  const MIN_DELAY_MS = 120;        // smallest delay before first node appears

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

    // ✅ random reveal times, but also ensure they’re one-at-a-time-ish
    // Generate random delays, sort them, so they still feel “sequential” but unpredictable
    const delays = Array.from({ length: COUNT }, () => rand(MIN_DELAY_MS, REVEAL_WINDOW_MS));
    

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

      nodes.push({
        el,
        x,
        y,
        alpha: 0,
        revealAt: delays[i],        // ✅ randomized but ordered
        jitter: rand(0, 9999)       // optional future wobble
      });
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

    // reveal nodes gradually
    for (const n of nodes) {
      const age = t - n.revealAt;
      if (age <= 0) {
        n.alpha = 0;
        n.el.style.setProperty("--a", "0");
        continue;
      }

      const a = Math.min(1, age / 420);
      n.alpha = a;

      // little pop when it appears
      const pop = 1 + Math.max(0, 1 - age / 520) * 0.28;
      n.el.style.setProperty("--a", a.toFixed(3));
      n.el.style.setProperty("--s", pop.toFixed(3));
    }

    // connect only revealed nodes
    const maxDist = Math.min(w, h) * 0.42;
    ctx.lineWidth = 1;

    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      if (a.alpha <= 0.05) continue;

      // two nearest visible neighbors
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
        ctx.shadowBlur = 0;
        ctx.shadowColor = `rgba(0,0,0,${0.25 * strength})`;
        ctx.stroke();
        ctx.shadowBlur = 0;
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
    start = null; // restart timings after resize
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



/* =========================================================
   Interstitial #2: bubble fill
   ========================================================= */
function buildStars(starsWrap) {
  starsWrap.innerHTML = "";
  for (let i = 0; i < STAR_COUNT; i++) {
    const s = document.createElement("span");
    const x = Math.random() * 100;
    const y = Math.random() * 100;
    const op = 0.30 + Math.random() * 0.60;
    const tw = 1200 + Math.random() * 2400;
    const dr = 3800 + Math.random() * 5200;
    s.style.left = x + "%";
    s.style.top  = y + "%";
    s.style.setProperty("--op", op.toFixed(2));
    s.style.setProperty("--tw", tw.toFixed(0) + "ms");
    s.style.setProperty("--dr", dr.toFixed(0) + "ms");
    const size = (Math.random() < 0.22) ? 3 : 2;
    s.style.width = size + "px";
    s.style.height = size + "px";
    starsWrap.appendChild(s);
  }
}

function buildLiquidSparkles(liquidSparklesEl) {
  liquidSparklesEl.innerHTML = "";
  for (let i = 0; i < SPARKLE_COUNT; i++) {
    const sp = document.createElement("span");
    const x = Math.random() * 100;
    const delay = Math.random() * 2400;
    const rise = 2200 + Math.random() * 2200;
    const tw = 900 + Math.random() * 1600;
    const op = 0.15 + Math.random() * 0.70;
    const y = 70 + Math.random() * 40;

    sp.style.left = x + "%";
    sp.style.top  = y + "%";
    sp.style.animationDelay = `${delay}ms, ${delay}ms`;
    sp.style.setProperty("--rise", `${rise}ms`);
    sp.style.setProperty("--tw", `${tw}ms`);
    sp.style.setProperty("--op", op.toFixed(2));

    const size = (Math.random() < 0.35) ? 2 : 3;
    sp.style.width = size + "px";
    sp.style.height = size + "px";

    liquidSparklesEl.appendChild(sp);
  }
}

function animateFill(percentText, liquid, toPercent, durationMs) {
  const start = performance.now();
  const from = 0;

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function tick(now) {
    const elapsed = now - start;
    const t = Math.min(1, elapsed / durationMs);
    const eased = easeOutCubic(t);

    const current = Math.round(from + (toPercent - from) * eased);

    percentText.textContent = current + "%";
    liquid.style.height = current + "%";

    if (t < 1) requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

function renderInterstitialBubble(screen) {
  screenEl.appendChild(h2Title(screen.title));
  if (screen.subtitle) screenEl.appendChild(pSub(screen.subtitle));

  const bubbleWrap = document.createElement("div");
  bubbleWrap.className = "bubbleWrap";

  const stars = document.createElement("div");
  stars.className = "stars";

  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.setAttribute("aria-label", "Forecast accuracy bubble");

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

  const sparkWrap = document.createElement("div");
  sparkWrap.className = "liquidSparkles";

  const percent = document.createElement("div");
  percent.className = "percent";
  percent.textContent = "0%";

  liquid.appendChild(waveBack);
  liquid.appendChild(waveFront);
  liquid.appendChild(sparkWrap);

  bubble.appendChild(glass);
  bubble.appendChild(aurora);
  bubble.appendChild(liquid);
  bubble.appendChild(percent);

  bubbleWrap.appendChild(stars);
  bubbleWrap.appendChild(bubble);

  screenEl.appendChild(bubbleWrap);

  const speech = document.createElement("div");
  speech.className = "speech";
  const speechBubble = document.createElement("div");
  speechBubble.className = "speechBubble";
  speechBubble.textContent = screen.speech || "One more step...";
  const dot = document.createElement("div");
  dot.className = "avatarDot";
  speech.appendChild(speechBubble);
  speech.appendChild(dot);
  screenEl.appendChild(speech);

  const cta = document.createElement("button");
  cta.className = "cta";
  cta.textContent = "Continue";
  cta.addEventListener("click", next);
  screenEl.appendChild(cta);

  buildStars(stars);
  buildLiquidSparkles(sparkWrap);
  animateFill(percent, liquid, TARGET_PERCENT, FILL_DURATION_MS);
}

/* =========================================================
   RESULTS / AUDIT VIEW
   ========================================================= */
function getWinningArchetype() {
  const entries = Object.entries(state.score);
  entries.sort((a,b) => b[1]-a[1]);
  return { archetype: entries[0][0], score: entries[0][1], sorted: entries };
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}
function formatArchetypeLabel(a) {
  const map = {
    STABILITY: "Stability",
    EXPANSION: "Expansion",
    LUXURY: "Luxury",
    RESET: "Reset"
  };
  return map[a] || a;
}
function formatArchetypeLabel(a) {
  const map = {
    STABILITY: "Stability",
    EXPANSION: "Expansion",
    LUXURY: "Luxury",
    RESET: "Reset"
  };
  return map[a] || a;
}

function renderResults(screen) {
  const name = (state.answers.firstName || "").trim();
  const safeName = escapeHtml(name || "Love");

  const win = getWinningArchetype();
  const archetypeLabel = formatArchetypeLabel(win.archetype);

  // Title line
  screenEl.appendChild(
    h2Title(`${safeName}, your primary money archetype is ${archetypeLabel}.`)
  );

  // Body card
  const card = document.createElement("div");
  card.className = "resultsCard";

  const p1 = document.createElement("p");
  p1.className = "resultsP";
  p1.textContent =
    "Want to know what that means? We are processing your personalized blueprint as we speak. Our team is reviewing all of your data and will send you the personalized report within 24–48 hours.";

  const divider = document.createElement("div");
  divider.className = "resultsDivider";

  const ns = document.createElement("div");
  ns.className = "nextSteps";

  const nsTitle = document.createElement("div");
  nsTitle.className = "nextStepsTitle";
  nsTitle.textContent = "BONUS GIFT";

  const nsText = document.createElement("div");
  nsText.className = "nextStepsText";
  nsText.textContent = "We want to give you something special while you wait! Check your email for a free Wealth Portal Activation. This is pure audio money magic!";

  ns.appendChild(nsTitle);
  ns.appendChild(nsText);

  card.appendChild(p1);
  card.appendChild(divider);
  card.appendChild(ns);

  screenEl.appendChild(card);
}

/* =========================================================
   MAIN RENDER SWITCH
   ========================================================= */
function render() {
  clearScreen();
  setHeaderProgress();

  const scr = screens[state.idx];

  switch (scr.type) {
    case "choice":
      renderChoice(scr);
      break;
    case "input":
      renderInput(scr);
      break;
    case "textarea":
      renderTextarea(scr);
      break;
    case "dobWheel":
      renderDobWheel(scr);
      break;
    case "interstitialCalc":
      renderInterstitialCalc(scr);
      break;
    case "tobWheel":
  renderTobWheel(scr);
  break;
    case "interstitialBubble":
      renderInterstitialBubble(scr);
      break;
    case "results":
      renderResults(scr);
      break;
    default:
      screenEl.textContent = "Unknown screen type.";
  }
}

/* =========================================================
   EVENTS + INIT
   ========================================================= */
if (backBtn) backBtn.addEventListener("click", back);
render();
