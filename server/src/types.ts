export type UnwrapPromise<T> = T extends Promise<infer U> ? U : never;

export type JWTTokenPayload = {
	userId: number;
	reqIp: string;
	emailOrUsername: string;
	expirationTimeUnix: number;
};

export type IsTokenValidResponse = {
	valid: boolean;
	reason: string;
	isExpiredAtTimeOfValidation: boolean | null;
	tokenPayload: JWTTokenPayload | null;
};
