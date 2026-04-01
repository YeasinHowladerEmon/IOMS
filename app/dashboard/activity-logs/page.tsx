"use client";

import { useActivityLogsQuery } from "@/lib/activity";
import { motion } from "framer-motion";
import { 
  Loader2, 
  History,
  User,
  Layers,
  Activity,
  Calendar,
  Clock
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Table, THead, TBody, TH, TD, TR } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function ActivityLogsPage() {
  const { data: logs = [], isLoading, error } = useActivityLogsQuery();

  return (
    <motion.div 
      className="space-y-8" 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-foreground">Activity Logs</h1>
        <p className="text-lg text-muted-foreground mt-1">Audit trail of all system actions</p>
      </div>

      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4 text-muted-foreground">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="font-medium">Fetching history…</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-destructive bg-destructive/5 border border-destructive/10 rounded-2xl">
            <p className="font-bold">Error loading logs</p>
            <p className="text-sm opacity-80">{(error as Error).message}</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4 text-muted-foreground text-center">
             <History className="w-16 h-16 opacity-10" />
             <p className="text-xl font-bold">No logs yet.</p>
             <p className="text-sm opacity-60">System activities will appear here once actions are performed.</p>
          </div>
        ) : (
          <Table>
            <THead>
              <TR>
                <TH>Timestamp</TH>
                <TH>User</TH>
                <TH>Action</TH>
                <TH>Module</TH>
                <TH>Details</TH>
              </TR>
            </THead>
            <TBody>
              {logs.map((log) => (
                <TR key={log.id} className="group">
                  <TD>
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-1.5 text-foreground font-mono font-bold">
                        <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                        {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {new Date(log.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </TD>
                  <TD>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                        <User className="w-4.5 h-4.5" />
                      </div>
                      <span className="font-bold text-foreground">{log.userName}</span>
                    </div>
                  </TD>
                  <TD>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                        <Activity className="w-3.5 h-3.5 mr-1" />
                        {log.action}
                      </Badge>
                    </div>
                  </TD>
                  <TD>
                    <Badge variant="outline" className="bg-muted text-muted-foreground border-border uppercase text-[10px] tracking-widest font-black">
                      {log.module}
                    </Badge>
                  </TD>
                  <TD>
                    <div className="max-w-xs text-sm text-foreground/70 group-hover:text-foreground transition-colors italic">
                      {log.details || "—"}
                    </div>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}
      </Card>
    </motion.div>
  );
}
