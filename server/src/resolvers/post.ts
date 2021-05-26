/* eslint-disable @typescript-eslint/explicit-function-return-type */

import { Arg, Ctx, Int, Mutation, Query, Resolver } from "type-graphql";

// eslint-disable-next-line import/no-cycle
import { MyContext } from "..";
import { Post } from "../entities/Post";

@Resolver()
export class PostResolver {
	@Query(() => [Post])
	async posts(
		@Ctx() { em }: MyContext //
	): Promise<Post[]> {
		return await em.find(Post, {});
	}

	@Query(() => Post, { nullable: true })
	async post(@Arg("id", () => Int) id: number, @Ctx() { em }: MyContext): Promise<Post | null> {
		return await em.findOne(Post, { id });
	}

	@Mutation(() => Post)
	async createPost(@Arg("title", () => String) title: string, @Ctx() { em }: MyContext): Promise<Post> {
		const post = await em.create(Post, { title });
		await em.persistAndFlush(post);
		return post;
	}

	@Mutation(() => Post, { nullable: true })
	async updatePost(
		@Arg("id") id: number,
		@Arg("title", () => String, { nullable: true }) title: string,
		@Ctx() { em }: MyContext
	): Promise<Post | null> {
		const post = await em.findOne(Post, { id });

		if (!post) {
			return null;
		}

		let hasUpdates: boolean = false;
		if (title) {
			hasUpdates = true;
			post.title = title;
		}

		if (hasUpdates) {
			await em.persistAndFlush(post);
		}

		return post;
	}

	@Mutation(() => Boolean)
	async deletePost(@Arg("id") id: number, @Ctx() { em }: MyContext): Promise<boolean> {
		const exists: boolean = (await em.findOne(Post, { id })) !== null;

		if (!exists) {
			return false;
		}

		return await em
			.nativeDelete(Post, { id })
			.then(() => true)
			.catch(() => false);
	}

	@Mutation(() => Boolean)
	async deletePostV2(@Arg("id") id: number, @Ctx() { em }: MyContext): Promise<boolean> {
		try {
			await em.findOneOrFail(Post, { id }, { cache: false });
			await em.nativeDelete(Post, { id });
			return true;
		} catch (_e) {
			return false;
		}
	}
}
