import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { MikroORM } from "@mikro-orm/core";
import redis from "redis";
import session from "express-session";
import connectRedis from "connect-redis";
import cors from "cors";

import mikroOrmConfig from "./mikro-orm.config";
import { Post } from "./entities/Post";
import { HelloResolver } from "./resolvers/hello";
// eslint-disable-next-line import/no-cycle
import { PostResolver } from "./resolvers/post";
// eslint-disable-next-line import/no-cycle
import { UserResolver } from "./resolvers/user";
import { UnwrapPromise } from "./types";
import { Cookies, __DEV__ } from "./constants";
import { sendEmail } from "./utils/sendEmail";

export type ExpressSession = Partial<{
	userId: number;
	loginTime: number;
	loginIp: string;
}>;

export type Req = express.Request & { session?: ExpressSession };

const main = async () => {
	sendEmail({ to: "kipras@kipras.org", subject: "oh hi mark", text: "lilreddit started lmao" });

	const orm = await MikroORM.init(mikroOrmConfig);

	// does the migrations
	await orm.getMigrator().up();

	// em - Entity Manager

	// does nothing to the db
	// const post = orm.em.create(Post, { title: "Postter x #1" });

	// actually saves to the db
	const post = orm.em.create(Post, { title: "Postter x #1" });
	await orm.em.persistAndFlush(post);

	// would be the same as the previous one
	// but actually won't create the default fields
	// and thus it sucks and thus we won't use it
	// await orm.em.nativeInsert(Post, { title: "Postter x #2" });

	const posts = await orm.em.find(Post, {});
	console.log("posts", posts);

	const app = express();
	const port = process.env.PORT ?? 5000;

	/**
	 * TODO Nginx
	 *
	 * Proper IP forwarding et al
	 *
	 * see
	 * - https://expressjs.com/en/4x/api.html#trust.proxy.options.table
	 * - https://expressjs.com/en/guide/behind-proxies.html
	 */
	app.set("trust proxy", true);

	app.use(
		cors({
			origin: "http://localhost:3000",
			credentials: true,
		})
	);

	/**
	 * how all this works: https://youtu.be/I6ypD7qv3Z8?t=2h3m6s
	 */
	const RedisStore = connectRedis(session);
	const redisClient = redis.createClient();
	app.use(
		session({
			name: Cookies.Session,
			store: new RedisStore({
				client: redisClient, //
				disableTouch: true, // https://github.com/tj/connect-redis#disabletouch
			}),
			cookie: {
				maxAge: 1000 * 60 * 60 * 24 * 365 * 200, // 200 years lmao
				httpOnly: true, // non accessible in client-side js (except elevater permissions like an extension)
				sameSite: "lax", // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie/SameSite#lax
				secure: !__DEV__, // https-only
			},
			saveUninitialized: false, // do not store empty sessions
			secret: "qKXY#&B~SVwd$33APmx@sCH9KQtFF`%Wi2CM4iHVS#YiCyG79Q7`k8$wA%MdtShB" /** TODO SECRET */,
			resave: false,
		})
	);

	const apolloServerConfig = {
		schema: await buildSchema({
			resolvers: [HelloResolver, PostResolver, UserResolver],
			validate: false,
		}),
		// give access to stuff to the resolvers
		context: (
			{
				req,
				res,
			}: {
				req: Req;
				res: express.Response;
			} /** : ApolloServerExpressConfig["context"]  */
		) => ({
			em: orm.em,
			req,
			res,
		}),
	};

	const apolloServer = new ApolloServer(apolloServerConfig);

	apolloServer.applyMiddleware({
		app,
		cors: false /** { origin: "http://localhost:3000" } */ /** handling via express instead */,
	});

	app.get("/ping", (_req, res) => res.send("pong\n"));

	app.listen(port, () => {
		console.log(`~ lilreddit server started on port \`${port}\` @ env \`${process.env.NODE_ENV}\``);
	});

	return {
		// needed to dynamically create the `MyContext` type
		apolloServerConfig,
	};
};

const mainReturn = main();

type MainReturn = UnwrapPromise<typeof mainReturn>;
export type MyContext = ReturnType<MainReturn["apolloServerConfig"]["context"]>;

mainReturn.catch((e) => console.log(e));
