/**
 * Supabase-backed React Query hooks.
 * Drop-in replacement for @workspace/api-client-react — same hook signatures,
 * but talks directly to Supabase instead of the Express API server.
 */
import { useQuery, useMutation } from "@tanstack/react-query";
import type { UseMutationOptions } from "@tanstack/react-query";
import { supabase } from "./supabase";

// ---------------------------------------------------------------------------
// Types (inlined — no dependency on @workspace/api-client-react)
// ---------------------------------------------------------------------------

export type ProductCategory = "phone" | "accessory" | "part" | "service";
export type PaymentMethod = "cash" | "card" | "transfer" | "mixed";
export type RepairStatus = "received" | "diagnosing" | "waiting_parts" | "repairing" | "ready" | "completed" | "cancelled";
export type StockAdjustmentType = "restock" | "damage" | "return" | "correction";
export type ActivityItemType = "sale" | "repair" | "inventory";

export type QuoteStatus = "draft" | "sent" | "accepted" | "declined" | "expired";

export interface Product {
  id: number;
  sku: string;
  name: string;
  brand: string;
  category: ProductCategory;
  stock: number;
  reorderLevel: number;
  costPrice: number;
  salePrice: number;
  notes: string;
  imageUrl: string;
  createdAt: string;
}

export interface ProductInput {
  sku: string;
  name: string;
  brand: string;
  category: ProductCategory;
  stock: number;
  reorderLevel: number;
  costPrice: number;
  salePrice: number;
  notes?: string;
  imageUrl?: string;
}

export interface ProductUpdate {
  sku?: string;
  name?: string;
  brand?: string;
  category?: ProductCategory;
  stock?: number;
  reorderLevel?: number;
  costPrice?: number;
  salePrice?: number;
  notes?: string;
  imageUrl?: string;
}

export interface Customer {
  id: number;
  name: string;
  phone: string;
  email: string;
  deviceNotes: string;
  createdAt: string;
}

export interface CustomerInput {
  name: string;
  phone: string;
  email?: string;
  deviceNotes?: string;
}

export interface CustomerUpdate {
  name?: string;
  phone?: string;
  email?: string;
  deviceNotes?: string;
}

export interface SaleItemInput {
  productId: number;
  quantity: number;
  unitPrice: number;
  serialNumber?: string;
}

export interface SaleInput {
  customerId?: number;
  paymentMethod: PaymentMethod;
  discount: number;
  tax: number;
  notes?: string;
  items: SaleItemInput[];
}

export interface SaleItem {
  id: number;
  productId: number;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  serialNumber: string;
}

export interface Quote {
  id: number;
  quoteNumber: string;
  customerId: number | null;
  customerName: string | null;
  status: QuoteStatus;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  notes: string;
  validUntil: string | null;
  createdAt: string;
  items: QuoteItem[];
}

