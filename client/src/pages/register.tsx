import React, { FC } from "react";
import { Form, Formik } from "formik";
import { Button, Stack } from "@chakra-ui/react";

import { Wrapper } from "../components/Wrapper";
import { InputField } from "../components/InputField";
import { useRegisterMutation } from "../generated/graphql";

interface RegisterProps {}

const Register: FC<RegisterProps> = ({}) => {
	const [, register] = useRegisterMutation();

	return (
		<Wrapper variant="small">
			<Formik
				initialValues={{ username: "", password: "" }}
				onSubmit={async (values) => {
					console.log("values", values);
					const res = await register(values);

					console.log("res", res);
					return res;
				}}
			>
				{({ isSubmitting }) => (
					<Form>
						<Stack spacing={14}>
							<Stack spacing={6}>
								<InputField name="username" label="Username" />
								<InputField name="password" label="Password" type="password" />
							</Stack>
							<Button type="submit" colorScheme="teal" isLoading={isSubmitting}>
								Register
							</Button>
						</Stack>
					</Form>
				)}
			</Formik>
		</Wrapper>
	);
};

export default Register;
