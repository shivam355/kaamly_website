document.addEventListener("DOMContentLoaded", () => {
  // Mobile nav toggle
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".nav");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });
  }

  // Highlight the current page in the nav
  const page = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav a").forEach((link) => {
    if (link.getAttribute("href") === page) {
      link.setAttribute("aria-current", "page");
    }
  });

  // Footer year
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  // Contact form: static sites have no backend, so open the user's mail client
  const form = document.getElementById("contact-form");
  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(form);
      const subject = encodeURIComponent(`Message from ${data.get("name")}`);
      const body = encodeURIComponent(`${data.get("message")}\n\nReply to: ${data.get("email")}`);
      window.location.href = `mailto:${form.dataset.to}?subject=${subject}&body=${body}`;
      document.getElementById("form-status").textContent = "Opening your email app…";
    });
  }
});
