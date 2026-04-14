import React from "react";
import {
  useListCustomers,
  useListProducts,
  useListRepairs,
  useListSales,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  BarChart3,
  Download,
  Package,
  ReceiptText,
  TrendingUp,
  Users,
  Wrench,
} from "lucide-react";

const chartColors = ["#2563eb", "#0f766e", "#f59e0b", "#dc2626", "#7c3aed", "#0891b2"];

function dayKey(value: unknown) {
  return new Date(value as string).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function exportCsv(filename: string, rows: Array<Record<string, string | number | null | undefined>>) {
  if (rows.length === 0) return;

  const headers = Object.keys(rows[0]);
  const body = rows.map((row) =>
    headers
      .map((header) => {
        const value = row[header] ?? "";
        return `"${String(value).replaceAll('"', '""')}"`;
      })
      .join(","),
  );

  const blob = new Blob([[headers.join(","), ...body].join("\n")], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export default function Reports() {
  const { data: sales = [], isLoading: loadingSales } = useListSales();
  const { data: products = [], isLoading: loadingProducts } = useListProducts();
  const { data: repairs = [], isLoading: loadingRepairs } = useListRepairs();
  const { data: customers = [], isLoading: loadingCustomers } = useListCustomers();

  const isLoading = loadingSales || loadingProducts || loadingRepairs || loadingCustomers;

  const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
  const totalDiscounts = sales.reduce((sum, sale) => sum + sale.discount, 0);
  const averageSale = sales.length ? totalRevenue / sales.length : 0;
  const inventoryValue = products.reduce((sum, product) => sum + product.costPrice * product.stock, 0);
  const retailValue = products.reduce((sum, product) => sum + product.salePrice * product.stock, 0);
  const expectedMargin = retailValue - inventoryValue;
  const lowStock = products.filter((product) => product.stock <= product.reorderLevel);
  const openRepairs = repairs.filter((repair) => !["completed", "cancelled"].includes(repair.status));

  const salesByDayMap = new Map<string, { day: string; revenue: number; sales: number }>();
  for (const sale of sales) {
    const day = dayKey(sale.createdAt);
    const current = salesByDayMap.get(day) ?? { day, revenue: 0, sales: 0 };
    current.revenue += sale.total;
    current.sales += 1;
    salesByDayMap.set(day, current);
  }
  const salesByDay = Array.from(salesByDayMap.values()).slice(-7);

  const categoryMap = new Map<string, { category: string; stock: number; value: number }>();
  for (const product of products) {
    const current = categoryMap.get(product.category) ?? {
      category: product.category,
      stock: 0,
      value: 0,
    };
    current.stock += product.stock;
    current.value += product.stock * product.costPrice;
    categoryMap.set(product.category, current);
  }
  const inventoryByCategory = Array.from(categoryMap.values());

  const paymentMap = new Map<string, { method: string; total: number; count: number }>();
  for (const sale of sales) {
    const current = paymentMap.get(sale.paymentMethod) ?? {
      method: sale.paymentMethod,
      total: 0,
      count: 0,
    };
    current.total += sale.total;
    current.count += 1;
    paymentMap.set(sale.paymentMethod, current);
  }
  const paymentBreakdown = Array.from(paymentMap.values());

  const repairStatusMap = new Map<string, { status: string; count: number }>();
  for (const repair of repairs) {
    const label = repair.status.replace("_", " ");
    const current = repairStatusMap.get(label) ?? { status: label, count: 0 };
    current.count += 1;
    repairStatusMap.set(label, current);
  }
  const repairsByStatus = Array.from(repairStatusMap.values());

  const topSellingProducts = products
    .map((product) => {
      const quantitySold = sales.reduce(
        (sum, sale) =>
          sum +
          sale.items
            .filter((item) => item.productId === product.id)
            .reduce((itemSum, item) => itemSum + item.quantity, 0),
        0,
      );
      return {
        id: product.id,
        name: product.name,
        sku: product.sku,
        quantitySold,
        revenue: sales.reduce(
          (sum, sale) =>
            sum +
            sale.items
              .filter((item) => item.productId === product.id)
              .reduce((itemSum, item) => itemSum + item.lineTotal, 0),
          0,
        ),
      };
    })
    .filter((product) => product.quantitySold > 0)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 6);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((item) => (
            <Card key={item} className="animate-pulse">
              <CardHeader className="h-12 bg-muted/50" />
              <CardContent className="h-20 bg-muted/20" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Business Reports</h1>
          <p className="text-sm text-muted-foreground">
            Sales, inventory, customer, and repair insights for the phone shop.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() =>
              exportCsv(
                "sales-report.csv",
                sales.map((sale) => ({
                  receipt: sale.receiptNumber,
                  date: new Date(sale.createdAt as string).toISOString(),
                  customer: sale.customerName ?? "Walk-in",
                  payment: sale.paymentMethod,
                  subtotal: sale.subtotal,
                  discount: sale.discount,
                  tax: sale.tax,
                  total: sale.total,
                })),
              )
            }
          >
            <Download className="w-4 h-4 mr-2" />
            Export Sales
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              exportCsv(
                "inventory-report.csv",
                products.map((product) => ({
                  sku: product.sku,
                  name: product.name,
                  brand: product.brand,
                  category: product.category,
                  stock: product.stock,
                  reorderLevel: product.reorderLevel,
                  costPrice: product.costPrice,
                  salePrice: product.salePrice,
                  inventoryValue: product.stock * product.costPrice,
                })),
              )
            }
          >
            <Download className="w-4 h-4 mr-2" />
            Export Inventory
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            <TrendingUp className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground mt-1">{sales.length} completed sales</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average Sale</CardTitle>
            <ReceiptText className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(averageSale)}</div>
            <p className="text-xs text-muted-foreground mt-1">{formatCurrency(totalDiscounts)} discounts given</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Inventory Value</CardTitle>
            <Package className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(inventoryValue)}</div>
            <p className="text-xs text-muted-foreground mt-1">{formatCurrency(expectedMargin)} potential margin</p>
          </CardContent>
        </Card>
        <Card className={lowStock.length ? "border-destructive/50 bg-destructive/5" : ""}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Low Stock</CardTitle>
            <BarChart3 className={lowStock.length ? "w-4 h-4 text-destructive" : "w-4 h-4 text-primary"} />
          </CardHeader>
          <CardContent>
            <div className={lowStock.length ? "text-2xl font-bold text-destructive" : "text-2xl font-bold"}>
              {lowStock.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Products need reorder</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Customers & Repairs</CardTitle>
            <Users className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customers.length}</div>
            <p className="text-xs text-muted-foreground mt-1">{openRepairs.length} active repairs</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesByDay}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="day" />
                <YAxis tickFormatter={(value) => `$${value}`} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Bar dataKey="revenue" radius={[8, 8, 0, 0]} fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Mix</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={paymentBreakdown} dataKey="total" nameKey="method" innerRadius={62} outerRadius={96} paddingAngle={4}>
                  {paymentBreakdown.map((entry, index) => (
                    <Cell key={entry.method} fill={chartColors[index % chartColors.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Inventory by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {inventoryByCategory.map((item) => (
                <div key={item.category} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="capitalize font-medium">{item.category}</span>
                    <span className="text-muted-foreground">{item.stock} units</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{
                        width: `${Math.max(6, (item.value / Math.max(1, inventoryValue)) * 100)}%`,
                      }}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground">{formatCurrency(item.value)} cost value</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topSellingProducts.map((product, index) => (
                <div key={product.id} className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">
                      {index + 1}. {product.name}
                    </div>
                    <div className="text-xs text-muted-foreground">{product.sku}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-sm font-semibold">{formatCurrency(product.revenue)}</div>
                    <div className="text-xs text-muted-foreground">{product.quantitySold} sold</div>
                  </div>
                </div>
              ))}
              {topSellingProducts.length === 0 && (
                <div className="py-8 text-center text-sm text-muted-foreground">No product sales yet</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="w-4 h-4" />
              Repair Pipeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {repairsByStatus.map((item) => (
                <div key={item.status} className="flex items-center justify-between">
                  <span className="text-sm capitalize">{item.status}</span>
                  <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                    {item.count}
                  </span>
                </div>
              ))}
              {repairsByStatus.length === 0 && (
                <div className="py-8 text-center text-sm text-muted-foreground">No repair tickets yet</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}