(() => {
  "use strict";

  const APP_URL = "https://app.kyrodi.com";
  const root = document.documentElement;
  root.classList.add("js");

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  const ua = navigator.userAgent || "";
  const isIOS = /iPhone|iPad|iPod/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isAndroid = /Android/i.test(ua);
  const isInApp = /FBAN|FBAV|FB_IAB|Instagram|WhatsApp|Line\/|Snapchat|Twitter|LinkedInApp/i.test(ua);
  const isIOSNonSafari = isIOS && /CriOS|FxiOS|EdgiOS|OPiOS/i.test(ua);
  const isStandalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;

  // Launched from the home-screen icon of this site → go straight to the app.
  if (isStandalone && new URLSearchParams(location.search).get("source") === "pwa") {
    location.replace(APP_URL);
    return;
  }

  /* ---------- Toast ---------- */
  const toastEl = $("[data-toast]");
  let toastTimer;
  const toast = (msg) => {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("is-visible"), 2800);
  };

  /* ---------- Header & mobile nav ---------- */
  const header = $("[data-header]");
  const nav = $("#site-nav");
  const toggle = $(".nav-toggle");

  const setMenu = (open) => {
    nav.classList.toggle("is-open", open);
    header.classList.toggle("menu-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  };
  toggle?.addEventListener("click", () => setMenu(!nav.classList.contains("is-open")));
  $$("a", nav).forEach((a) => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

  const hero = $(".hero");
  const sticky = $("[data-sticky-cta]");
  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle("is-scrolled", y > 12);
    if (sticky && hero) {
      const show = y > hero.offsetHeight * 0.75;
      sticky.classList.toggle("is-visible", show);
      sticky.setAttribute("aria-hidden", String(!show));
      const link = $("a", sticky);
      if (link) link.tabIndex = show ? 0 : -1;
    }
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Reveal on scroll ---------- */
  const revealEls = $$("[data-reveal]");
  // Stagger siblings that reveal together
  revealEls.forEach((el) => {
    const group = Array.from(el.parentElement.children).filter((c) => c.hasAttribute("data-reveal"));
    const i = group.indexOf(el);
    if (i > 0) el.style.setProperty("--d", `${Math.min(i, 5) * 0.08}s`);
  });
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  /* ---------- Platform tabs ---------- */
  const tablist = $(".platform-tabs");
  const tabs = $$('[role="tab"]', tablist);

  const selectTab = (platform, focus = false) => {
    tabs.forEach((tab) => {
      const active = tab.id === `tab-${platform}`;
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
      $(`#${tab.getAttribute("aria-controls")}`).hidden = !active;
      if (active && focus) tab.focus();
    });
    tablist.dataset.active = platform;
  };

  tabs.forEach((tab, i) => {
    tab.addEventListener("click", () => selectTab(tab.id.replace("tab-", "")));
    tab.addEventListener("keydown", (e) => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) return;
      e.preventDefault();
      let next = i;
      if (e.key === "ArrowRight") next = (i + 1) % tabs.length;
      if (e.key === "ArrowLeft") next = (i - 1 + tabs.length) % tabs.length;
      if (e.key === "Home") next = 0;
      if (e.key === "End") next = tabs.length - 1;
      selectTab(tabs[next].id.replace("tab-", ""), true);
    });
  });

  selectTab(isIOS ? "ios" : "android");

  /* ---------- In-app browser notice (WhatsApp, Instagram…) ---------- */
  const inappBanner = $("#inapp-banner");
  if (inappBanner && (isInApp || isIOSNonSafari)) {
    const msg = $("[data-inapp-msg]", inappBanner);
    if (isIOSNonSafari && !isInApp) {
      $("strong", inappBanner).textContent = "Using Chrome or another browser on iPhone?";
      msg.innerHTML = "For the smoothest install, copy the link and open it in <b>Safari</b>.";
    } else if (isIOS) {
      msg.innerHTML = "To install, open this page in <b>Safari</b> first. Tap the <b>compass</b> or <b>···</b> icon and choose <b>Open in Safari</b>, or copy the link below.";
    } else if (isAndroid) {
      msg.innerHTML = "To install, open this page in <b>Chrome</b> first. Tap <b>⋮</b> at the top right and choose <b>Open in Chrome</b>, or copy the link below.";
    }
    inappBanner.hidden = false;
  }

  const copyLink = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.cssText = "position:fixed;opacity:0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      ta.remove();
      return ok;
    }
  };
  $$("[data-copy-link]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const ok = await copyLink(APP_URL);
      toast(ok ? "Link copied. Paste it into your browser." : APP_URL);
    });
  });

  /* ---------- Smart install button ---------- */
  const installCard = $(".smart-install");
  const installBtn = $("[data-install-btn]");
  const installLabel = $("[data-install-label]");
  const installTitle = $("[data-install-title]");
  const installStatus = $("[data-install-status]");
  let deferredPrompt = null;

  const setInstallUI = (state) => {
    installCard.classList.remove("is-ready", "is-installed");
    switch (state) {
      case "ready":
        installCard.classList.add("is-ready");
        installTitle.textContent = "Install Kyrodi in one tap";
        installStatus.textContent = "Your browser supports instant install. No app store needed.";
        installLabel.textContent = "Install now";
        break;
      case "installed":
        installCard.classList.add("is-installed");
        installTitle.textContent = "Kyrodi is on your home screen";
        installStatus.textContent = "Look for the Kyrodi icon on your home screen, or open it right here.";
        installBtn.hidden = true;
        break;
      case "ios":
        installTitle.textContent = "Add Kyrodi to your iPhone";
        installStatus.textContent = "On iPhone, installing takes 4 taps in Safari. We'll show you how.";
        installLabel.textContent = "Show me how";
        break;
      default:
        installTitle.textContent = "Get Kyrodi on your phone";
        installStatus.textContent = isAndroid
          ? "Open Kyrodi in Chrome and tap “Install app”. Here's how."
          : "Open Kyrodi on your phone and add it to your home screen.";
        installLabel.textContent = "Show me how";
    }
  };

  const pointToSteps = (platform) => {
    selectTab(platform);
    const panel = $(`#panel-${platform}`);
    panel.scrollIntoView({ behavior: "smooth", block: "start" });
    panel.classList.remove("is-pulsing");
    void panel.offsetWidth;
    panel.classList.add("is-pulsing");
    setTimeout(() => panel.classList.remove("is-pulsing"), 2600);
  };

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    setInstallUI("ready");
  });

  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    setInstallUI("installed");
    toast("Kyrodi installed. Find it on your home screen.");
  });

  installBtn?.addEventListener("click", async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      deferredPrompt = null;
      if (outcome === "accepted") {
        setInstallUI("installed");
      } else {
        setInstallUI(isIOS ? "ios" : "default");
        toast("No problem. You can install any time.");
      }
      return;
    }
    // Graceful fallback: iOS has no install prompt; other browsers may not fire it.
    pointToSteps(isIOS ? "ios" : "android");
  });

  if (isStandalone) setInstallUI("installed");
  else setInstallUI(isIOS ? "ios" : "default");

  /* ---------- Service worker (offline shell + installability) ---------- */
  if ("serviceWorker" in navigator && location.protocol === "https:") {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("sw.js").catch(() => {});
    });
  }

  /* ---------- Footer year ---------- */
  $$("[data-year]").forEach((el) => { el.textContent = new Date().getFullYear(); });
})();
