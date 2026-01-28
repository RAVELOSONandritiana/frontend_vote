<script lang="ts">
    import { api } from "$lib/api";
    import { onMount } from "svelte";
    import type { Election, Tour } from "$lib/types";
    import { goto } from "$app/navigation";

    let elections = $state<Election[]>([]);
    let tours = $state<Tour[]>([]);
    let loading = $state(true);
    let error = $state("");

    onMount(async () => {
        if (!api.getToken()) {
            goto("/login");
            return;
        }

        try {
            const [eData, tData] = await Promise.all([
                api.getElections(),
                api.getTours(),
            ]);
            elections = eData;
            tours = tData;
        } catch (err: any) {
            error = "Impossible de charger les données du tableau de bord";
            console.error(err);
        } finally {
            loading = false;
        }
    });

    const stats = $derived([
        {
            label: "Élections",
            value: elections.length,
            icon: "🗳️",
            color: "#4f46e5",
        },
        {
            label: "Tours en cours",
            value: tours.filter((t) => !t.finish).length,
            icon: "🔄",
            color: "#e94560",
        },
        {
            label: "Élections terminées",
            value: elections.filter((e) => e.finish).length,
            icon: "✅",
            color: "#10b981",
        },
        {
            label: "Candidats total",
            value: "...",
            icon: "👥",
            color: "#f59e0b",
        },
    ]);
</script>

