(() => {
  // Prevent double-init (e.g., hot reload, multiple script loads)
  if (window.__MONEY_QUIZ_INIT__) return;
  window.__MONEY_QUIZ_INIT__ = true;

  // =========================================
  // Config
  // =========================================
  const FORMSPARK_URL = "https://submit-form.com/2kIN1hL95";
  const TY_BASE = "https://www.availableformiracles.com/ty/";

  // =========================================
  // State
  // =========================================
  const state = {
    stepIndex: 0,

    gender: "",
    dob: { month: "", day: "", year: "" },

    birthTimeKnown: true,
    birthTime: { hour: "", minute: "", ampm: "" },

    birthPlace: { city: "", region: "", country: "", lat: null, lng: null },

    answers: {
      q1_defaultWhenUncertain: "",
      q2_moneyStressTrigger: "",
      qExtra_incomeSource: "",
    },

    scores: { stability: 0, freedom: 0, worth: 0, avoidance: 0 },

    fullName: "",
    email: "",
    phone: "",
  };

  // =========================================
  // DOM
  // =========================================
  const $root = document.getElementById("screenRoot");
  const $back = document.getElementById("backBtn");
  const $continue = document.getElementById("continueBtn");
  const $progressFill = document.getElementById("progressFill");
  const $stepCount = document.getElementById("stepCount");

  // =========================================
  // Steps
  // =========================================
  const steps = [
    renderGender, // 0
    renderDOBWheels, // 1
    renderBirthTime, // 2
    renderBirthPlace, // 3
    renderMapping, // 4 (auto-advance)
    renderSnapshotTeaser, // 5
    renderQuizQ1, // 6
    renderQuizQ2, // 7
    renderOptIn, // 8
    renderExtraData, // 9
    renderSubmitting, // 10 (submits & redirects)
  ];

  const TOTAL = steps.length;

  // =========================================
  // Events
  // =========================================
  $continue.addEventListener("click", () => next());
  $back.addEventListener("click", () => back());

  // =========================================
  // Navigation
  // =========================================
  function goTo(i) {
    state.stepIndex = Math.max(0, Math.min(i, TOTAL - 1));
    steps[state.stepIndex]();
  }

  function next() {
    if (state.stepIndex === 4 || state.stepIndex === 10) return;

    if (!isStepValid(state.stepIndex)) {
      pulseContinue();
      return;
    }

    goTo(state.stepIndex + 1);
  }

  function back() {
    if (state.stepIndex <= 0) return;
    goTo(state.stepIndex - 1);
  }

  function pulseContinue() {
    const old = $continue.textContent;
    $continue.textContent = "Complete this step to continue";
    setTimeout(() => {
      $continue.textContent = old;
      validateContinue();
    }, 850);
  }

  // =========================================
  // UI helpers
  // =========================================
  function setHeaderUI() {
    $stepCount.textContent = `${Math.min(state.stepIndex + 1, TOTAL)}/${TOTAL}`;
    const pct = Math.round((state.stepIndex / (TOTAL - 1)) * 100);
    $progressFill.style.width = `${pct}%`;
    $back.disabled = state.stepIndex === 0 || state.stepIndex === TOTAL - 1;
  }

  function mount(html) {
    $root.classList.remove("fade-in");
    $root.innerHTML = html;
    requestAnimationFrame(() => $root.classList.add("fade-in"));
    setHeaderUI();
    validateContinue();
  }

  function validateContinue() {
    if (state.stepIndex === 4 || state.stepIndex === 10) {
      $continue.disabled = true;
      $continue.style.opacity = 0.35;
      return;
    }

    $continue.style.opacity = 1;
    $continue.disabled = !isStepValid(state.stepIndex);
  }

  // =========================================
  // Validation
  // =========================================
  function isStepValid(idx) {
    switch (idx) {
      case 0:
        return !!state.gender;

      case 1:
        return !!state.dob.month && !!state.dob.day && !!state.dob.year;

      case 2:
        if (!state.birthTimeKnown) return true;
        return (
          !!state.birthTime.hour && !!state.birthTime.minute && !!state.birthTime.ampm
        );

      case 3:
        return (
          !!state.birthPlace.city &&
          !!state.birthPlace.region &&
          !!state.birthPlace.country
        );

      case 6:
        return !!state.answers.q1_defaultWhenUncertain;

      case 7:
        return !!state.answers.q2_moneyStressTrigger;

      case 8:
        return (
          !!state.fullName &&
          isEmail(state.email) &&
          isPhone(state.phone)
        );

      case 9:
        return !!state.answers.qExtra_incomeSource;

      default:
        return true;
    }
  }

  function isEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || "").trim());
  }

  function isPhone(v) {
    const digits = String(v || "").replace(/\D/g, "");
    return digits.length >= 10;
  }

  // =========================================
  // Utils
  // =========================================
  function escapeHtml(str) {
    return String(str || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function escapeAttr(str) {
    return escapeHtml(str).replaceAll("\n", " ");
  }

  function choiceCard(value, ico, label) {
    const selected = state.gender === value ? "selected" : "";
    return `
      <div class="choice ${selected}" data-value="${escapeAttr(value)}">
        <div class="ico">${escapeHtml(ico)}</div>
        <div class="big">${escapeHtml(label)}</div>
      </div>
    `;
  }

  function choiceText(value, text) {
    return `
      <div class="choice" data-value="${escapeAttr(value)}">
        <div class="txt">${escapeHtml(text)}</div>
      </div>
    `;
  }

  function buildDays() {
    return Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, "0"));
  }

  function buildYears(min, max) {
    const years = [];
    for (let y = max; y >= min; y--) years.push(String(y));
    return years;
  }

  function formatPlace() {
    const p = state.birthPlace;
    const parts = [p.city, p.region, p.country].filter(Boolean);
    return parts.join(", ");
  }

  function parsePlace(input) {
    const raw = String(input || "").trim();
    const parts = raw.split(",").map((s) => s.trim()).filter(Boolean);
    return {
      city: parts[0] || "",
      region: parts[1] || "",
      country: parts[2] || "",
    };
  }

  function bumpScore(key) {
    if (!(key in state.scores)) return;
    state.scores[key] += 1;
  }

  function getTopPattern() {
    let best = "stability";
    let bestVal = -Infinity;

    Object.entries(state.scores).forEach(([k, v]) => {
      if (v > bestVal) {
        best = k;
        bestVal = v;
      }
    });

    return best;
  }

  // =========================================
  // Geolocation (city/state/country)
  // =========================================
  async function reverseGeocode(lat, lng) {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(
      lat
    )}&lon=${encodeURIComponent(lng)}`;

    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) return null;

    const data = await res.json();
    const a = data.address || {};

    const city =
      a.city || a.town || a.village || a.hamlet || a.municipality || "";
    const region = a.state || a.province || a.region || a.county || "";
    const country = a.country || "";

    if (!city || !region || !country) return null;
    return { city, region, country };
  }

  // =========================================
  // Screens
  // =========================================
  function renderGender() {
    mount(`
      <div class="inner">
        <div class="kicker">The Unspoken Money Rule</div>
        <div class="h1">Select your gender to start</div>
        <div class="sub">This helps us tailor language and examples in your report.</div>

        <div class="choice-grid" id="genderChoices">
          ${choiceCard("female", "♀", "Female")}
          ${choiceCard("male", "♂", "Male")}
          ${choiceCard("nonbinary", "⚧", "Non-binary")}
        </div>

        <div class="note">You can change this later.</div>
      </div>
    `);

    const grid = document.getElementById("genderChoices");
    grid.querySelectorAll(".choice").forEach((el) => {
      el.addEventListener("click", () => {
        grid.querySelectorAll(".choice").forEach((x) => x.classList.remove("selected"));
        el.classList.add("selected");
        state.gender = el.getAttribute("data-value") || "";
        validateContinue();
      });
    });

    validateContinue();
  }

  function renderDOBWheels() {
    const years = buildYears(1930, new Date().getFullYear());
    const months = [
      ["01", "January"],
      ["02", "February"],
      ["03", "March"],
      ["04", "April"],
      ["05", "May"],
      ["06", "June"],
      ["07", "July"],
      ["08", "August"],
      ["09", "September"],
      ["10", "October"],
      ["11", "November"],
      ["12", "December"],
    ];

    mount(`
      <div class="inner">
        <div class="h1">When’s your birthday?</div>
        <div class="sub">We’ll use this to personalize your report.</div>

        <div class="wheels">
          <div class="wheel">
            <label>Month</label>
            <select id="dobMonth">
              <option value="" hidden>Select</option>
              ${months
                .map(
                  ([v, l]) =>
                    `<option value="${v}" ${state.dob.month === v ? "selected" : ""}>${l}</option>`
                )
                .join("")}
            </select>
          </div>

          <div class="wheel">
            <label>Day</label>
            <select id="dobDay">
              <option value="" hidden>Select</option>
              ${buildDays()
                .map(
                  (d) =>
                    `<option value="${d}" ${state.dob.day === d ? "selected" : ""}>${parseInt(
                      d,
                      10
                    )}</option>`
                )
                .join("")}
            </select>
          </div>

          <div class="wheel">
            <label>Year</label>
            <select id="dobYear">
              <option value="" hidden>Select</option>
              ${years
                .map(
                  (y) =>
                    `<option value="${y}" ${state.dob.year === y ? "selected" : ""}>${y}</option>`
                )
                .join("")}
            </select>
          </div>
        </div>

        <div class="note">Tip: you can scroll each wheel.</div>
      </div>
    `);

    const m = document.getElementById("dobMonth");
    const d = document.getElementById("dobDay");
    const y = document.getElementById("dobYear");

    const sync = () => {
      state.dob.month = m.value;
      state.dob.day = d.value;
      state.dob.year = y.value;
      validateContinue();
    };

    m.addEventListener("change", sync);
    d.addEventListener("change", sync);
    y.addEventListener("change", sync);

    validateContinue();
  }

  function renderBirthTime() {
    const hours = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
    const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));
    const ampm = ["AM", "PM"];

    mount(`
      <div class="inner">
        <div class="h1">Do you know your birth time?</div>
        <div class="sub">If you don’t, that’s okay — we can still generate a strong result.</div>

        <div class="wheels" id="timeWheels" style="${
          state.birthTimeKnown ? "" : "opacity:.45; pointer-events:none;"
        }">
          <div class="wheel">
            <label>Hour</label>
            <select id="btHour">
              <option value="" hidden>Select</option>
              ${hours
                .map(
                  (v) =>
                    `<option value="${v}" ${state.birthTime.hour === v ? "selected" : ""}>${v}</option>`
                )
                .join("")}
            </select>
          </div>

          <div class="wheel">
            <label>Minute</label>
            <select id="btMin">
              <option value="" hidden>Select</option>
              ${minutes
                .map(
                  (v) =>
                    `<option value="${v}" ${state.birthTime.minute === v ? "selected" : ""}>${v}</option>`
                )
                .join("")}
            </select>
          </div>

          <div class="wheel">
            <label>AM/PM</label>
            <select id="btAmPm">
              <option value="" hidden>Select</option>
              ${ampm
                .map(
                  (v) =>
                    `<option value="${v}" ${state.birthTime.ampm === v ? "selected" : ""}>${v}</option>`
                )
                .join("")}
            </select>
          </div>
        </div>

        <div class="small-link" id="dontRemember">
          ${state.birthTimeKnown ? "I don’t remember" : "Actually, I do know it"}
        </div>
      </div>
    `);

    const $dont = document.getElementById("dontRemember");
    const $h = document.getElementById("btHour");
    const $min = document.getElementById("btMin");
    const $ap = document.getElementById("btAmPm");

    const sync = () => {
      state.birthTime.hour = $h.value;
      state.birthTime.minute = $min.value;
      state.birthTime.ampm = $ap.value;
      validateContinue();
    };

    $h.addEventListener("change", sync);
    $min.addEventListener("change", sync);
    $ap.addEventListener("change", sync);

    $dont.addEventListener("click", () => {
      state.birthTimeKnown = !state.birthTimeKnown;

      if (!state.birthTimeKnown) {
        state.birthTime = { hour: "", minute: "", ampm: "" };
      }

      renderBirthTime();
    });

    validateContinue();
  }

  function renderBirthPlace() {
    mount(`
      <div class="inner">
        <div class="h1">Where were you born?</div>
        <div class="sub">We’ll try to detect your location — you can edit it.</div>

        <div class="field">
          <input
            id="placeInput"
            type="text"
            placeholder="City, State/Province, Country"
            value="${escapeAttr(formatPlace())}"
          />
        </div>

        <div class="note" id="placeNote">Detecting your location…</div>
      </div>
    `);

    const $input = document.getElementById("placeInput");
    const $note = document.getElementById("placeNote");

    $input.addEventListener("input", () => {
      const parsed = parsePlace($input.value);
      state.birthPlace.city = parsed.city;
      state.birthPlace.region = parsed.region;
      state.birthPlace.country = parsed.country;
      validateContinue();
    });

    if (state.birthPlace.city && state.birthPlace.region && state.birthPlace.country) {
      $note.textContent = "You can edit this if needed.";
      validateContinue();
      return;
    }

    if (!navigator.geolocation) {
      $note.textContent = "Location detection not supported — please type your birthplace.";
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        state.birthPlace.lat = lat;
        state.birthPlace.lng = lng;

        try {
          const place = await reverseGeocode(lat, lng);

          if (place) {
            state.birthPlace.city = place.city;
            state.birthPlace.region = place.region;
            state.birthPlace.country = place.country;

            $input.value = formatPlace();
            $note.textContent = "Detected — you can edit this if needed.";
          } else {
            $note.textContent =
              "We detected your coordinates but couldn’t resolve city/state — please type it in.";
            $input.value = "";
          }
        } catch {
          $note.textContent = "Couldn’t resolve city/state automatically — please type it in.";
        }

        validateContinue();
      },
      () => {
        $note.textContent = "Couldn’t access location — please type your birthplace.";
      },
      { enableHighAccuracy: false, timeout: 7000, maximumAge: 600000 }
    );

    validateContinue();
  }

  function renderMapping() {
    mount(`
      <div class="inner mapping">
        <div class="h1">Mapping your money pattern…</div>
        <div class="sub">We’re cross-referencing your inputs with our pattern framework.</div>

        <div class="orb" aria-hidden="true"></div>

        <div class="checklist">
          <div class="check reveal"><div class="dot"></div><div>Reading baseline drivers</div></div>
          <div class="check reveal"><div class="dot"></div><div>Identifying hidden pressure</div></div>
          <div class="check reveal"><div class="dot"></div><div>Locating your default safety strategy</div></div>
          <div class="check reveal"><div class="dot"></div><div>Calibrating your next best shift</div></div>
        </div>

        <div class="note">This takes a few seconds.</div>
      </div>
    `);

    const items = Array.from(document.querySelectorAll(".check.reveal"));

    items.forEach((el, i) => {
      setTimeout(() => el.classList.add("show"), 550 + i * 800);
      setTimeout(() => el.classList.add("done"), 950 + i * 800);
    });

    setTimeout(() => goTo(5), 5200);
  }

  function renderSnapshotTeaser() {
    const teaser = {
      notice:
        "You’re wired for safety first — not because you’re “bad with money”… but because your system hates uncertainty.",
      pressure: "When it isn’t predictable, your nervous system reads it as unsafe.",
      shift: "Make one money decision this week without over-explaining it.",
    };

    mount(`
      <div class="inner">
        <div class="kicker">Quick Snapshot</div>
        <div class="h1">Your patterns are showing…</div>
        <div class="sub">This is a preview — keep going and we’ll confirm what’s strongest for you.</div>

        <div class="cards3">
          <div class="card">
            <div class="label">What we’re noticing</div>
            <div class="value">${escapeHtml(teaser.notice)}</div>
          </div>
          <div class="card">
            <div class="label">Your hidden pressure</div>
            <div class="value">${escapeHtml(teaser.pressure)}</div>
          </div>
          <div class="card">
            <div class="label">Your next micro-shift</div>
            <div class="value">${escapeHtml(teaser.shift)}</div>
          </div>
        </div>

        <div class="note" style="margin-top:14px;">
          Continue to go deeper — the next questions confirm your strongest pattern.
        </div>
      </div>
    `);

    validateContinue();
  }

  function renderQuizQ1() {
    mount(`
      <div class="inner">
        <div class="h1">When money feels uncertain, what do you do first?</div>
        <div class="sub">Pick what feels most automatic.</div>

        <div class="choice-grid" id="q1">
          ${choiceText("stability", "I tighten everything up and try to make it predictable.")}
          ${choiceText("freedom", "I look for a bigger move to change the game quickly.")}
          ${choiceText("avoidance", "I avoid looking too closely until I absolutely have to.")}
        </div>
      </div>
    `);

    const grid = document.getElementById("q1");
    grid.querySelectorAll(".choice").forEach((el) => {
      el.addEventListener("click", () => {
        grid.querySelectorAll(".choice").forEach((x) => x.classList.remove("selected"));
        el.classList.add("selected");

        const v = el.getAttribute("data-value") || "";
        state.answers.q1_defaultWhenUncertain = v;

        bumpScore(v);
        validateContinue();
      });
    });

    validateContinue();
  }

  function renderQuizQ2() {
    mount(`
      <div class="inner">
        <div class="h1">What triggers your money stress the most?</div>
        <div class="sub">Choose one.</div>

        <div class="choice-grid" id="q2">
          ${choiceText("stability", "Surprises, unpredictable timing, last-minute expenses.")}
          ${choiceText("worth", "Feeling like I haven’t earned it enough yet.")}
          ${choiceText("freedom", "Feeling boxed in or capped no matter how hard I try.")}
        </div>
      </div>
    `);

    const grid = document.getElementById("q2");
    grid.querySelectorAll(".choice").forEach((el) => {
      el.addEventListener("click", () => {
        grid.querySelectorAll(".choice").forEach((x) => x.classList.remove("selected"));
        el.classList.add("selected");

        const v = el.getAttribute("data-value") || "";
        state.answers.q2_moneyStressTrigger = v;

        bumpScore(v);
        validateContinue();
      });
    });

    validateContinue();
  }

  function renderOptIn() {
    mount(`
      <div class="inner">
        <div class="h1">Where should we send your full result?</div>
        <div class="sub">You’ll get your personalized report + a short next-step plan.</div>

        <div class="field">
          <input id="fullName" type="text" placeholder="Full name" value="${escapeAttr(state.fullName)}" />
          <input id="email" type="email" placeholder="Email" value="${escapeAttr(state.email)}" />
          <input id="phone" type="tel" placeholder="Phone number" value="${escapeAttr(state.phone)}" />
        </div>
      </div>
    `);

    const $n = document.getElementById("fullName");
    const $e = document.getElementById("email");
    const $p = document.getElementById("phone");

    const sync = () => {
      state.fullName = $n.value.trim();
      state.email = $e.value.trim();
      state.phone = $p.value.trim();
      validateContinue();
    };

    $n.addEventListener("input", sync);
    $e.addEventListener("input", sync);
    $p.addEventListener("input", sync);

    validateContinue();
  }

  function renderExtraData() {
    mount(`
      <div class="inner">
        <div class="h1">One last thing…</div>
        <div class="sub">How do you currently generate most of your money?</div>

        <div class="choice-grid" id="qExtra">
          ${choiceText("job", "Job / salary")}
          ${choiceText("self_employed", "Self-employed / client work")}
          ${choiceText("business_owner", "Business owner")}
          ${choiceText("side_hustle", "Side hustle")}
          ${choiceText("investments", "Investments")}
          ${choiceText("other", "Other")}
        </div>

        <div class="note">This helps us segment insights and examples.</div>
      </div>
    `);

    const grid = document.getElementById("qExtra");
    grid.querySelectorAll(".choice").forEach((el) => {
      el.addEventListener("click", () => {
        grid.querySelectorAll(".choice").forEach((x) => x.classList.remove("selected"));
        el.classList.add("selected");

        state.answers.qExtra_incomeSource = el.getAttribute("data-value") || "";
        validateContinue();
      });
    });

    validateContinue();
  }

  function renderSubmitting() {
    mount(`
      <div class="inner mapping">
        <div class="h1">Generating your result…</div>
        <div class="sub">One moment — we’re packaging your report.</div>
        <div class="orb" aria-hidden="true"></div>
        <div class="note">Do not refresh.</div>
      </div>
    `);

    submitToFormspark().catch(() => {
      mount(`
        <div class="inner">
          <div class="h1">Something went sideways.</div>
          <div class="sub">Please refresh and try again.</div>
        </div>
      `);

      $continue.disabled = false;
      $continue.textContent = "Back";
      $continue.onclick = () => goTo(8);
    });
  }

  // =========================================
  // Submit
  // =========================================
  async function submitToFormspark() {
    const topPattern = getTopPattern();
    const tyUrl = `${TY_BASE}${encodeURIComponent(topPattern)}`;

    const payload = {
      fullName: state.fullName,
      email: state.email,
      phone: state.phone,

      gender: state.gender,
      dob: `${state.dob.year}-${state.dob.month}-${state.dob.day}`,

      birthTimeKnown: state.birthTimeKnown,
      birthTime: state.birthTimeKnown
        ? `${state.birthTime.hour}:${state.birthTime.minute} ${state.birthTime.ampm}`
        : "unknown",

      birthPlace: formatPlace(),
      birthPlaceLat: state.birthPlace.lat,
      birthPlaceLng: state.birthPlace.lng,

      answers: state.answers,
      scores: state.scores,
      topPattern,

      userAgent: navigator.userAgent,
      submittedAtISO: new Date().toISOString(),
    };

    await fetch(FORMSPARK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
    });

    window.location.href = tyUrl;
  }

  // =========================================
  // Init
  // =========================================
  goTo(0);
})();
