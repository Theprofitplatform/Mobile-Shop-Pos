import React, { useState, useMemo, useEffect } from "react";
import { useListRepairs, useDeleteRepair, useUpdateRepair, useCreateRepair, useListCustomers, getListRepairsQueryKey, RepairTicket, RepairStatus } from "@/lib/supabase-hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency, formatDate } from "@/lib/format";
import { Plus, Clock, Wrench, CheckCircle2, Edit, Trash, Search, LayoutGrid, List, User, X, Smartphone, Battery, Zap, Layers, Activity, ClipboardList, CalendarPlus } from "lucide-react";
import { RepairDialog } from "@/components/dialogs/repair-dialog";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { searchModels, getRepairsForModel, REPAIR_TYPES, type RepairPriceItem } from "@/lib/repair-pricing";

// ─── Constants ───────────────────────────────────────────────────────────────

const REPAIR_TYPE_ICONS: Record<string, React.ElementType> = {
  "Screen Replacement": Smartphone,
  "Battery Replacement": Battery,
  "Charging Port": Zap,
  "Back Glass": Layers,
  "Other": Wrench,
  "Diagnostic": Activity,
};

const STATUSES: { value: RepairStatus; label: string; color: string; bg: string }[] = [
  { value: "received", label: "Received", color: "text-blue-700 dark:text-blue-400", bg: "bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:border-blue-800/50" },
  { value: "diagnosing", label: "Diagnosing", color: "text-purple-700 dark:text-purple-400", bg: "bg-purple-50 border-purple-200 dark:bg-purple-950/40 dark:border-purple-800/50" },
  { value: "waiting_parts", label: "Waiting Parts", color: "text-orange-700 dark:text-orange-400", bg: "bg-orange-50 border-orange-200 dark:bg-orange-950/40 dark:border-orange-800/50" },
  { value: "repairing", label: "Repairing", color: "text-yellow-700 dark:text-yellow-400", bg: "bg-yellow-50 border-yellow-200 dark:bg-yellow-950/40 dark:border-yellow-800/50" },
  { value: "ready", label: "Ready", color: "text-green-700 dark:text-green-400", bg: "bg-green-50 border-green-200 dark:bg-green-950/40 dark:border-green-800/50" },
  { value: "completed", label: "Completed", color: "text-gray-600 dark:text-gray-400", bg: "bg-gray-50 border-gray-200 dark:bg-gray-900/40 dark:border-gray-700" },
];

const ACTIVE_STATUSES = STATUSES.filter(s => s.value !== "completed" && s.value !== "cancelled");

function getStatusMeta(status: string) {
  return STATUSES.find(s => s.value === status) ?? STATUSES[0];
}

