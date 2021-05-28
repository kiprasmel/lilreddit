import React, { FC } from "react";
import { Form, Formik } from "formik";
import { Button, Stack } from "@chakra-ui/react";
import { Wrapper } from "../components/Wrapper";
import { InputField } from "../components/InputField";

interface RegisterProps {}

const Register: FC<RegisterProps> = ({}) => {
	let a;
	return (
		<Wrapper variant="small">
			<Formik initialValues={{ username: "", password: "" }} onSubmit={console.log}>
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
