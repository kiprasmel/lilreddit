import jwtOrig from "jsonwebtoken";

export * from "jsonwebtoken";

/**
 * promisified version
 */
export const jwt = {
	sign: (
		payload: Parameters<typeof jwtOrig.sign>[0], //
		secret: Parameters<typeof jwtOrig.sign>[1],
		options: Parameters<typeof jwtOrig.sign>[2] = {}
	): Promise<string> =>
		new Promise((resolve, reject) =>
			jwtOrig.sign(payload, secret, options, (err, token) => {
				if (err) {
					return reject(err);
				}

				return resolve(token as string);
			})
		),

	verify: <Payload>(
		token: string,
		secret: Parameters<typeof jwtOrig.verify>[1],
		options?: Parameters<typeof jwtOrig.verify>[2]
	): Promise<Payload> =>
		new Promise((resolve, reject) =>
			jwtOrig.verify(token, secret, options, (err, payload) => {
				if (err) {
					return reject(err);
				}

				return resolve((payload as unknown) as Payload);
			})
		),
};
