<script lang="ts">
	import { page } from '$app/stores';
	import { api } from '$lib/api';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	let { children } = $props();
	let currentPath = $derived($page.url.pathname);
	let isLoggedIn = $derived(api.getToken() !== null);
	let user = $state<{ user: { role: string; matricule: string } } | null>(null);
	let sidebarOpen = $state(true);

	onMount(() => {
		const token = api.getToken();
		if (token) {
			// Decode token payload (simplified)
			try {
				const payload = JSON.parse(atob(token.split('.')[1]));
				user = { user: { role: payload.role || 'user', matricule: payload.matricule || '' } };
			} catch {
				user = null;
			}
		}
	});

	async function logout() {
		api.setToken(null);
		user = null;
		goto('/login');
	}

	const menuItems = [
		{ path: '/', label: 'Accueil', icon: '🏠', roles: ['admin', 'user'] },
		{ path: '/vote', label: 'Voter', icon: '🗳️', roles: ['user'] },
		{ path: '/results', label: 'Résultats', icon: '📊', roles: ['admin', 'user'] },
		{ path: '/admin', label: 'Administration', icon: '⚙️', roles: ['admin'] },
	];
</script>

<svelte:head>
	<title>Système de Vote Électronique</title>
	<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
</svelte:head>

{#if currentPath === '/login'}
	{@render children()}
{:else}
	<div class="app-container" class:sidebar-collapsed={!sidebarOpen}>
		<aside class="sidebar" class:collapsed={!sidebarOpen}>
			<div class="sidebar-header">
				<div class="logo">
					<span class="logo-icon">🗳️</span>
					{#if sidebarOpen}
						<span class="logo-text">Vote Électronique</span>
					{/if}
				</div>
				<button class="toggle-btn" onclick={() => sidebarOpen = !sidebarOpen}>
					{sidebarOpen ? '◀' : '▶'}
				</button>
			</div>

			<nav class="nav-menu">
				{#each menuItems as item}
					{#if item.roles.includes(user?.user?.role || 'user')}
						<a href={item.path} class="nav-item" class:active={currentPath === item.path}>
							<span class="nav-icon">{item.icon}</span>
							{#if sidebarOpen}
								<span class="nav-label">{item.label}</span>
							{/if}
						</a>
					{/if}
				{/each}
			</nav>

			<div class="sidebar-footer">
				{#if user}
					<div class="user-info">
						<span class="user-role">{user.user.role}</span>
						{#if sidebarOpen}
							<span class="user-matricule">{user.user.matricule}</span>
						{/if}
					</div>
					<button class="logout-btn" onclick={logout}>
						<span>🚪</span>
						{#if sidebarOpen}
							<span>Déconnexion</span>
						{/if}
					</button>
				{/if}
			</div>
		</aside>

		<main class="main-content">
			{@render children()}
		</main>
	</div>
{/if}

<style>
	:global(*) {
		margin: 0;
		padding: 0;
		box-sizing: border-box;
	}

	:global(body) {
		font-family: 'Inter', sans-serif;
		background-color: #f5f7fa;
		color: #1a1a2e;
		line-height: 1.6;
	}

	.app-container {
		display: flex;
		min-height: 100vh;
	}

	.sidebar {
		width: 260px;
		background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
		color: #fff;
		display: flex;
		flex-direction: column;
		transition: width 0.3s ease;
		position: fixed;
		height: 100vh;
		z-index: 100;
	}

	.sidebar.collapsed {
		width: 70px;
	}

	.sidebar-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 20px 15px;
		border-bottom: 1px solid rgba(255,255,255,0.1);
	}

	.logo {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.logo-icon {
		font-size: 28px;
	}

	.logo-text {
		font-size: 16px;
		font-weight: 700;
		white-space: nowrap;
	}

	.toggle-btn {
		background: rgba(255,255,255,0.1);
		border: none;
		color: #fff;
		padding: 8px;
		border-radius: 8px;
		cursor: pointer;
		transition: background 0.2s;
	}

	.toggle-btn:hover {
		background: rgba(255,255,255,0.2);
	}

	.nav-menu {
		flex: 1;
		padding: 20px 10px;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.nav-item {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 12px 15px;
		border-radius: 10px;
		color: rgba(255,255,255,0.7);
		text-decoration: none;
		transition: all 0.2s;
	}

	.nav-item:hover {
		background: rgba(255,255,255,0.1);
		color: #fff;
	}

	.nav-item.active {
		background: #e94560;
		color: #fff;
	}

	.nav-icon {
		font-size: 20px;
		width: 24px;
		text-align: center;
	}

	.nav-label {
		font-size: 14px;
		font-weight: 500;
		white-space: nowrap;
	}

	.sidebar-footer {
		padding: 20px;
		border-top: 1px solid rgba(255,255,255,0.1);
	}

	.user-info {
		margin-bottom: 15px;
	}

	.user-role {
		display: inline-block;
		background: #e94560;
		padding: 4px 10px;
		border-radius: 20px;
		font-size: 12px;
		font-weight: 600;
		text-transform: uppercase;
	}

	.user-matricule {
		display: block;
		margin-top: 8px;
		font-size: 12px;
		color: rgba(255,255,255,0.6);
	}

	.logout-btn {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		padding: 10px;
		background: rgba(255,255,255,0.1);
		border: none;
		border-radius: 8px;
		color: #fff;
		cursor: pointer;
		transition: background 0.2s;
	}

	.logout-btn:hover {
		background: #e94560;
	}

	.main-content {
		flex: 1;
		margin-left: 260px;
		padding: 30px;
		transition: margin-left 0.3s ease;
		min-height: 100vh;
	}

	.sidebar-collapsed .main-content {
		margin-left: 70px;
	}

	@media (max-width: 768px) {
		.sidebar {
			width: 70px;
		}

		.main-content {
			margin-left: 70px;
		}
	}
</style>
