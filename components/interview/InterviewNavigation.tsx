"use client";

import { ArrowLeft, ArrowRight, SkipForward } from "lucide-react";

import { Button } from "@/components/ui/button";

type InterviewNavigationProps = {
  onPrevious: () => void;
  onNext: () => void;
  onSkip: () => void;
  isFirst: boolean;
  isLast: boolean;
};

export function InterviewNavigation({ onPrevious, onNext, onSkip, isFirst, isLast }: InterviewNavigationProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1.25rem] border border-border/70 bg-card/80 p-4 shadow-sm">
      <Button type="button" variant="outline" onClick={onPrevious} disabled={isFirst} className="rounded-full">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Previous
      </Button>

      <div className="flex flex-wrap gap-3">
        <Button type="button" variant="outline" onClick={onSkip} className="rounded-full">
          <SkipForward className="mr-2 h-4 w-4" />
          Skip
        </Button>
        <Button type="button" onClick={onNext} className="primary-button rounded-full px-5">
          {isLast ? "Finish" : "Next"}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
