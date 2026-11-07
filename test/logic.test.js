import test from 'node:test';
import assert from 'node:assert/strict';
import { orderTotal, revenue, attainment, dailySeries, routeStops, validateOrder, nextStatus, openBalance } from '../src/lib/logic.js';
import { seed } from '../src/lib/data.js';

const o = (id, client, status, date, qty = 1, price = 100, rep = 'r1') => ({ id, client, status, date, rep, items: [{ sku: 'x', qty, price }] });

test('total e avanço de status', () => {
  assert.equal(orderTotal(o(1, 'c', 'novo', '2026-11-01', 3, 10)), 30);
  assert.equal(nextStatus('novo'), 'separado');
  assert.equal(nextStatus('entregue'), null);
});

test('faturamento ignora cancelados e outro mês', () => {
  const list = [o(1, 'c', 'entregue', '2026-11-02'), o(2, 'c', 'cancelado', '2026-11-03'), o(3, 'c', 'novo', '2026-10-30')];
  assert.equal(revenue(list, '2026-11'), 100);
  assert.equal(attainment(50, 200), 0.25);
  assert.equal(attainment(50, 0), 0);
});

test('série diária tem N pontos', () => {
  const s = dailySeries([o(1, 'c', 'novo', '2026-11-07', 2)], 7, new Date('2026-11-07T12:00:00Z'));
  assert.equal(s.length, 7);
  assert.equal(s[6].value, 200);
});

test('limite de crédito considera saldo em aberto', () => {
  const client = { id: 'c', limit: 250 };
  const orders = [o(1, 'c', 'novo', '2026-11-01', 2)];
  assert.equal(openBalance(orders, 'c'), 200);
  assert.equal(validateOrder({ items: [{ qty: 1, price: 100 }] }, client, orders).length, 1);
  assert.equal(validateOrder({ items: [{ qty: 1, price: 40 }] }, client, orders).length, 0);
  assert.equal(validateOrder({ items: [] }, client, orders).length, 1);
});

test('seed é determinístico e rotas só listam pedidos abertos', () => {
  const a = seed(new Date('2026-11-07T12:00:00Z'));
  const b = seed(new Date('2026-11-07T12:00:00Z'));
  assert.deepEqual(a.orders, b.orders);
  for (let d = 0; d < 5; d++) for (const s of routeStops(a.clients, a.orders, d)) assert.ok(s.orders.length > 0);
});
