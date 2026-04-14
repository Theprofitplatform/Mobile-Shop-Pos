import { Router, type IRouter } from "express";
import { and, asc, desc, eq, ilike, lte, or } from "drizzle-orm";
import {
  customersTable,
  db,
  productsTable,
  repairTicketsTable,
  saleItemsTable,
  salesTable,
} from "@workspace/db";
import {
  CreateCustomerBody,
  CreateProductBody,
  CreateRepairBody,
  CreateSaleBody,
  DeleteCustomerParams,
  DeleteProductParams,
  DeleteRepairParams,
  GetCustomerParams,
  GetCustomerResponse,
  GetDashboardSummaryResponse,
  GetProductParams,
  GetProductResponse,
  GetRecentActivityResponse,
  GetRepairParams,
  GetRepairResponse,
  GetSaleParams,
  GetSaleResponse,
  ListCustomersQueryParams,
  ListCustomersResponse,
  ListLowStockProductsResponse,
  ListProductsQueryParams,
  ListProductsResponse,
  ListRepairsQueryParams,
  ListRepairsResponse,
  ListSalesResponse,
  UpdateCustomerBody,
  UpdateCustomerParams,
  UpdateCustomerResponse,
  UpdateProductBody,
  UpdateProductParams,
  UpdateProductResponse,
  UpdateRepairBody,
  UpdateRepairParams,
  UpdateRepairResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

const productCategories = ["phone", "accessory", "part", "service"] as const;

function makeReceiptNumber() {
  return `R-${Date.now().toString(36).toUpperCase()}`;
}

function makeTicketNumber() {
  return `T-${Date.now().toString(36).toUpperCase()}`;
}

function toDateString(value: Date | string | null | undefined) {
  if (!value) {
    return null;
  }
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  return value.slice(0, 10);
}

async function getSaleRecord(id: number) {
  const [saleRow] = await db
    .select({
      id: salesTable.id,
      receiptNumber: salesTable.receiptNumber,
      customerId: salesTable.customerId,
      customerName: customersTable.name,
      paymentMethod: salesTable.paymentMethod,
      subtotal: salesTable.subtotal,
      discount: salesTable.discount,
      tax: salesTable.tax,
      total: salesTable.total,
      notes: salesTable.notes,
      createdAt: salesTable.createdAt,
    })
    .from(salesTable)
    .leftJoin(customersTable, eq(salesTable.customerId, customersTable.id))
    .where(eq(salesTable.id, id));

  if (!saleRow) {
    return null;
  }

  const items = await db
    .select({
      id: saleItemsTable.id,
      productId: saleItemsTable.productId,
      productName: productsTable.name,
      sku: productsTable.sku,
      quantity: saleItemsTable.quantity,
      unitPrice: saleItemsTable.unitPrice,
      lineTotal: saleItemsTable.lineTotal,
    })
    .from(saleItemsTable)
    .innerJoin(productsTable, eq(saleItemsTable.productId, productsTable.id))
    .where(eq(saleItemsTable.saleId, id))
    .orderBy(asc(saleItemsTable.id));

  return {
    ...saleRow,
    customerName: saleRow.customerName ?? null,
    notes: saleRow.notes ?? "",
    items,
  };
}

async function listSaleRecords() {
  const sales = await db.select().from(salesTable).orderBy(desc(salesTable.createdAt));
  const records = await Promise.all(sales.map((sale) => getSaleRecord(sale.id)));
  return records.filter((sale) => sale !== null);
}

async function getRepairRecord(id: number) {
  const [repair] = await db
    .select({
      id: repairTicketsTable.id,
      ticketNumber: repairTicketsTable.ticketNumber,
      customerId: repairTicketsTable.customerId,
      customerName: customersTable.name,
      device: repairTicketsTable.device,
      imei: repairTicketsTable.imei,
      issue: repairTicketsTable.issue,
      status: repairTicketsTable.status,
      estimate: repairTicketsTable.estimate,
      deposit: repairTicketsTable.deposit,
      dueDate: repairTicketsTable.dueDate,
      createdAt: repairTicketsTable.createdAt,
    })
    .from(repairTicketsTable)
    .innerJoin(customersTable, eq(repairTicketsTable.customerId, customersTable.id))
    .where(eq(repairTicketsTable.id, id));

  return repair ?? null;
}

async function listRepairRecords(status?: string) {
  const base = db
    .select({
      id: repairTicketsTable.id,
      ticketNumber: repairTicketsTable.ticketNumber,
      customerId: repairTicketsTable.customerId,
      customerName: customersTable.name,
      device: repairTicketsTable.device,
      imei: repairTicketsTable.imei,
      issue: repairTicketsTable.issue,
      status: repairTicketsTable.status,
      estimate: repairTicketsTable.estimate,
      deposit: repairTicketsTable.deposit,
      dueDate: repairTicketsTable.dueDate,
      createdAt: repairTicketsTable.createdAt,
    })
    .from(repairTicketsTable)
    .innerJoin(customersTable, eq(repairTicketsTable.customerId, customersTable.id));

  if (status) {
    return base
      .where(eq(repairTicketsTable.status, status as typeof repairTicketsTable.$inferSelect.status))
      .orderBy(desc(repairTicketsTable.createdAt));
  }

  return base.orderBy(desc(repairTicketsTable.createdAt));
}

router.get("/products", async (req, res): Promise<void> => {
  const parsed = ListProductsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    req.log.warn({ errors: parsed.error.message }, "Invalid product query");
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const conditions = [];
  if (parsed.data.q) {
    const q = `%${parsed.data.q}%`;
    conditions.push(
      or(
        ilike(productsTable.name, q),
        ilike(productsTable.sku, q),
        ilike(productsTable.brand, q),
      ),
    );
  }
  if (
    parsed.data.category &&
    productCategories.includes(parsed.data.category as (typeof productCategories)[number])
  ) {
    conditions.push(
      eq(
        productsTable.category,
        parsed.data.category as typeof productsTable.$inferSelect.category,
      ),
    );
  }

  const products =
    conditions.length > 0
      ? await db
          .select()
          .from(productsTable)
          .where(and(...conditions))
          .orderBy(asc(productsTable.name))
      : await db.select().from(productsTable).orderBy(asc(productsTable.name));

  res.json(ListProductsResponse.parse(products));
});

router.post("/products", async (req, res): Promise<void> => {
  const parsed = CreateProductBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ errors: parsed.error.message }, "Invalid product body");
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [product] = await db.insert(productsTable).values(parsed.data).returning();
  res.status(201).json(GetProductResponse.parse(product));
});

