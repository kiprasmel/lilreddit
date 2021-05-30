import React, { useEffect, useRef, useState, FC } from "react";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { useRouter } from "next/router";
import NextLink from "next/link";
import { withUrqlClient } from "next-urql";
import { Stack, Alert, AlertIcon, AlertTitle, Button, Link } from "@chakra-ui/react";
import { Formik, Form } from "formik";

import { IsTokenValidResponse } from "../../../server/src/types";

import { InputField } from "../components/InputField";
import { Wrapper } from "../components/Wrapper";
import { createDelayer, timeDelta } from "../utils/time";
import { useChangePasswordMutation } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { APIEndpoint } from "../constants";

const useHasTokenExpired = (informationalExpirationTimeUnix_: string | number) => {
	const informationalExpirationTimeUnix = Number(informationalExpirationTimeUnix_); // || informationalExpirationTimeUnix_ !== "0" ? Infinity : 0;

	const [hasTokenExpired, setHasTokenExpired] = useState(false);

	const originalStartTime = useRef(new Date().getTime());
	const [tokenExpiresInMs, setTokenExpiresInMs] = useState(
		timeDelta(originalStartTime.current, informationalExpirationTimeUnix)
	);

	useEffect(() => {
		let timeoutId: NodeJS.Timeout;

		if (Number.isFinite(informationalExpirationTimeUnix)) {
			timeoutId = setTimeout(() => {
				setHasTokenExpired(true);
			}, tokenExpiresInMs);
		}

		return () => clearTimeout(timeoutId);
	}, []);

	useEffect(() => {
		let intervalId: NodeJS.Timeout;

		if (Number.isFinite(informationalExpirationTimeUnix)) {
			intervalId = setInterval(() => {
				setTokenExpiresInMs(timeDelta(new Date().getTime(), informationalExpirationTimeUnix));
			}, 1000);
		}

		return () => clearInterval(intervalId);
	}, []);

	return [hasTokenExpired, tokenExpiresInMs] as const;
};

// https://nextjs.org/docs/basic-features/data-fetching#getserversideprops-server-side-rendering
export const getServerSideProps = async ({ query }: Parameters<GetServerSideProps>[0]) => {
	/**
	 * we don't really care to handle the case where a token is missing
	 * because if it is, the user has messed up something on their own.
	 */
	const token: string = (query.token as string | undefined) as string;

	const res = (await fetch(`${APIEndpoint}/is-token-valid/of-password-reset/${token}`).catch(
		console.error
	)) as Response;

	const { valid, tokenPayload }: IsTokenValidResponse = await res.json();

	return {
		props: {
			token,
			isTokenValid: valid,
			tokenPayload,
		},
	};
};

const ChangePassword = ({
	token, //
	isTokenValid,
	tokenPayload,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
	const [, changePassword] = useChangePasswordMutation();
	const router = useRouter();

	/**
	 * `Infinity` here is intentional since we will never show it anyway
	 * since the only reason why `tokenPayload` would be missing
	 * is if the `token` is invalid (or missing in the first place),
	 * in which case we'd just show that the token is invalid
	 * instead of the remaining time until expiration.
	 */
	const [hasTokenExpired, tokenExpiresInMs] = useHasTokenExpired(tokenPayload?.expirationTimeUnix ?? Infinity);

	/**
	 * custom global errors because apparently
	 * formik doesn't have that lmao
	 */
	const [hasErrored, setHasErrored] = useState(false);

	const ActionReinitiationAlert: FC<{ reason: string }> = ({ reason }) => (
		<Alert status="error" verticalAlign="baseline">
			<>
				<AlertIcon /> <AlertTitle>{reason}</AlertTitle>
				<NextLink
					href={
						`/reset-password` +
						(!tokenPayload?.emailOrUsername ? "" : "?emailOrUsername=" + tokenPayload.emailOrUsername)
						/**
						 * we are not providing a fallback `emailOrUsername` from the `router.query`
						 * intentionally, * since it would only be needed if the token is not valid,
						 * and,
						 * assuming we ourselves handle the logic well when changing secrets in the backend
						 * (keeping previous secrets for verification but not creation),
						 *
						 * the only way to mess it up would be on the user's side
						 * (e.g. the user modified the link or someone sent a malicious link),
						 * thus it should not be trusted anyway and the `emailOrUsername` field
						 * from the `router.query` should not come into play either.
						 *
						 * previously:
						 *
						 * ```ts
						 *  (tokenPayload?.emailOrUsername
						 *  	? "?emailOrUsername=" + tokenPayload.emailOrUsername
						 *  	: router.query["emailOrUsername"]
						 *  		? "?emailOrUsername=" + router.query["emailOrUsername"] // eslint-disable-line prettier/prettier
						 *  		: "") // eslint-disable-line prettier/prettier
						 * ```
						 *
						 */
					}
				>
					<Link>
						You need to <u>re-initiate</u> the operation.
					</Link>
				</NextLink>
			</>
		</Alert>
	);

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
								disabled={hasTokenExpired || !isTokenValid}
							/>

							{!isTokenValid ? (
								<ActionReinitiationAlert reason="The token is **invalid**." />
							) : (
								<>
									{!hasTokenExpired ? (
										<Alert status="warning" verticalAlign="baseline">
											<AlertIcon />
											<AlertTitle>{Math.round(tokenExpiresInMs / 1000)}</AlertTitle>
											seconds until expiration.
										</Alert>
									) : (
										<>
											<ActionReinitiationAlert reason="The token has **expired**." />
										</>
									)}

									{hasErrored ? (
										<Alert status="error" verticalAlign="baseline">
											<AlertIcon /> <AlertTitle>Something's going on here..</AlertTitle>
										</Alert>
									) : null}
								</>
							)}

							<Button
								type="submit"
								colorScheme="teal"
								isLoading={isSubmitting}
								disabled={hasErrored || hasTokenExpired || !isTokenValid}
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

export default withUrqlClient(createUrqlClient)(ChangePassword as any);
