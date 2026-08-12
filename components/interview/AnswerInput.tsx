"use client";

import { useEffect, useState } from "react";
import { Mic, Square } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { useSpeechToText } from "@/hooks/useSpeechToText";

type AnswerInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  savedAudioUrl?: string;
  onAudioRecorded?: (blob: Blob) => void;
};

export function AnswerInput({
  value,
  onChange,
  placeholder = "Draft your answer here...",
  savedAudioUrl,
  onAudioRecorded,
}: AnswerInputProps) {
  const [localAudioUrl, setLocalAudioUrl] = useState<string | null>(null);

  const {
    isSupported: sttSupported,
    isRecording: sttRecording,
    interimTranscript,
    error: sttError,
    start: startStt,
    stop: stopStt,
  } = useSpeechToText({
    onFinalResult: (transcript) => {
      const trimmed = transcript.trim();
      if (!trimmed) return;
      onChange(value ? `${value} ${trimmed}` : trimmed);
    },
  });

  const {
    isSupported: recorderSupported,
    isRecording: recorderRecording,
    error: recorderError,
    start: startRecorder,
    stop: stopRecorder,
  } = useAudioRecorder({
    onRecordingComplete: (blob) => {
      const url = URL.createObjectURL(blob);
      setLocalAudioUrl((previous) => {
        if (previous) URL.revokeObjectURL(previous);
        return url;
      });
      onAudioRecorded?.(blob);
    },
  });

  useEffect(() => {
    return () => {
      if (localAudioUrl) URL.revokeObjectURL(localAudioUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isRecording = sttRecording || recorderRecording;
  const error = sttError ?? recorderError;
  const playbackUrl = localAudioUrl ?? savedAudioUrl;

  const toggle = () => {
    if (isRecording) {
      stopStt();
      stopRecorder();
    } else {
      setLocalAudioUrl(null);
      startStt();
      if (recorderSupported) {
        void startRecorder();
      }
    }
  };

  const helperText = error
    ? error
    : !sttSupported
      ? "Voice input isn't supported in this browser. Try Chrome or Edge."
      : isRecording
        ? interimTranscript || "Listening…"
        : 'Click "Voice note" and speak — your words will be added to the answer above.';

  return (
    <Card className="border-border/70 bg-card/80 shadow-[0_18px_55px_rgba(15,23,42,0.08)]">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle>Craft your response</CardTitle>
            <CardDescription>Speak naturally and stay structured.</CardDescription>
          </div>
          <Button
            type="button"
            variant={isRecording ? "default" : "outline"}
            className="rounded-full"
            onClick={toggle}
            disabled={!sttSupported}
          >
            {isRecording ? <Square className="mr-2 h-4 w-4" /> : <Mic className="mr-2 h-4 w-4" />}
            {isRecording ? "Stop recording" : "Voice note"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={10}
          className="min-h-48 w-full rounded-2xl border border-border/70 bg-background/70 px-4 py-4 text-sm leading-7 text-foreground shadow-inner outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          placeholder={placeholder}
        />
        <div className="rounded-2xl border border-dashed border-border/70 bg-muted/40 p-4 text-sm text-muted-foreground">
          {helperText}
        </div>
        {playbackUrl && !isRecording ? (
          <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-background/70 p-3">
            <span className="text-sm font-medium text-foreground">Your recording</span>
            { }
            <audio controls src={playbackUrl} className="h-9 flex-1" />
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
