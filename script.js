const carInventory = [
    {
        id: 'taycan-4s',
        brand: 'Porsche',
        model: 'Taycan 4S Cross Turismo',
        fuel: 'Электро',
        drivetrain: 'AWD',
        transmission: '2-ступ. автомат',
        year: 2024,
        price: 11500000,
        power: '490 л.с.',
        image: 'https://images.unsplash.com/photo-1619642534960-565b53b3e82b?auto=compress&cs=tinysrgb&w=1600&dpr=1',
        features: ['Performance Battery Plus', 'Запас хода 450 км', 'Пневмоподвеска'],
        description: 'Полноприводный электрокросс Taycan с адаптивной пневмоподвеской и расширенным багажным пространством для дальних поездок.',
        specs: [
            { label: 'Двигатель', value: 'Электрический, 490 л.с.' },
            { label: 'Разгон 0–100 км/ч', value: '3,8 секунды' },
            { label: 'Запас хода', value: 'до 450 км (WLTP)' },
            { label: 'Комплектация', value: 'Performance Battery Plus, Premium Package' },
        ],
        modelUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Porsche/glTF-Binary/Porsche.glb',
    },
    {
        id: 'm4-competition',
        brand: 'BMW',
        model: 'M4 Competition xDrive',
        fuel: 'Бензин',
        drivetrain: 'AWD',
        transmission: '8-ступ. автомат',
        year: 2024,
        price: 9700000,
        power: '510 л.с.',
        image: 'https://images.unsplash.com/photo-1616728770275-0a6f9ff5d4c4?auto=compress&cs=tinysrgb&w=1600',
        features: ['Carbon Bucket Seats', 'M Drift Analyzer', 'M xDrive'],
        description: 'Купе M4 в исполнении Competition с полным приводом, карбоновым пакетом и спортивной кинематикой подвески.',
        specs: [
            { label: 'Двигатель', value: '3.0 TwinPower Turbo, 510 л.с.' },
            { label: 'Разгон 0–100 км/ч', value: '3,5 секунды' },
            { label: 'Привод', value: 'M xDrive с перераспределением момента' },
            { label: 'Особенности', value: 'Carbon bucket seats, M Track Mode' },
        ],
        modelUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/CesiumMilkTruck/glTF-Binary/CesiumMilkTruck.glb',
    },
    {
        id: 'gle-450d',
        brand: 'Mercedes-Benz',
        model: 'GLE 450d 4MATIC',
        fuel: 'Дизель',
        drivetrain: 'AWD',
        transmission: '9-ступ. автомат',
        year: 2024,
        price: 8850000,
        power: '367 л.с.',
        image: 'https://images.unsplash.com/photo-1617813488990-976f5d82c1c3?auto=compress&cs=tinysrgb&w=1600&dpr=1',
        features: ['MBUX Hyperscreen', 'AIRMATIC', 'Пакет Night'],
        description: 'Современный премиальный внедорожник с дизельным mild-hybrid двигателем, поддержкой полуавтономного вождения и роскошным салоном.',
        specs: [
            { label: 'Двигатель', value: '3.0 дизель, 367 л.с. + EQ Boost' },
            { label: 'Подвеска', value: 'AIRMATIC, адаптивные амортизаторы' },
            { label: 'Салон', value: 'Nappa Leather, Ambient 64 цвета' },
            { label: 'Ассистенты', value: 'Driving Assistance Plus, Parking Package' },
        ],
        modelUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/ClassicCar/glTF-Binary/ClassicCar.glb',
    },
    {
        id: 'lx600',
        brand: 'Lexus',
        model: 'LX 600 Ultra Luxury',
        fuel: 'Бензин',
        drivetrain: '4WD',
        transmission: '10-ступ. автомат',
        year: 2023,
        price: 11800000,
        power: '409 л.с.',
        image: 'https://images.unsplash.com/photo-1617814075524-4820fbf08b88?auto=compress&cs=tinysrgb&w=1600&dpr=1',
        features: ['Executive Lounge', 'Mark Levinson 25', 'BladeScan AHS'],
        description: 'Флагманский внедорожник Lexus с четырёхместным салоном Executive, массажно-релаксационными креслами и премиальным звуком Mark Levinson.',
        specs: [
            { label: 'Двигатель', value: '3.5 V6 Twin-Turbo, 409 л.с.' },
            { label: 'Компоновка', value: '4 индивидуальных кресла с массажем' },
            { label: 'Аудио', value: 'Mark Levinson Reference 25 динамиков' },
            { label: 'Безопасность', value: 'Lexus Safety System+ 3.0' },
        ],
        modelUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/CesiumMilkTruck/glTF-Binary/CesiumMilkTruck.glb',
    },
    {
        id: 'landcruiser-300',
        brand: 'Toyota',
        model: 'Land Cruiser 300 GR-Sport',
        fuel: 'Бензин',
        drivetrain: '4WD',
        transmission: '10-ступ. автомат',
        year: 2024,
        price: 9600000,
        power: '415 л.с.',
        image: 'https://images.unsplash.com/photo-1549921296-3ecf4aac5734?auto=compress&cs=tinysrgb&w=1600&dpr=1',
        features: ['GR-Sport', 'Crawl Control', 'KDSS'],
        description: 'Исполнение GR-Sport с электронными стабилизаторами KDSS, блокировками и спортивными акцентами экстерьера.',
        specs: [
            { label: 'Двигатель', value: '3.5 V6 Twin-Turbo, 415 л.с.' },
            { label: 'Система 4WD', value: 'Multi-Terrain Select, Crawl Control' },
            { label: 'Подвеска', value: 'Электронные стабилизаторы KDSS' },
            { label: 'Интерьер', value: 'GR-кресла, чёрный потолок' },
        ],
        modelUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Buggy/glTF-Binary/Buggy.glb',
    },
    {
        id: 'rs-etron',
        brand: 'Audi',
        model: 'RS e-tron GT',
        fuel: 'Электро',
        drivetrain: 'AWD',
        transmission: 'Одноступ. редуктор',
        year: 2024,
        price: 12400000,
        power: '646 л.с.',
        image: 'https://images.unsplash.com/photo-1632477642782-a14547e76437?auto=compress&cs=tinysrgb&w=1600&dpr=1',
        features: ['Carbon Black', 'Matrix LED', 'All-wheel steering'],
        description: 'Электрический гран-турер с двухмоторной установкой, полноуправляемым шасси и моментальным разгоном.',
        specs: [
            { label: 'Двигатель', value: 'Два электромотора, 646 л.с.' },
            { label: 'Разгон 0–100 км/ч', value: '3,3 секунды' },
            { label: 'Запас хода', value: '472 км (WLTP)' },
            { label: 'Особенности', value: 'Carbon Black, quattro, all-wheel steering' },
        ],
        modelUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Porsche/glTF-Binary/Porsche.glb',
    },
    {
        id: 'autobiography-phev',
        brand: 'Land Rover',
        model: 'Range Rover Autobiography PHEV',
        fuel: 'Гибрид',
        drivetrain: 'AWD',
        transmission: '8-ступ. автомат',
        year: 2024,
        price: 14500000,
        power: '510 л.с.',
        image: 'https://images.unsplash.com/photo-1563720222244-eca16d6ce01a?auto=compress&cs=tinysrgb&w=1600',
        features: ['Executive Class Comfort', 'Meridian Signature', 'EV Range 100 км'],
        description: 'Флагманский Range Rover с подзаряжаемым гибридом, четырехместным салоном Executive и адаптивной пневмоподвеской.',
        specs: [
            { label: 'Двигатель', value: '3.0 PHEV, 510 л.с.' },
            { label: 'Электроход', value: 'до 100 км (WLTP)' },
            { label: 'Салон', value: 'Executive Class, столики, охлаждение' },
            { label: 'Аудио', value: 'Meridian Signature 1600 Вт' },
        ],
        modelUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Porsche/glTF-Binary/Porsche.glb',
    },
    {
        id: 'patrol-nismo',
        brand: 'Nissan',
        model: 'Patrol NISMO',
        fuel: 'Бензин',
        drivetrain: '4WD',
        transmission: '7-ступ. автомат',
        year: 2024,
        price: 11200000,
        power: '428 л.с.',
        image: 'https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=compress&cs=tinysrgb&w=1600&dpr=1',
        features: ['Bilstein', 'Aero NISMO', 'NISMO interior'],
        description: 'Эксклюзивная версия Patrol с заводским тюнингом NISMO, спортивной подвеской Bilstein и вынесенными аэродинамическими элементами.',
        specs: [
            { label: 'Двигатель', value: '5.6 V8, 428 л.с.' },
            { label: 'Подвеска', value: 'Bilstein, спортивная настройка' },
            { label: 'Экстерьер', value: 'NISMO Aero Kit, 22" диски' },
            { label: 'Интерьер', value: 'Алькантара, контрастная прострочка' },
        ],
        modelUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Buggy/glTF-Binary/Buggy.glb',
    },
    {
        id: 'model-x-plaid',
        brand: 'Tesla',
        model: 'Model X Plaid',
        fuel: 'Электро',
        drivetrain: 'AWD',
        transmission: 'Одноступ. редуктор',
        year: 2024,
        price: 10500000,
        power: '1020 л.с.',
        image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=compress&cs=tinysrgb&w=1600&dpr=1',
        features: ['Tri-Motor', 'Yoke', 'Falcon Wings'],
        description: 'Самый быстрый семейный электрокроссовер с три-моторной системой и дверьми Falcon Wing, оснащённый автопилотом FSD.',
        specs: [
            { label: 'Двигатель', value: 'Три электромотора, 1020 л.с.' },
            { label: 'Разгон 0–100 км/ч', value: '2,6 секунд' },
            { label: 'Запас хода', value: '580 км (WLTP)' },
            { label: 'Особенности', value: 'Yoke, Falcon Wing, FSD' },
        ],
        modelUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Porsche/glTF-Binary/Porsche.glb',
    },
    {
        id: 'ferrari-roma',
        brand: 'Ferrari',
        model: 'Roma',
        fuel: 'Бензин',
        drivetrain: 'RWD',
        transmission: '8-ступ. робот',
        year: 2023,
        price: 18700000,
        power: '620 л.с.',
        image: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=compress&cs=tinysrgb&w=1600',
        features: ['Matte Grigio', 'Magnaride', 'Carbon Pack'],
        description: 'Элегантное купе Ferrari с матовым окрасом, подвеской Magnaride и современным цифровым кокпитом.',
        specs: [
            { label: 'Двигатель', value: '3.9 V8 Twin-Turbo, 620 л.с.' },
            { label: 'Разгон 0–100 км/ч', value: '3,4 секунды' },
            { label: 'Макс. скорость', value: '320 км/ч' },
            { label: 'Пакет', value: 'Carbon interior & exterior pack' },
        ],
        modelUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Ferrari/glTF-Binary/Ferrari.glb',
    },
    {
        id: 'ioniq5-n',
        brand: 'Hyundai',
        model: 'Ioniq 5 N',
        fuel: 'Электро',
        drivetrain: 'AWD',
        transmission: 'Одноступ. редуктор',
        year: 2025,
        price: 6400000,
        power: '650 л.с.',
        image: 'https://images.unsplash.com/photo-1620891549027-942fdc95a128?auto=compress&cs=tinysrgb&w=1600',
        features: ['N e-Shift', 'Track Mode', 'N Drift Optimizer'],
        description: 'Первый электрический хетчбек Hyundai N c трековым режимом, имитацией переключений и усиленной системой охлаждения.',
        specs: [
            { label: 'Двигатель', value: 'Два электромотора, 650 л.с. (overboost)' },
            { label: 'Разгон 0–100 км/ч', value: '3,4 секунды' },
            { label: 'Аккумулятор', value: '84 кВт·ч, 800V архитектура' },
            { label: 'Особенности', value: 'N e-shift, N Drift Optimizer, Track mode' },
        ],
        modelUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/CesiumMilkTruck/glTF-Binary/CesiumMilkTruck.glb',
    },
    {
        id: 'escalade-v',
        brand: 'Cadillac',
        model: 'Escalade-V ESV',
        fuel: 'Бензин',
        drivetrain: 'AWD',
        transmission: '10-ступ. автомат',
        year: 2024,
        price: 12500000,
        power: '682 л.с.',
        image: 'https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?auto=compress&cs=tinysrgb&w=1600',
        features: ['Super Cruise', '36 speakers AKG', 'MagRide 4.0'],
        description: 'Премиальный полноразмерный SUV с шестицилиндровым компрессорным V8, адаптивной подвеской и системой Super Cruise.',
        specs: [
            { label: 'Двигатель', value: '6.2 V8 с нагнетателем, 682 л.с.' },
            { label: 'Аудио', value: 'AKG Studio Reference 36 динамиков' },
            { label: 'Технологии', value: 'Super Cruise, MagRide 4.0' },
            { label: 'Салон', value: 'ESV, 3 ряда, полуанилин' },
        ],
        modelUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Buggy/glTF-Binary/Buggy.glb',
    },
    {
        id: 'gr-yaris',
        brand: 'Toyota',
        model: 'GR Yaris Circuit Pack',
        fuel: 'Бензин',
        drivetrain: 'AWD',
        transmission: '6-ступ. МКПП',
        year: 2024,
        price: 4300000,
        power: '304 л.с.',
        image: 'https://images.unsplash.com/photo-1618841558898-14d0329e6356?auto=compress&cs=tinysrgb&w=1600&dpr=1',
        features: ['Torsen LSD', 'Circuit Suspension', 'Lightweight'],
        description: 'Ралли-хэтчбек с трёхцилиндровым турбомотором, ручной коробкой и пакетами для автоспорта с завода.',
        specs: [
            { label: 'Двигатель', value: '1.6 Turbo 3 цилиндра, 304 л.с.' },
            { label: 'Коробка', value: '6-ступ. механика, iMT' },
            { label: 'Пакет', value: 'Circuit Pack: Torsen LSD, жёсткая подвеска' },
            { label: 'Масса', value: '1 280 кг' },
        ],
        modelUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Buggy/glTF-Binary/Buggy.glb',
    },
    {
        id: 'bmw-520d',
        brand: 'BMW',
        model: '520d Touring xDrive',
        fuel: 'Дизель',
        drivetrain: 'AWD',
        transmission: '8-ступ. автомат',
        year: 2024,
        price: 5200000,
        power: '197 л.с.',
        image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=compress&cs=tinysrgb&w=1600&dpr=1',
        features: ['M Sport Pro', 'Panoramic Sky Lounge', 'Mild-Hybrid'],
        description: 'Практичный универсал с экономичным дизелем, системой mild-hybrid и спортивным пакетом M Sport Pro.',
        specs: [
            { label: 'Двигатель', value: '2.0 дизель + 48V mild-hybrid, 197 л.с.' },
            { label: 'Привод', value: 'xDrive, адаптивная подвеска' },
            { label: 'Интерьер', value: 'Sensafin + Ambient Sky Lounge' },
            { label: 'Технологии', value: 'BMW Live Cockpit Pro, Driving Assistant' },
        ],
        modelUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/CesiumMilkTruck/glTF-Binary/CesiumMilkTruck.glb',
    },
];

