import React from "react";
import { useGetDashboardSummary, useGetRecentActivity } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/format";
import { DollarSign, ShoppingCart, PackageAlert, Wrench, Activity, AlertCircle } from "lucide-react";

export default function Dashboard() {
  const { data: summary, isLoading: loadingSummary } = useGetDashboardSummary();
  const { data: activity, isLoading: loadingActivity } = useGetRecentActivity();

  if (loadingSummary || loadingActivity) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard Overview</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="h-10 bg-muted/50" />
              <CardContent className="h-20 bg-muted/20" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!summary) return <div>Failed to load dashboard.</div>;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard Overview</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Today's Revenue</CardTitle>
            <DollarSign className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.todayRevenue)}</div>
            <p className="text-xs text-muted-foreground mt-1">Total sales value today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Today's Sales</CardTitle>
            <ShoppingCart className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.todaySales}</div>
            <p className="text-xs text-muted-foreground mt-1">Completed transactions</p>
          </CardContent>
        </Card>

        <Card className={summary.lowStockCount > 0 ? "border-destructive/50 bg-destructive/5" : ""}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Low Stock Alerts</CardTitle>
            <AlertCircle className={`w-4 h-4 ${summary.lowStockCount > 0 ? 'text-destructive' : 'text-primary'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${summary.lowStockCount > 0 ? 'text-destructive' : ''}`}>{summary.lowStockCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Products below reorder level</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Open Repairs</CardTitle>
            <Wrench className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.openRepairs}</div>
            <p className="text-xs text-muted-foreground mt-1">Active repair tickets</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-4 h-4" /> Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activity?.map((item) => (
                <div key={item.id} className="flex items-start justify-between border-b pb-4 last:border-0 last:pb-0">
                  <div>
                    <p className="font-medium text-sm">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{formatDate(item.createdAt)}</p>
                  </div>
                  {item.amount != null && (
                    <div className="font-medium text-sm">{formatCurrency(item.amount)}</div>
                  )}
                </div>
              ))}
              {activity?.length === 0 && (
                <div className="text-center text-sm text-muted-foreground py-8">
                  No recent activity
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Top Products Today</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {summary.topProducts.map((p) => (
                  <div key={p.productId} className="flex justify-between items-center text-sm">
                    <span className="truncate mr-4">{p.name}</span>
                    <div className="text-right flex-shrink-0">
                      <span className="font-medium">{p.quantitySold}x</span>
                      <span className="text-muted-foreground block text-xs">{formatCurrency(p.revenue)}</span>
                    </div>
                  </div>
                ))}
                {summary.topProducts.length === 0 && (
                  <div className="text-sm text-muted-foreground text-center py-4">No sales yet today</div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Sales by Payment Method</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {summary.salesByPaymentMethod.map((pm) => (
                  <div key={pm.paymentMethod} className="flex justify-between items-center text-sm">
                    <span className="capitalize">{pm.paymentMethod}</span>
                    <div className="text-right">
                      <span className="font-medium">{formatCurrency(pm.total)}</span>
                      <span className="text-muted-foreground text-xs ml-2">({pm.count})</span>
                    </div>
                  </div>
                ))}
                {summary.salesByPaymentMethod.length === 0 && (
                  <div className="text-sm text-muted-foreground text-center py-4">No data</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
