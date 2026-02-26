import { initTutorial } from './tutorial.js';
import { initAnimations } from './animations.js';
import { initSmoothScroll } from './smoothScroll.js';

document.addEventListener('DOMContentLoaded', () => {
    initTutorial();
    initAnimations();
    initSmoothScroll();
});