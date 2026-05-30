<script lang="ts">
	import DataTable from '$lib/components/admin/DataTable.svelte';
	import { api } from '$lib/services/convexClient';
	import { useQuery } from 'convex-svelte';

	type EnterpriseOverview = {
		tenantCount: number;
		activeTenants: number;
		invoiceCount: number;
		paidRevenue: number;
		paymentEvents: number;
		failedPaymentEvents: number;
		usageEvents: number;
		resourceCount: number;
		activeDownloads: number;
		recentErrors: Array<{
			_id: string;
			source: 'client' | 'server' | 'convex' | 'worker';
			severity: 'info' | 'warning' | 'error' | 'critical';
			message: string;
			timestamp: number;
		}>;
	};

	const overviewQuery = useQuery(api.enterprise.getEnterpriseOverview, () => ({}));
	const paymentEventsQuery = useQuery(api.enterprise.listPaymentEvents, () => ({ limit: 25 }));
	const invoicesQuery = useQuery(api.enterprise.listInvoices, () => ({ limit: 25 }));

	let overview = $derived((overviewQuery.data ?? null) as EnterpriseOverview | null);
	let paymentEvents = $derived(paymentEventsQuery.data ?? []);
	let invoices = $derived(invoicesQuery.data ?? []);

	const statCards = $derived([
		{ label: 'Tenants', value: overview?.tenantCount ?? 0, sub: `${overview?.activeTenants ?? 0} active`, icon: '🏢', color: 'text-violet-300' },
		{ label: 'Paid Revenue', value: `₦${(overview?.paidRevenue ?? 0).toLocaleString()}`, sub: `${overview?.invoiceCount ?? 0} invoices`, icon: '💳', color: 'text-lime-300' },
		{ label: 'Payment Events', value: overview?.paymentEvents ?? 0, sub: `${overview?.failedPaymentEvents ?? 0} failed`, icon: '🔁', color: 'text-sky-300' },
		{ label: 'Resources', value: overview?.resourceCount ?? 0, sub: `${overview?.activeDownloads ?? 0} downloads active`, icon: '📦', color: 'text-amber-300' }
	]);
</script>

<svelte:head>
	<title>Enterprise Console — CollegeCBT Admin</title>
</svelte:head>

<section class="space-y-8">
	<div class="flex flex-col gap-2">
		<p class="text-[10px] font-black uppercase tracking-[0.25em] text-violet-300">Enterprise operations</p>
		<h1 class="text-3xl font-black text-white">Tenant, billing, usage and resource control</h1>
		<p class="max-w-3xl text-sm text-white/50">
			This console reads from Convex live queries, so billing ledgers, webhook events, downloads, usage, and platform errors update without a manual refresh.
		</p>
	</div>

	<div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
		{#each statCards as card}
			<article class="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
				<div class="flex items-start justify-between gap-4">
					<div>
						<p class="text-xs font-bold uppercase tracking-widest text-white/35">{card.label}</p>
						<p class="mt-2 text-2xl font-black text-white">{card.value}</p>
						<p class="mt-1 text-xs text-white/40">{card.sub}</p>
					</div>
					<div class={`text-2xl ${card.color}`}>{card.icon}</div>
				</div>
			</article>
		{/each}
	</div>

	<div class="grid gap-6 xl:grid-cols-2">
		<section class="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
			<div class="mb-4 flex items-center justify-between gap-4">
				<h2 class="text-lg font-black text-white">Recent Payment Events</h2>
				<span class="rounded-full border border-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white/40">Live</span>
			</div>
			<DataTable
				columns={[
					{ key: 'gateway', label: 'Gateway' },
					{ key: 'reference', label: 'Reference' },
					{ key: 'status', label: 'Status' },
					{ key: 'receivedAt', label: 'Received' }
				]}
				data={paymentEvents.map((event) => ({
					...event,
					receivedAt: new Date(event.receivedAt).toLocaleString()
				}))}
				loading={paymentEventsQuery.isLoading}
			/>
		</section>

		<section class="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
			<div class="mb-4 flex items-center justify-between gap-4">
				<h2 class="text-lg font-black text-white">Invoices</h2>
				<span class="rounded-full border border-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white/40">Ledger</span>
			</div>
			<DataTable
				columns={[
					{ key: 'invoiceNumber', label: 'Invoice' },
					{ key: 'status', label: 'Status' },
					{ key: 'amount', label: 'Amount' },
					{ key: 'issuedAt', label: 'Issued' }
				]}
				data={invoices.map((invoice) => ({
					...invoice,
					amount: `₦${invoice.amount.toLocaleString()}`,
					issuedAt: new Date(invoice.issuedAt).toLocaleString()
				}))}
				loading={invoicesQuery.isLoading}
			/>
		</section>
	</div>

	<section class="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
		<div class="mb-4 flex items-center justify-between gap-4">
			<h2 class="text-lg font-black text-white">Recent Error Events</h2>
			<span class="rounded-full border border-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white/40">Observability</span>
		</div>

		{#if overviewQuery.isLoading}
			<div class="h-28 rounded-xl bg-white/5 animate-pulse"></div>
		{:else if overview?.recentErrors?.length}
			<div class="space-y-3">
				{#each overview.recentErrors as event}
					<div class="flex flex-col gap-2 rounded-xl border border-white/10 bg-black/20 p-4 sm:flex-row sm:items-center sm:justify-between">
						<div>
							<p class="text-sm font-bold text-white">{event.message}</p>
							<p class="text-xs text-white/35">{event.source} · {new Date(event.timestamp).toLocaleString()}</p>
						</div>
						<span class="rounded-full border border-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white/50">{event.severity}</span>
					</div>
				{/each}
			</div>
		{:else}
			<div class="rounded-xl border border-dashed border-white/10 p-8 text-center text-sm text-white/40">
				No platform error events have been recorded.
			</div>
		{/if}
	</section>
</section>
