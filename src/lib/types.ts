// API Configuration
export const API_BASE_URL = 'http://localhost:4000';

// Types for the application
export interface User {
	id: string;
	matricule: string;
	role: string;
	CIN?: string;
}

export interface Person {
	CIN: string;
	firstname: string;
	lastname: string;
	birthday: string;
	birthplace: string;
	address: string;
	email: string;
	phone: string;
	image?: string;
}

export interface Candidat {
	id: string;
	id_person: string;
	id_election: string;
	id_tour: string;
	number: number;
	person?: Person;
}

export interface Election {
	id: string;
	name: string;
	finish: boolean;
	createdAt: string;
}

export interface Tour {
	id: string;
	id_election: string;
	debut: string;
	fin: string;
	finish: boolean;
	election?: Election;
}

export interface Vote {
	id: string;
	id_tour: string;
	id_town: number;
	id_candidat: number;
	votes: number;
}

export interface Town {
	id: number;
	name: string;
}

export interface City {
	id: number;
	name: string;
}

export interface StatResult {
	townId: number;
	townName: string;
	totalElectors: number;
	votedElectors: number;
	percentage: number;
}

export interface GlobalResult {
	candidatId: number;
	candidatName: string;
	totalVotes: number;
	percentage: number;
}

// Login/Signup types
export interface LoginRequest {
	matricule: string;
	password: string;
}

export interface SignupRequest {
	role: string;
	password: string;
	CIN: string;
}

export interface AuthResponse {
	user: User;
	person?: Person;
}
