<script lang="ts">
    import { api } from "$lib/api";
    import { onMount } from "svelte";
    import type { Election, Tour, Candidat, Town } from "$lib/types";

    let activeTab = $state("elections");
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
    let tours = $state<Tour[]>([
        {
            id: "101",
            id_election: "1",
            finish: false,
            debut: "2026-02-01T08:00:00Z",
            fin: "2026-02-01T18:00:00Z",
        },
    ]);
    let candidates = $state<Candidat[]>([
        {
            id: "501",
            number: 1,
            id_person: "123456789",
            id_election: "1",
            id_tour: "101",
            person: {
                CIN: "123456789",
                firstname: "Jean",
                lastname: "Dupont",
                birthday: "1980-01-01",
                birthplace: "Paris",
                address: "123 Rue de la Paix",
                email: "jean.dupont@example.com",
                phone: "0123456789",
            },
        },
    ]);
    let selectedElectionId = $state("");
    let selectedTourId = $state("");

    let newElectionName = $state("");
    let newTourStart = $state("");
    let newTourEnd = $state("");

    let newCandidatCin = $state("");

    let loading = $state(false);
    let message = $state({ text: "", type: "" });

    onMount(async () => {
        // Mocked
    });

    function showMsg(text: string, type: "success" | "error" = "success") {
        message = { text, type };
        setTimeout(() => (message = { text: "", type: "" }), 5000);
    }

    async function createElection() {
        if (!newElectionName) return;
        showMsg("Simulation: Scrutin initialisé");
        newElectionName = "";
    }

    async function finishElection(id: string) {
        if (!confirm("Sceller ce scrutin définitivement ?")) return;
        showMsg("Simulation: Scrutin scellé");
    }

    async function createTour() {
        if (!selectedElectionId || !newTourStart || !newTourEnd) return;
        showMsg("Simulation: Phase activée");
        newTourStart = "";
        newTourEnd = "";
    }

    async function finishTour(id: string) {
        if (!confirm("Clôturer cette phase ?")) return;
        showMsg("Simulation: Phase clôturée");
    }

    async function addCandidate() {
        if (!selectedTourId || !newCandidatCin || !selectedElectionId) return;
        showMsg("Simulation: Acteur enregistré");
        newCandidatCin = "";
    }

    async function randomize() {
        if (!selectedElectionId) return;
        showMsg("Simulation: Séquences réinitialisées");
    }
</script>

