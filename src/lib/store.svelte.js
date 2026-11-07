import { seed } from './data.js';
import { nextStatus } from './logic.js';

const KEY = 'tropeiro:v1';
export const TODAY = new Date();
export const NOW_YM = TODAY.toISOString().slice(0, 7);

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* armazenamento corrompido: recomeça do seed */ }
  return seed(TODAY);
}

export const db = $state(load());
const save = () => localStorage.setItem(KEY, JSON.stringify($state.snapshot(db)));
const find = (id) => db.orders.find((x) => x.id === id);

export function addOrder(clientId, items) {
  const c = db.clients.find((x) => x.id === clientId);
  db.orders.unshift({ id: db.nextId++, client: clientId, rep: c.rep, date: TODAY.toISOString().slice(0, 10), status: 'novo', items: items.filter((i) => i.qty > 0) });
  save();
}
export function advance(id) {
  const o = find(id);
  const n = o && nextStatus(o.status);
  if (n) { o.status = n; save(); }
}
export function cancel(id) {
  const o = find(id);
  if (o && o.status !== 'entregue') { o.status = 'cancelado'; save(); }
}
export function dispatch(ids) {
  for (const o of db.orders) if (ids.includes(o.id) && o.status === 'separado') o.status = 'em_rota';
  save();
}
export function reset() {
  localStorage.removeItem(KEY);
  Object.assign(db, seed(TODAY));
}
