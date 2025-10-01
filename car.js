const API_BASE = '/api';
const DEFAULT_MODEL_URL = 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Porsche/glTF-Binary/Porsche.glb';
const priceFormatter = new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
});

const params = new URLSearchParams(window.location.search);
const carId = params.get('id');

if (!carId) {
    window.location.replace('index.html#catalog');
}

const state = {
    car: null,
    gallery: [],
    galleryIndex: 0,
    similar: [],
    similarIndex: 0,
};

const elements = {
    viewer: document.getElementById('detail-viewer'),
    tag: document.getElementById('car-tag'),
    title: document.getElementById('car-title'),
    subtitle: document.getElementById('car-subtitle'),
    price: document.getElementById('car-price'),
    summaryStats: document.getElementById('car-primary-specs'),
    featureChips: document.getElementById('car-feature-chips'),
    specList: document.getElementById('car-spec-list'),
    description: document.getElementById('car-description-text'),
    galleryTrack: document.getElementById('car-gallery-track'),
    galleryPrev: document.querySelector('[data-gallery="prev"]'),
    galleryNext: document.querySelector('[data-gallery="next"]'),
    similarTrack: document.getElementById('car-similar-track'),
    similarPrev: document.querySelector('[data-similar="prev"]'),
    similarNext: document.querySelector('[data-similar="next"]'),
    orderModal: document.getElementById('order-modal'),
    orderForm: document.getElementById('order-form'),
    orderClose: document.querySelector('[data-close="order"]'),
    orderCarId: document.getElementById('order-car-id'),
    orderCar: document.getElementById('order-car'),
    orderName: document.getElementById('order-name'),
    footerYear: document.getElementById('footer-year'),
    orderCTA: document.getElementById('car-order'),
    downloadCTA: document.getElementById('car-download'),
    openOrderHeader: document.querySelector('[data-action="open-order"]'),
    inlineSearch: document.getElementById('inline-search'),
};

function fetchJson(url, options = {}) {
    return fetch(url, options).then(async (response) => {
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.error || 'Не удалось загрузить данные');
        }
        return response.json();
    });
}

