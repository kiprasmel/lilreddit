import React, { FC /* useState */ } from "react";
import NextLink from "next/link";
import { Box, Button, Flex, HStack, Link } from "@chakra-ui/react";

import { useLogoutMutation, useMeQuery } from "../generated/graphql";
import { isNextServer } from "../utils/isNextServer";
// import { createDelayer } from "../utils/time";

interface NavbarProps {}

export const Navbar: FC<NavbarProps> = ({}) => {
	const [{ data, fetching }] = useMeQuery({ pause: isNextServer() });

	const [{ fetching: isFetchingLogout }, logout] = useLogoutMutation();
	// const [hasFinishedLogout, setHasFinishedLogout] = useState(true);

	let status: "initial" | "fetching" | "logged-out" | "logged-in" = "initial";

	if (fetching) status = "fetching";
	else {
		if (!data?.me) status = "logged-out";
		else status = "logged-in";
	}

	let body;
	if (status === "fetching") {
		body = <></>;
	} else if (status === "logged-out") {
		body = (
			<>
				<NextLink href="/login">
					<Link>login</Link>
				</NextLink>

				<NextLink href="/register">
					<Link>register</Link>
				</NextLink>
			</>
		);
	} else if (status === "logged-in") {
		body = (
			<>
				<Box>{data?.me?.username}</Box>
				<Button
					variant="link"
					onClick={async (): Promise<void> => {
						/**
						 * couldn't get the delayer to work
						 * since the cache invalidation via `cacheExchange`
						 * fires off immediately and changes the layout
						 * and I cannot provide a callback that would allow
						 * invalidating after it resolves,
						 * so we'll just not bother with this
						 *
						 */

						// const { delayIfNotEnoughTimePassedFromStartAsync } = createDelayer();
						// setHasFinishedLogout(false);
						// await logout({
						// 	__delayerCb: async () => {
						// 		await delayIfNotEnoughTimePassedFromStartAsync(700);
						// 		setHasFinishedLogout(true);
						// 	},
						// } as any);

						await logout();
					}}
					isLoading={isFetchingLogout /* || !hasFinishedLogout */}
				>
					logout
				</Button>
			</>
		);
	}

	return (
		<>
			<Flex bg="deepskyblue" px={12}>
				<Box p={4} ml="auto">
					<HStack spacing={6}>{body}</HStack>
				</Box>
			</Flex>
		</>
	);
};
