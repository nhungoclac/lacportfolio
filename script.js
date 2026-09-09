// script.js - Portfolio Ver 2 Interactive Engine

function initPortfolioEngine() {
  // 1. Kéo chuột cho carousel ảnh
  const carousels = document.querySelectorAll(".work-samples");
  carousels.forEach((carousel) => {
    let isDown = false;
    let startX;
    let scrollLeft;

    carousel.addEventListener("mousedown", (e) => {
      isDown = true;
      startX = e.pageX - carousel.offsetLeft;
      scrollLeft = carousel.scrollLeft;
      carousel.style.cursor = "grabbing";
      e.preventDefault();
    });

    carousel.addEventListener("mouseleave", () => {
      isDown = false;
      carousel.style.cursor = "grab";
    });

    carousel.addEventListener("mouseup", () => {
      isDown = false;
      carousel.style.cursor = "grab";
    });

    carousel.addEventListener("mousemove", (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - carousel.offsetLeft;
      const walk = (x - startX) * 1.5;
      carousel.scrollLeft = scrollLeft - walk;
    });
  });

  initImageLightbox();
  initMobileNav();
  initCampaignTabs();
  initBackToTop();
  initProjectDetailPage();
  initLocketGalleries();
  initBriefSliders();
  initCaptionFormatter();
  adjustVideoAspectRatios();
  initRealtimeClock();
  initCounterAnimation();
}

function initCounterAnimation() {
  const counters = document.querySelectorAll(".dash-num[data-target]");
  if (!counters.length) return;

  function formatNumber(num) {
    // Format with dots as thousand separators (Vietnamese style)
    return num.toLocaleString("de-DE"); // de-DE uses dots as thousand separator
  }

  function animateCounter(el) {
    if (el.dataset.animated) return; // Run only once
    el.dataset.animated = "true";

    const target = parseInt(el.dataset.target, 10);
    const suffix = el.dataset.suffix || "";
    const duration = 1800; // ms
    const startTime = performance.now();

    function easeOutQuart(t) {
      return 1 - Math.pow(1 - t, 4);
    }

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutQuart(progress);
      const current = Math.floor(eased * target);
      el.textContent = formatNumber(current) + suffix;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = formatNumber(target) + suffix;
      }
    }

    requestAnimationFrame(update);
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
        }
      });
    },
    { threshold: 0.4 }
  );

  counters.forEach((counter) => observer.observe(counter));
}

function initRealtimeClock() {
  const clockElem = document.getElementById("clock-time");
  if (!clockElem) return;

  function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    clockElem.textContent = `${hours}:${minutes}:${seconds}`;
  }

  updateClock();
  setInterval(updateClock, 1000);
}

function adjustVideoAspectRatios() {
  document.querySelectorAll(".reel-embed").forEach((embed) => {
    const iframe = embed.querySelector("iframe");
    if (!iframe) return;

    let width = parseFloat(iframe.getAttribute("width"));
    let height = parseFloat(iframe.getAttribute("height"));

    const src = iframe.getAttribute("src") || "";
    const widthMatch = src.match(/[?&]width=(\d+)/);
    const heightMatch = src.match(/[?&]height=(\d+)/);
    if (widthMatch && heightMatch) {
      width = parseFloat(widthMatch[1]);
      height = parseFloat(heightMatch[1]);
    }

    if (width && height && height > 0) {
      embed.style.aspectRatio = `${width} / ${height}`;
      embed.style.width = "100%";
      embed.style.height = "auto";
      const isVertical = width < height;
      const targetW = isVertical ? 205 : 265;
      const card = embed.closest(".reel-card");
      if (card && !card.classList.contains("landscape-card")) {
        card.style.width = `${targetW}px`;
      }
    }
  });
}

function formatCaptionHTML(text) {
  if (!text) return "";
  return text.replace(
    /\s*(\([^)]*?(?:lượt xem|views|người xem|lượt tiếp cận|tương tác)[^)]*?\))/gi,
    (match, inner) => {
      return `<span class="caption-highlight-view">${inner}</span>`;
    },
  );
}

function initCaptionFormatter() {
  const elements = document.querySelectorAll(
    ".meme-caption p, .reel-caption, .work-sample-item span",
  );
  elements.forEach((el) => {
    if (el.dataset.captionFormatted) return;
    if (
      /\([^)]*?(?:lượt xem|views|người xem|lượt tiếp cận|tương tác)[^)]*?\)/i.test(
        el.innerHTML,
      )
    ) {
      el.innerHTML = formatCaptionHTML(el.innerHTML);
      el.dataset.captionFormatted = "true";
    }
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initPortfolioEngine);
} else {
  initPortfolioEngine();
}

// 2. Xử lý Locket Gallery trên các khung ảnh
function initLocketGalleries() {
  document.querySelectorAll(".locket-gallery").forEach((gallery) => {
    if (gallery.dataset.locketInitialized === "true") return;
    gallery.dataset.locketInitialized = "true";

    const items = gallery.querySelectorAll(".gallery-item");
    const counter = gallery.querySelector(".gallery-counter");
    let prevBtn = gallery.querySelector(".prev-btn");
    let nextBtn = gallery.querySelector(".next-btn");

    if (items.length <= 1) {
      if (prevBtn) prevBtn.style.display = "none";
      if (nextBtn) nextBtn.style.display = "none";
      if (counter) counter.style.display = "none";
      return;
    }

    if (counter) {
      counter.textContent = `1/${items.length}`;
    }

    if (!prevBtn) {
      prevBtn = document.createElement("button");
      prevBtn.className = "slider-arrow prev-btn";
      prevBtn.setAttribute("aria-label", "Ảnh trước");
      prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
      gallery.appendChild(prevBtn);
    }

    if (!nextBtn) {
      nextBtn = document.createElement("button");
      nextBtn.className = "slider-arrow next-btn";
      nextBtn.setAttribute("aria-label", "Ảnh kế");
      nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
      gallery.appendChild(nextBtn);
    }

    let currentIndex = 0;
    items.forEach((item, index) => {
      item.classList.remove("slide-down", "next-ready", "showing", "active");
      item.style.zIndex = index === 0 ? 2 : 1;
      if (index === 0) item.classList.add("active");
    });

    function nextSlide() {
      const currentItem = items[currentIndex];
      currentIndex = (currentIndex + 1) % items.length;
      const nextItem = items[currentIndex];

      items.forEach((item) => {
        item.classList.remove("slide-down", "next-ready", "showing", "active");
        item.style.zIndex = 1;
      });

      currentItem.style.zIndex = 1;
      currentItem.classList.add("slide-down");

      nextItem.style.zIndex = 3;
      nextItem.classList.add("next-ready", "active");

      requestAnimationFrame(() => {
        nextItem.classList.add("showing");
      });

      if (counter) counter.textContent = `${currentIndex + 1}/${items.length}`;
    }

    function prevSlide() {
      const currentItem = items[currentIndex];
      currentIndex = (currentIndex - 1 + items.length) % items.length;
      const prevItem = items[currentIndex];

      items.forEach((item) => {
        item.classList.remove("slide-down", "next-ready", "showing", "active");
        item.style.zIndex = 1;
      });

      currentItem.style.zIndex = 1;

      prevItem.style.zIndex = 3;
      prevItem.classList.add("next-ready", "showing", "active");

      if (counter) counter.textContent = `${currentIndex + 1}/${items.length}`;
    }

    nextBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      nextSlide();
    });

    prevBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      prevSlide();
    });
  });
}

