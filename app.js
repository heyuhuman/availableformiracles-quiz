/* =========================================================
   FULL SURVEY FLOW (integrated)
   - screens config drives everything
   - answers stored in state.answers
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
  answers: {},        // { screenId: value }
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
   Replace questions/options with your final list.
   --------------------------------------------------------- */
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
    type: "input",
    title: (s) => `Nice to meet you, ${s.answers.firstName || "love"}. When were you born?`,
    subtitle: "Day / month / year is perfect.",
    fields: [{ key: "dob", label: "Date of birth", placeholder: "YYYY-MM-DD" }],
    validate: (vals) => !!vals.dob?.trim()
  },
  {
    id: "birthTime",
    type: "input",
    title: "Do you know your birth time?",
    subtitle: "If you don’t remember, type “Unknown”.",
    fields: [{ key: "birthTime", label: "Time of birth", placeholder: "e.g., 2:00 AM (or Unknown)" }],
    validate: (vals) => !!vals.birthTime?.trim()
  },
  {
    id: "birthPlace",
    type: "input",
    title: "Where were you born?",
    subtitle: "City and province/state (ex: Saskatoon, SK).",
    fields: [{ key: "birthPlace", label: "Birthplace", placeholder: "City, Province/State" }],
    validate: (vals) => !!vals.birthPlace?.trim()
  },

  /* -------- Interstitial #1 -------- */
  {
    id: "interstitial1",
    type: "interstitialCalc",
    title: "Aligning...",
    subtitle: "One moment while we connect the dots.",
    rows: [
      { icon: "✨", text: "Reading your stability vs. expansion baseline" },
      { icon: "🧠", text: "Detecting your safety signals around money" },
      { icon: "🧬", text: "Mapping your energetic coding markers" },
      { icon: "🧿", text: "Identifying the money story running in the background" },
      { icon: "🔮", text: "Calibrating your next best shift" }
    ],
    autoAdvanceMs: 3600
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

  /* -------- Interstitial #2 (your bubble) -------- */
  {
    id: "interstitial2",
    type: "interstitialBubble",
    title: "Forecast accuracy",
    subtitle: "Calculating your cosmic energy and personalized blueprint...",
    speech: "Share a bit more to reveal what’s driving you to get a more accurate reading!",
    autoAdvance: false, // continue button controls next
    progressOverride: "34%", // matches your screenshot (optional)
    stepOverride: "6/14"      // optional
  },

  /* -------- Your Q9 text input (required, allow NA) -------- */
  {
    id: "moneyQuestion1",
    type: "textarea",
    title: "What’s the biggest question about money you want this blueprint to reveal?",
    subtitle: "Type NA if you don’t have one right now.",
    placeholder: "Type here...",
    validate: (vals) => !!vals.moneyQuestion1?.trim()
  },
  {
    id: "moneyQuestion2",
    type: "textarea",
    title: "If this blueprint answered one money question for you… what would you want it to be?",
    subtitle: "Type NA if you don’t have one right now.",
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
   RENDERING
   ========================================================= */

function totalSteps() {
  return screens.length;
}

function setHeaderProgress() {
  const stepText = `${state.idx + 1}/${totalSteps()}`;
  stepLabel.textContent = stepText;

  // default progress = % through screens
  const pct = Math.round(((state.idx + 1) / totalSteps()) * 100);
  progressFill.style.width = pct + "%";

  // allow overrides on special screens
  const scr = screens[state.idx];
  if (scr?.progressOverride) progressFill.style.width = scr.progressOverride;
  if (scr?.stepOverride) stepLabel.textContent = scr.stepOverride;

  backBtn.style.visibility = state.idx === 0 ? "hidden" : "visible";
}

function clearScreen() {
  screenEl.innerHTML = "";
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

  // add to totals
  Object.entries(option.score).forEach(([k, v]) => {
    state.score[k] = (state.score[k] || 0) + v;
  });

  // add audit trail
  state.auditTrail.push({
    qid: screen.id,
    question: typeof screen.title === "function" ? screen.title(state) : screen.title,
    answerLabel: option.label,
    scoreDelta: option.score
  });
}

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

      // scoring (if present)
      applyScore(screen, opt);

      if (screen.nextOnSelect) next();
      else render(); // re-render if needed
    });

    list.appendChild(btn);
  });

  screenEl.appendChild(list);

  // If not auto-next, show Continue
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

  const values = {};
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
      values[f.key] = input.value;
      // live store
      state.answers[f.key] = input.value;
      cta.disabled = screen.validate ? !screen.validate(state.answers) : false;
    });

    // init values
    values[f.key] = input.value;

    field.appendChild(label);
    field.appendChild(input);
    wrap.appendChild(field);
  });

  screenEl.appendChild(wrap);

  const cta = document.createElement("button");
  cta.className = "cta";
  cta.textContent = "Continue";
  cta.disabled = screen.validate ? !screen.validate(state.answers) : false;

  cta.addEventListener("click", () => {
    // store screen-level id too if desired
    state.answers[screen.id] = true;
    next();
  });

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
   Interstitial #1: animated calculating rows
   ========================================================= */
