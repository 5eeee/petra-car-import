const { run, get, all } = require('./database');
const { nanoid } = require('nanoid');

function mapCarRow(row) {
    if (!row) return null;
    return {
        id: row.id,
        brand: row.brand,
        model: row.model,
        fuel: row.fuel,
        drivetrain: row.drivetrain,
        transmission: row.transmission,
        year: Number(row.year),
        price: Number(row.price),
        power: row.power,
        image: row.image,
        description: row.description,
        features: row.features ? JSON.parse(row.features) : [],
        specs: row.specs ? JSON.parse(row.specs) : [],
        modelUrl: row.model_url,
        heroRank: Number(row.hero_rank || 0),
        specSheetUrl: row.spec_sheet_url,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

async function listCars() {
    const rows = await all('SELECT * FROM cars ORDER BY hero_rank DESC, price DESC');
    return rows.map(mapCarRow);
}

async function getCar(id) {
    const row = await get('SELECT * FROM cars WHERE id = ?', [id]);
    if (!row) return null;
    const car = mapCarRow(row);
    car.gallery = await listGallery(id);
    return car;
}

async function listGallery(carId) {
    const rows = await all(
        'SELECT id, image_url AS image, sort_order FROM car_gallery WHERE car_id = ? ORDER BY sort_order ASC, created_at ASC',
        [carId],
    );
    return rows.map((row) => ({ id: row.id, image: row.image, sortOrder: Number(row.sort_order || 0) }));
}

async function saveGallery(carId, gallery = []) {
    await run('DELETE FROM car_gallery WHERE car_id = ?', [carId]);
    const insert = 'INSERT INTO car_gallery (id, car_id, image_url, sort_order) VALUES (?, ?, ?, ?)';
    for (const [index, item] of gallery.entries()) {
        const imageUrl = typeof item === 'string' ? item : item.image || item.image_url;
        if (!imageUrl) continue;
        await run(insert, [nanoid(12), carId, imageUrl, item.sortOrder ?? index]);
    }
    return listGallery(carId);
}

async function createCar(payload) {
    const id = payload.id || nanoid(10);
    const insert = `
        INSERT INTO cars (id, brand, model, fuel, drivetrain, transmission, year, price, power, image, description, features, specs, model_url, hero_rank, spec_sheet_url)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    await run(insert, [
        id,
        payload.brand,
        payload.model,
        payload.fuel,
        payload.drivetrain,
        payload.transmission || '',
        Number(payload.year) || new Date().getFullYear(),
        Number(payload.price) || 0,
        payload.power || '',
        payload.image || '',
        payload.description || '',
        JSON.stringify(payload.features || []),
        JSON.stringify(payload.specs || []),
        payload.modelUrl || null,
        Number(payload.heroRank || 0),
        payload.specSheetUrl || null,
    ]);
    if (Array.isArray(payload.gallery)) {
        await saveGallery(id, payload.gallery);
    }
    return getCar(id);
}

async function updateCar(id, payload) {
    const existing = await getCar(id);
    if (!existing) return null;
    const update = `
        UPDATE cars
        SET brand = ?, model = ?, fuel = ?, drivetrain = ?, transmission = ?, year = ?, price = ?, power = ?, image = ?, description = ?, features = ?, specs = ?, model_url = ?, hero_rank = ?, spec_sheet_url = ?
        WHERE id = ?
    `;
    await run(update, [
        payload.brand,
        payload.model,
        payload.fuel,
        payload.drivetrain,
        payload.transmission || '',
        Number(payload.year) || existing.year,
        Number(payload.price) || existing.price,
        payload.power || '',
        payload.image || '',
        payload.description || '',
        JSON.stringify(payload.features || []),
        JSON.stringify(payload.specs || []),
        payload.modelUrl || null,
        Number(payload.heroRank || 0),
        payload.specSheetUrl || null,
        id,
    ]);
    if (Array.isArray(payload.gallery)) {
        await saveGallery(id, payload.gallery);
    }
    return getCar(id);
}

async function deleteCar(id) {
    await run('DELETE FROM cars WHERE id = ?', [id]);
    return true;
}

async function listSimilarCars(id, limit = 6) {
    const car = await getCar(id);
    if (!car) return [];
    const rows = await all('SELECT * FROM cars WHERE id != ? ORDER BY hero_rank DESC, price DESC', [id]);
    const siblings = rows
        .map(mapCarRow)
        .map((item) => ({
            item,
            score:
                (item.brand === car.brand ? 3 : 0) +
                (item.fuel === car.fuel ? 2 : 0) +
                (item.drivetrain === car.drivetrain ? 1 : 0) -
                Math.abs((item.price || 0) - (car.price || 0)) / Math.max(car.price || 1, 1),
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(({ item }) => item);
    return siblings;
}

module.exports = {
    listCars,
    getCar,
    createCar,
    updateCar,
    deleteCar,
    listGallery,
    saveGallery,
    listSimilarCars,
    mapCarRow,
};
