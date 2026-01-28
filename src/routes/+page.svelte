<script lang="ts">
    import { api } from "$lib/api";
    import { onMount } from "svelte";
    import type { Election, Tour } from "$lib/types";
    import { goto } from "$app/navigation";

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
        {
            id: "3",
            name: "Référendum Constitutionnel",
            createdAt: "2025-11-20T08:30:00Z",
            finish: true,
        },
    ]);
    let tours = $state<Tour[]>([
        {
            id: "101",
            id_election: "1",
            finish: false,
            debut: "2026-02-01T08:00:00Z",
            fin: "2026-02-01T18:00:00Z",
        },
    ]);
    let loading = $state(false);
    let error = $state("");

    onMount(async () => {
        // Mocked
    });

    const stats = $derived([
        {
            label: "Scrutins Actifs",
            value: elections.filter((e) => !e.finish).length,
            icon: "💠",
            trend: "+2 ce mois",
            color: "from-blue-500 to-indigo-600",
        },
        {
            label: "Tours en cours",
            value: tours.filter((t) => !t.finish).length,
            icon: "⏳",
            trend: "1 se termine aujourd'hui",
            color: "from-rose-500 to-accent",
        },
        {
            label: "Participation",
            value: "84.2%",
            icon: "📈",
            trend: "+5% vs 2025",
            color: "from-emerald-500 to-teal-600",
        },
        {
            label: "Candidats",
            value: "154",
            icon: "💎",
            trend: "Vérifiés",
            color: "from-amber-400 to-orange-500",
        },
    ]);
</script>

