import React, { useEffect, useRef, useState } from "react";
import { NextPage } from "next";
import { useRouter } from "next/router";
import NextLink from "next/link";
import { withUrqlClient } from "next-urql";
import { Stack, Alert, AlertIcon, AlertTitle, Button, Link } from "@chakra-ui/react";
import { Formik, Form } from "formik";

import { InputField } from "../../../components/InputField";
import { Wrapper } from "../../../components/Wrapper";
import { createDelayer, timeDelta } from "../../../utils/time";
import { useChangePasswordMutation } from "../../../generated/graphql";
import { createUrqlClient } from "../../../utils/createUrqlClient";

const useHasTokenExpired = (informationalExpirationTimeUnix_: string | number) => {
	const informationalExpirationTimeUnix = Number(informationalExpirationTimeUnix_); // || informationalExpirationTimeUnix_ !== "0" ? Infinity : 0;

	const [hasTokenExpired, setHasTokenExpired] = useState(false);

	const originalStartTime = useRef(new Date().getTime());
	const [tokenExpiresInMs, setTokenExpiresInMs] = useState(
		timeDelta(originalStartTime.current, informationalExpirationTimeUnix)
	);

	useEffect(() => {
		const timeoutId = setTimeout(() => {
			setHasTokenExpired(true);
		}, tokenExpiresInMs);

		return () => clearTimeout(timeoutId);
	}, []);

	useEffect(() => {
		const intervalId = setInterval(() => {
			setTokenExpiresInMs(timeDelta(new Date().getTime(), informationalExpirationTimeUnix));
		}, 1000);

		return () => clearInterval(intervalId);
	}, []);

	return [hasTokenExpired, tokenExpiresInMs] as const;
};

const ChangePassword: NextPage<{ token: string; informationalExpirationTimeUnix: string }> = ({
	token, //
	informationalExpirationTimeUnix,
}) => {
	const [, changePassword] = useChangePasswordMutation();
	const router = useRouter();

	const [hasTokenExpired, tokenExpiresInMs] = useHasTokenExpired(informationalExpirationTimeUnix);

	/**
	 * custom global errors because apparently
	 * formik doesn't have that lmao
	 */
	const [hasErrored, setHasErrored] = useState(false);

	return (
		<Wrapper variant="small">
			<Formik
				initialValues={{ newPassword: "" }}
				onSubmit={async (values): Promise<void> => {
					const { delayIfNotEnoughTimePassedFromStartAsync } = createDelayer();

					const res = await changePassword({ ...values, token });
					const hasErroredNew = !res.data?.changePassword;

					if (!hasErroredNew) {
						const minDelayFromStartMs: number = 500;
						await delayIfNotEnoughTimePassedFromStartAsync(minDelayFromStartMs);

						const email = res.data?.changePassword?.email;

						await router.push(`/login` + (!email ? "" : "?emailOrUsername=" + email));
					}

					setHasErrored(hasErroredNew);
				}}
			>
				{({ isSubmitting }) => (
					<Form>
						<Stack spacing={6}>
							<InputField
								name="newPassword" //
								label="New Password"
								type="password"
								/**
								 * not using `onChange` because it overrides the value handling logic
								 * and makes the input useless lmao
								 */
								onChangeCapture={() => setHasErrored(false)}
							/>

							{!hasTokenExpired ? (
								<Alert status="warning" verticalAlign="baseline">
									<AlertIcon />
									<AlertTitle>{Math.round(tokenExpiresInMs / 1000)}</AlertTitle>
									seconds until expiration.
								</Alert>
							) : (
								<>
									<Alert status="error" verticalAlign="baseline">
										<>
											<AlertIcon /> <AlertTitle>The token has expired.</AlertTitle>
											<NextLink
												href={
													`/reset-password` +
													(!router.query["emailOrUsername"]
														? ""
														: "?emailOrUsername=" + router.query["emailOrUsername"])
												}
											>
												<Link>
													You need to <u>re-initiate</u> the operation.
												</Link>
											</NextLink>
										</>
									</Alert>
								</>
							)}

							{hasErrored ? (
								<Alert status="error" verticalAlign="baseline">
									<AlertIcon /> <AlertTitle>Something's going on here..</AlertTitle>
								</Alert>
							) : null}

							<Button
								type="submit"
								colorScheme="teal"
								isLoading={isSubmitting}
								disabled={hasErrored || hasTokenExpired}
								size="lg"
								marginLeft="auto"
							>
								Change Password
							</Button>
						</Stack>
					</Form>
				)}
			</Formik>
		</Wrapper>
	);
};

ChangePassword.getInitialProps = ({ query }) => ({
	token: query.token as string,
	informationalExpirationTimeUnix: query.expirationTimeUnix as string,
});

export default withUrqlClient(createUrqlClient)(ChangePassword as any);
