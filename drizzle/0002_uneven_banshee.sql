CREATE TABLE "avg_pixel_value" (
	"id" text PRIMARY KEY NOT NULL,
	"field_id" text NOT NULL,
	"image_type" "ImageType" NOT NULL,
	"image_date" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"value" real
);
--> statement-breakpoint
ALTER TABLE "avg_pixel_value" ADD CONSTRAINT "avg_pixel_value_field_id_field_id_fk" FOREIGN KEY ("field_id") REFERENCES "public"."field"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "avgPixelValueId_idx" ON "avg_pixel_value" USING btree ("field_id");