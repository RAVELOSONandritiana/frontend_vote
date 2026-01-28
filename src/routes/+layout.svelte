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
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
	<link
		href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@400;600;700&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

{#if currentPath === "/login"}
	{@render children()}
{:else}
	<div
		class="flex min-h-screen bg-slate-950 text-slate-200 selection:bg-accent/30 selection:text-white"
	>
		<!-- Sidebar -->
		<aside
			class="fixed left-0 top-0 h-screen glass border-r border-white/5 flex flex-col transition-all duration-500 z-[100]
			{sidebarOpen ? 'w-72' : 'w-20'}"
		>
			<div class="flex items-center justify-between p-6 h-24">
				<div class="flex items-center gap-3 overflow-hidden">
					<div
						class="w-10 h-10 accent-gradient rounded-xl flex items-center justify-center text-xl shrink-0"
					>
						🛡️
					</div>
					{#if sidebarOpen}
						<div class="flex flex-col">
							<span
								class="text-lg font-black tracking-tighter font-outfit text-white"
								>AEGIS</span
							>
							<span
								class="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold -mt-1"
								>VOTING SYSTEM</span
							>
						</div>
					{/if}
				</div>
			</div>

			<nav class="flex-1 px-3 py-6 flex flex-col gap-1">
				{#each menuItems as item}
					{#if item.roles.includes(user?.user?.role || "user")}
						<a
							href={item.path}
							class="flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 relative group
							{currentPath === item.path
								? 'bg-white/10 text-white shadow-lg shadow-black/20'
								: 'text-slate-400 hover:text-white hover:bg-white/5'}"
						>
							{#if currentPath === item.path}
								<div
									class="absolute left-0 w-1 h-6 bg-accent rounded-full"
								></div>
							{/if}
							<span class="text-xl w-6 text-center"
								>{item.icon}</span
							>
							{#if sidebarOpen}
								<span
									class="text-sm font-semibold tracking-wide"
									>{item.label}</span
								>
							{/if}
						</a>
					{/if}
				{/each}
			</nav>

			<div class="p-4 border-t border-white/5 bg-black/20">
				{#if user}
					<div class="mb-4 px-2">
						<div class="flex items-center gap-3">
							<div
								class="w-10 h-10 rounded-full border-2 border-accent/30 p-0.5"
							>
								<div
									class="w-full h-full bg-slate-800 rounded-full flex items-center justify-center text-xs font-bold"
								>
									AD
								</div>
							</div>
							{#if sidebarOpen}
								<div class="flex flex-col min-w-0">
									<span
										class="text-sm font-bold text-white truncate"
										>Administrator</span
									>
									<span
										class="text-[10px] text-accent uppercase font-black tracking-widest"
										>{user.user.role}</span
									>
								</div>
							{/if}
						</div>
					</div>

					<button
						class="w-full flex items-center gap-4 px-4 py-3.5 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-2xl transition-all duration-300 group border-none cursor-pointer"
						onclick={logout}
					>
						<span class="text-xl">🚪</span>
						{#if sidebarOpen}
							<span class="text-sm font-bold">Sign Out</span>
						{/if}
					</button>
				{/if}
			</div>

			<!-- Collapse Toggle -->
			<button
				class="absolute -right-3 top-28 w-6 h-6 bg-slate-800 border border-white/10 rounded-full flex items-center justify-center text-[10px] text-slate-400 hover:text-white hover:bg-accent transition-all cursor-pointer z-[101] shadow-2xl"
				onclick={() => (sidebarOpen = !sidebarOpen)}
			>
				{sidebarOpen ? "‹" : "›"}
			</button>
		</aside>

		<!-- Main Content -->
		<main
			class="flex-1 transition-all duration-500 min-h-screen p-10
			{sidebarOpen ? 'ml-72' : 'ml-20'}"
		>
			<div class="max-w-6xl mx-auto">
				{@render children()}
			</div>
		</main>
	</div>
{/if}

<style>
	:global(body) {
		margin: 0;
		padding: 0;
	}

	:global(::-webkit-scrollbar) {
		width: 8px;
	}

	:global(::-webkit-scrollbar-track) {
		background: transparent;
	}

	:global(::-webkit-scrollbar-thumb) {
		@apply bg-white/10 rounded-full hover:bg-white/20 transition-colors;
	}
</style>
