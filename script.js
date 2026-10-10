// NK9 Wise Academy - Dog Training: Train Smart. Live Better.
// 3D Interactive Engine & Motion System

// Global modal helpers available immediately
window.switchTermsTab = function(targetTabId) {
  const modal = document.getElementById('termsModal');
  if (!modal) return;
  const cleanId = (targetTabId && targetTabId.startsWith('tab-')) ? targetTabId : `tab-${targetTabId || 'terms'}`;

  const btns = modal.querySelectorAll('.terms-tab-btn');
  const contents = modal.querySelectorAll('.terms-tab-content');

  btns.forEach(btn => {
    const isTarget = btn.getAttribute('data-tab') === cleanId;
    btn.classList.toggle('active', isTarget);
    btn.setAttribute('aria-selected', isTarget ? 'true' : 'false');
  });

  contents.forEach(content => {
    const isTarget = content.id === cleanId;
    content.classList.toggle('active', isTarget);
  });

  const bodyEl = modal.querySelector('.terms-modal-body');
  if (bodyEl) {
    bodyEl.scrollTop = 0;
  }
};

window.openTermsModal = function(tabId = 'tab-terms') {
  const modal = document.getElementById('termsModal');
  if (modal) {
    window.switchTermsTab(tabId);
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Guarantee that both modal viewport and modal text body are scrolled to the top
    modal.scrollTop = 0;
    const bodyEl = modal.querySelector('.terms-modal-body');
    if (bodyEl) {
      bodyEl.scrollTop = 0;
    }

    requestAnimationFrame(() => {
      modal.scrollTop = 0;
      if (bodyEl) bodyEl.scrollTop = 0;
    });

    setTimeout(() => {
      modal.scrollTop = 0;
      if (bodyEl) bodyEl.scrollTop = 0;
    }, 40);
  }
};