// Xử lý slider ảnh cho trang Brief & Sản phẩm (.brief-slider)
function initBriefSliders() {
  document.querySelectorAll(".brief-slider").forEach((slider) => {
    const slides = slider.querySelectorAll(".slide-item");
    const prevBtn = slider.querySelector(".prev-btn");
    const nextBtn = slider.querySelector(".next-btn");
    const counter = slider.querySelector(".slider-counter");

    if (slides.length <= 1) {
      if (prevBtn) prevBtn.style.display = "none";
      if (nextBtn) nextBtn.style.display = "none";
      if (counter) counter.style.display = "none";
      return;
    }

    let currentIndex = 0;

    function showSlide(index) {
      slides.forEach((slide, i) => {
        if (i === index) {
          slide.classList.add("active");
        } else {
          slide.classList.remove("active");
        }
      });
      if (counter) {
        counter.style.display = "block";
        counter.textContent = `${index + 1}/${slides.length}`;
      }
    }

    showSlide(0);

    if (prevBtn) {
      prevBtn.style.display = "flex";
      prevBtn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        currentIndex = (currentIndex - 1 + slides.length) % slides.length;
        showSlide(currentIndex);
      });
    }

    if (nextBtn) {
      nextBtn.style.display = "flex";
      nextBtn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        currentIndex = (currentIndex + 1) % slides.length;
        showSlide(currentIndex);
      });
    }
  });
}

// 3. Trình xem ảnh toàn màn hình (Full-screen Lightbox Engine)
function initImageLightbox() {
  let lightbox = document.getElementById("image-lightbox");
  if (!lightbox) {
    lightbox = document.createElement("div");
    lightbox.id = "image-lightbox";
    lightbox.innerHTML = `
      <button class="lightbox-close" aria-label="Đóng"><i class="fas fa-xmark"></i></button>
      <button class="lightbox-nav lightbox-prev" aria-label="Ảnh trước"><i class="fas fa-chevron-left"></i></button>
      <button class="lightbox-nav lightbox-next" aria-label="Ảnh tiếp"><i class="fas fa-chevron-right"></i></button>
      <img class="lightbox-content" src="" alt="Xem ảnh phóng to" />
      <div class="lightbox-counter">1/1</div>
    `;
    document.body.appendChild(lightbox);
  }

  const lightboxImg = lightbox.querySelector(".lightbox-content");
  const closeBtn = lightbox.querySelector(".lightbox-close");
  const prevBtn = lightbox.querySelector(".lightbox-prev");
  const nextBtn = lightbox.querySelector(".lightbox-next");
  const counter = lightbox.querySelector(".lightbox-counter");

  let currentGallery = [];
  let currentIndex = 0;
  let activeSliderSyncFn = null;

  function updateLightboxImage() {
    if (!currentGallery || currentGallery.length === 0) return;
    lightboxImg.src = currentGallery[currentIndex];
    counter.textContent = `${currentIndex + 1}/${currentGallery.length}`;

    if (currentGallery.length > 1) {
      prevBtn.style.display = "flex";
      nextBtn.style.display = "flex";
      counter.style.display = "block";
    } else {
      prevBtn.style.display = "none";
      nextBtn.style.display = "none";
      counter.style.display = "none";
    }

    if (activeSliderSyncFn) {
      activeSliderSyncFn(currentIndex);
    }
  }

  function openLightbox(gallery, index, syncFn) {
    currentGallery = gallery;
    currentIndex = index;
    activeSliderSyncFn = syncFn || null;
    updateLightboxImage();
    lightbox.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    lightbox.classList.remove("active");
    document.body.style.overflow = "";
  }

  function showPrev() {
    if (currentGallery.length <= 1) return;
    currentIndex =
      (currentIndex - 1 + currentGallery.length) % currentGallery.length;
    updateLightboxImage();
  }

  function showNext() {
    if (currentGallery.length <= 1) return;
    currentIndex = (currentIndex + 1) % currentGallery.length;
    updateLightboxImage();
  }

  document.addEventListener("click", function (e) {
    const img = e.target.closest(
      ".brief-img-wrapper img, .slide-item img, .gallery-item img, .zoomable-img, .work-sample-item img, .ai-project-img-wrapper img, .campaign-thumb-wrapper img",
    );
    if (!img || !img.src) return;
    if (img.closest("a[href]")) return;

    // Ảnh thuộc trang AI Automation
    const aiProjects = img.closest(".ai-projects-list");
    if (aiProjects) {
      const aiImgs = Array.from(
        aiProjects.querySelectorAll(".ai-project-img-wrapper img"),
      );
      const gallerySrcs = aiImgs.map((i) => i.src);
      const clickedIdx = aiImgs.indexOf(img);
      openLightbox(gallerySrcs, clickedIdx >= 0 ? clickedIdx : 0, null);
      return;
    }

    // Ảnh thuộc work-samples trên trang chủ
    const workSamples = img.closest(".work-samples");
    if (workSamples) {
      e.preventDefault();
      e.stopPropagation();
      const sampleImgs = Array.from(
        workSamples.querySelectorAll(".work-sample-item img"),
      );
      const gallerySrcs = sampleImgs.map((i) => i.src);
      const clickedIdx = sampleImgs.indexOf(img);
      openLightbox(gallerySrcs, clickedIdx >= 0 ? clickedIdx : 0, null);
      return;
    }

    const workSampleItem = img.closest(".work-sample-item");
    if (workSampleItem) {
      e.preventDefault();
      e.stopPropagation();
      openLightbox([img.src], 0, null);
      return;
    }

    const locket = img.closest(".locket-gallery");
    if (locket) {
      const locketImgs = Array.from(
        locket.querySelectorAll(".gallery-item img"),
      );
      const gallerySrcs = locketImgs.map((i) => i.src);
      const activeItem = locket.querySelector(".gallery-item.active");
      const activeImg = activeItem ? activeItem.querySelector("img") : null;
      let clickedIdx = locketImgs.indexOf(img);
      if (activeImg && locketImgs.includes(activeImg)) {
        clickedIdx = locketImgs.indexOf(activeImg);
      }
      openLightbox(gallerySrcs, clickedIdx >= 0 ? clickedIdx : 0, null);
      return;
    }

    const slider = img.closest(".brief-slider");
    if (slider) {
      const slideImgs = Array.from(slider.querySelectorAll(".slide-item img"));
      const gallerySrcs = slideImgs.map((i) => i.src);
      const clickedIdx = slideImgs.indexOf(img);

      const syncFn = (idx) => {
        const slides = slider.querySelectorAll(".slide-item");
        const cardCounter = slider.querySelector(".slider-counter");
        slides.forEach((s, i) => {
          if (i === idx) s.classList.add("active");
          else s.classList.remove("active");
        });
        if (cardCounter)
          cardCounter.textContent = `${idx + 1}/${slides.length}`;
      };

      openLightbox(gallerySrcs, clickedIdx >= 0 ? clickedIdx : 0, syncFn);
      return;
    }

    openLightbox([img.src], 0, null);
  });

  prevBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    showPrev();
  });
  nextBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    showNext();
  });
  closeBtn.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", function (e) {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener("keydown", function (e) {
    if (!lightbox.classList.contains("active")) return;
    if (e.key === "Escape") closeLightbox();
    else if (e.key === "ArrowLeft") showPrev();
    else if (e.key === "ArrowRight") showNext();
  });
}

