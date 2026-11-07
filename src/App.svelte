<script>
  import { ICONS } from './lib/icons.js';
  import { reset } from './lib/store.svelte.js';
  import Dashboard from './views/Dashboard.svelte';
  import Orders from './views/Orders.svelte';
  import Routes from './views/Routes.svelte';
  import Reps from './views/Reps.svelte';
  import Clients from './views/Clients.svelte';
  import NewOrder from './views/NewOrder.svelte';

  const PAGES = [
    { id: 'painel', label: 'Painel', title: 'Painel', sub: 'Visão geral da distribuição no mês' },
    { id: 'pedidos', label: 'Pedidos', title: 'Pedidos', sub: 'Do pedido do cliente até a entrega' },
    { id: 'rotas', label: 'Rotas', title: 'Rotas de entrega', sub: 'Paradas do dia, na ordem de visita' },
    { id: 'vendedores', label: 'Vendedores', title: 'Vendedores e metas', sub: 'Faturamento do mês contra a meta' },
    { id: 'clientes', label: 'Clientes', title: 'Clientes', sub: 'Carteira, limite de crédito e rota' },
  ];
  const read = () => PAGES.find((p) => p.id === location.hash.slice(2))?.id ?? 'painel';
  let page = $state(read());
  let newOrder;
  let toast = $state('');
  let timer;
  const say = (m) => { toast = m; clearTimeout(timer); timer = setTimeout(() => (toast = ''), 2400); };
  const cur = $derived(PAGES.find((p) => p.id === page));
  $effect(() => { document.title = `${cur.title} · Tropeiro CRM (demo)`; });
</script>

<svelte:window onhashchange={() => (page = read())} />

<div class="shell">
  <aside class="side">
    <div class="brand">
      <svg viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" rx="14" fill="#0e3b2f"/><path d="M14 40h26l6-14H22l-3-8h-7" fill="none" stroke="#f4c27a" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="26" cy="47" r="4" fill="#f4c27a"/><circle cx="40" cy="47" r="4" fill="#f4c27a"/></svg>
      <span>Tropeiro<small>CRM de distribuição</small></span>
    </div>
    <nav class="nav" aria-label="Principal">
      {#each PAGES as p}
        <a href={`#/${p.id}`} aria-current={page === p.id ? 'page' : undefined}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d={ICONS[p.id]} /></svg>
          {p.label}
        </a>
      {/each}
    </nav>
    <div class="foot"><b>Dados fictícios</b><br />Distribuidora de demonstração. Tudo é salvo só neste navegador.</div>
  </aside>

  <main>
    <div class="mhead"><span>Tropeiro</span></div>
    <div class="top">
      <div>
        <h1>{cur.title}<span class="badge-demo">dados fictícios</span></h1>
        <p>{cur.sub}</p>
      </div>
      <div class="filters" style="margin:0">
        <button class="btn" onclick={() => { reset(); say('Dados de demonstração restaurados'); }}>Restaurar demo</button>
        <button class="btn pri" onclick={() => newOrder.open()}>Novo pedido</button>
      </div>
    </div>

    {#if page === 'painel'}<Dashboard />
    {:else if page === 'pedidos'}<Orders {say} />
    {:else if page === 'rotas'}<Routes {say} />
    {:else if page === 'vendedores'}<Reps />
    {:else}<Clients />{/if}
  </main>
</div>

<NewOrder bind:this={newOrder} {say} />
{#if toast}<div class="toast" role="status">{toast}</div>{/if}
