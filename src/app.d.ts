/// <reference types="@sveltejs/kit" />

declare global {
	namespace App {
		interface Locals {
			user?: {
				id: string;
				matricule: string;
				role: string;
			};
		}
		interface PageData {}
		interface Platform {}
	}
}

export {};
