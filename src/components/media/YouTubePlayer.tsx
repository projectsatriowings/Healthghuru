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
  ExternalLink,
  AlertCircle,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import { parseVideoSource } from '@/lib/video';

export interface YouTubePlayerProps {
  videoId?: string | null;
  videoUrl?: string | null;
  title: string;
  thumbnailUrl?: string | null;
  canonicalUrl?: string | null;
  authorName?: string | null;
  durationSeconds?: number | null;
}

function InstagramIcon({ size = 14, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
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
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const directVideoRef = useRef<HTMLVideoElement>(null);

  const parsed = parseVideoSource(rawVideoId, videoUrl || canonicalUrl);
  const cleanVideoId = parsed.videoId;

  const [hasStarted, setHasStarted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [feedbackIcon, setFeedbackIcon] = useState<'play' | 'pause' | null>(null);
  const [iframeKey, setIframeKey] = useState(0);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Dynamically load Instagram embed script for interactive embeds
  useEffect(() => {
    if (parsed.type === 'instagram') {
      const existingScript = document.getElementById('instagram-embed-script');
      if (!existingScript) {
        const script = document.createElement('script');
        script.id = 'instagram-embed-script';
        script.src = 'https://www.instagram.com/embed.js';
        script.async = true;
        document.body.appendChild(script);
      } else {
        // Trigger embed processor if script is already present
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).instgrm?.Embeds?.process();
      }
    }
  }, [parsed.type, iframeKey]);

  // Trigger feedback splash animation on play/pause
  const showFeedback = (type: 'play' | 'pause') => {
    setFeedbackIcon(type);
    setTimeout(() => {
      setFeedbackIcon(null);
    }, 600);
  };

  // Send command to YouTube iframe via standard postMessage API
  const sendYouTubeCommand = useCallback((func: string, args: unknown[] = []) => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({
          event: 'command',
          func,
          args,
        }),
        '*'
      );
    }
  }, []);

  // Direct HTML5 Video Play/Pause
  const togglePlayPauseDirect = useCallback(() => {
    if (directVideoRef.current) {
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
    }
  }, []);

  // Universal Play/Pause Toggle
  const togglePlayPause = useCallback(() => {
    if (parsed.type === 'direct') {
      togglePlayPauseDirect();
      return;
    }

    if (parsed.type === 'youtube') {
      if (!hasStarted) {
        setHasStarted(true);
        setIsPlaying(true);
        showFeedback('play');
        return;
      }

      if (isPlaying) {
        sendYouTubeCommand('pauseVideo');
        setIsPlaying(false);
        showFeedback('pause');
      } else {
        sendYouTubeCommand('playVideo');
        setIsPlaying(true);
        showFeedback('play');
      }
    }
  }, [hasStarted, isPlaying, parsed.type, sendYouTubeCommand, togglePlayPauseDirect]);

  // Universal Mute Toggle
  const toggleMute = useCallback(() => {
    if (parsed.type === 'direct' && directVideoRef.current) {
      directVideoRef.current.muted = !directVideoRef.current.muted;
      setIsMuted(directVideoRef.current.muted);
      return;
    }

    if (parsed.type === 'youtube') {
      const nextMuted = !isMuted;
      sendYouTubeCommand(nextMuted ? 'mute' : 'unMute');
      setIsMuted(nextMuted);
    }
  }, [isMuted, parsed.type, sendYouTubeCommand]);

  // Fullscreen toggle
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

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Listen to YouTube player state change events via postMessage
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (data?.event === 'onStateChange') {
          if (data.info === 1) setIsPlaying(true);
          else if (data.info === 2 || data.info === 0) setIsPlaying(false);
        } else if (data?.event === 'infoDelivery' && data?.info) {
          if (data.info.playerState === 1) setIsPlaying(true);
          else if (data.info.playerState === 2 || data.info.playerState === 0) setIsPlaying(false);
          if (typeof data.info.muted === 'boolean') setIsMuted(data.info.muted);
        }
      } catch {
        // ignore non-json messages
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable) {
        return;
      }

      if (e.code === 'Space' || e.key === 'k' || e.key === 'K') {
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

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  };

  const formatDuration = (seconds?: number | null) => {
    if (!seconds) return null;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const displayThumbnail =
    thumbnailUrl || (cleanVideoId ? `https://i.ytimg.com/vi/${cleanVideoId}/hqdefault.jpg` : '/images/exercise_plank.png');

  // ==========================================
  // CASE 1: INSTAGRAM REEL DIRECT WEB PLAYER
  // ==========================================
  if (parsed.type === 'instagram' && parsed.instagramCode) {
    const igUrl = `https://www.instagram.com/p/${parsed.instagramCode}/`;
    const embedUrl = `https://www.instagram.com/reel/${parsed.instagramCode}/embed/`;

    return (
      <div className="w-full flex flex-col items-center justify-center my-2 space-y-4">
        {/* Smartphone Frame Container */}
        <div className="w-full max-w-[460px] bg-slate-950 rounded-[32px] sm:rounded-[38px] p-2 sm:p-3 border-4 border-slate-800 shadow-2xl shadow-black/60 relative overflow-hidden flex flex-col items-center">
          {/* Top Status Header */}
          <div className="w-full flex items-center justify-between px-3 py-2 text-white/90 border-b border-white/10 mb-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] flex items-center justify-center text-white shadow-sm">
                <InstagramIcon size={13} />
              </div>
              <span className="text-xs font-semibold tracking-tight text-white">
                {authorName || 'HealthGhuru Reels'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIframeKey(k => k + 1)}
                className="text-[11px] text-white/70 hover:text-white inline-flex items-center gap-1 transition-colors"
                title="Reload Player"
              >
                <RotateCcw size={11} /> Reload
              </button>
              <a
                href={igUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-semibold text-rose-400 hover:text-rose-300 inline-flex items-center gap-1 bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-full transition-colors"
              >
                Instagram App <ExternalLink size={10} />
              </a>
            </div>
          </div>

          {/* Interactive Player Screen */}
          <div className="w-full aspect-[9/16] min-h-[540px] sm:min-h-[600px] bg-black rounded-[22px] overflow-hidden relative shadow-inner">
            <iframe
              key={iframeKey}
              ref={iframeRef}
              src={embedUrl}
              title={title}
              className="w-full h-full border-0 rounded-[22px]"
              allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share; fullscreen"
              allowFullScreen
              loading="eager"
            />
          </div>

          {/* Bottom Interactive Guidance Bar */}
          <div className="w-full px-3 py-2 flex items-center justify-between text-[11px] text-slate-400 mt-1">
            <span className="flex items-center gap-1">
              💡 Tap play icon inside to start video & audio
            </span>
            <a
              href={igUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-rose-400 hover:underline font-medium"
            >
              Open Post &rarr;
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // CASE 2: DIRECT HTML5 VIDEO FILE (.mp4, etc.)
  // ==========================================
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
          onClick={togglePlayPauseDirect}
          onPlay={() => {
            setIsPlaying(true);
            setHasStarted(true);
          }}
          onPause={() => setIsPlaying(false)}
          className="w-full h-full object-contain cursor-pointer"
        />

        {feedbackIcon && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
            <div className="w-16 h-16 rounded-full bg-black/70 backdrop-blur-md text-white flex items-center justify-center animate-ping">
              {feedbackIcon === 'play' ? <Play size={28} className="fill-white ml-1" /> : <Pause size={28} className="fill-white" />}
            </div>
          </div>
        )}

        <div
          className={`absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 flex items-center justify-between transition-opacity duration-300 z-20 ${
            showControls || !isPlaying ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlayPauseDirect}
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

  // ==========================================
  // CASE 3: UNSUPPORTED / MISSING VIDEO SOURCE
  // ==========================================
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

  // ==========================================
  // CASE 4: YOUTUBE VIDEO PLAYER
  // ==========================================
  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="group bg-black rounded-3xl overflow-hidden shadow-2xl aspect-video relative border border-border select-none"
    >
      {/* 1. Active YouTube Embed when started */}
      {hasStarted ? (
        <>
          <iframe
            ref={iframeRef}
            src={`https://www.youtube-nocookie.com/embed/${cleanVideoId}?autoplay=1&enablejsapi=1&rel=0&modestbranding=1&playsinline=1`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
            allowFullScreen
            className="w-full h-full border-0 absolute inset-0"
          />

          {/* Feedback Splash (Play/Pause) */}
          {feedbackIcon && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
              <div className="w-16 h-16 rounded-full bg-black/75 backdrop-blur-md text-white flex items-center justify-center animate-ping">
                {feedbackIcon === 'play' ? (
                  <Play size={28} className="fill-white ml-0.5" />
                ) : (
                  <Pause size={28} className="fill-white" />
                )}
              </div>
            </div>
          )}

          {/* Quick Floating Action Controls Pill (Top Right) */}
          <div
            className={`absolute top-4 right-4 flex items-center gap-2 transition-opacity duration-300 z-20 ${
              showControls || !isPlaying ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
            }`}
          >
            <button
              onClick={togglePlayPause}
              className="px-3.5 py-1.5 rounded-full bg-black/80 hover:bg-black text-white backdrop-blur-md text-xs font-medium border border-white/20 flex items-center gap-1.5 transition-all shadow-xl hover:scale-105 active:scale-95"
              title={isPlaying ? 'Pause Video (Space)' : 'Play Video (Space)'}
            >
              {isPlaying ? (
                <>
                  <Pause size={13} className="fill-white" /> Pause
                </>
              ) : (
                <>
                  <Play size={13} className="fill-white ml-0.5" /> Play
                </>
              )}
            </button>

            <button
              onClick={toggleMute}
              className="p-1.5 rounded-full bg-black/80 hover:bg-black text-white backdrop-blur-md border border-white/20 transition-all shadow-xl hover:scale-105 active:scale-95"
              title={isMuted ? 'Unmute (M)' : 'Mute (M)'}
            >
              {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
            </button>

            <button
              onClick={toggleFullscreen}
              className="p-1.5 rounded-full bg-black/80 hover:bg-black text-white backdrop-blur-md border border-white/20 transition-all shadow-xl hover:scale-105 active:scale-95"
              title="Fullscreen (F)"
            >
              {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </button>
          </div>
        </>
      ) : (
        /* 2. Hero Cover Poster with Responsive Play Trigger */
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
              onClick={(e) => {
                e.stopPropagation();
                togglePlayPause();
              }}
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
    </div>
  );
}
