// Dados 100% fictícios, gerados de forma determinística (nenhum cliente ou pessoa real).
function rng(seed) {
  let a = seed;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const REPS = [
  { id: 'r1', name: 'Marcela Duarte', region: 'Centro e Batel', target: 52000 },
  { id: 'r2', name: 'Rogério Pinheiro', region: 'Zona Sul', target: 44000 },
  { id: 'r3', name: 'Tatiana Ibarra', region: 'Zona Norte', target: 38000 },
  { id: 'r4', name: 'Caio Ventura', region: 'Região metropolitana', target: 46000 },
  { id: 'r5', name: 'Letícia Prado', region: 'Litoral', target: 32000 },
];

export const PRODUCTS = [
  { sku: 'ARR-05', name: 'Arroz agulhinha 5 kg', cat: 'Mercearia', price: 27.9 },
  { sku: 'FEI-01', name: 'Feijão carioca 1 kg (cx 10)', cat: 'Mercearia', price: 64.5 },
  { sku: 'OLE-09', name: 'Óleo de soja 900 ml (cx 20)', cat: 'Mercearia', price: 148.0 },
  { sku: 'ACU-05', name: 'Açúcar refinado 5 kg', cat: 'Mercearia', price: 21.4 },
  { sku: 'CAF-05', name: 'Café torrado 500 g (cx 20)', cat: 'Mercearia', price: 312.0 },
  { sku: 'MAC-05', name: 'Macarrão espaguete 500 g (cx 20)', cat: 'Mercearia', price: 96.0 },
  { sku: 'LEI-01', name: 'Leite integral 1 L (cx 12)', cat: 'Laticínios', price: 66.0 },
  { sku: 'QUE-03', name: 'Queijo muçarela 3 kg', cat: 'Laticínios', price: 124.0 },
  { sku: 'IOG-01', name: 'Iogurte natural 170 g (cx 24)', cat: 'Laticínios', price: 58.8 },
  { sku: 'REF-02', name: 'Refrigerante cola 2 L (fardo 6)', cat: 'Bebidas', price: 39.9 },
  { sku: 'AGU-05', name: 'Água mineral 500 ml (fardo 12)', cat: 'Bebidas', price: 14.6 },
  { sku: 'SUC-01', name: 'Suco integral uva 1 L (cx 6)', cat: 'Bebidas', price: 72.0 },
  { sku: 'DET-05', name: 'Detergente neutro 500 ml (cx 24)', cat: 'Limpeza', price: 52.0 },
  { sku: 'SAB-01', name: 'Sabão em pó 1 kg (cx 12)', cat: 'Limpeza', price: 98.4 },
  { sku: 'PAP-12', name: 'Papel higiênico folha dupla (fardo 64)', cat: 'Higiene', price: 119.0 },
  { sku: 'EMB-01', name: 'Embalagem para viagem 750 ml (cx 100)', cat: 'Descartáveis', price: 87.0 },
];

const CLIENTS = [
  ['Mercadinho Boa Praça', 'Batel'], ['Padaria Trigo & Cia', 'Centro'], ['Restaurante Sal Grosso', 'Água Verde'],
  ['Empório Dona Zilda', 'Portão'], ['Lanchonete Ponto Quente', 'Centro'], ['Supermercado Vale Azul', 'Pinheirinho'],
  ['Cantina do Beto', 'Rebouças'], ['Hortifruti Quintal', 'Santa Felicidade'], ['Bar do Chico', 'Cajuru'],
  ['Minimercado Estrela', 'Boqueirão'], ['Padaria Pão de Ouro', 'Xaxim'], ['Churrascaria Fogo Alto', 'Bacacheri'],
  ['Mercearia Três Irmãos', 'Uberaba'], ['Hotel Pouso Manso', 'Centro'], ['Pizzaria Forno Lento', 'Mercês'],
  ['Atacadinho Bom Preço', 'Sítio Cercado'], ['Café Quintal', 'Batel'], ['Refeitório Metalúrgica Sul', 'CIC'],
  ['Mercado São Jorge', 'Tatuquara'], ['Rotisseria Sabor Caseiro', 'Água Verde'], ['Escola Raio de Sol', 'Portão'],
  ['Armazém do Vale', 'Pinhais'], ['Sorveteria Gelato Sul', 'Colombo'], ['Posto & Conveniência Rota 116', 'Fazenda Rio Grande'],
];

export function seed(today = new Date()) {
  const r = rng(20261107);
  const pick = (a) => a[Math.floor(r() * a.length)];
  const clients = CLIENTS.map(([name, hood], i) => ({
    id: `c${i + 1}`, name, hood,
    rep: REPS[i % REPS.length].id,
    day: i % 5, seq: Math.floor(i / 5) + 1,
    limit: 9000 + Math.floor(r() * 9) * 2500,
  }));
  const orders = [];
  let n = 4100;
  for (let back = 45; back >= 0; back--) {
    const date = new Date(today.getTime() - back * 864e5);
    if (date.getUTCDay() === 0) continue;
    const count = 2 + Math.floor(r() * 3);
    for (let k = 0; k < count; k++) {
      const c = pick(clients);
      const items = [];
      const lines = 2 + Math.floor(r() * 4);
      for (let l = 0; l < lines; l++) {
        const p = pick(PRODUCTS);
        if (!items.some((x) => x.sku === p.sku)) items.push({ sku: p.sku, qty: 2 + Math.floor(r() * 14), price: p.price });
      }
      const status = back > 9 ? (r() < 0.04 ? 'cancelado' : 'entregue') : back > 3 ? pick(['em_rota', 'entregue', 'separado', 'separado']) : back > 0 ? pick(['separado', 'novo', 'em_rota']) : 'novo';
      orders.push({ id: ++n, client: c.id, rep: c.rep, date: date.toISOString().slice(0, 10), status, items });
    }
  }
  orders.reverse(); // mais recentes primeiro
  return { clients, orders, nextId: n + 1 };
}
