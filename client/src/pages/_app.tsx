import { ChakraProvider } from "@chakra-ui/react";
import { createClient, dedupExchange, fetchExchange, Provider as UrqlProvider } from "urql";
import { cacheExchange } from "@urql/exchange-graphcache";
import { AppProps } from "next/app";

import theme from "../theme";
import { LoginMutation, MeDocument, MeQuery, RegisterMutation } from "../generated/graphql";

const urqlClient = createClient({
	url: "http://localhost:5000/graphql",
	fetchOptions: {
		credentials: "include",
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
				},
			},
		}),
		fetchExchange,
	],
});

function MyApp({ Component, pageProps }: AppProps) {
	return (
		<UrqlProvider value={urqlClient}>
			<ChakraProvider resetCSS theme={theme}>
				<Component {...pageProps} />
			</ChakraProvider>
		</UrqlProvider>
	);
}

export default MyApp;
