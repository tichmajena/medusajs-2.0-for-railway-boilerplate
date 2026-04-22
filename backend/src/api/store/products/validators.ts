import { z } from "zod";

export const PostAdminCreateProduct = z.object({
  products: z.array(
    z.object({
      title: z.string(),
      status: z.string(),
      options: z.array(
        z.object({
          title: z.string(),
          values: z.array(z.string()),
        }),
      ),
      variants: z.array(
        z.object({
          title: z.string(),
          sku: z.string(),
          manage_inventory: z.boolean(),
          allow_backorder: z.boolean(),
          prices: z.array(
            z.object({
              currency_code: z.string(),
              amount: z.number(),
            }),
          ),
        }),
      ),
      shipping_profile_id: z.string(),
    }),
  ),
});