const defaultModelUrl = 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Porsche/glTF-Binary/Porsche.glb';

const priceFormatter = new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
});

const controls = {
    brand: document.getElementById('brand-filter'),
    fuel: document.getElementById('fuel-filter'),
    drivetrain: document.getElementById('drivetrain-filter'),
    transmission: document.getElementById('transmission-filter'),
    price: document.getElementById('price-filter'),
    search: document.getElementById('search-filter'),
    reset: document.getElementById('reset-filters'),
};

const inventoryGrid = document.getElementById('inventory-grid');
const emptyState = document.getElementById('inventory-empty');

const carModal = document.getElementById('car-modal');
const carModalTitle = document.getElementById('car-modal-title');
const carModalDescription = document.getElementById('car-modal-description');
const carModalSpecs = document.getElementById('car-modal-specs');
const carModalFeatures = document.getElementById('car-modal-features');
const carViewer = document.getElementById('car-viewer');
const carModalOrderBtn = document.getElementById('car-modal-order');

const orderModal = document.getElementById('order-modal');
const orderForm = document.getElementById('order-form');
const orderCarInput = document.getElementById('order-car');
const orderModalTitle = document.getElementById('order-modal-title');

const contactForm = document.getElementById('contact-form');

const trailCanvas = document.getElementById('cursor-trail');
const trailCtx = trailCanvas.getContext('2d');
let trailPoints = [];
const trailTTL = 700;
let animationFrameId;

