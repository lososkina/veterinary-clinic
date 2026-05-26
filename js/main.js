(function () {
  /* Анимация линий у слайдера */
  document.querySelectorAll(".slider-line__path").forEach((path) => {
    const length = Math.ceil(path.getTotalLength());
    path.style.setProperty("--line-length", length);
    path.style.strokeDasharray = `${length}`;
  });

  /* Бургер-меню */
  const burger = document.querySelector(".burger");
  const mobileMenu = document.querySelector(".mobile-menu");
  const mobileLinks = document.querySelectorAll(".mobile-menu a, .mobile-menu button");
  const header = document.querySelector("header");

  function closeMenu() {
    burger?.classList.remove("is-active");
    mobileMenu?.classList.remove("is-open");
    document.body.classList.remove("menu-open");
    burger?.setAttribute("aria-expanded", "false");
  }

  function openMenu() {
    burger?.classList.add("is-active");
    mobileMenu?.classList.add("is-open");
    document.body.classList.add("menu-open");
    burger?.setAttribute("aria-expanded", "true");
  }

  burger?.addEventListener("click", () => {
    if (mobileMenu?.classList.contains("is-open")) closeMenu();
    else openMenu();
  });

  mobileMenu?.addEventListener("click", (e) => {
    if (e.target === mobileMenu) closeMenu();
  });

  mobileLinks.forEach((link) => link.addEventListener("click", closeMenu));

  window.addEventListener("scroll", () => {
    header?.classList.toggle("is-scrolled", window.scrollY > 20);
  });

  /* Модальные окна */
  const modals = {
    callback: document.getElementById("modal-callback"),
    appointment: document.getElementById("modal-appointment"),
  };
  const appointmentSelect = document.getElementById("appointment-service");
  let activeModal = null;

  function openModal(name, options = {}) {
    const modal = modals[name];
    if (!modal) return;

    if (options.serviceId && appointmentSelect) {
      appointmentSelect.value = options.serviceId;
    }

    closeMenu();
    activeModal = modal;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");

    const focusable = modal.querySelector("input, select, textarea, button");
    focusable?.focus();
  }

  function closeModal() {
    if (!activeModal) return;
    activeModal.classList.remove("is-open");
    activeModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    activeModal = null;
  }

  document.querySelectorAll("[data-open-modal]").forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const name = trigger.getAttribute("data-open-modal");
      const serviceId = trigger.getAttribute("data-service-preset");
      openModal(name, { serviceId });
    });
  });

  document.querySelectorAll("[data-modal-close]").forEach((el) => {
    el.addEventListener("click", closeModal);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeModal();
      closeMenu();
    }
  });

  document.querySelectorAll(".modal-form").forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const existing = form.querySelector(".form-success");
      existing?.remove();

      const notice = document.createElement("p");
      notice.className = "form-success";
      notice.textContent =
        form.dataset.form === "callback"
          ? "Спасибо! Мы перезвоним вам в ближайшее время."
          : "Заявка отправлена! Мы свяжемся с вами по email.";
      form.appendChild(notice);
      form.reset();

      setTimeout(() => {
        notice.remove();
        closeModal();
      }, 2200);
    });
  });

  /* Услуги */
  const serviceItems = document.querySelectorAll(".service-item");
  const serviceImg = document.getElementById("service-banner-img");
  const serviceTitle = document.getElementById("service-detail-title");
  const serviceDesc = document.getElementById("service-detail-desc");
  const serviceImageWrap = document.querySelector(".service-detail__image");
  const serviceBookBtn = document.querySelector(
    ".service-detail [data-open-modal='appointment']"
  );

  function selectService(item) {
    serviceItems.forEach((el) => {
      const active = el === item;
      el.classList.toggle("is-active", active);
      el.setAttribute("aria-selected", active ? "true" : "false");
    });

    const title = item.dataset.serviceTitle;
    const desc = item.dataset.serviceDesc;
    const image = item.dataset.serviceImage;
    const id = item.dataset.serviceId;

    if (serviceTitle) serviceTitle.textContent = title;
    if (serviceDesc) serviceDesc.textContent = desc;
    if (serviceBookBtn) {
      serviceBookBtn.setAttribute("data-service-preset", id);
    }

    const finishImageChange = () => {
      serviceImageWrap?.classList.remove("is-changing");
    };

    if (serviceImg && image) {
      serviceImageWrap?.classList.add("is-changing");
      const preload = new Image();
      preload.onload = () => {
        serviceImg.src = image;
        serviceImg.alt = title;
        finishImageChange();
      };
      preload.onerror = () => {
        serviceImg.src = image;
        serviceImg.alt = title;
        finishImageChange();
      };
      preload.src = image;
    }
  }

  serviceItems.forEach((item) => {
    item.addEventListener("click", () => selectService(item));
  });

  /* Слайдер */
  const slider = document.querySelector("[data-slider]");
  if (slider) {
    const track = slider.querySelector(".slider__track");
    const slides = slider.querySelectorAll(".slider__slide");
    const dotsContainer = slider.querySelector(".slider__nav");
    const prevBtn = slider.querySelector("[data-slider-prev]");
    const nextBtn = slider.querySelector("[data-slider-next]");
    let index = 0;
    let autoplayTimer;

    slides.forEach((_, i) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "slider__dot" + (i === 0 ? " is-active" : "");
      dot.setAttribute("aria-label", `Слайд ${i + 1}`);
      dot.addEventListener("click", () => goTo(i));
      dotsContainer?.appendChild(dot);
    });

    const dots = dotsContainer?.querySelectorAll(".slider__dot");

    function goTo(i) {
      index = (i + slides.length) % slides.length;
      track.style.transform = `translateX(-${index * 100}%)`;
      dots?.forEach((dot, j) => dot.classList.toggle("is-active", j === index));
      resetAutoplay();
    }

    function next() {
      goTo(index + 1);
    }

    function prev() {
      goTo(index - 1);
    }

    function resetAutoplay() {
      clearInterval(autoplayTimer);
      autoplayTimer = setInterval(next, 5000);
    }

    prevBtn?.addEventListener("click", prev);
    nextBtn?.addEventListener("click", next);

    let touchStartX = 0;
    slider.addEventListener(
      "touchstart",
      (e) => {
        touchStartX = e.changedTouches[0].screenX;
      },
      { passive: true }
    );

    slider.addEventListener(
      "touchend",
      (e) => {
        const diff = e.changedTouches[0].screenX - touchStartX;
        if (Math.abs(diff) > 50) {
          diff < 0 ? next() : prev();
        }
      },
      { passive: true }
    );

    resetAutoplay();
  }
})();