function logEvent(type, payload) {
    fetch(`${API_BASE}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, carId, payload }),
        keepalive: true,
    }).catch(() => null);
}

function updateMeta(car) {
    document.title = `${car.brand} ${car.model} — Petra Imports`;
    elements.tag.textContent = car.brand;
    elements.title.textContent = `${car.brand} ${car.model}`;
    elements.subtitle.textContent = `${car.year} · ${car.drivetrain} · ${car.fuel}`;
    elements.viewer.src = car.modelUrl || DEFAULT_MODEL_URL;
    elements.price.textContent = priceFormatter.format(car.price || 0);

    elements.summaryStats.innerHTML = '';
    const stats = [
        { label: 'Мощность', value: car.power },
        { label: 'Привод', value: car.drivetrain },
        { label: 'Трансмиссия', value: car.transmission },
        { label: 'Топливо', value: car.fuel },
    ];
    stats.filter((item) => item.value).forEach((item) => {
        const dt = document.createElement('dt');
        dt.textContent = item.label;
        const dd = document.createElement('dd');
        dd.textContent = item.value;
        elements.summaryStats.append(dt, dd);
    });

    elements.featureChips.innerHTML = '';
    (car.features || []).forEach((feature) => {
        const chip = document.createElement('span');
        chip.textContent = feature;
        elements.featureChips.append(chip);
    });

    if (car.description) {
        elements.description.textContent = car.description;
    }

    if (car.specSheetUrl) {
        elements.downloadCTA.href = car.specSheetUrl;
    } else {
        elements.downloadCTA.href = '#';
        elements.downloadCTA.classList.add('is-disabled');
    }
}

function renderSpecs(specs = []) {
    elements.specList.innerHTML = '';
    if (!specs.length) {
        elements.specList.innerHTML = '<p class="muted">Характеристики обновляются.</p>';
        return;
    }
    specs.forEach((row) => {
        const card = document.createElement('div');
        card.className = 'car-specs__item';
        card.innerHTML = `<span>${row.label}</span><strong>${row.value}</strong>`;
        elements.specList.append(card);
    });
}

function renderGallery(images) {
    state.gallery = images;
    state.galleryIndex = 0;
    elements.galleryTrack.innerHTML = '';
    if (!images.length) {
        elements.galleryTrack.innerHTML = '<p class="muted" style="padding:1rem;">Фотографии добавляются.</p>';
        elements.galleryTrack.style.transform = 'translateY(0)';
        return;
    }
    images.forEach((src, index) => {
        const item = document.createElement('figure');
        item.className = 'car-gallery__item';
        item.innerHTML = `<img src="${src}" alt="Фото ${index + 1}" loading="lazy" />`;
        elements.galleryTrack.append(item);
    });
    updateGallery();
}

function updateGallery() {
    const track = elements.galleryTrack;
    if (!track) return;
    const firstItem = track.querySelector('.car-gallery__item');
    if (!firstItem) return;
    const rect = firstItem.getBoundingClientRect();
    const gap = parseFloat(window.getComputedStyle(track).rowGap || '0');
    const offset = state.galleryIndex * (rect.height + gap);
    track.style.transform = `translateY(-${offset}px)`;
}

function rotateGallery(step) {
    if (!state.gallery.length) return;
    const visibleCount = 3;
    const maxIndex = Math.max(0, state.gallery.length - visibleCount);
    state.galleryIndex = Math.min(Math.max(state.galleryIndex + step, 0), maxIndex);
    updateGallery();
}

function renderSimilar(cars) {
    state.similar = cars.filter((item) => item.id !== carId);
    state.similarIndex = 0;
    elements.similarTrack.innerHTML = '';
    if (!state.similar.length) {
        elements.similarTrack.innerHTML = '<p class="muted">Похожие автомобили появятся позже.</p>';
        return;
    }
    const fragment = document.createDocumentFragment();
    state.similar.forEach((car) => {
        const card = document.createElement('article');
        card.className = 'similar-card';
        card.innerHTML = `
            <img src="${car.image}" alt="${car.brand} ${car.model}" loading="lazy" />
            <div class="similar-card__body">
                <h3>${car.brand} ${car.model}</h3>
                <p>${priceFormatter.format(car.price)}</p>
                <span>${car.year} · ${car.fuel} · ${car.drivetrain}</span>
                <div class="similar-card__actions">
                    <button class="btn btn-secondary" data-id="${car.id}">Подробнее</button>
                    <button class="btn btn-primary" data-order="${car.id}">Заявка</button>
                </div>
            </div>
        `;
        fragment.append(card);
    });
    elements.similarTrack.append(fragment);
    updateSimilar();
}

function updateSimilar() {
    const track = elements.similarTrack;
    if (!track) return;
    const firstCard = track.querySelector('.similar-card');
    if (!firstCard) return;
    const rect = firstCard.getBoundingClientRect();
    const gap = parseFloat(window.getComputedStyle(track).columnGap || '0');
    const offset = state.similarIndex * (rect.width + gap);
    track.style.transform = `translateX(-${offset}px)`;
}

function rotateSimilar(step) {
    if (!state.similar.length) return;
    const visible = window.innerWidth >= 1100 ? 3 : window.innerWidth >= 768 ? 2 : 1;
    const maxIndex = Math.max(0, state.similar.length - visible);
    state.similarIndex = Math.min(Math.max(state.similarIndex + step, 0), maxIndex);
    updateSimilar();
}

function openOrderModal(car) {
    elements.orderModal.classList.add('open');
    elements.orderModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (car) {
        elements.orderCar.value = `${car.brand} ${car.model}`;
        elements.orderCarId.value = car.id || '';
    } else if (state.car) {
        elements.orderCar.value = `${state.car.brand} ${state.car.model}`;
        elements.orderCarId.value = state.car.id;
    }
    elements.orderName.focus({ preventScroll: true });
}

function closeOrderModal() {
    elements.orderModal.classList.remove('open');
    elements.orderModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    elements.orderForm.reset();
}

function submitLead(form) {
    const data = Object.fromEntries(new FormData(form).entries());
    return fetch(`${API_BASE}/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: data.name,
            phone: data.phone,
            note: data.note,
            carId: data.carId || carId,
            source: 'car-page',
        }),
    }).then(async (response) => {
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.error || 'Не удалось отправить заявку');
        }
        return response.json();
    });
}

