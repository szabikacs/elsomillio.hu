const counters = document.querySelectorAll(".counter");

const runCounter = (counter) => {
  const target = Number(counter.dataset.target);
  let current = 0;
  const step = Math.ceil(target / 80);

  const update = () => {
    current += step;
    if (current >= target) {
      counter.textContent = target + counter.dataset.suffix;
      return;
    }
    counter.textContent = current;
    requestAnimationFrame(update);
  };

  update();
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("show");

      if (entry.target.classList.contains("stats")) {
        counters.forEach(runCounter);
      }

      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.18 });

document.querySelectorAll(".reveal, .stats").forEach(el => {
  observer.observe(el);
});
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

const formatFt = (value) => Math.round(value).toLocaleString("hu-HU").replace(/[  ]/g, " ");
const parseNum = (text) => parseFloat(String(text).replace(/\s/g, "").replace(",", "."));
const annuity = (amount, months, yearlyRate) => {
  const r = yearlyRate / 1200;
  return r === 0 ? amount / months : amount * r / (1 - Math.pow(1 + r, -months));
};

/* ---- Mini-kalkulátor ---- */

const mcAmount = document.getElementById("mc_amount");
const mcYears = document.getElementById("mc_years");
const mcRate = document.getElementById("mc_rate");

if (mcAmount && mcYears && mcRate) {
  const updateMiniCalc = () => {
    const amount = parseNum(mcAmount.value);
    const months = Math.round(parseNum(mcYears.value) * 12);
    const rate = parseNum(mcRate.value);

    if (!(amount > 0) || !(months > 0) || !(rate >= 0)) {
      document.getElementById("mc_pay").textContent = "–";
      document.getElementById("mc_int").textContent = "–";
      return;
    }

    const payment = annuity(amount, months, rate);
    document.getElementById("mc_pay").textContent = formatFt(payment);
    document.getElementById("mc_int").textContent = formatFt(payment * months - amount) + " Ft";

    const query = new URLSearchParams({ a: Math.round(amount), n: months, r: rate, t: "payment" });
    document.getElementById("mc_go").href = "/kalkulator?" + query;
  };

  [mcAmount, mcYears, mcRate].forEach((input) => input.addEventListener("input", updateMiniCalc));

  mcAmount.addEventListener("blur", () => {
    const amount = parseNum(mcAmount.value);
    if (amount > 0) mcAmount.value = formatFt(amount);
  });

  updateMiniCalc();
}

const contactForm = document.getElementById("contactForm");
const formSuccess = document.getElementById("formSuccess");

/* ---- A kalkulátorból érkező számítás előtöltése: /?calc=összeg-hónap-kamat-törlesztő#konzultacio ---- */

if (contactForm) {
  const calc = new URLSearchParams(location.search).get("calc");
  const parts = calc ? calc.split("-").map(Number) : [];

  if (parts.length === 4 && parts.every((n) => isFinite(n) && n >= 0)) {
    const [amount, months, rate, payment] = parts;
    const years = months % 12 === 0 ? months / 12 + " év" : months + " hónap";
    const millions = (amount / 1e6).toLocaleString("hu-HU", { maximumFractionDigits: 1 });
    const summary = `Kalkulátorból: ${millions} M Ft, ${years}, ${rate.toLocaleString("hu-HU")}%, ${formatFt(payment)} Ft/hó`;

    const topic = contactForm.querySelector('select[name="topic"]');
    if (topic && !topic.value) topic.value = "Mennyi hitelt kaphatok";

    const message = contactForm.querySelector('textarea[name="message"]');
    if (message && !message.value) message.value = summary + "\n\n";

    // a paraméter ne maradjon a címsorban, ha valaki továbbküldi a linket
    history.replaceState(null, "", location.pathname + location.hash);
  }
}

if (contactForm && formSuccess) {
  contactForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const formData = new FormData(contactForm);

    try {
      const response = await fetch(contactForm.action, {
        method: "POST",
        body: formData,
        headers: {
          "Accept": "application/json"
        }
      });

      if (response.ok) {
        contactForm.reset();
        contactForm.style.display = "none";
        formSuccess.style.display = "block";
      } else {
        alert("Valami hiba történt. Kérlek, próbáld újra, vagy írj e-mailt.");
      }
    } catch (error) {
      alert("Nem sikerült elküldeni az üzenetet. Kérlek, próbáld újra később.");
    }
  });
}
