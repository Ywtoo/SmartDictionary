document.addEventListener('DOMContentLoaded', () => {
    const tutorialSteps = document.querySelectorAll('.tutorial-step');
    const progressBar = document.getElementById('tutorial-progress');
    const prevButton = document.getElementById('prev-step');
    const nextButton = document.getElementById('next-step');
    const stepsContainer = document.querySelector('.step-indicators');
    
    let currentStep = 0;
    const totalSteps = tutorialSteps.length;

    // Create step indicators
    for (let i = 0; i < totalSteps; i++) {
        const indicator = document.createElement('div');
        indicator.classList.add('step-indicator');
        indicator.addEventListener('click', () => goToStep(i));
        stepsContainer.appendChild(indicator);
    }

    const stepIndicators = document.querySelectorAll('.step-indicator');

    function updateUI() {
        // Update steps
        tutorialSteps.forEach((step, index) => {
            step.classList.toggle('active', index === currentStep);
        });

        // Update indicators
        stepIndicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === currentStep);
        });

        // Update progress bar
        const progress = ((currentStep + 1) / totalSteps) * 100;
        progressBar.style.width = `${progress}%`;

        // Update buttons
        prevButton.disabled = currentStep === 0;
        nextButton.disabled = currentStep === totalSteps - 1;
    }

    function goToStep(step) {
        currentStep = step;
        updateUI();
    }

    prevButton.addEventListener('click', () => {
        if (currentStep > 0) {
            currentStep--;
            updateUI();
        }
    });

    nextButton.addEventListener('click', () => {
        if (currentStep < totalSteps - 1) {
            currentStep++;
            updateUI();
        }
    });

    // Initialize UI
    updateUI();

    // Add keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft' && currentStep > 0) {
            currentStep--;
            updateUI();
        } else if (e.key === 'ArrowRight' && currentStep < totalSteps - 1) {
            currentStep++;
            updateUI();
        }
    });

    // Add smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Add intersection observer for animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1
    });

    document.querySelectorAll('.feature').forEach(feature => {
        observer.observe(feature);
    });
});