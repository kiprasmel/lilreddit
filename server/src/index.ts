import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { MikroORM } from "@mikro-orm/core";

import mikroOrmConfig from "./mikro-orm.config";
import { Post } from "./entities/Post";
import { HelloResolver } from "./resolvers/hello";

const main = async (): Promise<void> => {
	const orm = await MikroORM.init(mikroOrmConfig);

	// does the migrations
	orm.getMigrator().up();

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

	const apolloServer = new ApolloServer({
		schema: await buildSchema({
			resolvers: [HelloResolver],
			validate: false,
		}),
	});

	apolloServer.applyMiddleware({ app });

	app.get("/ping", (_req, res) => res.send("pong\n"));

	app.listen(port, () => {
		console.log(`~ lilreddit server started on port \`${port}\` @ env \`${process.env.NODE_ENV}\``);
	});
};

main().catch((e) => console.log(e));
