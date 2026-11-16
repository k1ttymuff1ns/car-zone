const CLASSES = {
    all: 'Усі',
    economy: 'Економ',
    comfort: 'Комфорт',
    suv: 'Позашляховики та мінівени',
    retro: 'Ретро'
};

function getJSON(url) {
    return fetch(url).then(function (response) {
        if (!response.ok) {
            throw new Error('Помилка завантаження ' + url);
        }
        return response.json();
    });
}

function showError(container, text) {
    container.innerHTML = '';
    const p = document.createElement('p');
    p.className = 'empty-msg';
    p.textContent = text;
    container.appendChild(p);
}

function icon(name) {
    return '<svg class="icon"><use href="img/sprite.svg#icon-' + name + '"></use></svg>';
}

function renderServices() {
    const box = document.getElementById('services');
    if (!box) return;
    getJSON('data/services.json').then(function (services) {
        box.innerHTML = '';
        services.forEach(function (item) {
            const card = document.createElement('article');
            card.className = 'service-card reveal';
            card.innerHTML = '<img src="' + item.image + '" alt="' + item.title + '" width="600" height="420" loading="lazy">' +
                '<h3></h3><p></p>';
            card.querySelector('h3').textContent = item.title;
            card.querySelector('p').textContent = item.text;
            box.appendChild(card);
        });
        observeReveal(box.querySelectorAll('.reveal'));
    }).catch(() => showError(box, 'Не вдалося завантажити послуги'));
}

function renderTeam() {
    const box = document.getElementById('team');
    if (!box) return;
    const limit = parseInt(box.dataset.limit) || 100;
    getJSON('data/team.json').then(function (team) {
        box.innerHTML = '';
        team.slice(0, limit).forEach(function (person) {
            const card = document.createElement('article');
            card.className = 'staff-card reveal';
            card.innerHTML = '<img src="' + person.photo + '" alt="' + person.name + '" width="480" height="520" loading="lazy">' +
                '<h3></h3><p class="role"></p>' +
                '<a class="phone" href="tel:' + person.phone.replace(/[^\d+]/g, '') + '">' + icon('phone') + '<span></span></a>';
            card.querySelector('h3').textContent = person.name;
            card.querySelector('.role').textContent = person.role;
            card.querySelector('.phone span').textContent = person.phone;
            box.appendChild(card);
        });
        observeReveal(box.querySelectorAll('.reveal'));
    }).catch(() => showError(box, 'Не вдалося завантажити інформацію про команду'));
}

function renderReviews() {
    const track = document.getElementById('reviews');
    if (!track) return;
    getJSON('data/reviews.json').then(function (reviews) {
        track.innerHTML = '';
        reviews.forEach(function (r) {
            const item = document.createElement('article');
            item.className = 'review';
            let stars = '';
            for (let i = 1; i <= 5; i++) {
                stars += i <= r.rating ? icon('star') : icon('star').replace('class="icon"', 'class="icon empty"');
            }
            item.innerHTML = '<p></p><div class="stars" aria-label="Оцінка ' + r.rating + ' з 5">' + stars + '</div>' +
                '<div class="review-author"><img src="' + r.avatar + '" alt="' + r.name + '" width="40" height="40" loading="lazy"><span></span></div>';
            item.querySelector('p').textContent = r.text;
            item.querySelector('.review-author span').textContent = r.name;
            track.appendChild(item);
        });
        if (typeof initSlider === 'function') {
            initSlider('reviewsSlider');
        }
    }).catch(() => showError(track, 'Не вдалося завантажити відгуки'));
}

function carCard(car) {
    const card = document.createElement('article');
    card.className = 'car-card';
    card.innerHTML = '<img src="' + car.image + '" alt="' + car.name + '" width="640" height="420" loading="lazy">' +
        '<div class="car-body"><h3></h3><div class="car-tags">' +
        '<span>' + car.year + '</span><span>' + car.seats + ' місць</span><span>' + car.gear + '</span><span>' + car.fuel + '</span>' +
        '</div><p></p><div class="car-bottom">' +
        '<span class="car-price">' + car.price + ' ₴ <small>/ доба</small></span>' +
        '<button class="btn" type="button" data-modal-open data-car="' + car.id + '">Забронювати</button></div></div>';
    card.querySelector('h3').textContent = car.name;
    card.querySelector('h3').title = car.name;
    card.querySelector('p').textContent = car.desc;
    return card;
}

function renderCars() {
    const box = document.getElementById('cars');
    const filters = document.getElementById('filters');
    if (!box) return;

    getJSON('data/cars.json').then(function (cars) {
        function show(type) {
            box.innerHTML = '';
            const list = type === 'all' ? cars : cars.filter(c => c.class === type);
            if (list.length === 0) {
                showError(box, 'Автомобілів цього класу зараз немає');
                return;
            }
            list.forEach(car => box.appendChild(carCard(car)));
        }

        Object.keys(CLASSES).forEach(function (key) {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'filter-btn' + (key === 'all' ? ' active' : '');
            btn.textContent = CLASSES[key];
            btn.addEventListener('click', function () {
                filters.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                show(key);
            });
            filters.appendChild(btn);
        });

        show('all');
    }).catch(() => showError(box, 'Не вдалося завантажити автопарк'));
}

function fillCarSelects() {
    const selects = document.querySelectorAll('.car-select');
    if (selects.length === 0) return;
    getJSON('data/cars.json').then(function (cars) {
        selects.forEach(function (select) {
            cars.forEach(function (car) {
                const option = document.createElement('option');
                option.value = car.id;
                option.textContent = car.name + ' — ' + car.price + ' ₴/доба';
                select.appendChild(option);
            });
        });
    }).catch(function () {});
}

renderServices();
renderTeam();
renderReviews();
renderCars();
fillCarSelects();