export interface QuoteItem {
  id: number;
  productId: number;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface QuoteInput {
  customerId?: number;
  discount: number;
  tax: number;
  notes?: string;
  validUntil?: string;
  items: { productId: number; quantity: number; unitPrice: number }[];
}

export interface Sale {
  id: number;
  receiptNumber: string;
  customerId: number | null;
  customerName: string | null;
  paymentMethod: PaymentMethod;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  notes: string;
  createdAt: string;
  items: SaleItem[];
}

export interface RepairTicket {
  id: number;
  ticketNumber: string;
  customerId: number;
  customerName: string;
  device: string;
  imei: string;
  issue: string;
  status: RepairStatus;
  estimate: number;
  deposit: number;
  dueDate: string | null;
  createdAt: string;
}

export interface RepairTicketInput {
  customerId: number;
  device: string;
  imei?: string;
  issue: string;
  status: RepairStatus;
  estimate: number;
  deposit: number;
  dueDate?: string | null;
}

export interface RepairTicketUpdate {
  customerId?: number;
  device?: string;
  imei?: string;
  issue?: string;
  status?: RepairStatus;
  estimate?: number;
  deposit?: number;
  dueDate?: string | null;
}

export interface StockAdjustment {
  id: number;
  productId: number;
  productName: string;
  sku: string;
  type: StockAdjustmentType;
  quantityChange: number;
  previousStock: number;
  newStock: number;
  note: string;
  createdAt: string;
}

export interface StockAdjustmentInput {
  productId: number;
  type: StockAdjustmentType;
  quantityChange: number;
  note?: string;
}

export interface DashboardSummary {
  todayRevenue: number;
  todaySales: number;
  totalInventoryValue: number;
  lowStockCount: number;
  openRepairs: number;
  topProducts: { productId: number; name: string; quantitySold: number; revenue: number }[];
  salesByPaymentMethod: { paymentMethod: PaymentMethod; total: number; count: number }[];
}

export interface ActivityItem {
  id: string;
  type: ActivityItemType;
  title: string;
  description: string;
  amount: number | null;
  createdAt: string;
}

type ListProductsParams = { q?: string; category?: string };
type ListCustomersParams = { q?: string };
type ListRepairsParams = { status?: RepairStatus };
type ListStockAdjustmentsParams = { productId?: number };

// ---------------------------------------------------------------------------
// Helpers: snake_case DB rows → camelCase TypeScript types
// ---------------------------------------------------------------------------

function mapProduct(row: Record<string, unknown>): Product {
  return {
    id: row.id as number,
    sku: row.sku as string,
    name: row.name as string,
    brand: row.brand as string,
    category: row.category as Product["category"],
    stock: row.stock as number,
    reorderLevel: row.reorder_level as number,
    costPrice: row.cost_price as number,
    salePrice: row.sale_price as number,
    notes: (row.notes as string) ?? "",
    imageUrl: (row.image_url as string) ?? "",
    createdAt: row.created_at as string,
  };
}

function mapCustomer(row: Record<string, unknown>): Customer {
  return {
    id: row.id as number,
    name: row.name as string,
    phone: row.phone as string,
    email: (row.email as string) ?? "",
    deviceNotes: (row.device_notes as string) ?? "",
    createdAt: row.created_at as string,
  };
}

function mapRepairTicket(row: Record<string, unknown>): RepairTicket {
  return {
    id: row.id as number,
    ticketNumber: row.ticket_number as string,
    customerId: row.customer_id as number,
    customerName: ((row as Record<string, unknown>).customers as Record<string, unknown>)?.name as string ?? "",
    device: row.device as string,
    imei: (row.imei as string) ?? "",
    issue: row.issue as string,
    status: row.status as RepairTicket["status"],
    estimate: row.estimate as number,
    deposit: row.deposit as number,
    dueDate: (row.due_date as string) ?? null,
    createdAt: row.created_at as string,
  };
}

function mapStockAdjustment(row: Record<string, unknown>): StockAdjustment {
  const product = (row as Record<string, unknown>).products as Record<string, unknown> | undefined;
  return {
    id: row.id as number,
    productId: row.product_id as number,
    productName: product?.name as string ?? "",
    sku: product?.sku as string ?? "",
    type: row.type as StockAdjustment["type"],
    quantityChange: row.quantity_change as number,
    previousStock: row.previous_stock as number,
    newStock: row.new_stock as number,
    note: (row.note as string) ?? "",
    createdAt: row.created_at as string,
  };
}

function mapSaleItem(row: Record<string, unknown>): SaleItem {
  const product = (row as Record<string, unknown>).products as Record<string, unknown> | undefined;
  return {
    id: row.id as number,
    productId: row.product_id as number,
    productName: product?.name as string ?? "",
    sku: product?.sku as string ?? "",
    quantity: row.quantity as number,
    unitPrice: row.unit_price as number,
    lineTotal: row.line_total as number,
    serialNumber: (row.serial_number as string) ?? "",
  };
}

// ---------------------------------------------------------------------------
// Query key factories
// ---------------------------------------------------------------------------

export const getListProductsQueryKey = (params?: ListProductsParams) =>
  [`/supabase/products`, ...(params ? [params] : [])] as const;

export const getListLowStockProductsQueryKey = () =>
  [`/supabase/products/low-stock`] as const;

export const getListStockAdjustmentsQueryKey = (params?: ListStockAdjustmentsParams) =>
  [`/supabase/stock-adjustments`, ...(params ? [params] : [])] as const;

export const getListCustomersQueryKey = (params?: ListCustomersParams) =>
  [`/supabase/customers`, ...(params ? [params] : [])] as const;

export const getListSalesQueryKey = () =>
  [`/supabase/sales`] as const;

export const getGetDashboardSummaryQueryKey = () =>
  [`/supabase/dashboard/summary`] as const;

export const getListRepairsQueryKey = (params?: ListRepairsParams) =>
  [`/supabase/repairs`, ...(params ? [params] : [])] as const;

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------

export function useListProducts(params?: ListProductsParams, _options?: Record<string, unknown>) {
  const queryKey = getListProductsQueryKey(params);
  const query = useQuery({
    queryKey,
    queryFn: async () => {
      let q = supabase.from("products").select("*").order("name");
      if (params?.q) {
        q = q.or(`name.ilike.%${params.q}%,sku.ilike.%${params.q}%,brand.ilike.%${params.q}%`);
      }
      if (params?.category) {
        q = q.eq("category", params.category);
      }
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []).map(mapProduct);
    },
      });
  return { ...query, queryKey };
}

