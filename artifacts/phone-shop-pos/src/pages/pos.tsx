import React, { useEffect, useState } from "react";
import { useListProducts, useListCustomers, useCreateCustomer, useCreateSale, useCreateQuote, getListSalesQueryKey, getGetDashboardSummaryQueryKey, getListProductsQueryKey, getListLowStockProductsQueryKey, getListCustomersQueryKey, getListQuotesQueryKey } from "@/lib/supabase-hooks";
import type { Product } from "@/lib/supabase-hooks";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/format";
import { Search, ShoppingCart, Plus, Minus, Trash2, User, CreditCard, Banknote, Landmark, Smartphone, PauseCircle, RotateCcw, X, FileText, UserPlus, Edit2, Hash, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { SaleDialog } from "@/components/dialogs/sale-dialog";
import { ProductDialog } from "@/components/dialogs/product-dialog";

const categories = [
  { value: "all", label: "All" },
  { value: "phone", label: "Phones" },
  { value: "accessory", label: "Accessories" },
  { value: "part", label: "Parts" },
  { value: "service", label: "Services" },
] as const;

type CartItem = {
  product: Product;
  quantity: number;
  unitPrice: number;        // editable price override
  serialNumber: string;     // serial/IMEI tracking
};

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
  const [addProductOpen, setAddProductOpen] = useState(false);
  const [addCustomerOpen, setAddCustomerOpen] = useState(false);
  const [newCustName, setNewCustName] = useState("");
  const [newCustPhone, setNewCustPhone] = useState("");
  const [editingPriceId, setEditingPriceId] = useState<number | null>(null);
  const [editingSerialId, setEditingSerialId] = useState<number | null>(null);
  const [saleNote, setSaleNote] = useState("");

  const { data: products = [], isLoading: loadingProducts } = useListProducts({
    q: search || undefined,
    category: category === "all" ? undefined : category,
  });
  const { data: customers = [] } = useListCustomers();
  const createSale = useCreateSale();
  const createQuote = useCreateQuote();
  const createCustomer = useCreateCustomer();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerId, setCustomerId] = useState<number | undefined>();
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "transfer" | "mixed">("card");
  const [discount, setDiscount] = useState(0);

  const subtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const taxRate = 0.08;
  const tax = (subtotal - discount) * taxRate;
  const total = subtotal - discount + tax;
  const cartQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    const saved = window.localStorage.getItem("phone-shop-pos-held-sale");
    if (saved) {
      try { setHeldSale(JSON.parse(saved) as HeldSale); } catch { window.localStorage.removeItem("phone-shop-pos-held-sale"); }
    }
  }, []);

  const addToCart = (product: Product) => {
    setCart((current) => {
      const existing = current.find((item) => item.product.id === product.id);
      if (existing) {
        if (product.category !== "service" && existing.quantity >= product.stock) {
          toast({ title: "Stock limit reached", description: `${product.name} only has ${product.stock} available.`, variant: "destructive" });
          return current;
        }
        return current.map((item) => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      if (product.category !== "service" && product.stock < 1) {
        toast({ title: "Out of stock", description: `${product.name} cannot be added until stock is updated.`, variant: "destructive" });
        return current;
      }
      return [...current, { product, quantity: 1, unitPrice: product.salePrice, serialNumber: "" }];
    });
  };

  const updateQuantity = (productId: number, delta: number) => {
    setCart((current) =>
      current.map((item) => {
        if (item.product.id === productId) {
          const newQty = item.quantity + delta;
          if (item.product.category !== "service" && newQty > item.product.stock) {
            toast({ title: "Stock limit reached", variant: "destructive" });
            return item;
          }
          return newQty > 0 ? { ...item, quantity: newQty } : item;
        }
        return item;
      })
    );
  };

  const updatePrice = (productId: number, price: number) => {
    setCart((current) => current.map((item) => item.product.id === productId ? { ...item, unitPrice: price } : item));
  };

  const updateSerial = (productId: number, serial: string) => {
    setCart((current) => current.map((item) => item.product.id === productId ? { ...item, serialNumber: serial } : item));
  };

  const removeFromCart = (productId: number) => {
    setCart((current) => current.filter((item) => item.product.id !== productId));
  };

  const addBySku = () => {
    const code = search.trim().toLowerCase();
    if (!code) return;
    const match = products.find((product) => product.sku.toLowerCase() === code);
    if (match) { addToCart(match); setSearch(""); setSkuInput(""); }
  };

  const holdSale = () => {
    if (cart.length === 0) { toast({ title: "No items to hold" }); return; }
    const sale: HeldSale = { cart, customerId, paymentMethod, discount, createdAt: new Date().toISOString() };
    window.localStorage.setItem("phone-shop-pos-held-sale", JSON.stringify(sale));
    setHeldSale(sale);
    setCart([]); setCustomerId(undefined); setDiscount(0);
    toast({ title: "Sale held" });
  };

  const resumeHeldSale = () => {
    if (!heldSale) return;
    setCart(heldSale.cart); setCustomerId(heldSale.customerId); setPaymentMethod(heldSale.paymentMethod); setDiscount(heldSale.discount);
    setHeldSale(null); window.localStorage.removeItem("phone-shop-pos-held-sale");
    toast({ title: "Held sale resumed" });
  };

  const clearHeldSale = () => { setHeldSale(null); window.localStorage.removeItem("phone-shop-pos-held-sale"); };

  const handleAddCustomer = () => {
    if (!newCustName.trim() || !newCustPhone.trim()) { toast({ title: "Name and phone required", variant: "destructive" }); return; }
    createCustomer.mutate(
      { data: { name: newCustName.trim(), phone: newCustPhone.trim() } },
      {
        onSuccess: (customer) => {
          setCustomerId(customer.id);
          setAddCustomerOpen(false);
          setNewCustName(""); setNewCustPhone("");
          queryClient.invalidateQueries({ queryKey: getListCustomersQueryKey() });
          toast({ title: `Customer "${customer.name}" created` });
        },
        onError: () => toast({ title: "Failed to create customer", variant: "destructive" }),
      }
    );
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
          notes: saleNote,
          items: cart.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            serialNumber: item.serialNumber || undefined,
          })),
        },
      },
      {
        onSuccess: (sale) => {
          toast({ title: "Sale completed" });
          setReceiptSaleId(sale.id); setReceiptOpen(true);
          setCart([]); setCustomerId(undefined); setDiscount(0); setSaleNote("");
          queryClient.invalidateQueries({ queryKey: getListSalesQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
          queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getListLowStockProductsQueryKey() });
        },
        onError: () => toast({ title: "Checkout failed", variant: "destructive" }),
      }
    );
  };

  const handleSaveAsQuote = () => {
    if (cart.length === 0) return;
    createQuote.mutate(
      {
        data: {
          customerId,
          discount,
          tax,
          notes: saleNote,
          items: cart.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
        },
      },
      {
        onSuccess: (quote) => {
          toast({ title: `Quote ${quote.quoteNumber} saved` });
          setCart([]); setCustomerId(undefined); setDiscount(0); setSaleNote("");
          queryClient.invalidateQueries({ queryKey: getListQuotesQueryKey() });
        },
        onError: () => toast({ title: "Failed to save quote", variant: "destructive" }),
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
              placeholder="Search or scan SKU..."
              className="pl-9"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setSkuInput(e.target.value);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  addBySku();
                }
              }}
            />
          </div>
            <Button variant="outline" onClick={holdSale} className="hidden lg:inline-flex">
              <PauseCircle className="w-4 h-4 mr-2" /> Hold
            </Button>
            {heldSale && (
              <div className="hidden lg:flex items-center gap-1">
                <Button variant="secondary" onClick={resumeHeldSale}><RotateCcw className="w-4 h-4 mr-2" /> Resume</Button>
                <Button variant="ghost" size="icon" onClick={clearHeldSale}><X className="w-4 h-4" /></Button>
              </div>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((item) => (
              <button key={item.value} onClick={() => setCategory(item.value)}
                className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${category === item.value ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-accent"}`}>
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
            <Card key={product.id} className="cursor-pointer hover:border-primary/50 transition-colors flex flex-col min-h-[116px]" onClick={() => addToCart(product)}>
              <CardContent className="p-3 flex-1 flex flex-col justify-between">
                {product.imageUrl && (
                  <img src={product.imageUrl} alt={product.name} className="w-full h-16 object-contain mb-1 rounded" />
                )}
                <div>
                  <div className="text-[10px] leading-tight text-muted-foreground mb-1 truncate">{product.sku}</div>
                  <div className="font-medium text-xs leading-tight line-clamp-2 mb-2">{product.name}</div>
                </div>
                <div className="flex items-end justify-between gap-2 mt-2">
                  <div className="font-bold text-primary text-sm">{formatCurrency(product.salePrice)}</div>
                  <div className={`text-[10px] leading-tight px-1.5 py-1 rounded-md text-right ${product.category !== "service" && product.stock <= product.reorderLevel ? "bg-destructive/10 text-destructive" : "bg-accent"}`}>
                    {product.stock} in stock
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {products.length === 0 && !loadingProducts && (
            <div className="col-span-full py-12 text-center text-muted-foreground space-y-3">
              <p>No products found matching "{search}"</p>
              <Button variant="outline" onClick={() => setAddProductOpen(true)}>
                <Plus className="w-4 h-4 mr-2" /> Add New Product
              </Button>
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
          <div className="text-sm font-medium bg-primary/10 text-primary px-2 py-1 rounded">{cartQuantity} items</div>
        </CardHeader>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
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
                    <button onClick={() => updateQuantity(item.product.id, -1)} className="px-2 py-1 hover:bg-accent rounded-l-md"><Minus className="w-3 h-3" /></button>
                    <span className="text-xs font-medium w-8 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.product.id, 1)} className="px-2 py-1 hover:bg-accent rounded-r-md"><Plus className="w-3 h-3" /></button>
                  </div>
                  {/* Editable price */}
                  {editingPriceId === item.product.id ? (
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-muted-foreground">$</span>
                      <input
                        type="number"
                        step="0.01"
                        className="w-16 text-right text-sm font-medium bg-background border rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-primary"
                        value={item.unitPrice}
                        onChange={(e) => updatePrice(item.product.id, Number(e.target.value))}
                        onBlur={() => setEditingPriceId(null)}
                        onKeyDown={(e) => e.key === "Enter" && setEditingPriceId(null)}
                        autoFocus
                      />
                    </div>
                  ) : (
                    <button onClick={() => setEditingPriceId(item.product.id)} className="font-medium text-sm flex items-center gap-1 hover:text-primary transition-colors" title="Click to edit price">
                      {formatCurrency(item.unitPrice * item.quantity)}
                      <Edit2 className="w-3 h-3 opacity-0 group-hover:opacity-100" />
                    </button>
                  )}
                </div>
                {/* Price changed indicator */}
                {item.unitPrice !== item.product.salePrice && (
                  <div className="text-[10px] text-orange-600 flex items-center gap-1">
                    <Edit2 className="w-3 h-3" /> Price override: was {formatCurrency(item.product.salePrice)}
                  </div>
                )}
                {/* Serial/IMEI entry for phones */}
                {(item.product.category === "phone" || item.product.category === "part") && (
                  <div className="flex items-center gap-1">
                    <Hash className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                    {editingSerialId === item.product.id ? (
                      <input
                        className="flex-1 text-xs bg-background border rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary"
                        placeholder="Serial / IMEI"
                        value={item.serialNumber}
                        onChange={(e) => updateSerial(item.product.id, e.target.value)}
                        onBlur={() => setEditingSerialId(null)}
                        onKeyDown={(e) => e.key === "Enter" && setEditingSerialId(null)}
                        autoFocus
                      />
                    ) : (
                      <button onClick={() => setEditingSerialId(item.product.id)} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                        {item.serialNumber || "Add serial/IMEI"}
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <CardFooter className="border-t flex flex-col gap-3 p-4 bg-muted/20">
          <div className="w-full space-y-3">
            {/* Customer selector + inline add */}
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              {addCustomerOpen ? (
                <div className="flex-1 flex gap-1">
                  <input className="flex-1 text-sm bg-background border rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Name" value={newCustName} onChange={(e) => setNewCustName(e.target.value)} autoFocus />
                  <input className="w-24 text-sm bg-background border rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Phone" value={newCustPhone} onChange={(e) => setNewCustPhone(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddCustomer()} />
                  <button onClick={handleAddCustomer} className="px-2 py-1 bg-primary text-primary-foreground rounded text-xs"><Save className="w-3 h-3" /></button>
                  <button onClick={() => setAddCustomerOpen(false)} className="px-1"><X className="w-3 h-3" /></button>
                </div>
              ) : (
                <>
                  <select className="flex-1 text-sm bg-transparent border-b focus:outline-none focus:border-primary pb-1" value={customerId || ""} onChange={(e) => setCustomerId(e.target.value ? Number(e.target.value) : undefined)}>
                    <option value="">Walk-in Customer</option>
                    {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <button onClick={() => setAddCustomerOpen(true)} className="text-muted-foreground hover:text-primary transition-colors" title="Add new customer">
                    <UserPlus className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>

            {/* Sale note */}
            <div>
              <input className="w-full text-xs bg-transparent border-b focus:outline-none focus:border-primary pb-1" placeholder="Sale notes (optional)" value={saleNote} onChange={(e) => setSaleNote(e.target.value)} />
            </div>

            {/* Totals */}
            <div className="space-y-2 text-sm pt-2">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Discount</span>
                <input type="number" className="w-20 text-right bg-transparent border-b focus:outline-none focus:border-primary" value={discount || ""} onChange={(e) => setDiscount(Number(e.target.value))} placeholder="0.00" />
              </div>
              {subtotal > 0 && (
                <div className="grid grid-cols-4 gap-1">
                  {[0, 0.05, 0.1, 0.15].map((rate) => (
                    <button key={rate} className="rounded-md border bg-background px-2 py-1 text-xs hover:bg-accent" onClick={() => setDiscount(Number((subtotal * rate).toFixed(2)))}>
                      {rate === 0 ? "No disc." : `${Math.round(rate * 100)}%`}
                    </button>
                  ))}
                </div>
              )}
              <div className="flex justify-between"><span className="text-muted-foreground">Tax (8%)</span><span>{formatCurrency(tax)}</span></div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t"><span>Total</span><span className="text-primary">{formatCurrency(total)}</span></div>
            </div>

            {/* Payment method */}
            <div className="grid grid-cols-4 gap-2 pt-2">
              {([["card", CreditCard, "Card"], ["cash", Banknote, "Cash"], ["transfer", Landmark, "Bank"], ["mixed", Smartphone, "Mixed"]] as const).map(([method, Icon, label]) => (
                <button key={method} className={`flex flex-col items-center justify-center p-2 rounded-md border text-xs gap-1 transition-all ${paymentMethod === method ? "bg-primary/10 border-primary text-primary" : "bg-background hover:bg-accent"}`} onClick={() => setPaymentMethod(method)}>
                  <Icon className="w-4 h-4" /> {label}
                </button>
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1 text-xs h-10" disabled={cart.length === 0 || createQuote.isPending} onClick={handleSaveAsQuote}>
                <FileText className="w-4 h-4 mr-1" /> Save Quote
              </Button>
              <Button className="flex-[2] h-10 text-sm font-medium" disabled={cart.length === 0 || createSale.isPending} onClick={handleCheckout}>
                {createSale.isPending ? "Processing..." : `Charge ${formatCurrency(total)}`}
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
    <SaleDialog open={receiptOpen} onOpenChange={setReceiptOpen} saleId={receiptSaleId} />
    <ProductDialog open={addProductOpen} onOpenChange={setAddProductOpen} />
    </>
  );
}