router.get("/products/low-stock", async (_req, res): Promise<void> => {
  const products = await db
    .select()
    .from(productsTable)
    .where(lte(productsTable.stock, productsTable.reorderLevel))
    .orderBy(asc(productsTable.stock));

  res.json(ListLowStockProductsResponse.parse(products));
});

router.get("/products/:id", async (req, res): Promise<void> => {
  const params = GetProductParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [product] = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.id, params.data.id));

  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  res.json(GetProductResponse.parse(product));
});

router.patch("/products/:id", async (req, res): Promise<void> => {
  const params = UpdateProductParams.safeParse(req.params);
  const body = UpdateProductBody.safeParse(req.body);
  if (!params.success || !body.success) {
    res.status(400).json({ error: !params.success ? params.error.message : body.error.message });
    return;
  }

  const [product] = await db
    .update(productsTable)
    .set(body.data)
    .where(eq(productsTable.id, params.data.id))
    .returning();

  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  res.json(UpdateProductResponse.parse(product));
});

router.delete("/products/:id", async (req, res): Promise<void> => {
  const params = DeleteProductParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [product] = await db
    .delete(productsTable)
    .where(eq(productsTable.id, params.data.id))
    .returning();

  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  res.sendStatus(204);
});

router.get("/customers", async (req, res): Promise<void> => {
  const parsed = ListCustomersQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const customers = parsed.data.q
    ? await db
        .select()
        .from(customersTable)
        .where(
          or(
            ilike(customersTable.name, `%${parsed.data.q}%`),
            ilike(customersTable.phone, `%${parsed.data.q}%`),
            ilike(customersTable.email, `%${parsed.data.q}%`),
          ),
        )
        .orderBy(asc(customersTable.name))
    : await db.select().from(customersTable).orderBy(asc(customersTable.name));

  res.json(ListCustomersResponse.parse(customers));
});

router.post("/customers", async (req, res): Promise<void> => {
  const parsed = CreateCustomerBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [customer] = await db
    .insert(customersTable)
    .values({
      ...parsed.data,
      email: parsed.data.email ?? "",
      deviceNotes: parsed.data.deviceNotes ?? "",
    })
    .returning();

  res.status(201).json(GetCustomerResponse.parse(customer));
});

router.get("/customers/:id", async (req, res): Promise<void> => {
  const params = GetCustomerParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [customer] = await db
    .select()
    .from(customersTable)
    .where(eq(customersTable.id, params.data.id));

  if (!customer) {
    res.status(404).json({ error: "Customer not found" });
    return;
  }

  res.json(GetCustomerResponse.parse(customer));
});