<div class="space-y-10 pb-20">
    <header class="relative">
        <div class="space-y-2">
            <span
                class="text-accent font-black tracking-[0.3em] text-[10px] uppercase"
                >Control Module</span
            >
            <h1 class="text-3xl font-black font-outfit text-white">
                Administration
            </h1>
            <p class="text-slate-500 text-sm font-medium max-w-2xl">
                Configuration du noyau électoral et gestion des registres
                sécurisés.
            </p>
        </div>
    </header>

    {#if message.text}
        <div
            class="glass border-accent/20 p-4 rounded-2xl font-bold text-center animate-in fade-in slide-in-from-top-4 duration-500
            {message.type === 'error' ? 'text-rose-400' : 'text-accent'}"
        >
            <span class="mr-2">⚡</span>
            {message.text}
        </div>
    {/if}

    <div
        class="glass rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl"
    >
        <nav class="flex bg-white/5 border-b border-white/5 p-2 gap-2">
            {#each ["elections", "tours", "candidates"] as tab}
                <button
                    class="flex-1 py-5 px-6 rounded-2xl font-black tracking-widest text-[10px] uppercase transition-all duration-500 flex items-center justify-center gap-3 border-none cursor-pointer
                    {activeTab === tab
                        ? 'bg-accent text-white shadow-lg shadow-accent/20'
                        : 'text-slate-500 hover:text-white hover:bg-white/5'}"
                    onclick={() => (activeTab = tab)}
                >
                    <span class="text-lg">
                        {tab === "elections"
                            ? "🗳️"
                            : tab === "tours"
                              ? "🔄"
                              : "👥"}
                    </span>
                    {tab}
                </button>
            {/each}
        </nav>

        <div class="p-10">
            {#if activeTab === "elections"}
                <section class="animate-in fade-in duration-700 space-y-12">
                    <div
                        class="glass-dark p-8 rounded-3xl border border-white/5 space-y-6"
                    >
                        <h3
                            class="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]"
                        >
                            Nouveau Scrutin
                        </h3>
                        <div class="flex flex-col sm:flex-row gap-4">
                            <input
                                type="text"
                                placeholder="Identifier (ex: Présidence 2026)"
                                class="flex-1 glass bg-white/5 border-none outline-none p-5 rounded-2xl transition-all font-bold text-white focus:ring-2 ring-accent/50"
                                bind:value={newElectionName}
                            />
                            <button
                                onclick={createElection}
                                class="accent-gradient text-white font-black px-10 py-5 rounded-2xl transition-all active:scale-95 border-none cursor-pointer uppercase tracking-widest text-[10px]"
                            >
                                Initialiser
                            </button>
                        </div>
                    </div>

                    <div class="space-y-4">
                        <h3
                            class="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] px-2"
                        >
                            Registres Actifs
                        </h3>
                        <div class="glass rounded-3xl overflow-hidden">
                            <table class="w-full text-left">
                                <thead>
                                    <tr
                                        class="bg-white/5 border-b border-white/5"
                                    >
                                        <th
                                            class="py-5 px-8 text-[9px] font-black text-slate-500 uppercase tracking-widest"
                                            >Désignation</th
                                        >
                                        <th
                                            class="py-5 px-8 text-[9px] font-black text-slate-500 uppercase tracking-widest"
                                            >Enregistrement</th
                                        >
                                        <th
                                            class="py-5 px-8 text-[9px] font-black text-slate-500 uppercase tracking-widest"
                                            >État</th
                                        >
                                        <th
                                            class="py-5 px-8 text-[9px] font-black text-slate-500 uppercase tracking-widest text-right"
                                            >Opérations</th
                                        >
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-white/5">
                                    {#each elections as election}
                                        <tr
                                            class="hover:bg-white/5 transition-colors group"
                                        >
                                            <td
                                                class="py-6 px-8 font-bold text-white italic"
                                                >{election.name}</td
                                            >
                                            <td
                                                class="py-6 px-8 text-slate-500 text-xs font-medium"
                                            >
                                                {new Date(
                                                    election.createdAt,
                                                ).toLocaleString()}
                                            </td>
                                            <td class="py-6 px-8">
                                                <span
                                                    class="px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border
                                                    {election.finish
                                                        ? 'bg-white/5 text-slate-600 border-white/5'
                                                        : 'bg-accent/10 text-accent border-accent/20'}"
                                                >
                                                    {election.finish
                                                        ? "Clôturé"
                                                        : "Actif"}
                                                </span>
                                            </td>
                                            <td class="py-6 px-8 text-right">
                                                {#if !election.finish}
                                                    <button
                                                        onclick={() =>
                                                            finishElection(
                                                                election.id,
                                                            )}
                                                        class="bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border-none cursor-pointer"
                                                    >
                                                        Sceller
                                                    </button>
                                                {/if}
                                            </td>
                                        </tr>
                                    {/each}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>
            {:else if activeTab === "tours"}
                <section class="animate-in fade-in duration-700 space-y-10">
                    <div
                        class="glass-dark p-8 rounded-3xl border border-white/5"
                    >
                        <label
                            class="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4 block"
                            >Sélection Scrutin</label
                        >
                        <select
                            bind:value={selectedElectionId}
                            class="w-full glass bg-slate-900 border-none outline-none p-5 rounded-2xl transition-all font-bold text-white appearance-none cursor-pointer"
                        >
                            <option value=""
                                >-- Sélectionner un registre --</option
                            >
                            {#each elections as e}
                                <option value={e.id}>{e.name}</option>
                            {/each}
                        </select>
                    </div>

                    {#if selectedElectionId}
                        <div
                            class="glass-dark p-8 rounded-3xl border border-white/5 flex flex-wrap gap-8 items-end"
                        >
                            <div class="flex-1 min-w-[240px] space-y-3">
                                <label
                                    class="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]"
                                    >Phase Start</label
                                >
                                <input
                                    type="datetime-local"
                                    class="w-full glass bg-white/5 border-none p-5 rounded-2xl text-white font-bold outline-none"
                                    bind:value={newTourStart}
                                />
                            </div>
                            <div class="flex-1 min-w-[240px] space-y-3">
                                <label
                                    class="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]"
                                    >Phase End</label
                                >
                                <input
                                    type="datetime-local"
                                    class="w-full glass bg-white/5 border-none p-5 rounded-2xl text-white font-bold outline-none"
                                    bind:value={newTourEnd}
                                />
                            </div>
                            <button
                                onclick={createTour}
                                class="accent-gradient text-white font-black px-10 py-5 rounded-2xl transition-all hover:scale-105 border-none cursor-pointer uppercase tracking-widest text-[10px]"
                            >
                                Configurer Phase
                            </button>
                        </div>

                        <div class="space-y-4">
                            <h3
                                class="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] px-2"
                            >
                                Phases Temporelles
                            </h3>
                            <div class="glass rounded-3xl overflow-hidden">
                                <table class="w-full text-left">
                                    <thead>
                                        <tr
                                            class="bg-white/5 border-b border-white/5"
                                        >
                                            <th
                                                class="py-5 px-8 text-[9px] font-black text-slate-500 uppercase tracking-widest"
                                                >Phase</th
                                            >
                                            <th
                                                class="py-5 px-8 text-[9px] font-black text-slate-500 uppercase tracking-widest"
                                                >Intervalle de Diffusion</th
                                            >
                                            <th
                                                class="py-5 px-8 text-[9px] font-black text-slate-500 uppercase tracking-widest"
                                                >État</th
                                            >
                                            <th
                                                class="py-5 px-8 text-[9px] font-black text-slate-500 uppercase tracking-widest text-right"
                                                >Actions</th
                                            >
                                        </tr>
                                    </thead>
                                    <tbody class="divide-y divide-white/5">
                                        {#each tours as tour, i}
                                            <tr
                                                class="hover:bg-white/5 transition-colors"
                                            >
                                                <td
                                                    class="py-6 px-8 font-black text-white text-lg font-outfit"
                                                    >#0{i + 1}</td
                                                >
                                                <td class="py-6 px-8">
                                                    <div
                                                        class="flex flex-col gap-1"
                                                    >
                                                        <span
                                                            class="text-[10px] text-emerald-400 font-black tracking-widest uppercase"
                                                            >FROM: {new Date(
                                                                tour.debut,
                                                            ).toLocaleString()}</span
                                                        >
                                                        <span
                                                            class="text-[10px] text-rose-400 font-black tracking-widest uppercase"
                                                            >TILL: {new Date(
                                                                tour.fin,
                                                            ).toLocaleString()}</span
                                                        >
                                                    </div>
                                                </td>
                                                <td class="py-6 px-8">
                                                    <span
                                                        class="px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border
                                                        {tour.finish
                                                            ? 'bg-white/5 text-slate-600 border-white/5'
                                                            : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}"
                                                    >
                                                        {tour.finish
                                                            ? "Off"
                                                            : "Live"}
                                                    </span>
                                                </td>
                                                <td
                                                    class="py-6 px-8 text-right"
                                                >
                                                    {#if !tour.finish}
                                                        <button
                                                            onclick={() =>
                                                                finishTour(
                                                                    tour.id,
                                                                )}
                                                            class="glass-dark text-white hover:bg-rose-500 px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border-none cursor-pointer"
                                                        >
                                                            Terminate
                                                        </button>
                                                    {/if}
                                                </td>
                                            </tr>
                                        {/each}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    {/if}
                </section>
            {:else if activeTab === "candidates"}
                <section class="animate-in fade-in duration-700 space-y-10">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div
                            class="glass-dark p-8 rounded-3xl border border-white/5 space-y-4"
                        >
                            <label
                                class="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]"
                                >Domaine</label
                            >
                            <select
                                bind:value={selectedElectionId}
                                class="w-full glass bg-slate-900 border-none p-5 rounded-2xl text-white font-bold outline-none cursor-pointer"
                            >
                                <option value="">Action requise...</option>
                                {#each elections as e}
                                    <option value={e.id}>{e.name}</option>
                                {/each}
                            </select>
                        </div>
                        <div
                            class="glass-dark p-8 rounded-3xl border border-white/5 space-y-4"
                        >
                            <label
                                class="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]"
                                >Séquence</label
                            >
                            <select
                                bind:value={selectedTourId}
                                class="w-full glass bg-slate-900 border-none p-5 rounded-2xl text-white font-bold outline-none cursor-pointer"
                            >
                                <option value="">Action requise...</option>
                                {#each tours as t, i}
                                    <option value={t.id}>Phase #0{i + 1}</option
                                    >
                                {/each}
                            </select>
                        </div>
                    </div>

                    {#if selectedTourId}
                        <div
                            class="flex flex-col lg:flex-row gap-8 items-stretch"
                        >
                            <div
                                class="flex-1 glass-dark p-8 rounded-3xl border border-white/5 space-y-6"
                            >
                                <h3
                                    class="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]"
                                >
                                    Enregistrement Candidat
                                </h3>
                                <div class="flex gap-4">
                                    <input
                                        type="text"
                                        placeholder="Hash CIN / Matricule"
                                        class="flex-1 glass bg-white/5 border-none p-5 rounded-2xl text-white font-bold outline-none"
                                        bind:value={newCandidatCin}
                                    />
                                    <button
                                        onclick={addCandidate}
                                        class="accent-gradient text-white font-black px-8 py-5 rounded-2xl border-none cursor-pointer uppercase tracking-widest text-[10px]"
                                        >Inscrire</button
                                    >
                                </div>
                            </div>
                            <button
                                onclick={randomize}
                                class="glass group px-10 rounded-3xl hover:bg-accent/10 transition-all flex items-center gap-4 justify-center border-none cursor-pointer"
                            >
                                <span
                                    class="text-2xl group-hover:rotate-180 transition-transform duration-700"
                                    >🔀</span
                                >
                                <span
                                    class="text-[10px] font-black uppercase tracking-widest text-white"
                                    >Shuffle IDs</span
                                >
                            </button>
                        </div>

                        <div
                            class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        >
                            {#each candidates as c}
                                <div
                                    class="glass group p-6 rounded-[2rem] border border-white/5 hover:bg-white/5 transition-all relative overflow-hidden"
                                >
                                    <div
                                        class="flex items-center gap-6 relative z-10"
                                    >
                                        <div
                                            class="w-16 h-16 accent-gradient rounded-2xl flex items-center justify-center text-3xl font-black text-white shadow-xl rotate-3 group-hover:rotate-12 transition-transform capitalize"
                                        >
                                            {c.number}
                                        </div>
                                        <div class="flex-1 min-w-0">
                                            <h4
                                                class="font-black text-white text-xl truncate font-outfit uppercase tracking-tight"
                                            >
                                                {c.person?.firstname}
                                                {c.person?.lastname}
                                            </h4>
                                            <span
                                                class="text-accent text-[10px] font-black tracking-[0.2em]"
                                                >NODE: {c.id_person}</span
                                            >
                                        </div>
                                    </div>
                                    <div
                                        class="mt-6 flex justify-between items-center opacity-40 group-hover:opacity-100 transition-opacity"
                                    >
                                        <span
                                            class="text-[9px] font-bold text-slate-500 uppercase"
                                            >Status: Verified</span
                                        >
                                        <button
                                            class="text-rose-500 hover:text-white hover:bg-rose-500 px-3 py-1 rounded-lg text-[9px] font-black uppercase border-none cursor-pointer transition-all"
                                            >Revoke</button
                                        >
                                    </div>
                                </div>
                            {/each}
                        </div>
                    {/if}
                </section>
            {/if}
        </div>
    </div>
</div>

<style>
    /* Styling focuses more on utility classes */
    :global(body) {
        background-color: #0d0d0d;
        background-image: radial-gradient(at 0% 0%, #1a1a1a 0%, transparent 50%),
            radial-gradient(at 100% 0%, #1a1a1a 0%, transparent 50%),
            radial-gradient(at 50% 100%, #1a1a1a 0%, transparent 50%);
        min-height: 100vh;
        font-family: "Inter", sans-serif;
    }

    .glass {
        background-color: rgba(255, 255, 255, 0.03);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.05);
    }

    .glass-dark {
        background-color: rgba(0, 0, 0, 0.2);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.05);
    }

    .accent-gradient {
        background: linear-gradient(45deg, #ff007a, #ff4d4d);
    }

    .text-accent {
        color: #ff007a;
    }

    /* Custom font for titles */
    @import url("https://fonts.googleapis.com/css2?family=Outfit:wght@900&display=swap");
    .font-outfit {
        font-family: "Outfit", sans-serif;
    }

    /* Hide datetime-local default icon */
    input[type="datetime-local"]::-webkit-calendar-picker-indicator {
        filter: invert(1); /* Makes the icon white */
        opacity: 0.8;
        cursor: pointer;
    }
    input[type="datetime-local"]::-webkit-inner-spin-button,
    input[type="datetime-local"]::-webkit-outer-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }
    input[type="datetime-local"] {
        color-scheme: dark; /* For consistent dark theme calendar */
    }
</style>
