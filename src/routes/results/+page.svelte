<script lang="ts">
    import { api } from "$lib/api";
    import { onMount, tick } from "svelte";
    import type { Election, Tour, GlobalResult, StatResult } from "$lib/types";
    import Chart from "chart.js/auto";

    let elections = $state<Election[]>([
        {
            id: "1",
            name: "Élection Présidentielle 2026",
            createdAt: "2026-01-01T10:00:00Z",
            finish: false,
        },
        {
            id: "2",
            name: "Élection Législatives",
            createdAt: "2025-12-15T09:00:00Z",
            finish: true,
        },
    ]);
    let selectedElectionId = $state("1");
    let tours = $state<Tour[]>([
        {
            id: "101",
            id_election: "1",
            finish: true,
            debut: "2026-02-01T08:00:00Z",
            fin: "2026-02-01T18:00:00Z",
        },
    ]);
    let selectedTourId = $state("101");
    let globalResults = $state<GlobalResult[]>([
        {
            candidatId: 501,
            candidatName: "Jean Dupont",
            totalVotes: 450,
            percentage: 45,
        },
        {
            candidatId: 502,
            candidatName: "Marie Curie",
            totalVotes: 350,
            percentage: 35,
        },
        {
            candidatId: 503,
            candidatName: "Albert Einstein",
            totalVotes: 200,
            percentage: 20,
        },
    ]);
    let townStats = $state<StatResult[]>([
        {
            townId: 1,
            townName: "Antananarivo",
            totalElectors: 1000,
            votedElectors: 850,
            percentage: 85,
        },
        {
            townId: 2,
            townName: "Toamasina",
            totalElectors: 800,
            votedElectors: 600,
            percentage: 75,
        },
        {
            townId: 3,
            townName: "Antsirabe",
            totalElectors: 600,
            votedElectors: 550,
            percentage: 91.6,
        },
    ]);
    let loading = $state(false);
    let error = $state("");

    let chartCanvas = $state<HTMLCanvasElement | null>(null);
    let chart: Chart | null = null;

    onMount(async () => {
        await tick();
        renderChart();
    });

    async function handleElectionChange() {
        loading = true;
        // Mocked
        loading = false;
    }

    async function fetchResults() {
        if (!selectedTourId) return;
        loading = true;
        // Mocked
        await tick();
        renderChart();
        loading = false;
    }

    function renderChart() {
        if (!chartCanvas) return;
        if (chart) chart.destroy();

        const ctx = chartCanvas.getContext("2d");
        if (!ctx) return;

        // Create Gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, "#10b981"); // Emerald
        gradient.addColorStop(1, "#6366f1"); // Indigo/Blue hint

        chart = new Chart(ctx, {
            type: "bar",
            data: {
                labels: globalResults.map((r) => r.candidatName),
                datasets: [
                    {
                        label: "Nombre de voix",
                        data: globalResults.map((r) => r.totalVotes),
                        backgroundColor: gradient,
                        hoverBackgroundColor: "#059669",
                        borderRadius: 20,
                        barThickness: 40,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 2000,
                    easing: "easeOutQuart",
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: "rgba(15, 23, 42, 0.9)",
                        titleFont: {
                            family: "Outfit",
                            size: 14,
                            weight: "bold",
                        },
                        bodyFont: { family: "Inter", size: 13 },
                        padding: 16,
                        cornerRadius: 16,
                        borderColor: "rgba(255,255,255,0.1)",
                        borderWidth: 1,
                        displayColors: false,
                    },
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: "rgba(255, 255, 255, 0.05)" },
                        border: { display: false },
                        ticks: {
                            color: "rgba(255, 255, 255, 0.4)",
                            font: { size: 10, weight: "bold" },
                        },
                    },
                    x: {
                        grid: { display: false },
                        border: { display: false },
                        ticks: {
                            color: "rgba(255, 255, 255, 0.8)",
                            font: {
                                family: "Outfit",
                                size: 11,
                                weight: "bold",
                            },
                        },
                    },
                },
            },
        });
    }
