export const printPage = (sourceId: string, paperWidth: string, copies: number) => {
  const source = document.getElementById(sourceId);
  if (!source) return;

  let wrapper = document.getElementById('print-copies');
  if (!wrapper) {
    wrapper = document.createElement('div');
    wrapper.id = 'print-copies';
    document.body.appendChild(wrapper);
  }
  wrapper.innerHTML = '';

  const pageSizes: Record<string, string> = {
    a4: 'A4',
    '58mm': '58mm auto',
    '80mm': '80mm auto',
  };
  const pageSize = pageSizes[paperWidth] || '80mm auto';

  let styleEl = document.getElementById('print-page-css');
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'print-page-css';
    document.head.appendChild(styleEl);
  }
  styleEl.textContent = `@page { size: ${pageSize}; margin: 0; }`;

  const safeCopies = Math.max(1, Math.min(5, Math.round(Number(copies) || 1)));
  for (let i = 0; i < safeCopies; i++) {
    const clone = source.cloneNode(true) as HTMLElement;
    clone.removeAttribute('id');
    clone.classList.add('print-copy');
    wrapper.appendChild(clone);
  }

  window.print();
  wrapper.innerHTML = '';
};