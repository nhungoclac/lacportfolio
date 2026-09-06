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
  initCaptionFormatter();
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
  }

  function openLightbox(gallery, index) {
    currentGallery = gallery;
    currentIndex = index;
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
      ".brief-img-wrapper img, .slide-item img, .gallery-item img, .zoomable-img, .work-sample-item img",
    );
    if (!img || !img.src) return;
    if (img.closest("a[href]")) return;

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
      openLightbox(gallerySrcs, clickedIdx >= 0 ? clickedIdx : 0);
      return;
    }

    const workSampleItem = img.closest(".work-sample-item");
    if (workSampleItem) {
      e.preventDefault();
      e.stopPropagation();
      openLightbox([img.src], 0);
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
      openLightbox(gallerySrcs, clickedIdx >= 0 ? clickedIdx : 0);
      return;
    }

    openLightbox([img.src], 0);
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
    badge: '<i class="fas fa-bullhorn"></i> Droppii',
    title: "Hỗ trợ 90 Ngày Tốc Chiến ",
    date: "05/2026 - 07/2026",
    tagline:
      "Chiến dịch thúc đẩy bán hàng kéo dài 3 tháng của Droppii, với NutriBest Health là nhà tài trợ độc quyền, đồng hành qua các hoạt động marketing, ưu đãi và tương tác cùng đối tác.",
    problem:
      "Làm thế nào để duy trì động lực bán hàng của đối tác trong 90 ngày và đưa NutriBest Health trở thành thương hiệu nổi bật trong chiến dịch?",
    strategy:
      "Tạo phần thưởng vinh danh + Truyền thông hình ảnh chuyên nghiệp + Video Reels tạo hiệu ứng lan tỏa động lực thi đua.",
    execution:
      "Đóng góp >50 bài viết Social, viết Brief thiết kế hình ảnh, viết Script video.",
    sheet:
      "https://docs.google.com/spreadsheets/d/1jtHNT5MBwXDn8rI5jFE23ED71amE9yzcmgZ52xqtvKw/edit?gid=973473861#gid=973473861",

    // Phần 1: Bài đăng nổi bật (Dữ liệu từ meme.html)
    featuredPosts: [
      {
        caption:
          "Caption cho clip quảng bá NutriBest Health (160.000 lượt xem)",
        imgs: ["photo/90NTC/pdpvideo.png", "photo/90NTC/pdpvideo-meta.png"],
      },
      {
        caption:
          "Caption cho Sales Event - Ngày hội NutriBest Health 20/6 (63.000 lượt xem)",
        imgs: ["photo/90NTC/2006.png", "photo/90NTC/2006-meta.png"],
      },
      {
        caption:
          "Caption cho Minigame Ngày hội NutriBest Health 23/5 (28.000 lượt xem)",
        imgs: ["photo/90NTC/minigame.png", "photo/90NTC/minigame-meta.png"],
      },
      {
        caption:
          "Caption cho bài Nhìn lại 90 Ngày Tốc Chiến 2026 (2.400 lượt xem)",
        imgs: ["photo/90NTC/nhinlai.png", "photo/90NTC/nhinlai-meta.png"],
      },
    ],

    // Phần 2: Từ Brief cho đến Thành phẩm (Dữ liệu từ brief.html)
    briefToOutput: [
      {
        title: "Bài branding cho Nhà tài trợ độc quyền NutriBest Health (1)",
        link: "https://www.facebook.com/share/p/1JapKjw8bA/",
        briefImgs: ["photo/90NTC/branding1.png", "photo/90NTC/branding12.png"],
        resultImgs: [
          "photo/90NTC/branding1-meta.png",
          "photo/90NTC/branding1-meta1.png",
          "photo/90NTC/branding1-meta2.png",
        ],
        note: "Bài viết nằm trong chiến dịch 90 Ngày Tốc Chiến 2026",
        views: "> 3.000",
        reach: "> 1.500",
      },
      {
        title: "Bài branding cho Nhà tài trợ độc quyền NutriBest Health (2)",
        link: "https://www.facebook.com/share/p/1DMgtAf6i3/",
        briefImgs: [
          "photo/90NTC/branding2-brief.png",
          "photo/90NTC/branding2-brief1.png",
          "photo/90NTC/branding2-brief2.png",
          "photo/90NTC/branding2-brief3.png",
        ],
        resultImgs: [
          "photo/90NTC/branding2.png",
          "photo/90NTC/branding21.png",
          "photo/90NTC/branding2-meta.png",
        ],
        note: "Bài viết nằm trong chiến dịch 90 Ngày Tốc Chiến 2026",
        views: "> 2.700",
        reach: "> 1.300",
      },
      {
        title: "Bài branding cho Nhà tài trợ độc quyền NutriBest Health (3)",
        link: "https://www.facebook.com/share/p/1b5tBqBDZW/",
        briefImgs: ["photo/brief-brand.png", "photo/brief-brand01.png"],
        resultImgs: [
          "photo/brief-brand-result.png",
          "photo/brief-brand-result01.png",
          "photo/brief-brand-meta.png",
        ],
        note: "Bài viết nằm trong chiến dịch 90 Ngày Tốc Chiến 2026",
        views: "> 2.200",
        reach: "> 1.200",
      },
      {
        title: "Bài Minigame 90NTC",
        link: "https://www.facebook.com/DroppiiOfficialPage/posts/pfbid02rx5NhLXYPphrjpZnDKow8MYjiEMAKwRYbfBpWo1ePSHsZaqfUMbDw74TvthEGpwil",
        briefImgs: ["photo/brief-nu.png"],
        resultImgs: [
          "photo/brief-nu-result.png",
          "photo/brief-nu01.png",
          "photo/brief-nu-meta.png",
        ],
        note: "Bài viết nằm trong chiến dịch 90 Ngày Tốc Chiến 2026",
        views: "> 2.900",
        reach: "> 1.400",
      },
      {
        title: "Double Day 7/7",
        link: "https://www.facebook.com/share/p/199SHkXHek/",
        briefImgs: ["photo/brief-77.png"],
        resultImgs: [
          "photo/brief-77-result.png",
          "photo/brief-77-result01.png",
          "photo/brief-77-meta.png",
        ],
        note: "Sales event Siêu Sale 7/7 trong chiến dịch 90NTC",
        views: "> 2.400",
        reach: "> 1.100",
      },
      {
        title: "News 7 ngày về đích",
        link: "https://www.facebook.com/share/p/1Bk5cq4dXX/",
        briefImgs: ["photo/90NTC/gap.png"],
        resultImgs: ["photo/90NTC/gap-meta.png", "photo/90NTC/gap-meta1.png"],
        note: "Sales event Siêu Sale 7/7 trong chiến dịch 90NTC",
        views: "> 1.700",
        reach: "> 1.000",
      },
      {
        title: "News Đại lộ tri ân",
        link: "https://www.facebook.com/share/p/1E55y8iQWy/",
        briefImgs: ["photo/90NTC/dailotrian.png"],
        resultImgs: [
          "photo/90NTC/dailotrian-meta.png",
          "photo/90NTC/dailotrian-meta1.png",
        ],
        note: "Sales event Siêu Sale 7/7 trong chiến dịch 90NTC",
        views: "> 2.000",
        reach: "> 1.200",
      },
    ],

    photos: [
      {
        src: "photo/90NTC/tongketall.jpg",
        title: "Tổng kết 90NTC",
        link: "https://www.facebook.com/share/p/1C67HM1eAv/",
      },
      {
        src: "photo/90NTC/nutribest.jpg",
        title: "Tổng kết 90NTC cho riêng NutriBest Health",
        link: "https://www.facebook.com/share/p/19Njf9wK2e/",
      },
      {
        src: "photo/90NTC/top6.jpg",
        title: "Vinh danh Top 6 chung cuộc",
        link: "https://www.facebook.com/share/p/1BjMzCm8ia/",
      },
      {
        src: "photo/90NTC/dhqs13.jpg",
        title: "Đại hội quay số Tuần 13",
        link: "https://www.facebook.com/share/p/1FRwkzhHpj/",
      },
    ],
    videos: [
      {
        title: "Remind Ngày hội NutriBest Health (2.400 views)",
        src: "https://www.facebook.com/plugins/video.php?height=476&href=https%3A%2F%2Fwww.facebook.com%2Freel%2F1284679383544296%2F&show_text=false&width=476&t=0",
      },
      {
        title: "Teaser sale 7/7 (97.000 views)",
        src: "https://www.facebook.com/plugins/video.php?height=476&href=https%3A%2F%2Fwww.facebook.com%2Freel%2F1655116209118584%2F&show_text=false&width=476&t=0",
      },
      {
        title: "Teaser Ngày hội NutriBest Health 23/5 (37.700 views)",
        src: "https://www.facebook.com/plugins/video.php?height=476&href=https%3A%2F%2Fwww.facebook.com%2Freel%2F2181925642640613%2F&show_text=false&width=267&t=0",
      },
    ],
    stats: [
      { num: "> 50", label: "Bài social post đóng góp" },
      { num: "485.000+", label: "Lượt xem (bài đóng góp)" },
      { num: "224.000+", label: "Người tiếp cận (bài đóng góp)" },
      { num: "14.200+", label: "Tương tác thực tế" },
    ],
  },
  "camp-tldt": {
    badge: '<i class="fas fa-bullhorn"></i> Droppii',
    title: 'Hỗ trợ Series "Tôi Là Đối Tác Droppii"',
    date: "05/2026 - 07/2026",
    tagline:
      "Khai thác chiều sâu cảm xúc: Dùng câu chuyện thật của đối tác kinh doanh để xây dựng lòng tin tự nhiên.",
    problem:
      "Làm sao để thể hiện rõ đây là câu chuyện người thật việc thật, không bị pr hay seeding quá đà",
    strategy:
      'Xây dựng Series truyền cảm hứng 6 tập "Tôi Là Đối Tác Droppii" - khai thác câu chuyện đổi đời, vượt qua khó khăn thực tế của các khách mời.',
    execution:
      "Đóng góp >30 bài viết truyền thông: bao gồm cap cho teaser, poster, official video, storytelling,...",
    sheet:
      "https://docs.google.com/spreadsheets/d/1jtHNT5MBwXDn8rI5jFE23ED71amE9yzcmgZ52xqtvKw/edit?gid=458713564#gid=458713564",

    // Phần 1: Bài đăng nổi bật (Dữ liệu từ meme.html)
    featuredPosts: [
      {
        caption: "Caption cho tập 2 - short 1 (377.000 lượt xem)",
        imgs: ["photo/MEME/tldtep2.png", "photo/MEME/tldtep2-meta.png"],
      },
      {
        caption: "Caption cho tập 2 - short 2 (117.000 lượt xem)",
        imgs: ["photo/MEME/tldts22.png", "photo/MEME/tldts22me.png"],
      },
      {
        caption: "Caption cho tập 4 - short 1 (140.000 lượt xem)",
        imgs: ["photo/MEME/tldts14.png", "photo/MEME/tldts14me.png"],
      },
      {
        caption: "Caption cho tập 5 - short 1 (182.000 lượt xem)",
        imgs: ["photo/MEME/tldt5te.png", "photo/MEME/tldt5teme.png"],
      },
      {
        caption: "Caption cho album ảnh tập 3 (3.900 lượt xem)",
        imgs: ["photo/MEME/tldt3sto.png", "photo/MEME/tldt3stome.png"],
      },
      {
        caption: "Caption cho official video tập 6 (5.100 lượt xem)",
        imgs: ["photo/MEME/tldt1.png", "photo/MEME/tldtme1.png"],
      },
      {
        caption: "Caption cho poster tập 5 (3.200 lượt xem)",
        imgs: ["photo/MEME/tldt5pos.png", "photo/MEME/tldt5me.png"],
      },
    ],

    // Phần 2: Từ Brief cho đến Thành phẩm (Dữ liệu từ brief.html)
    briefToOutput: [
      {
        title: "Album ảnh Tôi là đối tác Droppii tập 6",
        link: "https://www.facebook.com/share/p/1Bxpe9QCBv/",
        briefImgs: ["photo/brief-tldt6.png"],
        resultImgs: [
          "photo/brief-tldt6-result.png",
          "photo/brief-tldt6-01.png",
          "photo/brief-tldt6-meta.png",
        ],
        note: "Bài viết thuộc series Tôi là đối tác Droppii",
        views: "> 2.400",
        reach: "1.400",
      },
    ],

    stats: [
      { num: "~ 30", label: "Bài social xuất bản đóng góp" },
      { num: "950.000+", label: "Lượt xem (bài đóng góp)" },
      { num: "559.000+", label: "Người tiếp cận (bài đóng góp)" },
      { num: "32.000+", label: "Tương tác cộng đồng" },
    ],
  },
  "camp-make": {
    badge: '<i class="fas fa-robot"></i> Công nghệ',
    title: "Hệ Thống AI Marketing Automation (Make.com)",
    date: "2026 (Dự án Công nghệ)",
    tagline:
      '"Tự động hóa 100% quy trình sản xuất nội dung: Từ quét tin tức internet đến AI viết bài, tạo ảnh & xuất bản."',
    problem:
      "Quy trình sản xuất nội dung hàng ngày tốn 4-5 tiếng/ngày cho các khâu tìm ý tưởng, viết bài, thiết kế banner và xuất bản đa kênh.",
    strategy:
      "Thiết lập luồng tự động hóa tích hợp Make.com + Gemini API (học giọng văn con người) + Leonardo API (tự sinh banner) + Telegram Bot (duyệt bài 1-click).",
    execution:
      "Cấu hình RSS Feed, viết Prompt chuẩn hóa cho Gemini API, thiết lập Webhook tự động ghi log dữ liệu vào Google Sheet & Telegram Bot.",
    photos: [
      { src: "photo/make1.png", title: "Overview Kịch bản Make.com" },
      { src: "photo/make2.png", title: "Google Sheet Quản lý dữ liệu" },
      { src: "photo/make4.png", title: "Leonardo API Tự động tạo ảnh" },
      { src: "photo/make5.png", title: "Google AI Studio / Gemini API" },
      { src: "photo/make6.png", title: "Telegram Bot Nhận thông báo bài" },
      { src: "photo/make7.png", title: "Bài đăng tự động hoàn chỉnh" },
    ],
    stats: [
      { num: "100%", label: "Tự động hóa quy trình" },
      { num: "- 70%", label: "Thời gian vận hành" },
      { num: "50+", label: "Bài viết xử lý/tuần" },
    ],
  },
  "camp-xdcc": {
    badge: '<i class="fas fa-store"></i> Lucas Combo',
    title: "Xoay Đi Chờ Chi",
    date: "06/09/2025 - 06/10/2025",
    tagline:
      "Chiến dịch tăng doanh thu tại cửa hàng. 1 hóa đơn mua hàng = 1 lượt xoay vòng quay may mắn.",
    problem:
      "Học cách ứng biến content dựa trên tình hình thực tế tại cửa hàng.",
    strategy:
      "Lên kịch bản video dạng dẫn dắt câu chuyện + meme + cập nhật hình ảnh khách hàng thực tế.",
    execution:
      "Lập kế hoạch chiến dịch trên Google Sheet, in ấn standee/poster, trực tiếp quan sát tình hình mua hàng.",
    sheet:
      "https://docs.google.com/spreadsheets/d/1ZKpP-XwpTRJh86EiEFHs0XhB-CHrNXfi/edit?gid=1498389441",
    photos: [
      { src: "photo/xdcc.jpg", title: "Poster Vòng quay may mắn" },
      { src: "photo/xdcc2.png", title: "Bảng kế hoạch & thực thi chiến dịch" },
    ],
    videos: [
      {
        title: "Quảng cáo chiến dịch Xoay Đi Chờ Chi",
        src: "https://www.facebook.com/plugins/video.php?height=476&href=https%3A%2F%2Fwww.facebook.com%2Freel%2F1725098248137253%2F&show_text=false&width=267&t=0",
      },
      {
        title: "Quảng cáo chiến dịch Xoay Đi Chờ Chi",
        src: "https://www.facebook.com/plugins/video.php?height=476&href=https%3A%2F%2Fwww.facebook.com%2Freel%2F796570512734331%2F&show_text=false&width=267&t=0",
      },
      {
        title: "Quảng cáo túi chống sốc & chiến dịch Xoay Đi Chờ Chi",
        src: "https://www.facebook.com/plugins/video.php?height=476&href=https%3A%2F%2Fwww.facebook.com%2Freel%2F1110318384082275%2F&show_text=false&width=267&t=0",
      },
      {
        title: "Clip vui cho chiến dịch Xoay Đi Chờ Chi",
        src: "https://www.facebook.com/plugins/video.php?height=476&href=https%3A%2F%2Fwww.facebook.com%2Freel%2F1487223245746254%2F&show_text=false&width=267&t=0",
      },
    ],
    stats: [
      { num: "> 30", label: "Bài đăng (gồm reels, ảnh, story)" },
      { num: "> 500", label: "Khách hàng ghé mua và hài lòng" },
      { num: "341 triệu", label: "Doanh thu tại cửa hàng" },
    ],
  },
  "camp-dtv": {
    badge: '<i class="fas fa-bullhorn"></i> Droppii',
    title: "Điểm Tư Vấn Đạt Chuẩn Droppii",
    date: "2026",
    tagline:
      '"Chuẩn hóa quy trình tư vấn 1:1 và tôn vinh hệ thống điểm tư vấn uy tín trên toàn quốc."',
    problem:
      "Cần nâng cao chất lượng tư vấn trực tiếp của đối tác và định vị hình ảnh chuyên nghiệp cho các điểm tư vấn Droppii.",
    strategy:
      "Truyền thông chuỗi cẩm nang quy trình 5 bước tư vấn chuẩn + vinh danh các showroom điểm tư vấn đạt chứng nhận xuất sắc.",
    photos: [
      {
        src: "photo/ĐTV/DTV_1.png",
        title: "Ra mắt Điểm tư vấn đạt chuẩn tại TP.HCM",
      },
      { src: "photo/ĐTV/DTV_2.png", title: "Cẩm nang 5 bước tư vấn sản phẩm" },
      {
        src: "photo/ĐTV/DTV_3.png",
        title: "Trải nghiệm tư vấn 1:1 chuyên sâu",
      },
      {
        src: "photo/ĐTV/DTV_4.png",
        title: "Trao chứng nhận Điểm tư vấn xuất sắc",
      },
    ],
    stats: [
      { num: "180.000+", label: "Lượt tiếp cận" },
      { num: "12.000+", label: "Tương tác bài đăng" },
    ],
  },
  "camp-aiads": {
    badge: '<i class="fas fa-bullhorn"></i> Droppii',
    title: "Ads Khóa Học AI & Công Nghệ",
    date: "2026",
    tagline:
      '"Tập trung vào tính ứng dụng thực chiến: Giúp đối tác X10 hiệu suất kinh doanh nhờ công cụ AI."',
    problem:
      "Chiêu sinh các khóa học AI cho đối tác kinh doanh với yêu cầu thông điệp dễ hiểu, không hàn lâm.",
    strategy:
      'Minh họa trực quan các case study "Viết 30 bài trong 5 phút", "Thiết kế banner AI" + chứng thực từ kết quả học viên.',
    photos: [
      {
        src: "photo/MEME/AI_1.png",
        title: "Bí quyết tự động hóa bài đăng với AI",
      },
      {
        src: "photo/MEME/AI_2.png",
        title: "Viết 30 caption facebook trong 5 phút",
      },
      {
        src: "photo/MEME/AI_3.png",
        title: "Thiết kế banner & video bán hàng AI",
      },
      {
        src: "photo/MEME/AI_4.png",
        title: "Thành quả bứt phá đơn hàng của học viên",
      },
    ],
    videos: [
      {
        title: "Video AI Veo3 Ads - Quảng cáo khóa học",
        src: "https://www.facebook.com/plugins/video.php?href=https%3A%2F%2Fwww.facebook.com%2Freel%2F618290484501869%2F&show_text=false",
      },
      {
        title: "Video Gemini AI - Hướng dẫn tạo kịch bản",
        src: "https://www.facebook.com/plugins/video.php?href=https%3A%2F%2Fwww.facebook.com%2Freel%2F1697285934509172%2F&show_text=false",
      },
    ],
    stats: [
      { num: "210.000+", label: "Lượt tiếp cận Ads" },
      { num: "15.400+", label: "Tương tác quan tâm" },
    ],
  },
  "camp-77": {
    badge: '<i class="fas fa-bullhorn"></i> Droppii',
    title: "Siêu Sale Double Day 7/7",
    date: "07/2026",
    tagline:
      '"Tạo hiệu ứng FOMO săn deal Siêu Sale 7/7 cùng brief hình ảnh ưu đãi rực rỡ."',
    problem:
      "Đẩy mạnh doanh số phiên Mega Sale 7/7 và tạo hiệu ứng truyền thông đồng bộ cho hệ thống.",
    strategy:
      "Thiết kế bộ Brief hình ảnh banner ưu đãi chuẩn Meta + Video Teaser FOMO kéo tương tác.",
    briefLink: "briefs.html",
    videos: [
      {
        title: "Teaser sale 7/7 (97.000 views - Có ads)",
        src: "https://www.facebook.com/plugins/video.php?height=476&href=https%3A%2F%2Fwww.facebook.com%2Freel%2F1655116209118584%2F&show_text=false&width=476&t=0",
      },
    ],
    stats: [
      { num: "320.000+", label: "Lượt tiếp cận (Reach)" },
      { num: "510.000+", label: "Lượt hiển thị (Impressions)" },
    ],
  },
  "camp-2010": {
    badge: '<i class="fas fa-store"></i> Lucas Combo',
    title: "Tháng 10 Dịu Dàng - Trao Nàng Yêu Thương",
    date: "10/2025",
    tagline:
      '"Chương trình ưu đãi mua combo tặng quà ý nghĩa dịp Phụ nữ Việt Nam 20/10."',
    problem:
      "Kích cầu mua sắm quà tặng Phụ nữ Việt Nam 20/10 tại thương hiệu Lucas Combo.",
    strategy:
      "Xây dựng gói Combo quà tặng kèm thiệp thiết kế riêng + bài viết gợi ý quà tặng chạm cảm xúc.",
    execution:
      "Lập kế hoạch nội dung trên Google Sheet, sản xuất chuỗi video Reels & thiết kế poster quà tặng 20/10, kết hợp ưu đãi tại cửa hàng.",
    photos: [
      { src: "photo/2010.jpg", title: "Banner chiến dịch 20/10" },
      { src: "photo/20102.png", title: "Bài viết ưu đãi quà tặng 20/10" },
    ],
    videos: [
      {
        title: "Video Quảng cáo 20/10 Lucas Combo",
        src: "https://www.facebook.com/plugins/video.php?height=476&href=https%3A%2F%2Fwww.facebook.com%2Freel%2F1132298642055627%2F&show_text=false&width=267&t=0",
      },
    ],
    stats: [
      { num: "> 10", label: "Bài đăng (gồm reels, ảnh, story)" },
      { num: "16", label: "Khách nữ ghé mua và hài lòng" },
      { num: "12 triệu", label: "Doanh thu tại cửa hàng" },
    ],
  },
  "camp-thct": {
    badge: '<i class="fas fa-graduation-cap"></i> Đồ án',
    title: "Đồ án Thương mại xã hội (Tạp Hóa Content)",
    date: "10/2025 - 12/2025",
    tagline:
      '"Xây dựng Fanpage Tạp hóa Content từ con số 0 với kế hoạch nội dung đa dạng."',
    problem:
      "Xây dựng thương hiệu trang Tạp hóa Content thu hút người làm truyền thông trẻ.",
    strategy:
      "Triển khai luồng nội dung đa dạng: Kiến thức Content, Meme hài hước văn phòng, Case study phân tích.",
    sheet:
      "https://docs.google.com/spreadsheets/d/11hDVcBBFUSz9cr09Bz_EY0ZAwz9vE-gbU1U3S9Yrgqo/edit?gid=1420815595#gid=1420815595",
    photos: [
      { src: "photo/thct.png", title: "Quản lý Fanpage Tạp hóa Content" },
      { src: "photo/thct1.png", title: "Kế hoạch truyền thông Fanpage" },
      { src: "photo/report1.png", title: "Overview báo cáo Fanpage" },
    ],
    stats: [
      { num: "> 100", label: "Bài đăng (gồm reels, ảnh, bài viết, story)" },
      { num: "> 50.000", label: "Lượt xem trang" },
      { num: "~ 5 triệu", label: "Doanh thu MEGA LIVE" },
    ],
  },
  "camp-delifood": {
    badge: '<i class="fas fa-graduation-cap"></i> Đồ án',
    title: "Đồ án Digital Marketing (Delifood Vietnam)",
    date: "10/2024 - 12/2024",
    tagline:
      '"Xây dựng hệ sinh thái Omnichannel: Fanpage, TikTok, Figma Landing Page & Website WordPress."',
    problem:
      "Xây dựng sự hiện diện đa kênh cho thương hiệu thực phẩm Delifood Vietnam.",
    strategy:
      "Thiết kế bộ nhận diện thương hiệu, Landing Page Figma, Website WordPress và các bài đăng quảng bá sản phẩm khô chay & khô bò.",
    photos: [
      { src: "photo/khochay.jpg", title: "Banner Quảng cáo Khô Chay Delifood" },
      {
        src: "photo/delifood2.jpg",
        title: "Khô Bò Cay Delifood - Visual Post",
      },
    ],
    stats: [
      { num: "~ 30", label: "Bài đăng (gồm reels, ảnh, story)" },
      { num: "7.400", label: "Lượt xem trang tự nhiên" },
      { num: "9đ", label: "Nhóm có điểm đồ án cao nhất lớp" },
    ],
  },
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
    <div class="campaign-card" style="border-left: 5px solid #0284c7;">
      <div class="campaign-header-row">
        <div class="campaign-title">
          ${p.badge ? `<span class="campaign-brand-badge">${p.badge}</span>` : ""}
          <h1 style="font-size: 1.6rem; font-weight: 800; color: #0f172a; margin: 0; display: inline-flex; align-items: center; gap: 0.5rem;">${p.title}</h1>
        </div>
        <div class="campaign-date">${p.date}</div>
      </div>
      <div class="campaign-tagline">${p.tagline}</div>

      <div class="psr-grid">
        <div class="psr-box">
          <div class="psr-label"><i class="fas fa-bullseye"></i> Problem / Thử thách</div>
          <div class="psr-text">${p.problem || "Tối ưu hóa chiến dịch truyền thông."}</div>
        </div>
        ${p.strategy ? `<div class="psr-box"><div class="psr-label"><i class="fas fa-lightbulb"></i> Core Strategy / Ý tưởng</div><div class="psr-text">${p.strategy}</div></div>` : ""}
        ${p.execution ? `<div class="psr-box"><div class="psr-label"><i class="fas fa-layer-group"></i> Multi-Format Execution</div><div class="psr-text">${p.execution}</div></div>` : ""}
      </div>

      <div style="display: flex; gap: 0.8rem; flex-wrap: wrap; margin: 1rem 0;">
        ${p.sheet ? `<a href="${p.sheet}" target="_blank" class="btn-campaign-action btn-secondary"><i class="fas fa-table"></i> Google Sheet chiến dịch</a>` : ""}
        ${p.briefLink ? `<a href="${p.briefLink}" class="btn-campaign-action btn-secondary"><i class="fas fa-file-alt"></i> Xem Chi Tiết Brief & Output</a>` : ""}
      </div>
  `;

  // Render 1: Bài đăng nổi bật (từ meme.html)
  if (p.featuredPosts && p.featuredPosts.length > 0) {
    html += `
      <div style="margin-top: 2.5rem;">
        <h2 class="section-title" style="font-size: 1.45rem; color: #0284c7; margin-bottom: 1rem;">Bài Đăng Nổi Bật</h2>
        <div class="meme-grid">
          ${p.featuredPosts
            .map(
              (post) => `
            <div class="meme-card">
              <div class="locket-gallery">
                ${post.imgs
                  .map(
                    (imgSrc, idx) => `
                  <div class="gallery-item ${idx === 0 ? "active" : ""}">
                    <img src="${imgSrc}" alt="${post.caption}" />
                  </div>
                `,
                  )
                  .join("")}
                <div class="gallery-counter">1/${post.imgs.length}</div>
              </div>
              <div class="meme-caption">
                <p>${formatCaptionHTML(post.caption)}</p>
              </div>
            </div>
          `,
            )
            .join("")}
        </div>
      </div>
    `;
  }

  // Render 2: Từ Brief cho đến Thành phẩm (từ brief.html)
  if (p.briefToOutput && p.briefToOutput.length > 0) {
    html += `
      <div style="margin-top: 2.5rem;">
        <h2 class="section-title" style="font-size: 1.45rem; color: #0284c7; margin-bottom: 1rem;">Từ Brief Cho Đến Thành Phẩm</h2>
        ${p.briefToOutput
          .map(
            (b) => `
          <div class="brief-card" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 1.2rem; padding: 1.5rem; margin-bottom: 1.8rem; box-shadow: 0 4px 16px -6px rgba(15, 23, 42, 0.05);">
            <div class="brief-card-title" style="font-size: 1.15rem; font-weight: 700; margin-bottom: 1rem; color: #0f172a;">
              <i class="fas fa-folder-open" style="color: #0284c7; margin-right: 0.5rem;"></i>
              <a href="${b.link}" target="_blank" rel="noopener noreferrer" class="brief-title-link">
                ${b.title} <i class="fas fa-external-link-alt" style="font-size: 0.85rem; color: #0284c7; margin-left: 0.3rem;"></i>
              </a>
            </div>

            <div class="brief-card-grid">
              <div>
                <div class="brief-col-header">Brief Yêu Cầu</div>
                <div class="locket-gallery" style="height: 320px; border-radius: 0.8rem; overflow: hidden;">
                  ${b.briefImgs
                    .map(
                      (img, idx) => `
                    <div class="gallery-item ${idx === 0 ? "active" : ""}">
                      <img src="${img}" alt="Brief Image" />
                    </div>
                  `,
                    )
                    .join("")}
                  <div class="gallery-counter">1/${b.briefImgs.length}</div>
                </div>
              </div>
              <div>
                <div class="brief-col-header">Loạt Ảnh Thành Quả</div>
                <div class="locket-gallery" style="height: 320px; border-radius: 0.8rem; overflow: hidden;">
                  ${b.resultImgs
                    .map(
                      (img, idx) => `
                    <div class="gallery-item ${idx === 0 ? "active" : ""}">
                      <img src="${img}" alt="Result Image" />
                    </div>
                  `,
                    )
                    .join("")}
                  <div class="gallery-counter">1/${b.resultImgs.length}</div>
                </div>
              </div>
            </div>

            <div class="brief-footer" style="display: flex; justify-content: flex-end; align-items: center; margin-top: 1rem; padding-top: 0.8rem; border-top: 1px dashed #e2e8f0; flex-wrap: wrap; gap: 1rem;">
              <div class="brief-stats" style="display: flex; gap: 1rem;">
                <div class="stat-box" style="background: #f0f9ff; border: 1.5px solid #bae6fd; padding: 0.45rem 1.1rem; border-radius: 24px; font-size: 0.98rem; font-weight: 700; color: #0284c7; box-shadow: 0 2px 8px rgba(2, 132, 199, 0.12);">
                  <span><i class="fas fa-eye" style="margin-right: 0.4rem;"></i>${b.views} Lượt xem</span>
                </div>
                <div class="stat-box" style="background: #f0f9ff; border: 1.5px solid #bae6fd; padding: 0.45rem 1.1rem; border-radius: 24px; font-size: 0.98rem; font-weight: 700; color: #0284c7; box-shadow: 0 2px 8px rgba(2, 132, 199, 0.12);">
                  <span><i class="fas fa-users" style="margin-right: 0.4rem;"></i>${b.reach} Người xem</span>
                </div>
              </div>
            </div>
          </div>
        `,
          )
          .join("")}
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
            .map(
              (v) => `
            <div class="reel-card">
              <div class="reel-embed">
                <iframe src="${v.src}" scrolling="no" allowfullscreen="true" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"></iframe>
              </div>
              <div class="reel-caption">${formatCaptionHTML(v.title)}</div>
            </div>
          `,
            )
            .join("")}
        </div>
      </div>
    `;
  }

  // Render Photos belonging to this project
  if (p.photos && p.photos.length > 0) {
    html += `
      <div style="margin-top: 2rem;">
        <h3 class="section-title" style="font-size: 1.45rem; color: #0284c7; margin-bottom: 1.6rem; display: inline-block;">
          KẾT QUẢ CHIẾN DỊCH
          <span style="display: block; font-size: 0.85rem; font-weight: 500; text-transform: none; letter-spacing: normal; color: #64748b; margin-top: 0.35rem;">
          </span>
        </h3>
        <div class="work-samples" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); gap: 1.5rem; overflow-x: visible;">
          ${p.photos
            .map(
              (img) => `
            ${
              img.link
                ? `
              <a href="${img.link}" target="_blank" rel="noopener noreferrer" class="work-sample-item" style="width: 100%; text-decoration: none;">
                <img src="${img.src}" alt="${img.title}" style="height: 280px; object-fit: contain; background: #f8fafc;" />
                <span><i class="fas fa-external-link-alt" style="font-size: 0.8rem; color: #0284c7; margin-right: 4px;"></i> ${formatCaptionHTML(img.title)}</span>
              </a>
            `
                : `
              <div class="work-sample-item" style="width: 100%;">
                <img src="${img.src}" alt="${img.title}" style="height: 280px; object-fit: contain; background: #f8fafc;" />
                <span>${formatCaptionHTML(img.title)}</span>
              </div>
            `
            }
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
