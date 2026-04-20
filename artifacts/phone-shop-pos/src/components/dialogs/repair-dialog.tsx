import React, { useEffect, useState, useMemo } from "react";
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
import { searchModels, getRepairsForModel, REPAIR_TYPES, type RepairPriceItem } from "@/lib/repair-pricing";
import { Smartphone, Battery, Zap, Layers, Wrench, Activity } from "lucide-react";
import { formatCurrency } from "@/lib/format";

const REPAIR_TYPE_ICONS: Record<string, React.ElementType> = {
  "Screen Replacement": Smartphone,
  "Battery Replacement": Battery,
  "Charging Port": Zap,
  "Back Glass": Layers,
  "Other": Wrench,
  "Diagnostic": Activity,
};

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

  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [modelQuery, setModelQuery] = useState("");
  const [selectedRepairTypes, setSelectedRepairTypes] = useState<string[]>([]);
  const [availableRepairs, setAvailableRepairs] = useState<RepairPriceItem[]>([]);

  const filteredModels = useMemo(() => searchModels(modelQuery), [modelQuery]);

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

  const deviceValue = form.watch("device");

  // When device changes, update available repairs
  useEffect(() => {
    if (deviceValue) {
      const repairs = getRepairsForModel(deviceValue);
      setAvailableRepairs(repairs);
    } else {
      setAvailableRepairs([]);
    }
  }, [deviceValue]);

  // When repair types change, update estimate and issue
  useEffect(() => {
    if (selectedRepairTypes.length > 0 && !repair) {
      const total = selectedRepairTypes.reduce((sum, rt) => {
        const priceItem = availableRepairs.find(r => r.repairType === rt);
        return sum + (priceItem?.basePrice ?? 0);
      }, 0);
      form.setValue("estimate", total);

      const issueText = selectedRepairTypes.join(", ");
      form.setValue("issue", issueText);
    }
  }, [selectedRepairTypes, availableRepairs, form, repair]);

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
      setModelQuery(repair.device);
      setSelectedRepairTypes([]);
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
      setModelQuery("");
      setSelectedRepairTypes([]);
    }
  }, [repair, form, open]);

  const toggleRepairType = (repairType: string) => {
    setSelectedRepairTypes(prev =>
      prev.includes(repairType)
        ? prev.filter(rt => rt !== repairType)
        : [...prev, repairType]
    );
  };

  const selectModel = (model: string) => {
    form.setValue("device", model);
    setModelQuery(model);
    setShowModelDropdown(false);
    setSelectedRepairTypes([]);
  };

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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{repair ? "Edit Repair Ticket" : "New Repair Ticket"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Customer */}
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
                        <SelectItem key={c.id} value={c.id.toString()}>{c.name} — {c.phone}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Device Model with Autocomplete */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 relative">
                <label className="text-sm font-medium leading-none">Device Model</label>
                <Input
                  placeholder="e.g. iPhone 15 Pro"
                  value={modelQuery}
                  onChange={(e) => {
                    setModelQuery(e.target.value);
                    form.setValue("device", e.target.value);
                    setShowModelDropdown(true);
                  }}
                  onFocus={() => setShowModelDropdown(true)}
                  onBlur={() => setTimeout(() => setShowModelDropdown(false), 200)}
                />
                {showModelDropdown && filteredModels.length > 0 && (
                  <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-popover border rounded-md shadow-lg max-h-48 overflow-y-auto">
                    {filteredModels.map(model => (
                      <button
                        key={model}
                        type="button"
                        className="w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors"
                        onMouseDown={(e) => { e.preventDefault(); selectModel(model); }}
                      >
                        {model}
                      </button>
                    ))}
                  </div>
                )}
                {form.formState.errors.device && (
                  <p className="text-sm text-destructive">{form.formState.errors.device.message}</p>
                )}
              </div>
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

            {/* Repair Type Grid — shown when a known model is selected */}
            {availableRepairs.length > 0 && !repair && (
              <div>
                <label className="text-sm font-medium leading-none mb-2 block">Repair Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {REPAIR_TYPES.map(rt => {
                    const priceItem = availableRepairs.find(r => r.repairType === rt.id);
                    const isAvailable = !!priceItem;
                    const isSelected = selectedRepairTypes.includes(rt.id);
                    const Icon = REPAIR_TYPE_ICONS[rt.id] ?? Wrench;

                    return (
                      <button
                        key={rt.id}
                        type="button"
                        disabled={!isAvailable}
                        onClick={() => isAvailable && toggleRepairType(rt.id)}
                        className={`flex flex-col items-center gap-1 p-3 rounded-lg border text-xs font-medium transition-all ${
                          !isAvailable
                            ? "opacity-30 cursor-not-allowed"
                            : isSelected
                              ? "bg-primary/10 border-primary text-primary ring-1 ring-primary"
                              : "hover:bg-accent cursor-pointer"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{rt.label}</span>
                        {isAvailable && (
                          <span className={`text-[10px] ${isSelected ? "text-primary font-bold" : "text-muted-foreground"}`}>
                            {formatCurrency(priceItem.basePrice)}
                          </span>
                        )}
                        {isAvailable && priceItem.estimatedTime && (
                          <span className="text-[10px] text-muted-foreground">{priceItem.estimatedTime}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
                {selectedRepairTypes.length > 0 && (
                  <div className="mt-2 p-2 bg-muted/50 rounded-md text-xs space-y-1">
                    {selectedRepairTypes.map(rt => {
                      const p = availableRepairs.find(r => r.repairType === rt);
                      return p ? (
                        <div key={rt} className="flex justify-between">
                          <span>{rt}</span>
                          <span className="font-medium">{formatCurrency(p.basePrice)}</span>
                        </div>
                      ) : null;
                    })}
                    <div className="flex justify-between border-t pt-1 font-bold">
                      <span>Total Estimate</span>
                      <span className="text-primary">
                        {formatCurrency(selectedRepairTypes.reduce((sum, rt) => {
                          const p = availableRepairs.find(r => r.repairType === rt);
                          return sum + (p?.basePrice ?? 0);
                        }, 0))}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Issue Description */}
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

            {/* Status & Due Date */}
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

            {/* Estimate & Deposit */}
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
