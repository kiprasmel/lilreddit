import gql from "graphql-tag";
import * as Urql from "urql";

export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
	ID: string;
	String: string;
	Boolean: boolean;
	Int: number;
	Float: number;
};

export type Mutation = {
	__typename?: "Mutation";
	createPost: Post;
	updatePost?: Maybe<Post>;
	deletePost: Scalars["Boolean"];
	deletePostV2: Scalars["Boolean"];
	registerUser?: Maybe<User>;
	loginUser?: Maybe<User>;
};

export type MutationCreatePostArgs = {
	title: Scalars["String"];
};

export type MutationUpdatePostArgs = {
	title?: Maybe<Scalars["String"]>;
	id: Scalars["Float"];
};

export type MutationDeletePostArgs = {
	id: Scalars["Float"];
};

export type MutationDeletePostV2Args = {
	id: Scalars["Float"];
};

export type MutationRegisterUserArgs = {
	password: Scalars["String"];
	username: Scalars["String"];
};

export type MutationLoginUserArgs = {
	password: Scalars["String"];
	username: Scalars["String"];
};

export type Post = {
	__typename?: "Post";
	id: Scalars["Float"];
	createdAt: Scalars["String"];
	updatedAt: Scalars["String"];
	title: Scalars["String"];
};

export type Query = {
	__typename?: "Query";
	hello: Scalars["String"];
	posts: Array<Post>;
	post?: Maybe<Post>;
	users: Array<User>;
	me?: Maybe<User>;
};

export type QueryPostArgs = {
	id: Scalars["Int"];
};

export type User = {
	__typename?: "User";
	id: Scalars["Float"];
	createdAt: Scalars["String"];
	updatedAt: Scalars["String"];
	username: Scalars["String"];
};

export type RegisterMutationVariables = Exact<{
	username: Scalars["String"];
	password: Scalars["String"];
}>;

export type RegisterMutation = { __typename?: "Mutation" } & {
	registerUser?: Maybe<{ __typename?: "User" } & Pick<User, "id" | "username" | "createdAt">>;
};

export const RegisterDocument = gql`
	mutation Register($username: String!, $password: String!) {
		registerUser(username: $username, password: $password) {
			id
			username
			createdAt
		}
	}
`;

export function useRegisterMutation() {
	return Urql.useMutation<RegisterMutation, RegisterMutationVariables>(RegisterDocument);
}
