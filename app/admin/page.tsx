"use client";

import { GlassCard } from "@/components/admin/GlassCard";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { Clock, FileCheck2, TrendingUp } from "lucide-react";

const pieData = [
  { name: "Verifications", value: 184, fill: "var(--color-chart-1)" },
  { name: "Degree Changes", value: 47, fill: "var(--color-chart-3)" },
];

const topPocs = [
  { name: "Dr. Aditi Sharma", dept: "Computer Science", count: 42 },
  { name: "Prof. Rajesh Menon", dept: "Electrical Engineering", count: 36 },
  { name: "Dr. Priya Iyer", dept: "Mechanical", count: 28 },
  { name: "Prof. Karthik Nair", dept: "Civil", count: 21 },
  { name: "Dr. Meera Krishnan", dept: "Mathematics", count: 17 },
];

function Stat({ label, value, sub, icon: Icon }: { label: string; value: string; sub?: string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <GlassCard className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>
          {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
        </div>
        <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
          <Icon className="size-4" />
        </div>
      </div>
    </GlassCard>
  );
}

export default function Dashboard() {
  const total = pieData.reduce((s, d) => s + d.value, 0);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Activity over the last 30 days.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Stat label="Requests (30d)" value={total.toString()} sub="All categories" icon={FileCheck2} />
        <Stat label="Avg. verification time" value="2.4d" sub="Down 12% vs prev." icon={Clock} />
        <Stat label="Processed (30d)" value="208" sub="90% completion rate" icon={TrendingUp} />
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <GlassCard className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold">Request mix</h2>
              <p className="text-xs text-muted-foreground">Last 30 days</p>
            </div>
          </div>
          <ChartContainer
            config={{
              Verifications: { label: "Verifications", color: "var(--color-chart-1)" },
              "Degree Changes": { label: "Degree Changes", color: "var(--color-chart-3)" },
            }}
            className="mt-4 aspect-square max-h-[260px] w-full"
          >
            <ResponsiveContainer>
              <PieChart>
                <Tooltip content={<ChartTooltipContent hideLabel />} />
                <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={95} strokeWidth={2} stroke="var(--color-card)">
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
          <div className="mt-4 flex items-center justify-center gap-6 text-xs">
            {pieData.map((d) => (
              <div key={d.name} className="flex items-center gap-2">
                <span className="size-2.5 rounded-full" style={{ background: d.fill }} />
                <span className="text-muted-foreground">{d.name}</span>
                <span className="font-medium text-foreground">{d.value}</span>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-6 lg:col-span-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold">Top POCs</h2>
              <p className="text-xs text-muted-foreground">By requests handled</p>
            </div>
          </div>
          <ol className="mt-4 divide-y divide-border/60">
            {topPocs.map((p, i) => (
              <li key={p.name} className="flex items-center gap-4 py-3">
                <span className="size-7 rounded-lg bg-muted text-muted-foreground text-xs font-semibold flex items-center justify-center tabular-nums">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{p.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{p.dept}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold tabular-nums">{p.count}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">requests</p>
                </div>
              </li>
            ))}
          </ol>
        </GlassCard>
      </div>
    </div>
  );
}
