import { API_BASE_URL, type AuthResponse, type Candidat, type Election, type GlobalResult, type Person, type StatResult, type Tour, type Town, type Vote } from './types';

class ApiService {
	private token: string | null = null;

	setToken(token: string | null) {
		this.token = token;
		if (typeof localStorage !== 'undefined') {
			if (token) {
				localStorage.setItem('token', token);
			} else {
				localStorage.removeItem('token');
			}
		}
	}

	getToken(): string | null {
		if (typeof localStorage !== 'undefined' && !this.token) {
			this.token = localStorage.getItem('token');
		}
		return this.token;
	}

	private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
		const headers: HeadersInit = {
			'Content-Type': 'application/json',
			...options.headers,
		};

		const token = this.getToken();
		if (token) {
			(headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
		}

		const response = await fetch(`${API_BASE_URL}${endpoint}`, {
			...options,
			headers,
		});

		if (!response.ok) {
			const error = await response.json().catch(() => ({ message: 'Une erreur est survenue' }));
			throw new Error(error.message || 'Une erreur est survenue');
		}

		return response.json();
	}

	// Auth endpoints
	async login(matricule: string, password: string): Promise<AuthResponse> {
		const response = await this.request<AuthResponse>('/auth/login', {
			method: 'POST',
			body: JSON.stringify({ matricule, password }),
		});
		return response;
	}

	async signup(role: string, password: string, CIN: string): Promise<{ message: string }> {
		return this.request('/auth/signup', {
			method: 'POST',
			body: JSON.stringify({ role, password, CIN }),
		});
	}

	// Election endpoints
	async getElections(): Promise<Election[]> {
		return this.request('/election/all');
	}

	async getAvailableElections(): Promise<Election[]> {
		return this.request('/election/available');
	}

	async createElection(name: string): Promise<{ id: string }> {
		return this.request('/election/create', {
			method: 'POST',
			body: JSON.stringify({ name }),
		});
	}

	async finishElection(id_election: string): Promise<{ message: string }> {
		return this.request(`/election/finish?id_election=${id_election}`, {
			method: 'PUT',
		});
	}

	// Tour endpoints
	async getTours(id_election?: string): Promise<Tour[]> {
		const url = id_election ? `/tour?id_election=${id_election}` : '/tour';
		return this.request(url);
	}

	async createTour(id_election: string, debut: string, fin: string): Promise<{ id: string }> {
		return this.request('/tour', {
			method: 'POST',
			body: JSON.stringify({ id_election, debut, fin }),
		});
	}

	async finishTour(id_tour: string): Promise<{ message: string }> {
		return this.request(`/tour/setfinish?id_tour=${id_tour}`, {
			method: 'PUT',
		});
	}

	// Candidat endpoints
	async getCandidats(id_election: string): Promise<Candidat[]> {
		return this.request(`/candidat/allcandidat?id_election=${id_election}`);
	}

	async getCandidatsInTour(id_tour: string): Promise<Candidat[]> {
		return this.request(`/candidat/candidatintour?id_tour=${id_tour}`);
	}

	async addCandidat(id_person: string, id_election: string, id_tour: string): Promise<{ message: string }> {
		return this.request('/candidat', {
			method: 'POST',
			body: JSON.stringify({ id_person, id_election, id_tour }),
		});
	}

	async deleteCandidat(cin: string, election_id: string): Promise<{ message: string }> {
		return this.request(`/candidat?cin=${cin}&election_id=${election_id}`, {
			method: 'DELETE',
		});
	}

	async randomizeCandidatNumbers(id_election: string): Promise<{ message: string }> {
		return this.request(`/candidat/randomnumber?id_election=${id_election}`, {
			method: 'PUT',
		});
	}

	// Vote endpoints
	async initVote(id_tour: string): Promise<{ message: string }> {
		return this.request(`/vote/init?id_tour=${id_tour}`, {
			method: 'POST',
		});
	}

	async initVoteInTown(id_town: number, id_tour: string): Promise<{ message: string }> {
		return this.request(`/vote/init-town?id_town=${id_town}&id_tour=${id_tour}`, {
			method: 'POST',
		});
	}

	async vote(id_tour: string, townId: number, candidatId: number): Promise<{ message: string }> {
		return this.request('/vote', {
			method: 'POST',
			body: JSON.stringify({ id_tour, townId, candidatId }),
		});
	}

	// Town endpoints
	async getTowns(): Promise<Town[]> {
		return this.request('/town');
	}

	// Stat endpoints
	async getStatOneTown(id_tour: string, id_town: number): Promise<StatResult> {
		return this.request(`/stat/onetown?id_tour=${id_tour}&id_town=${id_town}`);
	}

	async getStatAllTowns(id_tour: string): Promise<StatResult[]> {
		return this.request(`/stat/alltown?id_tour=${id_tour}`);
	}

	// Global Result endpoints
	async getGlobalResult(id_tour: string): Promise<GlobalResult[]> {
		return this.request(`/global-result?id_tour=${id_tour}`);
	}

	async getGlobalResultForCity(id_tour: string): Promise<GlobalResult[]> {
		return this.request(`/global-result/globalresultforcity?id_tour=${id_tour}`);
	}

	// Person endpoints
	async getPersonInformation(image: string, id_tour: string): Promise<Person | { msg: string }> {
		return this.request(`/person/information?image=${image}&id_tour=${id_tour}`);
	}
}

export const api = new ApiService();
