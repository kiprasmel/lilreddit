import { cacheExchange } from "@urql/exchange-graphcache";
import { dedupExchange, fetchExchange } from "urql";

import { LoginMutation, MeDocument, MeQuery, RegisterMutation } from "../generated/graphql";

export const createUrqlClient = (ssrExchange) => ({
	url: "http://localhost:5000/graphql",
	fetchOptions: {
		credentials: "include" as const,
	},
	exchanges: [
		dedupExchange, //
		cacheExchange({
			updates: {
				Mutation: {
					/**
					 * update the `me` query's cache after `register`/`login` mutations
					 *
					 * without this, once you register/login, the parts of the app that used
					 * the `me` query would have the cached result which was previously `null`
					 * and so it'd be out of sync.
					 *
					 * We could invalidate the cache instead - it would make an extra request tho
					 * and here we already have all the data we need.
					 *
					 */
					loginUser: (result: LoginMutation, _args, cache, _info): void => {
						cache.updateQuery({ query: MeDocument }, (query: MeQuery | null) => {
							if (!result.loginUser) {
								return query;
							} else {
								return {
									me: result.loginUser,
								};
							}
						});
					},
					registerUser: (result: RegisterMutation, _args, cache, _info): void => {
						cache.updateQuery({ query: MeDocument }, (query: MeQuery | null) => {
							if (!result.registerUser) {
								return query;
							} else {
								return {
									me: result.registerUser,
								};
							}
						});
					},
					logoutUser: (_result, _args, cache, _info): void => {
						// // cache.invalidate();
						// console.log("args", _result, args, cache, _info);
						// const { __delayerCb } = args as any;
						// __delayerCb().then(() => cache.updateQuery({ query: MeDocument }, () => ({ me: null })));

						cache.updateQuery({ query: MeDocument }, () => ({ me: null }));
					},
				},
			},
		}),
		ssrExchange,
		fetchExchange,
	],
});