export function useCreateProduct(options?: { mutation?: UseMutationOptions<Product, Error, { data: ProductInput }> }) {
  return useMutation({
    mutationKey: ["createProduct"],
    mutationFn: async ({ data }: { data: ProductInput }) => {
      const { data: row, error } = await supabase
        .from("products")
        .insert({
          sku: data.sku,
          name: data.name,
          brand: data.brand,
          category: data.category,
          stock: data.stock,
          reorder_level: data.reorderLevel,
          cost_price: data.costPrice,
          sale_price: data.salePrice,
          notes: data.notes ?? "",
          image_url: data.imageUrl ?? "",
        })
        .select()
        .single();
      if (error) throw error;
      return mapProduct(row);
    },
    ...options?.mutation,
  });
}

export function useUpdateProduct(options?: { mutation?: UseMutationOptions<Product, Error, { id: number; data: ProductUpdate }> }) {
  return useMutation({
    mutationKey: ["updateProduct"],
    mutationFn: async ({ id, data }: { id: number; data: ProductUpdate }) => {
      const update: Record<string, unknown> = {};
      if (data.sku !== undefined) update.sku = data.sku;
      if (data.name !== undefined) update.name = data.name;
      if (data.brand !== undefined) update.brand = data.brand;
      if (data.category !== undefined) update.category = data.category;
      if (data.stock !== undefined) update.stock = data.stock;
      if (data.reorderLevel !== undefined) update.reorder_level = data.reorderLevel;
      if (data.costPrice !== undefined) update.cost_price = data.costPrice;
      if (data.salePrice !== undefined) update.sale_price = data.salePrice;
      if (data.notes !== undefined) update.notes = data.notes;
      if (data.imageUrl !== undefined) update.image_url = data.imageUrl;

      const { data: row, error } = await supabase
        .from("products")
        .update(update)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return mapProduct(row);
    },
    ...options?.mutation,
  });
}

export function useDeleteProduct(options?: { mutation?: UseMutationOptions<void, Error, { id: number }> }) {
  return useMutation({
    mutationKey: ["deleteProduct"],
    mutationFn: async ({ id }: { id: number }) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },
    ...options?.mutation,
  });
}

export function useListLowStockProducts(_options?: Record<string, unknown>) {
  const queryKey = getListLowStockProductsQueryKey();
  const query = useQuery({
    queryKey,
    queryFn: async () => {
      // Supabase doesn't support column-to-column comparison in filters directly,
      // so we fetch all and filter client-side
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("stock");
      if (error) throw error;
      return (data ?? [])
        .filter((p: Record<string, unknown>) => (p.stock as number) <= (p.reorder_level as number))
        .map(mapProduct);
    },
      });
  return { ...query, queryKey };
}

// ---------------------------------------------------------------------------
// Stock Adjustments
// ---------------------------------------------------------------------------

