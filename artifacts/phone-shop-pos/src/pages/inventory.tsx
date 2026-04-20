import React, { useState, useRef } from "react";
import { useListProducts, useDeleteProduct, useBulkImportProducts, getListProductsQueryKey, Product, ProductInput } from "@/lib/supabase-hooks";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format";
import { Search, Plus, AlertCircle, Edit, Trash, Upload, Download, Image } from "lucide-react";
import { ProductDialog } from "@/components/dialogs/product-dialog";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";

export default function Inventory() {
  const [search, setSearch] = useState("");
  const { data: products = [], isLoading } = useListProducts({ q: search });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const deleteProduct = useDeleteProduct();
  const bulkImport = useBulkImportProducts();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCSVImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split("\n").filter(l => l.trim());
      if (lines.length < 2) { toast({ title: "CSV must have a header row and at least one data row", variant: "destructive" }); return; }
      const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
      const items: ProductInput[] = [];
      for (let i = 1; i < lines.length; i++) {
        const vals = lines[i].split(",").map(v => v.trim().replace(/^"|"$/g, ""));
        const row: Record<string, string> = {};
        headers.forEach((h, idx) => { row[h] = vals[idx] || ""; });
        items.push({
          sku: row.sku || `SKU-${Date.now()}-${i}`,
          name: row.name || row.product || "",
          brand: row.brand || "",
          category: (row.category as ProductInput["category"]) || "accessory",
          stock: Number(row.stock || row.quantity || 0),
          reorderLevel: Number(row.reorder_level || row.reorderlevel || 0),
          costPrice: Number(row.cost_price || row.costprice || row.cost || 0),
          salePrice: Number(row.sale_price || row.saleprice || row.price || 0),
          notes: row.notes || "",
          imageUrl: row.image_url || row.imageurl || row.image || "",
        });
      }
      if (items.length === 0) { toast({ title: "No valid products found in CSV", variant: "destructive" }); return; }
      bulkImport.mutate(items, {
        onSuccess: (result) => {
          toast({ title: `Imported ${result.length} products` });
          queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
        },
        onError: () => toast({ title: "Import failed", variant: "destructive" }),
      });
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleCSVExport = () => {
    const headers = "sku,name,brand,category,stock,reorder_level,cost_price,sale_price,notes,image_url";
    const rows = products.map(p => `"${p.sku}","${p.name}","${p.brand}","${p.category}",${p.stock},${p.reorderLevel},${p.costPrice},${p.salePrice},"${p.notes}","${p.imageUrl}"`);
    const csv = [headers, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "inventory.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const handleAdd = () => {
    setSelectedProduct(null);
    setDialogOpen(true);
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this product?")) {
      deleteProduct.mutate(
        { id },
        {
          onSuccess: () => {
            toast({ title: "Product deleted" });
            queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
          },
          onError: () => toast({ title: "Failed to delete product", variant: "destructive" }),
        }
      );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Inventory</h1>
        <div className="flex gap-2">
          <Link href="/stock-control">
            <Button variant="outline">Stock Control</Button>
          </Link>
          <Button variant="outline" className="gap-2" onClick={handleCSVExport}>
            <Download className="w-4 h-4" /> Export
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => fileInputRef.current?.click()}>
            <Upload className="w-4 h-4" /> Import CSV
          </Button>
          <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleCSVImport} />
          <Button className="gap-2" onClick={handleAdd}>
            <Plus className="w-4 h-4" /> Add Product
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="p-4 border-b flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search inventory..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="text-sm text-muted-foreground">
              {products.length} items
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground border-b">
                <tr>
                  <th className="px-4 py-3 font-medium w-10"></th>
                  <th className="px-4 py-3 font-medium">SKU</th>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Cost</th>
                  <th className="px-4 py-3 font-medium">Price</th>
                  <th className="px-4 py-3 font-medium">Stock</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {isLoading ? (
                  <tr><td colSpan={8} className="text-center py-8">Loading...</td></tr>
                ) : products.map((product) => {
                  const isLowStock = product.stock <= product.reorderLevel;
                  return (
                    <tr key={product.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        {product.imageUrl ? (
                          <img src={product.imageUrl} alt="" className="w-8 h-8 object-contain rounded" />
                        ) : (
                          <div className="w-8 h-8 bg-muted rounded flex items-center justify-center"><Image className="w-4 h-4 text-muted-foreground" /></div>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{product.sku}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium">{product.name}</div>
                        {product.notes && <div className="text-xs text-muted-foreground line-clamp-1">{product.notes}</div>}
                      </td>
                      <td className="px-4 py-3 capitalize text-xs">{product.category}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{formatCurrency(product.costPrice)}</td>
                      <td className="px-4 py-3 font-medium">{formatCurrency(product.salePrice)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className={isLowStock ? "text-destructive font-bold" : "text-muted-foreground"}>{product.stock}</span>
                          {isLowStock && <AlertCircle className="w-4 h-4 text-destructive" />}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => handleEdit(product)}><Edit className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(product.id)}><Trash className="w-4 h-4" /></Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {!isLoading && products.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-muted-foreground">
                      No products found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      
      <ProductDialog open={dialogOpen} onOpenChange={setDialogOpen} product={selectedProduct} />
    </div>
  );
}
