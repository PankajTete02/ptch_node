export interface Token {
	jwt: string;
}

export interface LoginRequest {
	token: string;
}

export interface SASToken {
	sasTokenAudio: string;
	sasTokenVideo: string;
}
