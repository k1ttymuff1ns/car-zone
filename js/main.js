const body = document.body;
const header = document.getElementById('header');
const burger = document.getElementById('burger');
const nav = document.getElementById('nav');
const toTop = document.getElementById('toTop');
const themeBtn = document.getElementById('themeBtn');
const modal = document.getElementById('modal');

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
}

setTheme(localStorage.getItem('theme') || 'light');

if (themeBtn) {
    themeBtn.addEventListener('click', function () {
        const current = document.documentElement.getAttribute('data-theme');
        setTheme(current === 'dark' ? 'light' : 'dark');
    });
}

function closeMenu() {
    burger.classList.remove('open');
    nav.classList.remove('open');
    body.classList.remove('lock');
}

if (burger) {
    burger.addEventListener('click', function () {
        const isOpen = nav.classList.toggle('open');
        burger.classList.toggle('open', isOpen);
        body.classList.toggle('lock', isOpen);
    });

    nav.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', closeMenu);
    });

    document.addEventListener('click', function (e) {
        if (nav.classList.contains('open') && !nav.contains(e.target) && !burger.contains(e.target)) {
            closeMenu();
        }
    });
}

function onScroll() {
    const y = window.scrollY;
    if (header) {
        header.classList.toggle('scrolled', y > 40);
    }
    if (toTop) {
        toTop.classList.toggle('show', y > 500);
    }
}

window.addEventListener('scroll', onScroll);
onScroll();

if (toTop) {
    toTop.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

function observeReveal(elements) {
    if (!('IntersectionObserver' in window)) {
        elements.forEach(el => el.classList.add('visible'));
        return;
    }
    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });
    elements.forEach(el => observer.observe(el));
}

observeReveal(document.querySelectorAll('.reveal'));

function openModal(carId) {
    if (!modal) return;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    body.classList.add('lock');
    if (carId) {
        const select = modal.querySelector('.car-select');
        select.value = carId;
    }
    modal.querySelector('input').focus();
}

function closeModal() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    body.classList.remove('lock');
}

document.addEventListener('click', function (e) {
    const opener = e.target.closest('[data-modal-open]');
    if (opener) {
        openModal(opener.dataset.car);
    }
    if (e.target.closest('[data-modal-close]')) {
        closeModal();
    }
});

if (modal) {
    modal.addEventListener('click', function (e) {
        if (e.target === modal) {
            closeModal();
        }
    });
}

document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
        if (modal && modal.classList.contains('open')) closeModal();
        closeLightbox();
    }
});

const rules = {
    name: v => v.trim().length >= 2 || 'Введіть ім\'я (мінімум 2 літери)',
    email: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) || 'Введіть коректний email',
    phone: v => /^\+?[\d\s()-]{10,18}$/.test(v.trim()) || 'Введіть коректний номер телефону',
    car: v => v !== '' || 'Оберіть автомобіль',
    from: v => v !== '' || 'Оберіть дату отримання',
    to: v => v !== '' || 'Оберіть дату повернення',
    message: v => v.trim().length >= 5 || 'Напишіть повідомлення'
};

function validateForm(form) {
    let firstError = '';
    form.querySelectorAll('[required]').forEach(function (field) {
        const check = rules[field.name];
        const result = check ? check(field.value) : field.value.trim() !== '';
        const ok = result === true;
        field.classList.toggle('invalid', !ok);
        if (!ok && !firstError) firstError = result;
    });
    const from = form.querySelector('[name=from]');
    const to = form.querySelector('[name=to]');
    if (!firstError && from && to && to.value < from.value) {
        to.classList.add('invalid');
        firstError = 'Дата повернення не може бути раніше дати отримання';
    }
    return firstError;
}

function initForm(id, successText) {
    const form = document.getElementById(id);
    if (!form) return;
    const msg = form.querySelector('.form-msg');
    const today = new Date().toISOString().slice(0, 10);
    form.querySelectorAll('input[type=date]').forEach(input => input.min = today);

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        const error = validateForm(form);
        if (error) {
            msg.className = 'form-msg error';
            msg.textContent = error;
            return;
        }
        const data = Object.fromEntries(new FormData(form));
        const requests = JSON.parse(localStorage.getItem('requests') || '[]');
        requests.push({ form: id, date: new Date().toISOString(), ...data });
        localStorage.setItem('requests', JSON.stringify(requests));
        msg.className = 'form-msg ok';
        msg.textContent = successText;
        form.reset();
        if (id === 'modalForm') {
            setTimeout(closeModal, 1500);
        }
    });

    form.querySelectorAll('.field, input').forEach(function (field) {
        field.addEventListener('input', () => field.classList.remove('invalid'));
    });
}

initForm('bookForm', 'Дякуємо! Менеджер зв\'яжеться з вами найближчим часом.');
initForm('modalForm', 'Заявку прийнято! Очікуйте дзвінка.');
initForm('contactForm', 'Повідомлення надіслано. Ми відповімо протягом дня.');
initForm('subscribeForm', 'Ви підписалися на новини!');

const lightbox = document.getElementById('lightbox');
let lbImages = [];
let lbIndex = 0;

function showLightbox(i) {
    lbIndex = (i + lbImages.length) % lbImages.length;
    const img = lightbox.querySelector('img');
    img.src = lbImages[lbIndex].src;
    img.alt = lbImages[lbIndex].alt;
}

function closeLightbox() {
    if (lightbox) lightbox.classList.remove('open');
}

function initLightbox(selector) {
    if (!lightbox) return;
    const images = Array.from(document.querySelectorAll(selector));
    images.forEach(function (img, i) {
        img.addEventListener('click', function () {
            lbImages = images;
            showLightbox(i);
            lightbox.classList.add('open');
        });
    });
}

if (lightbox) {
    lightbox.querySelector('.lb-close').addEventListener('click', closeLightbox);
    lightbox.querySelector('.lb-prev').addEventListener('click', () => showLightbox(lbIndex - 1));
    lightbox.querySelector('.lb-next').addEventListener('click', () => showLightbox(lbIndex + 1));
    lightbox.addEventListener('click', function (e) {
        if (e.target === lightbox) closeLightbox();
    });
    initLightbox('#collage img');
    initLightbox('.gallery img');
}
