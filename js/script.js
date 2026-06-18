document.addEventListener('DOMContentLoaded', () => {
    // -------------------------------------------------
    // 1. Intro Overlay & Session Storage (Home only)
    // -------------------------------------------------
    // Checks if user went past Intro page to play videos
    let isPortfolioEntered = sessionStorage.getItem('hartoIntroPlayed') === 'true';

    const introOverlay = document.getElementById('introOverlay');
    const enterBtn = document.getElementById('enterBtn');
    const firstVideo = document.querySelector('#vid1 video');

    if (introOverlay) {
        if (isPortfolioEntered) {
            introOverlay.style.display = 'none';
            if (firstVideo) {
                firstVideo.play().catch(() => {
                    console.warn("Browser requires user interaction to play sound on reload.");
                });
            }
        } else {
            if (enterBtn) {
                enterBtn.addEventListener('click', () => {
                    introOverlay.classList.add('hidden');
                    sessionStorage.setItem('hartoIntroPlayed', 'true');

                    isPortfolioEntered = true;

                    setTimeout(() => introOverlay.style.display = 'none', 800);
                    if (firstVideo) {
                        firstVideo.play().catch(error => console.warn("Play blocked:", error));
                    }
                });
            }
        }
    } else {
        // If there is no intro overlay on this page, allow videos
        isPortfolioEntered = true;
    }

    // -------------------------------------------------
    // 2. Mobile Navigation Navbar Toggle (All Pages)
    // -------------------------------------------------
    const toggleBtn = document.getElementById('navbarToggle');
    const navRight = document.querySelector('.navbar__links');

    if (toggleBtn && navRight) {
        toggleBtn.addEventListener('click', () => {
            navRight.classList.toggle('active');
            toggleBtn.classList.toggle('open');
            document.body.style.overflow = navRight.classList.contains('active') ? 'hidden' : '';
        });

        document.querySelectorAll('.nav-btn').forEach(link => {
            link.addEventListener('click', () => {
                navRight.classList.remove('active');
                toggleBtn.classList.remove('open');
                document.body.style.overflow = '';
            });
        });
    }

    // -------------------------------------------------
    // 3. Cinematic Page Transitions (All Pages)
    // -------------------------------------------------
    const transitionLinks = document.querySelectorAll('a[href]:not([href^="#"]):not([href^="mailto"])');

    transitionLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const destination = link.getAttribute('href');
            if (link.target === '_blank') return;

            e.preventDefault();
            document.body.classList.add('fade-out');
            setTimeout(() => { window.location.href = destination; }, 800);
        });
    });

    // -------------------------------------------------
    // 4. Safe Audio & Viewport Observation (Home Only)
    // -------------------------------------------------
    const gallery = document.getElementById('mainGallery');
    const thumbnails = document.querySelectorAll('.filmstrip__item');

    if (gallery) {
        const observerOptions = { root: gallery, rootMargin: '0px', threshold: 0.6 };

        const videoObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const video = entry.target.querySelector('video');
                const targetId = entry.target.id;
                const correspondingThumbnail = document.querySelector(`.filmstrip__item[data-target="${targetId}"]`);

                if (entry.isIntersecting) {
                    // Only attempt to play if the user has passed the intro screen!
                    if (video && isPortfolioEntered) {
                        const playPromise = video.play();
                        if (playPromise !== undefined) {
                            playPromise.catch(() => { });
                        }
                    }
                    thumbnails.forEach(t => t.classList.remove('active'));
                    if (correspondingThumbnail) correspondingThumbnail.classList.add('active');
                } else {
                    if (video) {
                        video.pause();
                        video.currentTime = 0;
                    }
                }
            });
        }, observerOptions);

        document.querySelectorAll('.gallery__item').forEach(item => {
            videoObserver.observe(item);
        });
    }

    // -------------------------------------------------
    // 5. Smooth Container Scrolling (Home Only)
    // -------------------------------------------------
    if (thumbnails.length > 0 && gallery) {
        thumbnails.forEach(thumb => {
            thumb.addEventListener('click', (e) => {
                e.preventDefault();
                let targetId = thumb.getAttribute('data-target') || thumb.getAttribute('href');
                if (targetId) targetId = targetId.replace('#', '');

                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    const targetPosition = targetElement.offsetLeft;
                    gallery.scrollTo({ left: targetPosition, behavior: 'smooth' });
                }
            });
        });
    }

    // -------------------------------------------------
    // 6. Privacy & Terms Modal Logic (All Pages)
    // -------------------------------------------------
    const privacyModal = document.getElementById('privacyModal');
    const openPrivacyModalBtn = document.getElementById('openPrivacyModal');
    const closePrivacyModalBtn = document.getElementById('closePrivacyModal');

    if (privacyModal && openPrivacyModalBtn && closePrivacyModalBtn) {
        // Open Modal
        openPrivacyModalBtn.addEventListener('click', (e) => {
            e.preventDefault(); // Prevents the browser from jumping to the top of the page
            privacyModal.classList.add('active');
            document.body.style.overflow = 'hidden'; // Disables background scrolling
        });

        // Close Modal via 'X' Button
        closePrivacyModalBtn.addEventListener('click', () => {
            privacyModal.classList.remove('active');
            document.body.style.overflow = ''; // Re-enables scrolling
        });

        // Close Modal via clicking outside the content box
        privacyModal.addEventListener('click', (e) => {
            if (e.target === privacyModal) {
                privacyModal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });

        // Close Modal via 'Escape' key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && privacyModal.classList.contains('active')) {
                privacyModal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }
});

// =====================================================
// 7. Safari/Chrome Back Button Cache
// =====================================================
window.addEventListener('pageshow', (event) => {
    // If the page is restored from the browser cache
    if (event.persisted) {
        // 1. Remove the transition fade
        document.body.classList.remove('fade-out');

        // 2. Force the currently visible video to resume playing
        const isPortfolioEntered = sessionStorage.getItem('hartoIntroPlayed') === 'true';
        if (isPortfolioEntered) {
            // Find which thumbnail is currently active
            const activeThumb = document.querySelector('.filmstrip__item.active');
            if (activeThumb) {
                const targetId = activeThumb.getAttribute('data-target');
                const activeVideo = document.querySelector(`#${targetId} video`);
                if (activeVideo) {
                    activeVideo.play().catch(() => { });
                }
            } else {
                // Fallback to the first video if no thumbnail is active
                const firstVideo = document.querySelector('#vid1 video');
                if (firstVideo) {
                    firstVideo.play().catch(() => { });
                }
            }
        }
    }
});