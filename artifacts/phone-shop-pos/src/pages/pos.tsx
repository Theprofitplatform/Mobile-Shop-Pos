import React, { useState } from "react";
import { useListProducts, useListCustomers, useCreateSale, getListSalesQueryKey, getGetDashboardSummaryQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/format";
import { Search, ShoppingCart, Plus, Minus, Trash2, User, CreditCard, Banknote, Landmark, Smartphone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export default function Pos() {
  const [search, setSearch] = useState("");
  const { data: products = [], isLoading: loadingProducts } = useListProducts({ q: search });
  const { data: customers = [] } = useListCustomers();
  const createSale = useCreateSale();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [cart, setCart] = useState<Array<{ product: any; quantity: number }>>([]);
  const [customerId, setCustomerId] = useState<number | undefined>();
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "transfer" | "mixed">("card");
  const [discount, setDiscount] = useState(0);

  const subtotal = cart.reduce((sum, item) => sum + item.product.salePrice * item.quantity, 0);
  const taxRate = 0.08; // 8% placeholder
  const tax = (subtotal - discount) * taxRate;
  const total = subtotal - discount + tax;

  const addToCart = (product: any) => {
    setCart((current) => {
      const existing = current.find((item) => item.product.id === product.id);
      if (existing) {
        return current.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...current, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: number, delta: number) => {
    setCart((current) =>
      current.map((item) => {
        if (item.product.id === productId) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : item;
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId: number) => {
    setCart((current) => current.filter((item) => item.product.id !== productId));
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;

    createSale.mutate(
      {
        data: {
          customerId,
          paymentMethod,
          discount,
          tax,
          items: cart.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
            unitPrice: item.product.salePrice,
          })),
        },
      },
      {
        onSuccess: () => {
          toast({ title: "Sale completed", description: "Receipt generated successfully." });
          setCart([]);
          setCustomerId(undefined);
          setDiscount(0);
          queryClient.invalidateQueries({ queryKey: getListSalesQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
        },
        onError: () => {
          toast({ title: "Checkout failed", description: "Could not complete the sale.", variant: "destructive" });
        },
      }
    );
  };

  return (
    <div className="h-[calc(100vh-8rem)] md:h-[calc(100vh-4rem)] flex flex-col md:flex-row gap-6 animate-in fade-in duration-500">
      {/* Products Selection */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search products by name or SKU..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-1">
          {products.map((product) => (
            <Card 
              key={product.id} 
              className="cursor-pointer hover:border-primary/50 transition-colors flex flex-col"
              onClick={() => addToCart(product)}
            >
              <CardContent className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">{product.sku}</div>
                  <div className="font-medium text-sm leading-tight line-clamp-2 mb-2">{product.name}</div>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="font-bold text-primary">{formatCurrency(product.salePrice)}</div>
                  <div className="text-xs px-2 py-1 bg-accent rounded-md">{product.stock} in stock</div>
                </div>
              </CardContent>
            </Card>
          ))}
          {products.length === 0 && !loadingProducts && (
            <div className="col-span-full py-12 text-center text-muted-foreground">
              No products found matching "{search}"
            </div>
          )}
        </div>
      </div>

      {/* Cart Sidebar */}
      <Card className="w-full md:w-96 flex flex-col h-full flex-shrink-0">
        <CardHeader className="border-b px-4 py-3 flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-lg flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" /> Current Sale
          </CardTitle>
          <div className="text-sm font-medium bg-primary/10 text-primary px-2 py-1 rounded">
            {cart.length} items
          </div>
        </CardHeader>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-2">
              <ShoppingCart className="w-12 h-12 opacity-20" />
              <p>Cart is empty</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.product.id} className="flex flex-col gap-2 p-3 border rounded-md bg-card hover:bg-accent/50 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="font-medium text-sm line-clamp-1 flex-1 pr-2">{item.product.name}</div>
                  <button onClick={() => removeFromCart(item.product.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center border rounded-md bg-background">
                    <button onClick={() => updateQuantity(item.product.id, -1)} className="px-2 py-1 hover:bg-accent rounded-l-md">
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-medium w-8 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.product.id, 1)} className="px-2 py-1 hover:bg-accent rounded-r-md">
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="font-medium text-sm">
                    {formatCurrency(item.product.salePrice * item.quantity)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <CardFooter className="border-t flex flex-col gap-4 p-4 bg-muted/20">
          <div className="w-full space-y-3">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <select
                className="flex-1 text-sm bg-transparent border-b focus:outline-none focus:border-primary pb-1"
                value={customerId || ""}
                onChange={(e) => setCustomerId(e.target.value ? Number(e.target.value) : undefined)}
              >
                <option value="">Walk-in Customer</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2 text-sm pt-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Discount</span>
                <input
                  type="number"
                  className="w-20 text-right bg-transparent border-b focus:outline-none focus:border-primary"
                  value={discount || ""}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  placeholder="0.00"
                />
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax (8%)</span>
                <span>{formatCurrency(tax)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>Total</span>
                <span className="text-primary">{formatCurrency(total)}</span>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 pt-2">
              <button
                className={`flex flex-col items-center justify-center p-2 rounded-md border text-xs gap-1 transition-all ${paymentMethod === 'card' ? 'bg-primary/10 border-primary text-primary' : 'bg-background hover:bg-accent'}`}
                onClick={() => setPaymentMethod('card')}
              >
                <CreditCard className="w-4 h-4" /> Card
              </button>
              <button
                className={`flex flex-col items-center justify-center p-2 rounded-md border text-xs gap-1 transition-all ${paymentMethod === 'cash' ? 'bg-primary/10 border-primary text-primary' : 'bg-background hover:bg-accent'}`}
                onClick={() => setPaymentMethod('cash')}
              >
                <Banknote className="w-4 h-4" /> Cash
              </button>
              <button
                className={`flex flex-col items-center justify-center p-2 rounded-md border text-xs gap-1 transition-all ${paymentMethod === 'transfer' ? 'bg-primary/10 border-primary text-primary' : 'bg-background hover:bg-accent'}`}
                onClick={() => setPaymentMethod('transfer')}
              >
                <Landmark className="w-4 h-4" /> Bank
              </button>
              <button
                className={`flex flex-col items-center justify-center p-2 rounded-md border text-xs gap-1 transition-all ${paymentMethod === 'mixed' ? 'bg-primary/10 border-primary text-primary' : 'bg-background hover:bg-accent'}`}
                onClick={() => setPaymentMethod('mixed')}
              >
                <Smartphone className="w-4 h-4" /> Mixed
              </button>
            </div>

            <Button
              className="w-full h-12 text-base font-medium mt-2"
              disabled={cart.length === 0 || createSale.isPending}
              onClick={handleCheckout}
            >
              {createSale.isPending ? "Processing..." : `Charge ${formatCurrency(total)}`}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
