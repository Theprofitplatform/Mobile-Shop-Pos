import React, { useState } from "react";
import { useListCustomers, useDeleteCustomer, useCustomerSalesHistory, getListCustomersQueryKey, Customer } from "@/lib/supabase-hooks";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatDate, formatCurrency } from "@/lib/format";
import { Search, Plus, User, Phone, Mail, FileText, Edit, Trash, ShoppingBag, X, Receipt } from "lucide-react";
import { CustomerDialog } from "@/components/dialogs/customer-dialog";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export default function Customers() {
  const [search, setSearch] = useState("");
  const { data: customers = [], isLoading } = useListCustomers({ q: search });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [historyCustomer, setHistoryCustomer] = useState<Customer | null>(null);
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
              <Card key={customer.id} className="hover:border-primary/30 transition-colors cursor-pointer" onClick={() => setHistoryCustomer(customer)}>
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

      {/* Sales History Panel */}
      {historyCustomer && (
        <div className="fixed inset-0 z-50 bg-black/50 flex justify-end" onClick={() => setHistoryCustomer(null)}>
          <div className="w-full max-w-lg bg-background h-full overflow-y-auto shadow-xl animate-in slide-in-from-right duration-300" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-background border-b px-6 py-4 flex items-center justify-between z-10">
              <div>
                <h2 className="text-lg font-bold">{historyCustomer.name}</h2>
                <p className="text-sm text-muted-foreground">{historyCustomer.phone}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setHistoryCustomer(null)}><X className="w-5 h-5" /></Button>
            </div>
            <div className="p-6">
              <CustomerSalesHistory customerId={historyCustomer.id} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CustomerSalesHistory({ customerId }: { customerId: number }) {
  const { data: sales = [], isLoading } = useCustomerSalesHistory(customerId);

  if (isLoading) return <div className="text-center py-8 text-muted-foreground">Loading...</div>;
  if (sales.length === 0) return (
    <div className="text-center py-12 text-muted-foreground space-y-2">
      <ShoppingBag className="w-12 h-12 mx-auto opacity-20" />
      <p>No purchase history yet</p>
    </div>
  );

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold flex items-center gap-2"><Receipt className="w-4 h-4" /> Purchase History ({sales.length})</h3>
      {sales.map((sale) => (
        <Card key={sale.id}>
          <CardContent className="p-4 space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-mono text-xs text-primary font-semibold">{sale.receiptNumber}</div>
                <div className="text-xs text-muted-foreground">{formatDate(sale.createdAt)}</div>
              </div>
              <div className="text-right">
                <div className="font-bold">{formatCurrency(sale.total)}</div>
                <div className="text-xs text-muted-foreground capitalize">{sale.paymentMethod}</div>
              </div>
            </div>
            <div className="border-t pt-2 space-y-1">
              {sale.items.map((item) => (
                <div key={item.id} className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{item.quantity}x {item.productName}</span>
                  <span>{formatCurrency(item.lineTotal)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
