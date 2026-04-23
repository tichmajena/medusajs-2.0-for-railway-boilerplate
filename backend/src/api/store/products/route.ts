import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import {
  createInventoryItemsWorkflow,
  createProductsWorkflow,
  CreateProductsWorkflowInput,
  useQueryGraphStep,
} from "@medusajs/medusa/core-flows";
import { Product } from "./validators";

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  // Retrieve default store config
  const { data: stores } = useQueryGraphStep({
    entity: "store",
    fields: ["default_sales_channel_id", "default_location_id"],
  });

  const { products } = req.validatedBody as { products: Product[] };
  const default_location_id = stores[0].default_location_id;

  const productsWithInventory = await Promise.all(
    products.map(async (product) => {
      const { result: createdInventoryItems } =
        await createInventoryItemsWorkflow(req.scope).run({
          input: {
            items: product.variants.map((variant) => ({
              sku: variant.sku,
              title: variant.title,
              location_levels: [
                {
                  location_id: default_location_id,
                  stocked_quantity: variant.stocked_quantity || 50,
                },
              ],
            })),
          },
        });

      const inventoryItemIds = createdInventoryItems.map((item) => ({
        inventory_item_id: item.id,
        required_quantity: 1,
      }));

      return {
        ...product,
        variants: product.variants.map(
          ({ stocked_quantity, ...variant }, i: number) => ({
            ...variant,
            inventory_items: [inventoryItemIds[i]],
          }),
        ),
      };
    }),
  );

  const { result } = await createProductsWorkflow(req.scope).run({
    input: { products: productsWithInventory } as CreateProductsWorkflowInput,
  });

  res.send(result);
};
