<script lang="ts">
    import { api } from "$lib/api";
    import { onMount } from "svelte";
    import type { Election, Tour, Candidat, Town } from "$lib/types";
    import { goto } from "$app/navigation";

    let step = $state(1); // 1: Election, 2: Town, 3: Candidates, 4: Success
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
    let towns = $state<Town[]>([
        { id: 1, name: "Antananarivo" },
        { id: 2, name: "Toamasina" },
        { id: 3, name: "Antsirabe" },
        { id: 4, name: "Fianarantsoa" },
    ]);
    let selectedTown = $state<Town | null>(null);
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
        step = 2;
    }

    async function selectTown(town: Town) {
        selectedTown = town;
        step = 3;
    }

    async function castVote(candidate: Candidat) {
        if (!selectedTour || !selectedTown) return;

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
            step = 4;
        }, 1500);
    }
</script>

<div class="max-w-4xl mx-auto space-y-12 pb-20">
    <header class="text-center space-y-6">
        <h1 class="text-4xl font-black text-slate-900 tracking-tight">
            🗳️ Espace de Vote
        </h1>

        <div
            class="flex items-center justify-center max-w-lg mx-auto relative px-4"
        >
            <div
                class="absolute h-1 bg-slate-100 left-8 right-8 top-5 -z-0"
            ></div>

            {#each [1, 2, 3] as s}
                <div
                    class="flex-1 flex flex-col items-center gap-2 relative z-10 transition-all duration-500"
                >
                    <div
                        class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-4 transition-all duration-500
                        {step === s
                            ? 'bg-rose-500 text-white border-rose-100 scale-125'
                            : step > s
                              ? 'bg-emerald-500 text-white border-emerald-100'
                              : 'bg-slate-100 text-slate-400 border-white'}"
                    >
                        {step > s ? "✓" : s}
                    </div>
                    <span
                        class="text-[10px] font-black uppercase tracking-widest
                        {step >= s ? 'text-rose-500' : 'text-slate-400'}"
                    >
                        {s === 1 ? "Élection" : s === 2 ? "Bureau" : "Candidat"}
                    </span>
                </div>
            {/each}
        </div>
    </header>

    {#if error}
        <div
            class="bg-red-50 border-2 border-red-100 text-red-600 p-4 rounded-2xl flex items-center justify-between font-bold animate-in fade-in slide-in-from-top-4"
        >
            <div class="flex items-center gap-3">
                <span class="text-xl">⚠️</span>
                <p>{error}</p>
            </div>
            {#if step > 1}
                <button
                    onclick={() => step--}
                    class="bg-white px-4 py-1.5 rounded-xl border border-red-200 text-sm hover:bg-red-100 transition-colors"
                >
                    Retour
                </button>
            {/if}
        </div>
    {/if}

    <main class="animate-in fade-in slide-in-from-bottom-8 duration-700">
        {#if step === 1}
            <section class="space-y-8">
                <h2 class="text-2xl font-bold text-slate-900 text-center">
                    Sélectionnez une élection
                </h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {#each elections as election}
                        <button
                            class="group bg-white border-2 border-slate-100 p-8 rounded-[2rem] text-center transition-all hover:border-rose-500 hover:shadow-2xl hover:shadow-rose-100 active:scale-95 flex flex-col items-center"
                            onclick={() => selectElection(election)}
                        >
                            <div
                                class="text-5xl mb-6 grayscale group-hover:grayscale-0 transition-all group-hover:scale-110 duration-300"
                            >
                                🗳️
                            </div>
                            <h3 class="text-xl font-black text-slate-900 mb-2">
                                {election.name}
                            </h3>
                            <span
                                class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 px-4 py-1 bg-slate-50 rounded-full"
                            >
                                Ouverte le {new Date(
                                    election.createdAt,
                                ).toLocaleDateString()}
                            </span>
                            <div
                                class="text-rose-500 font-black text-sm uppercase tracking-wider group-hover:translate-x-2 transition-transform"
                            >
                                Sélectionner →
                            </div>
                        </button>
                    {/each}
                </div>
            </section>
        {:else if step === 2}
            <section class="space-y-8">
                <div class="flex justify-between items-center">
                    <button
                        class="text-slate-400 hover:text-rose-500 font-bold flex items-center gap-2 transition-colors uppercase text-xs tracking-widest"
                        onclick={() => (step = 1)}
                    >
                        ← Retour
                    </button>
                    <h2 class="text-2xl font-black text-slate-900">
                        Enregistrez votre bureau
                    </h2>
                </div>

                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {#each towns as town}
                        <button
                            class="bg-white border-2 border-slate-100 p-6 rounded-3xl text-center transition-all hover:border-rose-500 hover:bg-rose-50 group active:scale-95"
                            onclick={() => selectTown(town)}
                        >
                            <div
                                class="text-3xl mb-3 grayscale group-hover:grayscale-0 transition-all"
                            >
                                🏙️
                            </div>
                            <h3
                                class="font-black text-slate-800 group-hover:text-rose-600 transition-colors truncate"
                            >
                                {town.name}
                            </h3>
                        </button>
                    {/each}
                </div>
            </section>
        {:else if step === 3}
            <section class="space-y-10">
                <div
                    class="flex flex-col md:flex-row justify-between items-center gap-4 border-b border-slate-100 pb-8"
                >
                    <div class="flex flex-col items-center md:items-start">
                        <button
                            class="text-slate-400 hover:text-rose-500 font-bold flex items-center gap-2 transition-colors uppercase text-xs tracking-widest mb-2"
                            onclick={() => (step = 2)}
                        >
                            ← Retour au bureau
                        </button>
                        <h2 class="text-3xl font-black text-slate-900">
                            Faites votre choix
                        </h2>
                        <p class="text-slate-500 font-medium">
                            Cliquez sur le candidat pour confirmer votre
                            suffrage.
                        </p>
                    </div>
                    <div
                        class="bg-indigo-50 px-6 py-3 rounded-2xl border border-indigo-100"
                    >
                        <span
                            class="text-[10px] font-black text-indigo-400 uppercase tracking-widest block mb-0.5 text-center"
                            >Bureau</span
                        >
                        <span class="font-black text-indigo-700"
                            >{selectedTown?.name}</span
                        >
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {#each candidates as candidate}
                        <button
                            class="bg-white border-2 border-slate-100 rounded-[2.5rem] p-8 text-center relative overflow-hidden group transition-all hover:border-rose-500 hover:shadow-2xl hover:shadow-rose-100 active:scale-95"
                            onclick={() => castVote(candidate)}
                            disabled={voting}
                        >
                            <div
                                class="absolute top-6 left-6 bg-slate-900 text-white w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xl shadow-lg shadow-slate-200"
                            >
                                #{candidate.number}
                            </div>

                            <div
                                class="w-32 h-32 rounded-full bg-slate-50 mx-auto mb-6 flex items-center justify-center text-5xl border-4 border-white shadow-inner overflow-hidden group-hover:scale-110 transition-transform duration-500"
                            >
                                {#if candidate.person?.image}
                                    <img
                                        src={candidate.person.image}
                                        alt=""
                                        class="w-full h-full object-cover"
                                    />
                                {:else}
                                    👤
                                {/if}
                            </div>

                            <h3
                                class="text-2xl font-black text-slate-900 mb-6 group-hover:text-rose-600 transition-colors"
                            >
                                {candidate.person?.firstname.split(" ")[0]}<br
                                />
                                <span
                                    class="text-rose-500 group-hover:text-slate-900 transition-colors capitalize"
                                    >{candidate.person?.lastname}</span
                                >
                            </h3>

                            <div
                                class="bg-rose-500 text-white font-black py-4 rounded-2xl shadow-lg shadow-rose-200 uppercase tracking-widest text-sm
                                {voting
                                    ? 'opacity-50 cursor-not-allowed'
                                    : 'group-hover:bg-slate-900 group-hover:shadow-slate-200 transition-all'}"
                            >
                                {voting
                                    ? "Traitement..."
                                    : "Voter pour ce candidat"}
                            </div>
                        </button>
                    {/each}
                </div>
            </section>
        {:else if step === 4}
            <section
                class="flex flex-col items-center justify-center py-20 animate-in zoom-in-95 duration-700"
            >
                <div
                    class="bg-white p-12 md:p-16 rounded-[4rem] text-center max-w-xl w-full border border-slate-100 shadow-2xl relative"
                >
                    <div
                        class="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 bg-emerald-500 text-white rounded-[2rem] flex items-center justify-center text-5xl shadow-2xl shadow-emerald-100 animate-bounce"
                    >
                        ✓
                    </div>

                    <h2
                        class="text-4xl font-black text-slate-900 mb-4 mt-4 tracking-tight"
                    >
                        Vote enregistré !
                    </h2>
                    <p class="text-slate-500 text-lg leading-relaxed mb-10">
                        Votre suffrage a été sécurisé avec succès. Merci d'avoir
                        exercé votre droit de vote dans ce scrutin électronique.
                    </p>

                    <button
                        class="w-full py-5 bg-slate-900 hover:bg-rose-500 text-white font-black rounded-3xl transition-all shadow-xl shadow-slate-100 active:scale-95 uppercase tracking-widest text-sm"
                        onclick={() => goto("/")}
                    >
                        Quitter l'isoloir sécurisé
                    </button>
                </div>
            </section>
        {/if}
    </main>
</div>

<style>
    /* Premium UI transitions and animations */
</style>
