/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';

const ROBOT_SCRUB_VIDEO_URL = '/videos/robot_scrub.mp4';
const FALLBACK_VIDEO_URL = '/videos/robot.mp4';

// 4 Inspiration-aligned Story Chapters
const CHAPTERS = [
  {
    kicker: 'AI-POWERED FLUID DYNAMICS // 2026 EDITION',
    leadIn: 'Simulate the',
    giantWord: 'FLOW',
    description:
      'Next-generation browser CFD workbench combining real-time Navier-Stokes potential flow, Fourier Neural Operators, and automated compliance reporting.',
    cta: 'EXPLORE WORKBENCH',
  },
  {
    kicker: 'DIGITAL WIND TUNNEL // CONSERVATION LAWS',
    leadIn: 'Governing the',
    giantWord: 'AERO',
    description:
      'Numerical solvers compute mass, momentum, and thermal energy conservation across boundary layers, eliminating costly physical wind tunnel prototypes.',
    cta: 'INSPECT EQUATIONS',
  },
  {
    kicker: 'NEURAL OPERATOR & SOLVER ENGINE',
    leadIn: 'Accelerating',
    giantWord: 'RIM',
    description:
      'Fourier Neural Operators and OpenFOAM simpleFoam solvers predict complex aerodynamic pressure contours and vector streamlines in sub-second inference.',
    cta: 'VIEW STREAMLINES',
  },
  {
    kicker: 'STANDARDIZED WORKFLOW PIPELINE',
    leadIn: 'Executing the',
    giantWord: 'CDF',
    description:
      'A structured industrial pipeline ensuring numerical convergence: surface mesh inspection, inflow boundary physics, solver residual decay, and polar telemetry.',
    cta: 'EXPORT OPENFOAM',
  },
];

