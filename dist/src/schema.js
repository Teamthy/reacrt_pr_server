"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.thumbnails = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.thumbnails = (0, pg_core_1.pgTable)("thumbnails", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    title: (0, pg_core_1.varchar)("title", { length: 255 }).notNull(),
    imageUrl: (0, pg_core_1.varchar)("image_url", { length: 500 }).notNull(),
});
