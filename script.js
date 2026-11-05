(() => {
  'use strict';
  const $ = s => document.querySelector(s);
  const products = [
    { name: 'Apple', price: 1.50 }, { name: 'Banana', price: 1.20 }, { name: 'Orange', price: 1.80 },
    { name: 'Milk', price: 2.50 }, { name: 'Bread', price: 1.00 }, { name: 'Water', price: 0.80 }
  ];
  const money = n => '$' + n.toFixed(2);
  const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  const sel = $('#product'), qty = $('#qty');
  sel.innerHTML = products.map(p => `<option value="${p.name}">${p.name}</option>`).join('');

  let cart = [];
  try { cart = (JSON.parse(localStorage.getItem('billing-cart')) || []).filter(i => products.some(p => p.name === i.name)); } catch (e) {}
  const receiptNo = String(Date.now()).slice(-6);
  $('#rno').textContent = 'Receipt #' + receiptNo;

  const toast = $('#toast'); let tt;
  const say = m => { toast.textContent = m; toast.classList.add('show'); clearTimeout(tt); tt = setTimeout(() => toast.classList.remove('show'), 2200); };

  const clampQty = () => { let v = parseInt(qty.value, 10); if (isNaN(v) || v < 1) v = 1; if (v > 99) v = 99; qty.value = v; return v; };
  $('#up').onclick = () => { qty.value = clampQty() + 1; clampQty(); };
  $('#down').onclick = () => { qty.value = clampQty() - 1; clampQty(); };
  qty.addEventListener('change', clampQty);

  const price = name => products.find(p => p.name === name).price;

  const render = () => {
    const total = cart.reduce((n, i) => n + i.qty * price(i.name), 0);
    $('#rows').innerHTML = cart.length ? cart.map(i => `
      <tr><td>${esc(i.name)}</td>
      <td><span class="mini"><button data-a="dec" data-n="${esc(i.name)}" aria-label="Fewer">&minus;</button>${i.qty}<button data-a="inc" data-n="${esc(i.name)}" aria-label="More">+</button></span></td>
      <td>${money(price(i.name))}</td><td>${money(i.qty * price(i.name))}</td>
      <td class="x"><button class="rm" data-a="rm" data-n="${esc(i.name)}" aria-label="Remove ${esc(i.name)}">&times;</button></td></tr>`).join('')
      : '<tr class="empty"><td colspan="5">No items yet. Choose a product and tap Add to Cart.</td></tr>';
    $('#rrows').innerHTML = cart.length ? cart.map(i => `
      <tr><td>${esc(i.name)}</td><td>${i.qty}</td><td>${money(price(i.name))}</td><td>${money(i.qty * price(i.name))}</td></tr>`).join('')
      : '<tr><td colspan="4" style="text-align:center">No items</td></tr>';
    $('#total').textContent = $('#rtotal').textContent = money(total);
    $('#rdate').textContent = new Date().toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
    try { localStorage.setItem('billing-cart', JSON.stringify(cart)); } catch (e) {}
  };

  $('#addForm').addEventListener('submit', e => {
    e.preventDefault();
    const n = clampQty(), name = sel.value, f = cart.find(i => i.name === name);
    f ? f.qty = Math.min(999, f.qty + n) : cart.push({ name, qty: n });
    render(); say(`${n} × ${name} added`);
    const t = $('#total'); t.classList.remove('bump'); void t.offsetWidth; t.classList.add('bump');
    qty.value = 1;
  });

  $('#rows').addEventListener('click', e => {
    const b = e.target.closest('[data-a]'); if (!b) return;
    const it = cart.find(i => i.name === b.dataset.n);
    if (b.dataset.a === 'inc') it.qty++;
    if (b.dataset.a === 'dec') it.qty--;
    if (b.dataset.a === 'rm' || it.qty < 1) cart = cart.filter(i => i !== it);
    render();
  });

  $('#clear').addEventListener('click', () => {
    if (!cart.length) return say('Cart is already empty');
    cart = []; render(); say('Cart cleared');
  });
  $('#print').addEventListener('click', () => {
    if (!cart.length) return say('Add items before printing');
    $('#rdate').textContent = new Date().toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
    window.print();
  });

  render();
})();
