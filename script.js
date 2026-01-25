// KIDD'S ZONE - Main JavaScript File

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    
    // ===== MOBILE MENU FUNCTIONALITY =====
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobileMenu');
    const closeMenu = document.getElementById('closeMenu');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
    
    if (hamburger) {
        hamburger.addEventListener('click', function() {
            mobileMenu.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }
    
    if (closeMenu) {
        closeMenu.addEventListener('click', function() {
            mobileMenu.classList.remove('active');
            document.body.style.overflow = 'auto';
        });
    }
    
    // Close mobile menu when clicking on a link
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', function() {
            mobileMenu.classList.remove('active');
            document.body.style.overflow = 'auto';
        });
    });
    
    // ===== STICKY HEADER =====
    const header = document.querySelector('.header');
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
    
    // ===== FLOATING CONTACT TOGGLE =====
    const contactToggle = document.getElementById('contactToggle');
    const contactIcons = document.getElementById('contactIcons');
    
    if (contactToggle) {
        contactToggle.addEventListener('click', function() {
            contactIcons.classList.toggle('active');
            contactToggle.classList.toggle('active');
        });
        
        // Close floating contact when clicking outside
        document.addEventListener('click', function(event) {
            const isClickInside = contactToggle.contains(event.target) || contactIcons.contains(event.target);
            
            if (!isClickInside && contactIcons.classList.contains('active')) {
                contactIcons.classList.remove('active');
                contactToggle.classList.remove('active');
            }
        });
    }
    
    // ===== MUSIC TOGGLE =====
    const musicBtn = document.getElementById('musicBtn');
    const bgMusic = document.getElementById('bgMusic');
    
    if (musicBtn && bgMusic) {
        // Check if music was previously playing
        const isMusicPlaying = localStorage.getItem('kiddsZoneMusic') === 'playing';
        
        if (isMusicPlaying) {
            bgMusic.muted = false;
            bgMusic.play().catch(e => console.log("Autoplay prevented:", e));
            musicBtn.classList.add('active');
        }
        
        musicBtn.addEventListener('click', function() {
            if (bgMusic.muted) {
                // Unmute and play
                bgMusic.muted = false;
                bgMusic.play().then(() => {
                    musicBtn.classList.add('active');
                    localStorage.setItem('kiddsZoneMusic', 'playing');
                }).catch(e => {
                    console.log("Playback prevented:", e);
                    // If autoplay is blocked, inform user
                    alert("Please interact with the page first to enable audio. Click anywhere then try again.");
                });
            } else {
                // Mute and pause
                bgMusic.muted = true;
                bgMusic.pause();
                musicBtn.classList.remove('active');
                localStorage.setItem('kiddsZoneMusic', 'paused');
            }
        });
    }
    
    // ===== ANIMATED COUNTERS =====
    const counterElements = document.querySelectorAll('.counter-number');
    
    if (counterElements.length > 0) {
        const startCounterAnimation = (element) => {
            const target = parseInt(element.getAttribute('data-target'));
            const duration = 2000; // 2 seconds
            const increment = target / (duration / 16); // 60fps
            
            let current = 0;
            
            const updateCounter = () => {
                current += increment;
                
                if (current < target) {
                    element.textContent = Math.floor(current);
                    requestAnimationFrame(updateCounter);
                } else {
                    element.textContent = target;
                }
            };
            
            updateCounter();
        };
        
        // Create Intersection Observer for counters
        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    startCounterAnimation(entry.target);
                    counterObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        counterElements.forEach(counter => {
            counterObserver.observe(counter);
        });
    }
    
    // ===== ADMISSION FORM DOWNLOAD =====
    const downloadFormBtn = document.getElementById('downloadForm');
    
    if (downloadFormBtn) {
        downloadFormBtn.addEventListener('click', function(e) {
            
            // Normal redirect
            window.location.href = "https://drive.google.com/uc?export=download&id=1AHxFuH4Sg0lbc4potypkG1AFuv9X5FZZ";
            e.preventDefault();
            // In a real implementation, this would link to an actual PDF
            // For demo purposes, we'll show an alert
            // alert("Thank you for your interest! In the actual implementation, this would download the admission form PDF.");
            
            // You could also trigger a modal with form details
            // showAdmissionFormModal();
        });
    }
    
    // ===== CONTACT FORM SUBMISSION =====
    const contactForm = document.getElementById('contactForm');
    const formSuccess = document.getElementById('formSuccess');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = {
                name: document.getElementById('name').value,
                phone: document.getElementById('phone').value,
                email: document.getElementById('email').value,
                childAge: document.getElementById('childAge').value,
                message: document.getElementById('message').value
            };
            
            // In a real implementation, you would send this data to a server
            console.log("Form submitted:", formData);
            
            // Show success message
            if (formSuccess) {
                contactForm.style.display = 'none';
                formSuccess.classList.add('active');
                
                // Reset form after 5 seconds (for demo)
                setTimeout(() => {
                    contactForm.reset();
                    contactForm.style.display = 'block';
                    formSuccess.classList.remove('active');
                }, 5000);
            }
            
            // Show a success alert
            alert("Thank you for your message! We'll get back to you within 24 hours.");
        });
    }
    
    // ===== FAQ TOGGLE =====
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', () => {
            // Close other open items
            faqItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                }
            });
            
            // Toggle current item
            item.classList.toggle('active');
        });
    });
    
    // ===== SCROLL ANIMATIONS FOR PROCESS STEPS =====
    const processSteps = document.querySelectorAll('.process-step');
    
    if (processSteps.length > 0) {
        const stepObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    stepObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });
        
        processSteps.forEach(step => {
            stepObserver.observe(step);
        });
    }
    
    // ===== ACTIVE NAV LINK HIGHLIGHTING =====
    const currentPage = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const linkHref = link.getAttribute('href');
        
        if (linkHref === currentPage || 
            (currentPage === '' && linkHref === 'index.html') ||
            (linkHref === 'index.html' && currentPage === '')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
    
    // ===== ADDITIONAL ANIMATIONS =====
    // Add hover animation to feature cards
    const featureCards = document.querySelectorAll('.feature-card, .reason-card, .class-card');
    
    featureCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    
    // ===== INITIALIZE BACKGROUND MUSIC (muted by default) =====
    if (bgMusic) {
        // Start with muted audio as per requirements
        bgMusic.muted = true;
        bgMusic.volume = 0.5;
        
        // Try to play (will be muted)
        bgMusic.play().catch(e => {
            console.log("Background music autoplay prevented:", e);
        });
    }
    
    // ===== RANDOM ELEMENT ANIMATIONS =====
    // Add random floating animations to emoji elements
    const randomElements = document.querySelectorAll('.bg-element, .decoration-item, .feature-emoji');
    
    randomElements.forEach(element => {
        // Add slight delay variations for more natural animation
        const randomDelay = Math.random() * 5;
        element.style.animationDelay = `${randomDelay}s`;
    });
    
    // ===== TOUCH-FRIENDLY BUTTONS =====
    // Add active state for touch devices
    const buttons = document.querySelectorAll('.btn, .contact-icon, .contact-toggle');
    
    buttons.forEach(button => {
        button.addEventListener('touchstart', function() {
            this.classList.add('active-touch');
        });
        
        button.addEventListener('touchend', function() {
            this.classList.remove('active-touch');
        });
    });
});

// ===== PAGE LOAD ANIMATION =====
window.addEventListener('load', function() {
    document.body.classList.add('loaded');
    
    // Add a slight delay before showing content for smooth entrance
    setTimeout(() => {
        const mainContent = document.querySelector('main, .hero, .page-hero');
        if (mainContent) {
            mainContent.style.opacity = '1';
            mainContent.style.transform = 'translateY(0)';
        }
    }, 300);
});

// ===== ADD CSS FOR ACTIVE TOUCH STATE =====
const style = document.createElement('style');
style.textContent = `
    .active-touch {
        transform: scale(0.95) !important;
        opacity: 0.9 !important;
    }
    
    body:not(.loaded) main,
    body:not(.loaded) .hero,
    body:not(.loaded) .page-hero {
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.5s ease, transform 0.5s ease;
    }
`;
document.head.appendChild(style);