// 4. Hamburger Menu (Nút 3 Gạch Responsive Nav)
function initMobileNav() {
  const navToggle = document.getElementById("navToggle");
  const navBar = document.getElementById("navBar");

  if (navToggle && navBar) {
    navToggle.addEventListener("click", function (e) {
      e.stopPropagation();
      navBar.classList.toggle("active");
      const icon = navToggle.querySelector("i");
      if (icon) {
        if (navBar.classList.contains("active")) {
          icon.classList.remove("fa-bars");
          icon.classList.add("fa-xmark");
        } else {
          icon.classList.remove("fa-xmark");
          icon.classList.add("fa-bars");
        }
      }
    });

    document.addEventListener("click", function (e) {
      if (!navBar.contains(e.target) && !navToggle.contains(e.target)) {
        if (navBar.classList.contains("active")) {
          navBar.classList.remove("active");
          const icon = navToggle.querySelector("i");
          if (icon) {
            icon.classList.remove("fa-xmark");
            icon.classList.add("fa-bars");
          }
        }
      }
    });

    navBar.querySelectorAll(".nav-link").forEach((link) => {
      link.addEventListener("click", () => {
        navBar.classList.remove("active");
        const icon = navToggle.querySelector("i");
        if (icon) {
          icon.classList.remove("fa-xmark");
          icon.classList.add("fa-bars");
        }
      });
    });
  }
}

// 5. Interactive Campaign Accordion / Tab Switcher
function initCampaignTabs() {
  const campaignHeaders = document.querySelectorAll(
    ".campaign-header-row, .campaign-title, .campaign-expand-btn",
  );
  campaignHeaders.forEach((elem) => {
    elem.style.cursor = "pointer";
    elem.addEventListener("click", function (e) {
      if (e.target.tagName === "A" || e.target.closest("a")) return;
      const card = elem.closest(".campaign-card");
      if (!card) return;
      const details = card.querySelector(".campaign-detail-content");
      const btn = card.querySelector(".campaign-expand-btn");
      if (details) {
        details.classList.toggle("active");
        if (btn) {
          if (details.classList.contains("active")) {
            btn.innerHTML =
              '<i class="fas fa-chevron-up"></i> Thu gọn chi tiết';
          } else {
            btn.innerHTML =
              '<i class="fas fa-folder-open"></i> Xem trọn bộ sản phẩm & số liệu';
          }
        }
      }
    });
  });
}

// 6. Back To Top Button Engine (Khôi phục chuẩn theo lacngocnhu/index.html)
function initBackToTop() {
  let btn =
    document.getElementById("back-to-top") ||
    document.getElementById("backToTop");
  if (!btn) {
    btn = document.createElement("button");
    btn.id = "back-to-top";
    btn.className = "back-to-top hidden";
    btn.setAttribute("aria-label", "Trở về đầu trang");
    btn.innerHTML = '<i class="fas fa-arrow-up"></i>';
    document.body.appendChild(btn);
  }

  function checkScroll() {
    if (window.scrollY > 300) {
      btn.classList.remove("hidden");
    } else {
      btn.classList.add("hidden");
    }
  }

  window.addEventListener("scroll", checkScroll, { passive: true });

  btn.addEventListener("click", function (e) {
    if (e) e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });

  checkScroll();
}

