/* eslint-disable @typescript-eslint/explicit-function-return-type */

import { Ctx, Query, Resolver } from "type-graphql";

// eslint-disable-next-line import/no-cycle
import { MyContext } from "..";
import { Post } from "../entities/Post";

@Resolver()
export class PostResolver {
	@Query(() => [Post])
	posts(
		@Ctx() { em }: MyContext //
	): Promise<Post[]> {
		return em.find(Post, {});
	}
}