export function useListStockAdjustments(params?: ListStockAdjustmentsParams, _options?: Record<string, unknown>) {
  const queryKey = getListStockAdjustmentsQueryKey(params);
  const query = useQuery({
    queryKey,
    queryFn: async () => {
      let q = supabase
        .from("stock_adjustments")
        .select("*, products(name, sku)")
        .order("created_at", { ascending: false });
      if (params?.productId) {
        q = q.eq("product_id", params.productId);
      }
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []).map(mapStockAdjustment);
    },
      });
  return { ...query, queryKey };
}

export function useCreateStockAdjustment(options?: { mutation?: UseMutationOptions<StockAdjustment, Error, { data: StockAdjustmentInput }> }) {
  return useMutation({
    mutationKey: ["createStockAdjustment"],
    mutationFn: async ({ data }: { data: StockAdjustmentInput }) => {
      const { data: result, error } = await supabase.rpc("create_stock_adjustment", {
        p_product_id: data.productId,
        p_type: data.type,
        p_quantity_change: data.quantityChange,
        p_note: data.note ?? "",
      });
      if (error) throw error;
      // RPC returns the adjustment row — fetch with product join for full shape
      const { data: row, error: fetchError } = await supabase
        .from("stock_adjustments")
        .select("*, products(name, sku)")
        .eq("id", (result as Record<string, unknown>).id)
        .single();
      if (fetchError) throw fetchError;
      return mapStockAdjustment(row);
    },
    ...options?.mutation,
  });
}

// ---------------------------------------------------------------------------
// Customers
// ---------------------------------------------------------------------------

export function useListCustomers(params?: ListCustomersParams, _options?: Record<string, unknown>) {
  const queryKey = getListCustomersQueryKey(params);
  const query = useQuery({
    queryKey,
    queryFn: async () => {
      let q = supabase.from("customers").select("*").order("name");
      if (params?.q) {
        q = q.or(`name.ilike.%${params.q}%,phone.ilike.%${params.q}%,email.ilike.%${params.q}%`);
      }
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []).map(mapCustomer);
    },
      });
  return { ...query, queryKey };
}

export function useCreateCustomer(options?: { mutation?: UseMutationOptions<Customer, Error, { data: CustomerInput }> }) {
  return useMutation({
    mutationKey: ["createCustomer"],
    mutationFn: async ({ data }: { data: CustomerInput }) => {
      const { data: row, error } = await supabase
        .from("customers")
        .insert({
          name: data.name,
          phone: data.phone,
          email: data.email ?? "",
          device_notes: data.deviceNotes ?? "",
        })
        .select()
        .single();
      if (error) throw error;
      return mapCustomer(row);
    },
    ...options?.mutation,
  });
}

export function useUpdateCustomer(options?: { mutation?: UseMutationOptions<Customer, Error, { id: number; data: CustomerUpdate }> }) {
  return useMutation({
    mutationKey: ["updateCustomer"],
    mutationFn: async ({ id, data }: { id: number; data: CustomerUpdate }) => {
      const update: Record<string, unknown> = {};
      if (data.name !== undefined) update.name = data.name;
      if (data.phone !== undefined) update.phone = data.phone;
      if (data.email !== undefined) update.email = data.email;
      if (data.deviceNotes !== undefined) update.device_notes = data.deviceNotes;

      const { data: row, error } = await supabase
        .from("customers")
        .update(update)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return mapCustomer(row);
    },
    ...options?.mutation,
  });
}

export function useDeleteCustomer(options?: { mutation?: UseMutationOptions<void, Error, { id: number }> }) {
  return useMutation({
    mutationKey: ["deleteCustomer"],
    mutationFn: async ({ id }: { id: number }) => {
      const { error } = await supabase.from("customers").delete().eq("id", id);
      if (error) throw error;
    },
    ...options?.mutation,
  });
}

// ---------------------------------------------------------------------------
// Sales
// ---------------------------------------------------------------------------

