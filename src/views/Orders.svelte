<script>
  import { db, advance, cancel } from '../lib/store.svelte.js';
  import { REPS } from '../lib/data.js';
  import { orderTotal, brl, STATUS_LABEL } from '../lib/logic.js';

  let { say } = $props();
  let filter = $state('todos');
  let q = $state('');
  let openId = $state(null);
  const ACTION = { novo: 'Separar', separado: 'Enviar p/ rota', em_rota: 'Confirmar entrega' };
  const client = (id) => db.clients.find((c) => c.id === id)?.name ?? '';
  const rep = (id) => REPS.find((r) => r.id === id)?.name.split(' ')[0] ?? '';
  const fmt = (d) => d.slice(8) + '/' + d.slice(5, 7);
  const list = $derived(
    db.orders
      .filter((o) => (filter === 'todos' || o.status === filter) && (!q || (client(o.client) + o.id).toLowerCase().includes(q.toLowerCase())))
      .slice(0, 60),
  );
  const count = (s) => db.orders.filter((o) => o.status === s).length;
  function go(o) { advance(o.id); say(`Pedido #${o.id}: ${STATUS_LABEL[o.status === 'novo' ? 'separado' : o.status === 'separado' ? 'em_rota' : 'entregue']}`); }
</script>

<div class="filters">
  {#each ['todos', 'novo', 'separado', 'em_rota', 'entregue', 'cancelado'] as s}
    <button class="pill" aria-pressed={filter === s} onclick={() => (filter = s)}>{s === 'todos' ? 'Todos' : STATUS_LABEL[s]} <span class="num mut" style={filter === s ? 'color:#cfd8d3' : ''}>{s === 'todos' ? db.orders.length : count(s)}</span></button>
  {/each}
  <input class="search" type="search" placeholder="Buscar cliente ou nº" aria-label="Buscar pedido" bind:value={q} />
</div>

<div class="card tbl">
  <table>
    <thead><tr><th>Pedido</th><th>Cliente</th><th>Vendedor</th><th>Data</th><th class="r">Total</th><th>Status</th><th class="r">Ação</th></tr></thead>
    <tbody>
      {#each list as o (o.id)}
        <tr class="row">
          <td class="num"><button class="linkbtn" aria-expanded={openId === o.id} onclick={() => (openId = openId === o.id ? null : o.id)}>#{o.id}</button></td>
          <td class="full"><b>{client(o.client)}</b></td>
          <td class="mut">{rep(o.rep)} · {fmt(o.date)}</td>
          <td class="num r"><b>{brl(orderTotal(o))}</b></td>
          <td><span class={`chip s-${o.status}`}>{STATUS_LABEL[o.status]}</span></td>
          <td class="r full">
            <div class="acts">
              {#if ACTION[o.status]}<button class="btn sm pri" onclick={() => go(o)}>{ACTION[o.status]}</button>{/if}
              {#if o.status !== 'entregue' && o.status !== 'cancelado'}<button class="btn sm danger" onclick={() => { cancel(o.id); say(`Pedido #${o.id} cancelado`); }}>Cancelar</button>{/if}
            </div>
          </td>
        </tr>
        {#if openId === o.id}
          <tr class="detail"><td colspan="7"><ul>{#each o.items as i}<li><span>{i.qty} × {i.sku}</span><span class="num">{brl(i.qty * i.price)}</span></li>{/each}</ul></td></tr>
        {/if}
      {:else}
        <tr><td colspan="7" class="empty">Nenhum pedido encontrado.</td></tr>
      {/each}
    </tbody>
  </table>
</div>
