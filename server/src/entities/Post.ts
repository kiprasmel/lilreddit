import { Entity, Property } from "@mikro-orm/core";
import { Field, ObjectType } from "type-graphql";

import { EntityBase } from "./EntityBase";

@ObjectType()
@Entity()
export class Post extends EntityBase {
	@Field()
	@Property({ type: "text" })
	title!: string;
}
