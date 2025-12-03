// src/modules/my-payment/index.ts
import PaynowProviderService from "./service";
import { ModuleProvider, Modules } from "@medusajs/framework/utils";

export default ModuleProvider(Modules.PAYMENT, {
  services: [PaynowProviderService],
});