<div class="dashboard">
    <header class="page-header">
        <div>
            <h1>Tableau de bord</h1>
            <p>Bienvenue sur le système de vote électronique sécurisé.</p>
        </div>
        <div class="date-badge">
            {new Date().toLocaleDateString("fr-FR", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
            })}
        </div>
    </header>

    {#if loading}
        <div class="loading-state">
            <div class="spinner"></div>
            <p>Chargement de vos données...</p>
        </div>
    {:else if error}
        <div class="error-card">
            <span>⚠️</span>
            <p>{error}</p>
            <button onclick={() => window.location.reload()}>Réessayer</button>
        </div>
    {:else}
        <div class="stats-grid">
            {#each stats as stat}
                <div class="stat-card" style="--accent-color: {stat.color}">
                    <div class="stat-icon">{stat.icon}</div>
                    <div class="stat-info">
                        <span class="stat-label">{stat.label}</span>
                        <span class="stat-value">{stat.value}</span>
                    </div>
                </div>
            {/each}
        </div>

        <div class="content-sections">
            <section class="quick-actions card">
                <h2>Actions Rapides</h2>
                <div class="actions-grid">
                    <a href="/vote" class="action-btn">
                        <span class="icon">🗳️</span>
                        <div class="text">
                            <strong>Voter maintenant</strong>
                            <span>Accéder aux scrutins ouverts</span>
                        </div>
                    </a>
                    <a href="/results" class="action-btn">
                        <span class="icon">📊</span>
                        <div class="text">
                            <strong>Voir les résultats</strong>
                            <span>Statistiques en temps réel</span>
                        </div>
                    </a>
                    <a href="/admin" class="action-btn">
                        <span class="icon">⚙️</span>
                        <div class="text">
                            <strong>Administration</strong>
                            <span>Gérer les élections</span>
                        </div>
                    </a>
                </div>
            </section>

            <section class="recent-elections card">
                <div class="section-header">
                    <h2>Élections Récentes</h2>
                    <a href="/admin" class="view-all">Gérer tout</a>
                </div>
                <div class="election-list">
                    {#if elections.length === 0}
                        <p class="empty-state">
                            Aucune élection enregistrée pour le moment.
                        </p>
                    {:else}
                        {#each elections.slice(0, 5) as election}
                            <div class="election-item">
                                <div class="election-icon">🗳️</div>
                                <div class="election-details">
                                    <strong>{election.name}</strong>
                                    <span
                                        >Créée le {new Date(
                                            election.createdAt,
                                        ).toLocaleDateString()}</span
                                    >
                                </div>
                                <span
                                    class="status-badge"
                                    class:finished={election.finish}
                                >
                                    {election.finish ? "Terminée" : "Active"}
                                </span>
                            </div>
                        {/each}
                    {/if}
                </div>
            </section>
        </div>
    {/if}
</div>

<style>
    .dashboard {
        max-width: 1200px;
        margin: 0 auto;
    }

    .page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 30px;
    }

    h1 {
        font-size: 28px;
        font-weight: 700;
        color: #1a1a2e;
        margin-bottom: 5px;
    }

    .page-header p {
        color: #64748b;
    }

    .date-badge {
        background: #fff;
        padding: 8px 16px;
        border-radius: 12px;
        font-size: 14px;
        font-weight: 500;
        color: #1a1a2e;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        border: 1px solid #e2e8f0;
    }

    .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        gap: 20px;
        margin-bottom: 40px;
    }

    .stat-card {
        background: #fff;
        padding: 24px;
        border-radius: 20px;
        display: flex;
        align-items: center;
        gap: 20px;
        border: 1px solid #e2e8f0;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        transition: transform 0.3s ease;
    }

    .stat-card:hover {
        transform: translateY(-5px);
    }

    .stat-icon {
        width: 56px;
        height: 56px;
        background: var(--accent-color);
        border-radius: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        color: #fff;
        opacity: 0.9;
    }

    .stat-info {
        display: flex;
        flex-direction: column;
    }

    .stat-label {
        font-size: 14px;
        color: #64748b;
        margin-bottom: 4px;
    }

    .stat-value {
        font-size: 24px;
        font-weight: 700;
        color: #1a1a2e;
    }

    .content-sections {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 30px;
    }

    .card {
        background: #fff;
        padding: 24px;
        border-radius: 20px;
        border: 1px solid #e2e8f0;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }

    h2 {
        font-size: 18px;
        margin-bottom: 20px;
        color: #1a1a2e;
    }

    .actions-grid {
        display: flex;
        flex-direction: column;
        gap: 15px;
    }

    .action-btn {
        display: flex;
        align-items: center;
        gap: 15px;
        padding: 15px;
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        text-decoration: none;
        color: #1a1a2e;
        transition: all 0.2s;
    }

    .action-btn:hover {
        background: #f1f5f9;
        border-color: #cbd5e1;
        transform: scale(1.02);
    }

    .action-btn .icon {
        font-size: 24px;
    }

    .action-btn .text {
        display: flex;
        flex-direction: column;
    }

    .text span {
        font-size: 12px;
        color: #64748b;
    }

    .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
    }

    .view-all {
        font-size: 14px;
        color: #e94560;
        text-decoration: none;
        font-weight: 600;
    }

    .election-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .election-item {
        display: flex;
        align-items: center;
        gap: 15px;
        padding: 12px;
        border-bottom: 1px solid #f1f5f9;
    }

    .election-item:last-child {
        border-bottom: none;
    }

    .election-icon {
        font-size: 20px;
        opacity: 0.6;
    }

    .election-details {
        flex: 1;
        display: flex;
        flex-direction: column;
    }

    .election-details span {
        font-size: 12px;
        color: #64748b;
    }

    .status-badge {
        padding: 4px 10px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
        background: #dcfce7;
        color: #166534;
    }

    .status-badge.finished {
        background: #f1f5f9;
        color: #64748b;
    }

    .loading-state,
    .error-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 60px;
        background: #fff;
        border-radius: 20px;
        border: 1px solid #e2e8f0;
    }

    .spinner {
        width: 40px;
        height: 40px;
        border: 4px solid #f1f5f9;
        border-top-color: #e94560;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-bottom: 20px;
    }

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }

    @media (max-width: 1024px) {
        .content-sections {
            grid-template-columns: 1fr;
        }
    }
</style>
