    // Apply saved theme (or the device's setting) before the page draws, so there's no flash.
    (function () {
      var t = null;
      try { t = localStorage.getItem("theme"); } catch (e) {}
      if (!t) t = window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      document.documentElement.setAttribute("data-theme", t);
      document.documentElement.classList.add("js");
    })();

document.addEventListener("DOMContentLoaded", function () {
    // ===== Settings =====
    const MY_EMAIL = "andrew.j.arzola@gmail.com";
    // Paste your Formspree form ID here (the part after /f/ in your form's endpoint, e.g. "xyzabcde").
    const FORMSPREE_ID = "mwllgoel";

    document.getElementById("year").textContent = new Date().getFullYear();

    // Dark mode toggle
    const themeBtn = document.getElementById("theme-toggle");
    function syncThemeLabel() {
      const dark = document.documentElement.getAttribute("data-theme") === "dark";
      themeBtn.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
    }
    syncThemeLabel();
    themeBtn.addEventListener("click", function () {
      const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      try { localStorage.setItem("theme", next); } catch (e) {}
      syncThemeLabel();
    });

    // ===== Motion & interactivity =====
    const reduceMotion = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia && matchMedia("(hover: hover) and (pointer: fine)").matches;

    // Typing headline: "your business" -> "your coffee shop" -> ...
    (function () {
      const el = document.getElementById("rotator");
      const words = ["business", "coffee shop", "barbershop", "auto shop", "bakery", "salon", "restaurant", "gym"];
      if (reduceMotion || !el) return;
      let w = 0, i = words[0].length, deleting = true;
      function tick() {
        if (deleting) {
          i--;
          el.textContent = words[w].slice(0, i);
          if (i === 0) { deleting = false; w = (w + 1) % words.length; }
          setTimeout(tick, 45);
        } else {
          i++;
          el.textContent = words[w].slice(0, i);
          if (i === words[w].length) { deleting = true; setTimeout(tick, 1800); }
          else setTimeout(tick, 85);
        }
      }
      setTimeout(tick, 2200);
    })();

    // Scroll progress bar, nav shadow, active nav link, back-to-top
    (function () {
      const progress = document.getElementById("progress");
      const nav = document.querySelector(".nav");
      const toTop = document.getElementById("to-top");
      const links = [...document.querySelectorAll('.nav-links a[href^="#"]:not(.btn)')];
      const targets = links.map(a => document.querySelector(a.getAttribute("href")));
      let ticking = false;
      function update() {
        const y = window.scrollY;
        const max = document.documentElement.scrollHeight - innerHeight;
        progress.style.transform = "scaleX(" + (max > 0 ? Math.min(y / max, 1) : 0) + ")";
        nav.classList.toggle("scrolled", y > 10);
        toTop.classList.toggle("show", y > 600);
        let current = null;
        targets.forEach((t, idx) => { if (t && t.getBoundingClientRect().top < innerHeight * 0.4) current = links[idx]; });
        links.forEach(a => a.classList.toggle("active", a === current));
        ticking = false;
      }
      addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
      addEventListener("resize", update);
      update();
      toTop.addEventListener("click", () => scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }));
    })();

    // Reveal on scroll + count-up numbers
    (function () {
      document.querySelectorAll(".stagger").forEach(ul => [...ul.children].forEach((li, i) => li.style.setProperty("--i", i)));
      const items = document.querySelectorAll(".reveal");
      const counters = document.querySelectorAll("[data-count]");

      function countUp(root) {
        root.querySelectorAll("[data-count]").forEach(el => {
          const end = +el.dataset.count, start = performance.now(), dur = 1400;
          (function frame(now) {
            const p = Math.min((now - start) / dur, 1);
            el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
            if (p < 1) requestAnimationFrame(frame);
          })(start);
        });
      }

      if (reduceMotion || !("IntersectionObserver" in window)) {
        items.forEach(el => el.classList.add("in"));
        return;
      }
      counters.forEach(el => { el.textContent = "0"; });
      const io = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("in");
          countUp(entry.target);
          io.unobserve(entry.target);
        });
      }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
      items.forEach(el => io.observe(el));
    })();

    // 3D tilt on the project screenshot + spotlight in the contact section
    if (finePointer && !reduceMotion) {
      document.querySelectorAll("[data-tilt]").forEach(card => {
        card.addEventListener("mousemove", e => {
          const r = card.getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
          card.style.transform = "rotateY(" + ((px - .5) * 10) + "deg) rotateX(" + ((.5 - py) * 8) + "deg) translateY(-4px)";
          card.style.setProperty("--gx", px * 100 + "%");
          card.style.setProperty("--gy", py * 100 + "%");
        });
        card.addEventListener("mouseleave", () => { card.style.transform = ""; });
      });
      const contact = document.getElementById("contact");
      contact.addEventListener("mousemove", e => {
        const r = contact.getBoundingClientRect();
        contact.style.setProperty("--mx", (e.clientX - r.left) + "px");
        contact.style.setProperty("--my", (e.clientY - r.top) + "px");
      });
    }

    // "Try it" website builder
    (function () {
      const presets = {
        coffee:      { name: "Morning Ritual Coffee",  tag: "Small-batch coffee and fresh pastries, made every morning.", cta: "View Menu",        icon: "☕", links: ["Menu", "Hours", "Visit"],        services: ["Espresso Bar", "Fresh Pastries", "Catering"] },
        barber:      { name: "Sharp Line Barbers",     tag: "Classic cuts and hot-towel shaves. Walk-ins welcome.",       cta: "Book a Cut",       icon: "💈", links: ["Services", "Barbers", "Book"],   services: ["Haircuts", "Beard Trims", "Hot Shaves"] },
        landscaping: { name: "Green Edge Landscaping", tag: "Lawns, gardens and outdoor spaces, done right.",             cta: "Get a Free Quote", icon: "🌿", links: ["Services", "Projects", "Quote"], services: ["Lawn Care", "Garden Design", "Hardscaping"] },
        auto:        { name: "Precision Auto Detail",  tag: "A showroom shine, inside and out.",                          cta: "Book a Detail",    icon: "🚗", links: ["Packages", "Gallery", "Book"],   services: ["Interior Detail", "Ceramic Coating", "Paint Correction"] },
        bakery:      { name: "Golden Crumb Bakery",    tag: "Fresh bread, cakes and treats, baked from scratch.",         cta: "Order Online",     icon: "🥐", links: ["Menu", "Custom Cakes", "Order"], services: ["Daily Bread", "Custom Cakes", "Wholesale"] }
      };
      const state = { type: "coffee", color: "#2563eb", style: "light" };
      const $ = id => document.getElementById(id);
      const site = $("mock-site"), nameInput = $("name-input");

      function pick(group, attr, value) {
        group.querySelectorAll("button").forEach(b => b.setAttribute("aria-pressed", String(b.dataset[attr] === value)));
      }
      function replay(el) {
        if (reduceMotion) return;
        el.classList.remove("swap"); void el.offsetWidth; el.classList.add("swap");
      }
      function render(animate) {
        const p = presets[state.type];
        const name = nameInput.value.trim() || p.name;
        nameInput.placeholder = p.name;
        $("mock-name").textContent = name;
        $("mock-logo").textContent = name;
        $("mock-url").textContent = (name.toLowerCase().replace(/[^a-z0-9]/g, "") || "yourbusiness") + ".com";
        $("mock-tag").textContent = p.tag;
        $("mock-cta").textContent = p.cta;
        $("mock-icon").textContent = p.icon;
        const links = $("mock-links"); links.replaceChildren();
        p.links.forEach(t => { const s = document.createElement("span"); s.textContent = t; links.appendChild(s); });
        const svc = $("mock-services"); svc.replaceChildren();
        p.services.forEach(t => { const d = document.createElement("div"); d.className = "mock-card"; d.textContent = t; svc.appendChild(d); });
        site.style.setProperty("--c", state.color);
        site.classList.toggle("dark", state.style === "dark");
        if (animate) { replay($("mock-hero")); replay(svc); }
      }

      // Copy the visitor's Try It choices into hidden contact-form fields so they arrive in the email.
      function syncForm() {
        const typeText = $("type-chips").querySelector('[aria-pressed="true"]').textContent;
        const colorBtn = $("swatches").querySelector('[aria-pressed="true"]');
        const colorText = colorBtn.getAttribute("aria-label") + " (" + state.color + ")";
        const styleText = state.style === "dark" ? "Dark" : "Light";
        const nameText = nameInput.value.trim() || "(not entered)";
        const fields = { "tryit-type": typeText, "tryit-name": nameText, "tryit-color": colorText, "tryit-style": styleText };
        Object.entries(fields).forEach(([id, val]) => { $(id).value = val; });
        applyOptOut();
        $("tryit-summary-text").textContent =
          typeText + " · " + colorBtn.getAttribute("aria-label") + " · " + styleText +
          (nameInput.value.trim() ? " · “" + nameInput.value.trim() + "”" : "");
        $("tryit-summary").hidden = false;
      }

      // "Don't include my Try It design" checkbox: disabled fields are left out of the submission.
      function applyOptOut() {
        const excluded = $("tryit-optout").checked;
        ["tryit-type", "tryit-name", "tryit-color", "tryit-style"].forEach(id => { $(id).disabled = excluded; });
        $("tryit-summary").classList.toggle("excluded", excluded);
        $("tryit-summary-title").textContent = excluded
          ? "Your “Try It” design won’t be included"
          : "✓ Your “Try It” design will be included";
      }
      $("tryit-optout").addEventListener("change", applyOptOut);

      $("type-chips").addEventListener("click", e => {
        const b = e.target.closest("button"); if (!b) return;
        state.type = b.dataset.type; pick($("type-chips"), "type", state.type); render(true); syncForm();
      });
      $("swatches").addEventListener("click", e => {
        const b = e.target.closest("button"); if (!b) return;
        state.color = b.dataset.color; pick($("swatches"), "color", state.color); render(false); syncForm();
      });
      $("style-chips").addEventListener("click", e => {
        const b = e.target.closest("button"); if (!b) return;
        state.style = b.dataset.style; pick($("style-chips"), "style", state.style); render(false); syncForm();
      });
      nameInput.addEventListener("input", () => { render(false); syncForm(); });
      render(false);
    })();

    const form = document.getElementById("contact-form");
    const note = document.getElementById("form-note");
    const submitBtn = form.querySelector("button[type=submit]");
    const formspreeReady = FORMSPREE_ID && FORMSPREE_ID !== "YOUR_FORM_ID";

    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      const f = e.target;
      f._subject.value = "Website inquiry from " + f.name.value + (f.business.value ? " (" + f.business.value + ")" : "");

      // Fallback until Formspree is set up: open the visitor's email app.
      if (!formspreeReady) {
        const body =
          "Name: " + f.name.value + "\n" +
          "Business: " + f.business.value + "\n" +
          "Email: " + f.email.value + "\n" +
          "Phone: " + f.phone.value + "\n\n" +
          f.message.value +
          [...f.querySelectorAll('input[id^="tryit-"]:not(:disabled)')].map(i => "\n" + i.name + " " + i.value).join("");
        window.location.href = "mailto:" + MY_EMAIL +
          "?subject=" + encodeURIComponent(f._subject.value) +
          "&body=" + encodeURIComponent(body);
        note.textContent = "Opening your email app. Just hit send!";
        return;
      }

      // Send straight to your inbox through Formspree.
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending...";
      note.textContent = "";
      try {
        const res = await fetch("https://formspree.io/f/" + FORMSPREE_ID, {
          method: "POST",
          body: new FormData(f),
          headers: { "Accept": "application/json" }
        });
        if (res.ok) {
          f.reset();
          document.getElementById("tryit-optout").dispatchEvent(new Event("change"));
          note.textContent = "Thanks! Your message was sent. I'll get back to you within one business day.";
        } else {
          note.textContent = "Something went wrong. Please email me at " + MY_EMAIL + " or call (210) 857-2183.";
        }
      } catch (err) {
        note.textContent = "Couldn't send right now. Please email me at " + MY_EMAIL + " or call (210) 857-2183.";
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Send message";
      }
    });
});
