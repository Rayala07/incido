import { z } from "zod";

/**
 * Shared validation schemas used across multiple features.
 * Import from here — never import cross-feature.
 */
export const emailSchema = z.string().email("Invalid email address");
