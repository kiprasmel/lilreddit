import { PrimaryKey, Property } from "@mikro-orm/core";
import { Field, ObjectType } from "type-graphql";

// @Entity + @Property - postgres db
// @ObjectType + @Field - graphql type.

@ObjectType()
// @Entity() -- removed to avoid creating a separated entity
// since this is used for extending
export class EntityBase {
	@Field()
	@PrimaryKey()
	id!: number;

	@Field(() => String)
	@Property({ type: "date" })
	createdAt: Date = new Date();

	@Field(() => String)
	@Property({ type: "date", onUpdate: () => new Date() })
	updatedAt: Date = new Date();
}
