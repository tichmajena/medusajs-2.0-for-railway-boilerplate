// export default async function ({ container }) {
//   const orderModuleService = container.orderModuleService;
//   console.log(orderModuleService);

//   await orderModuleService.deleteOrders(["order_01JZA3SYYC3D49QH87F2ZH4X0T"]);
//   console.log("Order deleted");
// }

export default async function ({ container }) {
  const orderModuleService = container.resolve("order"); // if using IoC
  // OR, depending on your setup:
  // const orderModuleService = container.orderModuleService

  await orderModuleService.deleteOrders(["order_01JZA3SYYC3D49QH87F2ZH4X0T"]);
  console.log("Order deleted");
}
