import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { transform } from "@medusajs/framework/workflows-sdk";
import {
  createInventoryItemsWorkflow,
  createProductsWorkflow,
  useQueryGraphStep,
} from "@medusajs/medusa/core-flows";
// import { Product } from "./validators";

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  // Retrieve default store config
  const { data: stores } = useQueryGraphStep({
    entity: "store",
    fields: ["default_sales_channel_id", "default_location_id"],
  });

  const body = req.validatedBody as any;
  const default_location_id = stores[0].default_location_id;
  // Create inventory item with stocked quantity at a location

  const productsWithInventory = await Promise.all(
    body?.products?.map(async (product) => {
      const { result: inventoryItems } = await createInventoryItemsWorkflow(
        req.scope,
      ).run({
        input: {
          items: product.variants.map((variant) => {
            return {
              sku: variant.sku,
              title: variant.title,
              location_levels: [
                {
                  location_id: default_location_id, // your stock location ID
                  stocked_quantity: variant.stocked_quantity || 50,
                },
              ],
            };
          }),
        },
      });

      // Prepare inventory item IDs to pass to the variant
      // const inventoryItemIds = transform({ inventoryItems }, (data) => {
      //   return data.inventoryItems.map((item) => ({
      //     inventory_item_id: item.id,
      //     required_quantity: 1,
      //   }));
      // });

      const inventoryItemIds = inventoryItems.map((item) => ({
        inventory_item_id: item.id,
        required_quantity: 1,
      }));

      return {
        ...product,
        variants: product.variants.map(
          ({ stocked_quantity, ...variant }, i: number) => {
            return { ...variant, inventory_items: [inventoryItemIds[i]] };
          },
        ),
      };
    }),
  );

  const { result } = await createProductsWorkflow(req.scope).run({
    input: { products: productsWithInventory } as any,
  });

  res.send(result);
};
