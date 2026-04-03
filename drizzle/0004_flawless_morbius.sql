CREATE INDEX "cropFieldId_idx" ON "crop" USING btree ("field_id");--> statement-breakpoint
CREATE INDEX "fieldOwnerId_idx" ON "field" USING btree ("owner_id");