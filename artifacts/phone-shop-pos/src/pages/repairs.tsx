import React, { useState } from "react";
import { useListRepairs, useDeleteRepair, getListRepairsQueryKey, RepairTicket } from "@/lib/supabase-hooks";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/format";
import { Plus, Clock, Wrench, CheckCircle2, Edit, Trash } from "lucide-react";
import { RepairDialog } from "@/components/dialogs/repair-dialog";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export default function Repairs() {
  const { data: repairs = [], isLoading } = useListRepairs();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRepair, setSelectedRepair] = useState<RepairTicket | null>(null);
  const deleteRepair = useDeleteRepair();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleAdd = () => {
    setSelectedRepair(null);
    setDialogOpen(true);
  };

  const handleEdit = (repair: RepairTicket) => {
    setSelectedRepair(repair);
    setDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this repair ticket?")) {
      deleteRepair.mutate(
        { id },
        {
          onSuccess: () => {
            toast({ title: "Repair ticket deleted" });
            queryClient.invalidateQueries({ queryKey: getListRepairsQueryKey() });
          },
          onError: () => toast({ title: "Failed to delete ticket", variant: "destructive" }),
        }
      );
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'received': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/50';
      case 'diagnosing': return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800/50';
      case 'waiting_parts': return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800/50';
      case 'repairing': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800/50';
      case 'ready': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800/50';
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const activeRepairs = repairs.filter(r => r.status !== 'completed' && r.status !== 'cancelled');

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Repair Tracking</h1>
        <Button className="gap-2" onClick={handleAdd}>
          <Plus className="w-4 h-4" /> New Ticket
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Wrench className="w-5 h-5 text-primary" /> Active Repairs ({activeRepairs.length})
          </h2>
          
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : activeRepairs.map((ticket) => (
            <Card key={ticket.id} className="hover:shadow-md transition-shadow relative group">
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="outline" size="icon" className="h-8 w-8 bg-background" onClick={() => handleEdit(ticket)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" className="h-8 w-8 bg-background hover:text-destructive" onClick={() => handleDelete(ticket.id)}>
                  <Trash className="w-4 h-4" />
                </Button>
              </div>
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div className="space-y-1 flex-1 pr-16">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm text-primary font-semibold">{ticket.ticketNumber}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border capitalize font-medium ${getStatusColor(ticket.status)}`}>
                        {ticket.status.replace('_', ' ')}
                      </span>
                    </div>
                    <h3 className="font-bold text-lg">{ticket.device}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{ticket.issue}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
                      <span className="flex items-center gap-1"><UserIcon className="w-3 h-3" /> {ticket.customerName}</span>
                      {ticket.dueDate && (
                        <span className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
                          <Clock className="w-3 h-3" /> Due: {formatDate(ticket.dueDate).split(',')[0]}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex flex-row sm:flex-col justify-between sm:justify-start gap-2 bg-muted/20 p-3 rounded-md border">
                    <div>
                      <div className="text-xs text-muted-foreground">Estimate</div>
                      <div className="font-bold">{formatCurrency(ticket.estimate)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Deposit</div>
                      <div className="font-medium text-green-600 dark:text-green-400">{formatCurrency(ticket.deposit)}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {!isLoading && activeRepairs.length === 0 && (
            <div className="text-center py-12 text-muted-foreground border border-dashed rounded-lg bg-card">
              No active repair tickets.
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2 text-muted-foreground">
            <CheckCircle2 className="w-5 h-5" /> Recently Completed
          </h2>
          <div className="space-y-3">
            {repairs.filter(r => r.status === 'completed').slice(0, 5).map(ticket => (
              <Card key={ticket.id} className="bg-muted/30 opacity-75 hover:opacity-100 transition-opacity">
                <CardContent className="p-3 relative group">
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleEdit(ticket)}>
                      <Edit className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="flex justify-between items-start">
                    <div className="pr-8">
                      <div className="font-mono text-xs text-muted-foreground">{ticket.ticketNumber}</div>
                      <div className="font-medium text-sm">{ticket.device}</div>
                    </div>
                    <div className="font-bold text-sm">{formatCurrency(ticket.estimate)}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
      
      <RepairDialog open={dialogOpen} onOpenChange={setDialogOpen} repair={selectedRepair} />
    </div>
  );
}

function UserIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
