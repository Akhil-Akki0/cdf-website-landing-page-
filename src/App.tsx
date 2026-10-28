/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';

const ROBOT_4K_VIDEO_URL = '/videos/robot_4k.mp4';
const FALLBACK_VIDEO_URL = '/videos/robot.mp4';

export default function App() {
  const [videoSrc, setVideoSrc] = useState(ROBOT_4K_VIDEO_URL);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const targetTimeRef = useRef<number>(0);
  const isSeekingRef = useRef<boolean>(false);

  // Process video seek queue to prevent decoder frame-dropping
  const processSeekQueue = () => {
    const video = videoRef.current;
    if (!video || !video.duration || Number.isNaN(video.duration)) {
      isSeekingRef.current = false;
      return;
    }

    if (Math.abs(video.currentTime - targetTimeRef.current) > 0.02) {
      isSeekingRef.current = true;
      video.currentTime = targetTimeRef.current;
    } else {
      isSeekingRef.current = false;
    }
  };

  const onSeeked = () => {
    processSeekQueue();
  };

  // Synchronize target time based on scroll progress
  const setTargetProgress = (progress: number) => {
    const video = videoRef.current;
    if (!video || !video.duration || Number.isNaN(video.duration)) return;

    const clampedProgress = Math.max(0, Math.min(1, progress));
    targetTimeRef.current = clampedProgress * video.duration;

    if (!isSeekingRef.current) {
      isSeekingRef.current = true;
      video.currentTime = targetTimeRef.current;
    }
  };

  // Scroll & Wheel listeners
  useEffect(() => {
    const handleScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (maxScroll <= 0) return;
      const progress = window.scrollY / maxScroll;
      setTargetProgress(progress);
    };

    const handleWheel = (e: WheelEvent) => {
      const video = videoRef.current;
      if (!video || !video.duration || Number.isNaN(video.duration)) return;

      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (maxScroll > 0) {
        requestAnimationFrame(handleScroll);
      } else {
        const delta = e.deltaY;
        const timeDelta = (delta / 800) * video.duration;
        const newTime = Math.max(0, Math.min(video.duration, targetTimeRef.current + timeDelta));
        targetTimeRef.current = newTime;
        if (!isSeekingRef.current) {
          isSeekingRef.current = true;
          video.currentTime = newTime;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('wheel', handleWheel, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('wheel', handleWheel);
    };
  }, []);

  return (
    <div className="relative w-full bg-black min-h-screen overflow-x-hidden">
      {/* 
        Fixed Full-Screen Enhanced 4K Video (Watermark Removed)
        Moves strictly according to scroll position
      */}
      <video
        ref={videoRef}
        src={videoSrc}
        muted
        playsInline
        preload="auto"
        onSeeked={onSeeked}
        onError={() => {
          if (videoSrc !== FALLBACK_VIDEO_URL) {
            setVideoSrc(FALLBACK_VIDEO_URL);
          }
        }}
        onLoadedMetadata={() => {
          const video = videoRef.current;
          if (video) {
            const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
            const progress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
            video.currentTime = progress * video.duration;
            targetTimeRef.current = video.currentTime;
          }
        }}
        className="fixed inset-0 z-0 w-full h-full object-cover pointer-events-none"
        style={{
          position: 'fixed',
          inset: 0,
          width: '100vw',
          height: '100vh',
          objectFit: 'cover',
          objectPosition: 'center',
        }}
      />

      {/* 
        Scroll Track: 
        500vh virtual scroll space mapped directly to character movement.
        Scrolling down moves the character forward; scrolling up moves it backward.
      */}
      <div 
        className="relative w-full h-[500vh] pointer-events-none" 
        aria-hidden="true" 
      />
    </div>
  );
}
