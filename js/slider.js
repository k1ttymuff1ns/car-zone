function initSlider(id) {
    const slider = document.getElementById(id);
    if (!slider) return;
    const track = slider.querySelector('.slider-track');
    const slides = Array.from(track.children);
    const section = slider.parentElement;
    const prev = section.querySelector('.slider-btn.prev');
    const next = section.querySelector('.slider-btn.next');
    const dotsBox = section.querySelector('.dots');
    let index = 0;
    let timer;

    function perView() {
        if (window.innerWidth >= 992) return 3;
        if (window.innerWidth >= 600) return 2;
        return 1;
    }

    function maxIndex() {
        return Math.max(0, slides.length - perView());
    }

    function makeDots() {
        dotsBox.innerHTML = '';
        for (let i = 0; i <= maxIndex(); i++) {
            const dot = document.createElement('button');
            dot.type = 'button';
            dot.className = 'dot';
            dot.setAttribute('aria-label', 'Слайд ' + (i + 1));
            dot.addEventListener('click', () => goTo(i));
            dotsBox.appendChild(dot);
        }
    }

    function goTo(i) {
        index = Math.min(Math.max(i, 0), maxIndex());
        const gap = parseFloat(getComputedStyle(track).gap) || 0;
        const step = slides[0].offsetWidth + gap;
        track.style.transform = 'translateX(' + (-index * step) + 'px)';
        const middle = index + Math.floor(perView() / 2);
        slides.forEach((s, k) => s.classList.toggle('current', k === middle));
        dotsBox.querySelectorAll('.dot').forEach((d, k) => d.classList.toggle('active', k === index));
    }

    function nextSlide() {
        goTo(index >= maxIndex() ? 0 : index + 1);
    }

    function prevSlide() {
        goTo(index <= 0 ? maxIndex() : index - 1);
    }

    function startAuto() {
        clearInterval(timer);
        timer = setInterval(nextSlide, 5000);
    }

    next.addEventListener('click', function () {
        nextSlide();
        startAuto();
    });

    prev.addEventListener('click', function () {
        prevSlide();
        startAuto();
    });

    let startX = 0;
    track.addEventListener('pointerdown', e => startX = e.clientX);
    track.addEventListener('pointerup', function (e) {
        const diff = e.clientX - startX;
        if (Math.abs(diff) > 50) {
            diff < 0 ? nextSlide() : prevSlide();
            startAuto();
        }
    });

    slider.addEventListener('mouseenter', () => clearInterval(timer));
    slider.addEventListener('mouseleave', startAuto);

    window.addEventListener('resize', function () {
        makeDots();
        goTo(index);
    });

    makeDots();
    goTo(0);
    startAuto();
}
