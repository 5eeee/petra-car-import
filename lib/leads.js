const { run, get, all } = require('./database');
const { recordEvent } = require('./events');
const { nanoid } = require('nanoid');

const DEFAULT_WHATSAPP = process.env.WHATSAPP_NUMBER || '+79265051888';

function buildWhatsAppLink({ phone, carName, name }) {
    const digits = DEFAULT_WHATSAPP.replace(/[^+0-9]/g, '');
    const message = encodeURIComponent(
        `Здравствуйте! Вы оставили заявку на ${carName} на сайте Petra.` +
            (name ? ` ${name},` : '') +
            ' мы на связи и готовы обсудить детали.'
    );
    return `https://api.whatsapp.com/send?phone=${digits}&text=${message}`;
}

async function createLead(payload, meta = {}) {
    if (!payload.phone) {
        throw new Error('Телефон обязателен');
    }
    const id = nanoid(12);
    let carName = 'автомобиль Petra';
    if (payload.carId) {
        const car = await get('SELECT brand, model FROM cars WHERE id = ?', [payload.carId]);
        if (car) {
            carName = `${car.brand} ${car.model}`;
        }
    }
    const whatsappLink = buildWhatsAppLink({ phone: payload.phone, carName, name: payload.name });
    await run(
        `INSERT INTO leads (id, name, phone, car_id, note, source, whatsapp_link)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [id, payload.name || null, payload.phone, payload.carId || null, payload.note || null, payload.source || 'site', whatsappLink],
    );
    await recordEvent({ type: 'lead_submitted', carId: payload.carId || null, payload: { leadId: id, source: payload.source || 'site' }, ip: meta.ip, userAgent: meta.userAgent });
    return getLead(id);
}

async function listLeads() {
    const rows = await all(`
        SELECT leads.*, cars.brand || ' ' || cars.model AS car_name
        FROM leads
        LEFT JOIN cars ON cars.id = leads.car_id
        ORDER BY leads.created_at DESC
    `);
    return rows.map((row) => ({
        id: row.id,
        name: row.name,
        phone: row.phone,
        carId: row.car_id,
        carName: row.car_name,
        note: row.note,
        source: row.source,
        status: row.status || 'new',
        whatsappLink: row.whatsapp_link,
        createdAt: row.created_at,
        statusChangedAt: row.status_changed_at,
    }));
}

async function latestLeads(limit = 5) {
    const rows = await all(
        `SELECT id, name, phone, car_id, created_at FROM leads ORDER BY created_at DESC LIMIT ?`,
        [limit],
    );
    return rows;
}

async function getLead(id) {
    const row = await get(
        `SELECT leads.*, cars.brand || ' ' || cars.model AS car_name
         FROM leads
         LEFT JOIN cars ON cars.id = leads.car_id
         WHERE leads.id = ?`,
        [id],
    );
    if (!row) return null;
    return {
        id: row.id,
        name: row.name,
        phone: row.phone,
        carId: row.car_id,
        carName: row.car_name,
        note: row.note,
        source: row.source,
        status: row.status || 'new',
        whatsappLink: row.whatsapp_link,
        createdAt: row.created_at,
        statusChangedAt: row.status_changed_at,
    };
}

async function updateLeadStatus(id, status) {
    const valid = ['new', 'in_progress', 'closed', 'archived'];
    const nextStatus = valid.includes(status) ? status : 'in_progress';
    await run('UPDATE leads SET status = ?, status_changed_at = CURRENT_TIMESTAMP WHERE id = ?', [nextStatus, id]);
    await recordEvent({ type: 'lead_status_updated', payload: { leadId: id, status: nextStatus } });
    return true;
}

async function countLeads() {
    const row = await get('SELECT COUNT(*) AS total FROM leads');
    return Number(row?.total || 0);
}

module.exports = {
    createLead,
    listLeads,
    latestLeads,
    updateLeadStatus,
    countLeads,
    getLead,
};