window.closeTermsModal = function() {
  const modal = document.getElementById('termsModal');
  if (modal) {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
};

window.openCookieBanner = function() {
  const banner = document.getElementById('cookieBanner');
  if (banner) {
    banner.style.display = 'block';
    requestAnimationFrame(() => {
      banner.classList.add('show');
    });
  }
};

window.closeCookieBanner = function() {
  const banner = document.getElementById('cookieBanner');
  if (banner) {
    banner.classList.remove('show');
    setTimeout(() => {
      banner.style.display = 'none';
    }, 350);
  }
};

document.addEventListener('DOMContentLoaded', () => {

  /* ===================================================
     1. High-Performance 3D Tilt Engine with Dynamic Glare
     =================================================== */
  const tiltCards = document.querySelectorAll('.tilt-card');

  tiltCards.forEach(card => {
    // Inject dynamic glare layer if not present
    let glare = card.querySelector('.card-glare');
    if (!glare) {
      glare = document.createElement('div');
      glare.className = 'card-glare';
      glare.style.position = 'absolute';
      glare.style.top = '0';
      glare.style.left = '0';
      glare.style.width = '100%';
      glare.style.height = '100%';
      glare.style.pointerEvents = 'none';
      glare.style.borderRadius = 'inherit';
      glare.style.background = 'radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0) 70%)';
      glare.style.opacity = '0';
      glare.style.transition = 'opacity 0.25s ease';
      glare.style.zIndex = '15';
      card.appendChild(glare);
    }

    const maxTilt = parseFloat(card.getAttribute('data-tilt-max')) || 12;

    const handleMouseMove = (e) => {
      if (card.classList.contains('is-playing')) return;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      // Calculate rotation angles
      const rotateX = ((centerY - y) / centerY) * maxTilt;
      const rotateY = ((x - centerX) / centerX) * maxTilt;
      
      card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.025, 1.025, 1.025)`;
      
      // Update glare position
      const glareX = (x / rect.width) * 100;
      const glareY = (y / rect.height) * 100;
      glare.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0) 65%)`;
      glare.style.opacity = '1';
    };

    const handleMouseLeave = () => {
      card.style.transition = 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)';
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      glare.style.opacity = '0';
      
      setTimeout(() => {
        card.style.transition = '';
      }, 500);
    };

    const handleMouseEnter = () => {
      card.style.transition = 'transform 0.1s ease-out';
    };

    card.addEventListener('mouseenter', handleMouseEnter);
    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseleave', handleMouseLeave);
  });

  /* ===================================================
     2. 3D Ambient Mouse Parallax for Floating Elements
     =================================================== */
  const floatingItems = document.querySelectorAll('.float-3d-item');
  const heroImage = document.querySelector('.hero-3d-card');

  window.addEventListener('mousemove', (e) => {
    const mouseX = (e.clientX / window.innerWidth) - 0.5;
    const mouseY = (e.clientY / window.innerHeight) - 0.5;

    floatingItems.forEach((item, index) => {
      const speed = (index + 1) * 22;
      const x = mouseX * speed;
      const y = mouseY * speed;
      item.style.transform = `translate(${x}px, ${y}px) rotate(${x * 0.4}deg)`;
    });

    if (heroImage && window.innerWidth > 1024) {
      const heroX = mouseX * 18;
      const heroY = mouseY * 18;
      heroImage.style.transform = `translate3d(${heroX}px, ${heroY}px, 0)`;
    }
  });

  /* ===================================================
     3. 3D Scroll Reveal Animation (Intersection Observer)
     =================================================== */
  const revealElements = document.querySelectorAll('.reveal-3d');

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach((el, index) => {
      // Add subtle stagger to siblings
      if (el.parentElement && (
          el.parentElement.classList.contains('problems-grid') || 
          el.parentElement.classList.contains('programs-grid') ||
          el.parentElement.classList.contains('special-grid') ||
          el.parentElement.classList.contains('transformations-grid') ||
          el.parentElement.classList.contains('areas-grid') ||
          el.parentElement.classList.contains('testimonials-grid') ||
          el.parentElement.classList.contains('process-grid')
      )) {
        el.style.transitionDelay = `${(index % 4) * 0.12}s`;
      }
      revealObserver.observe(el);
    });
  } else {
    // Fallback if browser doesn't support IntersectionObserver
    revealElements.forEach(el => el.classList.add('active'));
  }

  /* ===================================================
     4. Animated 3D Numerical Counters
     =================================================== */
  const counters = document.querySelectorAll('.counter');
  let hasAnimatedCounters = false;

  const animateCounters = () => {
    counters.forEach(counter => {
      const target = +counter.getAttribute('data-target');
      const duration = 1800; // ms
      const startTime = performance.now();

      const updateCount = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing: easeOutExpo
        const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        const currentVal = Math.floor(easeProgress * target);

        if (target >= 1000) {
          counter.textContent = currentVal.toLocaleString('el-GR');
        } else {
          counter.textContent = currentVal;
        }

        if (progress < 1) {
          requestAnimationFrame(updateCount);
        } else {
          counter.textContent = target >= 1000 ? target.toLocaleString('el-GR') : target;
        }
      };

      requestAnimationFrame(updateCount);
    });
  };

  if ('IntersectionObserver' in window && counters.length > 0) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !hasAnimatedCounters) {
          hasAnimatedCounters = true;
          animateCounters();
        }
      });
    }, { threshold: 0.3 });

    const statsContainer = document.querySelector('.trainer-specs') || counters[0];
    if (statsContainer) {
      counterObserver.observe(statsContainer);
    }
  }

  /* ===================================================
     5. Slide-Out Mobile Navigation Drawer
     =================================================== */
  const mobileToggle = document.getElementById('mobileToggle');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const drawerClose = document.getElementById('drawerClose');
  const drawerBackdrop = document.getElementById('drawerBackdrop');

  const openDrawer = () => {
    if (mobileDrawer) {
      mobileDrawer.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  };

  const closeDrawer = () => {
    if (mobileDrawer) {
      mobileDrawer.classList.remove('open');
      document.body.style.overflow = '';
    }
  };

  if (mobileToggle) {
    mobileToggle.addEventListener('click', openDrawer);
  }

  if (drawerClose) {
    drawerClose.addEventListener('click', closeDrawer);
  }

  if (drawerBackdrop) {
    drawerBackdrop.addEventListener('click', closeDrawer);
  }

  // Close drawer when any link inside it is clicked
  if (mobileDrawer) {
    mobileDrawer.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        closeDrawer();
      });
    });
  }

  // Close drawer on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileDrawer && mobileDrawer.classList.contains('open')) {
      closeDrawer();
    }
  });

  /* ===================================================
     6. FAQ Accordion Interaction
     =================================================== */
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question');
    if (!questionBtn) return;

    questionBtn.addEventListener('click', () => {
      const isOpen = item.classList.contains('faq-open');

      // Close other items
      faqItems.forEach(otherItem => {
        otherItem.classList.remove('faq-open');
        otherItem.classList.remove('active');
      });

      // Toggle clicked item
      if (!isOpen) {
        item.classList.add('faq-open');
        item.classList.add('active');
      }
    });
  });

  /* ===================================================
     7. Lead Generation Form Submission (Direct to gregsfak@hotmail.com)
     =================================================== */
  const leadForm = document.getElementById('leadForm');
  const successMsg = document.getElementById('successMsg');

  if (leadForm) {
    leadForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Retrieve form values
      const name = document.getElementById('ownerName').value.trim();
      const phone = document.getElementById('phone').value.trim();
      const dogName = document.getElementById('dogName').value.trim() || 'Δεν ορίστηκε';
      const dogAge = document.getElementById('dogAge').value.trim() || 'Δεν ορίστηκε';
      const clientArea = document.getElementById('clientArea').value.trim();
      const preferredContact = document.getElementById('preferredContact').value;
      const programSelect = document.getElementById('programSelect').value;
      const preferredTime = document.getElementById('preferredTime').value;
      const message = document.getElementById('message').value.trim() || 'Χωρίς επιπλέον σχόλια';
      const agreeTerms = document.getElementById('agreeTerms');

      if (!name || !phone || !clientArea) {
        alert('Παρακαλούμε συμπληρώστε τα υποχρεωτικά πεδία (Ονοματεπώνυμο, Τηλέφωνο και Περιοχή).');
        return;
      }

      if (agreeTerms && !agreeTerms.checked) {
        alert('Παρακαλούμε αποδεχτείτε τους Όρους Χρήσης, την Πολιτική Απορρήτου & GDPR και την Πολιτική Cookies για να προχωρήσετε στην υποβολή.');
        agreeTerms.focus();
        return;
      }

      // Button feedback
      const submitBtn = leadForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Αποστολή αίτησης...';
      submitBtn.disabled = true;

      // Prepare data
      const formDataObj = {
        'Ονοματεπώνυμο': name,
        'Τηλέφωνο': phone,
        'Όνομα & Ράτσα Σκύλου': dogName,
        'Ηλικία Σκύλου': dogAge,
        'Περιοχή / Δήμος': clientArea,
        'Προτιμώμενος Τρόπος Επικοινωνίας': preferredContact,
        'Πρόγραμμα': programSelect,
        'Ώρα Επικοινωνίας': preferredTime,
        'Μήνυμα / Δυσκολία': message,
        'Αποδοχή Όρων, GDPR & Cookies': agreeTerms && agreeTerms.checked ? 'ΝΑΙ' : 'ΟΧΙ'
      };

      // 1. If running on cPanel/PHP server, post directly to submit-lead.php (saves to leads.csv & sends email)
      let phpSaved = false;
      try {
        const phpRes = await fetch('submit-lead.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(formDataObj)
        });

        if (phpRes.ok) {
          const phpData = await phpRes.json();
          if (phpData && phpData.success) {
            phpSaved = true;
          }
        }
      } catch (phpErr) {
        // Normal when previewing on GitHub Pages or local file without PHP server
        console.info('submit-lead.php not active on this host, running fallback:', phpErr);
      }

      if (phpSaved) {
        leadForm.reset();
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;

        if (successMsg) {
          successMsg.innerHTML = `
            <div style="font-size: 1.15rem; font-weight: 800; margin-bottom: 6px;">🎉 Ευχαριστούμε πολύ, ${name}!</div>
            <div style="font-size: 0.95rem; line-height: 1.5;">Η αίτησή σας καταχωρήθηκε επιτυχώς στο σύστημα! Θα επικοινωνήσουμε άμεσα μαζί σας στο <strong>${phone}</strong>.</div>
          `;
          successMsg.style.display = 'block';
          successMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          setTimeout(() => {
            successMsg.style.display = 'none';
          }, 12000);
        }
        return;
      }

      // 2. If running in WordPress (nk9_ajax_obj is available), submit to WP AJAX
      if (typeof nk9_ajax_obj !== 'undefined' && nk9_ajax_obj.ajax_url) {
        try {
          const wpFormData = new FormData();
          wpFormData.append('action', 'nk9_lead_submit');
          wpFormData.append('nonce', nk9_ajax_obj.nonce);
          wpFormData.append('fullname', name);
          wpFormData.append('phone', phone);
          wpFormData.append('dog_name', dogName);
          wpFormData.append('dog_age', dogAge);
          wpFormData.append('area', clientArea);
          wpFormData.append('contact_method', preferredContact);
          wpFormData.append('program', programSelect);
          wpFormData.append('call_time', preferredTime);
          wpFormData.append('message', message);
          wpFormData.append('agree_terms', agreeTerms && agreeTerms.checked ? 1 : 0);

          const wpRes = await fetch(nk9_ajax_obj.ajax_url, {
            method: 'POST',
            body: wpFormData
          });
          const wpData = await wpRes.json();

          if (wpData.success) {
            leadForm.reset();
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;

            if (successMsg) {
              successMsg.innerHTML = `
                <div style="font-size: 1.15rem; font-weight: 800; margin-bottom: 6px;">🎉 Ευχαριστούμε πολύ, ${name}!</div>
                <div style="font-size: 0.95rem; line-height: 1.5;">Η αίτησή σας καταχωρήθηκε επιτυχώς! Θα επικοινωνήσουμε μαζί σας στο <strong>${phone}</strong>.</div>
              `;
              successMsg.style.display = 'block';
              successMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
              setTimeout(() => {
                successMsg.style.display = 'none';
              }, 12000);
            }
            return;
          }
        } catch (wpErr) {
          console.warn('WP AJAX notice:', wpErr);
        }
      }

      // 3. Fallback for Static GitHub Pages (FormSubmit.co)
      const payload = {
        ...formDataObj,
        '_subject': `🐾 Νέα Αίτηση Αξιολόγησης: ${name} (${phone}) - NK9 Wise Academy`,
        '_template': 'table',
        '_captcha': 'false'
      };

      try {
        await fetch('https://formsubmit.co/ajax/gregsfak@hotmail.com', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        leadForm.reset();
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;

        if (successMsg) {
          successMsg.innerHTML = `
            <div style="font-size: 1.15rem; font-weight: 800; margin-bottom: 6px;">🎉 Ευχαριστούμε πολύ, ${name}!</div>
            <div style="font-size: 0.95rem; line-height: 1.5;">Η αίτησή σας απεστάλη επιτυχώς στο <strong>gregsfak@hotmail.com</strong>. Θα επικοινωνήσουμε μαζί σας στο <strong>${phone}</strong>!</div>
          `;
          successMsg.style.display = 'block';
          successMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          setTimeout(() => {
            successMsg.style.display = 'none';
          }, 12000);
        }
      } catch (err) {
        console.warn('FormSubmit AJAX fallback:', err);
        leadForm.reset();
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;

        if (successMsg) {
          successMsg.innerHTML = `
            <div style="font-size: 1.15rem; font-weight: 800; margin-bottom: 6px;">🎉 Ευχαριστούμε πολύ, ${name}!</div>
            <div style="font-size: 0.95rem; line-height: 1.5;">Το αίτημά σας καταχωρήθηκε επιτυχώς! Θα επικοινωνήσουμε μαζί σας στο <strong>${phone}</strong>!</div>
          `;
          successMsg.style.display = 'block';
          successMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }
    });
  }

  /* ===================================================
     8. Navbar Scroll Shadow Enhancement
     =================================================== */
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      navbar.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.8), 0 0 15px rgba(212, 175, 55, 0.15)';
      navbar.style.background = 'rgba(9, 10, 14, 0.97)';
    } else {
      navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.5)';
      navbar.style.background = 'rgba(9, 10, 14, 0.92)';
    }
  });

  /* ===================================================
     9. 3D Video Player & Modal Controller (Universal Playback)
     =================================================== */
  const videoModal = document.getElementById('videoModal');
  const openHeroVideoBtn = document.getElementById('openHeroVideoBtn');
  const closeVideoBtn = document.getElementById('closeVideoBtn');
  const modalVideoPlayer = document.getElementById('modalVideoPlayer');
  const modalYoutubeIframe = document.getElementById('modalYoutubeIframe');
  const heroVideoBox = document.getElementById('heroVideoBox');
  const heroPlayBtn = document.getElementById('heroPlayBtn');
  const heroVideoPlayer = document.getElementById('heroVideoPlayer');
  const hero3dCard = document.querySelector('.hero-3d-card');

  // 1. Play Video directly inside Hero 3D Card
  const playHeroVideoInline = () => {
    if (!heroVideoBox) return;

    // Use guaranteed local MP4 video player (flawless on file:// and all devices)
    if (heroVideoPlayer) {
      heroVideoPlayer.style.display = 'block';
      heroVideoPlayer.play().catch(err => {
        console.warn('Hero video play:', err);
      });
    }

    heroVideoBox.classList.add('is-playing');
    if (hero3dCard) {
      hero3dCard.classList.add('is-playing');
      hero3dCard.style.transform = 'none';
    }
  };

  // Click on hero video box (or its pulsing play button)
  if (heroVideoBox) {
    heroVideoBox.addEventListener('click', (e) => {
      // Don't intercept clicks inside active native video controls
      if (e.target && e.target.tagName && (e.target.tagName.toLowerCase() === 'video' || e.target.tagName.toLowerCase() === 'iframe')) return;
      playHeroVideoInline();
    });

    heroVideoBox.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        playHeroVideoInline();
      }
    });
  }

  if (heroPlayBtn) {
    heroPlayBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      playHeroVideoInline();
    });
  }

  // 2. Open Fullscreen Modal Player
  const openModal = () => {
    if (videoModal) {
      // Pause hero inline player if active to prevent dual audio
      if (heroVideoPlayer && !heroVideoPlayer.paused) {
        heroVideoPlayer.pause();
      }

      videoModal.classList.add('open');
      videoModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';

      // Play modal video
      if (modalVideoPlayer) {
        modalVideoPlayer.currentTime = 0;
        modalVideoPlayer.play().catch(err => {
          console.warn('Modal video play:', err);
        });
      }
    }
  };

  // Close Fullscreen Modal Player
  const closeModal = () => {
    if (videoModal) {
      videoModal.classList.remove('open');
      videoModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';

      if (modalVideoPlayer) {
        modalVideoPlayer.pause();
      }
      if (modalYoutubeIframe) {
        modalYoutubeIframe.src = '';
      }
    }
  };

  // Trigger modal from "Δείτε το Βίντεο (2')" button
  if (openHeroVideoBtn) {
    openHeroVideoBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal();
    });
  }

  // Support any other modal buttons with .open-video-btn
  document.querySelectorAll('.open-video-btn').forEach(btn => {
    if (btn !== openHeroVideoBtn && btn !== heroPlayBtn) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        openModal();
      });
    }
  });

  if (closeVideoBtn) {
    closeVideoBtn.addEventListener('click', closeModal);
  }

  if (videoModal) {
    videoModal.addEventListener('click', (e) => {
      if (e.target === videoModal) {
        closeModal();
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && videoModal && videoModal.classList.contains('open')) {
      closeModal();
    }
  });

  /* ===================================================
     10. Terms, Privacy & Cookies Modal Controller with Tabs
     =================================================== */
  const termsModal = document.getElementById('termsModal');
  const openTermsLink = document.getElementById('openTermsLink');
  const openPrivacyLink = document.getElementById('openPrivacyLink');
  const openCookiesLink = document.getElementById('openCookiesLink');
  const footerTermsLink = document.getElementById('footerTermsLink');
  const footerPrivacyLink = document.getElementById('footerPrivacyLink');
  const footerCookiesLink = document.getElementById('footerCookiesLink');
  const closeTermsBtn = document.getElementById('closeTermsBtn');
  const confirmTermsBtn = document.getElementById('confirmTermsBtn');
  const agreeCheckbox = document.getElementById('agreeTerms');
  const tabButtons = termsModal ? termsModal.querySelectorAll('.terms-tab-btn') : [];
  const tabContents = termsModal ? termsModal.querySelectorAll('.terms-tab-content') : [];

  const switchTermsTab = (targetTabId) => {
    if (!termsModal) return;
    const cleanId = targetTabId.startsWith('tab-') ? targetTabId : `tab-${targetTabId}`;

    tabButtons.forEach(btn => {
      const isTarget = btn.getAttribute('data-tab') === cleanId;
      btn.classList.toggle('active', isTarget);
      btn.setAttribute('aria-selected', isTarget ? 'true' : 'false');
    });

    tabContents.forEach(content => {
      const isTarget = content.id === cleanId;
      content.classList.toggle('active', isTarget);
    });

    const bodyEl = termsModal.querySelector('.terms-modal-body');
    if (bodyEl) {
      bodyEl.scrollTop = 0;
    }
  };

  const openTermsModal = (tabId = 'tab-terms') => {
    if (termsModal) {
      switchTermsTab(tabId);
      termsModal.classList.add('open');
      termsModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }
  };

  const closeTermsModal = () => {
    if (termsModal) {
      termsModal.classList.remove('open');
      termsModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  };

  // Tab button click events
  tabButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const tabTarget = btn.getAttribute('data-tab');
      if (tabTarget && window.switchTermsTab) {
        window.switchTermsTab(tabTarget);
      }
    });
  });

  // Link triggers
  if (openTermsLink) {
    openTermsLink.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (window.openTermsModal) window.openTermsModal('tab-terms');
    });
  }

  if (openPrivacyLink) {
    openPrivacyLink.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (window.openTermsModal) window.openTermsModal('tab-privacy');
    });
  }

  if (openCookiesLink) {
    openCookiesLink.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (window.openTermsModal) window.openTermsModal('tab-cookies');
    });
  }

  if (footerTermsLink) {
    footerTermsLink.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (window.openTermsModal) window.openTermsModal('tab-terms');
    });
  }

  if (footerPrivacyLink) {
    footerPrivacyLink.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (window.openTermsModal) window.openTermsModal('tab-privacy');
    });
  }

  if (footerCookiesLink) {
    footerCookiesLink.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (window.openTermsModal) window.openTermsModal('tab-cookies');
    });
  }

  if (closeTermsBtn) {
    closeTermsBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (window.closeTermsModal) window.closeTermsModal();
    });
  }

  if (confirmTermsBtn) {
    confirmTermsBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const cb = agreeCheckbox || document.getElementById('agreeTerms');
      if (cb) {
        cb.checked = true;
      }
      if (window.closeTermsModal) window.closeTermsModal();
    });
  }

  if (termsModal) {
    termsModal.addEventListener('click', (e) => {
      if (e.target === termsModal) {
        if (window.closeTermsModal) window.closeTermsModal();
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    const modal = termsModal || document.getElementById('termsModal');
    if (e.key === 'Escape' && modal && modal.classList.contains('open')) {
      if (window.closeTermsModal) window.closeTermsModal();
    }
  });

  /* ===================================================
     11. Dynamic Accurate Scroll for Contact & Form Buttons
     =================================================== */
  const contactLinks = document.querySelectorAll('a[href="#contact"]');
  const contactSection = document.getElementById('contact');

  if (contactLinks.length > 0 && contactSection) {
    contactLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();

        // 1. If mobile drawer is open, close it cleanly
        if (mobileDrawer && mobileDrawer.classList.contains('open')) {
          closeDrawer();
        }

        // 2. Measure actual navbar height dynamically
        const navbarEl = document.getElementById('navbar');
        const navbarHeight = navbarEl ? navbarEl.offsetHeight : 70;

        // 3. Locate the target heading: "Κλείστε Σήμερα τη Δωρεάν Αξιολόγηση"
        const targetHeading = contactSection.querySelector('h2') || contactSection;
        const headingRect = targetHeading.getBoundingClientRect();

        // 4. Calculate exact scroll destination with 16px pleasant breathing space
        const targetScrollTop = window.pageYOffset + headingRect.top - navbarHeight - 16;

        window.scrollTo({
          top: Math.max(0, targetScrollTop),
          behavior: 'smooth'
        });

        // 5. Update browser address bar without jarring jump
        if (history.pushState) {
          history.pushState(null, null, '#contact');
        }
      });
    });
  }

  /* ===================================================
     12. Google Consent Mode v2 & Cookie Banner Controller
     =================================================== */
  const cookieBanner = document.getElementById('cookieBanner');
  const btnCookieAccept = document.getElementById('btnCookieAccept');
  const btnCookieReject = document.getElementById('btnCookieReject');
  const btnCookieCustomize = document.getElementById('btnCookieCustomize');
  const btnCookieSave = document.getElementById('btnCookieSave');
  const cookieBannerClose = document.getElementById('cookieBannerClose');
  const cookieCustomOptions = document.getElementById('cookieCustomOptions');
  const cookieAnalyticsCheck = document.getElementById('cookieAnalyticsCheck');
  const cookieMarketingCheck = document.getElementById('cookieMarketingCheck');
  const footerManageCookiesLink = document.getElementById('footerManageCookiesLink');

  // GCM v2 Update Routine
  const updateGoogleConsentModeV2 = (analyticsGranted, marketingGranted) => {
    const consentPayload = {
      'analytics_storage': analyticsGranted ? 'granted' : 'denied',
      'ad_storage': marketingGranted ? 'granted' : 'denied',
      'ad_user_data': marketingGranted ? 'granted' : 'denied',
      'ad_personalization': marketingGranted ? 'granted' : 'denied'
    };

    if (typeof window.gtag === 'function') {
      window.gtag('consent', 'update', consentPayload);
    } else {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push(['consent', 'update', consentPayload]);
    }

    // Push GTM event for analytics or marketing tags listening to consent updates
    if (window.dataLayer) {
      window.dataLayer.push({
        event: 'cookie_consent_update',
        consent_analytics: analyticsGranted ? 'granted' : 'denied',
        consent_marketing: marketingGranted ? 'granted' : 'denied'
      });
    }

    try {
      const consentRecord = {
        analytics: !!analyticsGranted,
        marketing: !!marketingGranted,
        timestamp: new Date().toISOString(),
        version: 'v2'
      };
      localStorage.setItem('nk9_cookie_consent', JSON.stringify(consentRecord));
    } catch (e) {
      console.warn('Could not save cookie consent to localStorage:', e);
    }
  };

  const showBanner = () => {
    if (!cookieBanner) return;
    cookieBanner.style.display = 'block';
    requestAnimationFrame(() => {
      cookieBanner.classList.add('show');
    });
  };

  const hideBanner = () => {
    if (!cookieBanner) return;
    cookieBanner.classList.remove('show');
    setTimeout(() => {
      cookieBanner.style.display = 'none';
    }, 350);
  };

  // Wire up global openers
  window.openCookieBanner = () => {
    if (cookieCustomOptions) {
      cookieCustomOptions.style.display = 'flex';
    }
    if (btnCookieSave) btnCookieSave.style.display = 'inline-flex';
    if (btnCookieCustomize) {
      btnCookieCustomize.innerHTML = '<i class="fa-solid fa-chevron-up"></i> Σύμπτυξη';
    }
    showBanner();
  };

  window.closeCookieBanner = hideBanner;

  if (cookieBannerClose) {
    cookieBannerClose.addEventListener('click', hideBanner);
  }

  if (footerManageCookiesLink) {
    footerManageCookiesLink.addEventListener('click', (e) => {
      e.preventDefault();
      window.openCookieBanner();
    });
  }

  // Accept All: Analytics + Ads granted
  if (btnCookieAccept) {
    btnCookieAccept.addEventListener('click', () => {
      if (cookieAnalyticsCheck) cookieAnalyticsCheck.checked = true;
      if (cookieMarketingCheck) cookieMarketingCheck.checked = true;
      updateGoogleConsentModeV2(true, true);
      hideBanner();
    });
  }

  // Reject Non-Essential: Only Necessary
  if (btnCookieReject) {
    btnCookieReject.addEventListener('click', () => {
      if (cookieAnalyticsCheck) cookieAnalyticsCheck.checked = false;
      if (cookieMarketingCheck) cookieMarketingCheck.checked = false;
      updateGoogleConsentModeV2(false, false);
      hideBanner();
    });
  }

  // Toggle Customize Accordion
  if (btnCookieCustomize) {
    btnCookieCustomize.addEventListener('click', () => {
      if (cookieCustomOptions) {
        const isHidden = cookieCustomOptions.style.display === 'none' || !cookieCustomOptions.style.display;
        cookieCustomOptions.style.display = isHidden ? 'flex' : 'none';
        if (btnCookieSave) {
          btnCookieSave.style.display = isHidden ? 'inline-flex' : 'none';
        }
        btnCookieCustomize.innerHTML = isHidden 
          ? '<i class="fa-solid fa-chevron-up"></i> Σύμπτυξη' 
          : '<i class="fa-solid fa-sliders"></i> Προσαρμογή';
      }
    });
  }

  // Save Customized Settings
  if (btnCookieSave) {
    btnCookieSave.addEventListener('click', () => {
      const analytics = cookieAnalyticsCheck ? cookieAnalyticsCheck.checked : false;
      const marketing = cookieMarketingCheck ? cookieMarketingCheck.checked : false;
      updateGoogleConsentModeV2(analytics, marketing);
      hideBanner();
    });
  }

  // Check initial state on first visit
  try {
    const savedConsentStr = localStorage.getItem('nk9_cookie_consent');
    if (savedConsentStr) {
      const saved = JSON.parse(savedConsentStr);
      if (cookieAnalyticsCheck) cookieAnalyticsCheck.checked = !!saved.analytics;
      if (cookieMarketingCheck) cookieMarketingCheck.checked = !!saved.marketing;
      updateGoogleConsentModeV2(!!saved.analytics, !!saved.marketing);
    } else {
      // First visit: show banner after small delay so user notices it smoothly
      setTimeout(() => {
        showBanner();
      }, 750);
    }
  } catch (e) {
    setTimeout(() => {
      showBanner();
    }, 750);
  }

});

