"use client"

import Link from "next/link"
import type { Space } from "@/lib/types"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { ArrowRight, Clock, Users, Radio } from "lucide-react"
import {
  formatDate,
  getTotalListeners,
  getSpeakerCount,
  formatHosts,
  getAdminDetails,
  getSpeakerDetails,
  formatDuration,
} from "@/lib/format"

interface SpaceCardProps {
  space: Space
}

export function SpaceCard({ space }: SpaceCardProps) {
  const totalListeners = getTotalListeners(space)
  const speakerCount = getSpeakerCount(space)
  const hosts = formatHosts(space)
  const admins = getAdminDetails(space)
  const speakers = getSpeakerDetails(space)
  const duration = formatDuration(space)

  return (
    <Link
      href={`/chinese/spaces/${space.id}`}
      className="group block border-b border-border last:border-b-0 px-4 py-4 transition-colors hover:bg-accent/50"
    >
      <div className="flex items-center justify-between gap-6">
        {/* Left: Title and metadata */}
        <div className="flex-1 min-w-0 space-y-2">
          <div className="space-y-1">
            {space.title_en && (
              <h3 className="font-medium text-balance leading-tight group-hover:text-primary transition-colors">
                {space.title_en}
              </h3>
            )}
            <p
              className={
                space.title_en ? "text-sm text-muted-foreground" : "font-medium text-balance"
              }
            >
              {space.title}
            </p>
          </div>

          {/* Metadata row */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Radio className="size-3.5" />
              {formatDate(space.date)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-3.5" />
              {duration}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Users className="size-3.5" />
              {totalListeners.toLocaleString()}
            </span>
          </div>

          {/* Participants */}
          <div className="flex flex-wrap items-center gap-3">
            {admins.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{admins.length === 1 ? "Host" : "Hosts"}:</span>
                <div className="flex -space-x-1.5">
                  {admins.slice(0, 4).map((admin, index) => {
                    const name = admin.display_name || admin.twitter_screen_name || "Host"
                    const initial = name.charAt(0).toUpperCase()
                    const displayInitial = /^[A-Z0-9]$/.test(initial) ? initial : "❓"
                    return (
                      <Avatar key={index} className="size-6 border-2 border-background ring-1 ring-border">
                        <AvatarImage src={admin.avatar_url || undefined} alt={name} />
                        <AvatarFallback className="text-[10px] bg-muted" suppressHydrationWarning>
                          {displayInitial}
                        </AvatarFallback>
                      </Avatar>
                    )
                  })}
                  {admins.length > 4 && (
                    <Avatar className="size-6 border-2 border-background ring-1 ring-border">
                      <AvatarFallback className="text-[10px] bg-muted">+{admins.length - 4}</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              </div>
            )}

            {speakerCount > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {speakerCount} {speakerCount === 1 ? "speaker" : "speakers"}
                </span>
                <div className="flex -space-x-1.5">
                  {speakers.slice(0, 3).map((speaker, index) => {
                    const name = speaker.display_name || speaker.twitter_screen_name || "Speaker"
                    const initial = name.charAt(0).toUpperCase()
                    const displayInitial = /^[A-Z0-9]$/.test(initial) ? initial : "❓"
                    return (
                      <Avatar key={index} className="size-6 border-2 border-background ring-1 ring-border">
                        <AvatarImage src={speaker.avatar_url || undefined} alt={name} />
                        <AvatarFallback className="text-[10px] bg-muted" suppressHydrationWarning>
                          {displayInitial}
                        </AvatarFallback>
                      </Avatar>
                    )
                  })}
                  {speakers.length > 3 && (
                    <Avatar className="size-6 border-2 border-background ring-1 ring-border">
                      <AvatarFallback className="text-[10px] bg-muted">+{speakers.length - 3}</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Action */}
        <div className="flex items-center gap-2 text-muted-foreground group-hover:text-primary transition-colors">
          <span className="text-sm font-medium hidden sm:inline">View Report</span>
          <ArrowRight className="size-5" />
        </div>
      </div>
    </Link>
  )
}
