import React, { useEffect, useState } from "react";
import { useListProducts, useListCustomers, useCreateSale, getListSalesQueryKey, getGetDashboardSummaryQueryKey, getListProductsQueryKey, getListLowStockProductsQueryKey } from "@/lib/supabase-hooks";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/format";
import { Search, ShoppingCart, Plus, Minus, Trash2, User, CreditCard, Banknote, Landmark, Smartphone, ScanLine, PauseCircle, RotateCcw, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { SaleDialog } from "@/components/dialogs/sale-dialog";

const categories = [
  { value: "all", label: "All" },
  { value: "phone", label: "Phones" },
  { value: "accessory", label: "Accessories" },
  { value: "part", label: "Parts" },
  { value: "service", label: "Services" },
] as const;

type CartItem = { product: any; quantity: number };
type HeldSale = {
  cart: CartItem[];
  customerId?: number;
  paymentMethod: "cash" | "card" | "transfer" | "mixed";
  discount: number;
  createdAt: string;
};

export default function Pos() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<(typeof categories)[number]["value"]>("all");
  const [skuInput, setSkuInput] = useState("");
  const [heldSale, setHeldSale] = useState<HeldSale | null>(null);
  const [receiptSaleId, setReceiptSaleId] = useState<number | null>(null);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const { data: products = [], isLoading: loadingProducts } = useListProducts({
    q: search || undefined,
    category: category === "all" ? undefined : category,
  });
  const { data: customers = [] } = useListCustomers();
  const createSale = useCreateSale();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerId, setCustomerId] = useState<number | undefined>();
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "transfer" | "mixed">("card");
  const [discount, setDiscount] = useState(0);

  const subtotal = cart.reduce((sum, item) => sum + item.product.salePrice * item.quantity, 0);
  const taxRate = 0.08; // 8% placeholder
  const tax = (subtotal - discount) * taxRate;
  const total = subtotal - discount + tax;
  const cartQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    const saved = window.localStorage.getItem("phone-shop-pos-held-sale");
    if (saved) {
      try {
        setHeldSale(JSON.parse(saved) as HeldSale);
      } catch {
        window.localStorage.removeItem("phone-shop-pos-held-sale");
      }
    }
  }, []);

  const addToCart = (product: any) => {
    setCart((current) => {
      const existing = current.find((item) => item.product.id === product.id);
      if (existing) {
        if (product.category !== "service" && existing.quantity >= product.stock) {
          toast({
            title: "Stock limit reached",
            description: `${product.name} only has ${product.stock} available.`,
            variant: "destructive",
          });
          return current;
        }
        return current.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      if (product.category !== "service" && product.stock < 1) {
        toast({
          title: "Out of stock",
          description: `${product.name} cannot be added until stock is updated.`,
          variant: "destructive",
        });
        return current;
      }
      return [...current, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: number, delta: number) => {
    setCart((current) =>
      current.map((item) => {
        if (item.product.id === productId) {
          const newQty = item.quantity + delta;
          if (item.product.category !== "service" && newQty > item.product.stock) {
            toast({
              title: "Stock limit reached",
              description: `${item.product.name} only has ${item.product.stock} available.`,
              variant: "destructive",
            });
            return item;
          }
          return newQty > 0 ? { ...item, quantity: newQty } : item;
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId: number) => {
    setCart((current) => current.filter((item) => item.product.id !== productId));
  };

  const addBySku = () => {
    const code = skuInput.trim().toLowerCase();
    if (!code) return;
    const match = products.find((product) => product.sku.toLowerCase() === code);
    if (!match) {
      toast({
        title: "Product not found",
        description: `No product matches SKU or barcode "${skuInput}".`,
        variant: "destructive",
      });
      return;
    }
    addToCart(match);
    setSkuInput("");
  };

  const holdSale = () => {
    if (cart.length === 0) {
      toast({ title: "No items to hold", description: "Add products before holding a sale." });
      return;
    }

    const sale: HeldSale = {
      cart,
      customerId,
      paymentMethod,
      discount,
      createdAt: new Date().toISOString(),
    };
    window.localStorage.setItem("phone-shop-pos-held-sale", JSON.stringify(sale));
    setHeldSale(sale);
    setCart([]);
    setCustomerId(undefined);
    setDiscount(0);
    toast({ title: "Sale held", description: "You can resume it from the POS toolbar." });
  };

  const resumeHeldSale = () => {
    if (!heldSale) return;
    setCart(heldSale.cart);
    setCustomerId(heldSale.customerId);
    setPaymentMethod(heldSale.paymentMethod);
    setDiscount(heldSale.discount);
    setHeldSale(null);
    window.localStorage.removeItem("phone-shop-pos-held-sale");
    toast({ title: "Held sale resumed", description: "The cart is ready to continue." });
  };

  const clearHeldSale = () => {
    setHeldSale(null);
    window.localStorage.removeItem("phone-shop-pos-held-sale");
    toast({ title: "Held sale cleared" });
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
        onSuccess: (sale) => {
          toast({ title: "Sale completed", description: "Receipt generated successfully." });
          setReceiptSaleId(sale.id);
          setReceiptOpen(true);
          setCart([]);
          setCustomerId(undefined);
          setDiscount(0);
          queryClient.invalidateQueries({ queryKey: getListSalesQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
          queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getListLowStockProductsQueryKey() });
        },
        onError: () => {
          toast({ title: "Checkout failed", description: "Could not complete the sale.", variant: "destructive" });
        },
      }
    );
  };

  return (
    <>
    <div className="h-[calc(100vh-8rem)] md:h-[calc(100vh-4rem)] flex flex-col md:flex-row gap-6 animate-in fade-in duration-500">
      {/* Products Selection */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search products by name or SKU..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
            <div className="relative w-64 hidden lg:block">
              <ScanLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Scan or enter SKU"
                className="pl-9 pr-16"
                value={skuInput}
                onChange={(e) => setSkuInput(e.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") addBySku();
                }}
              />
              <Button size="sm" className="absolute right-1 top-1 h-8 px-2" onClick={addBySku}>
                Add
              </Button>
            </div>
            <Button variant="outline" onClick={holdSale} className="hidden lg:inline-flex">
              <PauseCircle className="w-4 h-4 mr-2" />
              Hold
            </Button>
            {heldSale && (
              <div className="hidden lg:flex items-center gap-1">
                <Button variant="secondary" onClick={resumeHeldSale}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Resume
                </Button>
                <Button variant="ghost" size="icon" onClick={clearHeldSale}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((item) => (
              <button
                key={item.value}
                onClick={() => setCategory(item.value)}
                className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                  category === item.value
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background hover:bg-accent"
                }`}
              >
                {item.label}
              </button>
            ))}
            <div className="ml-auto hidden md:flex items-center gap-2 text-xs text-muted-foreground">
              <span>{products.length} products shown</span>
              {heldSale && <span className="text-primary font-medium">1 held sale</span>}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 auto-rows-min content-start gap-2 p-1">
          {products.map((product) => (
            <Card 
              key={product.id} 
              className="cursor-pointer hover:border-primary/50 transition-colors flex flex-col min-h-[116px]"
              onClick={() => addToCart(product)}
            >
              <CardContent className="p-3 flex-1 flex flex-col justify-between">
                <div>
                  <div className="text-[10px] leading-tight text-muted-foreground mb-1 truncate">{product.sku}</div>
                  <div className="font-medium text-xs leading-tight line-clamp-2 mb-2">{product.name}</div>
                </div>
                <div className="flex items-end justify-between gap-2 mt-2">
                  <div className="font-bold text-primary text-sm">{formatCurrency(product.salePrice)}</div>
                  <div className={`text-[10px] leading-tight px-1.5 py-1 rounded-md text-right ${
                    product.category !== "service" && product.stock <= product.reorderLevel
                      ? "bg-destructive/10 text-destructive"
                      : "bg-accent"
                  }`}>
                    {product.stock} in stock
                  </div>
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
            {cartQuantity} items
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
              {subtotal > 0 && (
                <div className="grid grid-cols-4 gap-1">
                  {[0, 0.05, 0.1, 0.15].map((rate) => (
                    <button
                      key={rate}
                      className="rounded-md border bg-background px-2 py-1 text-xs hover:bg-accent"
                      onClick={() => setDiscount(Number((subtotal * rate).toFixed(2)))}
                    >
                      {rate === 0 ? "No disc." : `${Math.round(rate * 100)}%`}
                    </button>
                  ))}
                </div>
              )}
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
    <SaleDialog open={receiptOpen} onOpenChange={setReceiptOpen} saleId={receiptSaleId} />
    </>
  );
}
