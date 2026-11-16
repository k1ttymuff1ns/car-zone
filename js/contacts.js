const OFFICE = { lat: 48.9226, lon: 24.7111 };
const geoBtn = document.getElementById('geoBtn');
const geoResult = document.getElementById('geoResult');

function distanceKm(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const toRad = x => x * Math.PI / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

if (geoBtn) {
    geoBtn.addEventListener('click', function () {
        if (!navigator.geolocation) {
            geoResult.textContent = 'Ваш браузер не підтримує геолокацію';
            return;
        }
        geoResult.textContent = 'Визначаємо ваше місцезнаходження...';
        navigator.geolocation.getCurrentPosition(function (pos) {
            const km = distanceKm(pos.coords.latitude, pos.coords.longitude, OFFICE.lat, OFFICE.lon);
            geoResult.textContent = 'До нашого офісу приблизно ' + km.toFixed(1) + ' км. Можемо доставити авто до вас!';
        }, function () {
            geoResult.textContent = 'Не вдалося отримати геолокацію. Перевірте дозвіл у браузері.';
        });
    });
}
