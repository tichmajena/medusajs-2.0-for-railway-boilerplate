import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { createProductsWorkflow } from "@medusajs/medusa/core-flows";

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const { result } = await createProductsWorkflow(req.scope).run({
    input: req.validatedBody as any,
  });

  res.send(result);
};
