export const __DEV__ = process.env.NODE_ENV !== "production";

export const enum Cookies {
	Session = "lilreddit.qid",
}

export const Redis = {
	ResetPasswordTokenKey: (token: string): string => `reset-password-token:${token}`,
	ValueSeparator: "$$",
};

/**
 * TODO SECRET
 */
export const JWTSecret: string =
	"tWg#9U@a#wDb7Zhn3862RGef6B$#Hf&3d`CCDe7M^r5&f&rC8a`nJs$E7d3z^e`A6#i$uX^hoRVEa~3PNvChD%AAotgX4fKk2Miib@QVjDZNaogVAykohbg^pM2$WBHf";
