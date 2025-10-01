const { run, all, get } = require('./database');
const { nanoid } = require('nanoid');

function mapBanner(row) {
    return {
        id: row.id,
        title: row.title,
        description: row.description,
        image: row.image_url,
        cta: row.cta,
        url: row.url,
        dateLabel: row.date_label,
        isActive: Boolean(row.is_active),
        sortOrder: Number(row.sort_order || 0),
        createdAt: row.created_at,
    };
}

async function listActive() {
    const rows = await all(
        `SELECT * FROM promo_banners WHERE is_active = 1 ORDER BY sort_order ASC, created_at DESC`,
    );
    return rows.map(mapBanner);
}

async function listAll() {
    const rows = await all('SELECT * FROM promo_banners ORDER BY created_at DESC');
    return rows.map(mapBanner);
}

async function createBanner(payload) {
    const id = payload.id || nanoid(12);
    await run(
        `INSERT INTO promo_banners (id, title, description, image_url, cta, url, date_label, is_active, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            id,
            payload.title,
            payload.description || '',
            payload.image || null,
            payload.cta || null,
            payload.url || null,
            payload.dateLabel || null,
            payload.isActive ? 1 : 0,
            Number(payload.sortOrder || 0),
        ],
    );
    return getBanner(id);
}

async function updateBanner(id, payload) {
    await run(
        `UPDATE promo_banners
         SET title = ?, description = ?, image_url = ?, cta = ?, url = ?, date_label = ?, is_active = ?, sort_order = ?
         WHERE id = ?`,
        [
            payload.title,
            payload.description || '',
            payload.image || null,
            payload.cta || null,
            payload.url || null,
            payload.dateLabel || null,
            payload.isActive ? 1 : 0,
            Number(payload.sortOrder || 0),
            id,
        ],
    );
    return getBanner(id);
}

async function deleteBanner(id) {
    await run('DELETE FROM promo_banners WHERE id = ?', [id]);
    return true;
}

async function getBanner(id) {
    const row = await get('SELECT * FROM promo_banners WHERE id = ?', [id]);
    return row ? mapBanner(row) : null;
}

module.exports = {
    listActive,
    listAll,
    createBanner,
    updateBanner,
    deleteBanner,
    getBanner,
};
