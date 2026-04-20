import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQueryClient } from "@tanstack/react-query";
import {
  useCreateCustomer,
  useUpdateCustomer,
  getListCustomersQueryKey,
  Customer,
} from "@/lib/supabase-hooks";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const customerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(1, "Phone is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  deviceNotes: z.string().optional(),
});

type CustomerFormValues = z.infer<typeof customerSchema>;

interface CustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer?: Customer | null;
}

export function CustomerDialog({ open, onOpenChange, customer }: CustomerDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      deviceNotes: "",
    },
  });

  useEffect(() => {
    if (customer) {
      form.reset({
        name: customer.name,
        phone: customer.phone,
        email: customer.email || "",
        deviceNotes: customer.deviceNotes || "",
      });
    } else {
      form.reset({
        name: "",
        phone: "",
        email: "",
        deviceNotes: "",
      });
    }
  }, [customer, form, open]);

  const onSubmit = (data: CustomerFormValues) => {
    if (customer) {
      updateCustomer.mutate(
        { id: customer.id, data },
        {
          onSuccess: () => {
            toast({ title: "Customer updated successfully" });
            queryClient.invalidateQueries({ queryKey: getListCustomersQueryKey() });
            onOpenChange(false);
          },
          onError: () => toast({ title: "Failed to update customer", variant: "destructive" }),
        }
      );
    } else {
      createCustomer.mutate(
        { data },
        {
          onSuccess: () => {
            toast({ title: "Customer created successfully" });
            queryClient.invalidateQueries({ queryKey: getListCustomersQueryKey() });
            onOpenChange(false);
          },
          onError: () => toast({ title: "Failed to create customer", variant: "destructive" }),
        }
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{customer ? "Edit Customer" : "Add Customer"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl><Input {...field} type="tel" /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email (Optional)</FormLabel>
                  <FormControl><Input {...field} type="email" /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="deviceNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Device Notes / History</FormLabel>
                  <FormControl><Textarea {...field} className="resize-none h-24" /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={createCustomer.isPending || updateCustomer.isPending}>
                {customer ? "Save Changes" : "Create Customer"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
