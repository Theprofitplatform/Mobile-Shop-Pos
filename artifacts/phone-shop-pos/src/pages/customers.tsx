import React, { useState } from "react";
import { useListCustomers, useDeleteCustomer, getListCustomersQueryKey, Customer } from "@/lib/supabase-hooks";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import { Search, Plus, User, Phone, Mail, FileText, Edit, Trash } from "lucide-react";
import { CustomerDialog } from "@/components/dialogs/customer-dialog";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export default function Customers() {
  const [search, setSearch] = useState("");
  const { data: customers = [], isLoading } = useListCustomers({ q: search });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const deleteCustomer = useDeleteCustomer();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleAdd = () => {
    setSelectedCustomer(null);
    setDialogOpen(true);
  };

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this customer?")) {
      deleteCustomer.mutate(
        { id },
        {
          onSuccess: () => {
            toast({ title: "Customer deleted" });
            queryClient.invalidateQueries({ queryKey: getListCustomersQueryKey() });
          },
          onError: () => toast({ title: "Failed to delete customer", variant: "destructive" }),
        }
      );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
        <Button className="gap-2" onClick={handleAdd}>
          <Plus className="w-4 h-4" /> New Customer
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="p-4 border-b flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search customers by name, phone, email..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="text-sm text-muted-foreground">
              {customers.length} records
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-muted/10">
            {isLoading ? (
              <div className="col-span-full text-center py-8">Loading...</div>
            ) : customers.map((customer) => (
              <Card key={customer.id} className="hover:border-primary/30 transition-colors">
                <CardContent className="p-5 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {customer.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold">{customer.name}</div>
                        <div className="text-xs text-muted-foreground">Joined {formatDate(customer.createdAt).split(',')[0]}</div>
                      </div>
                    </div>
                    <div className="flex gap-1 -mt-1 -mr-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => handleEdit(customer)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(customer.id)}>
                        <Trash className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground/70" />
                      {customer.phone || 'No phone'}
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground/70" />
                      {customer.email || 'No email'}
                    </div>
                    {customer.deviceNotes && (
                      <div className="flex items-start gap-2 pt-2 border-t mt-2 text-xs">
                        <FileText className="w-4 h-4 text-muted-foreground/70 shrink-0" />
                        <span className="line-clamp-2">{customer.deviceNotes}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            {!isLoading && customers.length === 0 && (
              <div className="col-span-full py-12 text-center text-muted-foreground bg-card rounded-lg border border-dashed">
                No customers found.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      <CustomerDialog open={dialogOpen} onOpenChange={setDialogOpen} customer={selectedCustomer} />
    </div>
  );
}
