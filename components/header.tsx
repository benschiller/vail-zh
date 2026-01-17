"use client";

import { Button } from "@/components/ui/button";

export function Header() {
  const handleAddSpace = () => {
    const twitterIntentUrl = "https://twitter.com/intent/tweet?text=@vail_report%20<Paste%20Chinese%20Spaces%20link%20here>";
    window.open(twitterIntentUrl, "_blank");
  };

  return (
    <header className="w-full border-b border-border pt-4">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-medium">VAIL • Chinese Edition</span>
            <span className="text-muted-foreground">|</span>
            <span className="text-sm text-muted-foreground">
              Market Intelligence from Twitter Spaces
            </span>
          </div>
          <span className="font-mono text-xs text-muted-foreground">
            Powered by VAIL API
          </span>
        </div>
        <Button
          onClick={handleAddSpace}
          size="sm"
        >
          Add Chinese Space
        </Button>
      </div>
    </header>
  );
}
