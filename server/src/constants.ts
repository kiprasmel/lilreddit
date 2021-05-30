export const __DEV__ = process.env.NODE_ENV !== "production";

export const enum Cookies {
	Session = "lilreddit.qid",
}

export const Redis = {
	ResetPasswordTokenKey: (token: string): string => `reset-password-token:${token}`,
	ValueSeparator: "$$",
};
