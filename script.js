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

const contactForm = document.getElementById("contactForm");
const formSuccess = document.getElementById("formSuccess");

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
