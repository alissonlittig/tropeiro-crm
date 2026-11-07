export const STATUS = ['novo', 'separado', 'em_rota', 'entregue'];
export const STATUS_LABEL = { novo: 'Novo', separado: 'Separado', em_rota: 'Em rota', entregue: 'Entregue', cancelado: 'Cancelado' };
export const OPEN = ['novo', 'separado', 'em_rota'];
export const DAYS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];

export const brl = (n) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
export const brlShort = (n) => (n >= 1000 ? `R$ ${(n / 1000).toFixed(n >= 100000 ? 0 : 1).replace('.', ',')} mil` : brl(n));
export const ymd = (d) => d.toISOString().slice(0, 10);

export const orderTotal = (o) => o.items.reduce((s, i) => s + i.qty * i.price, 0);
export const nextStatus = (s) => STATUS[STATUS.indexOf(s) + 1] ?? null;

/** Faturamento do mês (YYYY-MM), opcionalmente por vendedor; cancelados não contam. */
export function revenue(orders, ym, repId) {
  return orders
    .filter((o) => o.status !== 'cancelado' && o.date.startsWith(ym) && (!repId || o.rep === repId))
    .reduce((s, o) => s + orderTotal(o), 0);
}

export const attainment = (value, target) => (target > 0 ? value / target : 0);

/** Série diária dos últimos `days` dias terminando em `today` (Date). */
export function dailySeries(orders, days, today) {
  const out = [];
  for (let i = days - 1; i >= 0; i--) {
    const key = ymd(new Date(today.getTime() - i * 864e5));
    const value = orders.filter((o) => o.status !== 'cancelado' && o.date === key).reduce((s, o) => s + orderTotal(o), 0);
    out.push({ date: key, value });
  }
  return out;
}

/** Saldo em aberto do cliente (pedidos ainda não entregues/cancelados). */
export const openBalance = (orders, clientId) =>
  orders.filter((o) => o.client === clientId && OPEN.includes(o.status)).reduce((s, o) => s + orderTotal(o), 0);

/** Paradas de um dia da semana: clientes da rota com pedidos em aberto, na ordem de visita. */
export function routeStops(clients, orders, day) {
  return clients
    .filter((c) => c.day === day)
    .sort((a, b) => a.seq - b.seq)
    .map((c) => {
      const list = orders.filter((o) => o.client === c.id && OPEN.includes(o.status));
      return { client: c, orders: list, total: list.reduce((s, o) => s + orderTotal(o), 0) };
    })
    .filter((s) => s.orders.length);
}

/** Valida rascunho de pedido; devolve lista de erros (vazia = ok). */
export function validateOrder(draft, client, orders) {
  const errors = [];
  const items = draft.items.filter((i) => i.qty > 0);
  if (!client) errors.push('Escolha o cliente.');
  if (!items.length) errors.push('Adicione ao menos um item.');
  if (client) {
    const total = items.reduce((s, i) => s + i.qty * i.price, 0);
    const free = client.limit - openBalance(orders, client.id);
    if (total > free) errors.push(`Limite de crédito excedido (disponível ${brl(Math.max(free, 0))}).`);
  }
  return errors;
}
