import type { Config } from "drizzle-kit";
import * as dotenv from "dotenv";
dotenv.config();

export default {
    schema: "./src/db/schema.ts",
    out: "./drizzle",
    driver: "pg",
    dbCredentials: {
        connectionString: process.env.DATABASE_URL || "postgres://ticketera_user:ticketera_pass_2025@localhost:5432/ticketera_prod",
    },
} satisfies Config;
