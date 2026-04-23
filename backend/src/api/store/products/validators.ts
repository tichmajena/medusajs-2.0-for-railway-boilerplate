import { z } from "zod";

const variantSchema = z.object({
  title: z.string(),
  sku: z.string(),
  manage_inventory: z.boolean(),
  allow_backorder: z.boolean(),
  stocked_quantity: z.number()?.optional(),
  inventory_items: z
    .array(
      z.object({
        inventory_item_id: z.string(),
        required_quantity: z.number(),
      }),
    )
    .optional(),
  prices: z.array(
    z.object({
      currency_code: z.string(),
      amount: z.number(),
    }),
  ),
});
const productSchema = z.object({
  title: z.string(),
  status: z.enum(["published", "draft"]),
  description: z.string(),
  options: z.array(
    z.object({
      title: z.string(),
      values: z.array(z.string()),
    }),
  ),
  variants: z.array(variantSchema),
  shipping_profile_id: z.string(),
  sales_channels: z.array(
    z.object({
      id: z.string(),
    }),
  ),
  brand: z
    .object({
      id: z.string(),
    })
    .nullable(),
});

export const PostAdminCreateProduct = z.object({
  products: z.array(productSchema),
});

export type Product = z.infer<typeof productSchema>;
export type Variant = z.infer<typeof variantSchema>;