async function fetchSaleRecord(saleId: number): Promise<Sale> {
  const { data: saleRow, error: saleError } = await supabase
    .from("sales")
    .select("*, customers(name)")
    .eq("id", saleId)
    .single();
  if (saleError) throw saleError;

  const { data: items, error: itemsError } = await supabase
    .from("sale_items")
    .select("*, products(name, sku)")
    .eq("sale_id", saleId)
    .order("id");
  if (itemsError) throw itemsError;

  return {
    id: saleRow.id,
    receiptNumber: saleRow.receipt_number,
    customerId: saleRow.customer_id,
    customerName: saleRow.customers?.name ?? null,
    paymentMethod: saleRow.payment_method,
    subtotal: saleRow.subtotal,
    discount: saleRow.discount,
    tax: saleRow.tax,
    total: saleRow.total,
    notes: saleRow.notes ?? "",
    createdAt: saleRow.created_at,
    items: (items ?? []).map(mapSaleItem),
  };
}

export function useListSales(_options?: Record<string, unknown>) {
  const queryKey = getListSalesQueryKey();
  const query = useQuery({
    queryKey,
    queryFn: async () => {
      const { data: sales, error } = await supabase
        .from("sales")
        .select("id")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return Promise.all((sales ?? []).map((s: { id: number }) => fetchSaleRecord(s.id)));
    },
      });
  return { ...query, queryKey };
}

export function useGetSale(id: number, _options?: Record<string, unknown>) {
  const queryKey = [`/supabase/sales/${id}`] as const;
  const query = useQuery({
    queryKey,
    queryFn: () => fetchSaleRecord(id),
    enabled: !!id,
      });
  return { ...query, queryKey };
}

export function useCreateSale(options?: { mutation?: UseMutationOptions<Sale, Error, { data: SaleInput }> }) {
  return useMutation({
    mutationKey: ["createSale"],
    mutationFn: async ({ data }: { data: SaleInput }) => {
      const { data: result, error } = await supabase.rpc("create_sale", {
        p_customer_id: data.customerId ?? null,
        p_payment_method: data.paymentMethod,
        p_discount: data.discount,
        p_tax: data.tax,
        p_notes: data.notes ?? "",
        p_items: JSON.stringify(data.items),
      });
      if (error) throw error;
      return fetchSaleRecord((result as Record<string, unknown>).id as number);
    },
    ...options?.mutation,
  });
}

// ---------------------------------------------------------------------------
// Repairs
// ---------------------------------------------------------------------------

export function useListRepairs(params?: ListRepairsParams, _options?: Record<string, unknown>) {
  const queryKey = getListRepairsQueryKey(params);
  const query = useQuery({
    queryKey,
    queryFn: async () => {
      let q = supabase
        .from("repair_tickets")
        .select("*, customers(name)")
        .order("created_at", { ascending: false });
      if (params?.status) {
        q = q.eq("status", params.status);
      }
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []).map(mapRepairTicket);
    },
      });
  return { ...query, queryKey };
}

export function useCreateRepair(options?: { mutation?: UseMutationOptions<RepairTicket, Error, { data: RepairTicketInput }> }) {
  return useMutation({
    mutationKey: ["createRepair"],
    mutationFn: async ({ data }: { data: RepairTicketInput }) => {
      const ticketNumber = `T-${Date.now().toString(36).toUpperCase()}`;
      const { data: row, error } = await supabase
        .from("repair_tickets")
        .insert({
          ticket_number: ticketNumber,
          customer_id: data.customerId,
          device: data.device,
          imei: data.imei ?? "",
          issue: data.issue,
          status: data.status,
          estimate: data.estimate,
          deposit: data.deposit,
          due_date: data.dueDate ?? null,
        })
        .select("*, customers(name)")
        .single();
      if (error) throw error;
      return mapRepairTicket(row);
    },
    ...options?.mutation,
  });
}

