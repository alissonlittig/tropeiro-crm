<script>
  import { db, TODAY, NOW_YM } from '../lib/store.svelte.js';
  import { REPS } from '../lib/data.js';
  import { revenue, attainment, dailySeries, orderTotal, brl, brlShort, STATUS_LABEL, OPEN } from '../lib/logic.js';

  const monthOrders = $derived(db.orders.filter((o) => o.status !== 'cancelado' && o.date.startsWith(NOW_YM)));
  const rev = $derived(revenue(db.orders, NOW_YM));
  const target = REPS.reduce((s, r) => s + r.target, 0);
  const open = $derived(db.orders.filter((o) => OPEN.includes(o.status)));
  const ticket = $derived(monthOrders.length ? rev / monthOrders.length : 0);
  const day = TODAY.getUTCDate();
  const dim = new Date(TODAY.getUTCFullYear(), TODAY.getUTCMonth() + 1, 0).getDate();
  const pace = day / dim;
  const series = $derived(dailySeries(db.orders, 30, TODAY));
  const max = $derived(Math.max(...series.map((s) => s.value), 1));
  const W = 640, H = 190, PX = 8, PT = 14, PB = 24;
  const pts = $derived(series.map((s, i) => [PX + (i * (W - 2 * PX)) / 29, PT + (1 - s.value / max) * (H - PT - PB)]));
  const line = $derived(pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(''));
  const area = $derived(`${line}L${pts[29][0]} ${H - PB}L${pts[0][0]} ${H - PB}Z`);
  const status = $derived(['novo', 'separado', 'em_rota', 'entregue'].map((s) => ({ s, n: db.orders.filter((o) => o.status === s && (s !== 'entregue' || o.date.startsWith(NOW_YM))).length })));
  const clientName = (id) => db.clients.find((c) => c.id === id)?.name;
  const ranked = $derived(REPS.map((r) => ({ ...r, v: revenue(db.orders, NOW_YM, r.id) })).sort((a, b) => b.v / b.target - a.v / a.target));
  const dayLabel = (i) => series[i].date.slice(8) + '/' + series[i].date.slice(5, 7);
  const recent = $derived(db.orders.filter((o) => o.status === 'em_rota' || o.status === 'separado').slice(0, 5));
</script>

<section class="grid kpis" aria-label="Indicadores">
  <div class="card kpi"><div class="label">Faturamento do mês</div><div class="value num">{brlShort(rev)}</div><div class="sub">{Math.round(attainment(rev, target) * 100)}% da meta · ritmo esperado {Math.round(pace * 100)}%</div></div>
  <div class="card kpi"><div class="label">Pedidos no mês</div><div class="value num">{monthOrders.length}</div><div class="sub">excluindo cancelados</div></div>
  <div class="card kpi"><div class="label">Ticket médio</div><div class="value num">{brl(ticket)}</div><div class="sub">por pedido</div></div>
  <div class="card kpi"><div class="label">Pedidos em aberto</div><div class="value num">{open.length}</div><div class="sub">{brlShort(open.reduce((s, o) => s + orderTotal(o), 0))} a entregar</div></div>
</section>

<section class="grid two">
  <div class="card">
    <h2>Vendas dos últimos 30 dias <span class="mut num" style="font-weight:400">pico {brlShort(max)}</span></h2>
    <svg class="chart" viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Gráfico de faturamento diário dos últimos 30 dias">
      <defs><linearGradient id="g" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#1d6b55" stop-opacity=".28" /><stop offset="1" stop-color="#1d6b55" stop-opacity="0" /></linearGradient></defs>
      {#each [0, 0.5, 1] as t}<line x1={PX} x2={W - PX} y1={PT + t * (H - PT - PB)} y2={PT + t * (H - PT - PB)} stroke="#e4dfd3" stroke-dasharray="3 4" />{/each}
      <path d={area} fill="url(#g)" />
      <path d={line} fill="none" stroke="#14503f" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round" />
      <circle cx={pts[29][0]} cy={pts[29][1]} r="4.5" fill="#fff" stroke="#14503f" stroke-width="2.4" />
      <text x={PX} y={H - 6}>{dayLabel(0)}</text><text x={W / 2} y={H - 6} text-anchor="middle">{dayLabel(15)}</text><text x={W - PX} y={H - 6} text-anchor="end">{dayLabel(29)}</text>
    </svg>
  </div>
  <div class="card">
    <h2>Funil de pedidos</h2>
    <div class="rows">
      {#each status as x}
        <div><div class="rowline"><span class={`chip s-${x.s}`}>{STATUS_LABEL[x.s]}</span><b class="num">{x.n}</b></div>
          <div class="bar" aria-hidden="true"><i style={`width:${Math.min(100, x.n * 5)}%`}></i></div></div>
      {/each}
    </div>
  </div>
</section>

<section class="grid two" style="grid-template-columns:1fr 1fr">
  <div class="card">
    <h2>Metas por vendedor <a href="#/vendedores" style="font-size:.85rem;color:var(--pri)">ver todos</a></h2>
    <div class="rows">
      {#each ranked as r}
        {@const a = attainment(r.v, r.target)}
        <div><div class="rowline"><span>{r.name}</span><b class="num">{Math.round(a * 100)}%</b></div>
          <div class="bar" role="progressbar" aria-label={`Meta de ${r.name}`} aria-valuenow={Math.round(a * 100)} aria-valuemin="0" aria-valuemax="100"><i class={a < pace * 0.7 ? 'low' : a < pace ? 'warn' : ''} style={`width:${Math.min(100, a * 100)}%`}></i></div></div>
      {/each}
    </div>
  </div>
  <div class="card">
    <h2>Saindo para entrega <a href="#/rotas" style="font-size:.85rem;color:var(--pri)">ver rotas</a></h2>
    <div class="rows">
      {#each recent as o}
        <div class="rowline" style="margin:0"><span><b>#{o.id}</b> {clientName(o.client)}</span><span class={`chip s-${o.status}`}>{STATUS_LABEL[o.status]}</span></div>
      {:else}<p class="empty">Nada saindo agora.</p>{/each}
    </div>
  </div>
</section>
