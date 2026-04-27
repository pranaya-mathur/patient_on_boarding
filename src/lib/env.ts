import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  NEXTAUTH_SECRET: z.string().min(1),
  GROQ_API_KEY: z.string().min(1),
  LOCAL_UPLOAD_DIR: z.string().default("./uploads"),
  STAFF_PASSWORD: z.string().optional(),
  STAFF_ALLOWED_EMAILS: z.string().optional(),
});

export const env = envSchema.safeParse(process.env);

if (!env.success) {
  console.error("❌ Invalid environment variables:", env.error.flatten().fieldErrors);
  if (process.env.NODE_ENV === "production") {
    throw new Error("Invalid environment variables");
  }
}
