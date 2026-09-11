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
  isShort?: boolean;
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

function YouTubeShortsIcon({ size = 14, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M17.77 10.32l-1.2-.5L18 9.06a3.74 3.74 0 0 0-3.5-5.36 3.7 3.7 0 0 0-2.4 1.1L5.8 9.56a3.75 3.75 0 0 0 2.2 6.74l1.2.5-1.43.76a3.75 3.75 0 0 0 3.5 5.38 3.7 3.7 0 0 0 2.4-1.1l6.3-4.76a3.75 3.75 0 0 0-2.2-6.76zM10 14.65v-5.3l4.5 2.65-4.5 2.65z" />
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
  isShort = false,
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

  const isVertical = isShort || parsed.type === 'instagram';

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
      <div className="w-full flex justify-center lg:justify-start">
        {/* Smartphone Frame Container (With smooth hover elevation and moving effects) */}
        <div className="w-full max-w-[460px] sm:max-w-[480px] xl:max-w-[500px] bg-slate-950 rounded-[38px] sm:rounded-[44px] p-2.5 sm:p-3.5 border-[4px] border-slate-800 shadow-2xl shadow-slate-950/70 relative overflow-hidden flex flex-col items-center transition-all duration-500 hover:shadow-[0_24px_60px_rgba(0,0,0,0.8)] hover:border-slate-700 hover:-translate-y-1.5">
          {/* Top Status Header */}
          <div className="w-full flex items-center justify-between px-3 py-2 text-white/90 border-b border-white/10 mb-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] flex items-center justify-center text-white shadow-sm transition-transform duration-300 hover:rotate-12 hover:scale-110">
                <InstagramIcon size={13} />
              </div>
              <span className="text-xs font-semibold tracking-tight text-white truncate max-w-[160px] sm:max-w-[200px]">
                {authorName || 'HealthGhuru Reels'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIframeKey(k => k + 1)}
                className="text-[11px] text-white/70 hover:text-white inline-flex items-center gap-1 transition-all px-1.5 py-0.5 rounded hover:bg-white/10 active:scale-95"
                title="Reload Player"
              >
                <RotateCcw size={11} className="transition-transform duration-500 hover:rotate-180" /> Reload
              </button>
              <a
                href={igUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-semibold text-rose-400 hover:text-rose-300 inline-flex items-center gap-1 bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-full transition-all duration-300 hover:scale-105 active:scale-95"
              >
                Instagram App <ExternalLink size={10} />
              </a>
            </div>
          </div>

          {/* Interactive Player Screen */}
          <div className="w-full aspect-[9/16] min-h-[600px] sm:min-h-[660px] xl:min-h-[720px] max-h-[820px] bg-black rounded-[26px] overflow-hidden relative shadow-inner">
            <iframe
              key={iframeKey}
              ref={iframeRef}
              src={embedUrl}
              title={title}
              className="w-full h-full border-0 rounded-[26px]"
              allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share; fullscreen"
              allowFullScreen
              loading="eager"
            />
          </div>

          {/* Bottom Interactive Guidance Bar */}
          <div className="w-full px-3 py-2.5 flex items-center justify-between text-[11px] text-slate-400 mt-1">
            <span className="flex items-center gap-1 text-slate-400 hover:text-slate-300 transition-colors">
              💡 Tap play icon inside to start video & audio
            </span>
            <a
              href={igUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-rose-400 hover:text-rose-300 hover:underline font-medium inline-flex items-center gap-0.5 transition-all hover:translate-x-0.5"
            >
              Open Post <ExternalLink size={10} />
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // CASE 2: YOUTUBE SHORTS (VERTICAL 9:16 PHONE FRAME)
  // ==========================================
  if (parsed.type === 'youtube' && isVertical && cleanVideoId) {
    const ytUrl = canonicalUrl || `https://www.youtube.com/shorts/${cleanVideoId}`;

    return (
      <div className="w-full flex justify-center lg:justify-start">
        {/* Smartphone Frame Container */}
        <div className="w-full max-w-[460px] sm:max-w-[480px] xl:max-w-[500px] bg-slate-950 rounded-[38px] sm:rounded-[44px] p-2.5 sm:p-3.5 border-[4px] border-slate-800 shadow-2xl shadow-slate-950/70 relative overflow-hidden flex flex-col items-center transition-all duration-500 hover:shadow-[0_24px_60px_rgba(0,0,0,0.8)] hover:border-slate-700 hover:-translate-y-1.5">
          {/* Top Status Header */}
          <div className="w-full flex items-center justify-between px-3 py-2 text-white/90 border-b border-white/10 mb-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center text-white shadow-sm transition-transform duration-300 hover:scale-110">
                <YouTubeShortsIcon size={12} />
              </div>
              <span className="text-xs font-semibold tracking-tight text-white truncate max-w-[160px] sm:max-w-[200px]">
                {authorName || 'HealthGhuru Shorts'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIframeKey(k => k + 1)}
                className="text-[11px] text-white/70 hover:text-white inline-flex items-center gap-1 transition-all px-1.5 py-0.5 rounded hover:bg-white/10 active:scale-95"
                title="Reload Player"
              >
                <RotateCcw size={11} className="transition-transform duration-500 hover:rotate-180" /> Reload
              </button>
              <a
                href={ytUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-semibold text-red-400 hover:text-red-300 inline-flex items-center gap-1 bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-full transition-all duration-300 hover:scale-105 active:scale-95"
              >
                YouTube <ExternalLink size={10} />
              </a>
            </div>
          </div>

          {/* Interactive Player Screen */}
          <div className="w-full aspect-[9/16] min-h-[600px] sm:min-h-[660px] xl:min-h-[720px] max-h-[820px] bg-black rounded-[26px] overflow-hidden relative shadow-inner group">
            {hasStarted ? (
              <iframe
                key={iframeKey}
                ref={iframeRef}
                src={`https://www.youtube-nocookie.com/embed/${cleanVideoId}?autoplay=1&enablejsapi=1&rel=0&modestbranding=1&playsinline=1`}
                title={title}
                className="w-full h-full border-0 rounded-[26px]"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                allowFullScreen
                loading="eager"
              />
            ) : (
              <div
                onClick={togglePlayPause}
                className="w-full h-full bg-cover bg-center cursor-pointer relative flex flex-col justify-between p-6 transition-all duration-500 group-hover:scale-105"
                style={{ backgroundImage: `url(${displayThumbnail})` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/60 rounded-[26px] transition-opacity duration-300 group-hover:opacity-75" />
                
                <div className="relative z-10 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-600/90 backdrop-blur-md text-white text-xs font-semibold shadow-md transition-transform duration-300 hover:scale-105">
                    <YouTubeShortsIcon size={12} /> Short
                  </span>
                  {durationSeconds ? (
                    <span className="px-2.5 py-0.5 rounded bg-black/70 text-white font-mono text-xs">
                      {formatDuration(durationSeconds)}
                    </span>
                  ) : null}
                </div>

                <div className="relative z-10 flex flex-col items-center justify-center gap-3 my-auto">
                  <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-2xl shadow-red-600/60 transform group-hover:scale-115 active:scale-95 transition-all duration-300 ring-4 ring-white/30 animate-pulse">
                    <Play size={36} className="fill-white ml-1.5" />
                  </div>
                  <span className="text-white text-xs sm:text-sm font-medium tracking-wide drop-shadow-md bg-black/60 backdrop-blur-sm px-4 py-1.5 rounded-full transition-transform duration-300 group-hover:translate-y-[-2px]">
                    Tap to play Short
                  </span>
                </div>

                <div className="relative z-10 text-center text-white/80 text-xs truncate">
                  {title}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Guidance Bar */}
          <div className="w-full px-3 py-2.5 flex items-center justify-between text-[11px] text-slate-400 mt-1">
            <span className="flex items-center gap-1">
              💡 Press Space or click to play
            </span>
            <a
              href={ytUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-400 hover:text-red-300 hover:underline font-medium inline-flex items-center gap-0.5 transition-all hover:translate-x-0.5"
            >
              Open on YouTube <ExternalLink size={10} />
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // CASE 3: DIRECT HTML5 VIDEO FILE (.mp4, etc.)
  // ==========================================
  if (parsed.type === 'direct' && parsed.directUrl) {
    if (isVertical) {
      return (
        <div className="w-full flex justify-center lg:justify-start">
          <div className="w-full max-w-[460px] sm:max-w-[480px] xl:max-w-[500px] bg-slate-950 rounded-[38px] sm:rounded-[44px] p-2.5 sm:p-3.5 border-[4px] border-slate-800 shadow-2xl shadow-slate-950/70 relative overflow-hidden flex flex-col items-center transition-all duration-500 hover:shadow-[0_24px_60px_rgba(0,0,0,0.8)] hover:-translate-y-1.5">
            <div className="w-full aspect-[9/16] min-h-[600px] sm:min-h-[660px] xl:min-h-[720px] max-h-[820px] bg-black rounded-[26px] overflow-hidden relative shadow-inner">
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
                className="w-full h-full object-cover cursor-pointer rounded-[26px] transition-transform duration-500 hover:scale-[1.01]"
              />
            </div>
          </div>
        </div>
      );
    }

    return (
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        className="group bg-black rounded-3xl overflow-hidden shadow-2xl aspect-video relative border border-border select-none w-full transition-all duration-500 hover:shadow-[0_24px_60px_rgba(0,0,0,0.6)] hover:border-primary/30 hover:-translate-y-1"
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
              className="w-9 h-9 rounded-full bg-white/20 hover:bg-white text-white hover:text-dark flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
              title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
            >
              {isPlaying ? <Pause size={16} className="fill-current" /> : <Play size={16} className="fill-current ml-0.5" />}
            </button>
            <button
              onClick={toggleMute}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
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
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
            title="Fullscreen (F)"
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // CASE 4: UNSUPPORTED / MISSING VIDEO SOURCE
  // ==========================================
  if (parsed.type === 'unsupported' || parsed.type === 'empty' || (!cleanVideoId && parsed.type !== 'direct')) {
    return (
      <div className="w-full bg-gradient-to-br from-[#121820] to-[#0A0E13] rounded-3xl overflow-hidden shadow-2xl aspect-video relative border border-border flex flex-col items-center justify-center p-6 sm:p-10 text-center transition-all duration-500 hover:shadow-2xl hover:border-primary/30 hover:-translate-y-1">
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
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#E50914] hover:bg-[#c40812] text-white text-xs font-semibold shadow-lg shadow-red-600/20 transition-all duration-300 hover:scale-105 active:scale-95"
            >
              Watch Video at Source <ExternalLink size={14} />
            </a>
          ) : (
            <a
              href={`https://www.youtube.com/results?search_query=${encodeURIComponent(title)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary hover:bg-primary-dark text-white text-xs font-semibold shadow-lg transition-all duration-300 hover:scale-105 active:scale-95"
            >
              Search on YouTube <ExternalLink size={14} />
            </a>
          )}
        </div>
      </div>
    );
  }

  // ==========================================
  // CASE 5: STANDARD 16:9 YOUTUBE VIDEO PLAYER
  // ==========================================
  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="group bg-black rounded-3xl overflow-hidden shadow-2xl aspect-video relative border border-border select-none w-full transition-all duration-500 hover:shadow-[0_24px_60px_rgba(0,0,0,0.6)] hover:border-primary/40 hover:-translate-y-1"
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
              className="px-3.5 py-1.5 rounded-full bg-black/80 hover:bg-black text-white backdrop-blur-md text-xs font-medium border border-white/20 flex items-center gap-1.5 transition-all duration-200 shadow-xl hover:scale-105 active:scale-95"
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
              className="p-1.5 rounded-full bg-black/80 hover:bg-black text-white backdrop-blur-md border border-white/20 transition-all duration-200 shadow-xl hover:scale-105 active:scale-95"
              title={isMuted ? 'Unmute (M)' : 'Mute (M)'}
            >
              {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
            </button>

            <button
              onClick={toggleFullscreen}
              className="p-1.5 rounded-full bg-black/80 hover:bg-black text-white backdrop-blur-md border border-white/20 transition-all duration-200 shadow-xl hover:scale-105 active:scale-95"
              title="Fullscreen (F)"
            >
              {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </button>
          </div>
        </>
      ) : (
        /* 2. Hero Cover Poster with Moving & Hover Effects */
        <div
          onClick={togglePlayPause}
          className="absolute inset-0 bg-cover bg-center cursor-pointer z-10 flex flex-col justify-between p-6 sm:p-8 transition-all duration-700 group-hover:scale-105"
          style={{ backgroundImage: `url(${displayThumbnail})` }}
        >
          {/* Gradient Tint with Smooth Opacity Transition */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/50 transition-opacity duration-500 group-hover:opacity-75" />

          {/* Top Info Bar */}
          <div className="relative z-10 flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-dark/70 backdrop-blur-md text-white text-xs font-medium border border-white/10 shadow-md transition-transform duration-300 group-hover:scale-105">
              <Sparkles size={13} className="text-primary animate-pulse" /> Health & Wellness Video
            </span>
            {durationSeconds ? (
              <span className="px-3 py-1 rounded-md bg-black/80 backdrop-blur-md text-white font-mono text-xs shadow-md">
                {formatDuration(durationSeconds)}
              </span>
            ) : null}
          </div>

          {/* Center Play Button with Glow & Pulse Wave Animation */}
          <div className="relative z-10 flex flex-col items-center justify-center gap-3.5 my-auto">
            <button
              type="button"
              aria-label="Play video"
              onClick={(e) => {
                e.stopPropagation();
                togglePlayPause();
              }}
              className="w-22 h-22 sm:w-26 sm:h-26 rounded-full bg-primary hover:bg-primary-dark text-white flex items-center justify-center shadow-2xl shadow-primary/60 transform group-hover:scale-115 active:scale-95 transition-all duration-300 ring-4 ring-white/30 animate-pulse"
            >
              <Play size={40} className="fill-white ml-2 transition-transform duration-300 group-hover:scale-110" />
            </button>
            <span className="text-white text-xs sm:text-sm font-medium tracking-wide drop-shadow-md bg-black/60 backdrop-blur-sm px-4 py-1.5 rounded-full transition-transform duration-300 group-hover:translate-y-[-2px]">
              Click anywhere to play
            </span>
          </div>

          {/* Bottom Attribution */}
          <div className="relative z-10 flex items-center justify-between text-white/90 text-xs sm:text-sm">
            <span className="font-heading font-medium truncate max-w-[80%]">{authorName || 'HealthGhuru Verified'}</span>
            <span className="text-xs text-white/70">Press Space to Play</span>
          </div>
        </div>
      )}
    </div>
  );
}
