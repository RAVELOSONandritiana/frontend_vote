<script lang="ts">
    import { api } from "$lib/api";
    import { onMount } from "svelte";
    import type { Election, Tour, Candidat, Town } from "$lib/types";

    let activeTab = $state("elections");
    let elevations = $state<Election[]>([]);
    let tours = $state<Tour[]>([]);
    let candidates = $state<Candidat[]>([]);
    let selectedElectionId = $state("");
    let selectedTourId = $state("");

    let newElectionName = $state("");
    let newTourStart = $state("");
    let newTourEnd = $state("");

    let newCandidatCin = $state("");

    let loading = $state(false);
    let message = $state({ text: "", type: "" });

    onMount(async () => {
        await loadElections();
    });

    async function loadElections() {
        loading = true;
        try {
            elevations = await api.getElections();
        } catch (err) {
            showMsg("Erreur chargement élections", "error");
        } finally {
            loading = false;
        }
    }

    async function loadTours() {
        if (!selectedElectionId) return;
        loading = true;
        try {
            tours = await api.getTours(selectedElectionId);
        } catch (err) {
            showMsg("Erreur chargement tours", "error");
        } finally {
            loading = false;
        }
    }

    async function loadCandidates() {
        if (!selectedTourId) return;
        loading = true;
        try {
            candidates = await api.getCandidatsInTour(selectedTourId);
        } catch (err) {
            showMsg("Erreur chargement candidats", "error");
        } finally {
            loading = false;
        }
    }

    function showMsg(text: string, type: "success" | "error" = "success") {
        message = { text, type };
        setTimeout(() => (message = { text: "", type: "" }), 5000);
    }

    // Actions
    async function createElection() {
        if (!newElectionName) return;
        try {
            await api.createElection(newElectionName);
            showMsg("Élection créée !");
            newElectionName = "";
            await loadElections();
        } catch (err) {
            showMsg("Échec création élection", "error");
        }
    }

    async function finishElection(id: string) {
        if (!confirm("Voulez-vous vraiment clore cette élection ?")) return;
        try {
            await api.finishElection(id);
            showMsg("Élection terminée");
            await loadElections();
        } catch (err) {
            showMsg("Échec clôture élection", "error");
        }
    }

    async function createTour() {
        if (!selectedElectionId || !newTourStart || !newTourEnd) return;
        try {
            await api.createTour(selectedElectionId, newTourStart, newTourEnd);
            showMsg("Tour créé !");
            newTourStart = "";
            newTourEnd = "";
            await loadTours();
        } catch (err) {
            showMsg("Échec création tour", "error");
        }
    }

    async function finishTour(id: string) {
        if (!confirm("Terminer ce tour ?")) return;
        try {
            await api.finishTour(id);
            showMsg("Tour terminé");
            await loadTours();
        } catch (err) {
            showMsg("Erreur", "error");
        }
    }

    async function addCandidate() {
        if (!selectedTourId || !newCandidatCin || !selectedElectionId) return;
        try {
            await api.addCandidat(
                newCandidatCin,
                selectedElectionId,
                selectedTourId,
            );
            showMsg("Candidat ajouté !");
            newCandidatCin = "";
            await loadCandidates();
        } catch (err) {
            showMsg("Erreur ajout candidat (Vérifiez le CIN)", "error");
        }
    }

    async function randomize() {
        if (!selectedElectionId) return;
        try {
            await api.randomizeCandidatNumbers(selectedElectionId);
            showMsg("Numéros randomisés !");
            if (selectedTourId) await loadCandidates();
        } catch (err) {
            showMsg("Erreur", "error");
        }
    }
</script>

