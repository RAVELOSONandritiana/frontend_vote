<script lang="ts">
    import { api } from "$lib/api";
    import { onMount } from "svelte";
    import type { Election, Tour, Candidat, Town } from "$lib/types";
    import { goto } from "$app/navigation";

    let step = $state(1); // 1: Election, 2: Town, 3: Candidates, 4: Success
    let elections = $state<Election[]>([]);
    let selectedElection = $state<Election | null>(null);
    let tours = $state<Tour[]>([]);
    let selectedTour = $state<Tour | null>(null);
    let towns = $state<Town[]>([]);
    let selectedTown = $state<Town | null>(null);
    let candidates = $state<Candidat[]>([]);
    let loading = $state(true);
    let error = $state("");
    let voting = $state(false);

    onMount(async () => {
        try {
            elections = await api.getAvailableElections();
            towns = await api.getTowns();
        } catch (err) {
            error = "Erreur lors du chargement des élections.";
        } finally {
            loading = false;
        }
    });

    async function selectElection(election: Election) {
        selectedElection = election;
        loading = true;
        error = "";
        try {
            const eTours = await api.getTours(election.id);
            tours = eTours.filter((t) => !t.finish);
            if (tours.length === 0) {
                error = "Aucun tour ouvert pour cette élection.";
            } else {
                selectedTour = tours[0]; // Take the first open tour by default
                step = 2;
            }
        } catch (err) {
            error = "Erreur lors du chargement des tours.";
        } finally {
            loading = false;
        }
    }

    async function selectTown(town: Town) {
        selectedTown = town;
        loading = true;
        try {
            if (selectedTour) {
                candidates = await api.getCandidatsInTour(selectedTour.id);
                step = 3;
            }
        } catch (err) {
            error = "Erreur lors du chargement des candidats.";
        } finally {
            loading = false;
        }
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
        error = "";
        try {
            // Cast the vote. Note: candidatId in API is number, while candidate.id is string in types?
            // Let's check types.ts: candidate n° is candidate.number. The API might expect the internal ID.
            // api.vote(id_tour, townId, candidatId) -> candidatId is number in ApiService.vote
            await api.vote(
                selectedTour.id,
                selectedTown.id,
                Number(candidate.id),
            );
            step = 4;
        } catch (err: any) {
            error = err.message || "Une erreur est survenue lors du vote.";
        } finally {
            voting = false;
        }
    }
</script>

