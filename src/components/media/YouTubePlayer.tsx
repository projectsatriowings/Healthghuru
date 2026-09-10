'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  RotateCcw,
  ExternalLink,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { parseVideoSource } from '@/lib/video';

// Declare YouTube API window types
declare global {
  interface Window {
    YT?: {
      Player: new (
        elementId: string | HTMLElement,
        options: {
          videoId?: string;
          playerVars?: Record<string, unknown>;
          events?: {
            onReady?: (event: { target: YTPlayerInstance }) => void;
            onStateChange?: (event: { data: number; target: YTPlayerInstance }) => void;
            onError?: (event: { data: number }) => void;
          };
        }
      ) => YTPlayerInstance;
      PlayerState?: {
        UNSTARTED: number;
        ENDED: number;
        PLAYING: number;
        PAUSED: number;
        BUFFERING: number;
        CUED: number;
      };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

interface YTPlayerInstance {
  playVideo: () => void;
  pauseVideo: () => void;
  stopVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead?: boolean) => void;
  mute: () => void;
  unMute: () => void;
  isMuted: () => boolean;
  getVolume: () => number;
  setVolume: (volume: number) => void;
  getPlayerState: () => number;
  getCurrentTime: () => number;
  getDuration: () => number;
  destroy: () => void;
  getIframe: () => HTMLIFrameElement;
}

export interface YouTubePlayerProps {
  videoId?: string | null;
  videoUrl?: string | null;
  title: string;
  thumbnailUrl?: string | null;
  canonicalUrl?: string | null;
  authorName?: string | null;
  durationSeconds?: number | null;
}

export function YouTubePlayer({
  videoId: rawVideoId,
  videoUrl,
  title,
  thumbnailUrl,
  canonicalUrl,
  authorName,
  durationSeconds,
}: YouTubePlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YTPlayerInstance | null>(null);
  const directVideoRef = useRef<HTMLVideoElement>(null);
  const playerIdRef = useRef<string>(`yt-player-${Math.random().toString(36).substring(2, 9)}`);

  const parsed = parseVideoSource(rawVideoId, videoUrl || canonicalUrl);
  const cleanVideoId = parsed.videoId;

  const [isApiReady, setIsApiReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isEnded, setIsEnded] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [feedbackIcon, setFeedbackIcon] = useState<'play' | 'pause' | null>(null);
  const [loadError, setLoadError] = useState(false);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Trigger feedback splash animation on play/pause
  const showFeedback = (type: 'play' | 'pause') => {
    setFeedbackIcon(type);
    setTimeout(() => {
      setFeedbackIcon(null);
    }, 600);
  };

  // Load YouTube Iframe API Script
  useEffect(() => {
    if (parsed.type !== 'youtube' || !cleanVideoId) return;

    if (window.YT && window.YT.Player) {
      setIsApiReady(true);
      return;
    }

    const existingScript = document.getElementById('youtube-iframe-api');
    if (!existingScript) {
      const tag = document.createElement('script');
      tag.id = 'youtube-iframe-api';
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
    }

    const prevCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (prevCallback) prevCallback();
      setIsApiReady(true);
    };
  }, [cleanVideoId, parsed.type]);

  // Initialize YT.Player once API and container are ready
  useEffect(() => {
    if (!isApiReady || !cleanVideoId || parsed.type !== 'youtube') return;

    let isMounted = true;
    const elemId = playerIdRef.current;

    try {
      const player = new window.YT!.Player(elemId, {
        videoId: cleanVideoId,
        playerVars: {
          autoplay: 0,
          controls: 1,
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          origin: typeof window !== 'undefined' ? window.location.origin : '',
          enablejsapi: 1,
          fs: 1,
        },
        events: {
          onReady: (event) => {
            if (!isMounted) return;
            playerRef.current = event.target;
            try {
              setIsMuted(event.target.isMuted());
            } catch {
              // Ignore
            }
          },
          onStateChange: (event) => {
            if (!isMounted) return;
            const state = event.data;
            const YTState = window.YT?.PlayerState;

            if (state === YTState?.PLAYING) {
              setIsPlaying(true);
              setHasStarted(true);
              setIsBuffering(false);
              setIsEnded(false);
            } else if (state === YTState?.PAUSED) {
              setIsPlaying(false);
              setIsBuffering(false);
            } else if (state === YTState?.BUFFERING) {
              setIsBuffering(true);
            } else if (state === YTState?.ENDED) {
              setIsPlaying(false);
              setIsEnded(true);
            } else if (state === YTState?.UNSTARTED) {
              setIsBuffering(false);
            }
          },
          onError: () => {
            if (!isMounted) return;
            setLoadError(true);
          },
        },
      });

      playerRef.current = player;
    } catch {
      setLoadError(true);
    }

    return () => {
      isMounted = false;
      try {
        if (playerRef.current && typeof playerRef.current.destroy === 'function') {
          playerRef.current.destroy();
        }
      } catch {
        // cleanup ignore
      }
    };
  }, [isApiReady, cleanVideoId, parsed.type]);

  // Play / Pause Toggle Function
  const togglePlayPause = useCallback(() => {
    if (parsed.type === 'direct' && directVideoRef.current) {
      if (directVideoRef.current.paused) {
        directVideoRef.current.play();
        setIsPlaying(true);
        setHasStarted(true);
        showFeedback('play');
      } else {
        directVideoRef.current.pause();
        setIsPlaying(false);
        showFeedback('pause');
      }
      return;
    }

    if (playerRef.current) {
      try {
        const state = playerRef.current.getPlayerState();
        const YTState = window.YT?.PlayerState;

        if (state === YTState?.PLAYING) {
          playerRef.current.pauseVideo();
          setIsPlaying(false);
          showFeedback('pause');
        } else {
          playerRef.current.playVideo();
          setIsPlaying(true);
          setHasStarted(true);
          setIsEnded(false);
          showFeedback('play');
        }
      } catch {
        // Fallback
        setIsPlaying((prev) => !prev);
      }
    } else {
      setHasStarted(true);
      setIsPlaying(true);
      showFeedback('play');
    }
  }, [parsed.type]);

  // Toggle Mute
  const toggleMute = useCallback(() => {
    if (parsed.type === 'direct' && directVideoRef.current) {
      directVideoRef.current.muted = !directVideoRef.current.muted;
      setIsMuted(directVideoRef.current.muted);
      return;
    }

    if (playerRef.current) {
      try {
        if (playerRef.current.isMuted()) {
          playerRef.current.unMute();
          setIsMuted(false);
        } else {
          playerRef.current.mute();
          setIsMuted(true);
        }
      } catch {
        setIsMuted((prev) => !prev);
      }
    }
  }, [parsed.type]);

  // Toggle Fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  }, []);

  // Listen to Fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Keyboard Shortcuts (Space to Play/Pause, M for Mute, F for Fullscreen)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable) {
        return;
      }

      if (e.code === 'Space' || e.key === 'k') {
        e.preventDefault();
        togglePlayPause();
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        toggleMute();
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlayPause, toggleMute, toggleFullscreen]);

  // Handle Mouse movement for auto-hiding controls when playing
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 2500);
    }
  };

  // Duration Formatter
  const formatDuration = (seconds?: number | null) => {
    if (!seconds) return null;
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Thumbnail fallback
  const displayThumbnail =
    thumbnailUrl || (cleanVideoId ? `https://i.ytimg.com/vi/${cleanVideoId}/hqdefault.jpg` : '/images/exercise_plank.png');

  // Case 1: Instagram Reel / Post Embed
  if (parsed.type === 'instagram' && parsed.instagramCode) {
    return (
      <div className="bg-black rounded-3xl overflow-hidden shadow-2xl relative border border-border flex items-center justify-center max-w-md mx-auto aspect-[9/16] min-h-[560px] w-full">
        <iframe
          src={`https://www.instagram.com/reel/${parsed.instagramCode}/embed`}
          title={title}
          className="w-full h-full border-0"
          allowFullScreen
          loading="eager"
        />
      </div>
    );
  }

  // Case 2: Direct HTML5 Video File (.mp4, .webm, etc.)
  if (parsed.type === 'direct' && parsed.directUrl) {
    return (
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        className="group bg-black rounded-3xl overflow-hidden shadow-2xl aspect-video relative border border-border select-none"
      >
        <video
          ref={directVideoRef}
          src={parsed.directUrl}
          poster={displayThumbnail}
          playsInline
          onClick={togglePlayPause}
          onPlay={() => {
            setIsPlaying(true);
            setHasStarted(true);
          }}
          onPause={() => setIsPlaying(false)}
          onEnded={() => {
            setIsPlaying(false);
            setIsEnded(true);
          }}
          className="w-full h-full object-contain cursor-pointer"
        />

        {/* Center Feedback Splash */}
        {feedbackIcon && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
            <div className="w-16 h-16 rounded-full bg-black/70 backdrop-blur-md text-white flex items-center justify-center animate-ping">
              {feedbackIcon === 'play' ? <Play size={28} className="fill-white ml-1" /> : <Pause size={28} className="fill-white" />}
            </div>
          </div>
        )}

        {/* Custom Controls Bar */}
        <div
          className={`absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 flex items-center justify-between transition-opacity duration-300 z-20 ${
            showControls || !isPlaying ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlayPause}
              className="w-9 h-9 rounded-full bg-white/20 hover:bg-white text-white hover:text-dark flex items-center justify-center transition-colors"
              title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
            >
              {isPlaying ? <Pause size={16} className="fill-current" /> : <Play size={16} className="fill-current ml-0.5" />}
            </button>
            <button
              onClick={toggleMute}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
              title={isMuted ? 'Unmute (M)' : 'Mute (M)'}
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            {durationSeconds && (
              <span className="text-white/80 text-xs font-mono">{formatDuration(durationSeconds)}</span>
            )}
          </div>

          <button
            onClick={toggleFullscreen}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            title="Fullscreen (F)"
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </div>
    );
  }

  // Case 3: Unsupported or missing video source
  if (parsed.type === 'unsupported' || parsed.type === 'empty' || (!cleanVideoId && parsed.type !== 'direct')) {
    return (
      <div className="bg-gradient-to-br from-[#121820] to-[#0A0E13] rounded-3xl overflow-hidden shadow-2xl aspect-video relative border border-border flex flex-col items-center justify-center p-6 sm:p-10 text-center">
        {displayThumbnail && (
          <div className="absolute inset-0 opacity-20 filter blur-md">
            <Image src={displayThumbnail} alt={title} fill className="object-cover" unoptimized />
          </div>
        )}
        <div className="relative z-10 max-w-lg space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto shadow-inner">
            <AlertCircle size={26} />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-white font-heading font-semibold text-lg sm:text-xl line-clamp-1">{title}</h3>
            <p className="text-text-muted text-xs sm:text-sm">
              This video is available directly from the publisher source.
            </p>
          </div>
          {canonicalUrl ? (
            <a
              href={canonicalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#E50914] hover:bg-[#c40812] text-white text-xs font-semibold shadow-lg shadow-red-600/20 transition-all hover:scale-105"
            >
              Watch Video at Source <ExternalLink size={14} />
            </a>
          ) : (
            <a
              href={`https://www.youtube.com/results?search_query=${encodeURIComponent(title)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary hover:bg-primary-dark text-white text-xs font-semibold shadow-lg transition-all"
            >
              Search on YouTube <ExternalLink size={14} />
            </a>
          )}
        </div>
      </div>
    );
  }

  // Case 4: Interactive YouTube Player (API + Custom Click-to-Play/Pause Controller)
  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="group bg-black rounded-3xl overflow-hidden shadow-2xl aspect-video relative border border-border select-none"
    >
      {/* 1. Underlying YouTube Player Container (IFrame API Mount Target) */}
      <div className="w-full h-full absolute inset-0">
        <div id={playerIdRef.current} className="w-full h-full" />
      </div>

      {/* 2. Fallback Direct IFrame (if API takes time or is blocked) */}
      {!isApiReady && !hasStarted && (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${cleanVideoId}?enablejsapi=1&rel=0&modestbranding=1&playsinline=1&controls=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
          allowFullScreen
          loading="eager"
          className="w-full h-full border-0 absolute inset-0 z-0"
        />
      )}

      {/* 3. Initial Hero Cover Overlay (Zero-delay launch & clean aesthetic) */}
      {!hasStarted && (
        <div
          onClick={togglePlayPause}
          className="absolute inset-0 bg-cover bg-center cursor-pointer z-10 flex flex-col justify-between p-6 transition-all duration-300 hover:brightness-105"
          style={{ backgroundImage: `url(${displayThumbnail})` }}
        >
          {/* Gradient Tint */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/50" />

          {/* Top Info Bar */}
          <div className="relative z-10 flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-dark/70 backdrop-blur-md text-white text-xs font-medium border border-white/10">
              <Sparkles size={12} className="text-primary" /> Health & Wellness Video
            </span>
            {durationSeconds ? (
              <span className="px-2.5 py-1 rounded-md bg-black/80 backdrop-blur-md text-white font-mono text-xs">
                {formatDuration(durationSeconds)}
              </span>
            ) : null}
          </div>

          {/* Center Play Button with Glow */}
          <div className="relative z-10 flex flex-col items-center justify-center gap-3">
            <button
              type="button"
              aria-label="Play video"
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-primary hover:bg-primary-dark text-white flex items-center justify-center shadow-2xl shadow-primary/40 transform group-hover:scale-110 active:scale-95 transition-all duration-300"
            >
              <Play size={36} className="fill-white ml-1.5 sm:ml-2" />
            </button>
            <span className="text-white text-xs sm:text-sm font-medium tracking-wide drop-shadow-md bg-black/50 backdrop-blur-sm px-4 py-1 rounded-full">
              Click anywhere to play
            </span>
          </div>

          {/* Bottom Attribution */}
          <div className="relative z-10 flex items-center justify-between text-white/90 text-xs">
            <span className="font-heading font-medium truncate max-w-[80%]">{authorName || 'HealthGhuru Verified'}</span>
            <span className="text-[11px] text-white/70">Press Space to Play</span>
          </div>
        </div>
      )}

      {/* 4. Click Anywhere to Pause / Play Overlay when video is active */}
      {hasStarted && (
        <div
          onClick={togglePlayPause}
          className={`absolute inset-0 z-10 cursor-pointer transition-opacity duration-300 ${
            isPlaying ? 'bg-transparent' : 'bg-black/30 backdrop-blur-[2px]'
          }`}
          title={isPlaying ? 'Click to Pause' : 'Click to Play'}
        >
          {/* Visual Splash Animation when toggled */}
          {feedbackIcon && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-black/75 backdrop-blur-md text-white flex items-center justify-center animate-ping">
                {feedbackIcon === 'play' ? (
                  <Play size={32} className="fill-white ml-1" />
                ) : (
                  <Pause size={32} className="fill-white" />
                )}
              </div>
            </div>
          )}

          {/* Replay State Overlay */}
          {isEnded && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 gap-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  togglePlayPause();
                }}
                className="w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center hover:scale-110 transition-transform shadow-xl"
              >
                <RotateCcw size={24} />
              </button>
              <span className="text-white text-xs font-semibold">Watch Again</span>
            </div>
          )}

          {/* Interactive Floating Quick-Control Pill (Visible on hover or when paused) */}
          <div
            className={`absolute top-4 right-4 flex items-center gap-2 transition-opacity duration-300 ${
              showControls || !isPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                togglePlayPause();
              }}
              className="px-3 py-1.5 rounded-full bg-black/70 hover:bg-black/90 text-white backdrop-blur-md text-xs font-medium border border-white/10 flex items-center gap-1.5 transition-colors shadow-lg"
            >
              {isPlaying ? (
                <>
                  <Pause size={13} className="fill-white" /> Pause
                </>
              ) : (
                <>
                  <Play size={13} className="fill-white" /> Play
                </>
              )}
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleMute();
              }}
              className="p-1.5 rounded-full bg-black/70 hover:bg-black/90 text-white backdrop-blur-md border border-white/10 transition-colors shadow-lg"
              title={isMuted ? 'Unmute (M)' : 'Mute (M)'}
            >
              {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFullscreen();
              }}
              className="p-1.5 rounded-full bg-black/70 hover:bg-black/90 text-white backdrop-blur-md border border-white/10 transition-colors shadow-lg"
              title="Fullscreen (F)"
            >
              {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </button>
          </div>
        </div>
      )}

      {/* 5. Load Error Fallback */}
      {loadError && (
        <div className="absolute inset-0 bg-dark/95 z-20 flex flex-col items-center justify-center p-6 text-center text-white space-y-3">
          <AlertCircle size={28} className="text-amber-400" />
          <p className="text-sm font-medium">Player playback encountered a restricted embed.</p>
          <a
            href={canonicalUrl || `https://www.youtube.com/watch?v=${cleanVideoId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2 rounded-full bg-[#E50914] text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-[#c40812] transition-colors"
          >
            Watch directly on YouTube <ExternalLink size={13} />
          </a>
        </div>
      )}
    </div>
  );
}
