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

  function setupPageTransitions() {
    if (prefersReducedMotion) {
      return;
    }

    document.querySelectorAll("a[href]").forEach(function (link) {
      link.addEventListener("click", function (event) {
        var href = link.getAttribute("href");

        if (!href || href.charAt(0) === "#" || link.target || link.hasAttribute("download")) {
          return;
        }

        if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
          return;
        }

        var nextUrl = new URL(link.href, window.location.href);
        var currentUrl = new URL(window.location.href);
        var isExternal = nextUrl.protocol !== currentUrl.protocol || nextUrl.host !== currentUrl.host;
        var isSamePageAnchor = nextUrl.pathname === currentUrl.pathname && nextUrl.hash;

        if (isExternal || isSamePageAnchor || nextUrl.protocol === "tel:" || nextUrl.protocol === "mailto:") {
          return;
        }

        event.preventDefault();
        document.body.classList.add("page-is-leaving");

        window.setTimeout(function () {
          window.location.href = link.href;
        }, 180);
      });
    });
  }

  function setupScrollProgress() {
    var progress = document.createElement("div");
    progress.className = "scroll-progress";
    progress.setAttribute("aria-hidden", "true");

    var progressBar = document.createElement("span");
    progress.appendChild(progressBar);
    document.body.appendChild(progress);

    function updateProgress() {
      var scrollable = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      var percent = Math.min(Math.max(window.scrollY / scrollable, 0), 1) * 100;
      progressBar.style.setProperty("--scroll-progress", percent.toFixed(2) + "%");
    }

    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);
  }

  function setupHeroMotion() {
    if (prefersReducedMotion) {
      return;
    }

    var heroes = document.querySelectorAll(".hero, .portfolio-page-hero");

    if (!heroes.length) {
      return;
    }

    var ticking = false;

    function updateHeroMotion() {
      ticking = false;

      heroes.forEach(function (hero) {
        var rect = hero.getBoundingClientRect();
        var progress = Math.min(Math.max((0 - rect.top) / Math.max(rect.height, 1), 0), 1);
        hero.style.setProperty("--hero-shift", (progress * 34).toFixed(1) + "px");
      });
    }

    function requestUpdate() {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(updateHeroMotion);
      }
    }

    updateHeroMotion();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
  }

  function setupAnchorNavigationState() {
    var links = Array.prototype.slice.call(document.querySelectorAll(".portfolio-nav-grid a[href^='#']"));

    if (!links.length || !("IntersectionObserver" in window)) {
      return;
    }

    var sectionById = {};

    links.forEach(function (link) {
      var id = link.getAttribute("href").slice(1);
      var section = document.getElementById(id);

      if (section) {
        sectionById[id] = section;
      }
    });

    var sections = Object.keys(sectionById).map(function (id) {
      return sectionById[id];
    });

    if (!sections.length) {
      return;
    }

    function setActive(id) {
      links.forEach(function (link) {
        var isActive = link.getAttribute("href") === "#" + id;
        link.classList.toggle("is-active", isActive);

        if (isActive) {
          link.setAttribute("aria-current", "location");
        } else {
          link.removeAttribute("aria-current");
        }
      });
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          setActive(entry.target.id);
        }
      });
    }, {
      threshold: 0.26,
      rootMargin: "-18% 0px -58% 0px"
    });

    sections.forEach(function (section) {
      observer.observe(section);
    });
  }

  function setupReveal() {
    var items = document.querySelectorAll([
      ".hero-content",
      ".hero-feature-list > *",
      ".hero-service-grid > *",
      ".home-signal-grid > *",
      ".home-proof-layout > *",
      ".home-proof-list > *",
      ".section-heading",
      ".service-card",
      ".trust-grid article",
      ".deliverables-layout > *",
      ".deliverables-list > *",
      ".portfolio-card",
      ".process-grid article",
      ".quote-copy",
      ".quote-form",
      ".local-seo-layout > *",
      ".local-search-grid > *",
      ".contact-panel",
      ".contact-layout > div",
      ".portfolio-page-content",
      ".portfolio-nav-grid > *",
      ".feature-media",
      ".feature-layout > div",
      ".portfolio-category-card",
      ".showcase-card",
      ".delivery-card",
      ".portfolio-hero-metrics > *",
      ".portfolio-case-layout > *",
      ".portfolio-case-media > *",
      ".portfolio-proof-card",
      ".portfolio-filter-bar",
      ".portfolio-work-card",
      ".portfolio-roof-layout > *",
      ".portfolio-roof-strip > *",
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

  function setupPortfolioFilters() {
    var filterBar = document.querySelector("[data-portfolio-filters]");
    var items = document.querySelectorAll("[data-portfolio-item]");

    if (!filterBar || !items.length) {
      return;
    }

    filterBar.addEventListener("click", function (event) {
      var button = event.target.closest("[data-filter]");

      if (!button || !filterBar.contains(button)) {
        return;
      }

      var filter = button.getAttribute("data-filter");

      filterBar.querySelectorAll("[data-filter]").forEach(function (filterButton) {
        var isActive = filterButton === button;
        filterButton.classList.toggle("is-active", isActive);
        filterButton.setAttribute("aria-pressed", isActive ? "true" : "false");
      });

      items.forEach(function (item) {
        var categories = (item.getAttribute("data-category") || "").split(/\s+/);
        var shouldShow = filter === "all" || categories.indexOf(filter) !== -1;

        if (shouldShow) {
          item.hidden = false;
          item.classList.remove("is-filtering-out");

          window.requestAnimationFrame(function () {
            item.classList.add("is-visible");
          });
        } else {
          item.classList.add("is-filtering-out");
          item.classList.remove("is-visible");

          window.setTimeout(function () {
            var activeButton = filterBar.querySelector("[data-filter].is-active");
            var activeFilter = activeButton ? activeButton.getAttribute("data-filter") : filter;
            var currentCategories = (item.getAttribute("data-category") || "").split(/\s+/);
            var currentShouldShow = activeFilter === "all" || currentCategories.indexOf(activeFilter) !== -1;

            if (!currentShouldShow) {
              item.hidden = true;
              item.classList.remove("is-filtering-out");
            }
          }, prefersReducedMotion ? 0 : 180);
        }
      });
    });
  }

  function setupCompletePortfolioGallery() {
    var gallery = document.querySelector("[data-complete-gallery]");
    var filterBar = document.querySelector("[data-complete-filters]");
    var visibleCount = document.querySelector("[data-visible-count]");

    if (!gallery || gallery.closest("[hidden]")) {
      return;
    }

    var portfolioItems = [
      { file: "DJI_0340.JPG", category: "contexto", label: "Contexto e fachadas", title: "Implantação e entorno" },
      { file: "DJI_0372.JPG", category: "contexto", label: "Contexto e fachadas", title: "Edificação e cobertura" },
      { file: "DJI_0375.JPG", category: "contexto", label: "Contexto e fachadas", title: "Plano geral de fachada" },
      { file: "DJI_0384.JPG", category: "contexto", label: "Contexto e fachadas", title: "Lateral e afastamento" },
      { file: "DJI_0390.JPG", category: "contexto", label: "Contexto e fachadas", title: "Área entre edificações" },
      { file: "DJI_0398.JPG", category: "contexto", label: "Contexto e fachadas", title: "Encontro entre fachadas" },
      { file: "DJI_0401.JPG", category: "contexto", label: "Contexto e fachadas", title: "Fachada e cobertura vizinha" },
      { file: "DJI_0404.JPG", category: "contexto", label: "Contexto e fachadas", title: "Vista ampla da fachada" },
      { file: "DJI_0412.JPG", category: "coberturas", label: "Coberturas", title: "Cobertura em vista zenital" },
      { file: "DJI_0421.JPG", category: "coberturas", label: "Coberturas", title: "Geometria da cobertura" },
      { file: "DJI_0430.JPG", category: "coberturas", label: "Coberturas", title: "Platibanda e arremate" },
      { file: "DJI_0451.JPG", category: "coberturas", label: "Coberturas", title: "Borda e proteção superior" },
      { file: "DJI_0463.JPG", category: "coberturas", label: "Coberturas", title: "Cobertura metálica e fachada" },
      { file: "DJI_0475.JPG", category: "coberturas", label: "Coberturas", title: "Superfície metálica" },
      { file: "DJI_0480.JPG", category: "coberturas", label: "Coberturas", title: "Caimento e perímetro" },
      { file: "DJI_0491.JPG", category: "coberturas", label: "Coberturas", title: "Vista frontal da cobertura" },
      { file: "DJI_0499.JPG", category: "detalhes", label: "Detalhes técnicos", title: "Chapas e borda lateral" },
      { file: "DJI_0508.JPG", category: "detalhes", label: "Detalhes técnicos", title: "Emendas e arremates" },
      { file: "DJI_0510.JPG", category: "detalhes", label: "Detalhes técnicos", title: "Ponto de ventilação" },
      { file: "DJI_0513.JPG", category: "detalhes", label: "Detalhes técnicos", title: "Equipamentos sobre a cobertura" },
      { file: "DJI_0520.JPG", category: "detalhes", label: "Detalhes técnicos", title: "Encontro entre panos" },
      { file: "DJI_0523.JPG", category: "detalhes", label: "Detalhes técnicos", title: "Extensão e recortes" },
      { file: "DJI_0525.JPG", category: "detalhes", label: "Detalhes técnicos", title: "Cobertura e contexto urbano" },
      { file: "DJI_0536.JPG", category: "detalhes", label: "Detalhes técnicos", title: "Vista geral de encerramento" }
    ];
    var fragments = document.createDocumentFragment();
    var items = [];

    portfolioItems.forEach(function (portfolioItem) {
      var source = "portifolio/" + portfolioItem.file;
      var thumbnail = "assets/portfolio/thumbs/" + portfolioItem.file;
      var button = document.createElement("button");
      var media = document.createElement("span");
      var image = document.createElement("img");
      var body = document.createElement("span");
      var category = document.createElement("small");
      var title = document.createElement("strong");

      button.className = "portfolio-complete-item";
      button.type = "button";
      button.setAttribute("data-complete-item", "");
      button.setAttribute("data-complete-category", portfolioItem.category);
      button.setAttribute("data-gallery-trigger", "");
      button.setAttribute("data-gallery-group", "portfolio-completo");
      button.setAttribute("data-full", source);
      button.setAttribute("data-title", portfolioItem.title);
      button.setAttribute("data-meta", portfolioItem.label + " | " + portfolioItem.file + " | Arquivo original");
      button.setAttribute("aria-label", "Abrir " + portfolioItem.title + " em resolução original");

      media.className = "portfolio-complete-media";
      image.src = thumbnail;
      image.alt = portfolioItem.title;
      image.width = 800;
      image.height = 450;
      image.loading = "lazy";
      image.decoding = "async";

      body.className = "portfolio-complete-body";
      category.textContent = portfolioItem.label;
      title.textContent = portfolioItem.title;

      media.appendChild(image);
      body.appendChild(category);
      body.appendChild(title);
      button.appendChild(media);
      button.appendChild(body);
      fragments.appendChild(button);
      items.push(button);
    });

    gallery.appendChild(fragments);

    document.querySelectorAll("[data-complete-count]").forEach(function (count) {
      count.textContent = String(items.length);
    });

    if (visibleCount) {
      visibleCount.textContent = String(items.length);
    }

    if (!filterBar) {
      return;
    }

    filterBar.addEventListener("click", function (event) {
      var selectedButton = event.target.closest("[data-complete-filter]");

      if (!selectedButton || !filterBar.contains(selectedButton)) {
        return;
      }

      var filter = selectedButton.getAttribute("data-complete-filter");
      var count = 0;

      filterBar.querySelectorAll("[data-complete-filter]").forEach(function (button) {
        var isActive = button === selectedButton;
        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-pressed", isActive ? "true" : "false");
      });

      items.forEach(function (item) {
        var shouldShow = filter === "all" || item.getAttribute("data-complete-category") === filter;
        item.hidden = !shouldShow;

        if (shouldShow) {
          count += 1;
        }
      });

      if (visibleCount) {
        visibleCount.textContent = String(count);
      }
    });
  }

  function setupGalleryTransition() {
    var overlay = document.querySelector("[data-gallery-transition]");
    var links = document.querySelectorAll("[data-gallery-transition-link]");
    var progressValue = overlay && overlay.querySelector("[data-gallery-transition-value]");
    var storageKey = "hero-gallery-transition";
    var arrivalPending = document.documentElement.classList.contains("gallery-transition-pending");
    var navigationTimer = 0;
    var progressFrame = 0;

    if (!overlay) {
      return;
    }

    function setProgress(value) {
      var normalizedValue = Math.round(clampTransitionValue(value));

      overlay.style.setProperty("--gallery-progress", normalizedValue + "%");

      if (progressValue) {
        progressValue.textContent = String(normalizedValue);
      }
    }

    function clampTransitionValue(value) {
      return Math.min(Math.max(value, 0), 100);
    }

    function animateProgress(from, to, duration) {
      var startTime = performance.now();

      window.cancelAnimationFrame(progressFrame);

      function update(currentTime) {
        var elapsed = currentTime - startTime;
        var progress = duration > 0 ? Math.min(elapsed / duration, 1) : 1;
        var easedProgress = 1 - Math.pow(1 - progress, 3);

        setProgress(from + (to - from) * easedProgress);

        if (progress < 1) {
          progressFrame = window.requestAnimationFrame(update);
        }
      }

      progressFrame = window.requestAnimationFrame(update);
    }

    function resetTransition() {
      window.clearTimeout(navigationTimer);
      window.cancelAnimationFrame(progressFrame);
      overlay.hidden = true;
      overlay.setAttribute("aria-hidden", "true");
      overlay.classList.remove("is-active", "is-arriving", "is-complete");
      document.body.classList.remove("gallery-transition-open");
      document.documentElement.classList.remove("gallery-transition-pending");
      setProgress(0);
    }

    function showArrival() {
      var arrivalDuration = prefersReducedMotion ? 180 : 1050;

      try {
        sessionStorage.removeItem(storageKey);
      } catch (error) {}

      overlay.hidden = false;
      overlay.setAttribute("aria-hidden", "false");
      overlay.classList.add("is-active", "is-arriving");
      document.body.classList.add("gallery-transition-open");
      document.documentElement.classList.remove("gallery-transition-pending");
      setProgress(100);

      navigationTimer = window.setTimeout(function () {
        overlay.classList.add("is-complete");
      }, prefersReducedMotion ? 30 : 520);

      window.setTimeout(resetTransition, arrivalDuration);
    }

    function openCompletePortfolio(link) {
      var transitionDuration = prefersReducedMotion ? 220 : 1250;

      try {
        sessionStorage.setItem(storageKey, "pending");
      } catch (error) {}

      overlay.hidden = false;
      overlay.setAttribute("aria-hidden", "false");
      document.body.classList.add("gallery-transition-open");
      setProgress(0);

      window.requestAnimationFrame(function () {
        overlay.classList.add("is-active");
        animateProgress(0, 94, prefersReducedMotion ? 80 : 900);
      });

      navigationTimer = window.setTimeout(function () {
        setProgress(100);
        overlay.classList.add("is-complete");
      }, prefersReducedMotion ? 100 : 980);

      window.setTimeout(function () {
        window.location.assign(link.href);
      }, transitionDuration);
    }

    links.forEach(function (link) {
      link.addEventListener("click", function (event) {
        if (
          event.defaultPrevented
          || event.button !== 0
          || event.metaKey
          || event.ctrlKey
          || event.shiftKey
          || event.altKey
        ) {
          return;
        }

        event.preventDefault();
        openCompletePortfolio(link);
      });
    });

    if (arrivalPending) {
      showArrival();
    }

    window.addEventListener("pageshow", function (event) {
      if (event.persisted && !arrivalPending) {
        resetTransition();
      }
    });
  }

  function setupPortfolioLightbox() {
    var lightbox = document.querySelector("[data-gallery-lightbox]");

    if (!lightbox) {
      return;
    }

    var stage = lightbox.querySelector("[data-lightbox-stage]");
    var image = lightbox.querySelector("[data-lightbox-image]");
    var title = lightbox.querySelector("[data-lightbox-title]");
    var meta = lightbox.querySelector("[data-lightbox-meta]");
    var closeButton = lightbox.querySelector("[data-gallery-close]");
    var zoomInButton = lightbox.querySelector("[data-zoom-in]");
    var zoomOutButton = lightbox.querySelector("[data-zoom-out]");
    var zoomFitButton = lightbox.querySelector("[data-zoom-fit]");
    var zoomResetButton = lightbox.querySelector("[data-zoom-reset]");
    var zoomLevel = lightbox.querySelector("[data-zoom-level]");
    var previousButton = lightbox.querySelector("[data-gallery-prev]");
    var nextButton = lightbox.querySelector("[data-gallery-next]");
    var counter = lightbox.querySelector("[data-lightbox-counter]");
    var fullscreenButton = lightbox.querySelector("[data-lightbox-fullscreen]");
    var downloadLink = lightbox.querySelector("[data-download-image]");
    var dialog = lightbox.querySelector(".portfolio-lightbox-dialog");
    var zoom = 1;
    var panX = 0;
    var panY = 0;
    var isDragging = false;
    var didDrag = false;
    var dragStartX = 0;
    var dragStartY = 0;
    var dragOriginX = 0;
    var dragOriginY = 0;
    var maxZoomLimit = 24;
    var isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
    var isTouchDragging = false;
    var isPinching = false;
    var touchStartX = 0;
    var touchStartY = 0;
    var touchOriginX = 0;
    var touchOriginY = 0;
    var pinchStartDistance = 0;
    var pinchStartZoom = 1;
    var pinchStartPanX = 0;
    var pinchStartPanY = 0;
    var pinchStartAnchorX = 0;
    var pinchStartAnchorY = 0;
    var currentTrigger = null;
    var currentTriggers = [];
    var currentIndex = -1;
    var currentMeta = "";

    function getTriggerImage(trigger) {
      if (trigger.tagName && trigger.tagName.toLowerCase() === "img") {
        return trigger;
      }

      return trigger.querySelector("img");
    }

    function clamp(value, min, max) {
      return Math.min(Math.max(value, min), max);
    }

    function getActualSizeZoom() {
      if (!image || !image.naturalWidth || !image.offsetWidth) {
        return 1;
      }

      return clamp(image.naturalWidth / image.offsetWidth, 1, maxZoomLimit);
    }

    function getMaximumZoom() {
      var maximumZoom = clamp(getActualSizeZoom() * 2.5, 4, maxZoomLimit);

      return isCoarsePointer ? Math.min(maximumZoom, 6) : maximumZoom;
    }

    function getDisplayZoomPercent() {
      return Math.round((zoom / getActualSizeZoom()) * 100);
    }

    function updateImageMeta(baseMeta) {
      if (!meta) {
        return;
      }

      if (!image || !image.naturalWidth || !image.naturalHeight) {
        meta.textContent = baseMeta;
        return;
      }

      meta.textContent = [baseMeta, "Original " + image.naturalWidth + "x" + image.naturalHeight].filter(Boolean).join(" | ");
    }

    function getAvailableTriggers(trigger) {
      var group = trigger.getAttribute("data-gallery-group");
      var selector = group
        ? "[data-gallery-trigger][data-gallery-group='" + group + "']"
        : "[data-gallery-trigger]";

      return Array.prototype.slice.call(document.querySelectorAll(selector)).filter(function (item) {
        return !item.hidden && !item.closest("[hidden]");
      });
    }

    function updateNavigation() {
      var hasMultipleImages = currentTriggers.length > 1;

      if (previousButton) {
        previousButton.hidden = !hasMultipleImages;
      }

      if (nextButton) {
        nextButton.hidden = !hasMultipleImages;
      }

      if (counter) {
        counter.textContent = currentIndex >= 0
          ? (currentIndex + 1) + " / " + currentTriggers.length
          : "";
      }
    }

    function preloadNeighbor(offset) {
      if (currentTriggers.length < 2 || currentIndex < 0) {
        return;
      }

      var neighborIndex = (currentIndex + offset + currentTriggers.length) % currentTriggers.length;
      var neighborSource = currentTriggers[neighborIndex].getAttribute("data-full")
        || currentTriggers[neighborIndex].getAttribute("data-src");

      if (neighborSource) {
        var preloadImage = new Image();
        preloadImage.src = neighborSource;
      }
    }

    function clampPan() {
      if (!stage || !image) {
        return;
      }

      var maxX = Math.max(0, ((image.offsetWidth * zoom) - stage.clientWidth) / 2);
      var maxY = Math.max(0, ((image.offsetHeight * zoom) - stage.clientHeight) / 2);

      panX = clamp(panX, -maxX, maxX);
      panY = clamp(panY, -maxY, maxY);
    }

    function applyImageTransform() {
      if (!image || !stage) {
        return;
      }

      clampPan();
      image.style.setProperty("--zoom", zoom.toFixed(3));
      image.style.setProperty("--pan-x", panX.toFixed(1) + "px");
      image.style.setProperty("--pan-y", panY.toFixed(1) + "px");
      stage.classList.toggle("is-zoomed", zoom > 1.01);

      if (zoomLevel) {
        zoomLevel.textContent = zoom <= 1.01 ? "Ajustado" : getDisplayZoomPercent() + "%";
      }
    }

    function getStageAnchor(clientX, clientY) {
      var rect = stage.getBoundingClientRect();
      var anchorX = typeof clientX === "number" ? clientX - rect.left : rect.width / 2;
      var anchorY = typeof clientY === "number" ? clientY - rect.top : rect.height / 2;

      return {
        x: anchorX - rect.width / 2,
        y: anchorY - rect.height / 2
      };
    }

    function getTouchDistance(firstTouch, secondTouch) {
      return Math.hypot(
        secondTouch.clientX - firstTouch.clientX,
        secondTouch.clientY - firstTouch.clientY
      );
    }

    function getTouchCenter(firstTouch, secondTouch) {
      return {
        x: (firstTouch.clientX + secondTouch.clientX) / 2,
        y: (firstTouch.clientY + secondTouch.clientY) / 2
      };
    }

    function startTouchDrag(touch) {
      if (!touch || zoom <= 1.01) {
        isTouchDragging = false;
        return;
      }

      isTouchDragging = true;
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
      touchOriginX = panX;
      touchOriginY = panY;
      stage.classList.add("is-dragging");
    }

    function stopTouchInteraction() {
      isTouchDragging = false;
      isPinching = false;
      pinchStartDistance = 0;
      stage.classList.remove("is-dragging");
    }

    function setZoom(nextZoom, clientX, clientY) {
      var previousZoom = zoom;
      var targetZoom = clamp(nextZoom, 1, getMaximumZoom());

      if (!stage || !image) {
        zoom = targetZoom;
        return;
      }

      if (targetZoom <= 1.01) {
        zoom = targetZoom;
        panX = 0;
        panY = 0;
        applyImageTransform();
        return;
      }

      var anchor = getStageAnchor(clientX, clientY);
      panX = anchor.x - ((anchor.x - panX) / previousZoom) * targetZoom;
      panY = anchor.y - ((anchor.y - panY) / previousZoom) * targetZoom;
      zoom = targetZoom;
      applyImageTransform();
    }

    function resetImageView() {
      stopTouchInteraction();
      zoom = 1;
      panX = 0;
      panY = 0;
      applyImageTransform();
    }

    function openLightbox(trigger, keepFocusOrigin) {
      var source = trigger.getAttribute("data-full") || trigger.getAttribute("data-src");
      var imageTitle = trigger.getAttribute("data-title") || "";
      var imageMeta = trigger.getAttribute("data-meta") || "";
      var thumb = getTriggerImage(trigger);

      if (!source || !image) {
        return;
      }

      if (!keepFocusOrigin) {
        lastFocusedElement = document.activeElement;
      }

      currentTrigger = trigger;
      currentTriggers = getAvailableTriggers(trigger);
      currentIndex = currentTriggers.indexOf(trigger);
      currentMeta = imageMeta;
      updateNavigation();
      lightbox.classList.add("is-loading");

      image.onload = function () {
        lightbox.classList.remove("is-loading");
        updateImageMeta(currentMeta);
        resetImageView();
        preloadNeighbor(-1);
        preloadNeighbor(1);
      };
      image.onerror = function () {
        lightbox.classList.remove("is-loading");
        if (meta) {
          meta.textContent = "Não foi possível carregar o arquivo original.";
        }
      };

      image.src = source;
      image.alt = thumb ? thumb.alt : imageTitle;
      title.textContent = imageTitle;
      updateImageMeta(imageMeta);
      if (downloadLink) {
        downloadLink.href = source;
        downloadLink.setAttribute("download", source.split("/").pop());
      }
      resetImageView();
      lightbox.hidden = false;
      lightbox.setAttribute("aria-hidden", "false");
      document.body.classList.add("modal-open");

      if (image.complete && image.naturalWidth) {
        lightbox.classList.remove("is-loading");
        updateImageMeta(imageMeta);
        resetImageView();
      }

      window.requestAnimationFrame(function () {
        lightbox.classList.add("is-open");

        if (closeButton) {
          closeButton.focus();
        }
      });
    }

    function showRelativeImage(offset) {
      if (!currentTriggers.length || currentIndex < 0) {
        return;
      }

      var nextIndex = (currentIndex + offset + currentTriggers.length) % currentTriggers.length;
      openLightbox(currentTriggers[nextIndex], true);
    }

    function closeLightbox() {
      lightbox.classList.remove("is-open");
      lightbox.classList.remove("is-loading");
      lightbox.setAttribute("aria-hidden", "true");
      document.body.classList.remove("modal-open");

      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(function () {});
      }

      window.setTimeout(function () {
        lightbox.hidden = true;

        if (image) {
          image.onload = null;
          image.onerror = null;
          image.removeAttribute("src");
          image.alt = "";
        }

        currentTrigger = null;
        currentTriggers = [];
        currentIndex = -1;
        resetImageView();

        if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
          lastFocusedElement.focus();
        }
      }, prefersReducedMotion ? 0 : 180);
    }

    document.querySelectorAll("[data-gallery-trigger]").forEach(function (trigger) {
      trigger.addEventListener("click", function () {
        openLightbox(trigger);
      });

      trigger.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openLightbox(trigger);
        }
      });
    });

    if (closeButton) {
      closeButton.addEventListener("click", closeLightbox);
    }

    if (previousButton) {
      previousButton.addEventListener("click", function () {
        showRelativeImage(-1);
      });
    }

    if (nextButton) {
      nextButton.addEventListener("click", function () {
        showRelativeImage(1);
      });
    }

    if (zoomInButton) {
      zoomInButton.addEventListener("click", function () {
        setZoom(zoom * 1.25);
      });
    }

    if (zoomOutButton) {
      zoomOutButton.addEventListener("click", function () {
        setZoom(zoom / 1.25);
      });
    }

    if (zoomFitButton) {
      zoomFitButton.addEventListener("click", resetImageView);
    }

    if (zoomResetButton) {
      zoomResetButton.addEventListener("click", function () {
        setZoom(getActualSizeZoom());
      });
    }

    if (fullscreenButton && dialog && dialog.requestFullscreen) {
      fullscreenButton.addEventListener("click", function () {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else {
          dialog.requestFullscreen();
        }
      });
    }

    if (stage) {
      stage.addEventListener("wheel", function (event) {
        event.preventDefault();
        setZoom(zoom * (event.deltaY < 0 ? 1.12 : 0.88), event.clientX, event.clientY);
      }, { passive: false });

      stage.addEventListener("touchstart", function (event) {
        if (event.touches.length >= 2) {
          var firstTouch = event.touches[0];
          var secondTouch = event.touches[1];
          var center = getTouchCenter(firstTouch, secondTouch);
          var anchor = getStageAnchor(center.x, center.y);

          event.preventDefault();
          isPinching = true;
          isTouchDragging = false;
          didDrag = true;
          pinchStartDistance = Math.max(getTouchDistance(firstTouch, secondTouch), 1);
          pinchStartZoom = zoom;
          pinchStartPanX = panX;
          pinchStartPanY = panY;
          pinchStartAnchorX = anchor.x;
          pinchStartAnchorY = anchor.y;
          stage.classList.add("is-dragging");
          return;
        }

        if (event.touches.length === 1) {
          startTouchDrag(event.touches[0]);
        }
      }, { passive: false });

      stage.addEventListener("touchmove", function (event) {
        if (isPinching && event.touches.length >= 2) {
          var firstTouch = event.touches[0];
          var secondTouch = event.touches[1];
          var center = getTouchCenter(firstTouch, secondTouch);
          var anchor = getStageAnchor(center.x, center.y);
          var distance = getTouchDistance(firstTouch, secondTouch);
          var targetZoom = clamp(
            pinchStartZoom * (distance / pinchStartDistance),
            1,
            getMaximumZoom()
          );

          event.preventDefault();
          zoom = targetZoom;

          if (targetZoom <= 1.01) {
            panX = 0;
            panY = 0;
          } else {
            panX = anchor.x - ((pinchStartAnchorX - pinchStartPanX) / pinchStartZoom) * targetZoom;
            panY = anchor.y - ((pinchStartAnchorY - pinchStartPanY) / pinchStartZoom) * targetZoom;
          }

          applyImageTransform();
          return;
        }

        if (isTouchDragging && event.touches.length === 1) {
          var touch = event.touches[0];

          event.preventDefault();
          panX = touchOriginX + touch.clientX - touchStartX;
          panY = touchOriginY + touch.clientY - touchStartY;
          didDrag = didDrag
            || Math.abs(touch.clientX - touchStartX) > 4
            || Math.abs(touch.clientY - touchStartY) > 4;
          applyImageTransform();
        }
      }, { passive: false });

      stage.addEventListener("touchend", function (event) {
        if (isPinching && event.touches.length === 1) {
          isPinching = false;
          pinchStartDistance = 0;
          startTouchDrag(event.touches[0]);
          return;
        }

        if (!event.touches.length) {
          stopTouchInteraction();
        }
      }, { passive: false });

      stage.addEventListener("touchcancel", stopTouchInteraction, { passive: true });

      stage.addEventListener("pointerdown", function (event) {
        if (event.pointerType === "touch") {
          return;
        }

        if (zoom <= 1.01 || (typeof event.button === "number" && event.button !== 0)) {
          return;
        }

        event.preventDefault();
        isDragging = true;
        didDrag = false;
        dragStartX = event.clientX;
        dragStartY = event.clientY;
        dragOriginX = panX;
        dragOriginY = panY;
        stage.classList.add("is-dragging");
        stage.setPointerCapture(event.pointerId);
      });

      stage.addEventListener("pointermove", function (event) {
        if (event.pointerType === "touch") {
          return;
        }

        if (!isDragging) {
          return;
        }

        event.preventDefault();
        panX = dragOriginX + event.clientX - dragStartX;
        panY = dragOriginY + event.clientY - dragStartY;
        didDrag = didDrag || Math.abs(event.clientX - dragStartX) > 4 || Math.abs(event.clientY - dragStartY) > 4;
        applyImageTransform();
      });

      stage.addEventListener("dblclick", function (event) {
        event.preventDefault();
        setZoom(
          isCoarsePointer
            ? (zoom > 1.01 ? 1 : 2)
            : (zoom > 1.01 ? zoom * 1.5 : getActualSizeZoom() * 1.5),
          event.clientX,
          event.clientY
        );
      });

      stage.addEventListener("click", function (event) {
        if (didDrag) {
          didDrag = false;
          return;
        }

        if (!isCoarsePointer && zoom <= 1.01) {
          setZoom(getActualSizeZoom(), event.clientX, event.clientY);
        }
      });

      ["pointerup", "pointercancel", "lostpointercapture"].forEach(function (eventName) {
        stage.addEventListener(eventName, function (event) {
          if (event.pointerType === "touch") {
            return;
          }

          isDragging = false;
          stage.classList.remove("is-dragging");
        });
      });
    }

    lightbox.addEventListener("click", function (event) {
      if (event.target === lightbox) {
        closeLightbox();
      }
    });

    document.addEventListener("keydown", function (event) {
      if (lightbox.hidden) {
        return;
      }

      if (event.key === "Escape") {
        closeLightbox();
      } else if (event.key === "+" || event.key === "=") {
        setZoom(zoom * 1.25);
      } else if (event.key === "-") {
        setZoom(zoom / 1.25);
      } else if (event.key === "0") {
        resetImageView();
      } else if (event.key === "1") {
        setZoom(getActualSizeZoom());
      } else if (event.key === "ArrowLeft") {
        showRelativeImage(-1);
      } else if (event.key === "ArrowRight") {
        showRelativeImage(1);
      }
    });

    window.addEventListener("resize", function () {
      if (!lightbox.hidden) {
        applyImageTransform();
      }
    });
  }

  function setupInteractiveCards() {
    if (prefersReducedMotion) {
      return;
    }

    document.querySelectorAll(".hero-service-grid a, .home-proof-list span, .service-card, .trust-grid article, .portfolio-card, .showcase-card, .portfolio-category-card, .delivery-card, .portfolio-proof-card, .portfolio-work-card").forEach(function (card) {
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
    setupCompletePortfolioGallery();
    setupGalleryTransition();
    createIcons();
    setupAnchorNavigationState();
    setupPhoneMask();
    setupModal();
    setupLeadForm();
    setupPortfolioFilters();
    setupPortfolioLightbox();
    updateHeaderState();
  });

  window.addEventListener("scroll", updateHeaderState, { passive: true });
})();