function renderInterstitialCalc(screen) {
  screenEl.appendChild(h2Title(screen.title));
  if (screen.subtitle) screenEl.appendChild(pSub(screen.subtitle));

  const wrap = document.createElement("div");
  wrap.className = "calcWrap";

  const orb = document.createElement("div");
  orb.className = "calcOrb";

  const list = document.createElement("div");
  list.className = "calcList";

  const rowEls = screen.rows.map((r) => {
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
  screenEl.appendChild(wrap);

  // animate reveal + completion
  rowEls.forEach((obj, i) => {
    setTimeout(() => {
      obj.row.classList.add("show");
      obj.status.textContent = "Calculating";
    }, i * 380);
  });

  rowEls.forEach((obj, i) => {
    setTimeout(() => {
      obj.status.textContent = "Complete";
      obj.check.classList.add("done");
    }, 900 + i * 520);
  });

  const auto = screen.autoAdvanceMs || 3200;
  setTimeout(() => {
    next();
  }, auto);

  // no CTA on this one
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

  // speech
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

  // CTA
  const cta = document.createElement("button");
  cta.className = "cta";
  cta.textContent = "Continue";
  cta.addEventListener("click", next);
  screenEl.appendChild(cta);

  // start animations
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
  right.textContent = `Totals: ${win.sorted.map(([k,v])=>`${k} ${v}`).join(" • ")}`;
  head.appendChild(left);
  head.appendChild(right);

  const body = document.createElement("div");
  body.className = "auditBody";

  // show stored non-scoring answers too
  const meta = document.createElement("div");
  meta.className = "auditRow";
  meta.innerHTML = `
    <div class="auditQ">Captured inputs</div>
    <div class="auditA">
      <div><strong>Name:</strong> ${state.answers.firstName || ""}</div>
      <div><strong>Gender:</strong> ${state.answers.gender || ""}</div>
      <div><strong>DOB:</strong> ${state.answers.dob || ""}</div>
      <div><strong>Birth Time:</strong> ${state.answers.birthTime || ""}</div>
      <div><strong>Birthplace:</strong> ${state.answers.birthPlace || ""}</div>
    </div>
  `;
  body.appendChild(meta);

  // scoring trail
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
    s.textContent = `Scoring: ${Object.entries(item.scoreDelta).map(([k,v]) => `+${v} ${k}`).join(" • ")}`;

    row.appendChild(q);
    row.appendChild(a);
    row.appendChild(s);
    body.appendChild(row);
  });

  // text questions
  const open1 = document.createElement("div");
  open1.className = "auditRow";
  open1.innerHTML = `
    <div class="auditQ">Open response</div>
    <div class="auditA"><strong>Q:</strong> ${screens.find(x=>x.id==="moneyQuestion1")?.title || ""}<br>
      <strong>A:</strong> ${escapeHtml(state.answers.moneyQuestion1 || "")}
    </div>
  `;
  body.appendChild(open1);

  const open2 = document.createElement("div");
  open2.className = "auditRow";
  open2.innerHTML = `
    <div class="auditQ">Open response</div>
    <div class="auditA"><strong>Q:</strong> ${screens.find(x=>x.id==="moneyQuestion2")?.title || ""}<br>
      <strong>A:</strong> ${escapeHtml(state.answers.moneyQuestion2 || "")}
    </div>
  `;
  body.appendChild(open2);

  card.appendChild(head);
  card.appendChild(body);
  screenEl.appendChild(card);

  const restart = document.createElement("button");
  restart.className = "cta";
  restart.textContent = "Restart";
  restart.addEventListener("click", () => {
    state.idx = 0;
    state.answers = {};
    state.score = { STABILITY:0, EXPANSION:0, LUXURY:0, RESET:0 };
    state.auditTrail = [];
    render();
  });
  screenEl.appendChild(restart);
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
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
    case "interstitialCalc":
      renderInterstitialCalc(scr);
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
   EVENTS
   ========================================================= */
backBtn.addEventListener("click", back);

/* init */
render();
