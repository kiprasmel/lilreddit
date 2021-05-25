import path from "path";

import { MikroORM } from "@mikro-orm/core";

import { __DEV__ } from "./constants";
import { Post } from "./entities/Post";

export default {
	dbName: "lilreddit",
	type: "postgresql" as const,
	// // uses defaults
	user: "admin",
	password: "admin",
	host: "localhost",
	debug: __DEV__,

	// https://mikro-orm.io/docs/defining-entities/
	entities: [Post],

	// https://mikro-orm.io/docs/migrations/

	// https://mikro-orm.io/docs/migrations/#using-via-cli
	// npx mikro-orm migration:create
	migrations: {
		path: path.join(__dirname, "./migrations"), // path to the folder with migrations
		pattern: /^[\w-]+\d+\.[tj]s$/, // regex pattern for the migration files
	},
} as Parameters<typeof MikroORM.init>[0];
