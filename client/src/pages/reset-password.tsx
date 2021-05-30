import React, { FC, useState } from "react";
import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import { Stack, Alert, AlertIcon, AlertTitle, Button } from "@chakra-ui/react";
import { Formik, Form } from "formik";

import { useInitiatePasswordResetMutation } from "../generated/graphql";
import { InputField } from "../components/InputField";
import { Wrapper } from "../components/Wrapper";
import { createDelayer } from "../utils/time";
import { createUrqlClient } from "../utils/createUrqlClient";

interface ResetPasswordProps {}

const ResetPassword: FC<ResetPasswordProps> = ({}) => {
	const router = useRouter();

	const [, initiatePasswordReset] = useInitiatePasswordResetMutation();

	/**
	 * custom global errors because apparently
	 * formik doesn't have that lmao
	 */
	const [hasErrored, setHasErrored] = useState(false);
	const [hasSuccessfullyInitiatedAReset, setHasSuccessfullyInitiatedAReset] = useState<boolean>(false);

	return (
		<Wrapper variant="small">
			<Formik
				initialValues={{ emailOrUsername: (router.query["emailOrUsername"] as string) ?? "" }}
				onSubmit={async (values): Promise<void> => {
					const { delayIfNotEnoughTimePassedFromStartAsync } = createDelayer();

					const res = await initiatePasswordReset(values);
					const hasErroredNew = !res.data?.initiatePasswordReset;

					if (!hasErroredNew) {
						const minDelayFromStartMs: number = 500;
						await delayIfNotEnoughTimePassedFromStartAsync(minDelayFromStartMs);

						setHasSuccessfullyInitiatedAReset(true);
					}

					setHasErrored(hasErroredNew);
				}}
			>
				{({ isSubmitting }) => (
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

							{hasErrored ? (
								<Alert status="error" verticalAlign="baseline">
									<AlertIcon /> <AlertTitle>Something's going on here..</AlertTitle>
								</Alert>
							) : null}

							{hasSuccessfullyInitiatedAReset ? (
								<Alert status="success" verticalAlign="baseline">
									<AlertIcon /> <AlertTitle>Check Your Email.</AlertTitle>
								</Alert>
							) : null}

							<Button
								type="submit"
								colorScheme="teal"
								isLoading={isSubmitting}
								disabled={hasErrored || hasSuccessfullyInitiatedAReset}
								size="lg"
								marginLeft="auto"
							>
								Reset Password
							</Button>
						</Stack>
					</Form>
				)}
			</Formik>
		</Wrapper>
	);
};

export default withUrqlClient(createUrqlClient)(ResetPassword);
