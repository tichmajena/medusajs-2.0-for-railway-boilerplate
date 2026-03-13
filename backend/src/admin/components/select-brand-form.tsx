import * as zod from "zod";
import { useForm } from "react-hook-form";
import { Drawer, Heading, Label, Input, Select, Button } from "@medusajs/ui";
import { FormProvider, Controller } from "react-hook-form";
import { sdk } from "../lib/sdk.js";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { DataTablePaginationState } from "@medusajs/ui";

type Brand = {
  id: string;
  name: string;
};
type BrandsResponse = {
  brands: Brand[];
  count: number;
  limit: number;
  offset: number;
};

const schema = zod.object({
  id: zod.string(),
  name: zod.string(),
});

export const SelectBrandForm = ({product}:any) => {
  console.log(product)
  const limit = 100;
  const [pagination, setPagination] = useState<DataTablePaginationState>({
    pageSize: limit,
    pageIndex: 0,
  });
  const offset = useMemo(() => {
    return pagination.pageIndex * limit;
  }, [pagination]);

  const form = useForm<zod.infer<typeof schema>>({
    defaultValues: {
      name: "",
    },
  });

    const queryClient = useQueryClient();

  const updateProduct = useMutation({
    mutationFn: ({brand_id, product_id}:{brand_id:string, product_id:string} ) =>
      sdk.admin.product.update(product_id, {
 
  additional_data: { brand_id },
}),
    onSuccess: () => {
      console.log("Zvafaya")
      queryClient.invalidateQueries(["brands"]); // or whatever query key you use
      // close drawer/modal here (if you control that state)
    },
    onError: (e) => {
      console.log(e);
    },
  });

  const handleSubmit = form.handleSubmit(({ name }) => {
    // TODO: submit to backend
    const brand_id:string = name;
    const product_id :string= product.id;
    updateProduct.mutate({brand_id, product_id})
  });

  const { data, isLoading } = useQuery<BrandsResponse>({
    queryFn: () =>
      sdk.client.fetch(`/admin/brands`, {
        query: {
          limit,
          offset,
        },
      }),
    queryKey: [["brands", limit, offset]],
  });

  return (
    <Drawer>
      <Drawer.Trigger asChild>
        <Button>Edit</Button>
      </Drawer.Trigger>
      <Drawer.Content>
        <FormProvider {...form}>
          <form
            onSubmit={handleSubmit}
            className="flex flex-1 flex-col overflow-hidden"
          >
            <Drawer.Header>
              <Heading className="capitalize">Edit Brand</Heading>
            </Drawer.Header>
            <Drawer.Body className="flex max-w-full flex-1 flex-col gap-y-8 overflow-y-auto">
              <Controller
                control={form.control}
                name="name"
                render={({ field }) => {
                  return (
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center gap-x-1">
                        <Label size="small" weight="plus">
                          Name
                        </Label>
                      </div>
                      {/* <Input {...field} /> */}
                      <Select
                        value={product.brand?.id || field.value}
                        onValueChange={field.onChange}
                        disabled={isLoading}
                      >
                        <Select.Trigger className="w-full" >{product.brand?.name || 'Select'}</Select.Trigger>
                        <Select.Content>
                          {data?.brands?.map((brand) => (
                            <Select.Item key={brand.id} value={brand.id}>
                              {brand.name}
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select>
                    </div>
                  );
                }}
              />
            </Drawer.Body>
            <Drawer.Footer>
              <div className="flex items-center justify-end gap-x-2">
                <Drawer.Close asChild>
                  <Button size="small" variant="secondary">
                    Cancel
                  </Button>
                </Drawer.Close>
                <Button size="small" type="submit">
                  Save
                </Button>
              </div>
            </Drawer.Footer>
          </form>
        </FormProvider>
      </Drawer.Content>
    </Drawer>
  );
};
