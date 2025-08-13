import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const data = [
  { name: "Q1", target: 400000, actual: 240000 },
  { name: "Q2", target: 300000, actual: 139800 },
  { name: "Q3", target: 200000, actual: 980000 },
  { name: "Q4", target: 278000, actual: 390800 },
  { name: "Q1", target: 189000, actual: 480000 },
  { name: "Q2", target: 239000, actual: 380000 },
  { name: "Q3", target: 349000, actual: 430000 },
]

export function AnalyticsChart() {
  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-card">
      <CardHeader>
        <CardTitle className="text-xl font-semibold flex items-center justify-between">
          Analytics
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-chart-1"></div>
              <span className="text-muted-foreground">Target</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-chart-2"></div>
              <span className="text-muted-foreground">Actual</span>
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="name" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickFormatter={(value) => `$${value / 1000}K`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  color: "hsl(var(--foreground))"
                }}
                formatter={(value: number) => [`$${value.toLocaleString()}`, ""]}
              />
              <Area
                type="monotone"
                dataKey="target"
                stroke="hsl(var(--chart-1))"
                fillOpacity={1}
                fill="url(#colorTarget)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="actual"
                stroke="hsl(var(--chart-2))"
                fillOpacity={1}
                fill="url(#colorActual)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-gradient-glow rounded-lg">
            <p className="text-sm text-muted-foreground">Target</p>
            <p className="text-xl font-bold text-chart-1">$239K</p>
          </div>
          <div className="text-center p-3 bg-gradient-glow rounded-lg">
            <p className="text-sm text-muted-foreground">Actual</p>
            <p className="text-xl font-bold text-chart-2">$430K</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}