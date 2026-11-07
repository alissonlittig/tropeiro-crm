<script>
  import { db, dispatch, advance, TODAY } from '../lib/store.svelte.js';
  import { REPS } from '../lib/data.js';
  import { routeStops, DAYS, brl } from '../lib/logic.js';

  let { say } = $props();
  const dow = TODAY.getUTCDay();
  let day = $state(dow >= 1 && dow <= 5 ? dow - 1 : 0);
  const DRIVERS = ['Adilson (VUC 01)', 'Vera (VUC 02)', 'Nelson (Truck 03)', 'Paulo (VUC 04)', 'Sônia (VUC 05)'];
  const stops = $derived(routeStops(db.clients, db.orders, day));
  const all = $derived(stops.flatMap((s) => s.orders));
  const toDispatch = $derived(all.filter((o) => o.status === 'separado'));
  const hood = (c) => c.hood;
  const rep = (id) => REPS.find((r) => r.id === id)?.name.split(' ')[0];
  const total = $derived(stops.reduce((s, x) => s + x.total, 0));
  const vol = $derived(all.reduce((s, o) => s + o.items.reduce((a, i) => a + i.qty, 0), 0));

  function deliver(s) {
    const ids = s.orders.filter((o) => o.status === 'em_rota').map((o) => o.id);
    ids.forEach(advance);
    say(`Entrega confirmada: ${s.client.name}`);
  }
  function go() {
    dispatch(toDispatch.map((o) => o.id));
    say(`Rota despachada: ${toDispatch.length} pedido(s)`);
  }
</script>

<div class="days" role="tablist" aria-label="Dia da semana">
  {#each DAYS as d, i}
    <button class="pill" role="tab" aria-selected={day === i} onclick={() => (day = i)}>{d}</button>
  {/each}
</div>

<div class="summary">
  <div><b>{stops.length}</b><span>paradas</span></div>
  <div><b class="num">{vol}</b><span>volumes</span></div>
  <div><b class="num">{brl(total)}</b><span>valor a entregar</span></div>
  <div><b style="font-size:1rem">{DRIVERS[day]}</b><span>motorista e veículo</span></div>
</div>

<div class="card">
  <h2>{DAYS[day]} <button class="btn pri sm" disabled={!toDispatch.length} onclick={go} style={toDispatch.length ? '' : 'opacity:.5;cursor:default'}>Despachar rota ({toDispatch.length})</button></h2>
  <div class="route">
    {#each stops as s, i (s.client.id)}
      {@const rolling = s.orders.some((o) => o.status === 'em_rota')}
      <div class="stop">
        <div class="n">{i + 1}</div>
        <div class="body"><b>{s.client.name}</b><span class="mut">{hood(s.client)} · {s.orders.length} pedido(s) · {rep(s.client.rep)}</span></div>
        <div class="side-r">
          <b class="num">{brl(s.total)}</b>
          {#if rolling}<button class="btn sm" onclick={() => deliver(s)}>Confirmar entrega</button>
          {:else}<span class="chip s-separado">{s.orders.some((o) => o.status === 'separado') ? 'Separado' : 'Aguardando separação'}</span>{/if}
        </div>
      </div>
    {:else}
      <p class="empty">Sem entregas pendentes para {DAYS[day].toLowerCase()}.</p>
    {/each}
  </div>
</div>
