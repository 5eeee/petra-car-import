const axios = require('axios');

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

function isEnabled() {
    return Boolean(BOT_TOKEN && CHAT_ID);
}

async function sendMessage(text, options = {}) {
    if (!isEnabled()) return false;
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    try {
        await axios.post(url, {
            chat_id: CHAT_ID,
            text,
            parse_mode: options.parseMode || 'HTML',
            disable_web_page_preview: true,
        });
        return true;
    } catch (err) {
        console.warn('Telegram sendMessage failed', err.message);
        return false;
    }
}

function escape(value) {
    return value ? value.toString().replace(/&/g, '&amp;').replace(/</g, '&lt;') : '';
}

async function notifyLead(lead) {
    if (!isEnabled()) return;
    const lines = [
        '<b>Новая заявка на сайте Petra</b>',
        `Имя: ${escape(lead.name || '—')}`,
        `Телефон: ${escape(lead.phone)}`,
        `Автомобиль: ${escape(lead.carName || 'Не выбран')}`,
        lead.note ? `Комментарий: ${escape(lead.note)}` : null,
        `Источник: ${escape(lead.source || 'site')}`,
        lead.whatsappLink ? `<a href="${lead.whatsappLink}">Ссылка в WhatsApp</a>` : null,
    ].filter(Boolean);
    await sendMessage(lines.join('\n'));
}

async function notifyDailyReport(report) {
    if (!isEnabled()) return;
    const lines = [
        '<b>Ежедневный отчёт Petra</b>',
        `Дата: ${escape(report.date)}`,
        `Просмотры карточек: ${report.totalViews || 0}`,
        `Заявок: ${report.totalLeads || 0}`,
    ];
    if (report.payload) {
        if (report.payload.conversion) {
            lines.push(`Конверсия: ${(report.payload.conversion * 100).toFixed(1)}%`);
        }
        if (report.payload.topCars?.length) {
            lines.push('Топ интереса:');
            report.payload.topCars.slice(0, 3).forEach((car, index) => {
                lines.push(`${index + 1}. ${escape(car.name)} — ${car.views} просмотров`);
            });
        }
    }
    await sendMessage(lines.join('\n'));
}

module.exports = {
    isEnabled,
    sendMessage,
    notifyLead,
    notifyDailyReport,
};
