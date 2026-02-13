"use client";

import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader, RefreshCw } from "lucide-react";
import { scriptTones, scriptDurations } from "@/constants";

interface ScriptEditorProps {
  script: string;
  onScriptChange: (script: string) => void;
  tone: string;
  onToneChange: (tone: string) => void;
  duration: string;
  onDurationChange: (duration: string) => void;
  onRegenerate: () => void;
  isRegenerating: boolean;
}

const ScriptEditor = ({
  script,
  onScriptChange,
  tone,
  onToneChange,
  duration,
  onDurationChange,
  onRegenerate,
  isRegenerating,
}: ScriptEditorProps) => {
  const wordCount = script
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0).length;
  const estimatedMinutes = Math.max(1, Math.round(wordCount / 250));

  return (
    <div className="flex flex-col gap-6">
      {/* Controls */}
      <div className="flex flex-wrap gap-4">
        <div className="flex flex-col gap-2 flex-1 min-w-[160px]">
          <label className="text-12 font-bold text-white-4 uppercase tracking-wide">
            Tone
          </label>
          <Select value={tone} onValueChange={onToneChange}>
            <SelectTrigger className="text-16 border-4 border-[var(--color-mid-gray)] bg-[var(--color-charcoal)] text-white-1 font-medium h-12">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-4 border-orange-1 bg-[var(--color-charcoal)] text-white-1 z-[999]">
              {scriptTones.map((t) => (
                <SelectItem
                  key={t.value}
                  value={t.value}
                  className="focus:bg-orange-1 focus:text-charcoal cursor-pointer py-2 text-16 font-bold"
                >
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2 flex-1 min-w-[160px]">
          <label className="text-12 font-bold text-white-4 uppercase tracking-wide">
            Duration
          </label>
          <Select value={duration} onValueChange={onDurationChange}>
            <SelectTrigger className="text-16 border-4 border-[var(--color-mid-gray)] bg-[var(--color-charcoal)] text-white-1 font-medium h-12">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-4 border-orange-1 bg-[var(--color-charcoal)] text-white-1 z-[999]">
              {scriptDurations.map((d) => (
                <SelectItem
                  key={d.value}
                  value={d.value}
                  className="focus:bg-orange-1 focus:text-charcoal cursor-pointer py-2 text-16 font-bold"
                >
                  {d.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-end">
          <Button
            type="button"
            variant="plain"
            className="h-12 px-5 border-4 border-orange-1 text-orange-1 font-bold uppercase tracking-wide hover:bg-orange-1 hover:text-[var(--color-charcoal)] transition-colors"
            onClick={onRegenerate}
            disabled={isRegenerating}
          >
            {isRegenerating ? (
              <>
                <Loader size={16} className="animate-spin mr-2" />
                Regenerating...
              </>
            ) : (
              <>
                <RefreshCw size={16} className="mr-2" />
                Regenerate
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Script textarea */}
      <Textarea
        className="input-class text-16 font-medium focus-visible:ring-offset-orange-1 min-h-[400px] leading-relaxed"
        value={script}
        onChange={(e) => onScriptChange(e.target.value)}
        placeholder="Your podcast script will appear here..."
      />

      {/* Stats bar */}
      <div className="flex items-center gap-6 p-3 bg-[var(--color-charcoal)] border-l-4 border-orange-1">
        <div className="flex items-center gap-2">
          <span className="text-12 uppercase tracking-wide text-white-4 font-bold">
            Words:
          </span>
          <span className="text-14 text-white-1 font-bold">{wordCount}</span>
        </div>
        <div className="h-4 w-px bg-[var(--color-mid-gray)]" />
        <div className="flex items-center gap-2">
          <span className="text-12 uppercase tracking-wide text-white-4 font-bold">
            Est. Duration:
          </span>
          <span className="text-14 text-white-1 font-bold">
            ~{estimatedMinutes} min
          </span>
        </div>
        <div className="h-4 w-px bg-[var(--color-mid-gray)]" />
        <div className="flex items-center gap-2">
          <span className="text-12 uppercase tracking-wide text-white-4 font-bold">
            Characters:
          </span>
          <span className="text-14 text-white-1 font-bold">
            {script.length.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ScriptEditor;
