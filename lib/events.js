const { run, all } = require('./database');
const { nanoid } = require('nanoid');

async function recordEvent({ type, carId = null, payload = null, ip = null, userAgent = null }) {
    if (!type) return null;
    await run(
        'INSERT INTO events (id, type, car_id, payload, ip, user_agent) VALUES (?, ?, ?, ?, ?, ?)',
        [nanoid(14), type, carId, payload ? JSON.stringify(payload) : null, ip, userAgent],
    );
    return true;
}

async function listRecent(limit = 200) {
    const rows = await all('SELECT * FROM events ORDER BY created_at DESC LIMIT ?', [limit]);
    return rows.map((row) => ({
        id: row.id,
        type: row.type,
        carId: row.car_id,
        payload: row.payload ? JSON.parse(row.payload) : null,
        ip: row.ip,
        userAgent: row.user_agent,
        createdAt: row.created_at,
    }));
}

async function countByType(type) {
    const rows = await all(
        'SELECT COUNT(*) AS total FROM events WHERE type = ?',
        [type],
    );
    return Number(rows?.[0]?.total || 0);
}

module.exports = {
    recordEvent,
    listRecent,
    countByType,
};
