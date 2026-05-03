import { z } from "zod";

export const emailSchema = z.string().email("Invalid email address");

export const createIncidentSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title cannot exceed 100 characters")
    .nonempty("Title is required"),
  
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(1000, "Description cannot exceed 1000 characters")
    .nonempty("Description is required"),
  
  impactedService: z
    .string()
    .min(2, "Service name must be at least 2 characters")
    .max(100, "Service name cannot exceed 100 characters")
    .nonempty("Impacted service is required"),
  
  severity: z.enum(["low", "medium", "high", "critical"], {
    errorMap: () => ({ message: "Please select a valid severity level" })
  }),
  
  responders: z
    .array(z.string().email("Invalid email address"))
    .max(5, "Maximum 5 responders allowed")
    .optional(),
});
