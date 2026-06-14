import { z } from "zod";

export const ProductSchema = z.object({
  name: z.string().min(1, { error: "Name is required." }),
  slug: z
    .string()
    .min(1, { error: "Slug is required." })
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      error: "Slug must be lowercase letters, numbers, and hyphens only.",
    }),
  description: z.string().optional(),
  price: z.number().positive({ error: "Price must be positive." }),
  compare_at_price: z.number().positive().optional().nullable(),
  category_id: z.string().optional().nullable(),
  is_active: z.boolean(),
  is_featured: z.boolean(),
  seo_title: z.string().optional().nullable(),
  seo_description: z.string().optional().nullable(),
});

export type ProductFormValues = z.infer<typeof ProductSchema>;

export const CategorySchema = z.object({
  name: z.string().min(1, { error: "Name is required." }),
  slug: z
    .string()
    .min(1, { error: "Slug is required." })
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      error: "Slug must be lowercase letters, numbers, and hyphens only.",
    }),
  description: z.string().optional().nullable(),
  image_url: z.string().optional().nullable(),
  parent_id: z.string().optional().nullable(),
  position: z.number().int().min(0),
});

export type CategoryFormValues = z.infer<typeof CategorySchema>;

export const DiscountSchema = z.object({
  code: z
    .string()
    .min(1, { error: "Code is required." })
    .regex(/^[A-Z0-9_-]+$/, { error: "Code must be uppercase letters, numbers, hyphens, or underscores." }),
  type: z.enum(["percent", "fixed"]),
  value: z.number().positive({ error: "Value must be positive." }),
  min_order: z.number().min(0).default(0),
  usage_limit: z.number().int().positive().optional().nullable(),
  is_active: z.boolean().default(true),
  expires_at: z.string().optional().nullable(),
});

export type DiscountFormValues = z.infer<typeof DiscountSchema>;
