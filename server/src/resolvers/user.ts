import argon2 from "argon2";
import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";
import { v4 as uuidv4 } from "uuid";

import { sendEmail } from "../utils/sendEmail";

// eslint-disable-next-line import/no-cycle
import { MyContext, Req } from "..";
import { Cookies, Redis } from "../constants";
import { User } from "../entities/User";

/**
 * store some fields in the `req.session`
 * to set a cookie for the user
 * to keep them logged in
 */
const logUserIn = (reqRef: Req, userId: number): void => {
	// if (!reqRef.session) reqRef.session = {};
	reqRef.session.userId = userId;
	reqRef.session.loginTime = new Date().getTime();
	reqRef.session.loginIp = reqRef.ip;
};

const hashRawPasswordAsync = async (rawPassword: string): Promise<string> => {
	const oneWayHashedAndSaltedPassword: string = await argon2.hash(rawPassword);
	return oneWayHashedAndSaltedPassword;
};

@Resolver()
export class UserResolver {
	@Mutation(() => User, { nullable: true })
	async registerUser(
		@Arg("email") email: string,
		@Arg("username") username: string,
		@Arg("password") rawPassword: string,
		@Ctx() { em, req }: MyContext
	): Promise<User | null> {
		try {
			const hasMissingParams: boolean = !email?.length || !username?.length || !rawPassword?.length;
			if (hasMissingParams) {
				return null;
			}

			// eslint-disable-next-line no-param-reassign
			email = email.toLowerCase();
			// eslint-disable-next-line no-param-reassign
			username = username.toLowerCase();

			const doesAlreadyExist: boolean = !!(await em.findOne(User, { $or: [{ username }, { email }] }));
			if (doesAlreadyExist) {
				return null;
			}

			// https://github.com/ranisalt/node-argon2
			// https://github.com/ranisalt/node-argon2/wiki/Options
			const oneWayHashedAndSaltedPassword: string = await hashRawPasswordAsync(rawPassword);

			/**
			 * example on how to use a query builder,
			 * though the instructor is over-complicating things here
			 * instead of just checking if the user already exists
			 */

			/*

			import { EntityManager  } from "@mikro-orm/postgresql"; // correct types for `em.createQueryBuilder` et al 

			const [user] = await (em as EntityManager)
				.createQueryBuilder(User)
				.getKnexQuery()
				.insert({
					username,
					password: oneWayHashedAndSaltedPassword,
					created_at: new Date().getTime(),
					updated_at: new Date().getTime(),
				})
				.returning("*");

			 */

			const user = em.create(User, { email, username, password: oneWayHashedAndSaltedPassword });
			await em.persistAndFlush(user);

			logUserIn(req, user.id);
			return user;
		} catch (e) {
			return null;
		}
	}

	@Mutation(() => User, { nullable: true })
	async loginUser(
		@Arg("emailOrUsername") emailOrUsername: string,
		@Arg("password") rawPassword: string,
		@Ctx() { em, req }: MyContext
	): Promise<User | null> {
		try {
			// eslint-disable-next-line no-param-reassign
			emailOrUsername = emailOrUsername.toLowerCase();

			const user = await em.findOne(User, { $or: [{ email: emailOrUsername }, { username: emailOrUsername }] });

			if (!user) {
				return null;
			}

			/**
			 * the API sucks lol - the order of arguments matters
			 * since you're not supposed to hash the raw password
			 * before comparing
			 */
			const doPasswordsMatch: boolean = await argon2.verify(user.password, rawPassword);

			if (doPasswordsMatch) {
				logUserIn(req, user.id);
				return user;
			} else {
				return null;
			}
		} catch (e) {
			// internal failure
			return null;
		}
	}

	@Mutation(() => Boolean)
	async logoutUser(@Ctx() { req, res }: MyContext): Promise<boolean> {
		return new Promise((resolve) => {
			try {
				res.clearCookie(Cookies.Session);

				req.session.destroy((err) => {
					if (err) {
						/**
						 * internal; if the `res.clearCookie` worked, it does not matter,
						 * thus do not `resolve(false)` here
						 */
						console.error(`Failed to destroy session @ logoutUser, err:`, err);
					}
				});

				resolve(true);
			} catch (err) {
				resolve(false);
			}
		});
	}

	@Mutation(() => Boolean)
	async initiatePasswordReset(
		@Arg("emailOrUsername") emailOrUsername: string,
		@Ctx() { req, em, redis }: MyContext
	): Promise<boolean> {
		const user = await em.findOne(User, { $or: [{ email: emailOrUsername }, { username: emailOrUsername }] });

		if (!user) {
			/**
			 * todo security - at least rate limiting etc
			 *
			 * currently it's very clear if there was a success or failure anyway
			 * since it takes a while to send that email lol
			 */
			return false;
		}

		const token: string = uuidv4();

		const howManyMinutesTillExpiration: number = 30;
		const expiresInMs: number = 1000 * 60 * howManyMinutesTillExpiration;
		const expirationTimeUnix: number = new Date().getTime() + expiresInMs;

		const changePasswordPage: string = `http://localhost:3000/change-password/${token}/${expirationTimeUnix}?emailOrUsername=${emailOrUsername}`;

		// https://redis.io/commands/set
		await redis.set(
			Redis.ResetPasswordTokenKey(token), //
			[user.id, req.ip].join(Redis.ValueSeparator),
			"PX",
			expiresInMs
		);

		await sendEmail({
			to: user.email,
			text: `${changePasswordPage} \n\nWill expire in ${howManyMinutesTillExpiration} minutes.`,
			html: `<a href="${changePasswordPage}">Reset Password</a> (will expire in ${howManyMinutesTillExpiration} minutes)`,
		});

		return true;
	}

	@Mutation(() => User, { nullable: true })
	async changePassword(
		@Arg("newPassword") newRawPassword: string,
		@Arg("token") token: string,
		@Ctx() { req, redis, em }: MyContext
	): Promise<User | null> {
		const value = await redis.get(Redis.ResetPasswordTokenKey(token));

		if (!value) {
			// invalid or expired
			return null;
		}

		const [userId_, reqIp] = value.split(Redis.ValueSeparator);
		const userId: number = Number(userId_);

		if (req.ip !== reqIp) {
			return null;
		}

		const user = await em.findOne(User, { id: userId });

		if (!user) {
			return null;
		}

		user.password = await hashRawPasswordAsync(newRawPassword);
		await em.persistAndFlush(user);

		await redis.del(Redis.ResetPasswordTokenKey(token));

		return user;
	}

	@Query(() => [User])
	async users(@Ctx() { em }: MyContext): Promise<User[]> {
		return await em.find(User, {});
	}

	@Query(() => User, { nullable: true })
	async me(@Ctx() { em, req }: MyContext): Promise<User | null> {
		const { userId } = req?.session ?? { userId: null };

		if (!userId) return null;

		const me: User | null = await em.findOne(User, { id: userId });
		return me;
	}
}
