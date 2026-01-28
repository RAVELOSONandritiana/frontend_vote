<script lang="ts">
	import { api } from "$lib/api";
	import { goto } from "$app/navigation";
	import { onMount } from "svelte";
	import "../../app.css";

	let matricule = $state("");
	let password = $state("");
	let error = $state("");
	let loading = $state(false);

	async function handleLogin(e: Event) {
		e.preventDefault();
		if (!matricule || !password) {
			error = "Veuillez remplir tous les champs";
			return;
		}

		loading = true;
		error = "";

		// Mocked login for now
		setTimeout(() => {
			loading = false;
			api.setToken("MOCK-TOKEN");
			goto("/");
		}, 1000);

		/*
		try {
			const response = await api.login(matricule, password);
			const rawResponse = response as any;
			if (rawResponse.token) {
				api.setToken(rawResponse.token);
				goto('/');
			} else {
				goto('/');
			}
		} catch (err: any) {
			error = err.message || 'Identifiants invalides';
		} finally {
			loading = false;
		}
		*/
	}

	onMount(() => {
		if (api.getToken()) {
			goto("/");
		}
	});
</script>

```
<div
	class="min-h-screen flex items-center justify-center bg-[#0f172a] relative overflow-hidden p-6 font-inter"
>
	<!-- Background Decor -->
	<div
		class="absolute w-[400px] h-[400px] bg-rose-500/10 rounded-full blur-[100px] -top-20 -right-20"
	></div>
	<div
		class="absolute w-[300px] h-[300px] bg-indigo-500/10 rounded-full blur-[100px] -bottom-10 -left-10"
	></div>

	<div
		class="w-full max-w-md bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-10 shadow-2xl z-10"
	>
		<div class="text-center mb-10">
			<div class="text-6xl mb-4 animate-bounce duration-1000">🗳️</div>
			<h1 class="text-3xl font-black text-white tracking-tight mb-2">
				Authentification
			</h1>
			<p class="text-slate-400 font-medium">
				Connectez-vous pour accéder au système de vote
			</p>
		</div>

		<form onsubmit={handleLogin} class="space-y-6">
			<div class="space-y-2">
				<label
					for="matricule"
					class="text-sm font-bold text-slate-300 ml-1"
					>Matricule</label
				>
				<input
					type="text"
					id="matricule"
					bind:value={matricule}
					placeholder="Ex: M12345"
					class="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder:text-slate-600 outline-none focus:border-rose-500 focus:bg-white/10 transition-all font-medium"
					required
				/>
			</div>

			<div class="space-y-2">
				<label
					for="password"
					class="text-sm font-bold text-slate-300 ml-1"
					>Mot de passe</label
				>
				<input
					type="password"
					id="password"
					bind:value={password}
					placeholder="••••••••"
					class="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder:text-slate-600 outline-none focus:border-rose-500 focus:bg-white/10 transition-all font-medium"
					required
				/>
			</div>

			{#if error}
				<div
					class="bg-red-500/10 border-l-4 border-red-500 p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-left-4"
				>
					<span class="text-red-400">⚠️</span>
					<p class="text-red-200 text-sm font-bold">{error}</p>
				</div>
			{/if}

			<button
				type="submit"
				disabled={loading}
				class="w-full bg-rose-500 hover:bg-rose-600 active:scale-95 disabled:opacity-70 disabled:active:scale-100 p-4 rounded-2xl text-white font-black shadow-lg shadow-rose-500/20 transition-all flex items-center justify-center gap-3 tracking-widest uppercase text-sm"
			>
				{#if loading}
					<div
						class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"
					></div>
					Connexion...
				{:else}
					Se connecter
				{/if}
			</button>
		</form>

		<div class="mt-12 text-center">
			<p
				class="text-[10px] font-black uppercase tracking-widest text-slate-500"
			>
				&copy; 2026 Système de Vote Électronique.<br />Propulsé par la
				démocratie numérique.
			</p>
		</div>
	</div>
</div>
```

<style>
	/* Custom font Inter is used through global layout or direct link */
</style>