let currentCarId = null;

function populateFilter(select, values) {
    const sorted = [...new Set(values)].sort((a, b) => a.localeCompare(b, 'ru'));
    sorted.forEach((value) => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        select.append(option);
    });
}

function populateFilters() {
    populateFilter(controls.brand, carInventory.map((car) => car.brand));
    populateFilter(controls.fuel, carInventory.map((car) => car.fuel));
    populateFilter(controls.drivetrain, carInventory.map((car) => car.drivetrain));
    populateFilter(controls.transmission, carInventory.map((car) => car.transmission));
}

function renderInventory(list) {
    inventoryGrid.innerHTML = '';
    if (!list.length) {
        emptyState.classList.remove('hidden');
        return;
    }
    emptyState.classList.add('hidden');
    const fragment = document.createDocumentFragment();

    list.forEach((car) => {
        const card = document.createElement('article');
        card.className = 'inventory-card';
        card.innerHTML = `
            <img src="${car.image}" alt="${car.brand} ${car.model}" loading="lazy" />
            <div class="card-body">
                <div class="card-title">
                    <h3>${car.brand} ${car.model}</h3>
                    <span>${car.year}</span>
                </div>
                <div class="card-price">${priceFormatter.format(car.price)}</div>
                <div class="card-meta">
                    <span>${car.fuel} · ${car.power}</span>
                    <span>${car.drivetrain} · ${car.transmission}</span>
                </div>
                <div class="card-tags">
                    ${car.features.map((feature) => `<span class="tag">${feature}</span>`).join('')}
                </div>
                <div class="card-actions">
                    <button class="btn btn-secondary" data-action="details" data-id="${car.id}">Подробнее</button>
                    <button class="btn btn-primary" data-action="order" data-name="${car.brand} ${car.model}">Заявка</button>
                </div>
            </div>
        `;
        fragment.append(card);
    });
    inventoryGrid.append(fragment);
}