router.patch("/customers/:id", async (req, res): Promise<void> => {
  const params = UpdateCustomerParams.safeParse(req.params);
  const body = UpdateCustomerBody.safeParse(req.body);
  if (!params.success || !body.success) {
    res.status(400).json({ error: !params.success ? params.error.message : body.error.message });
    return;
  }

  const [customer] = await db
    .update(customersTable)
    .set(body.data)
    .where(eq(customersTable.id, params.data.id))
    .returning();

  if (!customer) {
    res.status(404).json({ error: "Customer not found" });
    return;
  }

  res.json(UpdateCustomerResponse.parse(customer));
});

router.delete("/customers/:id", async (req, res): Promise<void> => {
  const params = DeleteCustomerParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [customer] = await db
    .delete(customersTable)
    .where(eq(customersTable.id, params.data.id))
    .returning();

  if (!customer) {
    res.status(404).json({ error: "Customer not found" });
    return;
  }

  res.sendStatus(204);
});

router.get("/sales", async (_req, res): Promise<void> => {
  const sales = await listSaleRecords();
  res.json(ListSalesResponse.parse(sales));
});

router.post("/sales", async (req, res): Promise<void> => {
  const parsed = CreateSaleBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  try {
    const saleId = await db.transaction(async (tx) => {
      let subtotal = 0;
      const preparedItems = [];

      for (const item of parsed.data.items) {
        const [product] = await tx
          .select()
          .from(productsTable)
          .where(eq(productsTable.id, item.productId));

        if (!product) {
          throw new Error(`Product ${item.productId} not found`);
        }
        if (product.category !== "service" && product.stock < item.quantity) {
          throw new Error(`${product.name} only has ${product.stock} in stock`);
        }

        const lineTotal = item.quantity * item.unitPrice;
        subtotal += lineTotal;
        preparedItems.push({ ...item, lineTotal, currentStock: product.stock, category: product.category });
      }

      const total = Math.max(0, subtotal - parsed.data.discount + parsed.data.tax);
      const [sale] = await tx
        .insert(salesTable)
        .values({
          receiptNumber: makeReceiptNumber(),
          customerId: parsed.data.customerId ?? null,
          paymentMethod: parsed.data.paymentMethod,
          subtotal,
          discount: parsed.data.discount,
          tax: parsed.data.tax,
          total,
          notes: parsed.data.notes ?? "",
        })
        .returning();

      for (const item of preparedItems) {
        await tx.insert(saleItemsTable).values({
          saleId: sale.id,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          lineTotal: item.lineTotal,
        });

        if (item.category !== "service") {
          await tx
            .update(productsTable)
            .set({ stock: item.currentStock - item.quantity })
            .where(eq(productsTable.id, item.productId));
        }
      }

      return sale.id;
    });

    const sale = await getSaleRecord(saleId);
    res.status(201).json(GetSaleResponse.parse(sale));
  } catch (error) {
    req.log.warn({ err: error }, "Unable to create sale");
    res.status(400).json({ error: error instanceof Error ? error.message : "Unable to create sale" });
  }
});

router.get("/sales/:id", async (req, res): Promise<void> => {
  const params = GetSaleParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const sale = await getSaleRecord(params.data.id);
  if (!sale) {
    res.status(404).json({ error: "Sale not found" });
    return;
  }

  res.json(GetSaleResponse.parse(sale));
});

router.get("/repairs", async (req, res): Promise<void> => {
  const parsed = ListRepairsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const repairs = await listRepairRecords(parsed.data.status);
  res.json(ListRepairsResponse.parse(repairs));
});

router.post("/repairs", async (req, res): Promise<void> => {
  const parsed = CreateRepairBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [repair] = await db
    .insert(repairTicketsTable)
    .values({
      ...parsed.data,
      ticketNumber: makeTicketNumber(),
      imei: parsed.data.imei ?? "",
      dueDate: toDateString(parsed.data.dueDate),
    })
    .returning();

  const record = await getRepairRecord(repair.id);
  res.status(201).json(GetRepairResponse.parse(record));
});

router.get("/repairs/:id", async (req, res): Promise<void> => {
  const params = GetRepairParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const repair = await getRepairRecord(params.data.id);
  if (!repair) {
    res.status(404).json({ error: "Repair ticket not found" });
    return;
  }

  res.json(GetRepairResponse.parse(repair));
});

