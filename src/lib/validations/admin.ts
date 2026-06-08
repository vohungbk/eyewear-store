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
