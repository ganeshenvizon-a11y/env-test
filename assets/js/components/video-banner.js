export function initVideoBanner(sectionSelector = '.video-banner') {
    const section = document.querySelector(sectionSelector);
    if (!section) return;

    const steps = Array.from(section.querySelectorAll('.video-banner__step-btn'));
    const descItems = Array.from(section.querySelectorAll('.video-banner__desc-item'));
    const visualItems = Array.from(section.querySelectorAll('.video-banner__visual-item'));
    const cursor = section.querySelector('.video-banner__cursor');
    const cursorFill = section.querySelector('.video-banner__cursor-fill');
    const lineProgress = section.querySelector('.video-banner__timeline-line-progress');

    if (!steps.length) return;

    let currentState = 0;
    const totalStates = steps.length;
    const STATE_DURATION = 3000; // 3 seconds per state
    let progressStartTime = 0;
    let animFrameId = null;

    const positions = [16.6, 50, 83.3]; // percentage positions for timeline stages

    function setCircleProgress(percentage) {
        if (!cursorFill) return;
        const maxOffset = 100.5;
        const offset = maxOffset - (percentage * maxOffset);
        cursorFill.style.strokeDashoffset = offset;
    }

    function updateState(index) {
        currentState = index;

        const gsap = window.gsap;

        // Update active classes on steps
        steps.forEach((btn, idx) => {
            btn.classList.toggle('is-active', idx === index);
        });

        if (gsap) {
            // Animate descriptions fade out/in
            descItems.forEach((item, idx) => {
                if (idx === index) {
                    gsap.killTweensOf(item);
                    gsap.fromTo(item, 
                        { opacity: 0, y: 15 },
                        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', overwrite: 'auto', display: 'block' }
                    );
                } else {
                    gsap.set(item, { display: 'none', opacity: 0 });
                }
            });

            // Animate active visual item wrapper
            visualItems.forEach((item, idx) => {
                if (idx === index) {
                    item.classList.add('is-active');
                    gsap.killTweensOf(item);
                    gsap.fromTo(item, 
                        { opacity: 0, scale: 0.95 },
                        { opacity: 1, scale: 1, duration: 0.5, ease: 'power2.out', display: 'flex' }
                    );
                } else {
                    item.classList.remove('is-active');
                    gsap.set(item, { display: 'none', opacity: 0 });
                }
            });

            // Animate timeline progress line width
            if (lineProgress) {
                const progressWidths = [0, 33.3, 66.7];
                gsap.to(lineProgress, {
                    width: `${progressWidths[index]}%`,
                    duration: 0.6,
                    ease: 'power2.inOut'
                });
            }

            // Animate active circular cursor position
            if (cursor) {
                gsap.to(cursor, {
                    left: `${positions[index]}%`,
                    duration: 0.6,
                    ease: 'power2.inOut'
                });
            }

            // Trigger specific state GSAP animations
            if (index === 0) {
                // State 0: Stagger sticky notes
                gsap.killTweensOf('.sticky-note');
                gsap.fromTo('.sticky-note',
                    { scale: 0.4, opacity: 0, y: 20 },
                    { scale: 1, opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'back.out(1.5)', delay: 0.1 }
                );
            } else if (index === 1) {
                // State 1: Typing code + stagger code pills
                const codeEl = visualItems[1].querySelector('.coding-editor div:last-child');
                if (codeEl) {
                    const textToType = 'new envizon();';
                    let typeObj = { progress: 0 };
                    gsap.killTweensOf(typeObj);
                    gsap.to(typeObj, {
                        progress: textToType.length,
                        duration: 1.4,
                        ease: 'none',
                        delay: 0.2,
                        onUpdate: () => {
                            const len = Math.floor(typeObj.progress);
                            codeEl.innerHTML = `const project = ${textToType.substring(0, len)}<span class="coding-cursor"></span>`;
                        }
                    });
                }
                
                gsap.killTweensOf('.coding-pill');
                gsap.fromTo('.coding-pill',
                    { opacity: 0, scale: 0.7, y: 15 },
                    { opacity: 1, scale: 1, y: 0, duration: 0.4, stagger: 0.08, ease: 'power2.out', delay: 0.3 }
                );
            } else if (index === 2) {
                // State 2: Checkmark pop + metrics counter + confetti stagger
                gsap.killTweensOf('.browser-success-check');
                gsap.fromTo('.browser-success-check',
                    { scale: 0, rotation: -30 },
                    { scale: 1, rotation: 0, duration: 0.6, ease: 'back.out(2)', delay: 0.15 }
                );

                gsap.killTweensOf('.confetti');
                gsap.fromTo('.confetti',
                    { scale: 0, y: 15 },
                    { scale: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'power2.out', delay: 0.3 }
                );

                // Stagger delivered stat cards
                gsap.killTweensOf('.delivered-stat');
                gsap.fromTo('.delivered-stat',
                    { opacity: 0, y: 15 },
                    { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out', delay: 0.2 }
                );

                // Run count-up metrics counters
                const stats = [
                    { el: '.delivered-stat--perf .delivered-stat__val', target: 98, suffix: '+' },
                    { el: '.delivered-stat--conv .delivered-stat__val', target: 25, prefix: '+', suffix: '%' },
                    { el: '.delivered-stat--seo .delivered-stat__val', target: 100 }
                ];
                stats.forEach(stat => {
                    const el = section.querySelector(stat.el);
                    if (!el) return;
                    
                    const counter = { val: 0 };
                    gsap.killTweensOf(counter);
                    gsap.to(counter, {
                        val: stat.target,
                        duration: 1.6,
                        ease: 'power3.out',
                        delay: 0.4,
                        onUpdate: () => {
                            const currentVal = Math.floor(counter.val);
                            el.textContent = `${stat.prefix || ''}${currentVal}${stat.suffix || ''}`;
                        }
                    });
                });
            }
        } else {
            // Fallback for non-GSAP browser support
            descItems.forEach((item, idx) => {
                item.classList.toggle('is-active', idx === index);
            });
            visualItems.forEach((item, idx) => {
                item.classList.toggle('is-active', idx === index);
            });
            if (lineProgress) {
                const progressWidths = [0, 33.3, 66.7];
                lineProgress.style.width = `${progressWidths[index]}%`;
            }
            if (cursor) {
                cursor.style.left = `${positions[index]}%`;
            }
        }

        // Reset timer progress
        progressStartTime = Date.now();
    }

    function tick() {
        const elapsed = Date.now() - progressStartTime;
        const ratio = Math.min(elapsed / STATE_DURATION, 1);
        
        setCircleProgress(ratio);

        if (elapsed >= STATE_DURATION) {
            // Move to next state
            const nextState = (currentState + 1) % totalStates;
            updateState(nextState);
        }

        animFrameId = requestAnimationFrame(tick);
    }

    let isRunning = false;

    function startLoop() {
        if (isRunning) return;
        isRunning = true;
        progressStartTime = Date.now();
        animFrameId = requestAnimationFrame(tick);
    }

    function stopLoop() {
        if (animFrameId) {
            cancelAnimationFrame(animFrameId);
            animFrameId = null;
        }
        isRunning = false;
        setCircleProgress(0);
    }

    function resetLoop() {
        stopLoop();
        startLoop();
    }

    // Step button click handlers for interactivity
    steps.forEach((btn, idx) => {
        btn.addEventListener('click', () => {
            updateState(idx);
            resetLoop();
        });
    });

    // Viewport Intersection Observer: loop runs only when section is visible
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Start fresh from State 0 on viewport entry
                updateState(0);
                startLoop();
            } else {
                stopLoop();
            }
        });
    }, { threshold: 0.15 });

    observer.observe(section);

    // Return cleanup handle
    return () => {
        observer.unobserve(section);
        stopLoop();
    };
}
