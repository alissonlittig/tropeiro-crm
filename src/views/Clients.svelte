<script>
  import { db } from '../lib/store.svelte.js';
  import { REPS } from '../lib/data.js';
  import { openBalance, DAYS, brl } from '../lib/logic.js';

  let q = $state('');
  const rows = $derived(
    db.clients
      .filter((c) => !q || (c.name + c.hood).toLowerCase().includes(q.toLowerCase()))
      .map((c) => ({ ...c, used: openBalance(db.orders, c.id), n: db.orders.filter((o) => o.client === c.id).length })),
  );
  const rep = (id) => REPS.find((r) => r.id === id)?.name;
</script>

<div class="filters"><input class="search" type="search" placeholder="Buscar cliente ou bairro" aria-label="Buscar cliente" bind:value={q} /></div>
<div class="card tbl">
  <table>
    <thead><tr><th>Cliente</th><th>Vendedor</th><th>Rota</th><th class="r">Pedidos</th><th style="width:26%">Crédito em uso</th></tr></thead>
    <tbody>
      {#each rows as c (c.id)}
        {@const p = c.used / c.limit}
        <tr class="row">
          <td class="full"><b>{c.name}</b> <span class="mut">· {c.hood}</span></td>
          <td class="mut">{rep(c.rep)}</td>
          <td class="r-m">{DAYS[c.day]} · parada {c.seq}</td>
          <td class="num r">{c.n} pedidos</td>
          <td class="full"><div class="rowline" style="margin-bottom:3px"><span class="num">{brl(c.used)}</span><span class="mut num">de {brl(c.limit)}</span></div>
            <div class="bar" role="progressbar" aria-label={`Crédito em uso de ${c.name}`} aria-valuenow={Math.round(p * 100)} aria-valuemin="0" aria-valuemax="100"><i class={p > 0.85 ? 'low' : p > 0.6 ? 'warn' : ''} style={`width:${Math.min(100, p * 100)}%`}></i></div></td>
        </tr>
      {:else}<tr><td colspan="5" class="empty">Nenhum cliente encontrado.</td></tr>{/each}
    </tbody>
  </table>
</div>