router.patch("/repairs/:id", async (req, res): Promise<void> => {
  const params = UpdateRepairParams.safeParse(req.params);
  const body = UpdateRepairBody.safeParse(req.body);
  if (!params.success || !body.success) {
    res.status(400).json({ error: !params.success ? params.error.message : body.error.message });
    return;
  }

  const update = {
    ...body.data,
    ...(Object.prototype.hasOwnProperty.call(body.data, "dueDate")
      ? { dueDate: toDateString(body.data.dueDate) }
      : {}),
  };

  const [repair] = await db
    .update(repairTicketsTable)
    .set(update)
    .where(eq(repairTicketsTable.id, params.data.id))
    .returning();

  if (!repair) {
    res.status(404).json({ error: "Repair ticket not found" });
    return;
  }

  const record = await getRepairRecord(repair.id);
  res.json(UpdateRepairResponse.parse(record));
});

router.delete("/repairs/:id", async (req, res): Promise<void> => {
  const params = DeleteRepairParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [repair] = await db
    .delete(repairTicketsTable)
    .where(eq(repairTicketsTable.id, params.data.id))
    .returning();

  if (!repair) {
    res.status(404).json({ error: "Repair ticket not found" });
    return;
  }

  res.sendStatus(204);
});

router.get("/dashboard/summary", async (_req, res): Promise<void> => {
  const [products, sales, saleItems, repairs] = await Promise.all([
    db.select().from(productsTable),
    db.select().from(salesTable),
    db
      .select({
        productId: saleItemsTable.productId,
        name: productsTable.name,
        quantity: saleItemsTable.quantity,
        lineTotal: saleItemsTable.lineTotal,
      })
      .from(saleItemsTable)
      .innerJoin(productsTable, eq(saleItemsTable.productId, productsTable.id)),
    db.select().from(repairTicketsTable),
  ]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todaysSales = sales.filter((sale) => sale.createdAt >= today);
  const topProductMap = new Map<number, { productId: number; name: string; quantitySold: number; revenue: number }>();

  for (const item of saleItems) {
    const current = topProductMap.get(item.productId) ?? {
      productId: item.productId,
      name: item.name,
      quantitySold: 0,
      revenue: 0,
    };
    current.quantitySold += item.quantity;
    current.revenue += item.lineTotal;
    topProductMap.set(item.productId, current);
  }

  const paymentMap = new Map<string, { paymentMethod: "cash" | "card" | "transfer" | "mixed"; total: number; count: number }>();
  for (const sale of sales) {
    const current = paymentMap.get(sale.paymentMethod) ?? {
      paymentMethod: sale.paymentMethod,
      total: 0,
      count: 0,
    };
    current.total += sale.total;
    current.count += 1;
    paymentMap.set(sale.paymentMethod, current);
  }

  res.json(
    GetDashboardSummaryResponse.parse({
      todayRevenue: todaysSales.reduce((sum, sale) => sum + sale.total, 0),
      todaySales: todaysSales.length,
      totalInventoryValue: products.reduce((sum, product) => sum + product.stock * product.costPrice, 0),
      lowStockCount: products.filter((product) => product.stock <= product.reorderLevel).length,
      openRepairs: repairs.filter((repair) => !["completed", "cancelled"].includes(repair.status)).length,
      topProducts: Array.from(topProductMap.values())
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5),
      salesByPaymentMethod: Array.from(paymentMap.values()),
    }),
  );
});

router.get("/dashboard/recent-activity", async (_req, res): Promise<void> => {
  const [sales, repairs, lowStock] = await Promise.all([
    listSaleRecords(),
    listRepairRecords(),
    db
      .select()
      .from(productsTable)
      .where(lte(productsTable.stock, productsTable.reorderLevel))
      .orderBy(asc(productsTable.stock)),
  ]);

  const activity = [
    ...sales.slice(0, 6).map((sale) => ({
      id: `sale-${sale.id}`,
      type: "sale" as const,
      title: `Sale ${sale.receiptNumber}`,
      description: `${sale.items.length} item${sale.items.length === 1 ? "" : "s"} sold${sale.customerName ? ` to ${sale.customerName}` : ""}`,
      amount: sale.total,
      createdAt: sale.createdAt,
    })),
    ...repairs.slice(0, 6).map((repair) => ({
      id: `repair-${repair.id}`,
      type: "repair" as const,
      title: `Repair ${repair.ticketNumber}`,
      description: `${repair.device} is ${repair.status.replace("_", " ")}`,
      amount: repair.estimate,
      createdAt: repair.createdAt,
    })),
    ...lowStock.slice(0, 4).map((product) => ({
      id: `inventory-${product.id}`,
      type: "inventory" as const,
      title: `${product.name} low stock`,
      description: `${product.stock} left, reorder level ${product.reorderLevel}`,
      amount: null,
      createdAt: product.createdAt,
    })),
  ]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 12);

  res.json(GetRecentActivityResponse.parse(activity));
});

export default router;