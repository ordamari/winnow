CREATE TABLE "banks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "personal_info" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"bank_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"title" text NOT NULL,
	"phone" text NOT NULL,
	"email" text NOT NULL,
	"linkedin" text NOT NULL,
	"github" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "section_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"section_id" uuid NOT NULL,
	"bank_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"public_id" text NOT NULL,
	"position" integer NOT NULL,
	"organization" text,
	"title" text,
	"alternative_titles" text[] DEFAULT ARRAY[]::text[] NOT NULL,
	"period" text,
	"default_checked" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "sections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"bank_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"public_id" text NOT NULL,
	"kind" text NOT NULL,
	"title" text NOT NULL,
	"position" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "sections_kind_check" CHECK ("sections"."kind" in ('summary', 'skills', 'entries'))
);
--> statement-breakpoint
CREATE TABLE "skill_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"section_id" uuid NOT NULL,
	"bank_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"public_id" text NOT NULL,
	"label" text NOT NULL,
	"position" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "skills" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"section_id" uuid NOT NULL,
	"category_id" uuid,
	"bank_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"public_id" text NOT NULL,
	"name" text NOT NULL,
	"default_checked" boolean DEFAULT false NOT NULL,
	"position" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "slot_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slot_id" uuid NOT NULL,
	"bank_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"public_id" text NOT NULL,
	"label" text NOT NULL,
	"text" text NOT NULL,
	"default_selected" boolean DEFAULT false NOT NULL,
	"position" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "slots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"section_id" uuid,
	"entry_id" uuid,
	"bank_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"public_id" text NOT NULL,
	"position" integer NOT NULL,
	"default_checked" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "slots_one_owner_check" CHECK (("slots"."section_id" is not null and "slots"."entry_id" is null) or ("slots"."section_id" is null and "slots"."entry_id" is not null))
);
--> statement-breakpoint
ALTER TABLE "banks" ADD CONSTRAINT "banks_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "personal_info" ADD CONSTRAINT "personal_info_bank_id_banks_id_fk" FOREIGN KEY ("bank_id") REFERENCES "public"."banks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "personal_info" ADD CONSTRAINT "personal_info_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "section_entries" ADD CONSTRAINT "section_entries_section_id_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."sections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "section_entries" ADD CONSTRAINT "section_entries_bank_id_banks_id_fk" FOREIGN KEY ("bank_id") REFERENCES "public"."banks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "section_entries" ADD CONSTRAINT "section_entries_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sections" ADD CONSTRAINT "sections_bank_id_banks_id_fk" FOREIGN KEY ("bank_id") REFERENCES "public"."banks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sections" ADD CONSTRAINT "sections_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skill_categories" ADD CONSTRAINT "skill_categories_section_id_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."sections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skill_categories" ADD CONSTRAINT "skill_categories_bank_id_banks_id_fk" FOREIGN KEY ("bank_id") REFERENCES "public"."banks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skill_categories" ADD CONSTRAINT "skill_categories_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skills" ADD CONSTRAINT "skills_section_id_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."sections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skills" ADD CONSTRAINT "skills_category_id_skill_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."skill_categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skills" ADD CONSTRAINT "skills_bank_id_banks_id_fk" FOREIGN KEY ("bank_id") REFERENCES "public"."banks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skills" ADD CONSTRAINT "skills_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "slot_versions" ADD CONSTRAINT "slot_versions_slot_id_slots_id_fk" FOREIGN KEY ("slot_id") REFERENCES "public"."slots"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "slot_versions" ADD CONSTRAINT "slot_versions_bank_id_banks_id_fk" FOREIGN KEY ("bank_id") REFERENCES "public"."banks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "slot_versions" ADD CONSTRAINT "slot_versions_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "slots" ADD CONSTRAINT "slots_section_id_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."sections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "slots" ADD CONSTRAINT "slots_entry_id_section_entries_id_fk" FOREIGN KEY ("entry_id") REFERENCES "public"."section_entries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "slots" ADD CONSTRAINT "slots_bank_id_banks_id_fk" FOREIGN KEY ("bank_id") REFERENCES "public"."banks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "slots" ADD CONSTRAINT "slots_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "banks_one_live_per_user" ON "banks" USING btree ("user_id") WHERE "banks"."deleted_at" is null;--> statement-breakpoint
CREATE INDEX "banks_user_id_idx" ON "banks" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "personal_info_one_live_bank" ON "personal_info" USING btree ("bank_id") WHERE "personal_info"."deleted_at" is null;--> statement-breakpoint
CREATE INDEX "personal_info_user_id_idx" ON "personal_info" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "section_entries_bank_public_id_live" ON "section_entries" USING btree ("bank_id","public_id") WHERE "section_entries"."deleted_at" is null;--> statement-breakpoint
CREATE INDEX "section_entries_user_id_idx" ON "section_entries" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "sections_bank_public_id_live" ON "sections" USING btree ("bank_id","public_id") WHERE "sections"."deleted_at" is null;--> statement-breakpoint
CREATE UNIQUE INDEX "sections_one_live_summary" ON "sections" USING btree ("bank_id") WHERE "sections"."kind" = 'summary' and "sections"."deleted_at" is null;--> statement-breakpoint
CREATE UNIQUE INDEX "sections_one_live_skills" ON "sections" USING btree ("bank_id") WHERE "sections"."kind" = 'skills' and "sections"."deleted_at" is null;--> statement-breakpoint
CREATE INDEX "sections_user_id_idx" ON "sections" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "skill_categories_bank_public_id_live" ON "skill_categories" USING btree ("bank_id","public_id") WHERE "skill_categories"."deleted_at" is null;--> statement-breakpoint
CREATE INDEX "skill_categories_user_id_idx" ON "skill_categories" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "skills_bank_public_id_live" ON "skills" USING btree ("bank_id","public_id") WHERE "skills"."deleted_at" is null;--> statement-breakpoint
CREATE INDEX "skills_user_id_idx" ON "skills" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "slot_versions_slot_public_id_live" ON "slot_versions" USING btree ("slot_id","public_id") WHERE "slot_versions"."deleted_at" is null;--> statement-breakpoint
CREATE INDEX "slot_versions_user_id_idx" ON "slot_versions" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "slots_bank_public_id_live" ON "slots" USING btree ("bank_id","public_id") WHERE "slots"."deleted_at" is null;--> statement-breakpoint
CREATE INDEX "slots_user_id_idx" ON "slots" USING btree ("user_id");--> statement-breakpoint
DROP TABLE "demo_resumes";