export function useUpdateRepair(options?: { mutation?: UseMutationOptions<RepairTicket, Error, { id: number; data: RepairTicketUpdate }> }) {
  return useMutation({
    mutationKey: ["updateRepair"],
    mutationFn: async ({ id, data }: { id: number; data: RepairTicketUpdate }) => {
      const update: Record<string, unknown> = {};
      if (data.customerId !== undefined) update.customer_id = data.customerId;
      if (data.device !== undefined) update.device = data.device;
      if (data.imei !== undefined) update.imei = data.imei;
      if (data.issue !== undefined) update.issue = data.issue;
      if (data.status !== undefined) update.status = data.status;
      if (data.estimate !== undefined) update.estimate = data.estimate;
      if (data.deposit !== undefined) update.deposit = data.deposit;
      if (Object.prototype.hasOwnProperty.call(data, "dueDate")) update.due_date = data.dueDate ?? null;

      const { data: row, error } = await supabase
        .from("repair_tickets")
        .update(update)
        .eq("id", id)
        .select("*, customers(name)")
        .single();
      if (error) throw error;
      return mapRepairTicket(row);
    },
    ...options?.mutation,
  });
}

export function useDeleteRepair(options?: { mutation?: UseMutationOptions<void, Error, { id: number }> }) {
  return useMutation({
    mutationKey: ["deleteRepair"],
    mutationFn: async ({ id }: { id: number }) => {
      const { error } = await supabase.from("repair_tickets").delete().eq("id", id);
      if (error) throw error;
    },
    ...options?.mutation,
  });
}

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------

export function useGetDashboardSummary(_options?: Record<string, unknown>) {
  const queryKey = getGetDashboardSummaryQueryKey();
  const query = useQuery({
    queryKey,
    queryFn: async () => {
      const [productsRes, salesRes, saleItemsRes, repairsRes] = await Promise.all([
        supabase.from("products").select("*"),
        supabase.from("sales").select("*"),
        supabase.from("sale_items").select("*, products(name)"),
        supabase.from("repair_tickets").select("*"),
      ]);

      if (productsRes.error) throw productsRes.error;
      if (salesRes.error) throw salesRes.error;
      if (saleItemsRes.error) throw saleItemsRes.error;
      if (repairsRes.error) throw repairsRes.error;

      const products = productsRes.data ?? [];
      const sales = salesRes.data ?? [];
      const saleItems = saleItemsRes.data ?? [];
      const repairs = repairsRes.data ?? [];

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todaysSales = sales.filter((s) => new Date(s.created_at) >= today);

      const topProductMap = new Map<number, { productId: number; name: string; quantitySold: number; revenue: number }>();
      for (const item of saleItems) {
        const current = topProductMap.get(item.product_id) ?? {
          productId: item.product_id,
          name: (item.products as Record<string, unknown>)?.name as string ?? "",
          quantitySold: 0,
          revenue: 0,
        };
        current.quantitySold += item.quantity;
        current.revenue += item.line_total;
        topProductMap.set(item.product_id, current);
      }

      const paymentMap = new Map<string, { paymentMethod: string; total: number; count: number }>();
      for (const sale of sales) {
        const current = paymentMap.get(sale.payment_method) ?? {
          paymentMethod: sale.payment_method,
          total: 0,
          count: 0,
        };
        current.total += sale.total;
        current.count += 1;
        paymentMap.set(sale.payment_method, current);
      }

      const summary: DashboardSummary = {
        todayRevenue: todaysSales.reduce((sum, s) => sum + s.total, 0),
        todaySales: todaysSales.length,
        totalInventoryValue: products.reduce((sum, p) => sum + p.stock * p.cost_price, 0),
        lowStockCount: products.filter((p) => p.stock <= p.reorder_level).length,
        openRepairs: repairs.filter((r) => !["completed", "cancelled"].includes(r.status)).length,
        topProducts: Array.from(topProductMap.values())
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5),
        salesByPaymentMethod: Array.from(paymentMap.values()) as DashboardSummary["salesByPaymentMethod"],
      };

      return summary;
    },
      });
  return { ...query, queryKey };
}

