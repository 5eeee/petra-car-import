const API_BASE = '/api';
const DEFAULT_MODEL_URL = 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Porsche/glTF-Binary/Porsche.glb';
const priceFormatter = new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
});

const state = {
    cars: [],
    filtered: [],
    filters: {
        brand: new Set(),
        fuel: new Set(),
        drivetrain: new Set(),
        transmission: new Set(),
        search: '',
        yearFrom: null,
        yearTo: null,
        priceCap: null,
    },
};

const heroState = {
    index: 0,
    rotation: null,
    sequence: [],
};

const promoState = {
    items: [],
    index: 0,
    timer: null,
};

const elements = {
    headerSearch: document.getElementById('header-search'),
    filterForm: document.getElementById('filter-form'),
    filterSearch: document.getElementById('filter-search'),
    filterContainers: {
        brand: document.querySelector('[data-filter="brand"]'),
        fuel: document.querySelector('[data-filter="fuel"]'),
        drivetrain: document.querySelector('[data-filter="drivetrain"]'),
        transmission: document.querySelector('[data-filter="transmission"]'),
    },
    yearFrom: document.getElementById('year-from'),
    yearTo: document.getElementById('year-to'),
    priceRange: document.getElementById('price-range'),
    priceValue: document.getElementById('price-value'),
    applyFilters: document.getElementById('apply-filters'),
    resetFilters: document.getElementById('reset-filters'),
    catalogGrid: document.getElementById('catalog-grid'),
    catalogEmpty: document.getElementById('catalog-empty'),
    heroViewer: document.getElementById('hero-viewer'),
    heroTag: document.getElementById('hero-car-tag'),
    heroName: document.getElementById('hero-car-name'),
    heroMeta: document.getElementById('hero-car-meta'),
    heroDetails: document.querySelector('[data-hero-action="details"]'),
    heroOrder: document.querySelector('[data-hero-action="order"]'),
    heroNavPrev: document.querySelector('[data-hero-nav="prev"]'),
    heroNavNext: document.querySelector('[data-hero-nav="next"]'),
    heroCTAButtons: {
        catalog: document.querySelector('[data-action="scroll-catalog"]'),
        services: document.querySelector('[data-action="scroll-services"]'),
        openOrder: document.querySelector('[data-action="open-order"]'),
    },
    promoTrack: document.getElementById('promo-track'),
    promoPrev: document.querySelector('[data-promo="prev"]'),
    promoNext: document.querySelector('[data-promo="next"]'),
    contactForm: document.getElementById('contact-form'),
    orderModal: document.getElementById('order-modal'),
    orderForm: document.getElementById('order-form'),
    orderClose: document.querySelector('[data-close="order"]'),
    orderName: document.getElementById('order-name'),
    orderPhone: document.getElementById('order-phone'),
    orderCar: document.getElementById('order-car'),
    orderCarId: document.getElementById('order-car-id'),
    orderNote: document.getElementById('order-note'),
    footerYear: document.getElementById('footer-year'),
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

function logEvent(type, carId, payload) {
    fetch(`${API_BASE}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, carId, payload }),
        keepalive: true,
    }).catch(() => null);
}

function createFilterCheckbox(value, group) {
    const label = document.createElement('label');
    label.className = 'filter-checkbox';
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.value = value;
    input.name = `${group}[]`;
    input.addEventListener('change', () => {
        label.classList.toggle('is-active', input.checked);
    });
    const span = document.createElement('span');
    span.textContent = value;
    label.append(input, span);
    return label;
}

function populateFilterGroup(group, values) {
    const container = elements.filterContainers[group];
    if (!container) return;
    container.innerHTML = '';
    const unique = [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b, 'ru') || a.localeCompare(b));
    unique.forEach((value) => {
        container.append(createFilterCheckbox(value, group));
    });
}

function populateFilters() {
    const { cars } = state;
    populateFilterGroup('brand', cars.map((car) => car.brand));
    populateFilterGroup('fuel', cars.map((car) => car.fuel));
    populateFilterGroup('drivetrain', cars.map((car) => car.drivetrain));
    populateFilterGroup('transmission', cars.map((car) => car.transmission));
    const maxPrice = Math.max(0, ...cars.map((car) => Number(car.price) || 0));
    const rounded = Math.ceil(maxPrice / 100000) * 100000;
    elements.priceRange.max = String(rounded || 0);
    elements.priceRange.value = String(rounded || 0);
    state.filters.priceCap = rounded || null;
    updatePriceDisplay();
}

function readFilters() {
    Object.entries(elements.filterContainers).forEach(([group, container]) => {
        if (!container) return;
        const checked = Array.from(container.querySelectorAll('input:checked')).map((input) => input.value);
        state.filters[group] = new Set(checked);
    });
    state.filters.search = (elements.filterSearch?.value || elements.headerSearch?.value || '').trim().toLowerCase();
    state.filters.yearFrom = Number(elements.yearFrom.value) || null;
    state.filters.yearTo = Number(elements.yearTo.value) || null;
    const priceValue = Number(elements.priceRange.value) || 0;
    state.filters.priceCap = priceValue > 0 ? priceValue : null;
}

function updatePriceDisplay() {
    const value = Number(elements.priceRange.value) || 0;
    if (!value) {
        elements.priceValue.textContent = '—';
        return;
    }
    elements.priceValue.textContent = priceFormatter.format(value);
}

function matchesFilters(car) {
    const { filters } = state;
    if (filters.brand.size && !filters.brand.has(car.brand)) return false;
    if (filters.fuel.size && !filters.fuel.has(car.fuel)) return false;
    if (filters.drivetrain.size && !filters.drivetrain.has(car.drivetrain)) return false;
    if (filters.transmission.size && !filters.transmission.has(car.transmission)) return false;
    if (filters.priceCap && Number(car.price) > filters.priceCap) return false;
    if (filters.yearFrom && Number(car.year) < filters.yearFrom) return false;
    if (filters.yearTo && Number(car.year) > filters.yearTo) return false;
    if (filters.search) {
        const haystack = [car.brand, car.model, car.power, car.fuel, car.drivetrain, car.transmission, car.description, ...(car.features || [])]
            .join(' ')
            .toLowerCase();
        if (!haystack.includes(filters.search)) return false;
    }
    return true;
}

function renderCatalog() {
    const { filtered } = state;
    elements.catalogGrid.innerHTML = '';
    if (!filtered.length) {
        elements.catalogEmpty.classList.remove('hidden');
        return;
    }
    elements.catalogEmpty.classList.add('hidden');
    const fragment = document.createDocumentFragment();
    filtered.forEach((car) => {
        const card = document.createElement('article');
        card.className = 'catalog-card';
        card.innerHTML = `
            <img src="${car.image}" alt="${car.brand} ${car.model}" loading="lazy" />
            <div class="catalog-card__body">
                <div class="catalog-card__title">
                    <h3>${car.brand} ${car.model}</h3>
                    <span>${car.year}</span>
                </div>
                <div class="catalog-card__price">${priceFormatter.format(car.price)}</div>
                <ul class="catalog-card__specs">
                    <li><span>Топливо</span><strong>${car.fuel}</strong></li>
                    <li><span>Привод</span><strong>${car.drivetrain}</strong></li>
                    <li><span>Коробка</span><strong>${car.transmission || '—'}</strong></li>
                    <li><span>Мощность</span><strong>${car.power || '—'}</strong></li>
                </ul>
                <div class="catalog-card__actions">
                    <button class="btn btn-secondary" data-action="details" data-id="${car.id}">Подробнее</button>
                    <button class="btn btn-primary" data-action="order" data-id="${car.id}">Оставить заявку</button>
                </div>
            </div>
        `;
        fragment.appendChild(card);
    });
    elements.catalogGrid.appendChild(fragment);
}

function applyFilters() {
    readFilters();
    state.filtered = state.cars.filter(matchesFilters);
    renderCatalog();
}

function resetFilters() {
    Object.values(elements.filterContainers).forEach((container) => {
        if (!container) return;
        container.querySelectorAll('input[type="checkbox"]').forEach((input) => {
            input.checked = false;
            input.dispatchEvent(new Event('change'));
        });
    });
    elements.filterSearch.value = '';
    elements.headerSearch.value = '';
    elements.yearFrom.value = '';
    elements.yearTo.value = '';
    elements.priceRange.value = elements.priceRange.max || '0';
    updatePriceDisplay();
    applyFilters();
}

function scrollToSection(selector) {
    document.querySelector(selector)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function pickHeroSequence() {
    const heroCandidates = [...state.cars].sort((a, b) => b.price - a.price).slice(0, 6);
    heroState.sequence = heroCandidates.length ? heroCandidates : state.cars;
    heroState.index = 0;
}

function updateHero() {
    const car = heroState.sequence[heroState.index];
    if (!car) return;
    if (elements.heroViewer) {
        elements.heroViewer.classList.add('is-swapping');
        const handleLoad = () => {
            elements.heroViewer.classList.remove('is-swapping');
        };
        elements.heroViewer.addEventListener('load', handleLoad, { once: true });
        elements.heroViewer.src = car.modelUrl || DEFAULT_MODEL_URL;
        window.setTimeout(() => {
            elements.heroViewer.classList.remove('is-swapping');
        }, 600);
    }
    elements.heroTag.textContent = `${car.brand}`;
    elements.heroName.textContent = `${car.model}`;
    const metaParts = [car.year, car.power, car.fuel, car.price ? priceFormatter.format(car.price) : null].filter(Boolean);
    elements.heroMeta.textContent = metaParts.join(' · ');
    elements.heroDetails.dataset.id = car.id;
    elements.heroOrder.dataset.id = car.id;
    elements.heroOrder.dataset.name = `${car.brand} ${car.model}`;
}

function rotateHero(step = 1) {
    if (!heroState.sequence.length) return;
    heroState.index = (heroState.index + step + heroState.sequence.length) % heroState.sequence.length;
    updateHero();
}

function startHeroAutoplay() {
    stopHeroAutoplay();
    heroState.rotation = window.setInterval(() => rotateHero(1), 7000);
}

function stopHeroAutoplay() {
    if (heroState.rotation) {
        window.clearInterval(heroState.rotation);
        heroState.rotation = null;
    }
}

function renderPromo() {
    const { items, index } = promoState;
    elements.promoTrack.innerHTML = '';
    if (!items.length) {
        elements.promoTrack.innerHTML = '<div class="promo-card">Скоро будут размещены свежие новости.</div>';
        return;
    }
    const fragment = document.createDocumentFragment();
    items.forEach((item, idx) => {
        const card = document.createElement('article');
        card.className = 'promo-card';
        card.innerHTML = `
            <time datetime="${item.date || ''}">${item.dateLabel || ''}</time>
            <h3>${item.title}</h3>
            <p>${item.description || ''}</p>
            ${item.cta ? `<a class="btn btn-secondary" href="${item.url || '#'}" target="_blank" rel="noopener">${item.cta}</a>` : ''}
        `;
        fragment.appendChild(card);
        if (idx === index) {
            card.scrollIntoView({ inline: 'center', behavior: 'instant', block: 'nearest' });
        }
    });
    elements.promoTrack.appendChild(fragment);
}

function rotatePromo(step = 1) {
    if (!promoState.items.length) return;
    promoState.index = (promoState.index + step + promoState.items.length) % promoState.items.length;
    renderPromo();
}

function startPromoAutoplay() {
    stopPromoAutoplay();
    promoState.timer = window.setInterval(() => rotatePromo(1), 8000);
}

function stopPromoAutoplay() {
    if (promoState.timer) {
        window.clearInterval(promoState.timer);
        promoState.timer = null;
    }
}

function openOrderModal(car) {
    elements.orderModal.classList.add('open');
    elements.orderModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (car) {
        elements.orderCar.value = `${car.brand} ${car.model}`;
        elements.orderCarId.value = car.id || '';
    } else {
        elements.orderCar.value = '';
        elements.orderCarId.value = '';
    }
    elements.orderName.focus({ preventScroll: true });
}

function closeOrderModal() {
    elements.orderModal.classList.remove('open');
    elements.orderModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    elements.orderForm.reset();
}

function handleCatalogClick(event) {
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    const carId = button.dataset.id;
    const car = state.cars.find((item) => item.id === carId);
    if (!car) return;
    if (button.dataset.action === 'details') {
        logEvent('catalog_details_clicked', carId);
        window.location.href = `car.html?id=${encodeURIComponent(carId)}`;
    } else if (button.dataset.action === 'order') {
        logEvent('catalog_order_clicked', carId);
        openOrderModal(car);
    }
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
            carId: data.carId || data.car || null,
            source: 'site',
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
    elements.headerSearch?.addEventListener('input', () => {
        elements.filterSearch.value = elements.headerSearch.value;
        applyFilters();
    });
    elements.filterSearch?.addEventListener('input', () => {
        elements.headerSearch.value = elements.filterSearch.value;
        applyFilters();
    });
    elements.priceRange?.addEventListener('input', () => {
        updatePriceDisplay();
    });
    elements.applyFilters?.addEventListener('click', applyFilters);
    elements.resetFilters?.addEventListener('click', resetFilters);
    elements.catalogGrid?.addEventListener('click', handleCatalogClick);

    elements.heroNavPrev?.addEventListener('click', () => {
        stopHeroAutoplay();
        rotateHero(-1);
        startHeroAutoplay();
    });
    elements.heroNavNext?.addEventListener('click', () => {
        stopHeroAutoplay();
        rotateHero(1);
        startHeroAutoplay();
    });
    elements.heroDetails?.addEventListener('click', (event) => {
        const carId = event.currentTarget.dataset.id;
        if (!carId) return;
        logEvent('hero_details_clicked', carId);
        window.location.href = `car.html?id=${encodeURIComponent(carId)}`;
    });
    elements.heroOrder?.addEventListener('click', (event) => {
        const carId = event.currentTarget.dataset.id;
        const car = state.cars.find((item) => item.id === carId);
        logEvent('hero_order_clicked', carId);
        openOrderModal(car);
    });

    elements.heroCTAButtons.catalog?.addEventListener('click', () => scrollToSection('#catalog'));
    elements.heroCTAButtons.services?.addEventListener('click', () => scrollToSection('#services'));
    elements.heroCTAButtons.openOrder?.addEventListener('click', () => openOrderModal());

    elements.promoPrev?.addEventListener('click', () => {
        stopPromoAutoplay();
        rotatePromo(-1);
        startPromoAutoplay();
    });
    elements.promoNext?.addEventListener('click', () => {
        stopPromoAutoplay();
        rotatePromo(1);
        startPromoAutoplay();
    });

    elements.orderForm?.addEventListener('submit', async (event) => {
        event.preventDefault();
        try {
            await submitLead(elements.orderForm);
            alert('Спасибо! Мы свяжемся с вами в ближайшее время.');
            closeOrderModal();
        } catch (err) {
            alert(err.message || 'Ошибка отправки заявки');
        }
    });

    elements.contactForm?.addEventListener('submit', async (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        try {
            await submitLead(form);
            alert('Спасибо! Куратор Petra свяжется с вами в ближайшее время.');
            form.reset();
        } catch (err) {
            alert(err.message || 'Ошибка отправки формы');
        }
    });

    elements.orderClose?.addEventListener('click', closeOrderModal);
    elements.orderModal?.addEventListener('click', (event) => {
        if (event.target === elements.orderModal) {
            closeOrderModal();
        }
    });
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && elements.orderModal?.classList.contains('open')) {
            closeOrderModal();
        }
    });
}

function setFooterYear() {
    if (elements.footerYear) {
        elements.footerYear.textContent = new Date().getFullYear();
    }
}

async function loadCars() {
    try {
        const cars = await fetchJson(`${API_BASE}/cars`);
        state.cars = cars || [];
        state.filtered = cars || [];
        populateFilters();
        const presetSearch = sessionStorage.getItem('petraSearch');
        if (presetSearch) {
            if (elements.filterSearch) elements.filterSearch.value = presetSearch;
            if (elements.headerSearch) elements.headerSearch.value = presetSearch;
        }
        applyFilters();
        if (presetSearch) {
            sessionStorage.removeItem('petraSearch');
        }
        pickHeroSequence();
        updateHero();
    } catch (err) {
        console.error(err);
        elements.catalogGrid.innerHTML = '<p>Не удалось загрузить каталог автомобилей.</p>';
    }
}

async function loadPromo() {
    try {
        const banners = await fetchJson(`${API_BASE}/banners`);
        promoState.items = (Array.isArray(banners) ? banners : []).map((item) => ({
            id: item.id,
            title: item.title,
            description: item.description,
            url: item.url,
            cta: item.cta,
            dateLabel: item.dateLabel || item.period || '',
        }));
    } catch (err) {
        promoState.items = [
            {
                id: 'fallback-1',
                title: 'Поступили 3 Range Rover Autobiography PHEV',
                description: 'Успейте забронировать с поставкой в ноябре: гибридная установка на 510 л.с. и Executive Class салон.',
                url: '#catalog',
                cta: 'Смотреть каталог',
                dateLabel: 'Сентябрь 2025',
            },
            {
                id: 'fallback-2',
                title: 'Специальные условия на Taycan 4S Cross Turismo',
                description: 'Доставка под ключ за 90 дней, расширенная гарантия и пневмоподвеска в базе.',
                url: '#catalog',
                cta: 'Подробнее',
                dateLabel: 'Предложение месяца',
            },
        ];
    }
    renderPromo();
    startPromoAutoplay();
}

async function bootstrap() {
    setFooterYear();
    bindEvents();
    await loadCars();
    startHeroAutoplay();
    await loadPromo();
}

bootstrap();
