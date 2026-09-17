export function formatMoney(value, symbol = 'ر.س') {
    const num = Number(value) || 0;
    return `${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${symbol}`;
}

export function formatNumber(value) {
    const num = Number(value) || 0;
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function defaultReceiptDate() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

export function defaultReceiptTime() {
    const d = new Date(Date.now() - 60 * 60 * 1000);
    const h = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${h}:${min}`;
}

export function todayString() {
    return defaultReceiptDate();
}

export function formatDate(dateStr) {
    if (!dateStr) return '';
    const yyyy = String(dateStr).slice(0, 4);
    const mm = String(dateStr).slice(5, 7);
    const dd = String(dateStr).slice(8, 10);
    if (yyyy && mm && dd) return `${dd}/${mm}/${yyyy}`;
    return dateStr;
}

export function formatDateTime(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
}

export function randomReceiptNumber() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let out = '';
    for (let i = 0; i < 8; i++) {
        out += chars[Math.floor(Math.random() * chars.length)];
    }
    return `RCP-${out}`;
}

export function randomLocalId() {
    return `local_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export function escapeHtml(str) {
    return String(str ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}