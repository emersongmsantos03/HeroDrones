(function () {
  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var lastFocusedElement = null;

  function createIcons() {
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  function updateHeaderState() {
    document.body.classList.toggle("is-scrolled", window.scrollY > 12);
  }

  function setupReveal() {
    var items = document.querySelectorAll([
      ".hero-content",
      ".quick-info-grid > *",
      ".section-heading",
      ".service-card",
      ".deliverables-layout > *",
      ".deliverables-list > *",
      ".portfolio-card",
      ".process-grid article",
      ".quote-copy",
      ".quote-form",
      ".contact-panel",
      ".contact-layout > div",
      ".portfolio-page-content",
      ".portfolio-nav-grid > *",
      ".feature-media",
      ".feature-layout > div",
      ".portfolio-category-card",
      ".showcase-card",
      ".delivery-card",
      ".cta-layout > *"
    ].join(","));

    items.forEach(function (item, index) {
      item.classList.add("reveal-item");
      item.style.setProperty("--reveal-delay", Math.min(index % 6, 5) * 60 + "ms");
    });

    function revealVisibleItems() {
      items.forEach(function (item) {
        if (item.classList.contains("is-visible")) {
          return;
        }

        var rect = item.getBoundingClientRect();

        if (rect.top < window.innerHeight * 0.94 && rect.bottom > 0) {
          item.classList.add("is-visible");
        }
      });
    }

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      items.forEach(function (item) {
        item.classList.add("is-visible");
      });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: "0px 0px -8% 0px"
    });

    items.forEach(function (item) {
      observer.observe(item);
    });

    revealVisibleItems();
    window.setTimeout(revealVisibleItems, 160);
    window.setTimeout(revealVisibleItems, 520);
    window.addEventListener("scroll", revealVisibleItems, { passive: true });
    window.addEventListener("resize", revealVisibleItems);
  }

  function formatPhone(value) {
    var digits = value.replace(/\D/g, "").slice(0, 11);

    if (digits.length <= 2) {
      return digits ? "(" + digits : "";
    }

    if (digits.length <= 6) {
      return "(" + digits.slice(0, 2) + ") " + digits.slice(2);
    }

    if (digits.length <= 10) {
      return "(" + digits.slice(0, 2) + ") " + digits.slice(2, 6) + "-" + digits.slice(6);
    }

    return "(" + digits.slice(0, 2) + ") " + digits.slice(2, 7) + "-" + digits.slice(7);
  }

  function setupPhoneMask() {
    document.querySelectorAll("[data-phone]").forEach(function (input) {
      input.addEventListener("input", function () {
        input.value = formatPhone(input.value);
      });
    });
  }

  function openModal(modal) {
    if (!modal) {
      return;
    }

    lastFocusedElement = document.activeElement;
    modal.hidden = false;
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");

    window.requestAnimationFrame(function () {
      modal.classList.add("is-open");
      var closeButton = modal.querySelector("[data-modal-close]");
      if (closeButton) {
        closeButton.focus();
      }
    });
  }

  function closeModal(modal) {
    if (!modal) {
      return;
    }

    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");

    window.setTimeout(function () {
      modal.hidden = true;
      if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
        lastFocusedElement.focus();
      }
    }, prefersReducedMotion ? 0 : 180);
  }

  function setupModal() {
    var modal = document.querySelector("[data-modal]");

    if (!modal) {
      return;
    }

    modal.querySelectorAll("[data-modal-close]").forEach(function (button) {
      button.addEventListener("click", function () {
        closeModal(modal);
      });
    });

    modal.addEventListener("click", function (event) {
      if (event.target === modal) {
        closeModal(modal);
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && !modal.hidden) {
        closeModal(modal);
      }
    });
  }

  function setupLeadForm() {
    var form = document.querySelector("[data-lead-form]");
    var modal = document.querySelector("[data-modal]");

    if (!form) {
      return;
    }

    form.addEventListener("submit", function (event) {
      var submitButton = form.querySelector("button[type='submit']");

      event.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.classList.add("is-loading");
      }

      openModal(modal);

      window.setTimeout(function () {
        form.submit();
      }, 80);

      window.setTimeout(function () {
        form.reset();

        if (submitButton) {
          submitButton.disabled = false;
          submitButton.classList.remove("is-loading");
        }
      }, 700);
    });
  }

  function setupInteractiveCards() {
    if (prefersReducedMotion) {
      return;
    }

    document.querySelectorAll(".service-card, .portfolio-card, .showcase-card, .portfolio-category-card, .delivery-card").forEach(function (card) {
      card.addEventListener("pointermove", function (event) {
        var rect = card.getBoundingClientRect();
        var x = ((event.clientX - rect.left) / rect.width) * 100;
        var y = ((event.clientY - rect.top) / rect.height) * 100;
        card.style.setProperty("--spotlight-x", x + "%");
        card.style.setProperty("--spotlight-y", y + "%");
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.body.classList.add("is-ready");
    createIcons();
    setupReveal();
    setupPhoneMask();
    setupModal();
    setupLeadForm();
    setupInteractiveCards();
    updateHeaderState();
  });

  window.addEventListener("scroll", updateHeaderState, { passive: true });
})();
