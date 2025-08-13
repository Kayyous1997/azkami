import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const countryData = [
  { name: "🇺🇸 United States", value: 89, flag: "🇺🇸" },
  { name: "🇯🇵 Japan", value: 76, flag: "🇯🇵" },
  { name: "🇮🇩 Indonesia", value: 64, flag: "🇮🇩" },
  { name: "🇬🇧 United Kingdom", value: 52, flag: "🇬🇧" },
  { name: "🇸🇬 Singapore", value: 38, flag: "🇸🇬" },
]

export function ActivityByCountry() {
  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-card">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Activity by Country</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {countryData.map((country, index) => (
            <div key={country.name} className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <span className="text-2xl">{country.flag}</span>
                <span className="text-sm font-medium text-foreground">
                  {country.name.replace(/🇺🇸|🇯🇵|🇮🇩|🇬🇧|🇸🇬/, "").trim()}
                </span>
              </div>
              <div className="flex items-center gap-3 w-32">
                <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-primary transition-all duration-1000 ease-out"
                    style={{ 
                      width: `${country.value}%`,
                      animationDelay: `${index * 0.1}s`
                    }}
                  />
                </div>
                <span className="text-sm font-medium text-foreground w-8 text-right">
                  {country.value}%
                </span>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 p-4 bg-gradient-glow rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total Active Countries</span>
            <span className="font-bold text-foreground">42</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-2">
            <span className="text-muted-foreground">Global Reach</span>
            <span className="font-bold text-success">+12% this month</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}