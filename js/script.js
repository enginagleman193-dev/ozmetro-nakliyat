/* ============================================= */
/* TEMEL DOM ELEMENTLERİ */
/* ============================================= */
document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Preloader (Yükleniyor Ekranı) Fonksiyonu
    const preloader = document.querySelector('.preloader');
    if (preloader) {
        window.addEventListener('load', () => {
            preloader.classList.add('preloader-hidden');
        });
    }

    // 2. Header (Menü) Kaydırma Fonksiyonu
    const header = document.querySelector('.main-header');
    // Sadece .header-transparent class'ına sahip header'ları etkile
    if (header && header.classList.contains('header-transparent')) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }

    // 3. Ana Sayfa Hero Slider Fonksiyonu
    const heroSlider = document.querySelector('.hero-slider');
    if (heroSlider) {
        const slides = document.querySelectorAll('.hero-slider .slide');
        const prevBtn = document.querySelector('.hero-slider-container .prev');
        const nextBtn = document.querySelector('.hero-slider-container .next');
        let currentSlide = 0;
        const slideInterval = 5000; // 5 saniyede bir değişir
        let autoSlide;

        function showSlide(index) {
            slides.forEach((slide, i) => {
                slide.classList.remove('active');
                if (i === index) {
                    slide.classList.add('active');
                }
            });
            currentSlide = index;
        }

        function nextSlide() {
            let newIndex = (currentSlide + 1) % slides.length;
            showSlide(newIndex);
        }

        function prevSlide() {
            let newIndex = (currentSlide - 1 + slides.length) % slides.length;
            showSlide(newIndex);
        }

        if (slides.length > 0) {
            showSlide(0); // İlk slaytı göster
            autoSlide = setInterval(nextSlide, slideInterval); // Otomatik başlat
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                nextSlide();
                clearInterval(autoSlide);
                autoSlide = setInterval(nextSlide, slideInterval);
            });
        }
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                prevSlide();
                clearInterval(autoSlide);
                autoSlide = setInterval(nextSlide, slideInterval);
            });
        }
    }

    // 4. AOS Başlatma
    AOS.init({
        duration: 800,
        once: true,
        offset: 50,
    });

    // 5. Rakamlarla Biz (Sayaç) Fonksiyonu
    const counters = document.querySelectorAll('.stat-item .counter');
    if (counters.length > 0) {
        const speed = 200;

        const startCounter = (counter) => {
            const target = +counter.getAttribute('data-target');
            const updateCount = () => {
                const count = +counter.innerText;
                const increment = target / speed;

                if (count < target) {
                    counter.innerText = Math.ceil(count + increment);
                    setTimeout(updateCount, 15);
                } else {
                    counter.innerText = target;
                }
            };
            updateCount();
        };

        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    startCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.5
        });

        counters.forEach(counter => {
            counter.innerText = '0';
            observer.observe(counter);
        });
    }
    
    // 6. İş Ortakları (Swiper JS) Slider'ı
    if (document.querySelector('.partners-slider')) {
        new Swiper('.partners-slider', {
            loop: true,
            autoplay: {
                delay: 2500,
                disableOnInteraction: false,
            },
            slidesPerView: 2,
            spaceBetween: 20,
            breakpoints: {
                640: {
                    slidesPerView: 3,
                    spaceBetween: 30,
                },
                768: {
                    slidesPerView: 4,
                    spaceBetween: 40,
                },
                1024: {
                    slidesPerView: 5,
                    spaceBetween: 50,
                },
            }
        });
    }

});

    // 7. Müşteri Yorumları (Swiper Slider)
    if (document.querySelector('.testimonials-slider')) {
        new Swiper('.testimonials-slider', {
            loop: true,
            autoplay: {
                delay: 5000,
                disableOnInteraction: false,
            },
            slidesPerView: 1,
            centeredSlides: true,
            spaceBetween: 20,
            pagination: {
                el: '.testimonials-slider .swiper-pagination',
                clickable: true,
            },
            navigation: {
                nextEl: '.testimonials-slider .swiper-button-next',
                prevEl: '.testimonials-slider .swiper-button-prev',
            },
            breakpoints: {
                768: {
                    slidesPerView: 1.2,
                    spaceBetween: 30,
                },
                1024: {
                    slidesPerView: 1.5,
                    spaceBetween: 40,
                }
            }
        });
    }



/* ============================================= */
/* YORUM PANELİ (LocalStorage) */
/* ============================================= */
(function () {
  const form = document.getElementById("commentForm");
  const list = document.getElementById("commentsList");
  const STORAGE_KEY = "ozmetro_comments_v1";

  if (!form || !list) return;

  const escapeHtml = (str) =>
    String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");

  const load = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  };

  const save = (items) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // no-op
    }
  };

  const renderStars = (rating) => {
    const r = Math.max(1, Math.min(5, Number(rating) || 5));
    const full = "★".repeat(r);
    const empty = "☆".repeat(5 - r);
    return `<span class="stars" aria-label="Puan: ${r}/5">${full}${empty}</span>`;
  };

  const render = () => {
    const items = load();
    if (!items.length) {
      list.innerHTML = `<div class="comment-empty">Henüz yorum yok. İlk yorumu siz bırakın.</div>`;
      return;
    }

    list.innerHTML = items
      .slice()
      .reverse()
      .map((it) => {
        const when = new Date(it.ts || Date.now()).toLocaleDateString("tr-TR");
        return `
          <div class="comment-card">
            <div class="comment-top">
              <div class="comment-name">${escapeHtml(it.name || "Misafir")}</div>
              <div class="comment-meta">
                ${renderStars(it.rating)}
                <span class="comment-date">${when}</span>
              </div>
            </div>
            <div class="comment-body">${escapeHtml(it.comment || "")}</div>
          </div>
        `;
      })
      .join("");
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const name = (fd.get("name") || "").toString().trim();
    const rating = (fd.get("rating") || "5").toString().trim();
    const comment = (fd.get("comment") || "").toString().trim();

    if (!name || !comment) return;

    const items = load();
    items.push({ name, rating, comment, ts: Date.now() });
    save(items);
    form.reset();
    render();
  });

  render();
})();
