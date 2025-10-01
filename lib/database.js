const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const { nanoid } = require('nanoid');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'petra.db');
const SEED_DIR = path.join(DATA_DIR, 'seed');
const SEED_CARS = path.join(SEED_DIR, 'cars.json');

if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

const db = new sqlite3.Database(DB_FILE);

db.run('PRAGMA foreign_keys = ON');

function run(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function runCallback(err) {
            if (err) reject(err);
            else resolve(this);
        });
    });
}

function get(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
}

function all(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

async function ensureColumn(table, column, definition) {
    const info = await all(`PRAGMA table_info(${table})`);
    if (info.some((col) => col.name === column)) {
        return;
    }
    await run(`ALTER TABLE ${table} ADD COLUMN ${definition}`);
}

async function seedCars() {
    const countRow = await get('SELECT COUNT(*) AS total FROM cars');
    if (countRow?.total > 0) return;
    if (!fs.existsSync(SEED_CARS)) return;
    const raw = fs.readFileSync(SEED_CARS, 'utf8');
    const cars = JSON.parse(raw);
    const insertSql = `
        INSERT INTO cars (
            id, brand, model, fuel, drivetrain, transmission, year, price, power,
            image, description, features, specs, model_url, hero_rank, spec_sheet_url
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    for (const car of cars) {
        const carId = car.id || nanoid(10);
        await run(insertSql, [
            carId,
            car.brand,
            car.model,
            car.fuel,
            car.drivetrain,
            car.transmission || '',
            car.year || new Date().getFullYear(),
            car.price || 0,
            car.power || '',
            car.image || '',
            car.description || '',
            JSON.stringify(car.features || []),
            JSON.stringify(car.specs || []),
            car.modelUrl || null,
            car.heroRank || 0,
            car.specSheetUrl || null,
        ]);
        if (Array.isArray(car.gallery)) {
            for (const [index, imageUrl] of car.gallery.entries()) {
                await run('INSERT INTO car_gallery (id, car_id, image_url, sort_order) VALUES (?, ?, ?, ?)', [
                    nanoid(12),
                    carId,
                    imageUrl,
                    index,
                ]);
            }
        }
    }
}

async function initDatabase() {
    await run(`
        CREATE TABLE IF NOT EXISTS cars (
            id TEXT PRIMARY KEY,
            brand TEXT NOT NULL,
            model TEXT NOT NULL,
            fuel TEXT NOT NULL,
            drivetrain TEXT NOT NULL,
            transmission TEXT,
            year INTEGER NOT NULL,
            price INTEGER NOT NULL,
            power TEXT,
            image TEXT,
            description TEXT,
            features TEXT,
            specs TEXT,
            model_url TEXT,
            hero_rank INTEGER DEFAULT 0,
            spec_sheet_url TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    `);

    await run(`
        CREATE TRIGGER IF NOT EXISTS trg_cars_updated
        AFTER UPDATE ON cars
        FOR EACH ROW
        BEGIN
            UPDATE cars SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
        END;
    `);

    await run(`
        CREATE TABLE IF NOT EXISTS car_gallery (
            id TEXT PRIMARY KEY,
            car_id TEXT NOT NULL,
            image_url TEXT NOT NULL,
            sort_order INTEGER DEFAULT 0,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE
        )
    `);

    await run(`
        CREATE TABLE IF NOT EXISTS promo_banners (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT,
            image_url TEXT,
            cta TEXT,
            url TEXT,
            date_label TEXT,
            is_active INTEGER DEFAULT 1,
            sort_order INTEGER DEFAULT 0,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    `);

    await run(`
        CREATE TABLE IF NOT EXISTS leads (
            id TEXT PRIMARY KEY,
            name TEXT,
            phone TEXT,
            car_id TEXT,
            note TEXT,
            source TEXT,
            whatsapp_link TEXT,
            status TEXT DEFAULT 'new',
            status_changed_at TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (car_id) REFERENCES cars(id)
        )
    `);

    await run(`
        CREATE TABLE IF NOT EXISTS events (
            id TEXT PRIMARY KEY,
            type TEXT NOT NULL,
            car_id TEXT,
            payload TEXT,
            ip TEXT,
            user_agent TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (car_id) REFERENCES cars(id)
        )
    `);

    await run(`
        CREATE TABLE IF NOT EXISTS admin_users (
            id TEXT PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    `);

    await run(`
        CREATE TABLE IF NOT EXISTS daily_stats (
            id TEXT PRIMARY KEY,
            date TEXT UNIQUE NOT NULL,
            total_views INTEGER DEFAULT 0,
            total_leads INTEGER DEFAULT 0,
            payload TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    `);

    await ensureColumn('leads', 'status', "status TEXT DEFAULT 'new'");
    await ensureColumn('leads', 'status_changed_at', 'status_changed_at TEXT');
    await ensureColumn('cars', 'hero_rank', 'hero_rank INTEGER DEFAULT 0');
    await ensureColumn('cars', 'spec_sheet_url', 'spec_sheet_url TEXT');

    await seedCars();
}

module.exports = {
    db,
    run,
    get,
    all,
    initDatabase,
    DATA_DIR,
};
