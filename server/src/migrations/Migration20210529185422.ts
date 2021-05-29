import { Migration } from "@mikro-orm/migrations";

export class Migration20210529185422 extends Migration {
	async up(): Promise<void> {
		this.addSql('alter table "user" add column "email" text null;');
	}
}
