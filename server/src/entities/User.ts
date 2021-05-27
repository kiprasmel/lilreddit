import { Entity, Property } from "@mikro-orm/core";
import { ObjectType, Field } from "type-graphql";

import { EntityBase } from "./EntityBase";

@ObjectType()
@Entity()
export class User extends EntityBase {
	@Field(() => String)
	@Property({ type: "text", unique: true })
	username!: string;

	@Property({ type: "text" })
	password!: string;
}
