import { formatNumber, formatDate, formatDateTime, escapeHtml } from './format';

const THERMAL_STYLES = {
    '58': {
        paper: '58mm',
        content: '48mm',
        fontSize: '11px',
        padding: '2mm 5mm',
    },
    '80': {
        paper: '80mm',
        content: '72mm',
        fontSize: '12.5px',
        padding: '3mm 4mm',
    },
};

export function buildReceiptHtml(sale, settings = {}, format = '80') {
    const symbol = settings.currency_symbol || 'ر.س';
    const companyName = settings.company_name || 'YumInventory POS';
    const address = settings.company_address || '';
    const phone = settings.company_phone || '';
    const email = settings.company_email || '';
    const footer = settings.receipt_footer || '';
    const vatRate = Number(sale.vat_rate) || 0;

    const items = (sale.items || []).map((item, index) => ({
        n: index + 1,
        name: String(item.product_name || item.name || 'Item'),
        qty: Number(item.quantity) || 0,
        price: Number(item.price) || 0,
        total: Number(item.total) || 0,
    }));

    const isThermal = format === '58' || format === '80';

    let style = '';
    let bodyClass = '';
    let headerStyles = '';
    let table = '';

    if (isThermal) {
        const cfg = THERMAL_STYLES[format];
        style = `
            @page { size: ${cfg.paper} auto; margin: 0; }
            * { box-sizing: border-box; }
            body {
                width: ${cfg.content};
                margin: 0 auto;
                font-family: 'Courier New', Courier, monospace;
                font-size: ${cfg.fontSize};
                color: #000;
                background: #fff;
                line-height: 1.35;
            }
            h1 { font-size: 1.25em; margin: 0 0 2px 0; text-align: center; }
            .center { text-align: center; }
            table { width: 100%; border-collapse: collapse; margin: 4px 0; }
            td, th { padding: 1px 0; vertical-align: top; }
            .r { text-align: right; white-space: nowrap; }
            .l { text-align: left; }
            .c { text-align: center; }
            .dash { border: 0; border-top: 1px dashed #000; margin: 5px 0; }
            .totals td { padding: 2px 0; }
            .grand td { font-weight: bold; font-size: 1.15em; padding-top: 4px; }
            .info-line { display: flex; justify-content: space-between; }
            .footer { text-align: center; margin-top: 8px; padding-top: 4px; border-top: 1px dashed #000; }
            .items-head td { border-top: 1px dashed #000; border-bottom: 1px dashed #000; }
        `;
    } else {
        style = `
            @page { size: A4; margin: 18mm; }
            * { box-sizing: border-box; }
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                color: #111827;
                background: #f3f4f6;
                margin: 0;
            }
            .sheet {
                max-width: 180mm;
                margin: 0 auto;
                background: #fff;
                border: 1px solid #d1d5db;
                padding: 12mm;
            }
            h1 { font-size: 24px; margin: 0 0 4px 0; text-align: center; }
            .center { text-align: center; }
            .contact { color: #4b5563; font-size: 13px; text-align: center; line-height: 1.5; }
            table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 14px; }
            th { text-align: left; border-top: 2px solid #111827; border-bottom: 1px solid #d1d5db; padding: 6px 4px; }
            td { padding: 6px 4px; border-bottom: 1px solid #e5e7eb; vertical-align: top; }
            th.r, td.r { text-align: right; }
            th.c, td.c { text-align: center; }
            .dash { border: 0; border-top: 1px solid #d1d5db; margin: 10px 0; }
            .totals { margin-left: auto; width: 60mm; }
            .totals tr:last-child td { border-bottom: none; }
            .totals td { border-bottom: 1px solid #e5e7eb; }
            .grand td { font-weight: 700; font-size: 16px; border-top: 2px solid #111827; }
            .meta { font-size: 13px; color: #374151; }
            .meta td { border-bottom: 1px solid #e5e7eb; padding: 3px 0; }
            .footer { text-align: center; margin-top: 14px; color: #4b5563; font-size: 13px; }
        `;
    }

    const contactLines = [address, phone, email]
        .filter(Boolean)
        .map(escapeHtml)
        .join(' &nbsp;&bull;&nbsp; ');

    if (isThermal) {
        table = `
            <table class="items-head">
                <tr>
                    <td class="l">Qty</td>
                    <td class="l">Item</td>
                    <td class="r">Price</td>
                    <td class="r">Total</td>
                </tr>
            </table>
            <table>
                ${items.map((i) => `
                    <tr>
                        <td class="l">${i.qty}</td>
                        <td class="l">${escapeHtml(i.name)}</td>
                        <td class="r">${formatNumber(i.price)}</td>
                        <td class="r">${formatNumber(i.total)}</td>
                    </tr>
                `).join('')}
            </table>
            <table class="totals">
                <tr><td class="l">Subtotal</td><td class="r">${formatNumber(sale.subtotal)}</td></tr>
                <tr><td class="l">VAT (${vatRate}%)</td><td class="r">${formatNumber(sale.vat_amount)}</td></tr>
                <tr class="grand"><td>Total</td><td class="r">${formatNumber(sale.total)}</td></tr>
            </table>
        `;
    } else {
        table = `
            <table>
                <thead>
                    <tr>
                        <th class="c" style="width:8%">#</th>
                        <th>Item</th>
                        <th class="c" style="width:10%">Qty</th>
                        <th class="r" style="width:15%">Price</th>
                        <th class="r" style="width:15%">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${items.map((i) => `
                        <tr>
                            <td class="c">${i.n}</td>
                            <td>${escapeHtml(i.name)}</td>
                            <td class="c">${i.qty}</td>
                            <td class="r">${formatNumber(i.price)}</td>
                            <td class="r">${formatNumber(i.total)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <table class="totals">
                <tr><td>Subtotal</td><td class="r">${formatNumber(sale.subtotal)}</td></tr>
                <tr><td>VAT (${vatRate}%)</td><td class="r">${formatNumber(sale.vat_amount)}</td></tr>
                <tr class="grand"><td>Total</td><td class="r">${formatNumber(sale.total)} ${escapeHtml(symbol)}</td></tr>
            </table>
        `;
    }

    const dateStr =
        sale.sale_date ||
        (sale.created_at ? String(sale.created_at).slice(0, 10) : '');
    const timeStr = sale.sale_time || '';
    const dateLine = escapeHtml(
        dateStr && timeStr ? `${formatDate(dateStr)}  ${timeStr}` : ''
    );

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Receipt ${escapeHtml(sale.receipt_number || '')}</title>
<style>${style}</style>
</head>
<body>
${isThermal ? '' : '<div class="sheet">'}
    <h1>${escapeHtml(companyName)}</h1>
    ${contactLines ? `<div class="center contact">${contactLines}</div>` : ''}
    <hr class="dash">
    <table class="meta">
        <tr><td>Date</td><td class="r">${dateLine || escapeHtml(formatDateTime(sale.created_at))}</td></tr>
        <tr><td>Receipt No</td><td class="r">${escapeHtml(sale.receipt_number || '')}</td></tr>
        <tr><td>Payment</td><td class="r">${escapeHtml(sale.payment_method || 'cash')}</td></tr>
    </table>
    ${table}
    <div class="footer">
        ${footer ? `<div>${escapeHtml(footer)}</div>` : ''}
        <div style="font-size:0.85em; margin-top:2px;">Powered by YumInventory POS</div>
    </div>
${isThermal ? '' : '</div>'}
</body>
</html>`;
}

export function printSale(sale, settings = {}, format = '80') {
    const html = buildReceiptHtml(sale, settings, format);
    const win = window.open('', '_blank', 'width=500,height=760');

    if (win) {
        win.document.open();
        win.document.write(html);
        win.document.close();
        win.focus();
        setTimeout(() => {
            try {
                win.print();
            } catch (e) {
                /* ignore */
            }
        }, 300);
    } else {
        const iframe = document.createElement('iframe');
        iframe.style.position = 'fixed';
        iframe.style.right = '0';
        iframe.style.bottom = '0';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = '0';
        document.body.appendChild(iframe);
        const doc = iframe.contentDocument;
        doc.open();
        doc.write(html);
        doc.close();
        setTimeout(() => {
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
        }, 300);
        setTimeout(() => document.body.removeChild(iframe), 60000);
    }
}