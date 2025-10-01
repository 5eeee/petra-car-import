const API_BASE = '/api';
const TOKEN_KEY = 'petraAdminToken';

const elements = {
    loginSection: document.getElementById('login-section'),
    loginForm: document.getElementById('login-form'),
    loginError: document.getElementById('login-error'),
    panel: document.getElementById('panel'),
    nav: document.getElementById('nav'),
    panelTitle: document.getElementById('panel-title'),
    panelUser: document.getElementById('panel-user'),
    logoutBtn: document.getElementById('logout'),
    panelViews: document.querySelectorAll('.panel-view'),
    statsOverview: document.getElementById('stats-overview'),
    latestLeadsTable: document.querySelector('#latest-leads tbody'),
    carList: document.getElementById('car-list'),
    carForm: document.getElementById('car-form'),
    carFormTitle: document.getElementById('car-form-title'),
    carReset: document.getElementById('car-reset'),
    carCreate: document.getElementById('car-create'),
    galleryList: document.getElementById('gallery-list'),
    galleryUpload: document.getElementById('gallery-upload'),
    galleryAddUrl: document.getElementById('gallery-add-url'),
    leadTable: document.querySelector('#lead-table tbody'),
    bannerList: document.getElementById('banner-list'),
    bannerForm: document.getElementById('banner-form'),
    bannerFormTitle: document.getElementById('banner-form-title'),
    bannerReset: document.getElementById('banner-reset'),
    bannerCreate: document.getElementById('banner-create'),
    uploadArea: document.getElementById('upload-area'),
    mediaInput: document.getElementById('media-input'),
    mediaSelect: document.getElementById('media-select'),
    uploadResult: document.getElementById('upload-result'),
    uploadUrl: document.getElementById('upload-url'),
    copyUploadUrl: document.getElementById('copy-upload-url'),
};

function uid(size = 10) {
    if (crypto.randomUUID) {
        return crypto.randomUUID().replace(/-/g, '').slice(0, size);
    }
    return Math.random().toString(36).slice(2, 2 + size);
}

const state = {
    token: localStorage.getItem(TOKEN_KEY) || null,
    userEmail: null,
    currentView: 'dashboard',
    overview: null,
    cars: [],
    leads: [],
    banners: [],
    gallery: [],
};

function decodeToken(token) {
    try {
        const payload = JSON.parse(atob(token.split('.')[1] || ''));
        return payload;
    } catch (err) {
        return null;
    }
}

function setToken(value) {
    state.token = value;
    if (value) {
        localStorage.setItem(TOKEN_KEY, value);
        const payload = decodeToken(value);
        state.userEmail = payload?.email || null;
    } else {
        localStorage.removeItem(TOKEN_KEY);
        state.userEmail = null;
    }
}

async function apiFetch(url, options = {}) {
    const headers = options.headers ? { ...options.headers } : {};
    if (state.token) {
        headers.Authorization = `Bearer ${state.token}`;
    }
    if (options.body && !(options.body instanceof FormData) && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
    }
    const response = await fetch(url, { ...options, headers });
    if (response.status === 401) {
        setToken(null);
        showLogin();
        throw new Error('Сессия истекла');
    }
    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Ошибка запроса' }));
        throw new Error(error.error || 'Ошибка запроса');
    }
    return response.json();
}

function showLogin() {
    elements.loginSection.classList.remove('hidden');
    elements.panel.classList.add('hidden');
}

function showPanel() {
    elements.loginSection.classList.add('hidden');
    elements.panel.classList.remove('hidden');
    if (state.userEmail) {
        elements.panelUser.textContent = state.userEmail;
    }
}

function switchView(view) {
    state.currentView = view;
    elements.panelViews.forEach((section) => {
        section.classList.toggle('hidden', section.dataset.view !== view);
    });
    elements.panelTitle.textContent =
        view === 'dashboard'
            ? 'Обзор'
            : view === 'catalog'
            ? 'Каталог'
            : view === 'leads'
            ? 'Заявки'
            : view === 'banners'
            ? 'Баннеры'
            : 'Медиа';
    elements.nav.querySelectorAll('button').forEach((btn) => {
        btn.classList.toggle('active', btn.dataset.view === view);
    });
}