export default function App() {
  const [videoSrc, setVideoSrc] = useState(ROBOT_SCRUB_VIDEO_URL);
  const [activeSection, setActiveSection] = useState<number>(1);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const targetTimeRef = useRef<number>(0);
  const isSeekingRef = useRef<boolean>(false);
  const activeSectionRef = useRef<number>(1);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const textureRef = useRef<WebGLTexture | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);

  // WebGL Shader setup to render character in FRONT of the text
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', { premultipliedAlpha: false, alpha: true });
    if (!gl) return;
    glRef.current = gl;

    const vsSource = `
      attribute vec2 a_position;
      attribute vec2 a_texCoord;
      varying vec2 v_texCoord;
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
        v_texCoord = a_texCoord;
      }
    `;

    const fsSource = `
      precision mediump float;
      uniform sampler2D u_image;
      varying vec2 v_texCoord;
      void main() {
        vec4 color = texture2D(u_image, v_texCoord);
        // Detect studio background cyclorama (light grey-blue)
        float maxVal = max(color.r, max(color.g, color.b));
        float minVal = min(color.r, min(color.g, color.b));
        float diff = maxVal - minVal;

        bool isBackground = color.r > 0.45 && color.g > 0.48 && color.b > 0.54 && diff < 0.22;
        bool isFloor = color.r > 0.55 && color.g > 0.58 && color.b > 0.62 && v_texCoord.y > 0.88;

        if (isBackground || isFloor) {
          gl_FragColor = vec4(0.0);
        } else {
          gl_FragColor = color;
        }
      }
    `;

    const createShader = (glCtx: WebGLRenderingContext, type: number, source: string) => {
      const shader = glCtx.createShader(type);
      if (!shader) return null;
      glCtx.shaderSource(shader, source);
      glCtx.compileShader(shader);
      return shader;
    };

    const vs = createShader(gl, gl.VERTEX_SHADER, vsSource);
    const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.useProgram(program);
    programRef.current = program;

    // Quad geometry covering viewport
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        -1.0, -1.0,
         1.0, -1.0,
        -1.0,  1.0,
         1.0,  1.0,
      ]),
      gl.STATIC_DRAW
    );

    const aPosition = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

    const texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        0.0, 1.0,
        1.0, 1.0,
        0.0, 0.0,
        1.0, 0.0,
      ]),
      gl.STATIC_DRAW
    );

    const aTexCoord = gl.getAttribLocation(program, 'a_texCoord');
    gl.enableVertexAttribArray(aTexCoord);
    gl.vertexAttribPointer(aTexCoord, 2, gl.FLOAT, false, 0, 0);

    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    textureRef.current = texture;
  }, []);

  // Update canvas foreground character layer on each frame
  const renderForegroundFrame = () => {
    const gl = glRef.current;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!gl || !video || !canvas || video.readyState < 2) return;

    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width = video.videoWidth || 1920;
      canvas.height = video.videoHeight || 1080;
      gl.viewport(0, 0, canvas.width, canvas.height);
    }

    gl.bindTexture(gl.TEXTURE_2D, textureRef.current);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };

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
      renderForegroundFrame();
    }
  };

  const onSeeked = () => {
    renderForegroundFrame();
    processSeekQueue();
  };

  const updateScrollProgress = (progress: number) => {
    const video = videoRef.current;
    if (!video || !video.duration || Number.isNaN(video.duration)) return;

    const clampedProgress = Math.max(0, Math.min(1, progress));
    targetTimeRef.current = clampedProgress * video.duration;

    let nextSection = 1;
    if (clampedProgress >= 0.75) nextSection = 4;
    else if (clampedProgress >= 0.50) nextSection = 3;
    else if (clampedProgress >= 0.25) nextSection = 2;

    if (activeSectionRef.current !== nextSection) {
      activeSectionRef.current = nextSection;
      setActiveSection(nextSection);
    }

    if (!isSeekingRef.current) {
      isSeekingRef.current = true;
      video.currentTime = targetTimeRef.current;
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (maxScroll <= 0) return;
      const progress = window.scrollY / maxScroll;
      updateScrollProgress(progress);
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

  const scrollToSection = (sec: number) => {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const targetY = ((sec - 1) / 3) * maxScroll;
    window.scrollTo({ top: targetY, behavior: 'smooth' });
  };

  const currentChapter = CHAPTERS[activeSection - 1] || CHAPTERS[0];

  return (
    <div className="relative w-full bg-[#0D1117] min-h-screen text-white select-none overflow-x-hidden font-body">
      {/* 
        LAYER 0 (z-0): 
        Full-Screen Base Video (Background Studio Environment)
      */}
      <video
        ref={videoRef}
        src={videoSrc}
        muted
        playsInline
        preload="auto"
        onSeeked={onSeeked}
        onTimeUpdate={renderForegroundFrame}
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
            renderForegroundFrame();
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
          filter: 'brightness(1.15) contrast(1.06)',
        }}
      />

      {/* 
        LAYER 1 (z-10): 
        THE MONUMENTAL TEXT (BEHIND THE CHARACTER)
        Directly inspired by Image 1 (Astronaut over "MOON") and Image 2 (Earth over "WORLD")
      */}
      <div className="fixed inset-0 z-10 pointer-events-none flex flex-col justify-center items-center px-4 sm:px-10">
        <div className="w-full max-w-6xl flex flex-col items-center text-center">
          
          {/* Top Kicker (e.g. 50TH ANNIVERSARY style) */}
          <div className="text-[11px] sm:text-xs font-mono uppercase tracking-[0.25em] text-white/70 mb-2 drop-shadow-md">
            {currentChapter.kicker}
          </div>

          {/* Italic Serif Lead-in (e.g. Return to the style in coral/amber) */}
          <div className="text-2xl sm:text-4xl md:text-5xl font-serif italic text-[#F97316] drop-shadow-md mb-[-12px] sm:mb-[-24px] z-10 tracking-wide">
            {currentChapter.leadIn}
          </div>

          {/* 
            GIANT MONUMENTAL DISPLAY WORD (BEHIND THE CHARACTER)
            Massive, bold, with soft outer glow, spanning across the viewport
          */}
          <div 
            className="text-[90px] sm:text-[150px] md:text-[210px] lg:text-[260px] font-black tracking-widest text-white leading-none drop-shadow-[0_0_40px_rgba(255,255,255,0.7)] select-none opacity-95 transition-all duration-700 ease-out"
            style={{
              fontFamily: 'Impact, "Helvetica Neue", Arial, sans-serif',
              letterSpacing: '0.12em',
            }}
          >
            {currentChapter.giantWord}
          </div>

          {/* Bottom Dual-Column Row (Editorial Description + Framed Action Button) */}
          <div className="w-full flex flex-col md:flex-row items-center md:items-end justify-between gap-6 pt-6 sm:pt-8 max-w-4xl text-left pointer-events-auto">
            {/* Description Paragraph */}
            <p className="text-xs sm:text-sm text-white/90 max-w-md leading-relaxed font-normal drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]">
              {currentChapter.description}
            </p>

            {/* Framed Action Button with Corner Brackets like Image 1 */}
            <button
              onClick={() => scrollToSection(activeSection === 4 ? 1 : activeSection + 1)}
              className="relative px-6 py-2.5 uppercase tracking-widest text-xs font-bold text-white border border-white/40 hover:bg-white hover:text-black transition-all duration-200 cursor-pointer backdrop-blur-xs group"
            >
              {/* Corner Bracket Accents */}
              <span className="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 border-white pointer-events-none" />
              <span className="absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2 border-white pointer-events-none" />
              <span>{currentChapter.cta}</span>
            </button>
          </div>

        </div>
      </div>

      {/* 
        LAYER 2 (z-20): 
        THE CHARACTER CUTOUT (IN FRONT OF THE TEXT)
        Hardware-accelerated WebGL shader renders ONLY the robot character,
        seamlessly placing the robot in FRONT of the giant glowing text!
      */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 z-20 w-full h-full object-cover pointer-events-none"
        style={{
          position: 'fixed',
          inset: 0,
          width: '100vw',
          height: '100vh',
          objectFit: 'cover',
          objectPosition: 'center',
          filter: 'brightness(1.15) contrast(1.06)',
        }}
      />

      {/* 
        UI CHROME:
        Left Slide Indicator (like "1 <" in Image 1)
      */}
      <div className="fixed left-5 sm:left-10 top-1/2 -translate-y-1/2 z-30 flex items-center gap-1.5 font-mono text-sm text-white pointer-events-auto">
        <span className="font-bold text-base">{activeSection}</span>
        <span className="text-[#F97316] font-bold">&lt;</span>
      </div>

      {/* Right Vertical Pagination Dots */}
      <div className="fixed right-5 sm:right-10 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-3 pointer-events-auto">
        {[1, 2, 3, 4].map((sec) => (
          <button
            key={sec}
            onClick={() => scrollToSection(sec)}
            aria-label={`Jump to slide ${sec}`}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
              activeSection === sec
                ? 'bg-white scale-125 ring-4 ring-white/20'
                : 'bg-white/40 hover:bg-white/70'
            }`}
          />
        ))}
      </div>

      {/* Top Brand Bar */}
      <header className="fixed top-0 left-0 right-0 z-30 px-6 sm:px-12 py-5 flex items-center justify-between text-white pointer-events-none">
        <div className="flex items-center gap-2.5 drop-shadow-md">
          <span className="text-base font-bold tracking-tight text-white">RIM Platform</span>
          <span className="text-xs sm:text-sm text-[#38BDF8] font-semibold">· CDF Aerodynamics &amp; AI Engine</span>
        </div>
      </header>

      {/* 
        Scroll Track: 
        500vh container driving the character walk and animated text transitions
      */}
      <div 
        className="relative w-full h-[500vh] pointer-events-none" 
        aria-hidden="true" 
      />
    </div>
  );
}
