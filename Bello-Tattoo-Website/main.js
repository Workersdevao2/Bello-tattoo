/* Bello Tattoo — main interactions */

(function () {
  "use strict";

  const WA_NUMBER = "244933107034";
  const WA_BASE = `https://wa.me/${WA_NUMBER}`;

  // ---------- Language ----------
  const html = document.documentElement;
  const savedLang = localStorage.getItem("bello-lang") || "pt";
  html.setAttribute("data-lang", savedLang);

  function updateLangButton() {
    const btn = document.querySelector(".lang-toggle");
    if (!btn) return;
    const current = html.getAttribute("data-lang");
    btn.textContent = current === "pt" ? "EN" : "PT";
  }
  updateLangButton();

  document.querySelectorAll(".lang-toggle").forEach((btn) => {
    btn.addEventListener("click", () => {
      const next = html.getAttribute("data-lang") === "pt" ? "en" : "pt";
      html.setAttribute("data-lang", next);
      localStorage.setItem("bello-lang", next);
      updateLangButton();
    });
  });

  // ---------- Mobile nav ----------
  const hamburger = document.querySelector(".hamburger");
  const navMobile = document.querySelector(".nav-mobile");

  if (hamburger && navMobile) {
    hamburger.addEventListener("click", () => {
      hamburger.classList.toggle("open");
      navMobile.classList.toggle("open");
      document.body.style.overflow = navMobile.classList.contains("open") ? "hidden" : "";
    });

    navMobile.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        hamburger.classList.remove("open");
        navMobile.classList.remove("open");
        document.body.style.overflow = "";
      });
    });
  }

  // ---------- Header scroll ----------
  const header = document.querySelector(".site-header");
  if (header) {
    window.addEventListener("scroll", () => {
      header.style.background =
        window.scrollY > 40 ? "rgba(248, 245, 240, 0.98)" : "rgba(248, 245, 240, 0.92)";
    });
  }

  // ---------- Video autoplay (Safari / iOS safe) ----------
  // Safari requires muted + playsinline and often needs an explicit play() call
  function forceVideoPlay(video) {
    if (!video) return;
    video.muted = true;
    video.setAttribute("muted", "");
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");
    video.playsInline = true;
    const tryPlay = () => {
      const p = video.play();
      if (p && typeof p.catch === "function") {
        p.catch(() => {
          // Retry once after a short delay (common Safari quirk)
          setTimeout(() => {
            video.muted = true;
            video.play().catch(() => {});
          }, 200);
        });
      }
    };
    if (video.readyState >= 2) {
      tryPlay();
    } else {
      video.addEventListener("loadeddata", tryPlay, { once: true });
      video.addEventListener("canplay", tryPlay, { once: true });
    }
  }

  document.querySelectorAll("video[autoplay]").forEach(forceVideoPlay);

  // Re-attempt when tab becomes visible again (Safari pauses background videos)
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      document.querySelectorAll("video[autoplay]").forEach(forceVideoPlay);
    }
  });

  // ---------- Hero video rotation (all 3 clips, min 10s each) ----------
  const heroStack = document.getElementById("hero-video-stack");
  if (heroStack) {
    const videos = Array.from(heroStack.querySelectorAll(".hero-video"));
    let current = 0;
    let rotateTimer = null;
    const MIN_PLAY_MS = 10000; // every video plays at least 10 seconds

    function clearRotateTimer() {
      if (rotateTimer) {
        clearTimeout(rotateTimer);
        rotateTimer = null;
      }
    }

    function scheduleNext(fromIndex) {
      clearRotateTimer();
      const v = videos[fromIndex];
      // Prefer full duration when known; always at least 10s
      let wait = MIN_PLAY_MS;
      if (v && isFinite(v.duration) && v.duration > 0) {
        wait = Math.max(MIN_PLAY_MS, Math.floor(v.duration * 1000));
      }
      rotateTimer = setTimeout(() => {
        showHero((fromIndex + 1) % videos.length);
      }, wait);
    }

    function showHero(index) {
      videos.forEach((v, i) => {
        const active = i === index;
        v.classList.toggle("is-active", active);
        if (active) {
          try {
            v.currentTime = 0;
          } catch (e) {}
          // Disable native loop so we control timing
          v.loop = false;
          forceVideoPlay(v);
        } else {
          v.pause();
        }
      });
      current = index;
      scheduleNext(index);
    }

    // When a clip ends after the min window, advance early if duration was short
    videos.forEach((v, i) => {
      v.addEventListener("ended", () => {
        if (i === current) {
          // If ended before min window, scheduleNext already has a timer;
          // if ended after min, advance now
          clearRotateTimer();
          showHero((current + 1) % videos.length);
        }
      });
      // Once metadata is ready, refresh schedule with real duration
      v.addEventListener(
        "loadedmetadata",
        () => {
          if (i === current) scheduleNext(current);
        },
        { once: true }
      );
    });

    showHero(0);
  }

  // ---------- Booking form → WhatsApp ----------
  const bookingForm = document.getElementById("booking-form");
  if (bookingForm) {
    bookingForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("bk-name").value.trim();
      const phone = document.getElementById("bk-phone").value.trim();
      const description = document.getElementById("bk-description").value.trim();
      const style = document.getElementById("bk-style").value;
      const color = document.getElementById("bk-color").value;
      const size = document.getElementById("bk-size").value;
      const date = document.getElementById("bk-date").value;

      if (!name || !description) {
        alert(
          html.getAttribute("data-lang") === "pt"
            ? "Por favor preencha o nome e a descrição da tatuagem."
            : "Please fill in your name and tattoo description."
        );
        return;
      }

      const isPt = html.getAttribute("data-lang") === "pt";
      let msg = isPt
        ? `Olá Bello Tattoo! 👋\n\nGostaria de marcar uma sessão.\n\n*Nome:* ${name}\n*Telefone:* ${phone || "—"}\n*Descrição / Localização no corpo:* ${description}\n*Estilo:* ${style || "—"}\n*Cor:* ${color || "—"}\n*Tamanho aproximado:* ${size || "—"}\n*Preferência de data:* ${date || "—"}`
        : `Hello Bello Tattoo! 👋\n\nI would like to book a session.\n\n*Name:* ${name}\n*Phone:* ${phone || "—"}\n*Description / Body location:* ${description}\n*Style:* ${style || "—"}\n*Color:* ${color || "—"}\n*Approximate size:* ${size || "—"}\n*Preferred date:* ${date || "—"}`;

      window.open(`${WA_BASE}?text=${encodeURIComponent(msg)}`, "_blank");
    });
  }

  // ---------- Products cart ----------
  const cart = {};
  const cartBar = document.getElementById("cart-bar");

  function updateCartUI() {
    let count = 0;
    let total = 0;
    Object.values(cart).forEach((item) => {
      count += item.qty || 0;
      total += (item.qty || 0) * (item.price || 0);
    });

    const totalText = total.toLocaleString("pt-AO") + " Kz";

    const countEl = document.getElementById("cart-count");
    const totalEl = document.getElementById("cart-total");
    const countElEn = document.getElementById("cart-count-en");
    const totalElEn = document.getElementById("cart-total-en");

    if (countEl) countEl.textContent = String(count);
    if (totalEl) totalEl.textContent = totalText;
    if (countElEn) countElEn.textContent = String(count);
    if (totalElEn) totalElEn.textContent = totalText;

    if (cartBar) {
      if (count > 0) cartBar.classList.add("visible");
      else cartBar.classList.remove("visible");
    }
  }

  document.querySelectorAll("[data-add-product]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      const card = btn.closest(".product-card");
      if (!card) return;

      const id = card.dataset.id;
      const name = card.dataset.name;
      const price = parseInt(String(card.dataset.price || "0").replace(/\D/g, ""), 10) || 0;
      if (!id || !name || !price) return;

      const qtyInput = card.querySelector(".qty-input");
      let qty = parseInt(qtyInput && qtyInput.value ? qtyInput.value : "1", 10);
      if (!Number.isFinite(qty) || qty < 1) qty = 1;

      if (!cart[id]) cart[id] = { name, price, qty: 0 };
      cart[id].qty += qty;
      updateCartUI();
    });
  });

  document.querySelectorAll(".qty-minus").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const row = btn.parentElement;
      const input = row && row.querySelector(".qty-input");
      if (!input) return;
      let v = parseInt(input.value, 10) || 1;
      if (v > 1) input.value = String(v - 1);
    });
  });

  document.querySelectorAll(".qty-plus").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const row = btn.parentElement;
      const input = row && row.querySelector(".qty-input");
      if (!input) return;
      let v = parseInt(input.value, 10) || 1;
      const max = parseInt(input.getAttribute("max") || "99", 10);
      if (v < max) input.value = String(v + 1);
    });
  });

  const checkoutBtn = document.getElementById("cart-checkout");
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const items = Object.values(cart).filter((i) => i.qty > 0);
      if (!items.length) return;

      const isPt = html.getAttribute("data-lang") === "pt";
      const fmt = (n) => n.toLocaleString("pt-AO");

      let msg = isPt
        ? "Olá Bello Tattoo! 🛒\n\n*Pedido de produtos aftercare*\n\n"
        : "Hello Bello Tattoo! 🛒\n\n*Aftercare product order*\n\n";

      let total = 0;
      items.forEach((item, idx) => {
        const sub = item.qty * item.price;
        total += sub;
        msg += `${idx + 1}. ${item.name}\n`;
        msg += isPt
          ? `   Qtd: ${item.qty} × ${fmt(item.price)} Kz = *${fmt(sub)} Kz*\n`
          : `   Qty: ${item.qty} × ${fmt(item.price)} Kz = *${fmt(sub)} Kz*\n`;
      });

      msg += "\n━━━━━━━━━━━━━━\n";
      msg += isPt
        ? `*TOTAL: ${fmt(total)} Kz*\n\n`
        : `*TOTAL: ${fmt(total)} Kz*\n\n`;
      msg += isPt
        ? "Por favor confirme disponibilidade e forma de entrega/levantamento."
        : "Please confirm availability and delivery/pickup method.";

      window.open(`${WA_BASE}?text=${encodeURIComponent(msg)}`, "_blank");
    });
  }

  // ---------- Feedback form (FAQ) → WhatsApp ----------
  const starRating = document.getElementById("star-rating");
  const ratingInput = document.getElementById("fb-rating");
  let selectedRating = 0;

  if (starRating) {
    const stars = Array.from(starRating.querySelectorAll(".star"));

    function paintStars(value, hoverMode) {
      stars.forEach((s) => {
        const v = parseInt(s.dataset.value, 10);
        s.classList.toggle("is-active", v <= value && !hoverMode);
        s.classList.toggle("is-hover", hoverMode && v <= value);
      });
    }

    stars.forEach((star) => {
      star.addEventListener("mouseenter", () => {
        paintStars(parseInt(star.dataset.value, 10), true);
      });
      star.addEventListener("mouseleave", () => {
        paintStars(selectedRating, false);
      });
      star.addEventListener("click", () => {
        selectedRating = parseInt(star.dataset.value, 10);
        if (ratingInput) ratingInput.value = String(selectedRating);
        paintStars(selectedRating, false);
        const hintPt = document.getElementById("rating-hint");
        const hintEn = document.getElementById("rating-hint-en");
        const labels = {
          1: { pt: "1 estrela — Fraco", en: "1 star — Poor" },
          2: { pt: "2 estrelas — Razoável", en: "2 stars — Fair" },
          3: { pt: "3 estrelas — Bom", en: "3 stars — Good" },
          4: { pt: "4 estrelas — Muito bom", en: "4 stars — Very good" },
          5: { pt: "5 estrelas — Excelente", en: "5 stars — Excellent" },
        };
        if (hintPt) hintPt.textContent = labels[selectedRating].pt;
        if (hintEn) hintEn.textContent = labels[selectedRating].en;
      });
    });
  }

  const feedbackForm = document.getElementById("feedback-form");
  if (feedbackForm) {
    feedbackForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const isPt = html.getAttribute("data-lang") === "pt";
      const name = (document.getElementById("fb-name")?.value || "").trim();
      const opinion = (document.getElementById("fb-opinion")?.value || "").trim();
      const rating = selectedRating || parseInt(ratingInput?.value || "0", 10);

      if (!rating || rating < 1) {
        alert(isPt ? "Por favor selecciona uma classificação de 1 a 5 estrelas." : "Please select a rating from 1 to 5 stars.");
        return;
      }
      if (!opinion) {
        alert(isPt ? "Escreve a tua opinião sobre o serviço." : "Please write your opinion about the service.");
        return;
      }

      const starsText = "★".repeat(rating) + "☆".repeat(5 - rating);
      let msg = isPt
        ? `Olá Bello Tattoo! 💬\n\n*Opinião sobre o serviço*\n\n`
        : `Hello Bello Tattoo! 💬\n\n*Service feedback*\n\n`;
      msg += isPt ? `*Classificação:* ${starsText} (${rating}/5)\n` : `*Rating:* ${starsText} (${rating}/5)\n`;
      if (name) msg += isPt ? `*Nome:* ${name}\n` : `*Name:* ${name}\n`;
      msg += isPt ? `\n*Como gostei do serviço:*\n${opinion}` : `\n*How I enjoyed the service:*\n${opinion}`;

      window.open(`${WA_BASE}?text=${encodeURIComponent(msg)}`, "_blank");
    });
  }

  // ---------- Active nav link ----------
  const path = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-desktop a, .nav-mobile a").forEach((a) => {
    const href = a.getAttribute("href");
    if (href === path || (path === "" && href === "index.html")) {
      a.classList.add("active");
    }
  });
})();
