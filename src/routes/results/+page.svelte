<script lang="ts">
    import { api } from "$lib/api";
    import { onMount, tick } from "svelte";
    import type { Election, Tour, GlobalResult, StatResult } from "$lib/types";
    import Chart from "chart.js/auto";

    let elections = $state<Election[]>([]);
    let selectedElectionId = $state("");
    let tours = $state<Tour[]>([]);
    let selectedTourId = $state("");
    let globalResults = $state<GlobalResult[]>([]);
    let townStats = $state<StatResult[]>([]);
    let loading = $state(false);
    let error = $state("");

    let chartCanvas = $state<HTMLCanvasElement | null>(null);
    let chart: Chart | null = null;

    onMount(async () => {
        try {
            elections = await api.getElections();
            if (elections.length > 0) {
                selectedElectionId = elections[0].id;
                await handleElectionChange();
            }
        } catch (err) {
            error = "Erreur lors du chargement des élections.";
        }
    });

    async function handleElectionChange() {
        loading = true;
        try {
            tours = await api.getTours(selectedElectionId);
            if (tours.length > 0) {
                selectedTourId = tours[0].id;
                await fetchResults();
            } else {
                selectedTourId = "";
                globalResults = [];
                townStats = [];
            }
        } catch (err) {
            error = "Erreur lors du chargement des tours.";
        } finally {
            loading = false;
        }
    }

    async function fetchResults() {
        if (!selectedTourId) return;
        loading = true;
        try {
            const [gRes, tRes] = await Promise.all([
                api.getGlobalResult(selectedTourId),
                api.getStatAllTowns(selectedTourId),
            ]);
            globalResults = gRes;
            townStats = tRes;

            await tick();
            renderChart();
        } catch (err) {
            error = "Erreur lors du chargement des résultats.";
        } finally {
            loading = false;
        }
    }

    function renderChart() {
        if (!chartCanvas) return;
        if (chart) chart.destroy();

        const ctx = chartCanvas.getContext("2d");
        if (!ctx) return;

        chart = new Chart(ctx, {
            type: "bar",
            data: {
                labels: globalResults.map((r) => r.candidatName),
                datasets: [
                    {
                        label: "Nombre de voix",
                        data: globalResults.map((r) => r.totalVotes),
                        backgroundColor: [
                            "#e94560",
                            "#4f46e5",
                            "#10b981",
                            "#f59e0b",
                            "#8b5cf6",
                            "#3b82f6",
                        ],
                        borderRadius: 8,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                },
                scales: {
                    y: { beginAtZero: true },
                },
            },
        });
    }
</script>

<div class="results-page">
    <header class="page-header">
        <h1>📊 Résultats des Élections</h1>
        <div class="filters">
            <div class="filter-group">
                <label for="election">Élection</label>
                <select
                    id="election"
                    bind:value={selectedElectionId}
                    onchange={handleElectionChange}
                >
                    {#each elections as e}
                        <option value={e.id}>{e.name}</option>
                    {/each}
                </select>
            </div>
            <div class="filter-group">
                <label for="tour">Tour</label>
                <select
                    id="tour"
                    bind:value={selectedTourId}
                    onchange={fetchResults}
                >
                    {#each tours as t, i}
                        <option value={t.id}
                            >Tour {i + 1} ({t.finish
                                ? "Terminé"
                                : "En cours"})</option
                        >
                    {/each}
                </select>
            </div>
        </div>
    </header>

    {#if loading}
        <div class="loading-state"><div class="spinner"></div></div>
    {:else if globalResults.length === 0}
        <div class="empty-state">
            <span class="icon">🔍</span>
            <p>Aucun résultat disponible pour ce tour.</p>
        </div>
    {:else}
        <div class="results-grid">
            <section class="chart-section card">
                <h2>Répartition des voix</h2>
                <div class="chart-container">
                    <canvas bind:this={chartCanvas}></canvas>
                </div>
            </section>

            <section class="summary-section">
                <div class="stats-cards">
                    {#each globalResults as result}
                        <div class="result-summary-card">
                            <div class="candidat-info">
                                <span class="name">{result.candidatName}</span>
                                <span class="percentage"
                                    >{result.percentage.toFixed(2)}%</span
                                >
                            </div>
                            <div class="progress-bar">
                                <div
                                    class="fill"
                                    style="width: {result.percentage}%"
                                ></div>
                            </div>
                            <span class="votes"
                                >{result.totalVotes.toLocaleString()} voix</span
                            >
                        </div>
                    {/each}
                </div>
            </section>

            <section class="town-stats-section card">
                <h2>Participation par ville</h2>
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Ville</th>
                                <th>Électeurs</th>
                                <th>Votants</th>
                                <th>Participation</th>
                            </tr>
                        </thead>
                        <tbody>
                            {#each townStats as stat}
                                <tr>
                                    <td><strong>{stat.townName}</strong></td>
                                    <td
                                        >{stat.totalElectors.toLocaleString()}</td
                                    >
                                    <td
                                        >{stat.votedElectors.toLocaleString()}</td
                                    >
                                    <td>
                                        <div class="participation-cell">
                                            <span class="perc"
                                                >{stat.percentage.toFixed(
                                                    1,
                                                )}%</span
                                            >
                                            <div class="mini-bar">
                                                <div
                                                    class="mini-fill"
                                                    style="width: {stat.percentage}%"
                                                ></div>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    {/if}
</div>

<style>
    .results-page {
        max-width: 1200px;
        margin: 0 auto;
    }

    .page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 30px;
        flex-wrap: wrap;
        gap: 20px;
    }

    .filters {
        display: flex;
        gap: 20px;
    }

    .filter-group {
        display: flex;
        flex-direction: column;
        gap: 5px;
    }

    label {
        font-size: 12px;
        font-weight: 600;
        color: #64748b;
        text-transform: uppercase;
    }

    select {
        padding: 10px 15px;
        border-radius: 10px;
        border: 1px solid #e2e8f0;
        background: #fff;
        font-weight: 500;
        min-width: 200px;
    }

    .results-grid {
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: 25px;
    }

    .card {
        background: #fff;
        border-radius: 20px;
        padding: 25px;
        border: 1px solid #e2e8f0;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }

    h2 {
        font-size: 18px;
        margin-bottom: 25px;
        color: #1a1a2e;
    }

    .chart-container {
        height: 350px;
        position: relative;
    }

    .stats-cards {
        display: flex;
        flex-direction: column;
        gap: 15px;
    }

    .result-summary-card {
        background: #fff;
        padding: 20px;
        border-radius: 16px;
        border: 1px solid #e2e8f0;
    }

    .candidat-info {
        display: flex;
        justify-content: space-between;
        margin-bottom: 10px;
    }

    .name {
        font-weight: 700;
        color: #1a1a2e;
    }

    .percentage {
        font-weight: 800;
        color: #e94560;
    }

    .progress-bar {
        height: 8px;
        background: #f1f5f9;
        border-radius: 4px;
        margin-bottom: 10px;
        overflow: hidden;
    }

    .fill {
        height: 100%;
        background: #e94560;
        border-radius: 4px;
    }

    .votes {
        font-size: 12px;
        color: #64748b;
    }

    .town-stats-section {
        grid-column: span 2;
    }

    .table-container {
        overflow-x: auto;
    }

    table {
        width: 100%;
        border-collapse: collapse;
    }

    th {
        text-align: left;
        padding: 12px;
        font-size: 13px;
        color: #64748b;
        border-bottom: 1px solid #f1f5f9;
    }

    td {
        padding: 15px 12px;
        border-bottom: 1px solid #f1f5f9;
    }

    .participation-cell {
        display: flex;
        align-items: center;
        gap: 12px;
    }

    .perc {
        font-weight: 600;
        min-width: 45px;
    }

    .mini-bar {
        flex: 1;
        height: 6px;
        background: #f1f5f9;
        border-radius: 3px;
        max-width: 100px;
        overflow: hidden;
    }

    .mini-fill {
        height: 100%;
        background: #10b981;
    }

    .loading-state,
    .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 100px;
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
    }

    .icon {
        font-size: 48px;
        margin-bottom: 10px;
    }

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }

    @media (max-width: 1024px) {
        .results-grid {
            grid-template-columns: 1fr;
        }
        .town-stats-section {
            grid-column: span 1;
        }
    }
</style>
