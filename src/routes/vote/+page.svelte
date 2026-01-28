<script lang="ts">
    import { api } from "$lib/api";
    import { onMount } from "svelte";
    import type { Election, Tour, Candidat, Town } from "$lib/types";
    import { goto } from "$app/navigation";

    let step = $state(1); // 1: Election, 2: Candidates (Town auto-selected), 3: Success
    let elections = $state<Election[]>([
        {
            id: 1,
            name: "Élection Présidentielle 2026",
            createdAt: "2026-01-01T10:00:00Z",
            finish: false,
        },
    ]);
    let selectedElection = $state<Election | null>(null);
    let tours = $state<Tour[]>([
        {
            id: 101,
            name: "Premier Tour",
            electionId: 1,
            finish: false,
            debut: "2026-02-01T08:00:00Z",
            fin: "2026-02-01T18:00:00Z",
        },
    ]);
    let selectedTour = $state<Tour | null>(null);

    // Context automatically retrieved from Admin Login
    let adminContext = $state<{ town: Town }>({
        town: { id: 1, name: "Antananarivo" }, // Mocked context
    });

    let candidates = $state<Candidat[]>([
        {
            id: 501,
            number: 1,
            id_person: "123",
            person: { firstname: "Jean", lastname: "Dupont" },
        },
        {
            id: 502,
            number: 2,
            id_person: "456",
            person: { firstname: "Marie", lastname: "Curie" },
        },
        {
            id: 503,
            number: 3,
            id_person: "789",
            person: { firstname: "Albert", lastname: "Einstein" },
        },
    ]);
    let loading = $state(false);
    let error = $state("");
    let voting = $state(false);

    onMount(async () => {
        // Mocked
    });

    async function selectElection(election: Election) {
        selectedElection = election;
        selectedTour = tours[0];
        // Skip Town Selection -> Go straight to candidates using auto-context
        step = 2;
    }

    async function castVote(candidate: Candidat) {
        if (!selectedTour || !adminContext.town) return;

        if (
            !confirm(
                `Voulez-vous vraiment voter pour le candidat n°${candidate.number} ?`,
            )
        )
            return;

        voting = true;
        // Simulation delayed vote
        setTimeout(() => {
            voting = false;
            step = 3;
        }, 1500);
    }
</script>