export function useGetRecentActivity(_options?: Record<string, unknown>) {
  const queryKey = [`/supabase/dashboard/recent-activity`] as const;
  const query = useQuery({
    queryKey,
    queryFn: async () => {
      const [salesRes, repairsRes, lowStockRes, adjustmentsRes] = await Promise.all([
        supabase.from("sales").select("*, customers(name)").order("created_at", { ascending: false }).limit(6),
        supabase.from("repair_tickets").select("*, customers(name)").order("created_at", { ascending: false }).limit(6),
        supabase.from("products").select("*").order("stock").limit(4),
        supabase.from("stock_adjustments").select("*, products(name, sku)").order("created_at", { ascending: false }).limit(6),
      ]);

      if (salesRes.error) throw salesRes.error;
      if (repairsRes.error) throw repairsRes.error;
      if (lowStockRes.error) throw lowStockRes.error;
      if (adjustmentsRes.error) throw adjustmentsRes.error;

      // Fetch sale items for each sale
      const saleIds = (salesRes.data ?? []).map((s) => s.id);
      const { data: allSaleItems } = saleIds.length > 0
        ? await supabase.from("sale_items").select("*").in("sale_id", saleIds)
        : { data: [] };

      const saleItemCounts = new Map<number, number>();
      for (const item of allSaleItems ?? []) {
        saleItemCounts.set(item.sale_id, (saleItemCounts.get(item.sale_id) ?? 0) + 1);
      }

      const activity: ActivityItem[] = [
        ...(salesRes.data ?? []).map((sale) => ({
          id: `sale-${sale.id}`,
          type: "sale" as const,
          title: `Sale ${sale.receipt_number}`,
          description: `${saleItemCounts.get(sale.id) ?? 0} item${(saleItemCounts.get(sale.id) ?? 0) === 1 ? "" : "s"} sold${sale.customers?.name ? ` to ${sale.customers.name}` : ""}`,
          amount: sale.total,
          createdAt: sale.created_at,
        })),
        ...(repairsRes.data ?? []).map((repair) => ({
          id: `repair-${repair.id}`,
          type: "repair" as const,
          title: `Repair ${repair.ticket_number}`,
          description: `${repair.device} is ${(repair.status as string).replace("_", " ")}`,
          amount: repair.estimate,
          createdAt: repair.created_at,
        })),
        ...(lowStockRes.data ?? [])
          .filter((p) => p.stock <= p.reorder_level)
          .map((product) => ({
            id: `inventory-${product.id}`,
            type: "inventory" as const,
            title: `${product.name} low stock`,
            description: `${product.stock} left, reorder level ${product.reorder_level}`,
            amount: null,
            createdAt: product.created_at,
          })),
        ...(adjustmentsRes.data ?? []).map((adj) => ({
          id: `stock-adjustment-${adj.id}`,
          type: "inventory" as const,
          title: `${(adj.products as Record<string, unknown>)?.name ?? "Product"} stock ${adj.quantity_change > 0 ? "increased" : "reduced"}`,
          description: `${adj.previous_stock} → ${adj.new_stock} (${adj.type})`,
          amount: null,
          createdAt: adj.created_at,
        })),
      ]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 12);

      return activity;
    },
      });
  return { ...query, queryKey };
}

// ---------------------------------------------------------------------------
// Customer Sales History
// ---------------------------------------------------------------------------

