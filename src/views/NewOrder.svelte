<script>
  import { db, addOrder } from '../lib/store.svelte.js';
  import { PRODUCTS } from '../lib/data.js';
  import { validateOrder, openBalance, brl } from '../lib/logic.js';

  let { say } = $props();
  let dlg;
  let shown = $state(false);
  let clientId = $state('');
  let qty = $state({});
  let errors = $state([]);
  const client = $derived(db.clients.find((c) => c.id === clientId));
  const items = $derived(PRODUCTS.map((p) => ({ sku: p.sku, price: p.price, qty: Number(qty[p.sku]) || 0 })));
  const total = $derived(items.reduce((s, i) => s + i.qty * i.price, 0));
  const free = $derived(client ? client.limit - openBalance(db.orders, client.id) : 0);

  export function open() { shown = true; clientId = ''; qty = {}; errors = []; dlg.showModal(); }
  function submit(e) {
    e.preventDefault();
    errors = validateOrder({ items }, client, db.orders);
    if (errors.length) return;
    addOrder(clientId, items);
    dlg.close();
    say(`Pedido de ${brl(total)} criado para ${client.name}`);
  }
</script>

<dialog bind:this={dlg} aria-labelledby="no-t">
  {#if shown}
  <form onsubmit={submit} novalidate>
    <div class="dh"><h2 id="no-t" style="font-size:1.15rem">Novo pedido</h2><button type="button" class="btn sm" onclick={() => dlg.close()}>Fechar</button></div>
    <div class="db">
      <label class="f">Cliente
        <select bind:value={clientId}>
          <option value="">Selecione…</option>
          {#each db.clients as c}<option value={c.id}>{c.name} · {c.hood}</option>{/each}
        </select>
      </label>
      {#if client}<p class="mut" style="font-size:.88rem">Crédito disponível: <b class="num">{brl(Math.max(free, 0))}</b></p>{/if}
      {#each PRODUCTS as p}
        <label class="line"><span>{p.name}<small class="num">{p.sku} · {brl(p.price)}</small></span>
          <input type="number" min="0" max="999" inputmode="numeric" placeholder="0" aria-label={`Quantidade de ${p.name}`} bind:value={qty[p.sku]} />
        </label>
      {/each}
    </div>
    <div class="df">
      <div><span class="mut">Total</span> <b class="num" style="font-size:1.2rem">{brl(total)}</b></div>
      <button class="btn pri" type="submit">Criar pedido</button>
      {#if errors.length}<div class="err" role="alert" style="flex-basis:100%">{errors.join(' ')}</div>{/if}
    </div>
  </form>
  {/if}
</dialog>
