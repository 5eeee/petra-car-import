const { get, all, run } = require('./database');
const catalog = require('./catalog');
const leads = require('./leads');

async function countEvents() {
    const row = await get('SELECT COUNT(*) AS total FROM events');
    return Number(row?.total || 0);
}

async function getOverview() {
    const [leadTotal, eventTotal, cars] = await Promise.all([
        leads.countLeads(),
        countEvents(),
        catalog.listCars(),
    ]);
    const latestLeads = await leads.latestLeads(5);
    return {
        leads: leadTotal,
        events: eventTotal,
        cars: cars.length,
        latestLeads,
    };
}

async function collectMetrics({ since = null, until = null } = {}) {
    const params = [];
    let where = '';
    if (since) {
        where += where ? ' AND' : ' WHERE';
        where += ' created_at >= ?';
        params.push(since);
    }
    if (until) {
        where += where ? ' AND' : ' WHERE';
        where += ' created_at < ?';
        params.push(until);
    }
    const eventRows = await all(`SELECT type, car_id FROM events${where}`, params);
    const leadRows = await all(`SELECT id FROM leads${where}`, params);
    const carViewMap = new Map();
    for (const row of eventRows) {
        if (row.type === 'car_viewed' && row.car_id) {
            carViewMap.set(row.car_id, (carViewMap.get(row.car_id) || 0) + 1);
        }
    }
    const carViews = Array.from(carViewMap.values()).reduce((sum, value) => sum + value, 0);
    return {
        events: eventRows.length,
        leads: leadRows.length,
        carViews,
        topCars: await topViewedCars({ since, until, limit: 5 }),
    };
}

async function topViewedCars({ since = null, until = null, limit = 5 } = {}) {
    const params = [];
    let where = "WHERE events.type = 'car_viewed'";
    if (since) {
        where += ' AND events.created_at >= ?';
        params.push(since);
    }
    if (until) {
        where += ' AND events.created_at < ?';
        params.push(until);
    }
    const rows = await all(
        `SELECT events.car_id, cars.brand || ' ' || cars.model AS name, COUNT(*) AS views
         FROM events
         LEFT JOIN cars ON cars.id = events.car_id
         ${where}
         GROUP BY events.car_id
         ORDER BY views DESC
         LIMIT ?`,
        [...params, limit],
    );
    return rows
        .filter((row) => row.car_id)
        .map((row) => ({ id: row.car_id, name: row.name || 'Автомобиль Petra', views: Number(row.views || 0) }));
}

async function upsertDailyStat(date, metrics) {
    const payload = JSON.stringify(metrics);
    await run(
        `INSERT INTO daily_stats (id, date, total_views, total_leads, payload)
         VALUES (?, ?, ?, ?, ?)
         ON CONFLICT(date) DO UPDATE SET total_views = excluded.total_views, total_leads = excluded.total_leads, payload = excluded.payload`,
        [
            `${date}`,
            date,
            metrics.carViews || 0,
            metrics.leads || 0,
            payload,
        ],
    );
}

async function getDailyStat(date) {
    const row = await get('SELECT * FROM daily_stats WHERE date = ?', [date]);
    return row
        ? {
              date: row.date,
              totalViews: Number(row.total_views || 0),
              totalLeads: Number(row.total_leads || 0),
              payload: row.payload ? JSON.parse(row.payload) : {},
          }
        : null;
}

module.exports = {
    getOverview,
    collectMetrics,
    upsertDailyStat,
    getDailyStat,
    topViewedCars,
};