// 7. Project Detail Page Dynamic Renderer
const PROJECTS_DATA = {
  "camp-90ntc": {
    "badge": "<i class=\"fas fa-bullhorn\"></i> Droppii",
    "title": "Hỗ trợ 90 Ngày Tốc Chiến ",
    "date": "05/2026 - 07/2026",
    "tagline": "Chiến dịch thúc đẩy bán hàng kéo dài 3 tháng của Droppii, với NutriBest Health là nhà tài trợ độc quyền, đồng hành qua các hoạt động marketing, ưu đãi và tương tác cùng đối tác.",
    "problem": "Làm thế nào để duy trì động lực bán hàng của đối tác trong 90 ngày và đưa NutriBest Health trở thành thương hiệu nổi bật trong chiến dịch?",
    "strategy": "Tạo phần thưởng vinh danh + Truyền thông hình ảnh chuyên nghiệp + Video Reels tạo hiệu ứng lan tỏa động lực thi đua.",
    "execution": "Đóng góp >50 bài viết Social, viết Brief thiết kế hình ảnh, viết Script video.",
    "sheet": "https://docs.google.com/spreadsheets/d/1jtHNT5MBwXDn8rI5jFE23ED71amE9yzcmgZ52xqtvKw/edit?gid=973473861#gid=973473861",
    "sheetLabel": "Google Sheet bài đăng",
    "featuredPosts": [
      {
        "caption": "Caption cho clip quảng bá NutriBest Health (160.000 lượt xem)",
        "imgs": [
          "photo/thumb_bai_noi_bat_1.png",
          "photo/90NTC/pdpvideo.png",
          "photo/90NTC/pdpvideo-meta.png"
        ]
      },
      {
        "caption": "Caption cho Sales Event - Ngày hội NutriBest Health 20/6 (63.000 lượt xem)",
        "imgs": [
          "photo/thumb_bai_noi_bat_2.png",
          "photo/90NTC/2006.png",
          "photo/90NTC/2006-meta.png"
        ]
      },
      {
        "caption": "Caption cho Minigame Ngày hội NutriBest Health 23/5 (28.000 lượt xem)",
        "imgs": [
          "photo/thumb_bai_noi_bat_3.png",
          "photo/90NTC/minigame.png",
          "photo/90NTC/minigame-meta.png"
        ]
      },
      {
        "caption": "Caption cho bài Nhìn lại 90 Ngày Tốc Chiến 2026 (2.400 lượt xem)",
        "imgs": [
          "photo/thumb_bai_noi_bat_4.png",
          "photo/90NTC/nhinlai.png",
          "photo/90NTC/nhinlai-meta.png"
        ]
      }
    ],
    "briefToOutput": [
      {
        "title": "Bài branding cho Nhà tài trợ độc quyền NutriBest Health (1)",
        "link": "https://www.facebook.com/share/p/1JapKjw8bA/",
        "briefImgs": [
          "photo/90NTC/branding1.png",
          "photo/90NTC/branding12.png"
        ],
        "resultImgs": [
          "photo/90NTC/branding1-meta.png",
          "photo/90NTC/branding1-meta1.png",
          "photo/90NTC/branding1-meta2.png"
        ],
        "note": "Bài viết nằm trong chiến dịch 90 Ngày Tốc Chiến 2026",
        "views": "> 3.000",
        "reach": "> 1.500",
        "thumb": "photo/thumb_branding_1.png"
      },
      {
        "title": "Bài branding cho Nhà tài trợ độc quyền NutriBest Health (2)",
        "link": "https://www.facebook.com/share/p/1DMgtAf6i3/",
        "briefImgs": [
          "photo/90NTC/branding2-brief.png",
          "photo/90NTC/branding2-brief1.png",
          "photo/90NTC/branding2-brief2.png",
          "photo/90NTC/branding2-brief3.png"
        ],
        "resultImgs": [
          "photo/90NTC/branding2.png",
          "photo/90NTC/branding21.png",
          "photo/90NTC/branding2-meta.png"
        ],
        "note": "Bài viết nằm trong chiến dịch 90 Ngày Tốc Chiến 2026",
        "views": "> 2.700",
        "reach": "> 1.300",
        "thumb": "photo/thumb_branding_2.png"
      },
      {
        "title": "Bài branding cho Nhà tài trợ độc quyền NutriBest Health (3)",
        "link": "https://www.facebook.com/share/p/1b5tBqBDZW/",
        "thumb": "photo/thumb_branding_3.png",
        "briefImgs": [
          "photo/thumb/test.jpg",
          "photo/brief-brand.png",
          "photo/brief-brand01.png"
        ],
        "resultImgs": [
          "photo/brief-brand-result.png",
          "photo/brief-brand-result01.png",
          "photo/brief-brand-meta.png"
        ],
        "note": "Bài viết nằm trong chiến dịch 90 Ngày Tốc Chiến 2026",
        "views": "> 2.200",
        "reach": "> 1.200"
      },
      {
        "title": "Bài Minigame 90NTC",
        "link": "https://www.facebook.com/DroppiiOfficialPage/posts/pfbid02rx5NhLXYPphrjpZnDKow8MYjiEMAKwRYbfBpWo1ePSHsZaqfUMbDw74TvthEGpwil",
        "briefImgs": [
          "photo/brief-nu.png"
        ],
        "resultImgs": [
          "photo/brief-nu-result.png",
          "photo/brief-nu01.png",
          "photo/brief-nu-meta.png"
        ],
        "note": "Bài viết nằm trong chiến dịch 90 Ngày Tốc Chiến 2026",
        "views": "> 2.900",
        "reach": "> 1.400",
        "thumb": "photo/thumb_minigame.png"
      },
      {
        "title": "Double Day 7/7",
        "link": "https://www.facebook.com/share/p/199SHkXHek/",
        "briefImgs": [
          "photo/brief-77.png"
        ],
        "resultImgs": [
          "photo/brief-77-result.png",
          "photo/brief-77-result01.png",
          "photo/brief-77-meta.png"
        ],
        "note": "Sales event Siêu Sale 7/7 trong 90 Ngày Tốc Chiến",
        "views": "> 2.400",
        "reach": "> 1.100",
        "thumb": "photo/thumb_77.png"
      },
      {
        "title": "News 7 ngày về đích",
        "link": "https://www.facebook.com/share/p/1Bk5cq4dXX/",
        "briefImgs": [
          "photo/90NTC/gap.png"
        ],
        "resultImgs": [
          "photo/90NTC/gap-meta.png",
          "photo/90NTC/gap-meta1.png"
        ],
        "note": "Đếm ngược 7 ngày kết thúc 90 Ngày Tốc Chiến",
        "views": "> 1.700",
        "reach": "> 1.000",
        "thumb": "photo/thumb_news_ve_dich.png"
      },
      {
        "title": "News Đại lộ tri ân",
        "link": "https://www.facebook.com/share/p/1E55y8iQWy/",
        "briefImgs": [
          "photo/90NTC/dailotrian.png"
        ],
        "resultImgs": [
          "photo/90NTC/dailotrian-meta.png",
          "photo/90NTC/dailotrian-meta1.png"
        ],
        "note": "Nhắc nhở vào app nhận vinh danh 90 Ngày Tốc Chiến",
        "views": "> 2.000",
        "reach": "> 1.200",
        "thumb": "photo/thumb_news_dai_lo.png"
      }
    ],
    "photos": [
      {
        "src": "photo/90NTC/tongketall.jpg",
        "title": "Tổng kết 90NTC",
        "link": "https://www.facebook.com/share/p/1C67HM1eAv/"
      },
      {
        "src": "photo/90NTC/dhqs13.jpg",
        "title": "Đại hội quay số Tuần 13",
        "link": "https://www.facebook.com/share/p/1FRwkzhHpj/"
      },
      {
        "src": "photo/90NTC/nutribest.jpg",
        "title": "Tổng kết 90NTC cho riêng NutriBest Health",
        "link": "https://www.facebook.com/share/p/19Njf9wK2e/"
      },
      {
        "src": "photo/90NTC/top6.jpg",
        "title": "Vinh danh Top 6 chung cuộc",
        "link": "https://www.facebook.com/share/p/1BjMzCm8ia/"
      }
    ],
    "videos": [
      {
        "title": "Remind Ngày hội NutriBest Health (2.400 views)",
        "src": "https://www.facebook.com/plugins/video.php?height=476&href=https%3A%2F%2Fwww.facebook.com%2Freel%2F1284679383544296%2F&show_text=false&width=476&t=0"
      },
      {
        "title": "Teaser sale 7/7 (97.000 views)",
        "src": "https://www.facebook.com/plugins/video.php?height=476&href=https%3A%2F%2Fwww.facebook.com%2Freel%2F1655116209118584%2F&show_text=false&width=476&t=0"
      },
      {
        "title": "Teaser Ngày hội NutriBest Health 23/5 (37.700 views)",
        "src": "https://www.facebook.com/plugins/video.php?height=476&href=https%3A%2F%2Fwww.facebook.com%2Freel%2F2181925642640613%2F&show_text=false&width=267&t=0"
      }
    ],
    "stats": [
      {
        "num": "> 50",
        "label": "Bài social post đóng góp"
      },
      {
        "num": "485.000+",
        "label": "Lượt xem (bài đóng góp)"
      },
      {
        "num": "224.000+",
        "label": "Người tiếp cận (bài đóng góp)"
      },
      {
        "num": "14.200+",
        "label": "Tương tác thực tế"
      }
    ]
  },
  "camp-tldt": {
    "badge": "<i class=\"fas fa-bullhorn\"></i> Droppii",
    "title": "Hỗ trợ Series \"Tôi Là Đối Tác Droppii\"",
    "date": "05/2026 - 07/2026",
    "tagline": "Khai thác chiều sâu cảm xúc: Dùng câu chuyện thật của đối tác kinh doanh để xây dựng lòng tin tự nhiên.",
    "problem": "Làm sao để thể hiện rõ đây là câu chuyện người thật việc thật, không bị pr hay seeding quá đà",
    "strategy": "Xây dựng Series truyền cảm hứng 6 tập \"Tôi Là Đối Tác Droppii\" - khai thác câu chuyện đổi đời, vượt qua khó khăn thực tế của các khách mời.",
    "execution": "Đóng góp >30 bài viết truyền thông: bao gồm cap cho teaser, poster, official video, storytelling,...",
    "sheet": "https://docs.google.com/spreadsheets/d/1jtHNT5MBwXDn8rI5jFE23ED71amE9yzcmgZ52xqtvKw/edit?gid=458713564#gid=458713564",
    "sheetLabel": "Google Sheet bài đăng",
    "featuredPosts": [
      {
        "caption": "Caption cho tập 2 - short 1 (377.000 lượt xem)",
        "imgs": [
          "photo/MEME/tldtep2.png",
          "photo/MEME/tldtep2-meta.png"
        ]
      },
      {
        "caption": "Caption cho tập 2 - short 2 (117.000 lượt xem)",
        "imgs": [
          "photo/MEME/tldts22.png",
          "photo/MEME/tldts22me.png"
        ]
      },
      {
        "caption": "Caption cho tập 4 - short 1 (140.000 lượt xem)",
        "imgs": [
          "photo/MEME/tldts14.png",
          "photo/MEME/tldts14me.png"
        ]
      },
      {
        "caption": "Caption cho tập 5 - short 1 (182.000 lượt xem)",
        "imgs": [
          "photo/MEME/tldt5te.png",
          "photo/MEME/tldt5teme.png"
        ]
      },
      {
        "caption": "Caption cho album ảnh tập 3 (3.900 lượt xem)",
        "imgs": [
          "photo/MEME/tldt3sto.png",
          "photo/MEME/tldt3stome.png"
        ]
      },
      {
        "caption": "Caption cho official video tập 6 (5.100 lượt xem)",
        "imgs": [
          "photo/MEME/tldt1.png",
          "photo/MEME/tldtme1.png"
        ]
      },
      {
        "caption": "Caption cho poster tập 5 (3.200 lượt xem)",
        "imgs": [
          "photo/MEME/tldt5pos.png",
          "photo/MEME/tldt5me.png"
        ]
      }
    ],
    "briefToOutput": [
      {
        "title": "Album ảnh Tôi là đối tác Droppii tập 6",
        "link": "https://www.facebook.com/share/p/1Bxpe9QCBv/",
        "briefImgs": [
          "photo/brief-tldt6.png"
        ],
        "resultImgs": [
          "photo/brief-tldt6-result.png",
          "photo/brief-tldt6-01.png",
          "photo/brief-tldt6-meta.png"
        ],
        "note": "Bài viết thuộc series Tôi là đối tác Droppii",
        "views": "> 2.400",
        "reach": "1.400",
        "thumb": "photo/THUMB_SERIES.png"
      }
    ],
    "stats": [
      {
        "num": "~ 30",
        "label": "Bài social xuất bản đóng góp"
      },
      {
        "num": "950.000+",
        "label": "Lượt xem (bài đóng góp)"
      },
      {
        "num": "559.000+",
        "label": "Người tiếp cận (bài đóng góp)"
      },
      {
        "num": "32.000+",
        "label": "Tương tác cộng đồng"
      }
    ]
  },
  "camp-make": {
    "badge": "<i class=\"fas fa-robot\"></i> Công nghệ",
    "title": "Hệ Thống AI Marketing Automation (Make.com)",
    "date": "2026 (Dự án Công nghệ)",
    "tagline": "\"Tự động hóa 100% quy trình sản xuất nội dung: Từ quét tin tức internet đến AI viết bài, tạo ảnh & xuất bản.\"",
    "problem": "Quy trình sản xuất nội dung hàng ngày tốn 4-5 tiếng/ngày cho các khâu tìm ý tưởng, viết bài, thiết kế banner và xuất bản đa kênh.",
    "strategy": "Thiết lập luồng tự động hóa tích hợp Make.com + Gemini API (học giọng văn con người) + Leonardo API (tự sinh banner) + Telegram Bot (duyệt bài 1-click).",
    "execution": "Cấu hình RSS Feed, viết Prompt chuẩn hóa cho Gemini API, thiết lập Webhook tự động ghi log dữ liệu vào Google Sheet & Telegram Bot.",
    "photos": [
      {
        "src": "photo/make1.png",
        "title": "Overview Kịch bản Make.com"
      },
      {
        "src": "photo/make2.png",
        "title": "Google Sheet Quản lý dữ liệu"
      },
      {
        "src": "photo/make4.png",
        "title": "Leonardo API Tự động tạo ảnh"
      },
      {
        "src": "photo/make5.png",
        "title": "Google AI Studio / Gemini API"
      },
      {
        "src": "photo/make6.png",
        "title": "Telegram Bot Nhận thông báo bài"
      },
      {
        "src": "photo/make7.png",
        "title": "Bài đăng tự động hoàn chỉnh"
      }
    ],
    "stats": [
      {
        "num": "100%",
        "label": "Tự động hóa quy trình"
      },
      {
        "num": "- 70%",
        "label": "Thời gian vận hành"
      },
      {
        "num": "50+",
        "label": "Bài viết xử lý/tuần"
      }
    ]
  },
  "camp-xdcc": {
    "badge": "<i class=\"fas fa-store\"></i> Lucas Combo",
    "title": "Xoay Đi Chờ Chi",
    "date": "06/09/2025 - 06/10/2025",
    "tagline": "Chiến dịch tăng doanh thu tại cửa hàng. 1 hóa đơn mua hàng = 1 lượt xoay vòng quay may mắn.",
    "problem": "Học cách ứng biến content dựa trên tình hình thực tế tại cửa hàng.",
    "strategy": "Lên kịch bản video dạng dẫn dắt câu chuyện + meme + cập nhật hình ảnh khách hàng thực tế.",
    "execution": "Lập kế hoạch chiến dịch trên Google Sheet, in ấn standee/poster, trực tiếp quan sát tình hình mua hàng.",
    "sheet": "https://docs.google.com/spreadsheets/d/1ZKpP-XwpTRJh86EiEFHs0XhB-CHrNXfi/edit?gid=1498389441",
    "featuredPosts": [
      {
        "caption": "Bài đăng Khởi động chiến dịch Xoay Đi Chờ Chi",
        "imgs": [
          "photo/XĐCC/thongbao.png"
        ]
      },
      {
        "caption": "Bài đăng Nhắc nhở ưu đãi Voucher & Vòng quay may mắn",
        "imgs": [
          "photo/XĐCC/remind1.png"
        ]
      },
      {
        "caption": "Bài đăng Cuối ngày - Tổng kết hình ảnh khách hàng (1)",
        "imgs": [
          "photo/XĐCC/cuoingay1.png"
        ]
      },
      {
        "caption": "Bài đăng Cuối ngày - Tổng kết hình ảnh khách hàng (2)",
        "imgs": [
          "photo/XĐCC/cuoingay2.png"
        ]
      }
    ],
    "photos": [
      {
        "src": "photo/XĐCC/doanhthu.png",
        "title": "Báo cáo theo dõi doanh thu thực tế"
      }
    ],
    "videos": [
      {
        "title": "Quảng cáo chiến dịch Xoay Đi Chờ Chi",
        "src": "https://www.facebook.com/plugins/video.php?height=476&href=https%3A%2F%2Fwww.facebook.com%2Freel%2F1725098248137253%2F&show_text=false&width=267&t=0"
      },
      {
        "title": "Quảng cáo chiến dịch Xoay Đi Chờ Chi",
        "src": "https://www.facebook.com/plugins/video.php?height=476&href=https%3A%2F%2Fwww.facebook.com%2Freel%2F24538925582408921%2F&show_text=false&width=267&t=0"
      },
      {
        "title": "Quảng cáo túi chống sốc & chiến dịch Xoay Đi Chờ Chi",
        "src": "https://www.facebook.com/plugins/video.php?height=476&href=https%3A%2F%2Fwww.facebook.com%2Freel%2F798628676364303%2F&show_text=false&width=267&t=0"
      },
      {
        "title": "Clip vui cho chiến dịch Xoay Đi Chờ Chi",
        "src": "https://www.facebook.com/plugins/video.php?height=476&href=https%3A%2F%2Fwww.facebook.com%2Freel%2F1487223245746254%2F&show_text=false&width=267&t=0"
      }
    ],
    "stats": [
      {
        "num": "> 30",
        "label": "Bài đăng (gồm reels, ảnh, story)"
      },
      {
        "num": "> 500",
        "label": "Khách hàng ghé mua và hài lòng"
      },
      {
        "num": "341 triệu",
        "label": "Doanh thu tại cửa hàng"
      }
    ]
  },
  "camp-dtv": {
    "badge": "<i class=\"fas fa-bullhorn\"></i> Droppii",
    "title": "Điểm Tư Vấn Đạt Chuẩn Droppii",
    "date": "2026",
    "tagline": "\"Chuẩn hóa quy trình tư vấn 1:1 và tôn vinh hệ thống điểm tư vấn uy tín trên toàn quốc.\"",
    "problem": "Cần nâng cao chất lượng tư vấn trực tiếp của đối tác và định vị hình ảnh chuyên nghiệp cho các điểm tư vấn Droppii.",
    "strategy": "Truyền thông chuỗi cẩm nang quy trình 5 bước tư vấn chuẩn + vinh danh các showroom điểm tư vấn đạt chứng nhận xuất sắc.",
    "photos": [
      {
        "src": "photo/ĐTV/DTV_1.png",
        "title": "Ra mắt Điểm tư vấn đạt chuẩn tại TP.HCM"
      },
      {
        "src": "photo/ĐTV/DTV_2.png",
        "title": "Cẩm nang 5 bước tư vấn sản phẩm"
      },
      {
        "src": "photo/ĐTV/DTV_3.png",
        "title": "Trải nghiệm tư vấn 1:1 chuyên sâu"
      },
      {
        "src": "photo/ĐTV/DTV_4.png",
        "title": "Trao chứng nhận Điểm tư vấn xuất sắc"
      }
    ],
    "stats": [
      {
        "num": "180.000+",
        "label": "Lượt tiếp cận"
      },
      {
        "num": "12.000+",
        "label": "Tương tác bài đăng"
      }
    ]
  },
  "camp-aiads": {
    "badge": "<i class=\"fas fa-bullhorn\"></i> Droppii",
    "title": "Ads Khóa Học AI & Công Nghệ",
    "date": "2026",
    "tagline": "\"Tập trung vào tính ứng dụng thực chiến: Giúp đối tác X10 hiệu suất kinh doanh nhờ công cụ AI.\"",
    "problem": "Chiêu sinh các khóa học AI cho đối tác kinh doanh với yêu cầu thông điệp dễ hiểu, không hàn lâm.",
    "strategy": "Minh họa trực quan các case study \"Viết 30 bài trong 5 phút\", \"Thiết kế banner AI\" + chứng thực từ kết quả học viên.",
    "photos": [
      {
        "src": "photo/MEME/AI_1.png",
        "title": "Bí quyết tự động hóa bài đăng với AI"
      },
      {
        "src": "photo/MEME/AI_2.png",
        "title": "Viết 30 caption facebook trong 5 phút"
      },
      {
        "src": "photo/MEME/AI_3.png",
        "title": "Thiết kế banner & video bán hàng AI"
      },
      {
        "src": "photo/MEME/AI_4.png",
        "title": "Thành quả bứt phá đơn hàng của học viên"
      }
    ],
    "videos": [
      {
        "title": "Video AI Veo3 Ads - Quảng cáo khóa học",
        "src": "https://www.facebook.com/plugins/video.php?height=476&href=https%3A%2F%2Fwww.facebook.com%2Freel%2F618290484501869%2F&show_text=false&width=267&t=0"
      },
      {
        "title": "Video Gemini AI - Hướng dẫn tạo kịch bản",
        "src": "https://www.facebook.com/plugins/video.php?height=476&href=https%3A%2F%2Fwww.facebook.com%2Freel%2F1697285934509172%2F&show_text=false&width=267&t=0"
      }
    ],
    "stats": [
      {
        "num": "210.000+",
        "label": "Lượt tiếp cận Ads"
      },
      {
        "num": "15.400+",
        "label": "Tương tác quan tâm"
      }
    ]
  },
  "camp-77": {
    "badge": "<i class=\"fas fa-bullhorn\"></i> Droppii",
    "title": "Siêu Sale Double Day 7/7",
    "date": "07/2026",
    "tagline": "\"Tạo hiệu ứng FOMO săn deal Siêu Sale 7/7 cùng brief hình ảnh ưu đãi rực rỡ.\"",
    "problem": "Đẩy mạnh doanh số phiên Mega Sale 7/7 và tạo hiệu ứng truyền thông đồng bộ cho hệ thống.",
    "strategy": "Thiết kế bộ Brief hình ảnh banner ưu đãi chuẩn Meta + Video Teaser FOMO kéo tương tác.",
    "briefLink": "briefs.html",
    "videos": [
      {
        "title": "Teaser sale 7/7 (97.000 views - Có ads)",
        "src": "https://www.facebook.com/plugins/video.php?height=476&href=https%3A%2F%2Fwww.facebook.com%2Freel%2F1655116209118584%2F&show_text=false&width=476&t=0"
      }
    ],
    "stats": [
      {
        "num": "320.000+",
        "label": "Lượt tiếp cận (Reach)"
      },
      {
        "num": "510.000+",
        "label": "Lượt hiển thị (Impressions)"
      }
    ]
  },
  "camp-2010": {
    "badge": "<i class=\"fas fa-store\"></i> Lucas Combo",
    "title": "Tháng 10 Dịu Dàng - Trao Nàng Yêu Thương",
    "date": "18/10/2025 - 20/10/2025",
    "tagline": "Tặng hoa kẹo mút (handmade) & Voucher giảm 10% cho khách hàng nữ ghé mua hàng trong 3 ngày diễn ra chương trình.",
    "problem": "Học cách ứng biến content dựa trên tình hình thực tế tại cửa hàng. Làm thủ công quà tặng nên cần tính toán đủ số lượng.",
    "strategy": "Lên kịch bản video dạng dẫn dắt câu chuyện + hình ảnh hậu trường + cập nhật hình ảnh khách hàng thực tế.",
    "execution": "Lập kế hoạch chiến dịch trên Google Sheet, in ấn standee/poster, trực tiếp quan sát tình hình mua hàng.",
    "featuredPosts": [
      {
        "caption": "Bài đăng Khởi động & Thông báo chương trình",
        "imgs": [
          "photo/2010/thongbao.png"
        ]
      },
      {
        "caption": "Bài đăng Thông báo",
        "imgs": [
          "photo/2010/thongbaoluon.png"
        ]
      },
      {
        "caption": "Bài đăng Hậu trường chuẩn bị quà & Mời khách hàng ghé nhận quà",
        "imgs": [
          "photo/2010/keugoi1.png",
          "photo/2010/keugoi2.png"
        ]
      },
      {
        "caption": "Bài đăng Khoe những bó hoa kẹo mút handmade",
        "imgs": [
          "photo/2010/khoequa1.png",
          "photo/2010/khoequa2.png"
        ]
      }
    ],
    "photos": [
      {
        "src": "photo/2010/ketqua.png",
        "title": "Báo cáo doanh thu thực tế chiến dịch 20/10"
      }
    ],
    "videos": [
      {
        "title": "Quảng cáo chiến dịch 20/10",
        "src": "https://www.facebook.com/plugins/video.php?height=476&href=https%3A%2F%2Fwww.facebook.com%2Freel%2F1873461660221906%2F&show_text=false&width=267&t=0"
      },
      {
        "title": "Clip vui cho chiến dịch 20/10",
        "src": "https://www.facebook.com/plugins/video.php?height=476&href=https%3A%2F%2Fwww.facebook.com%2Freel%2F1706983176651990%2F&show_text=false&width=267&t=0"
      },
      {
        "title": "Quảng cáo chiến dịch 20/10 (ads)",
        "src": "https://www.facebook.com/plugins/video.php?height=476&href=https%3A%2F%2Fwww.facebook.com%2Freel%2F1475473590229817%2F&show_text=false&width=267&t=0"
      },
      {
        "title": "Hậu trường chuẩn bị quà 20/10",
        "src": "https://www.facebook.com/plugins/video.php?height=476&href=https%3A%2F%2Fwww.facebook.com%2Freel%2F1987813311760464%2F&show_text=false&width=267&t=0"
      }
    ],
    "stats": [
      {
        "num": "> 10",
        "label": "Bài đăng (gồm reels, ảnh, story)"
      },
      {
        "num": "16",
        "label": "Khách nữ ghé mua và hài lòng"
      },
      {
        "num": "12 triệu",
        "label": "Doanh thu tại cửa hàng"
      }
    ]
  },
  "camp-thct": {
    "badge": "<i class=\"fas fa-graduation-cap\"></i> Đồ án",
    "title": "Đồ án Thương mại xã hội (Tạp Hóa Content)",
    "date": "10/2025 - 12/2025",
    "tagline": "Xây dựng Fanpage Tạp hóa Content từ con số 0 với kế hoạch nội dung đa dạng. TA: Học sinh sinh viên.",
    "problem": "Chú trọng ở mảng video nên cần tập hợp nhân sự quay/dựng, lên kịch bản liên tục. Xây kênh từ số 0 để phục vụ cho buổi MEGA LIVE nên cần thường xuyên tối ưu content.",
    "strategy": "Triển khai luồng nội dung đa dạng: Unboxing, review, viral clip, teaser, ảnh thông báo,...",
    "sheet": "https://docs.google.com/spreadsheets/d/11hDVcBBFUSz9cr09Bz_EY0ZAwz9vE-gbU1U3S9Yrgqo/edit?gid=1420815595#gid=1420815595",
    "featuredPosts": [
      {
        "caption": "Bài đăng Nhá hàng MEGA LIVE 11/11 Tạp Hóa Content",
        "imgs": [
          "photo/THC/thongbaomega.png"
        ]
      },
      {
        "caption": "Bài đăng Tiết lộ Minigame phiên MEGA LIVE 17/12",
        "imgs": [
          "photo/THC/thongbaolive.png"
        ]
      },
      {
        "caption": "Bài đăng Series Mỗi ngày 1 Review sản phẩm",
        "imgs": [
          "photo/THC/review.png"
        ]
      },
      {
        "caption": "Bài đăng Minigame Giải đề Tạp hóa nhận quà hóa to",
        "imgs": [
          "photo/THC/minigame.png"
        ]
      },
      {
        "caption": "Bài đăng Quảng bá sản phẩm Chén sứ gia dụng",
        "imgs": [
          "photo/THC/chensu.png"
        ]
      },
      {
        "caption": "Bài đăng Thông báo Livestream & Hậu trường săn deal",
        "imgs": [
          "photo/THC/dailylive.png",
          "photo/THC/dailylivee.png"
        ]
      },
      {
        "caption": "Bài đăng Tổng kết phiên MEGA LIVE 17/12",
        "imgs": [
          "photo/THC/tongket.png"
        ]
      }
    ],
    "photos": [
      {
        "src": "photo/report1.png",
        "title": "Overview báo cáo Fanpage Tạp Hóa Content",
        "maxWidth": "460px"
      },
      {
        "src": "photo/THC/tongketreal.jpg",
        "title": "Tổng kết báo cáo doanh thu & chỉ số thực tế MEGA LIVE 17/12",
        "maxWidth": "460px"
      }
    ],
    "videos": [
      {
        "title": "Clip vui quảng cáo snack",
        "src": "https://www.facebook.com/plugins/video.php?height=476&href=https%3A%2F%2Fwww.facebook.com%2Freel%2F2030950817718218%2F&show_text=false&width=267&t=0"
      },
      {
        "title": "Teaser MEGA LIVE 11/11",
        "src": "https://www.facebook.com/plugins/video.php?height=476&href=https%3A%2F%2Fwww.facebook.com%2Freel%2F2126008008208266%2F&show_text=false&width=267&t=0"
      },
      {
        "title": "Clip vui quảng cáo giấy Topgia",
        "src": "https://www.facebook.com/plugins/video.php?height=476&href=https%3A%2F%2Fwww.facebook.com%2Freel%2F1322399539581048%2F&show_text=false&width=267&t=0"
      }
    ],
    "stats": [
      {
        "num": "> 100",
        "label": "Bài đăng (gồm reels, ảnh, bài viết, story)"
      },
      {
        "num": "> 50.000",
        "label": "Lượt xem trang"
      },
      {
        "num": "~ 5 triệu",
        "label": "Doanh thu MEGA LIVE"
      }
    ]
  },
  "camp-delifood": {
    "badge": "<i class=\"fas fa-graduation-cap\"></i> Đồ án",
    "title": "Đồ án Digital Marketing (Delifood Vietnam)",
    "date": "10/2024 - 12/2024",
    "tagline": "\"Xây dựng hệ sinh thái Omnichannel: Fanpage, TikTok, Figma Landing Page & Website WordPress.\"",
    "problem": "Xây dựng sự hiện diện đa kênh cho thương hiệu thực phẩm Delifood Vietnam.",
    "strategy": "Thiết kế bộ nhận diện thương hiệu, Landing Page Figma, Website WordPress và các bài đăng quảng bá sản phẩm khô chay & khô bò.",
    "photos": [
      {
        "src": "photo/khochay.jpg",
        "title": "Banner Quảng cáo Khô Chay Delifood"
      },
      {
        "src": "photo/delifood2.jpg",
        "title": "Khô Bò Cay Delifood - Visual Post"
      }
    ],
    "stats": [
      {
        "num": "~ 30",
        "label": "Bài đăng (gồm reels, ảnh, story)"
      },
      {
        "num": "7.400",
        "label": "Lượt xem trang tự nhiên"
      },
      {
        "num": "9đ",
        "label": "Nhóm có điểm đồ án cao nhất lớp"
      }
    ]
  }
};

