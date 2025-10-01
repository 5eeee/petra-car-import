const cron = require('node-cron');
const stats = require('./stats');
const telegram = require('./telegram');

function startOfDay(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function formatDate(date) {
    return date.toISOString().split('T')[0];
}

function startDailyReportJob() {
    const cronExpr = process.env.TELEGRAM_DAILY_CRON || '0 9 * * *';
    const timezone = process.env.TELEGRAM_TIMEZONE || 'Europe/Moscow';
    cron.schedule(
        cronExpr,
        async () => {
            try {
                const now = new Date();
                const yesterday = new Date(now);
                yesterday.setDate(now.getDate() - 1);
                const start = startOfDay(yesterday);
                const end = startOfDay(now);
                const since = start.toISOString();
                const until = end.toISOString();
                const metrics = await stats.collectMetrics({ since, until });
                const payload = {
                    carViews: metrics.carViews,
                    leads: metrics.leads,
                    conversion: metrics.carViews ? metrics.leads / metrics.carViews : 0,
                    topCars: metrics.topCars,
                };
                const dateKey = formatDate(yesterday);
                await stats.upsertDailyStat(dateKey, payload);
                if (telegram.isEnabled()) {
                    await telegram.notifyDailyReport({
                        date: dateKey,
                        totalViews: metrics.carViews,
                        totalLeads: metrics.leads,
                        payload,
                    });
                }
            } catch (err) {
                console.error('Daily report job failed', err);
            }
        },
        { timezone },
    );
}

module.exports = {
    startDailyReportJob,
};
