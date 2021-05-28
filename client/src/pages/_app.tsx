import { ChakraProvider } from "@chakra-ui/react";
import { createClient, Provider as UrqlProvider } from "urql";

import { AppProps } from "next/app";
import theme from "../theme";

const urqlClient = createClient({
	url: "http://localhost:5000/graphql",
	fetchOptions: {
		credentials: "include",
	},
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
