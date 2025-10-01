const path = require('path');
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { nanoid } = require('nanoid');

const catalog = require('./lib/catalog');
const leads = require('./lib/leads');
const banners = require('./lib/banners');
const stats = require('./lib/stats');
const events = require('./lib/events');
const telegram = require('./lib/telegram');
const { upload, UPLOAD_DIR, toPublicUrl } = require('./lib/uploads');
const { initDatabase, run, get } = require('./lib/database');
const { startDailyReportJob } = require('./lib/scheduler');

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'petra-dev-secret';
const DEFAULT_ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@petra.local';
const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Petra@123';

const app = express();

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(UPLOAD_DIR));
app.use(express.static(__dirname, { extensions: ['html'] }));

async function ensureAdminUser() {
    const existing = await get('SELECT id FROM admin_users WHERE email = ?', [DEFAULT_ADMIN_EMAIL]);
    if (existing) return;
    const hash = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 10);
    await run('INSERT INTO admin_users (id, email, password_hash) VALUES (?, ?, ?)', [nanoid(12), DEFAULT_ADMIN_EMAIL, hash]);
    console.log(`Admin user created: ${DEFAULT_ADMIN_EMAIL} / ${DEFAULT_ADMIN_PASSWORD}`);
}

function authMiddleware(req, res, next) {
    const header = req.headers.authorization;
    if (!header) {
        return res.status(401).json({ error: 'Требуется авторизация' });
    }
    const [, token] = header.split(' ');
    if (!token) {
        return res.status(401).json({ error: 'Некорректный токен' });
    }
    try {
        const payload = jwt.verify(token, JWT_SECRET);
        req.user = payload;
        return next();
    } catch (err) {
        return res.status(401).json({ error: 'Токен недействителен' });
    }
}

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.get('/api/cars', async (req, res) => {
    try {
        const cars = await catalog.listCars();
        res.json(cars);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Не удалось получить автомобили' });
    }
});

app.get('/api/cars/:id', async (req, res) => {
    try {
        const car = await catalog.getCar(req.params.id);
        if (!car) return res.status(404).json({ error: 'Автомобиль не найден' });
        res.json(car);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка получения автомобиля' });
    }
});

app.get('/api/cars/:id/gallery', async (req, res) => {
    try {
        const gallery = await catalog.listGallery(req.params.id);
        res.json(gallery);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Не удалось получить галерею' });
    }
});

app.get('/api/cars/:id/similar', async (req, res) => {
    try {
        const items = await catalog.listSimilarCars(req.params.id);
        res.json(items);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Не удалось получить похожие автомобили' });
    }
});

app.get('/api/banners', async (req, res) => {
    try {
        const data = await banners.listActive();
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Не удалось получить баннеры' });
    }
});

app.post('/api/leads', async (req, res) => {
    try {
        const lead = await leads.createLead(req.body, { ip: req.ip, userAgent: req.headers['user-agent'] });
        if (lead) {
            telegram.notifyLead(lead).catch(() => null);
        }
        res.json({ success: true, leadId: lead.id, whatsappLink: lead.whatsappLink });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message || 'Не удалось сохранить заявку' });
    }
});

app.post('/api/events', async (req, res) => {
    try {
        const { type, carId, payload } = req.body;
        if (!type) return res.status(400).json({ error: 'Тип события обязателен' });
        await events.recordEvent({ type, carId: carId || null, payload, ip: req.ip, userAgent: req.headers['user-agent'] });
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Не удалось зафиксировать событие' });
    }
});

app.post('/api/admin/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Укажите email и пароль' });
    }
    try {
        const user = await get('SELECT * FROM admin_users WHERE email = ?', [email]);
        if (!user) return res.status(401).json({ error: 'Неверные данные' });
        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) return res.status(401).json({ error: 'Неверные данные' });
        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '12h' });
        res.json({ token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка авторизации' });
    }
});

app.get('/api/admin/overview', authMiddleware, async (req, res) => {
    try {
        const overview = await stats.getOverview();
        res.json(overview);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Не удалось получить статистику' });
    }
});

app.get('/api/admin/leads', authMiddleware, async (req, res) => {
    try {
        const items = await leads.listLeads();
        res.json(items);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Не удалось получить заявки' });
    }
});

app.patch('/api/admin/leads/:id/status', authMiddleware, async (req, res) => {
    try {
        await leads.updateLeadStatus(req.params.id, req.body.status);
        const lead = await leads.getLead(req.params.id);
        res.json(lead);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Не удалось обновить статус' });
    }
});

app.get('/api/admin/events', authMiddleware, async (req, res) => {
    try {
        const items = await events.listRecent(200);
        res.json(items);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Не удалось получить события' });
    }
});

app.get('/api/admin/cars', authMiddleware, async (req, res) => {
    try {
        const cars = await catalog.listCars();
        res.json(cars);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Не удалось получить автомобили' });
    }
});

app.post('/api/admin/cars', authMiddleware, async (req, res) => {
    try {
        const car = await catalog.createCar(req.body);
        res.status(201).json(car);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Не удалось добавить автомобиль' });
    }
});

app.put('/api/admin/cars/:id', authMiddleware, async (req, res) => {
    try {
        const car = await catalog.updateCar(req.params.id, req.body);
        if (!car) return res.status(404).json({ error: 'Автомобиль не найден' });
        res.json(car);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Не удалось обновить автомобиль' });
    }
});

app.delete('/api/admin/cars/:id', authMiddleware, async (req, res) => {
    try {
        await catalog.deleteCar(req.params.id);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Не удалось удалить автомобиль' });
    }
});

app.put('/api/admin/cars/:id/gallery', authMiddleware, async (req, res) => {
    try {
        const gallery = await catalog.saveGallery(req.params.id, req.body.gallery || []);
        res.json(gallery);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Не удалось обновить галерею' });
    }
});

app.get('/api/admin/banners', authMiddleware, async (req, res) => {
    try {
        const data = await banners.listAll();
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Не удалось получить баннеры' });
    }
});

app.post('/api/admin/banners', authMiddleware, async (req, res) => {
    try {
        const banner = await banners.createBanner(req.body);
        res.status(201).json(banner);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Не удалось создать баннер' });
    }
});

app.put('/api/admin/banners/:id', authMiddleware, async (req, res) => {
    try {
        const banner = await banners.updateBanner(req.params.id, req.body);
        res.json(banner);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Не удалось обновить баннер' });
    }
});

app.delete('/api/admin/banners/:id', authMiddleware, async (req, res) => {
    try {
        await banners.deleteBanner(req.params.id);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Не удалось удалить баннер' });
    }
});

app.post('/api/admin/upload', authMiddleware, upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Файл не загружен' });
    }
    res.json({
        fileName: req.file.filename,
        url: toPublicUrl(req.file.filename),
        size: req.file.size,
        mime: req.file.mimetype,
    });
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

initDatabase()
    .then(ensureAdminUser)
    .then(() => {
        startDailyReportJob();
        app.listen(PORT, () => {
            console.log(`Petra server listening on http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error('Failed to initialise database', err);
        process.exit(1);
    });
