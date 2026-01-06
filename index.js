(() => {
  "use strict";

  const prefersReduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  // =========================
  // Elements
  // =========================
  const topbar = document.getElementById("topbar");
  const progress = document.getElementById("scrollProgress");
  const yearEl = document.getElementById("year");

  const navToggle = document.getElementById("navToggle");
  const navMenu = document.getElementById("navMenu");
  const navLinks = Array.from(document.querySelectorAll(".nav__link"));

  const revealEls = Array.from(document.querySelectorAll("[data-reveal]"));

  const scene = document.getElementById("scene");

  const form = document.querySelector("form.form");
  const statusEl = document.getElementById("formStatus");

  // =========================
  // Footer year
  // =========================
  // Your footer already includes text around the year; this sets the span only.
  if (yearEl) yearEl.textContent = `${new Date().getFullYear()}`;

  // =========================
  // Nav: mobile toggle
  // =========================
  const closeMenu = () => {
    if (!navMenu || !navToggle) return;
    navMenu.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
  };

  navToggle?.addEventListener("click", () => {
    if (!navMenu || !navToggle) return;
    const isOpen = navMenu.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  // Close on link click (mobile)
  navLinks.forEach((a) => {
    a.addEventListener("click", () => {
      if (navMenu?.classList.contains("is-open")) closeMenu();
    });
  });

  // Close on outside click (mobile)
  document.addEventListener("click", (e) => {
    if (!navMenu?.classList.contains("is-open")) return;
    const target = e.target;
    const clickedInside =
      navMenu.contains(target) || navToggle?.contains(target);
    if (!clickedInside) closeMenu();
  });

  // ESC closes menu
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && navMenu?.classList.contains("is-open")) {
      closeMenu();
      navToggle?.focus();
    }
  });

  // =========================
  // Smooth scrolling with offset for fixed header
  // =========================
  const headerOffset = () => (topbar?.offsetHeight || 0) + 10;

  const scrollToHash = (hash) => {
    const el = document.querySelector(hash);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - headerOffset();
    window.scrollTo({ top: y, behavior: prefersReduced ? "auto" : "smooth" });
  };

  // Intercept same-page anchor clicks for consistent offset
  document.addEventListener("click", (e) => {
    const a = e.target.closest?.('a[href^="#"]');
    if (!a) return;
    const hash = a.getAttribute("href");
    if (!hash || hash === "#") return;

    const el = document.querySelector(hash);
    if (!el) return;

    e.preventDefault();
    history.pushState(null, "", hash);
    scrollToHash(hash);
  });

  // Handle back/forward hash changes
  window.addEventListener("popstate", () => {
    const hash = window.location.hash;
    if (hash) scrollToHash(hash);
  });

  // If someone lands with a hash, apply offset scroll
  if (window.location.hash) {
    requestAnimationFrame(() => scrollToHash(window.location.hash));
  }

  // =========================
  // Nav active states (IntersectionObserver)
  // =========================
  const sectionIds = [
    "#about",
    "#services",
    "#process",
    "#portfolio",
    "#contact",
  ];
  const sections = sectionIds
    .map((id) => document.querySelector(id))
    .filter(Boolean);

  const setActive = (id) => {
    navLinks.forEach((a) => {
      const isActive = a.getAttribute("href") === id;
      if (isActive) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
  };

  if ("IntersectionObserver" in window && sections.length) {
    const navObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((en) => en.isIntersecting)
          .sort(
            (a, b) => (b.intersectionRatio || 0) - (a.intersectionRatio || 0)
          )[0];

        if (visible?.target?.id) {
          setActive(`#${visible.target.id}`);
        }
      },
      {
        root: null,
        threshold: [0.2, 0.35, 0.5],
        rootMargin: `-${headerOffset()}px 0px -55% 0px`,
      }
    );

    sections.forEach((sec) => navObserver.observe(sec));
  }

  // =========================
  // Reveal entrances (ONE system)
  // =========================
  const show = (el) => el.classList.add("is-visible");

  if (!prefersReduced && "IntersectionObserver" in window && revealEls.length) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            show(en.target);
            revealObserver.unobserve(en.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -10% 0px" }
    );

    revealEls.forEach((el) => revealObserver.observe(el));
  } else {
    revealEls.forEach(show);
  }

  // =========================
  // Scroll effects: topbar blur + progress bar
  // =========================
  let ticking = false;

  const onScroll = () => {
    const y = window.scrollY || 0;

    topbar?.classList.toggle("is-scrolled", y > 6);

    if (progress) {
      const doc = document.documentElement;
      const max = Math.max(1, doc.scrollHeight - doc.clientHeight);
      const pct = Math.min(100, Math.max(0, (y / max) * 100));
      progress.style.width = `${pct}%`;
    }

    ticking = false;
  };

  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        window.requestAnimationFrame(onScroll);
        ticking = true;
      }
    },
    { passive: true }
  );
  onScroll();

  // =========================
  // Tasteful parallax (optional)
  // =========================
  if (!prefersReduced && scene) {
    let lastY = 0;
    const parallax = () => {
      const y = window.scrollY || 0;
      const delta = Math.min(160, y) * 0.08;
      if (Math.abs(y - lastY) > 1) {
        scene.style.transform = `translate3d(0, ${delta}px, 0)`;
        lastY = y;
      }
    };

    window.addEventListener(
      "scroll",
      () => window.requestAnimationFrame(parallax),
      { passive: true }
    );
    parallax();
  }

  //this makes a alert in js saying that the
  //honors website is underway

  const honorsLink = document.getElementById("honorsLink");
  honorsLink?.addEventListener("click", (e) => {
    e.preventDefault();
    alert("Website Under Construction");
  });

  // =========================
  // Demo form submit (no network)
  // =========================

  // ============================================================
  // Services interactive selector (YOUR REAL OFFERS)
  // COPY SUMMARY REMOVED
  // ============================================================
  const svcData = {
    design: {
      eyebrow: "Service",
      title: "Web Design",
      lead: "We design clear, modern website layouts that are easy to understand and visually consistent.",
      steps: [
        "Homepage and page layout design",
        "Visual structure and section flow",
        "Design concept created in Canva",
      ],
    },
    build: {
      eyebrow: "Service",
      title: "Website Building",
      lead: "We build a complete website based on an approved design. We can custom-code it or build it on a platform that fits your business.",
      steps: [
        "Custom-coded websites",
        "WordPress, Squarespace, or Wix builds",
        "Mobile-friendly pages, forms, and clear calls-to-action",
      ],
    },
    redesign: {
      eyebrow: "Service",
      title: "Website Redesign",
      lead: "We redesign websites that feel outdated, confusing, or hard to use. The goal is clarity, trust, and a better experience for visitors.",
      steps: [
        "Improved layout, structure, and navigation",
        "Cleaner design and better readability",
        "Rebuild on the same or a new platform",
      ],
    },
  };

  const svcTabs = Array.from(document.querySelectorAll(".svc__tab"));
  const featured = document.getElementById("svcFeatured");

  const renderSvc = (key) => {
    const d = svcData[key];
    if (!d || !featured) return;

    featured.innerHTML = `
      <p class="eyebrow">${d.eyebrow}</p>
      <h3 class="svc__title">${d.title}</h3>
      <p class="muted svc__lead">${d.lead}</p>

      <div class="svc__steps" aria-label="What you get">
        ${d.steps
          .map(
            (s) =>
              `<div class="step"><span class="step__dot"></span><span>${s}</span></div>`
          )
          .join("")}
      </div>

      <div class="svc__ctaRow">
        <a class="btn btn--primary" href="#contact">
          <span>Book a Discovery Call</span>
          <span class="btn__icon" aria-hidden="true">↗</span>
        </a>
      </div>
    `;
  };

  const setSvcActive = (btn) => {
    svcTabs.forEach((b) => {
      b.classList.remove("is-active", "svc-spark");
      b.setAttribute("aria-selected", "false");
    });

    btn.classList.add("is-active");
    btn.setAttribute("aria-selected", "true");

    // Spark swirl on click (kept from your original)
    btn.classList.remove("svc-spark");
    void btn.offsetWidth; // restart animation
    btn.classList.add("svc-spark");
    btn.addEventListener(
      "animationend",
      () => btn.classList.remove("svc-spark"),
      { once: true }
    );
  };

  svcTabs.forEach((btn) => {
    btn.addEventListener("click", () => {
      const key = btn.dataset.svc;
      if (!key) return;
      setSvcActive(btn);
      renderSvc(key);
    });
  });

  // Default
  renderSvc("design");

  // ============================================================
  // Process Timeline (UNCHANGED from your file)
  // ============================================================
  const STEPS = [
    {
      step: "Step 1",
      title: "Discovery",
      lead:
        "We learn your goals and your customers. " +
        "We get clear on what the website must do.",
      bullets: [
        "We ask simple questions about your business",
        "We list the main pages you need",
        "We talk about timeline, budget, and content",
        "We agree on what success looks like",
      ],
      deliverables: [
        "Project notes",
        "Page list",
        "Basic timeline",
        "Next steps",
      ],
    },
    {
      step: "Step 2",
      title: "Plan & Design",
      lead:
        "We plan the site so it is easy to use. " +
        "Then we design a clean look that feels premium.",
      bullets: [
        "We set up the navigation and page order",
        "We sketch simple page layouts",
        "We choose fonts, spacing, and style"
      ],
      deliverables: [
        "Wireframes",
        "Style direction",
        "Page layout plan",
        "Design draft",
      ],
    },
    {
      step: "Step 3",
      title: "Build",
      lead:
        "We build the website and make it work on every device. "
        bullets: [
        "We build mobile-first sections",
        "We keep the site nice & smooth",
        "We test the site for basic accessibility"
      ],
      deliverables: [
        "Working website",
        "Mobile layout",
        "Speed checks",
        "QA review",
      ],
    },
    {
      step: "Step 4",
      title: "Launch",
      lead:
        "We launch your site and make sure everything is working. " +
        "We can also help with updates after launch.",
      bullets: [
        "We run a final launch checklist",
        "We help with domain and hosting if needed",
        "We share simple handoff notes",
      ],
      deliverables: [
        "Launch checklist",
        "Handoff notes",
        "Go-live support",
        "Update options",
      ],
    },
  ];

  const timeline = document.getElementById("timeline");
  const cards = Array.from(document.querySelectorAll(".tCard"));
  const overlay = document.getElementById("tOverlay");
  const closeBtn = document.getElementById("tClose");
  const progressEl = document.getElementById("tProg");
  const live = document.getElementById("processLive");

  const tEyebrow = document.getElementById("tEyebrow");
  const tTitle = document.getElementById("tTitle");
  const tLead = document.getElementById("tLead");
  const tBullets = document.getElementById("tBullets");
  const tDeliver = document.getElementById("tDeliver");

  let activeIndex = -1;
  let lastFocusedEl = null;

  const isVertical = () => window.matchMedia("(max-width: 900px)").matches;

  const setProgress = (index) => {
    if (!progressEl || !cards.length) return;

    const count = cards.length;
    const pct = count <= 1 ? 0 : (index / (count - 1)) * 100;

    if (isVertical()) {
      progressEl.style.width = "2px";
      progressEl.style.height = `${pct}%`;
    } else {
      progressEl.style.height = "2px";
      progressEl.style.width = `${pct}%`;
    }
  };

  const renderStep = (index) => {
    const s = STEPS[index];
    if (!s) return;

    if (tEyebrow) tEyebrow.textContent = s.step;
    if (tTitle) tTitle.textContent = s.title;
    if (tLead) tLead.textContent = s.lead;

    if (tBullets) {
      tBullets.innerHTML = "";
      s.bullets.forEach((b) => {
        const li = document.createElement("li");
        li.textContent = b;
        tBullets.appendChild(li);
      });
    }

    if (tDeliver) {
      tDeliver.innerHTML = "";
      s.deliverables.forEach((d) => {
        const chip = document.createElement("span");
        chip.className = "tChip";
        chip.textContent = d;
        tDeliver.appendChild(chip);
      });
    }
  };

  const openStep = (index) => {
    if (!timeline || !overlay) return;

    activeIndex = index;
    lastFocusedEl = document.activeElement;

    timeline.classList.add("is-dimmed");

    cards.forEach((c) => {
      const sel = Number(c.dataset.step) === index;
      c.classList.toggle("is-selected", sel);
      c.setAttribute("aria-expanded", sel ? "true" : "false");
    });

    setProgress(index);
    renderStep(index);

    overlay.hidden = false;
    requestAnimationFrame(() => overlay.classList.add("is-open"));

    if (live) {
      live.textContent = `${STEPS[index].title} opened. Press Escape to close.`;
    }
    closeBtn?.focus();
  };

  const closeStep = () => {
    if (activeIndex === -1 || !overlay) return;

    overlay.classList.remove("is-open");
    setTimeout(() => (overlay.hidden = true), 220);

    timeline?.classList.remove("is-dimmed");
    cards.forEach((c) => {
      c.classList.remove("is-selected");
      c.setAttribute("aria-expanded", "false");
    });

    if (live) live.textContent = "Timeline details closed.";
    activeIndex = -1;

    if (lastFocusedEl && typeof lastFocusedEl.focus === "function") {
      lastFocusedEl.focus();
    }
  };

  if (timeline && cards.length) {
    cards.forEach((card) => {
      card.addEventListener("click", () => openStep(Number(card.dataset.step)));

      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openStep(Number(card.dataset.step));
        }
      });
    });

    closeBtn?.addEventListener("click", closeStep);

    overlay?.addEventListener("click", (e) => {
      const closeTarget = e.target.closest?.("[data-close='1']");
      if (closeTarget) closeStep();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeStep();
    });

    window.addEventListener("resize", () => {
      if (activeIndex >= 0) setProgress(activeIndex);
    });

    setProgress(0);
  }
})();
