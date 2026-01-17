import type { Report, Space } from "@/lib/types"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { Separator } from "./ui/separator"
import { Clock, Users, Radio, TrendingUp, Lightbulb, MessageSquare, BarChart3, AlertCircle } from "lucide-react"
import {
  formatDate,
  formatDuration,
  getTotalListeners,
  formatHosts,
  getAdminDetails,
  getSpeakerDetails,
  formatTimeRange,
} from "@/lib/format"
import { getListenUrl } from "@/lib/api"

interface ReportDisplayProps {
  report: Report
  space?: Space
}

export function ReportDisplay({ report, space }: ReportDisplayProps) {
  const reportData = report.report_data
  const totalListeners = space ? getTotalListeners(space) : 0
  const hosts = space ? formatHosts(space) : ""
  const admins = space ? getAdminDetails(space) : []
  const speakers = space ? getSpeakerDetails(space) : []

  // Handle missing report data
  if (!reportData) {
    return (
      <div className="flex flex-col gap-6">
        {space && (
          <div className="space-y-4">
            <div className="space-y-3">
              {space.title_en && (
                <h1 className="text-3xl font-semibold tracking-tight text-balance leading-tight">{space.title_en}</h1>
              )}
              <p
                className={
                  space.title_en
                    ? "text-lg text-muted-foreground text-balance"
                    : "text-3xl font-semibold tracking-tight text-balance leading-tight"
                }
              >
                {space.title}
              </p>
            </div>
            <p className="text-muted-foreground">Report data is not available for this space.</p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header Section - Compact and informative */}
      {space && (
        <div className="space-y-4">
          <div className="space-y-3">
            {space.title_en && (
              <h1 className="text-3xl font-semibold tracking-tight text-balance leading-tight">{space.title_en}</h1>
            )}
            <p
              className={
                space.title_en
                  ? "text-lg text-muted-foreground text-balance"
                  : "text-3xl font-semibold tracking-tight text-balance leading-tight"
              }
            >
              {space.title}
            </p>
          </div>

          {/* Metadata bar */}
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="inline-flex items-center gap-2 text-muted-foreground">
              <Radio className="size-4" />
              <span>{formatDate(space.date)}</span>
            </div>
            <div className="inline-flex items-center gap-2 text-muted-foreground">
              <Clock className="size-4" />
              <span>{formatDuration(space)}</span>
            </div>
            <div className="inline-flex items-center gap-2 text-muted-foreground">
              <Users className="size-4" />
              <span>{totalListeners.toLocaleString()} listeners</span>
            </div>
            <Button size="sm" asChild>
              <a href={getListenUrl(space.id)} target="_blank" rel="noopener noreferrer">
                Listen on X
              </a>
            </Button>
          </div>

          {/* Participants */}
          <div className="flex flex-wrap items-center gap-6">
            {admins.length > 0 && (
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-muted-foreground">
                  {admins.length === 1 ? "Host" : "Hosts"}
                </span>
                <div className="flex -space-x-2">
                  {admins.slice(0, 5).map((admin, index) => {
                    const name = admin.display_name || admin.twitter_screen_name || "Host"
                    const initial = name.charAt(0).toUpperCase()
                    const displayInitial = /^[A-Z0-9]$/.test(initial) ? initial : "❓"
                    return (
                      <Avatar key={index} className="size-8 border-2 border-background ring-1 ring-border" title={name}>
                        <AvatarImage src={admin.avatar_url || undefined} alt={name} />
                        <AvatarFallback className="text-xs bg-muted" suppressHydrationWarning>
                          {displayInitial}
                        </AvatarFallback>
                      </Avatar>
                    )
                  })}
                  {admins.length > 5 && (
                    <Avatar className="size-8 border-2 border-background ring-1 ring-border">
                      <AvatarFallback className="text-xs bg-muted">+{admins.length - 5}</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              </div>
            )}

            {speakers.length > 0 && (
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-muted-foreground">
                  {speakers.length} {speakers.length === 1 ? "Speaker" : "Speakers"}
                </span>
                <div className="flex -space-x-2">
                  {speakers.slice(0, 5).map((speaker, index) => {
                    const name = speaker.display_name || speaker.twitter_screen_name || "Speaker"
                    const initial = name.charAt(0).toUpperCase()
                    const displayInitial = /^[A-Z0-9]$/.test(initial) ? initial : "❓"
                    return (
                      <Avatar key={index} className="size-8 border-2 border-background ring-1 ring-border" title={name}>
                        <AvatarImage src={speaker.avatar_url || undefined} alt={name} />
                        <AvatarFallback className="text-xs bg-muted" suppressHydrationWarning>
                          {displayInitial}
                        </AvatarFallback>
                      </Avatar>
                    )
                  })}
                  {speakers.length > 5 && (
                    <Avatar className="size-8 border-2 border-background ring-1 ring-border">
                      <AvatarFallback className="text-xs bg-muted">+{speakers.length - 5}</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              </div>
            )}
          </div>

          <Separator />
        </div>
      )}

      {/* Abstract - Prominent positioning */}
      {reportData.abstract && reportData.abstract.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="size-1.5 rounded-full bg-primary" />
            <h2 className="text-xl font-semibold">Summary</h2>
          </div>
          <div className="space-y-3 text-muted-foreground leading-relaxed">
            {reportData.abstract.map((paragraph, index) => (
              <p key={index} className="text-pretty">
                {paragraph}
              </p>
            ))}
          </div>
        </section>
      )}

      {/* Key Insights - Highlighted section */}
      {reportData.key_insights && reportData.key_insights.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Lightbulb className="size-5 text-primary" />
            <h2 className="text-xl font-semibold">Key Insights</h2>
          </div>
          <div className="grid gap-3">
            {reportData.key_insights.map((insight, index) => (
              <div key={index} className="flex gap-3 rounded-lg border border-border bg-card p-4">
                <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {index + 1}
                </div>
                <p className="text-sm leading-relaxed text-pretty flex-1">{insight}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Timeline */}
      {reportData.timeline && reportData.timeline.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="size-5 text-primary" />
            <h2 className="text-xl font-semibold">Timeline</h2>
          </div>
          <div className="space-y-4 border-l-2 border-border pl-6">
            {reportData.timeline.map((entry, index) => {
              const timeRange = formatTimeRange(entry.start_time_ms, entry.end_time_ms)
              return (
                <div key={index} className="relative space-y-1.5">
                  <div className="absolute -left-[27px] top-1.5 size-3 rounded-full border-2 border-primary bg-background" />
                  <div className="flex flex-wrap items-baseline gap-2">
                    <h3 className="font-medium text-pretty">{entry.event}</h3>
                    {timeRange && (
                      <Badge variant="outline" className="text-xs">
                        {timeRange}
                      </Badge>
                    )}
                  </div>
                  {entry.significance && (
                    <p className="text-sm text-muted-foreground leading-relaxed text-pretty">{entry.significance}</p>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Hot Takes */}
      {reportData.hot_takes && reportData.hot_takes.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="size-5 text-primary" />
            <h2 className="text-xl font-semibold">Hot Takes</h2>
          </div>
          <div className="grid gap-4">
            {reportData.hot_takes.map((take, index) => (
              <div key={index} className="rounded-lg border border-border bg-card p-4 space-y-2">
                <p className="leading-relaxed text-pretty">{take.text}</p>
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  {take.speaker && <span className="font-medium">— {take.speaker}</span>}
                  {take.timestamp && (
                    <Badge variant="secondary" className="text-xs">
                      {take.timestamp}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Potential Alpha */}
      {reportData.potential_alpha && reportData.potential_alpha.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="size-5 text-primary" />
            <h2 className="text-xl font-semibold">Potential Alpha</h2>
          </div>
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-5 space-y-3">
            {reportData.potential_alpha.map((alpha, index) => (
              <div key={index} className="flex gap-3">
                <AlertCircle className="size-5 shrink-0 text-primary mt-0.5" />
                <p className="text-sm leading-relaxed text-pretty flex-1">{alpha}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Project Mentions */}
      {reportData.project_mentions && reportData.project_mentions.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="size-5 text-primary" />
            <h2 className="text-xl font-semibold">Project Mentions</h2>
          </div>
          <div className="grid gap-3">
            {reportData.project_mentions.map((project, index) => (
              <div key={index} className="rounded-lg border border-border bg-card p-4 space-y-2">
                {project.name && <h3 className="font-semibold">{project.name}</h3>}
                {project.context && (
                  <p className="text-sm text-muted-foreground leading-relaxed text-pretty">{project.context}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Market Sentiment */}
      {reportData.market_sentiment && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="size-5 text-primary" />
            <h2 className="text-xl font-semibold">Market Sentiment</h2>
          </div>
          <div className="rounded-lg border border-border bg-card p-5 space-y-3">
            {reportData.market_sentiment.overall && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Overall:</span>
                <Badge
                  variant={reportData.market_sentiment.overall === "bullish" ? "default" : "secondary"}
                  className="capitalize"
                >
                  {reportData.market_sentiment.overall}
                </Badge>
              </div>
            )}
            {reportData.market_sentiment.notes && (
              <p className="text-sm text-muted-foreground leading-relaxed text-pretty">
                {reportData.market_sentiment.notes}
              </p>
            )}
          </div>
        </section>
      )}
    </div>
  )
}
