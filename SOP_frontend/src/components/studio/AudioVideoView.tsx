import React, { useState, useRef, useEffect } from "react";
import {
  Mic,
  Video,
  Timer,
  MessageSquare,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
} from "lucide-react";

interface Scene {
  visual_description: string;
  audio_script: string;
  duration_seconds: number;
}

interface Segment {
  timestamp: string;
  topic: string;
  content: string;
}

interface AudioVideoData {
  title: string;
  script?: string;
  speaker_notes?: string;
  scenes?: Scene[];
  segments?: Segment[];
}

interface AudioVideoViewProps {
  data: AudioVideoData;
  type: "audio" | "video";
}

const AudioVideoView: React.FC<AudioVideoViewProps> = ({ data, type }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSegment, setCurrentSegment] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(120); // 2 minutes default
  const [isLoading, setIsLoading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  if (!data) return null;

  useEffect(() => {
    // Initialize speech synthesis
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      // Load voices and handle voice loading
      const loadVoices = () => {
        window.speechSynthesis.getVoices();
      };

      // Load voices immediately
      loadVoices();

      // Also listen for voiceschanged event (for Chrome)
      window.speechSynthesis.addEventListener("voiceschanged", loadVoices);

      return () => {
        if (speechRef.current) {
          window.speechSynthesis.cancel();
        }
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
        }
        window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
      };
    }
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const createSpeechFromText = (text: string): SpeechSynthesisUtterance => {
    console.log("Creating speech for text:", text.substring(0, 100) + "...");

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9; // Slightly slower for better comprehension
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Get available voices and select a good one
    const voices = window.speechSynthesis.getVoices();
    console.log("Available voices:", voices.length);

    const preferredVoice =
      voices.find(
        (voice) =>
          voice.name.includes("Google") ||
          voice.name.includes("Microsoft") ||
          voice.name.includes("Samantha") ||
          voice.name.includes("Alex"),
      ) || voices[0];

    if (preferredVoice) {
      utterance.voice = preferredVoice;
      console.log("Selected voice:", preferredVoice.name);
    }

    // Clear any existing progress interval
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }

    // Simulate progress updates
    const startTime = Date.now();
    const estimatedDuration = text.length * 0.08; // Rough estimate: 80ms per character

    progressIntervalRef.current = setInterval(() => {
      // Don't update progress if paused
      if (isPaused) return;

      const elapsed = (Date.now() - startTime) / 1000;
      const progress = Math.min(elapsed / estimatedDuration, 1);
      setCurrentTime(Math.floor(progress * duration));

      if (progress >= 1) {
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }
        setIsPlaying(false);
        setIsPaused(false);
        setCurrentTime(duration);
      }
    }, 100);

    utterance.onend = () => {
      console.log("Speech ended");
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      setIsPlaying(false);
      setIsPaused(false);
      setCurrentTime(duration);
    };

    utterance.onerror = (event) => {
      console.error("Speech synthesis error:", event);
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      setIsPlaying(false);
      setIsPaused(false);
      alert("Speech synthesis error: " + event.error);
    };

    utterance.onstart = () => {
      console.log("Speech started");
      setIsPaused(false);
    };

    return utterance;
  };

  const handlePlayPause = () => {
    console.log(
      "Play/Pause clicked, isPlaying:",
      isPlaying,
      "isPaused:",
      isPaused,
    );

    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      alert("Text-to-speech is not supported in your browser.");
      return;
    }

    if (isPlaying && !isPaused) {
      // Pause speech
      console.log("Pausing speech");
      window.speechSynthesis.pause();
      setIsPaused(true);
      setIsPlaying(false); // Update UI to show play button
    } else {
      // Start or resume speech
      if (isPaused) {
        console.log("Resuming speech");
        window.speechSynthesis.resume();
        setIsPaused(false);
        setIsPlaying(true);
      } else {
        console.log("Starting new speech");
        setIsLoading(true);

        // Get text to speak
        let textToSpeak = "";
        if (data.segments && data.segments[currentSegment]) {
          // Speak current segment
          textToSpeak = data.segments[currentSegment].content;
          console.log(
            "Using segment content:",
            textToSpeak.substring(0, 50) + "...",
          );
        } else if (data.script) {
          // Speak full script
          textToSpeak = data.script;
          console.log(
            "Using full script:",
            textToSpeak.substring(0, 50) + "...",
          );
        }

        if (textToSpeak) {
          // Cancel any previous speech
          window.speechSynthesis.cancel();

          // Create and speak new utterance
          speechRef.current = createSpeechFromText(textToSpeak);
          console.log("Speaking utterance");
          window.speechSynthesis.speak(speechRef.current);
          setIsPlaying(true);
          setIsLoading(false);
          setIsPaused(false);
        } else {
          console.log("No text to speak");
          setIsLoading(false);
          alert("No content available to speak.");
        }
      }
    }
  };

  const handleSegmentClick = (index: number) => {
    setCurrentSegment(index);
    // Reset time to beginning of segment
    setCurrentTime(index * 30); // Approximate 30 seconds per segment

    // If currently playing, restart with new segment
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      // Auto-play new segment after a brief delay
      setTimeout(() => {
        handlePlayPause();
      }, 100);
    }
  };

  const handleNext = () => {
    if (data.segments && currentSegment < data.segments.length - 1) {
      handleSegmentClick(currentSegment + 1);
    }
  };

  const handlePrevious = () => {
    if (currentSegment > 0) {
      handleSegmentClick(currentSegment - 1);
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          {type === "audio" ? (
            <Mic className="w-5 h-5" />
          ) : (
            <Video className="w-5 h-5" />
          )}
        </div>
        <div>
          <h3 className="text-lg font-bold text-foreground">{data.title}</h3>
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
            {type === "audio" ? "Podcast" : "Video Storyboard"}
          </p>
        </div>
      </div>

      {type === "audio" && (
        <div className="space-y-6">
          {/* Audio Player Interface */}
          <div className="bg-gradient-to-br from-primary/5 to-secondary/5 p-6 rounded-2xl border border-border shadow-lg">
            {/* Player Controls */}
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={handlePrevious}
                className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center hover:bg-primary/5 transition-colors"
              >
                <SkipBack className="w-4 h-4" />
              </button>
              <button
                onClick={handlePlayPause}
                disabled={isLoading}
                className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors shadow-lg disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                ) : isPlaying ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5" />
                )}
              </button>
              <button
                onClick={handleNext}
                className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center hover:bg-primary/5 transition-colors"
              >
                <SkipForward className="w-4 h-4" />
              </button>
              <div className="flex-1 flex items-center gap-3">
                <span className="text-xs text-muted-foreground font-mono">
                  {formatTime(currentTime)}
                </span>
                <div className="flex-1 h-2 bg-background rounded-full overflow-hidden border border-border">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${(currentTime / duration) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground font-mono">
                  {formatTime(duration)}
                </span>
              </div>
              <button className="w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center hover:bg-primary/5 transition-colors">
                <Volume2 className="w-4 h-4" />
              </button>
            </div>

            {/* Current Segment Display */}
            {data.segments && data.segments[currentSegment] && (
              <div className="bg-background/50 p-4 rounded-xl border border-border/50">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold text-primary uppercase tracking-widest">
                    {data.segments[currentSegment].topic}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {data.segments[currentSegment].timestamp}
                  </span>
                </div>
                <p className="text-sm text-foreground leading-relaxed">
                  {data.segments[currentSegment].content}
                </p>
              </div>
            )}
          </div>

          {/* Segments Timeline */}
          {data.segments && data.segments.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-widest text-primary">
                Podcast Segments
              </h4>
              <div className="space-y-2">
                {data.segments.map((segment, index) => (
                  <div
                    key={index}
                    onClick={() => handleSegmentClick(index)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      currentSegment === index
                        ? "bg-primary/10 border-primary/30"
                        : "bg-secondary/20 border-border/50 hover:bg-secondary/30"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-foreground">
                        {segment.topic}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {segment.timestamp}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {segment.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Full Script (Collapsible) */}
          {data.script && (
            <details className="group">
              <summary className="cursor-pointer text-xs font-bold uppercase tracking-widest text-primary hover:text-primary/80 transition-colors">
                Show Full Script
              </summary>
              <div className="mt-4 bg-secondary/20 p-6 rounded-2xl border border-border shadow-inner">
                <h4 className="text-xs font-bold uppercase tracking-widest text-primary mb-4">
                  Complete Script
                </h4>
                <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap font-serif italic">
                  {data.script}
                </div>
              </div>
            </details>
          )}

          {data.speaker_notes && (
            <div className="flex items-start gap-3 p-4 bg-primary/5 rounded-xl border border-primary/10">
              <MessageSquare className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] font-bold uppercase text-primary block mb-1">
                  Speaker Notes
                </span>
                <p className="text-xs text-muted-foreground">
                  {data.speaker_notes}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {type === "video" && data.scenes && (
        <div className="space-y-4">
          {data.scenes.map((scene, i) => (
            <div
              key={i}
              className="flex flex-col md:flex-row gap-4 p-4 rounded-2xl bg-secondary/30 border border-border/50 group hover:border-primary/30 transition-colors"
            >
              <div className="md:w-1/3 space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold">
                    {i + 1}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-muted-foreground font-bold">
                    <Timer className="w-3 h-3" /> {scene.duration_seconds}s
                  </span>
                </div>
                <div className="aspect-video bg-background rounded-lg border border-border flex items-center justify-center p-3 text-center">
                  <p className="text-[10px] text-muted-foreground italic leading-snug">
                    {scene.visual_description}
                  </p>
                </div>
              </div>
              <div className="flex-1 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary/60">
                  Narration
                </span>
                <p className="text-sm text-foreground leading-relaxed">
                  {scene.audio_script}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AudioVideoView;