</script>

<div class="space-y-12 pb-20">
    <header class="relative">
        <div
            class="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8"
        >
            <div class="space-y-3">
                <span
                    class="text-accent font-black tracking-[0.4em] text-[10px] uppercase"
                    >Data Stream</span
                >
                <h1 class="text-3xl font-black font-outfit text-white">
                    Analyse des Scrutins
                </h1>
                <p class="text-slate-500 text-sm font-medium max-w-xl">
                    Visualisation en temps réel de l'intégrité démographique et
                    des flux électoraux.
                </p>
            </div>

            <div class="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                <div
                    class="glass-dark p-4 rounded-3xl space-y-2 flex-1 sm:min-w-[240px]"
                >
                    <label
                        class="text-[9px] font-black text-slate-600 uppercase tracking-widest block ml-2"
                        >Registre</label
                    >
                    <select
                        bind:value={selectedElectionId}
                        onchange={handleElectionChange}
                        class="w-full bg-transparent border-none outline-none font-bold text-white cursor-pointer px-2"
                    >
                        {#each elections as e}
                            <option value={e.id}>{e.name}</option>
                        {/each}
                    </select>
                </div>
                <div
                    class="glass-dark p-4 rounded-3xl space-y-2 flex-1 sm:min-w-[200px]"
                >
                    <label
                        class="text-[9px] font-black text-slate-600 uppercase tracking-widest block ml-2"
                        >Phase</label
                    >
                    <select
                        bind:value={selectedTourId}
                        onchange={fetchResults}
                        class="w-full bg-transparent border-none outline-none font-bold text-white cursor-pointer px-2"
                    >
                        {#each tours as t, i}
                            <option value={t.id}
                                >Phase #0{i + 1} ({t.finish
                                    ? "Archivé"
                                    : "Ouvert"})</option
                            >
                        {/each}
                    </select>
                </div>
            </div>
        </div>
    </header>

    {#if loading}
        <div
            class="h-96 glass rounded-[3rem] flex flex-col items-center justify-center gap-6"
        >
            <div
                class="w-16 h-16 border-4 border-white/5 border-t-accent rounded-full animate-spin"
            ></div>
            <p
                class="text-slate-600 font-black tracking-[0.3em] uppercase text-[10px]"
            >
                Processing Node Data...
            </p>
        </div>
    {:else if globalResults.length === 0}
        <div class="glass p-20 rounded-[3rem] text-center space-y-6">
            <span class="text-6xl text-slate-800">📡</span>
            <h2 class="text-2xl font-bold text-white">Aucune Transmission</h2>
            <p class="text-slate-500 font-medium">
                Le flux de données pour cette phase n'est pas encore initialisé.
            </p>
        </div>
    {:else}
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <!-- Global Stats Canvas -->
            <section class="lg:col-span-8 space-y-6">
                <div class="flex justify-between items-center px-4">
                    <h3
                        class="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em]"
                    >
                        Flux des votes
                    </h3>
                    <div class="flex gap-2">
                        <div class="w-2 h-2 rounded-full bg-accent"></div>
                        <div
                            class="w-2 h-2 rounded-full bg-indigo-500 opacity-30"
                        ></div>
                    </div>
                </div>
                <div
                    class="glass p-10 rounded-[3rem] h-[500px] relative overflow-hidden"
                >
                    <div
                        class="absolute inset-0 bg-gradient-to-b from-accent/5 to-transparent opacity-30 pointer-events-none"
                    ></div>
                    <canvas bind:this={chartCanvas}></canvas>
                </div>
            </section>

            <!-- Leaderboard -->
            <section class="lg:col-span-4 space-y-6">
                <h3
                    class="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] px-4"
                >
                    Performance
                </h3>
                <div class="grid gap-4">
                    {#each globalResults as result, i}
                        <div
                            class="glass-dark group p-6 rounded-[2rem] hover:bg-white/[0.05] transition-all duration-500 relative overflow-hidden"
                        >
                            <div
                                class="absolute -right-4 -top-4 w-20 h-20 {i ===
                                0
                                    ? 'bg-accent'
                                    : 'bg-slate-500'} opacity-5 blur-2xl group-hover:opacity-10 transition-opacity"
                            ></div>

                            <div
                                class="flex justify-between items-start relative z-10"
                            >
                                <div class="space-y-1">
                                    <h4
                                        class="text-white font-bold text-lg uppercase tracking-tight italic"
                                    >
                                        {result.candidatName}
                                    </h4>
                                    <span
                                        class="text-[10px] text-slate-500 font-black tracking-widest"
                                        >{result.totalVotes.toLocaleString()} VOIX</span
                                    >
                                </div>
                                <span
                                    class="text-2xl font-black font-outfit text-white"
                                    >{result.percentage.toFixed(1)}%</span
                                >
                            </div>

                            <div
                                class="mt-6 h-1.5 w-full bg-white/5 rounded-full overflow-hidden"
                            >
                                <div
                                    class="h-full {i === 0
                                        ? 'bg-accent'
                                        : 'bg-slate-700'} rounded-full transition-all duration-1000 delay-300"
                                    style="width: {result.percentage}%"
                                ></div>
                            </div>
                        </div>
                    {/each}
                </div>
            </section>

            <!-- Regional Data Table -->
            <section class="lg:col-span-12 space-y-6">
                <div class="flex justify-between items-center px-4">
                    <h3
                        class="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em]"
                    >
                        Engagement Régional
                    </h3>
                    <span
                        class="text-[10px] text-accent tracking-widest font-bold uppercase"
                        >Hash Verified</span
                    >
                </div>
                <div class="glass rounded-[3rem] overflow-hidden">
                    <div class="overflow-x-auto p-4">
                        <table class="w-full text-left">
                            <thead>
                                <tr class="border-b border-white/5">
                                    <th
                                        class="py-6 px-10 text-[9px] font-black text-slate-600 uppercase tracking-widest"
                                        >Localisation</th
                                    >
                                    <th
                                        class="py-6 px-10 text-[9px] font-black text-slate-600 uppercase tracking-widest"
                                        >Base Électorale</th
                                    >
                                    <th
                                        class="py-6 px-10 text-[9px] font-black text-slate-600 uppercase tracking-widest"
                                        >Flux Actif</th
                                    >
                                    <th
                                        class="py-6 px-10 text-[9px] font-black text-slate-600 uppercase tracking-widest text-right"
                                        >Engagement</th
                                    >
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-white/5">
                                {#each townStats as stat}
                                    <tr
                                        class="hover:bg-white/[0.02] transition-colors group"
                                    >
                                        <td
                                            class="py-8 px-10 text-xl font-black text-white font-outfit uppercase tracking-tighter"
                                            >{stat.townName}</td
                                        >
                                        <td
                                            class="py-8 px-10 text-slate-500 font-bold"
                                            >{stat.totalElectors.toLocaleString()}</td
                                        >
                                        <td
                                            class="py-8 px-10 text-white font-bold"
                                            >{stat.votedElectors.toLocaleString()}</td
                                        >
                                        <td class="py-8 px-10">
                                            <div
                                                class="flex items-center justify-end gap-6 font-outfit"
                                            >
                                                <span
                                                    class="text-2xl font-black text-white min-w-[80px] text-right"
                                                    >{stat.percentage.toFixed(
                                                        1,
                                                    )}%</span
                                                >
                                                <div
                                                    class="w-48 h-2 bg-white/5 rounded-full overflow-hidden hidden sm:block"
                                                >
                                                    <div
                                                        class="h-full bg-accent rounded-full group-hover:bg-emerald-400 transition-colors duration-500"
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
                </div>
            </section>
        </div>
    {/if}
</div>

<style>
    :global(option) {
        background-color: #0b1120;
        color: white;
    }
</style>