function bindEvents() {
    elements.galleryPrev?.addEventListener('click', () => rotateGallery(-1));
    elements.galleryNext?.addEventListener('click', () => rotateGallery(1));

    elements.similarPrev?.addEventListener('click', () => rotateSimilar(-1));
    elements.similarNext?.addEventListener('click', () => rotateSimilar(1));

    elements.similarTrack?.addEventListener('click', (event) => {
        const details = event.target.closest('button[data-id]');
        const order = event.target.closest('button[data-order]');
        if (details) {
            const id = details.dataset.id;
            window.location.href = `car.html?id=${encodeURIComponent(id)}`;
        } else if (order) {
            const id = order.dataset.order;
            const car = state.similar.find((item) => item.id === id);
            logEvent('similar_order_clicked', { similarId: id });
            openOrderModal(car);
        }
    });

    elements.orderCTA?.addEventListener('click', () => {
        logEvent('detail_order_clicked');
        openOrderModal();
    });

    elements.openOrderHeader?.addEventListener('click', () => openOrderModal());

    elements.orderForm?.addEventListener('submit', async (event) => {
        event.preventDefault();
        try {
            await submitLead(elements.orderForm);
            alert('Спасибо! Менеджер Petra свяжется с вами.');
            closeOrderModal();
        } catch (err) {
            alert(err.message || 'Ошибка отправки заявки');
        }
    });

    elements.orderClose?.addEventListener('click', closeOrderModal);
    elements.orderModal?.addEventListener('click', (event) => {
        if (event.target === elements.orderModal) {
            closeOrderModal();
        }
    });
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && elements.orderModal.classList.contains('open')) {
            closeOrderModal();
        }
    });

    elements.inlineSearch?.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            const query = elements.inlineSearch.value.trim();
            if (query) {
                window.location.href = `index.html#catalog`; // focus on catalog
                sessionStorage.setItem('petraSearch', query);
            }
        }
    });

    window.addEventListener('resize', () => {
        updateSimilar();
    });
}

async function loadCar() {
    try {
        const car = await fetchJson(`${API_BASE}/cars/${encodeURIComponent(carId)}`);
        state.car = car;
        updateMeta(car);
        renderSpecs(car.specs || []);
        renderGallery(await loadGallery(car));
        elements.orderCar.value = `${car.brand} ${car.model}`;
        elements.orderCarId.value = car.id;
        logEvent('car_viewed');
    } catch (err) {
        console.error(err);
        alert('Автомобиль не найден');
        window.location.replace('index.html#catalog');
    }
}

async function loadGallery(car) {
    try {
        const items = await fetchJson(`${API_BASE}/cars/${encodeURIComponent(car.id)}/gallery`);
        if (Array.isArray(items) && items.length) {
            return items.map((item) => item.image || item.url).filter(Boolean);
        }
    } catch (err) {
        console.warn('gallery fallback', err);
    }
    const fallback = new Set([car.image, ...(car.gallery || [])]);
    return [...fallback].filter(Boolean);
}

async function loadSimilar() {
    try {
        const items = await fetchJson(`${API_BASE}/cars/${encodeURIComponent(carId)}/similar`);
        if (Array.isArray(items) && items.length) {
            renderSimilar(items);
            return;
        }
    } catch (err) {
        console.warn('similar fallback', err);
    }
    try {
        const cars = await fetchJson(`${API_BASE}/cars`);
        renderSimilar(cars.filter((item) => item.id !== carId).slice(0, 6));
    } catch (err) {
        console.error(err);
        renderSimilar([]);
    }
}

function setFooterYear() {
    if (elements.footerYear) {
        elements.footerYear.textContent = new Date().getFullYear();
    }
}

(async function bootstrap() {
    setFooterYear();
    bindEvents();
    await loadCar();
    await loadSimilar();
})();