export function useCustomerSalesHistory(customerId: number) {
  const queryKey = [`/supabase/customers/${customerId}/sales`] as const;
  const query = useQuery({
    queryKey,
    queryFn: async () => {
      const { data: sales, error } = await supabase
        .from("sales")
        .select("*, customers(name)")
        .eq("customer_id", customerId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return Promise.all((sales ?? []).map(async (s) => {
        const { data: items } = await supabase
          .from("sale_items")
          .select("*, products(name, sku)")
          .eq("sale_id", s.id);
        return {
          id: s.id,
          receiptNumber: s.receipt_number,
          paymentMethod: s.payment_method,
          total: s.total,
          createdAt: s.created_at,
          items: (items ?? []).map(mapSaleItem),
        };
      }));
    },
    enabled: !!customerId,
  });
  return { ...query, queryKey };
}

// ---------------------------------------------------------------------------
// Bulk Product Import
// ---------------------------------------------------------------------------

export function useBulkImportProducts() {
  return useMutation({
    mutationKey: ["bulkImportProducts"],
    mutationFn: async (products: ProductInput[]) => {
      const rows = products.map(p => ({
        sku: p.sku,
        name: p.name,
        brand: p.brand,
        category: p.category,
        stock: p.stock,
        reorder_level: p.reorderLevel,
        cost_price: p.costPrice,
        sale_price: p.salePrice,
        notes: p.notes ?? "",
        image_url: p.imageUrl ?? "",
      }));
      const { data, error } = await supabase.from("products").upsert(rows, { onConflict: "sku" }).select();
      if (error) throw error;
      return (data ?? []).map(mapProduct);
    },
  });
}

// ---------------------------------------------------------------------------
// Quotes
// ---------------------------------------------------------------------------

export const getListQuotesQueryKey = () => [`/supabase/quotes`] as const;

async function fetchQuoteRecord(quoteId: number): Promise<Quote> {
  const { data: row, error } = await supabase
    .from("quotes")
    .select("*, customers(name)")
    .eq("id", quoteId)
    .single();
  if (error) throw error;

  const { data: items, error: itemsError } = await supabase
    .from("quote_items")
    .select("*, products(name, sku)")
    .eq("quote_id", quoteId)
    .order("id");
  if (itemsError) throw itemsError;

  return {
    id: row.id,
    quoteNumber: row.quote_number,
    customerId: row.customer_id,
    customerName: row.customers?.name ?? null,
    status: row.status,
    subtotal: row.subtotal,
    discount: row.discount,
    tax: row.tax,
    total: row.total,
    notes: row.notes ?? "",
    validUntil: row.valid_until,
    createdAt: row.created_at,
    items: (items ?? []).map((i: Record<string, unknown>) => {
      const product = (i as Record<string, unknown>).products as Record<string, unknown> | undefined;
      return {
        id: i.id as number,
        productId: i.product_id as number,
        productName: product?.name as string ?? "",
        sku: product?.sku as string ?? "",
        quantity: i.quantity as number,
        unitPrice: i.unit_price as number,
        lineTotal: i.line_total as number,
      };
    }),
  };
}

export function useListQuotes() {
  const queryKey = getListQuotesQueryKey();
  const query = useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quotes")
        .select("id")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return Promise.all((data ?? []).map((q: { id: number }) => fetchQuoteRecord(q.id)));
    },
  });
  return { ...query, queryKey };
}

export function useCreateQuote() {
  return useMutation({
    mutationKey: ["createQuote"],
    mutationFn: async ({ data }: { data: QuoteInput }) => {
      const subtotal = data.items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
      const total = Math.max(0, subtotal - data.discount + data.tax);
      const quoteNumber = `Q-${Date.now().toString(36).toUpperCase()}`;

      const { data: row, error } = await supabase
        .from("quotes")
        .insert({
          quote_number: quoteNumber,
          customer_id: data.customerId ?? null,
          subtotal,
          discount: data.discount,
          tax: data.tax,
          total,
          notes: data.notes ?? "",
          valid_until: data.validUntil ?? null,
        })
        .select()
        .single();
      if (error) throw error;

      for (const item of data.items) {
        const lineTotal = item.quantity * item.unitPrice;
        await supabase.from("quote_items").insert({
          quote_id: row.id,
          product_id: item.productId,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          line_total: lineTotal,
        });
      }

      return fetchQuoteRecord(row.id);
    },
  });
}

export function useConvertQuoteToSale() {
  return useMutation({
    mutationKey: ["convertQuoteToSale"],
    mutationFn: async ({ quoteId, paymentMethod }: { quoteId: number; paymentMethod: PaymentMethod }) => {
      const quote = await fetchQuoteRecord(quoteId);
      const items = quote.items.map(i => ({
        productId: i.productId,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
      }));

      const { data: result, error } = await supabase.rpc("create_sale", {
        p_customer_id: quote.customerId ?? null,
        p_payment_method: paymentMethod,
        p_discount: quote.discount,
        p_tax: quote.tax,
        p_notes: `Converted from ${quote.quoteNumber}`,
        p_items: JSON.stringify(items),
      });
      if (error) throw error;

      // Mark quote as accepted
      await supabase.from("quotes").update({ status: "accepted" }).eq("id", quoteId);

      return (result as Record<string, unknown>).id as number;
    },
  });
}
