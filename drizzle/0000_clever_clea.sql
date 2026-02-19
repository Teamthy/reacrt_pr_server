CREATE TABLE "thumbnails" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"title" varchar(255) NOT NULL,
	"prompt_used" text,
	"style" varchar(50) DEFAULT 'modern',
	"aspect_ratio" varchar(20) DEFAULT '16:9',
	"color_scheme" varchar(50) DEFAULT 'vibrant',
	"text_overlay" boolean DEFAULT false,
	"image_url" varchar(500),
	"is_generating" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