function applyFilters() {
    const brand = controls.brand.value;
    const fuel = controls.fuel.value;
    const drivetrain = controls.drivetrain.value;
    const transmission = controls.transmission.value;
    const priceCap = Number(controls.price.value);
    const query = controls.search.value.trim().toLowerCase();

    const filtered = carInventory.filter((car) => {
        if (brand !== 'all' && car.brand !== brand) return false;
        if (fuel !== 'all' && car.fuel !== fuel) return false;
        if (drivetrain !== 'all' && car.drivetrain !== drivetrain) return false;
        if (transmission !== 'all' && car.transmission !== transmission) return false;
        if (!Number.isNaN(priceCap) && priceCap > 0 && car.price > priceCap) return false;
        if (query) {
            const haystack = `${car.brand} ${car.model} ${car.features.join(' ')}`.toLowerCase();
            if (!haystack.includes(query)) return false;
        }
        return true;
    });

    renderInventory(filtered);
}

function resetFilters() {
    controls.brand.value = 'all';
    controls.fuel.value = 'all';
    controls.drivetrain.value = 'all';
    controls.transmission.value = 'all';
    controls.price.value = '';
    controls.search.value = '';
    renderInventory(carInventory);
}

function disableScroll(disable) {
    document.body.style.overflow = disable ? 'hidden' : '';
}

