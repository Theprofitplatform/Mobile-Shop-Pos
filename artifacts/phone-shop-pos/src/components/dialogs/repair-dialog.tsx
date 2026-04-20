import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQueryClient } from "@tanstack/react-query";
import {
  useCreateRepair,
  useUpdateRepair,
  getListRepairsQueryKey,
  useListCustomers,
  RepairTicket,
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const repairSchema = z.object({
  customerId: z.coerce.number().min(1, "Customer is required"),
  device: z.string().min(1, "Device is required"),
  imei: z.string().optional(),
  issue: z.string().min(1, "Issue is required"),
  status: z.enum(["received", "diagnosing", "waiting_parts", "repairing", "ready", "completed", "cancelled"]),
  estimate: z.coerce.number().min(0),
  deposit: z.coerce.number().min(0),
  dueDate: z.string().optional().nullable(),
});

type RepairFormValues = z.infer<typeof repairSchema>;

interface RepairDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  repair?: RepairTicket | null;
}

export function RepairDialog({ open, onOpenChange, repair }: RepairDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createRepair = useCreateRepair();
  const updateRepair = useUpdateRepair();
  const { data: customers = [] } = useListCustomers();

  const form = useForm<RepairFormValues>({
    resolver: zodResolver(repairSchema),
    defaultValues: {
      customerId: 0,
      device: "",
      imei: "",
      issue: "",
      status: "received",
      estimate: 0,
      deposit: 0,
      dueDate: null,
    },
  });

  useEffect(() => {
    if (repair) {
      form.reset({
        customerId: repair.customerId,
        device: repair.device,
        imei: repair.imei || "",
        issue: repair.issue,
        status: repair.status,
        estimate: repair.estimate,
        deposit: repair.deposit,
        dueDate: repair.dueDate ? new Date(repair.dueDate).toISOString().slice(0, 16) : null,
      });
    } else {
      form.reset({
        customerId: 0,
        device: "",
        imei: "",
        issue: "",
        status: "received",
        estimate: 0,
        deposit: 0,
        dueDate: null,
      });
    }
  }, [repair, form, open]);

  const onSubmit = (data: RepairFormValues) => {
    if (repair) {
      updateRepair.mutate(
        { id: repair.id, data },
        {
          onSuccess: () => {
            toast({ title: "Repair ticket updated" });
            queryClient.invalidateQueries({ queryKey: getListRepairsQueryKey() });
            onOpenChange(false);
          },
          onError: () => toast({ title: "Failed to update ticket", variant: "destructive" }),
        }
      );
    } else {
      createRepair.mutate(
        { data },
        {
          onSuccess: () => {
            toast({ title: "Repair ticket created" });
            queryClient.invalidateQueries({ queryKey: getListRepairsQueryKey() });
            onOpenChange(false);
          },
          onError: () => toast({ title: "Failed to create ticket", variant: "destructive" }),
        }
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{repair ? "Edit Repair Ticket" : "New Repair Ticket"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="customerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer</FormLabel>
                  <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value ? field.value.toString() : ""}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Select Customer" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {customers.map((c) => (
                        <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="device"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Device</FormLabel>
                    <FormControl><Input placeholder="e.g. iPhone 13 Pro" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="imei"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>IMEI / Serial (Optional)</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="issue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Issue Description</FormLabel>
                  <FormControl><Textarea className="resize-none h-20" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="received">Received</SelectItem>
                        <SelectItem value="diagnosing">Diagnosing</SelectItem>
                        <SelectItem value="waiting_parts">Waiting Parts</SelectItem>
                        <SelectItem value="repairing">Repairing</SelectItem>
                        <SelectItem value="ready">Ready</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date (Optional)</FormLabel>
                    <FormControl><Input type="datetime-local" {...field} value={field.value || ""} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="estimate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estimated Cost</FormLabel>
                    <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="deposit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deposit Paid</FormLabel>
                    <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={createRepair.isPending || updateRepair.isPending}>
                {repair ? "Save Changes" : "Create Ticket"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