<div class="space-y-12 pb-20">
    <header class="relative">
        <div
            class="flex flex-col md:flex-row justify-between items-start md:items-end gap-6"
        >
            <div class="space-y-2">
                <span
                    class="text-accent font-black tracking-[0.3em] text-[10px] uppercase"
                    >Nexus Overview</span
                >
                <h1 class="text-3xl font-black font-outfit text-white">
                    Console de Contrôle
                </h1>
                <p class="text-slate-500 text-sm font-medium max-w-md">
                    Monitorez l'intégrité et la progression des scrutins.
                </p>
            </div>

            <div class="glass px-6 py-4 rounded-2xl flex items-center gap-4">
                <div
                    class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"
                ></div>
                <span
                    class="text-sm font-bold text-slate-300 uppercase tracking-widest"
                    >System Operational</span
                >
            </div>
        </div>
    </header>

    {#if loading}
        <div
            class="h-96 glass rounded-[2.5rem] flex flex-col items-center justify-center gap-6"
        >
            <div
                class="w-16 h-16 border-4 border-white/5 border-t-accent rounded-full animate-spin"
            ></div>
            <p
                class="text-slate-400 font-bold tracking-widest uppercase text-xs"
            >
                Syncing Neural Link...
            </p>
        </div>
    {:else if error}
        <div
            class="glass border-rose-500/20 p-12 rounded-[2.5rem] text-center space-y-6"
        >
            <div class="text-6xl text-rose-500">⚠</div>
            <h2 class="text-2xl font-bold text-white">Liaison Interrompue</h2>
            <p class="text-slate-400">{error}</p>
            <button
                onclick={() => window.location.reload()}
                class="accent-gradient px-8 py-3 rounded-xl font-bold text-white"
                >Reconnect</button
            >
        </div>
    {:else}
        <!-- Stats Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {#each stats as stat}
                <div
                    class="glass group p-8 rounded-[2rem] hover:bg-white/10 transition-all duration-500 relative overflow-hidden"
                >
                    <div
                        class="absolute -right-4 -top-4 w-24 h-24 bg-gradient-to-br {stat.color} opacity-10 blur-2xl group-hover:opacity-20 transition-opacity"
                    ></div>

                    <div class="flex flex-col gap-6 relative z-10">
                        <div
                            class="w-12 h-12 glass rounded-xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform duration-500"
                        >
                            {stat.icon}
                        </div>
                        <div>
                            <span
                                class="text-slate-500 text-xs font-black uppercase tracking-widest mb-1 block"
                                >{stat.label}</span
                            >
                            <div class="flex items-baseline gap-2">
                                <span
                                    class="text-4xl font-black text-white font-outfit"
                                    >{stat.value}</span
                                >
                            </div>
                            <span
                                class="text-[10px] text-accent font-bold mt-2 block"
                                >{stat.trend}</span
                            >
                        </div>
                    </div>
                </div>
            {/each}
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-12">
            <!-- Quick Actions -->
            <section class="lg:col-span-4 space-y-6">
                <h3
                    class="text-sm font-black text-slate-500 uppercase tracking-[0.3em] px-2"
                >
                    Access Portal
                </h3>
                <div class="grid gap-4">
                    <a
                        href="/vote"
                        class="glass-dark group p-6 rounded-3xl flex items-center justify-between hover:bg-accent/10 transition-all border-none"
                    >
                        <div class="flex items-center gap-5">
                            <div
                                class="w-14 h-14 glass rounded-2xl flex items-center justify-center text-3xl group-hover:rotate-6 transition-transform"
                            >
                                🗳️
                            </div>
                            <div>
                                <span
                                    class="text-white font-bold text-lg block italic"
                                    >Voter</span
                                >
                                <span class="text-slate-500 text-xs"
                                    >Ouvrir le portail citoyen</span
                                >
                            </div>
                        </div>
                        <span
                            class="text-slate-600 group-hover:text-accent transition-colors font-black"
                            >→</span
                        >
                    </a>
                    <a
                        href="/results"
                        class="glass-dark group p-6 rounded-3xl flex items-center justify-between hover:bg-blue-500/10 transition-all border-none"
                    >
                        <div class="flex items-center gap-5">
                            <div
                                class="w-14 h-14 glass rounded-2xl flex items-center justify-center text-3xl group-hover:rotate-6 transition-transform"
                            >
                                📊
                            </div>
                            <div>
                                <span
                                    class="text-white font-bold text-lg block italic"
                                    >Direct</span
                                >
                                <span class="text-slate-500 text-xs"
                                    >Node de résultats global</span
                                >
                            </div>
                        </div>
                        <span
                            class="text-slate-600 group-hover:text-blue-400 transition-colors font-black"
                            >→</span
                        >
                    </a>
                    <a
                        href="/admin"
                        class="glass-dark group p-6 rounded-3xl flex items-center justify-between hover:bg-emerald-500/10 transition-all border-none"
                    >
                        <div class="flex items-center gap-5">
                            <div
                                class="w-14 h-14 glass rounded-2xl flex items-center justify-center text-3xl group-hover:rotate-6 transition-transform"
                            >
                                🔐
                            </div>
                            <div>
                                <span
                                    class="text-white font-bold text-lg block italic"
                                    >Admin</span
                                >
                                <span class="text-slate-500 text-xs"
                                    >Configuration noyau</span
                                >
                            </div>
                        </div>
                        <span
                            class="text-slate-600 group-hover:text-emerald-400 transition-colors font-black"
                            >→</span
                        >
                    </a>
                </div>
            </section>

            <!-- Activity / Recent -->
            <section class="lg:col-span-8 flex flex-col gap-6">
                <div class="flex justify-between items-center px-2">
                    <h3
                        class="text-sm font-black text-slate-500 uppercase tracking-[0.3em]"
                    >
                        Scrutins Récents
                    </h3>
                    <button
                        class="text-[10px] text-accent font-black uppercase tracking-widest hover:underline cursor-pointer border-none bg-transparent"
                        >History Logs</button
                    >
                </div>

                <div class="glass rounded-[2.5rem] overflow-hidden flex-1">
                    <div class="p-4 space-y-1">
                        {#each elections.slice(0, 5) as election}
                            <div
                                class="flex items-center justify-between p-6 hover:bg-white/5 rounded-3xl transition-all group"
                            >
                                <div class="flex items-center gap-6">
                                    <div
                                        class="w-12 h-12 glass rounded-2xl flex items-center justify-center text-xl bg-slate-900 shadow-inner group-hover:scale-110 transition-transform"
                                    >
                                        🗳️
                                    </div>
                                    <div>
                                        <h4
                                            class="text-white font-bold text-lg leading-tight uppercase tracking-tight"
                                        >
                                            {election.name}
                                        </h4>
                                        <span
                                            class="text-[10px] text-slate-500 font-black tracking-widest"
                                            >DEPLOYED: {new Date(
                                                election.createdAt,
                                            ).toLocaleDateString()}</span
                                        >
                                    </div>
                                </div>
                                <div class="flex items-center gap-8">
                                    <div
                                        class="hidden sm:flex flex-col items-end"
                                    >
                                        <span
                                            class="text-xs font-bold text-white italic"
                                            >Signature Verified</span
                                        >
                                        <span
                                            class="text-[9px] text-slate-600 font-black tracking-widest uppercase"
                                            >SHA-256 Validated</span
                                        >
                                    </div>
                                    <span
                                        class="px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border
                                        {election.finish
                                            ? 'bg-white/5 text-slate-500 border-white/5'
                                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}"
                                    >
                                        {election.finish
                                            ? "Archivé"
                                            : "Broadcasting"}
                                    </span>
                                </div>
                            </div>
                        {/each}
                    </div>
                </div>
            </section>
        </div>
    {/if}
</div>

<style>
    /* Global Inter font is already imported in layout */
</style>
