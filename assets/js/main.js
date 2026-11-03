window.addEventListener('DOMContentLoaded', () => {
    /* Proteção: se GSAP/ScrollTrigger não carregarem, a página aparece sem animações */
    const showStatic = () => {
      const pl = document.getElementById('preloader');
      if (pl) pl.style.display = 'none';
      document.querySelectorAll('#hero-title .word-inner').forEach(w => (w.style.transform = 'none'));
      document.querySelectorAll('.reveal-clip').forEach(c => (c.style.clipPath = 'none'));
    };
    setTimeout(() => { const pl = document.getElementById('preloader'); if (pl && pl.style.display !== 'none') showStatic(); }, 4000); // nunca deixa o visitante preso na tela de carregamento
    if (!window.gsap || !window.ScrollTrigger) { showStatic(); return; }

    gsap.registerPlugin(ScrollTrigger);

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isDesktop = window.matchMedia('(min-width: 1024px)').matches;

    /* -----------------------------------------------------------
       1. TELA DE CARREGAMENTO CURTA (ATÉ 1.2S) + ENTRADA DO HERO
       ----------------------------------------------------------- */
    const preloader = document.getElementById('preloader');
    const preloaderBrand = document.getElementById('preloader-brand');
    const preloaderBar = document.getElementById('preloader-bar');
    const heroWords = document.querySelectorAll('#hero-title .word-inner');

    if (!prefersReducedMotion) {
      const tlIntro = gsap.timeline();
      tlIntro
        .to(preloaderBrand, { y: '0%', duration: 0.45, ease: 'power3.out' })
        .to(preloaderBar, { width: '100%', duration: 0.55, ease: 'power2.inOut' }, '-=0.25')
        .to(preloader, {
          opacity: 0,
          duration: 0.35,
          ease: 'power2.out',
          onComplete: () => {
            preloader.style.display = 'none';
          }
        })
        .to(heroWords, {
          y: '0%',
          duration: 0.9,
          stagger: 0.045,
          ease: 'power3.out'
        }, '-=0.2');
    } else {
      preloader.style.display = 'none';
      heroWords.forEach(w => (w.style.transform = 'translateY(0%)'));
    }

    /* -----------------------------------------------------------
       2. ROLAGEM SUAVE COM LENIS (APENAS SE NÃO HOUVER REDUCED MOTION)
       ----------------------------------------------------------- */
    let lenis = null;
    if (!prefersReducedMotion && typeof Lenis !== 'undefined') {
      lenis = new Lenis({
        duration: 1.15,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        smoothTouch: false
      });

      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    }

    /* -----------------------------------------------------------
       3. CABEÇALHO TRANSPARENTE -> VIDRO FOSCO AO ROLAR
       ----------------------------------------------------------- */
    const mainHeader = document.getElementById('main-header');
    window.addEventListener('scroll', () => {
      if (window.scrollY > 40) {
        mainHeader.classList.add('nav-scrolled');
      } else {
        mainHeader.classList.remove('nav-scrolled');
      }
    }, { passive: true });

    /* -----------------------------------------------------------
       4. ANIMAÇÕES DESKTOP (CLIP-PATH, PARALLAX, GALERIA PINADA)
       ----------------------------------------------------------- */
    if (!prefersReducedMotion && isDesktop) {
      // Revelação por clip-path nas imagens grandes
      gsap.utils.toArray('.reveal-clip').forEach((container) => {
        gsap.fromTo(container,
          { clipPath: 'inset(100% 0% 0% 0%)' },
          {
            clipPath: 'inset(0% 0% 0% 0%)',
            duration: 1.25,
            ease: 'power3.inOut',
            scrollTrigger: {
              trigger: container,
              start: 'top 85%',
              once: true
            }
          }
        );
      });

      // Parallax leve nas fotos
      gsap.utils.toArray('.parallax-img').forEach((img) => {
        gsap.fromTo(img,
          { yPercent: -5 },
          {
            yPercent: 5,
            ease: 'none',
            scrollTrigger: {
              trigger: img.parentElement,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true
            }
          }
        );
      });

      // Galeria Horizontal Pinada na seção de Projetos
      const pinWrapper = document.getElementById('projects-pin-wrapper');
      const track = document.getElementById('projects-track');

      if (pinWrapper && track) {
        const getScrollDistance = () => -(track.scrollWidth - window.innerWidth + 80);

        gsap.to(track, {
          x: getScrollDistance,
          ease: 'none',
          scrollTrigger: {
            trigger: pinWrapper,
            pin: true,
            scrub: 1,
            start: 'top top',
            end: () => `+=${track.scrollWidth - window.innerWidth}`,
            invalidateOnRefresh: true
          }
        });
      }
    }

    /* -----------------------------------------------------------
       5. CONTADORES ANIMADOS
       ----------------------------------------------------------- */
    if (!prefersReducedMotion) {
      gsap.utils.toArray('.counter-num').forEach((el) => {
        const target = parseInt(el.getAttribute('data-target'), 10);
        const startVal = target > 100 ? 2020 : 0;
        const obj = { val: startVal };

        gsap.to(obj, {
          val: target,
          duration: 1.6,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 90%',
            once: true
          },
          onUpdate: () => {
            el.textContent = Math.round(obj.val);
          }
        });
      });
    }

    /* -----------------------------------------------------------
       6. SERVIÇOS: FOTO FLUTUANTE QUE SEGUE O CURSOR (DESKTOP)
       ----------------------------------------------------------- */
    const previewBox = document.getElementById('service-hover-preview');
    const previewImg = document.getElementById('service-hover-img');
    const serviceRows = document.querySelectorAll('.service-row');

    if (isDesktop && !prefersReducedMotion && previewBox && previewImg) {
      let mouseX = 0, mouseY = 0;
      let boxX = 0, boxY = 0;

      window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
      }, { passive: true });

      gsap.ticker.add(() => {
        boxX += (mouseX - boxX) * 0.14;
        boxY += (mouseY - boxY) * 0.14;
        previewBox.style.left = `${boxX + 36}px`;
        previewBox.style.top = `${boxY}px`;
      });

      serviceRows.forEach((row) => {
        row.addEventListener('mouseenter', () => {
          const imgUrl = row.getAttribute('data-image');
          if (imgUrl && previewImg.src !== imgUrl) {
            previewImg.src = imgUrl;
          }
          previewBox.classList.add('active');
        });
        row.addEventListener('mouseleave', () => {
          previewBox.classList.remove('active');
        });
      });
    }

    /* -----------------------------------------------------------
       7. CURSOR PERSONALIZADO & BOTÕES MAGNÉTICOS (DESKTOP)
       ----------------------------------------------------------- */
    const cursor = document.getElementById('custom-cursor');
    if (isDesktop && !prefersReducedMotion && cursor) {
      window.addEventListener('mousemove', (e) => {
        gsap.to(cursor, {
          x: e.clientX,
          y: e.clientY,
          duration: 0.15,
          ease: 'power2.out'
        });
      }, { passive: true });

      document.querySelectorAll('a, button, .service-row').forEach((interactive) => {
        interactive.addEventListener('mouseenter', () => cursor.classList.add('cursor-expanded'));
        interactive.addEventListener('mouseleave', () => cursor.classList.remove('cursor-expanded'));
      });

      // Efeito Magnético suave nos botões principais
      document.querySelectorAll('.magnetic-btn').forEach((btn) => {
        btn.addEventListener('mousemove', (e) => {
          const rect = btn.getBoundingClientRect();
          const relX = e.clientX - rect.left - rect.width / 2;
          const relY = e.clientY - rect.top - rect.height / 2;
          gsap.to(btn, {
            x: relX * 0.22,
            y: relY * 0.22,
            duration: 0.3,
            ease: 'power2.out'
          });
        });
        btn.addEventListener('mouseleave', () => {
          gsap.to(btn, {
            x: 0,
            y: 0,
            duration: 0.45,
            ease: 'elastic.out(1, 0.5)'
          });
        });
      });
    }

    /* -----------------------------------------------------------
       8. ACORDEÃO DO FAQ
       ----------------------------------------------------------- */
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach((item) => {
      const toggle = item.querySelector('.faq-toggle');
      const answer = item.querySelector('.faq-answer');

      toggle.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');

        // Fecha outros itens abertos
        faqItems.forEach((other) => {
          other.classList.remove('open');
          other.querySelector('.faq-answer').style.maxHeight = null;
        });

        if (!isOpen) {
          item.classList.add('open');
          answer.style.maxHeight = answer.scrollHeight + 'px';
        }
      });
    });
  });
