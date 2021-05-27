import argon2 from "argon2";
import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";

// eslint-disable-next-line import/no-cycle
import { MyContext, Req } from "..";
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

@Resolver()
export class UserResolver {
	@Mutation(() => User, { nullable: true })
	async registerUser(
		@Arg("username") username: string,
		@Arg("password") rawPassword: string,
		@Ctx() { em, req }: MyContext
	): Promise<User | null> {
		try {
			const hasMissingParams: boolean = !username?.length || !rawPassword?.length;
			if (hasMissingParams) {
				return null;
			}

			const doesAlreadyExist: boolean = !!(await em.findOne(User, { username }));
			if (doesAlreadyExist) {
				return null;
			}

			// https://github.com/ranisalt/node-argon2
			// https://github.com/ranisalt/node-argon2/wiki/Options
			const oneWayHashedAndSaltedPassword: string = await argon2.hash(rawPassword);

			const user = em.create(User, { username: username.toLowerCase(), password: oneWayHashedAndSaltedPassword });
			await em.persistAndFlush(user);

			logUserIn(req, user.id);
			return user;
		} catch (e) {
			return null;
		}
	}

	@Mutation(() => User, { nullable: true })
	async loginUser(
		@Arg("username") username: string,
		@Arg("password") rawPassword: string,
		@Ctx() { em, req }: MyContext
	): Promise<User | null> {
		try {
			const user = await em.findOne(User, { username: username.toLowerCase() });

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
