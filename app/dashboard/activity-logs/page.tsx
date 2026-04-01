"use client";

import { useActivityLogsQuery } from "@/lib/activities";
import { motion, AnimatePresence } from "framer-motion";
import { 
  History, 
  Clock, 
  Activity, 
  Loader2, 
  Calendar,
  ChevronRight,
  ArrowRightCircle,
  FileText
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format, isToday, isYesterday, parseISO } from "date-fns";

export default function ActivityLogsPage() {
  const { data: logs = [], isLoading, error, refetch } = useActivityLogsQuery(100);

  // Group logs by date
  const groupedLogs = logs.reduce((acc, log) => {
    const date = format(parseISO(log.createdAt), "yyyy-MM-dd");
    if (!acc[date]) acc[date] = [];
    acc[date].push(log);
    return acc;
  }, {} as Record<string, typeof logs>);

  const dateKeys = Object.keys(groupedLogs).sort((a, b) => b.localeCompare(a));

  return (
    <motion.div 
      className="space-y-8 pb-10" 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-foreground uppercase italic">System Pulse</h1>
          <p className="text-muted-foreground text-lg mt-1 font-medium italic underline decoration-primary/30 decoration-4 underline-offset-4">
            A comprehensive timeline of all workspace events
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="border-primary/20 bg-primary/5">
           <Activity className="w-4 h-4 mr-2" />
           Live Tracking Active
        </Button>
      </div>

      {isLoading ? (
        <div className="h-[50vh] flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <p className="text-muted-foreground font-bold uppercase tracking-widest text-[10px]">Synchronizing System Events…</p>
        </div>
      ) : dateKeys.length === 0 ? (
        <Card className="p-16 flex flex-col items-center justify-center text-center space-y-4">
          <History className="w-16 h-16 text-muted-foreground/20" />
          <p className="text-xl font-black text-foreground uppercase italic">No pulse detected</p>
          <p className="text-muted-foreground max-w-xs">The activity log is currently quiet. Actions will appear here as they occur.</p>
        </Card>
      ) : (
        <div className="space-y-12">
          {dateKeys.map((dateKey) => (
            <div key={dateKey} className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
                  <Calendar className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-black text-foreground uppercase tracking-tight italic">
                  {isToday(parseISO(dateKey)) ? "Today" : isYesterday(parseISO(dateKey)) ? "Yesterday" : format(parseISO(dateKey), "MMMM d, yyyy")}
                </h3>
                <div className="flex-1 h-0.5 bg-linear-to-r from-border/50 to-transparent" />
              </div>

              <div className="relative pl-10 space-y-4">
                {/* Vertical Line */}
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-linear-to-b from-primary/40 via-primary/10 to-transparent" />

                {groupedLogs[dateKey].map((log, i) => (
                  <motion.div 
                    key={log.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="relative group p-5 rounded-2xl bg-muted/10 border border-border/50 hover:bg-primary/2 hover:border-primary/20 transition-all cursor-default"
                  >
                    {/* Circle on line */}
                    <div className="absolute -left-[30px] top-7 w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-background group-hover:scale-125 transition-transform group-hover:shadow-[0_0_12px_oklch(0.68_0.24_262)]" />
                    
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                            {format(parseISO(log.createdAt), "hh:mm a")}
                          </span>
                          <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-primary/20 text-primary font-black uppercase">
                            Logged
                          </Badge>
                        </div>
                        <p className="text-base font-bold text-foreground leading-tight group-hover:text-primary transition-colors">
                          {log.message}
                        </p>
                      </div>
                      <ArrowRightCircle className="w-5 h-5 text-muted-foreground/30 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
