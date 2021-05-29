import React, { FC, useState } from "react";
import { useRouter } from "next/router";
import { withUrqlClient } from "next-urql";
import { Form, Formik } from "formik";
import { Alert, AlertIcon, AlertTitle, Button, Stack } from "@chakra-ui/react";

import { Wrapper } from "../components/Wrapper";
import { InputField } from "../components/InputField";
import { useRegisterMutation } from "../generated/graphql";
import { createDelayer } from "../utils/time";
import { createUrqlClient } from "../utils/createUrqlClient";

interface RegisterProps {}

const Register: FC<RegisterProps> = ({}) => {
	const [, register] = useRegisterMutation();

	const router = useRouter();

	/**
	 * custom global errors because apparently
	 * formik doesn't have that lmao
	 */
	const [hasErrored, setHasErrored] = useState(false);

	return (
		<Wrapper variant="small">
			<Formik
				initialValues={{ username: "", password: "" }}
				onSubmit={async (values): Promise<void> => {
					const { delayIfNotEnoughTimePassedFromStartAsync } = createDelayer();

					const res = await register(values);
					const hasErroredNew = !res.data?.registerUser;

					if (!hasErroredNew) {
						const minDelayFromStartMs: number = 500;
						await delayIfNotEnoughTimePassedFromStartAsync(minDelayFromStartMs);

						router.push("/");
					}

					setHasErrored(hasErroredNew);
				}}
			>
				{({ isSubmitting }) => (
					<Form>
						<Stack spacing={6}>
							<InputField
								name="username" //
								label="Username"
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

							<Button
								type="submit"
								colorScheme="teal"
								isLoading={isSubmitting}
								disabled={hasErrored}
								size="lg"
								marginLeft="auto"
							>
								Register
							</Button>
						</Stack>
					</Form>
				)}
			</Formik>
		</Wrapper>
	);
};

export default withUrqlClient(createUrqlClient)(Register);