function renderStats(overview) {
    if (!overview) return;
    elements.statsOverview.innerHTML = '';
    const items = [
        { label: 'Заявок', value: overview.leads },
        { label: 'Событий', value: overview.events },
        { label: 'Авто в каталоге', value: overview.cars },
    ];
    items.forEach((item) => {
        const card = document.createElement('div');
        card.className = 'stat-card';
        card.innerHTML = `<span>${item.label}</span><strong>${item.value}</strong>`;
        elements.statsOverview.append(card);
    });
}

function renderLatestLeads(latest) {
    elements.latestLeadsTable.innerHTML = '';
    latest.forEach((lead) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${lead.name || '—'}</td>
            <td>${lead.phone || '—'}</td>
            <td>${lead.car_id || '—'}</td>
            <td>${new Date(lead.created_at).toLocaleString('ru-RU')}</td>
        `;
        elements.latestLeadsTable.append(row);
    });
}

function renderCarList() {
    if (!elements.carList) return;
    const container = document.createElement('table');
    container.className = 'table';
    container.innerHTML = `
        <thead>
            <tr>
                <th>Модель</th>
                <th>Год</th>
                <th>Цена</th>
                <th>Hero</th>
                <th></th>
            </tr>
        </thead>
        <tbody></tbody>
    `;
    const tbody = container.querySelector('tbody');
    state.cars.forEach((car) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${car.brand} ${car.model}</td>
            <td>${car.year}</td>
            <td>${new Intl.NumberFormat('ru-RU').format(car.price)} ₽</td>
            <td>${car.heroRank || 0}</td>
            <td>
                <button class="btn btn-ghost" data-action="edit" data-id="${car.id}">Редактировать</button>
                <button class="btn btn-ghost" data-action="delete" data-id="${car.id}">Удалить</button>
            </td>
        `;
        tbody.append(row);
    });
    elements.carList.innerHTML = '';
    elements.carList.append(container);
}

function featuresToString(features = []) {
    return Array.isArray(features) ? features.join(', ') : '';
}

function specsToString(specs = []) {
    if (!Array.isArray(specs)) return '';
    return specs.map((row) => `${row.label}: ${row.value}`).join('\n');
}

function parseFeatures(value) {
    if (!value) return [];
    return value
        .split(/[\n,]/)
        .map((item) => item.trim())
        .filter(Boolean);
}

function parseSpecs(value) {
    if (!value) return [];
    return value
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
            const [label, ...rest] = line.split(':');
            return { label: label.trim(), value: rest.join(':').trim() };
        })
        .filter((row) => row.value);
}

function renderGallery() {
    elements.galleryList.innerHTML = '';
    state.gallery.forEach((item, index) => {
        const cell = document.createElement('div');
        cell.className = 'gallery-item';
        cell.innerHTML = `
            <img src="${item.image}" alt="${index + 1}" />
            <button type="button" data-index="${index}">×</button>
        `;
        elements.galleryList.append(cell);
    });
}

function populateCarForm(car) {
    const form = elements.carForm;
    form.id.value = car.id || '';
    form.brand.value = car.brand || '';
    form.model.value = car.model || '';
    form.fuel.value = car.fuel || '';
    form.drivetrain.value = car.drivetrain || '';
    form.transmission.value = car.transmission || '';
    form.power.value = car.power || '';
    form.year.value = car.year || '';
    form.price.value = car.price || '';
    form.heroRank.value = car.heroRank || 0;
    form.specSheetUrl.value = car.specSheetUrl || '';
    form.image.value = car.image || '';
    form.modelUrl.value = car.modelUrl || '';
    form.description.value = car.description || '';
    form.features.value = featuresToString(car.features);
    form.specs.value = specsToString(car.specs);
    state.gallery = (car.gallery || []).map((item, idx) => ({ id: item.id || idx, image: item.image }));
    renderGallery();
    elements.carFormTitle.textContent = `Редактирование: ${car.brand} ${car.model}`;
}

