import { MikroORM, IDatabaseDriver, Connection } from "@mikro-orm/core";

import { User } from "../entities/User";

/**
 * used this to add email fields to users that were missing it.
 * first, had to make the email field nullable in the schema
 * to not crash the server/db, then apply this, then update the schema
 * to make the email no longer nullable and apply the migrations
 */
export const addMissingFieldToDbExample = async (orm: MikroORM<IDatabaseDriver<Connection>>) => {
	const users = await orm.em.find(User, {});

	await Promise.all(
		users.map(async (u, idx) => {
			if (!u.email) {
				u.email = `${idx + 1}.invalid@litreddit.kipras.org`;
				await orm.em.persist(u);
			}
		})
	);

	await orm.em.flush();
};
