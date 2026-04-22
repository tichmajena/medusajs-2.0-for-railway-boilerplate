// other imports...
import * as zod from "zod";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { FocusModal, Heading, Label, Input, Button } from "@medusajs/ui";
import { sdk } from "../lib/sdk.js";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const schema = zod.object({
  name: zod.string(),
});

// validation schema...

export const CreateForm = () => {
  // ...
  const form = useForm<zod.infer<typeof schema>>({
    defaultValues: {
      name: "",
    },
  });

  const queryClient = useQueryClient();

  const createBrand = useMutation({
    mutationFn: (name: string) =>
      sdk.client.fetch("/admin/brands", {
        method: "POST",
        body: { name },
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
    createBrand.mutate(name);
   // console.log(name);
  });

  return (
    <FocusModal >
      <FocusModal.Trigger asChild>
        <Button>Create</Button>
      </FocusModal.Trigger>
      <FocusModal.Content className="mx-auto w-full max-w-lg h-96 !inset-y-16">
        <FormProvider {...form}>
          <form
            onSubmit={handleSubmit}
            className="flex  flex-col overflow-hidden px-4 h-full"
          >
            <FocusModal.Header>
             
            </FocusModal.Header>
            <FocusModal.Body>
              <div className="flex flex-1 flex-col items-center overflow-y-auto">
                <div className="mx-auto flex w-full max-w-[720px] flex-col gap-y-8 px-2 py-16">
                  <div>
                    <Heading className="capitalize">Create Item</Heading>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
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
                            <Input {...field} />
                          </div>
                        );
                      }}
                    />
                  </div>
                </div>
              </div>
            </FocusModal.Body>
            <FocusModal.Footer>
               <div className="flex items-center justify-end gap-x-2">
                <FocusModal.Close asChild>
                  <Button size="small" variant="secondary">
                    Cancel
                  </Button>
                </FocusModal.Close>
                <Button type="submit" size="small">
                  Save
                </Button>
              </div>
            </FocusModal.Footer>
          </form>
        </FormProvider>
      </FocusModal.Content>
    </FocusModal>
  );
};
