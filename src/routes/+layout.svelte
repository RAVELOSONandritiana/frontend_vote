<script lang="ts">
	import { page } from "$app/stores";
	import { api } from "$lib/api";
	import { goto } from "$app/navigation";
	import { onMount } from "svelte";
	import "../app.css";

	let { children } = $props();
	let currentPath = $derived($page.url.pathname);
	let isLoggedIn = $derived(api.getToken() !== null);
	let user = $state<{ user: { role: string; matricule: string } } | null>(
		null,
	);
	let sidebarOpen = $state(true);

	onMount(() => {
		// Mock user for now
		user = { user: { role: "admin", matricule: "ADMIN-777-X" } };
	});

	async function logout() {
		api.setToken(null);
		user = null;
		goto("/login");
	}

	const menuItems = [
		{ path: "/", label: "Dashboard", icon: "📊", roles: ["admin", "user"] },
		{ path: "/vote", label: "Scrutins", icon: "🗳️", roles: ["user"] },
		{
			path: "/results",
			label: "Direct",
			icon: "🌐",
			roles: ["admin", "user"],
		},
		{
			path: "/admin",
			label: "Admin Control",
			icon: "🔐",
			roles: ["admin"],
		},
	];
</script>

<svelte:head>
	<title>Aegis | Système de Vote Électronique</title>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link
		rel="preconnect"
		href="https://fonts.gstatic.com"
		crossorigin="anonymous"
	/>
	<link
		href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@400;600;700;800;900&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

{#if currentPath === "/login"}
	{@render children()}
{:else}
	<div
		class="flex min-h-screen bg-[#0a0a0f] text-slate-200 selection:bg-accent/30 selection:text-white"
	>
		<!-- Sidebar -->
		<aside
			class="fixed left-0 top-0 h-screen glass border-r border-white/[0.08] flex flex-col transition-all duration-500 z-[100] {sidebarOpen
				? 'w-72'
				: 'w-20'}"
		>
			<!-- Header -->
			<div
				class="flex items-center justify-between p-6 h-24 border-b border-white/[0.06]"
			>
				<div class="flex items-center gap-3 overflow-hidden">
					<div
						class="w-11 h-11 accent-gradient rounded-xl flex items-center justify-center text-xl shrink-0 shadow-lg shadow-accent/20"
					>
						🛡️
					</div>
					{#if sidebarOpen}
						<div class="flex flex-col">
							<span
								class="text-xl font-black tracking-tighter font-outfit text-white"
								>AEGIS</span
							>
							<span
								class="text-[9px] uppercase tracking-[0.25em] text-emerald-400 font-bold -mt-0.5"
								>VOTING SYSTEM</span
							>
						</div>
					{/if}
				</div>
			</div>

			<!-- Navigation -->
			<nav class="flex-1 px-3 py-6 flex flex-col gap-1.5 overflow-y-auto">
				{#each menuItems as item}
					{#if item.roles.includes(user?.user?.role || "user")}
						<a
							href={item.path}
							class="flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 relative group {currentPath ===
							item.path
								? 'bg-accent/10 text-white shadow-lg shadow-accent/10 border border-accent/20'
								: 'text-slate-400 hover:text-white hover:bg-white/[0.05] border border-transparent'}"
						>
							{#if currentPath === item.path}
								<div
									class="absolute left-0 w-1 h-8 bg-accent rounded-r-full shadow-lg shadow-accent/50"
								></div>
							{/if}
							<span
								class="text-xl w-7 text-center transition-transform duration-300 group-hover:scale-110"
								>{item.icon}</span
							>
							{#if sidebarOpen}
								<span class="text-sm font-bold tracking-wide"
									>{item.label}</span
								>
							{/if}
							{#if currentPath === item.path}
								<div
									class="ml-auto w-1.5 h-1.5 rounded-full bg-accent animate-pulse"
								></div>
							{/if}
						</a>
					{/if}
				{/each}
			</nav>

			<!-- User Section -->
			<div class="p-4 border-t border-white/[0.06] bg-black/30">
				{#if user}
					<div class="mb-4 px-2">
						<div class="flex items-center gap-3">
							<div class="relative">
								<div
									class="w-11 h-11 rounded-full border-2 border-accent/40 p-0.5 bg-gradient-to-br from-accent/20 to-transparent"
								>
									<div
										class="w-full h-full bg-slate-900 rounded-full flex items-center justify-center text-xs font-black text-accent"
									>
										AD
									</div>
								</div>
								<div
									class="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0a0a0f]"
								></div>
							</div>
							{#if sidebarOpen}
								<div class="flex flex-col min-w-0 flex-1">
									<span
										class="text-sm font-bold text-white truncate"
										>Administrator</span
									>
									<span
										class="text-[9px] text-accent uppercase font-black tracking-widest"
										>{user.user.role}</span
									>
								</div>
							{/if}
						</div>
					</div>

					<button
						class="w-full flex items-center gap-4 px-4 py-3.5 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white rounded-2xl transition-all duration-300 group border border-rose-500/20 hover:border-rose-500 cursor-pointer"
						onclick={logout}
					>
						<span
							class="text-lg transition-transform duration-300 group-hover:translate-x-0.5"
							>🚪</span
						>
						{#if sidebarOpen}
							<span class="text-sm font-bold">Sign Out</span>
						{/if}
					</button>
				{/if}
			</div>

			<!-- Collapse Toggle -->
			<button
				class="absolute -right-3 top-28 w-7 h-7 glass border border-white/[0.12] rounded-full flex items-center justify-center text-xs text-slate-400 hover:text-white hover:bg-accent/20 hover:border-accent/40 transition-all cursor-pointer z-[101] shadow-xl group"
				onclick={() => (sidebarOpen = !sidebarOpen)}
			>
				<span
					class="transition-transform duration-300 group-hover:scale-110"
				>
					{sidebarOpen ? "‹" : "›"}
				</span>
			</button>
		</aside>

		<!-- Main Content -->
		<main
			class="flex-1 transition-all duration-500 min-h-screen p-10 {sidebarOpen
				? 'ml-72'
				: 'ml-20'}"
		>
			<div class="max-w-7xl mx-auto">
				{@render children()}
			</div>
		</main>
	</div>
{/if}

<style>
	@reference "../app.css";

	:global(body) {
		margin: 0;
		padding: 0;
	}

	:global(::-webkit-scrollbar) {
		width: 8px;
		height: 8px;
	}

	:global(::-webkit-scrollbar-track) {
		background: transparent;
	}

	:global(::-webkit-scrollbar-thumb) {
		@apply bg-white/10 rounded-full hover:bg-white/20 transition-colors;
	}

	:global(::-webkit-scrollbar-thumb:hover) {
		@apply bg-accent/30;
	}
</style>
