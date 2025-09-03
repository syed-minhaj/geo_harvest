import { pgEnum , pgTable, text, timestamp , customType, varchar, index} from "drizzle-orm/pg-core";
import { user } from "./auth-schema";
import { randomUUID } from "crypto";
import { availableCrops } from "../data/crop";
import { relations, sql } from "drizzle-orm";

export type Crop = keyof typeof availableCrops;
export type Variety<C extends Crop> = (typeof availableCrops)[C][number];

export const CropEnum = pgEnum("Crop", Object.keys(availableCrops) as [string, ...string[]]);

const polygon = customType<{ data: string }>({
    dataType() {
        return "polygon"; 
    },
});


export const field = pgTable("field", {
    id: text("id").primaryKey().$defaultFn(() => randomUUID()),
    name: text("name").notNull(),
    coordinates: polygon("coordinates").notNull(),
    ownerId: text("owner_id").notNull()
            .references(() => user.id, { onDelete: "cascade" }),
    created_at: timestamp("created_at").defaultNow().notNull(),
    updated_at: timestamp("updated_at").defaultNow().notNull(),
    imagesDates: text("images_date").notNull()
            .array()
            .notNull()
            .default(sql`'{}'::text[]`),
}, (table) => [
    index("firldId_idx").on(table.id),
]);

export const fieldRelations = relations(field, ({many}) => ({
    crop : many(crop)
}))

export const crop = pgTable("crop", {
    id: text("id").primaryKey().$defaultFn(() => randomUUID()),
    name: CropEnum("name").notNull().$type<Crop>(),
    seedVariety: varchar("variety", { length: 100 }).notNull().$type<Variety<Crop>>(),
    fieldId: text("field_id").notNull()
            .references(() => field.id, { onDelete: "cascade" }),
    created_at: timestamp("created_at").defaultNow().notNull(),
    updated_at: timestamp("updated_at").defaultNow().notNull(),
    planted_at : timestamp("planted_at"),
} , (table) => [
    index("cropId_idx").on(table.id),
]);

export const cropRelations = relations(crop, ({one}) => ({
    field : one(field , {
        fields : [crop.fieldId],
        references : [field.id]
    })
}))

export function isValidCropVariety<C extends Crop>(
    cropT : C, 
    variety: string
) {
    if(Object.keys(availableCrops).includes(cropT)){
        if(availableCrops[cropT].includes(variety)){
            return true
        }else{
            return false
        }
    }else{
        return false
    }
}
