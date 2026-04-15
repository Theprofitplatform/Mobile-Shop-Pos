import React, { useMemo, useState } from "react";
import {
  getListProductsQueryKey,
  getListStockAdjustmentsQueryKey,
  useCreateStockAdjustment,
  useListProducts,
  useListStockAdjustments,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/format";
import { AlertTriangle, ArrowDown, ArrowUp, ClipboardList, PackageCheck, RotateCcw } from "lucide-react";

const adjustmentTypes = [
  { value: "restock", label: "Restock", direction: 1, icon: ArrowUp },
  { value: "return", label: "Customer Return", direction: 1, icon: RotateCcw },
  { value: "damage", label: "Damaged / Lost", direction: -1, icon: ArrowDown },
  { value: "correction", label: "Manual Correction", direction: 1, icon: ClipboardList },
] as const;

export default function StockControl() {
  const { data: products = [], isLoading: loadingProducts } = useListProducts();
  const { data: adjustments = [], isLoading: loadingAdjustments } = useListStockAdjustments();
  const createAdjustment = useCreateStockAdjustment();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [productId, setProductId] = useState("");
  const [type, setType] = useState<(typeof adjustmentTypes)[number]["value"]>("restock");
  const [quantity, setQuantity] = useState("1");
  const [note, setNote] = useState("");

  const selectedProduct = products.find((product) => product.id === Number(productId));
  const selectedType = adjustmentTypes.find((item) => item.value === type) ?? adjustmentTypes[0];
  const lowStockProducts = useMemo(
    () => products.filter((product) => product.stock <= product.reorderLevel && product.category !== "service"),
    [products],
  );
  const adjustedQuantity = Math.abs(Number(quantity) || 0) * selectedType.direction;
  const projectedStock = selectedProduct ? selectedProduct.stock + adjustedQuantity : null;

  const submitAdjustment = () => {
    if (!selectedProduct) {
      toast({ title: "Choose a product first", variant: "destructive" });
      return;
    }
    if (!Number.isFinite(Number(quantity)) || Number(quantity) <= 0) {
      toast({ title: "Enter a positive quantity", variant: "destructive" });
      return;
    }
    if (projectedStock !== null && projectedStock < 0) {
      toast({ title: "Adjustment would make stock negative", variant: "destructive" });
      return;
    }

    createAdjustment.mutate(
      {
        data: {
          productId: selectedProduct.id,
          type,
          quantityChange: adjustedQuantity,
          note,
        },
      },
      {
        onSuccess: () => {
          toast({ title: "Stock adjustment saved" });
          setQuantity("1");
          setNote("");
          queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getListStockAdjustmentsQueryKey() });
        },
        onError: () => toast({ title: "Failed to save adjustment", variant: "destructive" }),
      },
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Stock Control</h1>
        <p className="text-sm text-muted-foreground">
          Restock inventory, record damaged items, and keep an audit trail for stock changes.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PackageCheck className="w-5 h-5 text-primary" />
              New Stock Adjustment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Product</label>
                <Select value={productId} onValueChange={setProductId}>
                  <SelectTrigger>
                    <SelectValue placeholder={loadingProducts ? "Loading products..." : "Select product"} />
                  </SelectTrigger>
                  <SelectContent>
                    {products
                      .filter((product) => product.category !== "service")
                      .map((product) => (
                        <SelectItem key={product.id} value={String(product.id)}>
                          {product.name} · {product.sku} · {product.stock} in stock
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Adjustment Type</label>
                <Select value={type} onValueChange={(value) => setType(value as typeof type)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {adjustmentTypes.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Quantity</label>
                <Input type="number" min="1" value={quantity} onChange={(event) => setQuantity(event.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Note</label>
                <Input
                  placeholder="Supplier invoice, damage reason, correction note..."
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                />
              </div>
            </div>

            <div className="rounded-lg border bg-muted/30 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <div className="text-sm font-medium">Projected stock</div>
                <div className="text-sm text-muted-foreground">
                  {selectedProduct
                    ? `${selectedProduct.stock} current ${adjustedQuantity >= 0 ? "+" : "-"} ${Math.abs(adjustedQuantity)} = ${projectedStock}`
                    : "Select a product to preview the stock change"}
                </div>
              </div>
              <Button onClick={submitAdjustment} disabled={createAdjustment.isPending}>
                {createAdjustment.isPending ? "Saving..." : "Save Adjustment"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Reorder Watch
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lowStockProducts.slice(0, 6).map((product) => (
                <button
                  key={product.id}
                  className="w-full rounded-lg border p-3 text-left hover:bg-muted/40 transition-colors"
                  onClick={() => {
                    setProductId(String(product.id));
                    setType("restock");
                    setQuantity(String(Math.max(1, product.reorderLevel * 2 - product.stock)));
                  }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-medium text-sm">{product.name}</div>
                    <div className="text-sm font-bold text-destructive">{product.stock}</div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Reorder at {product.reorderLevel} · {product.sku}
                  </div>
                </button>
              ))}
              {lowStockProducts.length === 0 && (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  No low-stock products right now.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Adjustment History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground border-b">
                <tr>
                  <th className="px-6 py-3 font-medium">Date</th>
                  <th className="px-6 py-3 font-medium">Product</th>
                  <th className="px-6 py-3 font-medium">Type</th>
                  <th className="px-6 py-3 font-medium">Change</th>
                  <th className="px-6 py-3 font-medium">Stock</th>
                  <th className="px-6 py-3 font-medium">Note</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loadingAdjustments ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-muted-foreground">
                      Loading adjustments...
                    </td>
                  </tr>
                ) : (
                  adjustments.map((adjustment) => {
                    const typeMeta = adjustmentTypes.find((item) => item.value === adjustment.type) ?? adjustmentTypes[0];
                    const Icon = typeMeta.icon;
                    return (
                      <tr key={adjustment.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4 text-muted-foreground">{formatDate(adjustment.createdAt)}</td>
                        <td className="px-6 py-4">
                          <div className="font-medium">{adjustment.productName}</div>
                          <div className="text-xs text-muted-foreground">{adjustment.sku}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="inline-flex items-center gap-2 rounded-full bg-muted px-2.5 py-1 text-xs font-medium capitalize">
                            <Icon className="w-3 h-3" />
                            {adjustment.type}
                          </div>
                        </td>
                        <td className={adjustment.quantityChange >= 0 ? "px-6 py-4 font-bold text-emerald-600" : "px-6 py-4 font-bold text-destructive"}>
                          {adjustment.quantityChange >= 0 ? "+" : ""}
                          {adjustment.quantityChange}
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {adjustment.previousStock} → {adjustment.newStock}
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">{adjustment.note || "—"}</td>
                      </tr>
                    );
                  })
                )}
                {!loadingAdjustments && adjustments.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-muted-foreground">
                      No stock adjustments recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}