function resetCarForm() {
    elements.carForm.reset();
    elements.carFormTitle.textContent = 'Новый автомобиль';
    state.gallery = [];
    renderGallery();
}

function renderLeadTable() {
    elements.leadTable.innerHTML = '';
    const statuses = [
        { value: 'new', label: 'Новая' },
        { value: 'in_progress', label: 'В работе' },
        { value: 'closed', label: 'Закрыта' },
        { value: 'archived', label: 'Архив' },
    ];
    state.leads.forEach((lead) => {
        const row = document.createElement('tr');
        const created = lead.createdAt ? new Date(lead.createdAt) : null;
        row.innerHTML = `
            <td>${lead.name || '—'}</td>
            <td>${lead.phone || '—'}</td>
            <td>${lead.carName || '—'}</td>
            <td></td>
            <td>${created ? created.toLocaleString('ru-RU') : '—'}</td>
        `;
        const select = document.createElement('select');
        select.dataset.id = lead.id;
        statuses.forEach((option) => {
            const opt = document.createElement('option');
            opt.value = option.value;
            opt.textContent = option.label;
            if ((lead.status || 'new') === option.value) opt.selected = true;
            select.append(opt);
        });
        row.children[3].append(select);
        elements.leadTable.append(row);
    });
}

function renderBannerList() {
    const table = document.createElement('table');
    table.className = 'table';
    table.innerHTML = `
        <thead>
            <tr>
                <th>Заголовок</th>
                <th>Лейбл</th>
                <th>Активен</th>
                <th>Порядок</th>
                <th></th>
            </tr>
        </thead>
        <tbody></tbody>
    `;
    const tbody = table.querySelector('tbody');
    state.banners.forEach((banner) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${banner.title}</td>
            <td>${banner.dateLabel || '—'}</td>
            <td>${banner.isActive ? 'Да' : 'Нет'}</td>
            <td>${banner.sortOrder}</td>
            <td>
                <button class="btn btn-ghost" data-banner="edit" data-id="${banner.id}">Редактировать</button>
                <button class="btn btn-ghost" data-banner="delete" data-id="${banner.id}">Удалить</button>
            </td>
        `;
        tbody.append(row);
    });
    elements.bannerList.innerHTML = '';
    elements.bannerList.append(table);
}

function populateBannerForm(banner) {
    const form = elements.bannerForm;
    form.id.value = banner.id || '';
    form.title.value = banner.title || '';
    form.description.value = banner.description || '';
    form.image.value = banner.image || '';
    form.url.value = banner.url || '';
    form.cta.value = banner.cta || '';
    form.dateLabel.value = banner.dateLabel || '';
    form.sortOrder.value = banner.sortOrder || 0;
    form.isActive.checked = Boolean(banner.isActive);
    elements.bannerFormTitle.textContent = banner.id ? 'Редактирование баннера' : 'Новый баннер';
}

function resetBannerForm() {
    elements.bannerForm.reset();
    elements.bannerFormTitle.textContent = 'Новый баннер';
}

async function loadInitialData() {
    const [overview, cars, leadsList, bannersList] = await Promise.all([
        apiFetch(`${API_BASE}/admin/overview`),
        apiFetch(`${API_BASE}/admin/cars`),
        apiFetch(`${API_BASE}/admin/leads`),
        apiFetch(`${API_BASE}/admin/banners`),
    ]);
    state.overview = overview;
    state.cars = cars;
    state.leads = leadsList;
    state.banners = bannersList;
    renderStats(overview);
    renderLatestLeads(overview.latestLeads || []);
    renderCarList();
    renderLeadTable();
    renderBannerList();
}

async function handleCreateOrUpdateCar(event) {
    event.preventDefault();
    const form = elements.carForm;
    const payload = {
        id: form.id.value || undefined,
        brand: form.brand.value,
        model: form.model.value,
        fuel: form.fuel.value,
        drivetrain: form.drivetrain.value,
        transmission: form.transmission.value,
        power: form.power.value,
        year: Number(form.year.value) || new Date().getFullYear(),
        price: Number(form.price.value) || 0,
        heroRank: Number(form.heroRank.value) || 0,
        specSheetUrl: form.specSheetUrl.value || null,
        image: form.image.value,
        modelUrl: form.modelUrl.value,
        description: form.description.value,
        features: parseFeatures(form.features.value),
        specs: parseSpecs(form.specs.value),
        gallery: state.gallery,
    };
    const method = payload.id ? 'PUT' : 'POST';
    const url = payload.id ? `${API_BASE}/admin/cars/${payload.id}` : `${API_BASE}/admin/cars`;
    const saved = await apiFetch(url, { method, body: JSON.stringify(payload) });
    if (!payload.id) {
        form.id.value = saved.id;
    }
    await refreshCars();
    populateCarForm(saved);
}

async function refreshCars() {
    state.cars = await apiFetch(`${API_BASE}/admin/cars`);
    renderCarList();
}

async function handleDeleteCar(id) {
    if (!confirm('Удалить автомобиль?')) return;
    await apiFetch(`${API_BASE}/admin/cars/${id}`, { method: 'DELETE' });
    await refreshCars();
    resetCarForm();
}

async function handleEditCar(id) {
    const car = await apiFetch(`${API_BASE}/cars/${id}`);
    populateCarForm(car);
}

async function refreshLeads() {
    state.leads = await apiFetch(`${API_BASE}/admin/leads`);
    renderLeadTable();
}

async function refreshBanners() {
    state.banners = await apiFetch(`${API_BASE}/admin/banners`);
    renderBannerList();
}

async function handleBannerSubmit(event) {
    event.preventDefault();
    const form = elements.bannerForm;
    const payload = {
        id: form.id.value || undefined,
        title: form.title.value,
        description: form.description.value,
        image: form.image.value,
        url: form.url.value,
        cta: form.cta.value,
        dateLabel: form.dateLabel.value,
        sortOrder: Number(form.sortOrder.value) || 0,
        isActive: form.isActive.checked,
    };
    const method = payload.id ? 'PUT' : 'POST';
    const url = payload.id ? `${API_BASE}/admin/banners/${payload.id}` : `${API_BASE}/admin/banners`;
    const saved = await apiFetch(url, { method, body: JSON.stringify(payload) });
    await refreshBanners();
    populateBannerForm(saved);
}

async function handleDeleteBanner(id) {
    if (!confirm('Удалить баннер?')) return;
    await apiFetch(`${API_BASE}/admin/banners/${id}`, { method: 'DELETE' });
    await refreshBanners();
    resetBannerForm();
}

async function uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiFetch(`${API_BASE}/admin/upload`, { method: 'POST', body: formData });
    return response.url;
}

function bindEvents() {
    elements.nav.addEventListener('click', (event) => {
        const target = event.target.closest('button[data-view]');
        if (!target) return;
        switchView(target.dataset.view);
    });

    elements.logoutBtn.addEventListener('click', () => {
        setToken(null);
        showLogin();
    });

    elements.carList?.addEventListener('click', async (event) => {
        const button = event.target.closest('button[data-action]');
        if (!button) return;
        const id = button.dataset.id;
        if (button.dataset.action === 'edit') {
            await handleEditCar(id);
        } else if (button.dataset.action === 'delete') {
            await handleDeleteCar(id);
        }
    });

    elements.carForm.addEventListener('submit', handleCreateOrUpdateCar);
    elements.carReset.addEventListener('click', resetCarForm);
    elements.carCreate.addEventListener('click', resetCarForm);

    elements.galleryList.addEventListener('click', (event) => {
        const btn = event.target.closest('button[data-index]');
        if (!btn) return;
        const index = Number(btn.dataset.index);
        state.gallery.splice(index, 1);
        renderGallery();
    });

    elements.galleryUpload.addEventListener('change', async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const url = await uploadFile(file);
        state.gallery.push({ id: uid(8), image: url });
        renderGallery();
        elements.galleryUpload.value = '';
    });

    elements.galleryAddUrl.addEventListener('click', () => {
        const url = prompt('Введите ссылку на изображение');
        if (url) {
            state.gallery.push({ id: uid(8), image: url.trim() });
            renderGallery();
        }
    });

    elements.leadTable.addEventListener('change', async (event) => {
        const select = event.target.closest('select[data-id]');
        if (!select) return;
        await apiFetch(`${API_BASE}/admin/leads/${select.dataset.id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status: select.value }),
        });
        await refreshLeads();
    });

    elements.bannerList.addEventListener('click', async (event) => {
        const btn = event.target.closest('button[data-banner]');
        if (!btn) return;
        const id = btn.dataset.id;
        if (btn.dataset.banner === 'edit') {
            const banner = state.banners.find((item) => item.id === id);
            populateBannerForm(banner || {});
        } else if (btn.dataset.banner === 'delete') {
            await handleDeleteBanner(id);
        }
    });

    elements.bannerForm.addEventListener('submit', handleBannerSubmit);
    elements.bannerReset.addEventListener('click', resetBannerForm);
    elements.bannerCreate.addEventListener('click', resetBannerForm);

    elements.mediaSelect.addEventListener('click', () => {
        elements.mediaInput.click();
    });
    elements.mediaInput.addEventListener('change', async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const url = await uploadFile(file);
        elements.uploadUrl.value = `${window.location.origin}${url}`;
        elements.uploadResult.classList.remove('hidden');
        elements.mediaInput.value = '';
    });
    elements.copyUploadUrl.addEventListener('click', async () => {
        if (!elements.uploadUrl.value) return;
        await navigator.clipboard.writeText(elements.uploadUrl.value);
        alert('Ссылка скопирована');
    });

    if (elements.uploadArea) {
        elements.uploadArea.addEventListener('dragover', (event) => {
            event.preventDefault();
            elements.uploadArea.classList.add('is-drag');
        });
        elements.uploadArea.addEventListener('dragleave', () => {
            elements.uploadArea.classList.remove('is-drag');
        });
        elements.uploadArea.addEventListener('drop', async (event) => {
            event.preventDefault();
            elements.uploadArea.classList.remove('is-drag');
            const file = event.dataTransfer?.files?.[0];
            if (!file) return;
            const url = await uploadFile(file);
            elements.uploadUrl.value = `${window.location.origin}${url}`;
            elements.uploadResult.classList.remove('hidden');
        });
    }
}

async function bootstrap() {
    bindEvents();
    if (!state.token) {
        showLogin();
        return;
    }
    if (!state.userEmail && state.token) {
        const payload = decodeToken(state.token);
        state.userEmail = payload?.email || null;
    }
    showPanel();
    try {
        await loadInitialData();
        switchView('dashboard');
    } catch (err) {
        console.error(err);
        setToken(null);
        showLogin();
        alert(err.message || 'Не удалось загрузить данные');
    }
}

elements.loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    elements.loginError.textContent = '';
    const formData = new FormData(elements.loginForm);
    const payload = Object.fromEntries(formData.entries());
    try {
        const { token } = await apiFetch(`${API_BASE}/admin/login`, {
            method: 'POST',
            body: JSON.stringify(payload),
        });
        setToken(token);
        showPanel();
        await loadInitialData();
        switchView('dashboard');
    } catch (err) {
        elements.loginError.textContent = err.message || 'Не удалось войти';
    }
});

bootstrap();
