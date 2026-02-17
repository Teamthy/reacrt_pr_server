CREATE TABLE "thumbnails" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"image_url" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