function getBadgeClass(status: string) {
  const meta = getStatusMeta(status);
  return `${meta.color} ${meta.bg} border`;
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function Repairs() {
  const [activeTab, setActiveTab] = useState<"booking" | "tracking">("booking");

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      {/* Tab Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h1 className="text-2xl font-bold tracking-tight">Repairs</h1>
        <div className="flex border rounded-lg overflow-hidden">
          <button
            onClick={() => setActiveTab("booking")}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${activeTab === "booking" ? "bg-primary text-primary-foreground" : "bg-background hover:bg-accent"}`}
          >
            <CalendarPlus className="w-4 h-4" /> Booking
          </button>
          <button
            onClick={() => setActiveTab("tracking")}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${activeTab === "tracking" ? "bg-primary text-primary-foreground" : "bg-background hover:bg-accent"}`}
          >
            <ClipboardList className="w-4 h-4" /> Tracking
          </button>
        </div>
      </div>

      {activeTab === "booking" ? <BookingSection /> : <TrackingSection />}
    </div>
  );
}

// ─── BOOKING SECTION ─────────────────────────────────────────────────────────

function BookingSection() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createRepair = useCreateRepair();
  const { data: customers = [] } = useListCustomers();

  const [customerId, setCustomerId] = useState<number>(0);
  const [modelQuery, setModelQuery] = useState("");
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [imei, setImei] = useState("");
  const [selectedRepairTypes, setSelectedRepairTypes] = useState<string[]>([]);
  const [issue, setIssue] = useState("");
  const [estimate, setEstimate] = useState(0);
  const [deposit, setDeposit] = useState(0);
  const [dueDate, setDueDate] = useState("");

  const filteredModels = useMemo(() => searchModels(modelQuery), [modelQuery]);
  const availableRepairs = useMemo(() => modelQuery ? getRepairsForModel(modelQuery) : [], [modelQuery]);

  // Auto-calculate estimate from selected repair types
  useEffect(() => {
    if (selectedRepairTypes.length > 0) {
      const total = selectedRepairTypes.reduce((sum, rt) => {
        const p = availableRepairs.find(r => r.repairType === rt);
        return sum + (p?.basePrice ?? 0);
      }, 0);
      setEstimate(total);
      setIssue(selectedRepairTypes.join(", "));
    }
  }, [selectedRepairTypes, availableRepairs]);

  const selectModel = (model: string) => {
    setModelQuery(model);
    setShowModelDropdown(false);
    setSelectedRepairTypes([]);
  };

  const toggleRepairType = (rt: string) => {
    setSelectedRepairTypes(prev =>
      prev.includes(rt) ? prev.filter(x => x !== rt) : [...prev, rt]
    );
  };

  const resetForm = () => {
    setCustomerId(0);
    setModelQuery("");
    setImei("");
    setSelectedRepairTypes([]);
    setIssue("");
    setEstimate(0);
    setDeposit(0);
    setDueDate("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId || !modelQuery || !issue) {
      toast({ title: "Fill required fields", description: "Customer, device, and issue are required.", variant: "destructive" });
      return;
    }
    createRepair.mutate(
      {
        data: {
          customerId,
          device: modelQuery,
          imei: imei || undefined,
          issue,
          status: "received",
          estimate,
          deposit,
          dueDate: dueDate || undefined,
        },
      },
      {
        onSuccess: () => {
          toast({ title: "Repair ticket created" });
          queryClient.invalidateQueries({ queryKey: getListRepairsQueryKey() });
          resetForm();
        },
        onError: () => toast({ title: "Failed to create ticket", variant: "destructive" }),
      }
    );
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Customer & Device */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <CalendarPlus className="w-5 h-5 text-primary" /> New Repair Booking
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Customer */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Customer *</label>
              <Select onValueChange={(val) => setCustomerId(Number(val))} value={customerId ? customerId.toString() : ""}>
                <SelectTrigger><SelectValue placeholder="Select customer..." /></SelectTrigger>
                <SelectContent>
                  {customers.map(c => (
                    <SelectItem key={c.id} value={c.id.toString()}>{c.name} — {c.phone}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Device Model */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5 relative">
                <label className="text-sm font-medium">Device Model *</label>
                <Input
                  placeholder="e.g. iPhone 15 Pro"
                  value={modelQuery}
                  onChange={(e) => { setModelQuery(e.target.value); setShowModelDropdown(true); }}
                  onFocus={() => setShowModelDropdown(true)}
                  onBlur={() => setTimeout(() => setShowModelDropdown(false), 200)}
                />
                {showModelDropdown && filteredModels.length > 0 && (
                  <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-popover border rounded-md shadow-lg max-h-48 overflow-y-auto">
                    {filteredModels.map(model => (
                      <button
                        key={model}
                        type="button"
                        className="w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors"
                        onMouseDown={(e) => { e.preventDefault(); selectModel(model); }}
                      >
                        {model}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">IMEI / Serial</label>
                <Input placeholder="Optional" value={imei} onChange={(e) => setImei(e.target.value)} />
              </div>
            </div>

            {/* Repair Type Grid */}
            {availableRepairs.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Repair Type</label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {REPAIR_TYPES.map(rt => {
                    const priceItem = availableRepairs.find(r => r.repairType === rt.id);
                    const isAvailable = !!priceItem;
                    const isSelected = selectedRepairTypes.includes(rt.id);
                    const Icon = REPAIR_TYPE_ICONS[rt.id] ?? Wrench;
                    return (
                      <button
                        key={rt.id}
                        type="button"
                        disabled={!isAvailable}
                        onClick={() => isAvailable && toggleRepairType(rt.id)}
                        className={`flex flex-col items-center gap-1 p-3 rounded-lg border text-xs font-medium transition-all ${
                          !isAvailable
                            ? "opacity-30 cursor-not-allowed"
                            : isSelected
                              ? "bg-primary/10 border-primary text-primary ring-1 ring-primary"
                              : "hover:bg-accent cursor-pointer"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{rt.label}</span>
                        {isAvailable && <span className={`text-[10px] ${isSelected ? "font-bold" : "text-muted-foreground"}`}>{formatCurrency(priceItem.basePrice)}</span>}
                        {isAvailable && priceItem.estimatedTime && <span className="text-[10px] text-muted-foreground">{priceItem.estimatedTime}</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Issue */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Issue Description *</label>
              <Textarea className="resize-none h-20" placeholder="Describe the problem..." value={issue} onChange={(e) => setIssue(e.target.value)} />
            </div>

            {/* Due Date */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Due Date (Optional)</label>
              <Input type="datetime-local" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        {/* Right: Price Summary */}
        <Card className="h-fit">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Price Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedRepairTypes.length > 0 ? (
              <div className="space-y-2 text-sm">
                {selectedRepairTypes.map(rt => {
                  const p = availableRepairs.find(r => r.repairType === rt);
                  return p ? (
                    <div key={rt} className="flex justify-between items-center">
                      <span className="text-muted-foreground">{rt}</span>
                      <span className="font-medium">{formatCurrency(p.basePrice)}</span>
                    </div>
                  ) : null;
                })}
                <div className="border-t pt-2 flex justify-between text-base font-bold">
                  <span>Estimate</span>
                  <span className="text-primary">{formatCurrency(estimate)}</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Select a device and repair type to see pricing
              </p>
            )}

            <div className="border-t pt-4 space-y-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Estimated Cost</label>
                <Input type="number" step="0.01" value={estimate} onChange={(e) => setEstimate(Number(e.target.value))} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Deposit Paid</label>
                <Input type="number" step="0.01" value={deposit} onChange={(e) => setDeposit(Number(e.target.value))} />
              </div>
              {deposit > 0 && estimate > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Balance Due</span>
                  <span className="font-bold text-orange-600">{formatCurrency(estimate - deposit)}</span>
                </div>
              )}
            </div>

            <Button type="submit" className="w-full h-11 text-base" disabled={createRepair.isPending}>
              {createRepair.isPending ? "Creating..." : "Create Ticket"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </form>
  );
}

// ─── TRACKING SECTION ────────────────────────────────────────────────────────

function TrackingSection() {
  const { data: repairs = [], isLoading } = useListRepairs();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRepair, setSelectedRepair] = useState<RepairTicket | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "board">("board");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const deleteRepair = useDeleteRepair();
  const updateRepair = useUpdateRepair();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  const handleEdit = (repair: RepairTicket) => { setSelectedRepair(repair); setDialogOpen(true); };

  const handleDelete = (id: number) => {
    if (confirm("Delete this repair ticket?")) {
      deleteRepair.mutate({ id }, {
        onSuccess: () => { toast({ title: "Deleted" }); queryClient.invalidateQueries({ queryKey: getListRepairsQueryKey() }); },
        onError: () => toast({ title: "Failed", variant: "destructive" }),
      });
    }
  };

  const handleStatusChange = (ticketId: number, newStatus: RepairStatus) => {
    updateRepair.mutate({ id: ticketId, data: { status: newStatus } }, {
      onSuccess: () => { toast({ title: `Moved to ${getStatusMeta(newStatus).label}` }); queryClient.invalidateQueries({ queryKey: getListRepairsQueryKey() }); },
      onError: () => toast({ title: "Failed", variant: "destructive" }),
    });
  };

  const handleDragStart = (e: React.DragEvent, id: number) => { e.dataTransfer.setData("repairId", id.toString()); e.dataTransfer.effectAllowed = "move"; };
  const handleDragOver = (e: React.DragEvent, status: string) => { e.preventDefault(); if (dragOverColumn !== status) setDragOverColumn(status); };
  const handleDrop = (e: React.DragEvent, status: RepairStatus) => {
    e.preventDefault(); setDragOverColumn(null);
    const id = Number(e.dataTransfer.getData("repairId"));
    if (!id) return;
    const ticket = repairs.find(r => r.id === id);
    if (ticket && ticket.status !== status) handleStatusChange(id, status);
  };

  const filtered = repairs.filter(r => {
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const terms = q.split(/\s+/);
    const searchable = `${r.device} ${r.issue} ${r.customerName} ${r.ticketNumber} ${r.imei}`.toLowerCase();
    return terms.every(term => searchable.includes(term));
  });

  const activeFiltered = filtered.filter(r => r.status !== "completed" && r.status !== "cancelled");
  const completedFiltered = filtered.filter(r => r.status === "completed");

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by device, customer, issue, or ticket #..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          {searchQuery && <button className="absolute right-3 top-1/2 -translate-y-1/2" onClick={() => setSearchQuery("")}><X className="w-4 h-4 text-muted-foreground hover:text-foreground" /></button>}
        </div>
        <div className="flex items-center gap-2">
          <div className="border rounded-md flex">
            <button className={`px-2.5 py-1.5 text-xs font-medium rounded-l-md transition-colors ${viewMode === "board" ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`} onClick={() => setViewMode("board")}><LayoutGrid className="w-4 h-4" /></button>
            <button className={`px-2.5 py-1.5 text-xs font-medium rounded-r-md transition-colors ${viewMode === "list" ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`} onClick={() => setViewMode("list")}><List className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      {/* Status filters for list view */}
      {viewMode === "list" && (
        <div className="flex flex-wrap gap-1.5">
          <button onClick={() => setStatusFilter("all")} className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${statusFilter === "all" ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-accent"}`}>All ({repairs.length})</button>
          {ACTIVE_STATUSES.map(s => {
            const count = repairs.filter(r => r.status === s.value).length;
            return <button key={s.value} onClick={() => setStatusFilter(s.value)} className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${statusFilter === s.value ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-accent"}`}>{s.label} ({count})</button>;
          })}
        </div>
      )}

      {/* Stats */}
      <div className="flex gap-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5"><Wrench className="w-4 h-4 text-primary" /> {activeFiltered.length} active</span>
        <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-600" /> {completedFiltered.length} completed</span>
        <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-orange-500" /> {filtered.filter(r => r.status === "waiting_parts").length} waiting parts</span>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      ) : viewMode === "board" ? (
        /* ═══ KANBAN BOARD ═══ */
        <div className="flex gap-3 overflow-x-auto pb-4" style={{ minHeight: "calc(100vh - 20rem)" }}>
          {ACTIVE_STATUSES.map(col => {
            const colRepairs = filtered.filter(r => r.status === col.value).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            return (
              <div key={col.value} className={`flex-shrink-0 w-64 flex flex-col rounded-lg border transition-colors ${dragOverColumn === col.value ? "border-primary bg-primary/5" : "border-border bg-muted/20"}`}
                onDragOver={(e) => handleDragOver(e, col.value)} onDrop={(e) => handleDrop(e, col.value as RepairStatus)} onDragLeave={() => setDragOverColumn(null)}>
                <div className={`px-3 py-2.5 border-b rounded-t-lg ${col.bg}`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-semibold uppercase tracking-wider ${col.color}`}>{col.label}</span>
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${col.bg} ${col.color}`}>{colRepairs.length}</span>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                  {colRepairs.map(ticket => (
                    <div key={ticket.id} draggable onDragStart={(e) => handleDragStart(e, ticket.id)}
                      className="bg-card border rounded-md p-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow group">
                      <div className="flex justify-between items-start mb-1.5">
                        <span className="font-mono text-[10px] text-muted-foreground">{ticket.ticketNumber}</span>
                        <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-0.5 hover:text-primary" onClick={() => handleEdit(ticket)}><Edit className="w-3 h-3" /></button>
                          <button className="p-0.5 hover:text-destructive" onClick={() => handleDelete(ticket.id)}><Trash className="w-3 h-3" /></button>
                        </div>
                      </div>
                      <div className="font-medium text-sm leading-tight mb-1">{ticket.device}</div>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{ticket.issue}</p>
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="flex items-center gap-1 text-muted-foreground truncate"><User className="w-3 h-3 flex-shrink-0" /> {ticket.customerName}</span>
                        <span className="font-bold text-xs">{formatCurrency(ticket.estimate)}</span>
                      </div>
                      {ticket.dueDate && <div className="flex items-center gap-1 text-[10px] text-orange-600 dark:text-orange-400 mt-1.5"><Clock className="w-3 h-3" /> Due: {formatDate(ticket.dueDate).split(",")[0]}</div>}
                      <div className="mt-2 pt-2 border-t">
                        <select className="w-full text-[10px] bg-transparent border rounded px-1.5 py-1 focus:outline-none focus:ring-1 focus:ring-primary" value={ticket.status}
                          onChange={(e) => handleStatusChange(ticket.id, e.target.value as RepairStatus)} onClick={(e) => e.stopPropagation()}>
                          {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                        </select>
                      </div>
                    </div>
                  ))}
                  {colRepairs.length === 0 && <div className="text-center py-6 text-xs text-muted-foreground">Drop here</div>}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ═══ LIST VIEW ═══ */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-3">
            {activeFiltered.length === 0 && <div className="text-center py-12 text-muted-foreground border border-dashed rounded-lg bg-card">No active tickets{searchQuery ? ` matching "${searchQuery}"` : ""}.</div>}
            {activeFiltered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(ticket => (
              <Card key={ticket.id} className="hover:shadow-md transition-shadow relative group">
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="outline" size="icon" className="h-8 w-8 bg-background" onClick={() => handleEdit(ticket)}><Edit className="w-4 h-4" /></Button>
                  <Button variant="outline" size="icon" className="h-8 w-8 bg-background hover:text-destructive" onClick={() => handleDelete(ticket.id)}><Trash className="w-4 h-4" /></Button>
                </div>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <div className="space-y-1 flex-1 pr-16">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm text-primary font-semibold">{ticket.ticketNumber}</span>
                        <select className={`text-xs px-2 py-0.5 rounded-full font-medium cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary ${getBadgeClass(ticket.status)}`} value={ticket.status}
                          onChange={(e) => handleStatusChange(ticket.id, e.target.value as RepairStatus)}>
                          {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                        </select>
                      </div>
                      <h3 className="font-bold text-lg">{ticket.device}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{ticket.issue}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
                        <span className="flex items-center gap-1"><User className="w-3 h-3" /> {ticket.customerName}</span>
                        {ticket.dueDate && <span className="flex items-center gap-1 text-orange-600 dark:text-orange-400"><Clock className="w-3 h-3" /> Due: {formatDate(ticket.dueDate).split(",")[0]}</span>}
                      </div>
                    </div>
                    <div className="text-right flex flex-row sm:flex-col justify-between sm:justify-start gap-2 bg-muted/20 p-3 rounded-md border">
                      <div><div className="text-xs text-muted-foreground">Estimate</div><div className="font-bold">{formatCurrency(ticket.estimate)}</div></div>
                      <div><div className="text-xs text-muted-foreground">Deposit</div><div className="font-medium text-green-600 dark:text-green-400">{formatCurrency(ticket.deposit)}</div></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-muted-foreground"><CheckCircle2 className="w-5 h-5" /> Completed</h2>
            {completedFiltered.slice(0, 8).map(ticket => (
              <Card key={ticket.id} className="bg-muted/30 opacity-75 hover:opacity-100 transition-opacity">
                <CardContent className="p-3 relative group">
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"><Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleEdit(ticket)}><Edit className="w-3 h-3" /></Button></div>
                  <div className="flex justify-between items-start">
                    <div className="pr-8"><div className="font-mono text-xs text-muted-foreground">{ticket.ticketNumber}</div><div className="font-medium text-sm">{ticket.device}</div><div className="text-xs text-muted-foreground mt-0.5">{ticket.customerName}</div></div>
                    <div className="font-bold text-sm">{formatCurrency(ticket.estimate)}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {completedFiltered.length === 0 && <div className="text-center py-6 text-xs text-muted-foreground border border-dashed rounded-lg">No completed repairs.</div>}
          </div>
        </div>
      )}

      <RepairDialog open={dialogOpen} onOpenChange={setDialogOpen} repair={selectedRepair} />
    </div>
  );
}
