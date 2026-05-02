import { z } from "zod";

export const createProjectSchema = z.object({
  title: z.string()
    .min(1, "Title is required")
    .min(3, "Title must be at least 3 characters")
    .max(80, "Title must be under 80 characters"),

  description: z.string()
    .min(1, "Description is required")
    .max(500, "Description must be under 500 characters"),
});
