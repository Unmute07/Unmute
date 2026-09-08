"use client";

import { useEffect, useState } from "react";
import { Loader2, Mic, Sparkles, Square } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { transcribeAnswer } from "@/services/ai-client";

async function blobToBase64(blob: Blob): Promise<string> {
  const arrayBuffer = await blob.arrayBuffer();
  let binary = "";
  const bytes = new Uint8Array(arrayBuffer);
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

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
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcribeError, setTranscribeError] = useState<string | null>(null);
  const [valueBeforeRecording, setValueBeforeRecording] = useState("");

  const transcribeRecording = async (blob: Blob, base: string) => {
    setIsTranscribing(true);
    setTranscribeError(null);
    try {
      const base64 = await blobToBase64(blob);
      const result = await transcribeAnswer(base64, blob.type || "audio/webm");
      if (result.success) {
        const trimmed = result.data.text.trim();
        onChange(trimmed ? (base ? `${base} ${trimmed}` : trimmed) : base);
      } else {
        setTranscribeError(result.error);
      }
    } finally {
      setIsTranscribing(false);
    }
  };

  const { isSupported: recorderSupported, isRecording, error: recorderError, start: startRecorder, stop: stopRecorder } =
    useAudioRecorder({
      onRecordingComplete: (blob) => {
        const url = URL.createObjectURL(blob);
        setLocalAudioUrl((previous) => {
          if (previous) URL.revokeObjectURL(previous);
          return url;
        });
        setRecordedBlob(blob);
        onAudioRecorded?.(blob);
        void transcribeRecording(blob, valueBeforeRecording);
      },
    });

  useEffect(() => {
    return () => {
      if (localAudioUrl) URL.revokeObjectURL(localAudioUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const error = transcribeError ?? recorderError;
  const playbackUrl = localAudioUrl ?? savedAudioUrl;
  // Retry button for when the automatic post-recording Whisper transcription
  // (fired from onRecordingComplete above) failed — e.g. a transient rate limit.
  const canRetryTranscription = Boolean(transcribeError) && Boolean(recordedBlob) && !isRecording && !isTranscribing;

  const toggle = () => {
    if (isRecording) {
      stopRecorder();
    } else {
      setValueBeforeRecording(value);
      setLocalAudioUrl(null);
      setRecordedBlob(null);
      setTranscribeError(null);
      void startRecorder();
    }
  };

  const helperText = error
    ? error
    : isTranscribing
      ? "Analyzing your recording…"
      : isRecording
        ? "Recording…"
        : recorderSupported
          ? 'Click "Voice note" and speak — your recording is analyzed directly for the most accurate answer.'
          : "Voice recording isn't supported in this browser. Try Chrome or Edge, or type your answer below.";

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
            disabled={!recorderSupported}
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
        {canRetryTranscription ? (
          <Button
            type="button"
            variant="outline"
            className="rounded-full"
            onClick={() => recordedBlob && void transcribeRecording(recordedBlob, valueBeforeRecording)}
            disabled={isTranscribing}
          >
            {isTranscribing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
            {isTranscribing ? "Analyzing…" : "Retry transcription"}
          </Button>
        ) : null}
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
