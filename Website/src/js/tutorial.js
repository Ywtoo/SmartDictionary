export function initTutorial() {
    const tutorialSteps = document.querySelectorAll('.tutorial-step');
    const progressBar = document.getElementById('tutorial-progress');
    const prevButton = document.getElementById('prev-step');
    const nextButton = document.getElementById('next-step');
    
    // If any required element is missing, exit gracefully
    if (!tutorialSteps.length || !progressBar || !prevButton || !nextButton) {
        console.warn('Tutorial elements not found. Tutorial initialization skipped.');
        return;
    }

    let currentStep = 0;
    const totalSteps = tutorialSteps.length;

    function updateUI() {
        // Update steps visibility
        tutorialSteps.forEach((step, index) => {
            step.classList.toggle('active', index === currentStep);
        });

        // Update progress bar
        const progress = ((currentStep + 1) / totalSteps) * 100;
        progressBar.style.width = `${progress}%`;

        // Update button states
        if (prevButton && nextButton) {
            prevButton.disabled = currentStep === 0;
            nextButton.disabled = currentStep === totalSteps - 1;
        }
    }

    // Event listeners
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

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft' && currentStep > 0) {
            currentStep--;
            updateUI();
        } else if (e.key === 'ArrowRight' && currentStep < totalSteps - 1) {
            currentStep++;
            updateUI();
        }
    });

    // Initialize UI
    updateUI();
}