function openCarModal(carId) {
    const car = carInventory.find((item) => item.id === carId);
    if (!car) return;
    currentCarId = carId;
    carModalTitle.textContent = `${car.brand} ${car.model}`;
    carModalDescription.textContent = car.description;

    carModalSpecs.innerHTML = '';
    car.specs.forEach((spec) => {
        const li = document.createElement('li');
        li.innerHTML = `<span>${spec.label}</span><span>${spec.value}</span>`;
        carModalSpecs.append(li);
    });

    carModalFeatures.innerHTML = car.features.map((feature) => `<span>${feature}</span>`).join('');
    carViewer.src = car.modelUrl || defaultModelUrl;
    carModalOrderBtn.dataset.carName = `${car.brand} ${car.model}`;

    carModal.classList.add('open');
    carModal.setAttribute('aria-hidden', 'false');
    disableScroll(true);
}

function closeCarModal() {
    carModal.classList.remove('open');
    carModal.setAttribute('aria-hidden', 'true');
    disableScroll(false);
    currentCarId = null;
}

function openOrderModal(carName = '') {
    orderCarInput.value = carName;
    if (carName) {
        orderModalTitle.textContent = `Заявка на ${carName}`;
    } else {
        orderModalTitle.textContent = 'Заявка на автомобиль';
    }
    orderModal.classList.add('open');
    orderModal.setAttribute('aria-hidden', 'false');
    disableScroll(true);
}

function closeOrderModal() {
    orderModal.classList.remove('open');
    orderModal.setAttribute('aria-hidden', 'true');
    disableScroll(false);
}

function handleInventoryClick(event) {
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    const action = button.dataset.action;
    if (action === 'details') {
        openCarModal(button.dataset.id);
    } else if (action === 'order') {
        openOrderModal(button.dataset.name);
    }
}

function initFilters() {
    ['change', 'input'].forEach((type) => {
        controls.brand.addEventListener(type, applyFilters);
        controls.fuel.addEventListener(type, applyFilters);
        controls.drivetrain.addEventListener(type, applyFilters);
        controls.transmission.addEventListener(type, applyFilters);
        controls.price.addEventListener(type, applyFilters);
    });
    controls.search.addEventListener('input', applyFilters);
    controls.reset.addEventListener('click', resetFilters);
}