function initProjectDetailPage() {
  const container = document.getElementById("project-detail-container");
  if (!container) return;

  const urlParams = new URLSearchParams(window.location.search);
  let id = urlParams.get("id") || window.location.hash.replace("#", "");
  if (!id || !PROJECTS_DATA[id]) {
    id = "camp-90ntc"; // Default fallback
  }

  const p = PROJECTS_DATA[id];
  document.title = `Lạc Ngọc Như - ${p.title}`;

  let html = `
    <div class="pdh-card">
      <div class="pdh-top">
        <div class="pdh-title-row">
                    <h1 class="pdh-title">${p.title}</h1>
        </div>
        <div class="pdh-meta-row">
          <span class="pdh-date"><i class="fas fa-calendar-alt"></i> ${p.date}</span>
          ${p.sheet ? `<a href="${p.sheet}" target="_blank" class="pdh-sheet-btn"><i class="fas fa-table-cells"></i> ${p.sheetLabel || "Google Sheet chien dich"}</a>` : ""}
          ${p.briefLink ? `<a href="${p.briefLink}" class="pdh-sheet-btn"><i class="fas fa-file-alt"></i> Xem Brief &amp; Output</a>` : ""}
        </div>
      </div>

      <p class="pdh-tagline">${p.tagline}</p>

      <div class="pdh-psr-grid">
        <div class="pdh-psr-box">
          <div class="pdh-psr-label pdh-psr-problem"><i class="fas fa-bullseye"></i> Problem / Thử thách</div>
          <div class="pdh-psr-text">${p.problem || "Toi uu hoa chien dich truyen thong."}</div>
        </div>
        ${p.strategy ? `<div class="pdh-psr-box"><div class="pdh-psr-label pdh-psr-strategy"><i class="fas fa-lightbulb"></i> Core Strategy / Ý tưởng</div><div class="pdh-psr-text">${p.strategy}</div></div>` : ""}
        ${p.execution ? `<div class="pdh-psr-box"><div class="pdh-psr-label pdh-psr-exec"><i class="fas fa-layer-group"></i> Multi-Format Execution</div><div class="pdh-psr-text">${p.execution}</div></div>` : ""}
      </div>
    </div>
  `;
  // Render 1: Từ Brief cho đến Thành phẩm (từ brief.html)
  if (p.briefToOutput && p.briefToOutput.length > 0) {
    const isSingle = p.briefToOutput.length === 1;
    html += `
      <div style="margin-top: 2.5rem;">
        <h2 class="section-title" style="font-size: 1.45rem; color: #0284c7; margin-bottom: 1.4rem;">Từ Brief Cho Đến Thành Phẩm</h2>
        <div class="brief-edge-grid ${isSingle ? "single-card" : ""}">
        ${p.briefToOutput
          .map((b) => {
            const allImgs = [
              ...(b.thumb ? [b.thumb] : []),
              ...(b.briefImgs || []),
              ...(b.resultImgs || []),
            ];
            return `
          <div class="brief-edge-card" style="${isSingle ? "max-width: 540px; width: 100%;" : ""}">
            <div class="locket-gallery brief-edge-gallery">
              ${allImgs
                .map(
                  (imgSrc, idx) => `
                <div class="gallery-item ${idx === 0 ? "active" : ""}">
                  <img src="${imgSrc}" alt="${b.title}" class="brief-edge-img" />
                </div>
              `,
                )
                .join("")}
              <div class="gallery-counter">1/${allImgs.length}</div>
            </div>

            <div class="brief-edge-body">
              <div class="brief-edge-header">
                <div class="brief-edge-title">
                  <a href="${b.link}" target="_blank" rel="noopener noreferrer" class="brief-title-link">${b.title}</a>
                </div>
                ${b.note ? `<div class="brief-edge-note">${b.note}</div>` : ""}
              </div>

              <div class="brief-edge-footer">
                <div class="brief-edge-stats">
                  ${b.views ? `<span class="brief-stat-pill"><i class="fas fa-eye"></i> ${b.views} Lượt xem</span>` : ""}
                  ${b.reach ? `<span class="brief-stat-pill"><i class="fas fa-users"></i> ${b.reach} Người xem</span>` : ""}
                </div>
              </div>
            </div>
          </div>
        `;
          })
          .join("")}
        </div>
      </div>
    `;
  }

  // Render 2: Bài đăng nổi bật
  if (p.featuredPosts && p.featuredPosts.length > 0) {
    const isSingle = p.featuredPosts.length === 1;
    html += `
      <div style="margin-top: 2.5rem;">
        <h2 class="section-title" style="font-size: 1.45rem; color: #0284c7; margin-bottom: 1.4rem;">Bài Đăng Nổi Bật</h2>
        <div class="brief-edge-grid ${isSingle ? "single-card" : ""}">
          ${p.featuredPosts
            .map(
              (post) => `
            <div class="brief-edge-card" style="${isSingle ? "max-width: 540px; width: 100%;" : ""}">
              <div class="locket-gallery brief-edge-gallery">
                ${post.imgs
                  .map(
                    (imgSrc, idx) => `
                  <div class="gallery-item ${idx === 0 ? "active" : ""}">
                    <img src="${imgSrc}" alt="${post.caption}" class="brief-edge-img" />
                  </div>
                `,
                  )
                  .join("")}
                <div class="gallery-counter">1/${post.imgs.length}</div>
              </div>
              <div class="brief-edge-body">
                <div class="brief-edge-header">
                  <div class="brief-edge-title" style="font-size: 0.92rem; line-height: 1.5; color: #1e293b;">
                    ${formatCaptionHTML(post.caption)}
                  </div>
                </div>
              </div>
            </div>
          `,
            )
            .join("")}
        </div>
      </div>
    `;
  }

  // Render Videos belonging to this project
  if (p.videos && p.videos.length > 0) {
    html += `
      <div style="margin-top: 2rem;">
        <h3 class="section-title" style="font-size: 1.45rem; color: #0284c7; margin-bottom: 1rem;">Video Reels của Chiến dịch</h3>
        <div class="reels-grid">
          ${p.videos
            .map((v) => {
              const wMatch = (v.src || "").match(/[?&]width=(\d+)/);
              const hMatch = (v.src || "").match(/[?&]height=(\d+)/);
              const origW = wMatch ? parseInt(wMatch[1]) : 267;
              const origH = hMatch ? parseInt(hMatch[1]) : 476;
              const isVertical = origW < origH;
              const targetW = isVertical ? 205 : 265;
              return `
            <div class="reel-card" style="width: ${targetW}px;">
              <div class="reel-embed" style="width: 100%; aspect-ratio: ${origW} / ${origH};">
                <iframe src="${v.src}" width="${origW}" height="${origH}" style="border: none; overflow: hidden; width: 100%; height: 100%;" scrolling="no" frameborder="0" allowfullscreen="true" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"></iframe>
              </div>
              <div class="reel-caption">${formatCaptionHTML(v.title)}</div>
            </div>
          `;
            })
            .join("")}
        </div>
      </div>
    `;
  }

  // Render Photos belonging to this project
  if (p.photos && p.photos.length > 0) {
    const isSingle = p.photos.length === 1;
    const isFour = p.photos.length === 4;
    const minColWidth = p.photos.length <= 2 ? "285px" : "260px";

    let containerStyle = "";
    if (isSingle) {
      containerStyle = "max-width: 680px; margin: 0 auto; display: block;";
    } else if (isFour) {
      containerStyle =
        "display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; align-items: start; width: 100%;";
    } else {
      containerStyle =
        "display: flex; flex-wrap: wrap; gap: 1.4rem; align-items: start; overflow-x: visible;";
    }

    html += `
      <div style="margin-top: 2.5rem;">
        <h3 class="section-title" style="font-size: 1.45rem; color: #0284c7; margin-bottom: 1.4rem; display: inline-block;">
          KẾT QUẢ CHIẾN DỊCH
        </h3>
        <div class="work-samples" style="${containerStyle}">
          ${p.photos
            .map(
              (img) => `
              <div class="work-sample-item frameless" style="${
                isSingle
                  ? "max-width: 680px; width: 100%;"
                  : isFour
                    ? "width: 100%; max-width: 100%;"
                    : img.maxWidth
                      ? `max-width: ${img.maxWidth}; width: 100%; flex: 1 1 ${img.maxWidth};`
                      : `max-width: ${minColWidth}; width: 100%; flex: 1 1 ${minColWidth};`
              }">
                <img src="${img.src}" alt="${img.title}" />
                ${
                  img.link
                    ? `
                  <a href="${img.link}" target="_blank" rel="noopener noreferrer" style="text-decoration: none; display: block;">
                    <span><i class="fas fa-external-link-alt" style="font-size: 0.75rem; color: #0284c7; margin-right: 4px;"></i> ${formatCaptionHTML(img.title)}</span>
                  </a>
                `
                    : `
                  <span>${formatCaptionHTML(img.title)}</span>
                `
                }
              </div>
          `,
            )
            .join("")}
        </div>
      </div>
    `;
  }

  html += `</div>`;
  container.innerHTML = html;
  initLocketGalleries();
  initCaptionFormatter();
  adjustVideoAspectRatios();
}

// Tawk.to Live Chat Script
var Tawk_API = Tawk_API || {},
  Tawk_LoadStart = new Date();
(function () {
  var s1 = document.createElement("script"),
    s0 = document.getElementsByTagName("script")[0];
  s1.async = true;
  s1.src = "https://embed.tawk.to/69a5dfcc2f01051c35610930/1jinv4eps";
  s1.charset = "UTF-8";
  s1.setAttribute("crossorigin", "*");
  s0.parentNode.insertBefore(s1, s0);
})();
