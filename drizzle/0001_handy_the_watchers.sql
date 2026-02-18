ALTER TABLE "thumbnails" ALTER COLUMN "title" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "thumbnails" ALTER COLUMN "image_url" SET DATA TYPE varchar(500);--> statement-breakpoint
ALTER TABLE "thumbnails" DROP COLUMN "created_at";