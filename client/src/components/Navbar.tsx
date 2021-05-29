import React, { FC } from "react";
import NextLink from "next/link";

import { Box, Button, Flex, HStack, Link } from "@chakra-ui/react";
import { useMeQuery } from "../generated/graphql";

interface NavbarProps {}

export const Navbar: FC<NavbarProps> = ({}) => {
	const [{ data, fetching }] = useMeQuery();

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
					onClick={() => {
						//

						throw new Error("TODO");
					}}
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
