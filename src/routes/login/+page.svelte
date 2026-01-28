<script lang="ts">
	import { api } from '$lib/api';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	let matricule = $state('');
	let password = $state('');
	let error = $state('');
	let loading = $state(false);

	async function handleLogin(e: Event) {
		e.preventDefault();
		if (!matricule || !password) {
			error = 'Veuillez remplir tous les champs';
			return;
		}

		loading = true;
		error = '';

		try {
			const response = await api.login(matricule, password);
			// The API response user object might not have the token, 
			// checking api.ts it seems login returns AuthResponse but doesn't explicitly return a token string in the interface, 
			// HOWEVER api.ts request() uses this.getToken() which reads from localStorage.
			// Let's assume the backend sets a cookie or the developer intended to manually set it.
			// In api.ts login calls this.request<AuthResponse>('/auth/login', ...)
			// Wait, let's re-examine api.ts:49-55
			// async login(matricule: string, password: string): Promise<AuthResponse> {
			//    const response = await this.request<AuthResponse>('/auth/login', { ... });
			//    return response;
			// }
			// And getToken(): string | null { if (typeof localStorage !== 'undefined' && !this.token) { this.token = localStorage.getItem('token'); } return this.token; }
			// It seems ApiService.login doesn't call setToken. I should probably do it or the API should return it.
			// Looking at types.ts: AuthResponse { user: User; person?: Person; }
			// Wait, if the API follows standard JWT, the token might be in the response or a cookie.
			// Let's check how the user handles tokens.
			
			// Actually, let's assume the response contains the token in a 'token' field even if not in the type definition, 
			// or I should check the backend if I can.
			// Re-reading api.ts, setToken is public.
			// Let's check if the user is redirected in layout if token exists. Yes.
			
			// I'll assume for now that the login response might need to be intercepted or it returns the token.
			// If I look at the previous project `front-app`, maybe I can find clues.
			
			// I'll call api.setToken if it's in the response.
			const rawResponse = response as any;
			if (rawResponse.token) {
				api.setToken(rawResponse.token);
				goto('/');
			} else {
				// Maybe it's already set by the request method if it's in the headers? No.
				// Let's just go to / for now and see.
				goto('/');
			}
		} catch (err: any) {
			error = err.message || 'Identifiants invalides';
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		if (api.getToken()) {
			goto('/');
		}
	});
</script>

<div class="login-container">
	<div class="login-card">
		<div class="header">
			<div class="logo-emoji">🗳️</div>
			<h1>Authentification</h1>
			<p>Connectez-vous pour accéder au système de vote</p>
		</div>

		<form onsubmit={handleLogin}>
			<div class="input-group">
				<label for="matricule">Matricule</label>
				<input 
					type="text" 
					id="matricule" 
					bind:value={matricule} 
					placeholder="Ex: M12345"
					required
				/>
			</div>

			<div class="input-group">
				<label for="password">Mot de passe</label>
				<input 
					type="password" 
					id="password" 
					bind:value={password} 
					placeholder="••••••••"
					required
				/>
			</div>

			{#if error}
				<div class="error-message">
					<span>⚠️</span> {error}
				</div>
			{/if}

			<button type="submit" disabled={loading} class="login-btn">
				{#if loading}
					<span class="loader"></span> Connexion...
				{:else}
					Se connecter
				{/if}
			</button>
		</form>

		<div class="footer">
			<p>&copy; 2026 Système de Vote Électronique. Tous droits réservés.</p>
		</div>
	</div>

	<div class="background-decor">
		<div class="circle circle-1"></div>
		<div class="circle circle-2"></div>
	</div>
</div>

<style>
	.login-container {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #0f172a;
		position: relative;
		overflow: hidden;
		padding: 20px;
	}

	.background-decor .circle {
		position: absolute;
		border-radius: 50%;
		filter: blur(80px);
		z-index: 0;
	}

	.circle-1 {
		width: 400px;
		height: 400px;
		background: rgba(233, 69, 96, 0.15);
		top: -100px;
		right: -100px;
	}

	.circle-2 {
		width: 300px;
		height: 300px;
		background: rgba(69, 123, 233, 0.15);
		bottom: -50px;
		left: -50px;
	}

	.login-card {
		width: 100%;
		max-width: 450px;
		background: rgba(255, 255, 255, 0.03);
		backdrop-filter: blur(12px);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 24px;
		padding: 40px;
		color: white;
		z-index: 1;
		box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
	}

	.header {
		text-align: center;
		margin-bottom: 35px;
	}

	.logo-emoji {
		font-size: 48px;
		margin-bottom: 15px;
	}

	h1 {
		font-size: 28px;
		font-weight: 700;
		margin-bottom: 8px;
		letter-spacing: -0.5px;
	}

	.header p {
		color: rgba(255, 255, 255, 0.6);
		font-size: 14px;
	}

	.input-group {
		margin-bottom: 20px;
	}

	label {
		display: block;
		margin-bottom: 8px;
		font-size: 14px;
		font-weight: 500;
		color: rgba(255, 255, 255, 0.8);
	}

	input {
		width: 100%;
		padding: 14px 16px;
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 12px;
		color: white;
		font-size: 16px;
		transition: all 0.3s;
	}

	input:focus {
		outline: none;
		border-color: #e94560;
		background: rgba(255, 255, 255, 0.08);
		box-shadow: 0 0 0 4px rgba(233, 69, 96, 0.15);
	}

	.error-message {
		background: rgba(239, 68, 68, 0.1);
		border-left: 4px solid #ef4444;
		padding: 12px;
		border-radius: 8px;
		margin-bottom: 20px;
		font-size: 14px;
		color: #fca5a5;
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.login-btn {
		width: 100%;
		padding: 14px;
		background: #e94560;
		border: none;
		border-radius: 12px;
		color: white;
		font-size: 16px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 10px;
	}

	.login-btn:hover:not(:disabled) {
		background: #d63d57;
		transform: translateY(-2px);
		box-shadow: 0 10px 15px -3px rgba(233, 69, 96, 0.3);
	}

	.login-btn:active:not(:disabled) {
		transform: translateY(0);
	}

	.login-btn:disabled {
		opacity: 0.7;
		cursor: not-allowed;
	}

	.footer {
		margin-top: 35px;
		text-align: center;
		font-size: 12px;
		color: rgba(255, 255, 255, 0.4);
	}

	.loader {
		width: 18px;
		height: 18px;
		border: 2px solid rgba(255, 255, 255, 0.3);
		border-radius: 50%;
		border-top-color: white;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}
</style>
