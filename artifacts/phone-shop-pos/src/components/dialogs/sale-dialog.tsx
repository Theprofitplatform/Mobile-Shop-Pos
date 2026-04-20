import React from "react";
import { useGetSale } from "@/lib/supabase-hooks";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatCurrency, formatDate } from "@/lib/format";
import { Receipt, User, Phone, Mail, FileText, CreditCard, Banknote, Landmark, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SaleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  saleId: number | null;
}

export function SaleDialog({ open, onOpenChange, saleId }: SaleDialogProps) {
  const { data: sale, isLoading } = useGetSale(saleId as number, {
    query: {
      enabled: !!saleId,
      queryKey: ["/api/sales", saleId] as any, // fallback for key
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-primary" /> 
            Receipt {sale?.receiptNumber}
          </DialogTitle>
        </DialogHeader>
        
        {isLoading ? (
          <div className="py-8 text-center text-muted-foreground">Loading receipt details...</div>
        ) : sale ? (
          <div className="space-y-6">
            <div className="flex justify-between text-sm">
              <div className="text-muted-foreground">
                Date: <span className="text-foreground font-medium">{formatDate(sale.createdAt)}</span>
              </div>
              <div className="text-muted-foreground">
                Payment: <span className="text-foreground font-medium capitalize">{sale.paymentMethod}</span>
              </div>
            </div>

            <div className="bg-muted/20 p-4 rounded-lg border">
              <h3 className="font-semibold text-sm mb-3">Customer</h3>
              {sale.customerName ? (
                <div className="text-sm font-medium">{sale.customerName}</div>
              ) : (
                <div className="text-sm text-muted-foreground italic">Walk-in Customer</div>
              )}
            </div>

            <div>
              <h3 className="font-semibold text-sm mb-3 border-b pb-2">Items</h3>
              <div className="space-y-3">
                {sale.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <div>
                      <div className="font-medium">{item.productName}</div>
                      <div className="text-xs text-muted-foreground">{item.quantity} x {formatCurrency(item.unitPrice)}</div>
                    </div>
                    <div className="font-medium">
                      {formatCurrency(item.lineTotal)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t pt-3 space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatCurrency(sale.subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Discount</span>
                <span>-{formatCurrency(sale.discount)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Tax</span>
                <span>{formatCurrency(sale.tax)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t text-primary">
                <span>Total</span>
                <span>{formatCurrency(sale.total)}</span>
              </div>
            </div>
            
            {sale.notes && (
              <div className="bg-muted/20 p-3 rounded-md border text-sm text-muted-foreground">
                <span className="font-medium text-foreground block mb-1">Notes:</span>
                {sale.notes}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
              <Button onClick={() => window.print()}>Print Receipt</Button>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-destructive">Failed to load receipt.</div>
        )}
      </DialogContent>
    </Dialog>
  );
}