<div class="vote-page">
    <header class="page-header">
        <h1>🗳️ Espace de Vote</h1>
        <div class="stepper">
            <div class="step" class:active={step >= 1} class:done={step > 1}>
                <span class="step-num">1</span>
                <span class="step-label">Élection</span>
            </div>
            <div class="step-line"></div>
            <div class="step" class:active={step >= 2} class:done={step > 2}>
                <span class="step-num">2</span>
                <span class="step-label">Bureau</span>
            </div>
            <div class="step-line"></div>
            <div class="step" class:active={step >= 3} class:done={step > 3}>
                <span class="step-num">3</span>
                <span class="step-label">Candidat</span>
            </div>
        </div>
    </header>

    {#if error}
        <div class="error-banner">
            <span>⚠️</span>
            <p>{error}</p>
            {#if step > 1}
                <button onclick={() => step--}>Retour</button>
            {/if}
        </div>
    {/if}

    {#if step === 1}
        <section class="selection-section">
            <h2>Sélectionnez une élection</h2>
            {#if loading}
                <div class="loading-state"><div class="spinner"></div></div>
            {:else}
                <div class="grid">
                    {#each elections as election}
                        <button
                            class="choice-card"
                            onclick={() => selectElection(election)}
                        >
                            <div class="card-icon">🗳️</div>
                            <h3>{election.name}</h3>
                            <span class="meta"
                                >Ouverte le {new Date(
                                    election.createdAt,
                                ).toLocaleDateString()}</span
                            >
                            <div class="card-footer">Sélectionner →</div>
                        </button>
                    {/each}
                    {#if elections.length === 0}
                        <p class="empty">
                            Aucune élection ouverte pour le moment.
                        </p>
                    {/if}
                </div>
            {/if}
        </section>
    {:else if step === 2}
        <section class="selection-section">
            <div class="section-header">
                <button class="back-link" onclick={() => (step = 1)}
                    >← Retour</button
                >
                <h2>Sélectionnez votre ville / Commune</h2>
            </div>
            <div class="grid">
                {#each towns as town}
                    <button
                        class="choice-card"
                        onclick={() => selectTown(town)}
                    >
                        <div class="card-icon">🏙️</div>
                        <h3>{town.name}</h3>
                        <div class="card-footer">Sélectionner →</div>
                    </button>
                {/each}
            </div>
        </section>
    {:else if step === 3}
        <section class="selection-section">
            <div class="section-header">
                <button class="back-link" onclick={() => (step = 2)}
                    >← Retour</button
                >
                <h2>Faites votre choix</h2>
                <p class="info-text">Cliquez sur le candidat pour voter.</p>
            </div>

            {#if loading}
                <div class="loading-state"><div class="spinner"></div></div>
            {:else}
                <div class="candidates-grid">
                    {#each candidates as candidate}
                        <div class="candidate-card">
                            <div class="candidate-num">#{candidate.number}</div>
                            <div class="candidate-avatar">
                                {#if candidate.person?.image}
                                    <img
                                        src={candidate.person.image}
                                        alt={candidate.person?.firstname}
                                    />
                                {:else}
                                    <div class="placeholder">👤</div>
                                {/if}
                            </div>
                            <div class="candidate-info">
                                <h3>
                                    {candidate.person?.firstname}
                                    {candidate.person?.lastname}
                                </h3>
                            </div>
                            <button
                                class="vote-action-btn"
                                onclick={() => castVote(candidate)}
                                disabled={voting}
                            >
                                {voting ? "Vote en cours..." : "Voter"}
                            </button>
                        </div>
                    {/each}
                    {#if candidates.length === 0}
                        <p class="empty">Aucun candidat pour ce tour.</p>
                    {/if}
                </div>
            {/if}
        </section>
    {:else if step === 4}
        <section class="success-section">
            <div class="success-card">
                <div class="success-icon">✅</div>
                <h2>Vote enregistré !</h2>
                <p>
                    Votre suffrage a été pris en compte avec succès. Merci
                    d'avoir participé à ce processus démocratique.
                </p>
                <button class="home-btn" onclick={() => goto("/")}
                    >Retour à l'accueil</button
                >
            </div>
        </section>
    {/if}
</div>

<style>
    .vote-page {
        max-width: 1000px;
        margin: 0 auto;
    }

    .page-header {
        margin-bottom: 40px;
        text-align: center;
    }

    h1 {
        font-size: 32px;
        margin-bottom: 25px;
        color: #1a1a2e;
    }

    .stepper {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0;
        max-width: 500px;
        margin: 0 auto;
    }

    .step {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        position: relative;
        z-index: 1;
    }

    .step-num {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: #e2e8f0;
        color: #64748b;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        border: 4px solid #f5f7fa;
        transition: all 0.3s;
    }

    .step.active .step-num {
        background: #e94560;
        color: #fff;
        transform: scale(1.1);
    }

    .step.done .step-num {
        background: #10b981;
        color: #fff;
    }

    .step-label {
        font-size: 12px;
        font-weight: 600;
        color: #64748b;
        text-transform: uppercase;
    }

    .step.active .step-label {
        color: #e94560;
    }

    .step-line {
        flex: 1;
        height: 2px;
        background: #e2e8f0;
        margin-top: -20px;
    }

    .selection-section h2 {
        text-align: center;
        margin-bottom: 30px;
        font-size: 24px;
    }

    .grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 20px;
    }

    .choice-card {
        background: #fff;
        border: 1px solid #e2e8f0;
        border-radius: 16px;
        padding: 30px;
        text-align: center;
        cursor: pointer;
        transition: all 0.3s;
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .choice-card:hover {
        border-color: #e94560;
        transform: translateY(-5px);
        box-shadow: 0 10px 20px -5px rgba(0, 0, 0, 0.1);
    }

    .card-icon {
        font-size: 40px;
        margin-bottom: 15px;
    }

    .choice-card h3 {
        margin-bottom: 10px;
        color: #1a1a2e;
    }

    .meta {
        font-size: 13px;
        color: #64748b;
        margin-bottom: 20px;
    }

    .card-footer {
        margin-top: auto;
        font-weight: 600;
        color: #e94560;
        font-size: 14px;
    }

    .section-header {
        margin-bottom: 30px;
    }

    .back-link {
        background: none;
        border: none;
        color: #64748b;
        font-weight: 600;
        cursor: pointer;
        margin-bottom: 15px;
    }

    .back-link:hover {
        color: #e94560;
    }

    .candidates-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
        gap: 25px;
    }

    .candidate-card {
        background: #fff;
        border-radius: 20px;
        border: 1px solid #e2e8f0;
        padding: 25px;
        text-align: center;
        position: relative;
        overflow: hidden;
    }

    .candidate-num {
        position: absolute;
        top: 15px;
        left: 15px;
        background: #1a1a2e;
        color: #fff;
        padding: 4px 12px;
        border-radius: 12px;
        font-weight: 800;
        font-size: 14px;
    }

    .candidate-avatar {
        width: 120px;
        height: 120px;
        border-radius: 60px;
        background: #f1f5f9;
        margin: 0 auto 20px;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 3px solid #f8fafc;
    }

    .candidate-avatar img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .candidate-avatar .placeholder {
        font-size: 48px;
        opacity: 0.3;
    }

    .candidate-info h3 {
        font-size: 18px;
        margin-bottom: 20px;
        color: #1a1a2e;
    }

    .vote-action-btn {
        width: 100%;
        padding: 12px;
        background: #e94560;
        color: #fff;
        border: none;
        border-radius: 12px;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s;
    }

    .vote-action-btn:hover:not(:disabled) {
        background: #d63d57;
        box-shadow: 0 5px 15px -3px rgba(233, 69, 96, 0.4);
    }

    .vote-action-btn:disabled {
        opacity: 0.7;
    }

    .error-banner {
        background: #fee2e2;
        color: #991b1b;
        padding: 16px;
        border-radius: 12px;
        margin-bottom: 30px;
        display: flex;
        align-items: center;
        gap: 12px;
    }

    .error-banner button {
        margin-left: auto;
        background: #fff;
        border: 1px solid #fca5a5;
        padding: 4px 12px;
        border-radius: 6px;
        font-weight: 600;
        cursor: pointer;
    }

    .success-section {
        display: flex;
        justify-content: center;
        padding-top: 40px;
    }

    .success-card {
        background: #fff;
        padding: 50px;
        border-radius: 30px;
        text-align: center;
        max-width: 500px;
        box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.05);
    }

    .success-icon {
        font-size: 80px;
        margin-bottom: 20px;
    }

    .success-card h2 {
        font-size: 28px;
        margin-bottom: 15px;
    }

    .success-card p {
        color: #64748b;
        margin-bottom: 30px;
        line-height: 1.8;
    }

    .home-btn {
        padding: 14px 30px;
        background: #1a1a2e;
        color: #fff;
        border: none;
        border-radius: 12px;
        font-weight: 600;
        cursor: pointer;
    }

    .loading-state {
        display: flex;
        justify-content: center;
        padding: 50px;
    }

    .spinner {
        width: 40px;
        height: 40px;
        border: 4px solid #e2e8f0;
        border-top-color: #e94560;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }
</style>