<div class="max-w-5xl mx-auto space-y-8 pb-20">
    <header class="flex items-center justify-between glass p-6 rounded-2xl">
        <div class="space-y-1">
            <h1
                class="text-2xl font-black text-white tracking-tight flex items-center gap-3"
            >
                <span class="text-accent">●</span> Espace de Vote
            </h1>
            <p
                class="text-slate-400 text-xs font-medium uppercase tracking-widest pl-6"
            >
                Bureau: <span class="text-white">{adminContext.town.name}</span>
            </p>
        </div>

        {#if step < 3}
            <div
                class="flex items-center gap-2 bg-black/20 p-2 rounded-xl border border-white/5"
            >
                <div
                    class="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all
                    {step === 1
                        ? 'bg-accent text-white shadow-lg shadow-accent/20'
                        : 'text-slate-500'}"
                >
                    1. Scrutin
                </div>
                <div class="w-4 h-px bg-white/10"></div>
                <div
                    class="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all
                    {step === 2
                        ? 'bg-accent text-white shadow-lg shadow-accent/20'
                        : 'text-slate-500'}"
                >
                    2. Candidat
                </div>
            </div>
        {/if}
    </header>

    {#if error}
        <div
            class="glass border-rose-500/20 p-4 rounded-xl flex items-center gap-4 text-rose-400 font-bold animate-in fade-in slide-in-from-top-2"
        >
            <span class="text-lg">⚠️</span>
            <p class="text-sm">{error}</p>
        </div>
    {/if}

    <main class="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {#if step === 1}
            <section class="space-y-6">
                <h2
                    class="text-sm font-black text-slate-500 uppercase tracking-[0.3em] px-2 text-center"
                >
                    Confirmez le Scrutin
                </h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {#each elections as election}
                        <button
                            class="card-premium group text-left relative overflow-hidden active:scale-[0.98] cursor-pointer"
                            onclick={() => selectElection(election)}
                        >
                            <div class="relative z-10 flex items-center gap-5">
                                <div
                                    class="w-12 h-12 glass rounded-xl flex items-center justify-center text-xl bg-accent/10 text-accent group-hover:bg-accent group-hover:text-white transition-colors duration-300"
                                >
                                    🗳️
                                </div>
                                <div>
                                    <h3
                                        class="text-lg font-black text-white group-hover:text-accent transition-colors"
                                    >
                                        {election.name}
                                    </h3>
                                    <span
                                        class="text-[10px] font-bold text-slate-500 uppercase tracking-widest"
                                    >
                                        SESSION {new Date(
                                            election.createdAt,
                                        ).getFullYear()}
                                    </span>
                                </div>
                                <div
                                    class="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-accent font-black text-xl"
                                >
                                    →
                                </div>
                            </div>
                        </button>
                    {/each}
                </div>
            </section>
        {:else if step === 2}
            <section class="space-y-6">
                <div class="flex items-center justify-between px-2">
                    <button
                        class="text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-widest transition-colors flex items-center gap-2"
                        onclick={() => (step = 1)}
                    >
                        ← Changer de scrutin
                    </button>
                    <span
                        class="text-[10px] font-black text-accent uppercase tracking-widest animate-pulse"
                    >
                        SESSION SÉCURISÉE
                    </span>
                </div>

                <div
                    class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
                >
                    {#each candidates as candidate}
                        <button
                            class="card-premium group text-center relative overflow-hidden active:scale-[0.98] cursor-pointer p-0 bg-transparent"
                            onclick={() => castVote(candidate)}
                            disabled={voting}
                        >
                            <div
                                class="glass p-6 rounded-2xl bg-black/20 hover:bg-white/5 transition-colors border border-white/5 hover:border-accent/30 h-full flex flex-col items-center"
                            >
                                <div
                                    class="absolute top-4 left-4 bg-black/40 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10"
                                >
                                    <span class="text-xs font-black text-white"
                                        >#{candidate.number}</span
                                    >
                                </div>

                                <div
                                    class="w-20 h-20 rounded-full bg-slate-800 border-2 border-white/10 group-hover:border-accent/50 mb-4 overflow-hidden transition-all duration-300 shadow-xl"
                                >
                                    {#if candidate.person?.image}
                                        <img
                                            src={candidate.person.image}
                                            alt=""
                                            class="w-full h-full object-cover"
                                        />
                                    {:else}
                                        <div
                                            class="w-full h-full flex items-center justify-center text-2xl"
                                        >
                                            👤
                                        </div>
                                    {/if}
                                </div>

                                <h3
                                    class="text-base font-bold text-white mb-1 group-hover:text-accent transition-colors"
                                >
                                    {candidate.person?.firstname}
                                    {candidate.person?.lastname}
                                </h3>

                                <div class="mt-auto pt-4 w-full">
                                    <div
                                        class="w-full py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all
                                        {voting
                                            ? 'bg-slate-800 text-slate-500'
                                            : 'bg-accent text-white shadow-lg shadow-accent/20 group-hover:scale-105'}"
                                    >
                                        {voting ? "..." : "Voter"}
                                    </div>
                                </div>
                            </div>
                        </button>
                    {/each}
                </div>
            </section>
        {:else if step === 3}
            <section
                class="flex flex-col items-center justify-center py-10 animate-in zoom-in-95 duration-500"
            >
                <div
                    class="glass p-10 rounded-[2rem] text-center max-w-sm w-full border border-emerald-500/20 shadow-2xl shadow-emerald-900/20 relative overflow-hidden"
                >
                    <div
                        class="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent pointer-events-none"
                    ></div>

                    <div
                        class="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center text-3xl mb-6 mx-auto border border-emerald-500/20"
                    >
                        ✓
                    </div>

                    <h2 class="text-2xl font-black text-white mb-2 font-outfit">
                        Vote Confirmé
                    </h2>
                    <p class="text-slate-400 text-xs leading-relaxed mb-8">
                        Votre voix a été chiffrée et enregistrée dans le nœud
                        local de
                        <span class="text-emerald-400 font-bold"
                            >{adminContext.town.name}</span
                        >.
                    </p>

                    <button
                        class="w-full py-3 bg-white/5 hover:bg-white/10 text-white font-black rounded-xl transition-all border border-white/10 active:scale-95 uppercase tracking-widest text-[10px]"
                        onclick={() => goto("/")}
                    >
                        Terminer la session
                    </button>
                </div>
            </section>
        {/if}
    </main>
</div>
