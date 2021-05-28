import React, { FC } from "react";
import { useField } from "formik";
import { FormControl, FormLabel, Input, FormErrorMessage } from "@chakra-ui/react";

type InputFieldProps = Parameters<typeof useField>[0] & {
	label: string;
};

export const InputField: FC<InputFieldProps> = ({ label, ...props }) => {
	const [field, { error }] = useField(props);

	return (
		<>
			<FormControl isInvalid={!!error}>
				<FormLabel htmlFor={field.name}>{label}</FormLabel>
				<Input {...field} {...props} id={field.name} />

				{error ? <FormErrorMessage>{error}</FormErrorMessage> : null}
			</FormControl>
		</>
	);
};