<div class="admin-page">
    <header class="page-header">
        <h1>⚙️ Administration</h1>
        <p>Gérez le système électoral, les tours et les participants.</p>
    </header>

    {#if message.text}
        <div class="alert {message.type}">
            {message.text}
        </div>
    {/if}

    <div class="admin-container">
        <nav class="tabs">
            <button
                class:active={activeTab === "elections"}
                onclick={() => (activeTab = "elections")}
            >
                🗳️ Élections
            </button>
            <button
                class:active={activeTab === "tours"}
                onclick={() => (activeTab = "tours")}
            >
                🔄 Tours
            </button>
            <button
                class:active={activeTab === "candidates"}
                onclick={() => (activeTab = "candidates")}
            >
                👥 Candidats
            </button>
        </nav>

        <div class="tab-content">
            {#if activeTab === "elections"}
                <section class="admin-section">
                    <h2>Gérer les Élections</h2>
                    <div class="form-card">
                        <h3>Nouvelle Élection</h3>
                        <div class="row">
                            <input
                                type="text"
                                placeholder="Nom de l'élection (ex: Présidentielle 2026)"
                                bind:value={newElectionName}
                            />
                            <button onclick={createElection} class="btn-primary"
                                >Créer</button
                            >
                        </div>
                    </div>

                    <div class="list-card">
                        <table>
                            <thead>
                                <tr>
                                    <th>Nom</th>
                                    <th>Date Création</th>
                                    <th>Statut</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {#each elevations as election}
                                    <tr>
                                        <td><strong>{election.name}</strong></td
                                        >
                                        <td
                                            >{new Date(
                                                election.createdAt,
                                            ).toLocaleDateString()}</td
                                        >
                                        <td>
                                            <span
                                                class="badge"
                                                class:active={!election.finish}
                                            >
                                                {election.finish
                                                    ? "Terminée"
                                                    : "Active"}
                                            </span>
                                        </td>
                                        <td>
                                            {#if !election.finish}
                                                <button
                                                    onclick={() =>
                                                        finishElection(
                                                            election.id,
                                                        )}
                                                    class="btn-danger small"
                                                    >Clore</button
                                                >
                                            {/if}
                                        </td>
                                    </tr>
                                {/each}
                            </tbody>
                        </table>
                    </div>
                </section>
            {:else if activeTab === "tours"}
                <section class="admin-section">
                    <h2>Gérer les Tours de Scrutin</h2>
                    <div class="selector-card">
                        <label>Choisir une élection :</label>
                        <select
                            bind:value={selectedElectionId}
                            onchange={loadTours}
                        >
                            <option value="">Sélectionnez...</option>
                            {#each elevations as e}
                                <option value={e.id}>{e.name}</option>
                            {/each}
                        </select>
                    </div>

                    {#if selectedElectionId}
                        <div class="form-card">
                            <h3>Ajouter un Tour</h3>
                            <div class="row">
                                <div class="col">
                                    <label>Début</label>
                                    <input
                                        type="datetime-local"
                                        bind:value={newTourStart}
                                    />
                                </div>
                                <div class="col">
                                    <label>Fin</label>
                                    <input
                                        type="datetime-local"
                                        bind:value={newTourEnd}
                                    />
                                </div>
                                <button
                                    onclick={createTour}
                                    class="btn-primary mt-end">Ajouter</button
                                >
                            </div>
                        </div>

                        <div class="list-card">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Tour</th>
                                        <th>Période</th>
                                        <th>Statut</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {#each tours as tour, i}
                                        <tr>
                                            <td>Tour #{i + 1}</td>
                                            <td
                                                >du {new Date(
                                                    tour.debut,
                                                ).toLocaleString()} au {new Date(
                                                    tour.fin,
                                                ).toLocaleString()}</td
                                            >
                                            <td>
                                                <span
                                                    class="badge"
                                                    class:active={!tour.finish}
                                                >
                                                    {tour.finish
                                                        ? "Terminé"
                                                        : "En cours"}
                                                </span>
                                            </td>
                                            <td>
                                                {#if !tour.finish}
                                                    <button
                                                        onclick={() =>
                                                            finishTour(tour.id)}
                                                        class="btn-danger small"
                                                        >Terminer</button
                                                    >
                                                {/if}
                                            </td>
                                        </tr>
                                    {/each}
                                </tbody>
                            </table>
                        </div>
                    {/if}
                </section>
            {:else if activeTab === "candidates"}
                <section class="admin-section">
                    <h2>Gérer les Candidats</h2>
                    <div class="selectors">
                        <div class="selector-card">
                            <label>Élection :</label>
                            <select
                                bind:value={selectedElectionId}
                                onchange={loadTours}
                            >
                                <option value="">Sélectionnez...</option>
                                {#each elevations as e}
                                    <option value={e.id}>{e.name}</option>
                                {/each}
                            </select>
                        </div>
                        <div class="selector-card">
                            <label>Tour :</label>
                            <select
                                bind:value={selectedTourId}
                                onchange={loadCandidates}
                            >
                                <option value="">Sélectionnez...</option>
                                {#each tours as t, i}
                                    <option value={t.id}>Tour #{i + 1}</option>
                                {/each}
                            </select>
                        </div>
                    </div>

                    {#if selectedTourId}
                        <div class="actions-header">
                            <div class="form-card compact">
                                <h3>Ajouter un Candidat (par CIN/Matricule)</h3>
                                <div class="row">
                                    <input
                                        type="text"
                                        placeholder="CIN de la personne"
                                        bind:value={newCandidatCin}
                                    />
                                    <button
                                        onclick={addCandidate}
                                        class="btn-primary">Ajouter</button
                                    >
                                </div>
                            </div>
                            <button onclick={randomize} class="btn-secondary"
                                >🔀 Randomiser les numéros</button
                            >
                        </div>

                        <div class="candidates-list">
                            {#each candidates as c}
                                <div class="candidate-item">
                                    <div class="num">#{c.number}</div>
                                    <div class="info">
                                        <strong
                                            >{c.person?.firstname}
                                            {c.person?.lastname}</strong
                                        >
                                        <span>CIN: {c.id_person}</span>
                                    </div>
                                    <button class="btn-text danger"
                                        >Retirer</button
                                    >
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
    .admin-page {
        max-width: 1000px;
        margin: 0 auto;
    }

    .page-header {
        margin-bottom: 30px;
    }

    h1 {
        font-size: 28px;
        color: #1a1a2e;
        margin-bottom: 5px;
    }
    p {
        color: #64748b;
    }

    .admin-container {
        background: #fff;
        border-radius: 24px;
        border: 1px solid #e2e8f0;
        overflow: hidden;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
    }

    .tabs {
        display: flex;
        background: #f8fafc;
        border-bottom: 1px solid #e2e8f0;
        padding: 10px 10px 0;
    }

    .tabs button {
        padding: 12px 24px;
        background: none;
        border: none;
        border-bottom: 4px solid transparent;
        font-weight: 600;
        color: #64748b;
        cursor: pointer;
        transition: all 0.2s;
    }

    .tabs button:hover {
        color: #1a1a2e;
    }
    .tabs button.active {
        color: #e94560;
        border-bottom-color: #e94560;
    }

    .tab-content {
        padding: 30px;
    }

    .admin-section h2 {
        font-size: 20px;
        margin-bottom: 25px;
        color: #1a1a2e;
    }

    .form-card {
        background: #f8fafc;
        padding: 20px;
        border-radius: 16px;
        margin-bottom: 25px;
        border: 1px solid #e2e8f0;
    }

    .form-card h3 {
        font-size: 14px;
        text-transform: uppercase;
        color: #64748b;
        margin-bottom: 15px;
    }

    .row {
        display: flex;
        gap: 15px;
    }

    .col {
        display: flex;
        flex-direction: column;
        gap: 5px;
        flex: 1;
    }
    .col label {
        font-size: 11px;
        font-weight: 700;
        color: #94a3b8;
    }

    input,
    select {
        padding: 10px 15px;
        border: 1px solid #cbd5e1;
        border-radius: 10px;
        font-size: 14px;
        flex: 1;
    }

    .btn-primary {
        background: #e94560;
        color: #fff;
        border: none;
        padding: 10px 20px;
        border-radius: 10px;
        font-weight: 600;
        cursor: pointer;
    }

    .mt-end {
        align-self: flex-end;
    }

    .list-card table {
        width: 100%;
        border-collapse: collapse;
    }

    th {
        text-align: left;
        padding: 12px;
        font-size: 12px;
        color: #94a3b8;
        border-bottom: 1px solid #f1f5f9;
    }
    td {
        padding: 15px 12px;
        border-bottom: 1px solid #f1f5f9;
        font-size: 14px;
    }

    .badge {
        padding: 4px 10px;
        border-radius: 20px;
        font-size: 11px;
        font-weight: 700;
        background: #f1f5f9;
        color: #64748b;
    }

    .badge.active {
        background: #dcfce7;
        color: #166534;
    }

    .btn-danger.small {
        background: #fee2e2;
        color: #ef4444;
        border: none;
        padding: 4px 12px;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
    }

    .selectors {
        display: flex;
        gap: 20px;
        margin-bottom: 25px;
    }
    .selector-card {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 8px;
    }
    .selector-card label {
        font-size: 12px;
        font-weight: 600;
        color: #64748b;
    }

    .actions-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 20px;
        margin-bottom: 25px;
    }

    .btn-secondary {
        background: #1a1a2e;
        color: #fff;
        border: none;
        padding: 12px 20px;
        border-radius: 12px;
        font-weight: 600;
        cursor: pointer;
    }

    .candidates-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }
    .candidate-item {
        display: flex;
        align-items: center;
        gap: 15px;
        padding: 15px;
        background: #f8fafc;
        border-radius: 12px;
        border: 1px solid #e2e8f0;
    }

    .candidate-item .num {
        width: 40px;
        height: 40px;
        background: #e94560;
        color: #fff;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 800;
    }

    .candidate-item .info {
        flex: 1;
        display: flex;
        flex-direction: column;
    }
    .candidate-item .info span {
        font-size: 12px;
        color: #64748b;
    }

    .alert {
        padding: 15px;
        border-radius: 12px;
        margin-bottom: 20px;
        font-weight: 600;
    }

    .alert.success {
        background: #dcfce7;
        color: #166534;
    }
    .alert.error {
        background: #fee2e2;
        color: #991b1b;
    }
</style>
