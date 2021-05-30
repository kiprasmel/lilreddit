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
	logoutUser: Scalars["Boolean"];
	initiatePasswordReset: Scalars["Boolean"];
	changePassword?: Maybe<User>;
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
	email: Scalars["String"];
};

export type MutationLoginUserArgs = {
	password: Scalars["String"];
	emailOrUsername: Scalars["String"];
};

export type MutationInitiatePasswordResetArgs = {
	emailOrUsername: Scalars["String"];
};

export type MutationChangePasswordArgs = {
	token: Scalars["String"];
	newPassword: Scalars["String"];
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
	email: Scalars["String"];
	username: Scalars["String"];
};

export type BaseUserFragment = { __typename?: "User" } & Pick<User, "id" | "username" | "createdAt">;

export type ChangePasswordMutationVariables = Exact<{
	newPassword: Scalars["String"];
	token: Scalars["String"];
}>;

export type ChangePasswordMutation = { __typename?: "Mutation" } & {
	changePassword?: Maybe<{ __typename?: "User" } & Pick<User, "id" | "email" | "username" | "updatedAt">>;
};

export type InitiatePasswordResetMutationVariables = Exact<{
	emailOrUsername: Scalars["String"];
}>;

export type InitiatePasswordResetMutation = { __typename?: "Mutation" } & Pick<Mutation, "initiatePasswordReset">;

export type LoginMutationVariables = Exact<{
	emailOrUsername: Scalars["String"];
	password: Scalars["String"];
}>;

export type LoginMutation = { __typename?: "Mutation" } & {
	loginUser?: Maybe<{ __typename?: "User" } & BaseUserFragment>;
};

export type LogoutMutationVariables = Exact<{ [key: string]: never }>;

export type LogoutMutation = { __typename?: "Mutation" } & Pick<Mutation, "logoutUser">;

export type RegisterMutationVariables = Exact<{
	email: Scalars["String"];
	username: Scalars["String"];
	password: Scalars["String"];
}>;

export type RegisterMutation = { __typename?: "Mutation" } & {
	registerUser?: Maybe<{ __typename?: "User" } & BaseUserFragment>;
};

export type MeQueryVariables = Exact<{ [key: string]: never }>;

export type MeQuery = { __typename?: "Query" } & { me?: Maybe<{ __typename?: "User" } & BaseUserFragment> };

export type PostsQueryVariables = Exact<{ [key: string]: never }>;

export type PostsQuery = { __typename?: "Query" } & {
	posts: Array<{ __typename?: "Post" } & Pick<Post, "id" | "title" | "createdAt" | "updatedAt">>;
};

export const BaseUserFragmentDoc = gql`
	fragment BaseUser on User {
		id
		username
		createdAt
	}
`;
export const ChangePasswordDocument = gql`
	mutation ChangePassword($newPassword: String!, $token: String!) {
		changePassword(newPassword: $newPassword, token: $token) {
			id
			email
			username
			updatedAt
		}
	}
`;

export function useChangePasswordMutation() {
	return Urql.useMutation<ChangePasswordMutation, ChangePasswordMutationVariables>(ChangePasswordDocument);
}
export const InitiatePasswordResetDocument = gql`
	mutation InitiatePasswordReset($emailOrUsername: String!) {
		initiatePasswordReset(emailOrUsername: $emailOrUsername)
	}
`;

export function useInitiatePasswordResetMutation() {
	return Urql.useMutation<InitiatePasswordResetMutation, InitiatePasswordResetMutationVariables>(
		InitiatePasswordResetDocument
	);
}
export const LoginDocument = gql`
	mutation Login($emailOrUsername: String!, $password: String!) {
		loginUser(emailOrUsername: $emailOrUsername, password: $password) {
			...BaseUser
		}
	}
	${BaseUserFragmentDoc}
`;

export function useLoginMutation() {
	return Urql.useMutation<LoginMutation, LoginMutationVariables>(LoginDocument);
}
export const LogoutDocument = gql`
	mutation Logout {
		logoutUser
	}
`;

export function useLogoutMutation() {
	return Urql.useMutation<LogoutMutation, LogoutMutationVariables>(LogoutDocument);
}
export const RegisterDocument = gql`
	mutation Register($email: String!, $username: String!, $password: String!) {
		registerUser(email: $email, username: $username, password: $password) {
			...BaseUser
		}
	}
	${BaseUserFragmentDoc}
`;

export function useRegisterMutation() {
	return Urql.useMutation<RegisterMutation, RegisterMutationVariables>(RegisterDocument);
}
export const MeDocument = gql`
	query Me {
		me {
			...BaseUser
		}
	}
	${BaseUserFragmentDoc}
`;

export function useMeQuery(options: Omit<Urql.UseQueryArgs<MeQueryVariables>, "query"> = {}) {
	return Urql.useQuery<MeQuery>({ query: MeDocument, ...options });
}
export const PostsDocument = gql`
	query Posts {
		posts {
			id
			title
			createdAt
			updatedAt
		}
	}
`;

export function usePostsQuery(options: Omit<Urql.UseQueryArgs<PostsQueryVariables>, "query"> = {}) {
	return Urql.useQuery<PostsQuery>({ query: PostsDocument, ...options });
}
