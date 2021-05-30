import React, { FC, useState } from "react";
import { useRouter } from "next/router";
import NextLink from "next/link";
import { withUrqlClient } from "next-urql";
import { Form, Formik } from "formik";
import { Alert, AlertIcon, AlertTitle, Button, Link, Stack } from "@chakra-ui/react";

import { Wrapper } from "../components/Wrapper";
import { InputField } from "../components/InputField";
import { useLoginMutation } from "../generated/graphql";
import { createDelayer } from "../utils/time";
import { createUrqlClient } from "../utils/createUrqlClient";

interface LoginProps {}

const Login: FC<LoginProps> = () => {
	const [, login] = useLoginMutation();

	const router = useRouter();

	/**
	 * custom global errors because apparently
	 * formik doesn't have that lmao
	 */
	const [hasErrored, setHasErrored] = useState(false);

	return (
		<Wrapper variant="small">
			<Formik
				initialValues={{ emailOrUsername: (router.query["emailOrUsername"] as string) ?? "", password: "" }}
				onSubmit={async (values): Promise<void> => {
					const { delayIfNotEnoughTimePassedFromStartAsync } = createDelayer();

					const res = await login(values);
					const hasErroredNew = !res.data?.loginUser;

					if (!hasErroredNew) {
						const minDelayFromStartMs: number = 500;
						await delayIfNotEnoughTimePassedFromStartAsync(minDelayFromStartMs);

						await router.push("/");
					}

					setHasErrored(hasErroredNew);
				}}
			>
				{({ isSubmitting, values: { emailOrUsername } }) => (
					<Form>
						<Stack spacing={6}>
							<InputField
								name="emailOrUsername" //
								label="Email Or Username"
								/**
								 * not using `onChange` because it overrides the value handling logic
								 * and makes the input useless lmao
								 */
								onChangeCapture={() => setHasErrored(false)}
							/>
							<InputField
								name="password" //
								label="Password"
								type="password"
								onChangeCapture={() => setHasErrored(false)}
							/>

							{hasErrored ? (
								<Alert status="error" verticalAlign="baseline">
									<AlertIcon /> <AlertTitle>Something's going on here..</AlertTitle>
								</Alert>
							) : null}

							<NextLink
								href={
									`/reset-password` + (!emailOrUsername ? "" : "?emailOrUsername=" + emailOrUsername)
								}
							>
								<Link ml="auto">Reset Password?</Link>
							</NextLink>

							<Button
								type="submit"
								colorScheme="teal"
								isLoading={isSubmitting}
								disabled={hasErrored}
								size="lg"
								marginLeft="auto"
							>
								Login
							</Button>
						</Stack>
					</Form>
				)}
			</Formik>
		</Wrapper>
	);
};

export default withUrqlClient(createUrqlClient)(Login);
