<script>
  import { db, TODAY, NOW_YM } from '../lib/store.svelte.js';
  import { REPS } from '../lib/data.js';
  import { revenue, attainment, brl, brlShort } from '../lib/logic.js';

  const day = TODAY.getUTCDate();
  const dim = new Date(TODAY.getUTCFullYear(), TODAY.getUTCMonth() + 1, 0).getDate();
  const rows = $derived(
    REPS.map((r) => {
      const v = revenue(db.orders, NOW_YM, r.id);
      const n = db.orders.filter((o) => o.rep === r.id && o.status !== 'cancelado' && o.date.startsWith(NOW_YM)).length;
      return { ...r, v, n, a: attainment(v, r.target), proj: (v / day) * dim, clients: db.clients.filter((c) => c.rep === r.id).length };
    }).sort((x, y) => y.a - x.a),
  );
</script>

<div class="grid reps">
  {#each rows as r, i (r.id)}
    <article class="card rep">
      <header>
        <div class="avatar" aria-hidden="true">{r.name.split(' ').map((p) => p[0]).join('')}</div>
        <div><h2 style="margin:0">{r.name}</h2><span class="mut">{r.region}</span></div>
        <span class="rank">#{i + 1}</span>
      </header>
      <div>
        <div class="rowline"><span>{brl(r.v)} de {brlShort(r.target)}</span><b class="num">{Math.round(r.a * 100)}%</b></div>
        <div class="bar" role="progressbar" aria-label={`Meta de ${r.name}`} aria-valuenow={Math.round(r.a * 100)} aria-valuemin="0" aria-valuemax="100"><i class={r.proj < r.target * 0.8 ? 'low' : r.proj < r.target ? 'warn' : ''} style={`width:${Math.min(100, r.a * 100)}%`}></i></div>
      </div>
      <dl>
        <div><dt>Pedidos</dt><dd class="num">{r.n}</dd></div>
        <div><dt>Clientes</dt><dd class="num">{r.clients}</dd></div>
        <div><dt>Projeção</dt><dd class="num" style={`color:${r.proj >= r.target ? 'var(--pri-2)' : 'var(--acc-ink)'}`}>{brlShort(r.proj)}</dd></div>
      </dl>
    </article>
  {/each}
</div>