function initHeroLinks() {
    const inventoryBtn = document.querySelector('[data-action="open-inventory"]');
    const servicesBtn = document.querySelector('[data-action="open-services"]');
    if (inventoryBtn) {
        inventoryBtn.addEventListener('click', () => {
            document.getElementById('inventory')?.scrollIntoView({ behavior: 'smooth' });
        });
    }
    if (servicesBtn) {
        servicesBtn.addEventListener('click', () => {
            document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
        });
    }
    const headerOrder = document.getElementById('header-order');
    headerOrder?.addEventListener('click', () => openOrderModal('Не выбран'));
}

function initModals() {
    carModal.addEventListener('click', (event) => {
        if (event.target === carModal || event.target.dataset.close === 'car') {
            closeCarModal();
        }
    });

    orderModal.addEventListener('click', (event) => {
        if (event.target === orderModal || event.target.dataset.close === 'order') {
            closeOrderModal();
        }
    });

    carModalOrderBtn.addEventListener('click', () => {
        const carName = carModalOrderBtn.dataset.carName || '';
        closeCarModal();
        openOrderModal(carName);
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            if (orderModal.classList.contains('open')) {
                closeOrderModal();
            }
            if (carModal.classList.contains('open')) {
                closeCarModal();
            }
        }
    });
}

function initForms() {
    contactForm?.addEventListener('submit', (event) => {
        event.preventDefault();
        const name = contactForm.querySelector('#client-name')?.value || 'Гость';
        alert(`Спасибо, ${name}! Куратор Petra свяжется с вами в ближайшее время.`);
        contactForm.reset();
    });

    orderForm?.addEventListener('submit', (event) => {
        event.preventDefault();
        const data = Object.fromEntries(new FormData(orderForm).entries());
        console.table(data);
        alert('Заявка отправлена! Менеджер Petra свяжется с вами в ближайшее время.');
        orderForm.reset();
        closeOrderModal();
    });
}

function resizeTrailCanvas() {
    trailCanvas.width = window.innerWidth;
    trailCanvas.height = window.innerHeight;
}

function addTrailPoint(x, y) {
    const time = performance.now();
    trailPoints.push({ x, y, time });
}

function drawTrail() {
    const now = performance.now();
    trailPoints = trailPoints.filter((point) => now - point.time < trailTTL);

    trailCtx.clearRect(0, 0, trailCanvas.width, trailCanvas.height);
    trailCtx.lineCap = 'round';
    trailCtx.lineJoin = 'round';

    for (let i = 1; i < trailPoints.length; i += 1) {
        const start = trailPoints[i - 1];
        const end = trailPoints[i];
        const age = (now - end.time) / trailTTL;
        const alpha = Math.max(0, 0.6 - age * 0.6);
        if (alpha <= 0) continue;
        const gradient = trailCtx.createLinearGradient(start.x, start.y, end.x, end.y);
        gradient.addColorStop(0, `rgba(0, 195, 255, ${alpha * 0.8})`);
        gradient.addColorStop(1, `rgba(255, 107, 157, ${alpha})`);
        trailCtx.strokeStyle = gradient;
        trailCtx.lineWidth = 4;
        trailCtx.beginPath();
        trailCtx.moveTo(start.x, start.y);
        trailCtx.lineTo(end.x, end.y);
        trailCtx.stroke();
    }

    animationFrameId = requestAnimationFrame(drawTrail);
}

function initCursorTrail() {
    resizeTrailCanvas();
    window.addEventListener('resize', resizeTrailCanvas);

    document.addEventListener('pointermove', (event) => {
        addTrailPoint(event.clientX, event.clientY);
    });

    document.addEventListener('touchmove', (event) => {
        const touch = event.touches?.[0];
        if (touch) {
            addTrailPoint(touch.clientX, touch.clientY);
        }
    }, { passive: true });

    drawTrail();
}

document.addEventListener('DOMContentLoaded', () => {
    populateFilters();
    renderInventory(carInventory);
    initFilters();
    initHeroLinks();
    initModals();
    initForms();
    initCursorTrail();

    inventoryGrid.addEventListener('click', handleInventoryClick);

    const yearHolder = document.getElementById('year');
    if (yearHolder) {
        yearHolder.textContent = new Date().getFullYear();
    }
});
