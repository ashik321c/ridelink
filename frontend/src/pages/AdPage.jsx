"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Smartphone,
  Monitor,
  ChevronRight,
  ChevronLeft,
  Shield,
  Compass,
  Sparkles,
} from "lucide-react";

const SCENES = [
  {
    id: 1,
    title: "Scene 1: The Problem",
    subtitle: "IT Office, Kochi • 6:30 PM",
    image: "/ad/film_scene1_kochi_rain.jpg",
    duration: 6.5,
    description:
      "Ashik walks out of his Kochi IT office looking exhausted. He checks booking apps: KSRTC is sold out; taxi prices are at a steep ₹3,850. Heavy rain starts.",
    overlayText: "Need to travel urgently?",
    dialogue: 'Ashik: "Oh no... How am I going to reach home today?"',
  },
  {
    id: 2,
    title: "Scene 2: Empty Seats",
    subtitle: "Kochi Parking • 6:45 PM",
    image: "/ad/film_scene2_driver_offer.jpg",
    duration: 6.0,
    description:
      "Ravi, another professional, finishes work and heads to his car. He's driving to Calicut anyway. He opens RideLink and posts 3 empty seats for ₹450.",
    overlayText: "Driving anyway? Share the fuel cost.",
    dialogue:
      'Ravi: "I\'m going anyway... Maybe someone else needs this ride."',
  },
  {
    id: 3,
    title: "Scene 3: The Match",
    subtitle: "Kochi Street • 6:50 PM",
    image: "/ad/film_scene3_passenger_match.jpg",
    duration: 6.0,
    description:
      "Ashik searches Kochi to Calicut on RideLink. Instantly, Ravi's profile appears: Verified Driver, 4.9★ rating, Tata Nexon. He books immediately.",
    overlayText: "Matched in seconds.",
    dialogue: 'Ashik: "Perfect... Exactly the route I need."',
  },
  {
    id: 4,
    title: "Scene 4: Accepted",
    subtitle: "Ravi's Car • 6:52 PM",
    image: "/ad/film_scene4_driver_accept.jpg",
    duration: 5.5,
    description:
      "Ravi's phone vibrates in the mount. He checks Ashik's verified profile and accepts. The booking is instantly confirmed on both phones.",
    overlayText: "Verified connections, instantly.",
    dialogue: 'Ravi: "See you soon."',
  },
  {
    id: 5,
    title: "Scene 5: Pickup",
    subtitle: "Pickup Point • 7:00 PM",
    image: "/ad/film_scene5_pickup.jpg",
    duration: 6.0,
    description:
      "Ravi pulls up. Ashik waves and steps in. A warm greeting sets a friendly, safe tone for the long drive ahead.",
    overlayText: "Travel with community.",
    dialogue:
      'Ravi: "Hi Ashik?"\nAshik: "Yes!"\nRavi: "Come on in."\nAshik: "Thank you so much, brother."',
  },
  {
    id: 6,
    title: "Scene 6: The Journey",
    subtitle: "Kerala Highway • 8:30 PM",
    image: "/ad/film_scene6_journey.jpg",
    duration: 7.5,
    description:
      "Cruising along green winding roads of Kerala in the rain. Playing music, sharing travel stories, and enjoying coffee.",
    overlayText: "Travel together. Connect people.",
    dialogue:
      'Ashik: "I thought I\'d have to spend ₹4,000 on a taxi."\nRavi: (laughs) "I\'m traveling anyway. Sharing helps both of us."\nAshik: "It\'s much better than traveling alone."',
  },
  {
    id: 7,
    title: "Scene 7: Safety Share",
    subtitle: "Live Tracking • 9:00 PM",
    image: "/ad/film_scene7_safety.jpg",
    duration: 5.5,
    description:
      "Ashik taps 'Share Trip' on his app. His mother receives a text link and watches his real-time GPS progress on the map with complete relief.",
    overlayText: "Keep your loved ones reassured.",
    dialogue:
      'Mother receives SMS: "Ashik started a RideLink trip. Track live: rlnk.in/t/88f2b"',
  },
  {
    id: 8,
    title: "Scene 8: Safe Arrival",
    subtitle: "Calicut • 11:30 PM",
    image: "/ad/film_scene8_arrival.jpg",
    duration: 6.0,
    description:
      "Arriving in Calicut. Ashik steps out, thanks Ravi, and taps 'I've Reached Safely'. Mother receives confirmation. Everyone smiles.",
    overlayText: "Arrived safely. Shared savings.",
    dialogue:
      'Ashik: "Thanks brother. Safe journey."\nRavi: "Take care!"\nMother receives SMS: "Ashik safely reached Calicut."',
  },
  {
    id: 9,
    title: "RideLink Brand",
    subtitle: "Smarter Travel",
    image: "/ad/film_scene_final.jpg",
    duration: 7.5,
    description:
      "RideLink. Travel Together. Split the Cost. Travel Smarter. No empty seats. No expensive taxis. Just smarter travel.",
    overlayText: "RideLink: Connecting People, Not Just Destinations.",
    dialogue: "🎹 Piano arpeggio rings out. Fade to white.",
  },
];

const fillRainNoiseBuffer = (buffer) => {
  const output = buffer.getChannelData(0);
  let lastOut = 0.0;
  for (let i = 0; i < buffer.length; i++) {
    const white = Math.random() * 2 - 1;
    output[i] = (lastOut + 0.02 * white) / 1.02;
    lastOut = output[i];
    output[i] *= 3.5;
  }
};

export default function StandaloneAdPage() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [aspectRatio, setAspectRatio] = useState("16_9");
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [audioStarted, setAudioStarted] = useState(false);

  const audioCtxRef = useRef(null);
  const masterGainRef = useRef(null);

  // Auto playback timeline timer
  useEffect(() => {
    let interval;
    if (isPlaying) {
      const activeScene = SCENES[currentIdx];
      const stepTime = 50;
      const totalSteps = (activeScene.duration * 1000) / stepTime;
      let elapsedSteps = (progress / 100) * totalSteps;

      interval = setInterval(() => {
        elapsedSteps += 1;
        const newProgress = (elapsedSteps / totalSteps) * 100;
        if (newProgress >= 100) {
          setProgress(0);
          if (currentIdx < SCENES.length - 1) {
            setCurrentIdx((prev) => prev + 1);
          } else {
            setIsPlaying(false);
          }
        } else {
          setProgress(newProgress);
        }
      }, stepTime);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentIdx, progress]);

  // Audio system: Emotional Piano synthesiser
  const startAudio = () => {
    if (audioStarted) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(isMuted ? 0 : 0.45, ctx.currentTime);
      masterGain.connect(ctx.destination);
      masterGainRef.current = masterGain;

      // Start constant soft environmental background rain/wind
      playRainNoise(ctx, masterGain);

      setAudioStarted(true);
    } catch (e) {
      console.warn("Audio failed to initialize:", e);
    }
  };

  const playRainNoise = (ctx, destination) => {
    // Generate soft pinkish noise buffer for rain
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    fillRainNoiseBuffer(noiseBuffer);
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(1000, ctx.currentTime);

    const rainGain = ctx.createGain();
    rainGain.gain.setValueAtTime(0.04, ctx.currentTime);

    noiseSource.connect(filter);
    filter.connect(rainGain);
    rainGain.connect(destination);
    noiseSource.start();
  };

  const playPianoNote = (frequency, volume, duration) => {
    if (!audioCtxRef.current || isMuted) return;
    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const subOsc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    // Piano fundamental
    osc.type = "triangle";
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);

    // Warm overtone fundamental (sine)
    subOsc.type = "sine";
    subOsc.frequency.setValueAtTime(frequency * 2, ctx.currentTime);

    // Quick attack, exponential decay for string simulation
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.015);
    gainNode.gain.exponentialRampToValueAtTime(
      0.0001,
      ctx.currentTime + duration,
    );

    osc.connect(gainNode);
    subOsc.connect(gainNode);
    gainNode.connect(masterGainRef.current);

    osc.start();
    subOsc.start();
    osc.stop(ctx.currentTime + duration);
    subOsc.stop(ctx.currentTime + duration);
  };

  // Play piano notes on change of scene
  useEffect(() => {
    if (!audioStarted || isMuted || !audioCtxRef.current) return;
    // Play emotional piano arpeggio chords based on scene state
    if (currentIdx === 0) {
      // Scene 1: F minor (Sad, worried)
      playPianoNote(174.61, 0.4, 1.8); // F3
      setTimeout(() => playPianoNote(207.65, 0.3, 1.6), 250); // Ab3
      setTimeout(() => playPianoNote(261.63, 0.3, 1.4), 500); // C4
      setTimeout(() => playPianoNote(311.13, 0.2, 1.2), 750); // Eb4
    } else if (currentIdx === 1) {
      // Scene 2: Bb Major (Hopeful transition)
      playPianoNote(233.08, 0.4, 2.0); // Bb3
      setTimeout(() => playPianoNote(293.66, 0.3, 1.8), 200); // D4
      setTimeout(() => playPianoNote(349.23, 0.3, 1.6), 400); // F4
      setTimeout(() => playPianoNote(466.16, 0.2, 1.2), 600); // Bb4
    } else if (currentIdx === 2) {
      // Scene 3: Eb Major 7 (Bright discovery)
      playPianoNote(155.56, 0.4, 2.0); // Eb3
      setTimeout(() => playPianoNote(233.08, 0.3, 1.8), 150); // Bb3
      setTimeout(() => playPianoNote(311.13, 0.3, 1.6), 300); // Eb4
      setTimeout(() => playPianoNote(392.0, 0.2, 1.4), 450); // G4
    } else if (currentIdx === 3) {
      // Scene 4: Ab Major (Sweet confirmation)
      playPianoNote(207.65, 0.4, 2.0); // Ab3
      setTimeout(() => playPianoNote(261.63, 0.3, 1.8), 150); // C4
      setTimeout(() => playPianoNote(311.13, 0.3, 1.6), 300); // Eb4
      setTimeout(() => playPianoNote(415.3, 0.2, 1.4), 450); // Ab4
    } else if (currentIdx === 4) {
      // Scene 5: C major (Warm meeting)
      playPianoNote(130.81, 0.4, 2.5); // C3
      setTimeout(() => playPianoNote(196.0, 0.3, 2.0), 150); // G3
      setTimeout(() => playPianoNote(261.63, 0.3, 1.8), 300); // C4
      setTimeout(() => playPianoNote(329.63, 0.2, 1.6), 450); // E4
    } else if (currentIdx === 5) {
      // Scene 6: F Major 7 (Flowing journey)
      playPianoNote(174.61, 0.4, 2.5); // F3
      setTimeout(() => playPianoNote(261.63, 0.3, 2.0), 200); // C4
      setTimeout(() => playPianoNote(329.63, 0.3, 1.8), 400); // E4
      setTimeout(() => playPianoNote(392.0, 0.2, 1.6), 600); // G4
    } else if (currentIdx === 6) {
      // Scene 7: C Major (Safety reassurance)
      playPianoNote(261.63, 0.4, 2.0); // C4
      setTimeout(() => playPianoNote(329.63, 0.3, 1.8), 150); // E4
      setTimeout(() => playPianoNote(392.0, 0.3, 1.6), 300); // G4
      setTimeout(() => playPianoNote(523.25, 0.2, 1.4), 450); // C5
    } else if (currentIdx === 7) {
      // Scene 8: G Major (Peaceful arrival)
      playPianoNote(196.0, 0.4, 2.5); // G3
      setTimeout(() => playPianoNote(293.66, 0.3, 2.0), 200); // D4
      setTimeout(() => playPianoNote(392.0, 0.3, 1.8), 400); // G4
      setTimeout(() => playPianoNote(493.88, 0.2, 1.4), 600); // B4
    } else if (currentIdx === 8) {
      // Ending: Apple-style beautiful arpeggio arpeggiating up and resolving
      const notes = [
        130.81, 196.0, 261.63, 329.63, 392.0, 523.25, 659.25, 783.99, 1046.5,
      ];
      notes.forEach((freq, idx) => {
        setTimeout(() => {
          playPianoNote(
            freq,
            idx === notes.length - 1 ? 0.35 : 0.18,
            3.5 - idx * 0.2,
          );
        }, idx * 180);
      });
    }
  }, [currentIdx]);

  useEffect(() => {
    if (masterGainRef.current && audioCtxRef.current) {
      masterGainRef.current.gain.linearRampToValueAtTime(
        isMuted ? 0 : 0.5,
        audioCtxRef.current.currentTime + 0.25,
      );
    }
  }, [isMuted]);

  const handleNext = () => {
    setProgress(0);
    if (currentIdx < SCENES.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      setCurrentIdx(0);
    }
    startAudio();
  };

  const handlePrev = () => {
    setProgress(0);
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
    } else {
      setCurrentIdx(SCENES.length - 1);
    }
    startAudio();
  };

  const handleProgressClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const targetGlobalSec = percentage * getTotalDuration();
    let accumulated = 0;
    for (let i = 0; i < SCENES.length; i++) {
      const duration = SCENES[i].duration;
      if (accumulated + duration >= targetGlobalSec) {
        setCurrentIdx(i);
        const sceneOffset = targetGlobalSec - accumulated;
        setProgress((sceneOffset / duration) * 100);
        break;
      }
      accumulated += duration;
    }
    startAudio();
  };

  const getTotalDuration = () => {
    return SCENES.reduce((acc, scene) => acc + scene.duration, 0);
  };

  const getGlobalProgress = () => {
    let accumulated = 0;
    for (let i = 0; i < currentIdx; i++) {
      accumulated += SCENES[i].duration;
    }
    const currentSceneSec = (progress / 100) * SCENES[currentIdx].duration;
    return ((accumulated + currentSceneSec) / getTotalDuration()) * 100;
  };

  const activeScene = SCENES[currentIdx];

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans selection:bg-blue-500/20 overflow-hidden select-none">
      {/* Top Standalone Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-slate-800 bg-slate-950/80 backdrop-blur-md z-30">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600/10 rounded-xl text-blue-400 border border-blue-500/20">
            <Compass size={18} className="animate-pulse" />
          </div>
          <div>
            <h1 className="text-md sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
              RideLink Cinematic Short Film
            </h1>
            <p className="text-xs text-slate-400 hidden sm:block">
              Standalone Cinematic Visual Showcase
            </p>
          </div>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-3">
          {/* Aspect Ratio Selector */}
          <div className="bg-slate-900 p-1 rounded-xl border border-slate-800 flex items-center gap-1">
            <button
              onClick={() => setAspectRatio("16_9")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${aspectRatio === "16_9" ? "bg-blue-600 text-white shadow-md" : "text-slate-400 hover:text-slate-200"}`}
            >
              <Monitor size={14} />
              16:9 Film
            </button>
            <button
              onClick={() => setAspectRatio("9_16")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${aspectRatio === "9_16" ? "bg-blue-600 text-white shadow-md" : "text-slate-400 hover:text-slate-200"}`}
            >
              <Smartphone size={14} />
              9:16 Reels
            </button>
          </div>

          {/* Sound Synthesizer */}
          <button
            onClick={() => {
              startAudio();
              setIsMuted(!isMuted);
            }}
            className={`p-2.5 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-bold ${!isMuted ? "bg-blue-600/10 border-blue-500/30 text-blue-400 hover:bg-blue-600/20" : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"}`}
          >
            {!isMuted ? (
              <Volume2 size={16} className="animate-bounce" />
            ) : (
              <VolumeX size={16} />
            )}
            <span className="hidden md:inline">
              {isMuted ? "Muted" : "Piano Synth Active"}
            </span>
          </button>
        </div>
      </header>

      {/* Main Theatrical Screen */}
      <main className="flex-1 flex flex-col lg:flex-row items-center justify-center p-4 sm:p-6 lg:p-8 gap-8 relative overflow-hidden bg-slate-980">
        {/* Glow backdrop */}
        <div className="absolute inset-0 bg-radial-gradient from-blue-900/10 via-transparent to-transparent opacity-50 pointer-events-none" />

        {/* Video Box */}
        <div className="flex-1 flex items-center justify-center w-full h-full max-h-[70vh] lg:max-h-none z-10">
          <div
            className={`relative overflow-hidden transition-all duration-500 ease-in-out border border-slate-800 shadow-2xl rounded-3xl bg-black flex items-center justify-center ${
              aspectRatio === "16_9"
                ? "w-full aspect-video max-w-4xl"
                : "h-[75vh] aspect-[9/16] max-w-md"
            }`}
          >
            {/* Ambient Rain Particles Layer (Scene 1, Scene 5, Scene 6) */}
            {(currentIdx === 0 || currentIdx === 4 || currentIdx === 5) && (
              <div className="absolute inset-0 z-20 pointer-events-none rain-overlay opacity-60">
                <div className="absolute inset-0 w-full h-full bg-[linear-gradient(to_bottom,rgba(255,255,255,0)_0%,rgba(255,255,255,0.08)_50%,rgba(255,255,255,0)_100%)] animate-rain bg-repeat bg-[size:40px_100px]" />
              </div>
            )}

            {/* Glowing borders for confirming states */}
            <div
              className={`absolute inset-0 z-15 pointer-events-none border-2 transition-all duration-700 ${
                currentIdx === 3
                  ? "border-blue-500/40 shadow-[inset_0_0_50px_rgba(37,99,235,0.25)] animate-pulse"
                  : currentIdx === 8
                    ? "border-white/30 shadow-[inset_0_0_80px_rgba(255,255,255,0.15)]"
                    : "border-transparent"
              }`}
            />

            {/* Slide animation */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIdx}
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1.0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                className="absolute inset-0 w-full h-full"
              >
                {/* Slow Camera Pan */}
                <motion.div
                  animate={
                    isPlaying
                      ? {
                          scale: [1.02, 1.06],
                          x: [0, currentIdx % 2 === 0 ? 8 : -8],
                          y: [0, currentIdx % 3 === 0 ? 6 : -6],
                        }
                      : { scale: 1.02 }
                  }
                  transition={{
                    duration: activeScene.duration,
                    ease: "linear",
                  }}
                  className="w-full h-full relative"
                >
                  <img
                    src={activeScene.image}
                    alt={activeScene.title}
                    className="w-full h-full object-cover select-none"
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80";
                    }}
                  />

                  {/* Cinematic black overlay vignette */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-black/30" />
                </motion.div>

                {/* Subtitle location badge */}
                <div className="absolute top-6 left-6 z-20">
                  <span className="text-[10px] tracking-[0.25em] text-blue-400 font-extrabold uppercase bg-slate-950/80 border border-slate-800 px-3 py-1 rounded-full backdrop-blur-md">
                    {activeScene.subtitle}
                  </span>
                </div>

                {/* Story overlay narration */}
                <div className="absolute top-20 left-6 right-6 z-20">
                  <motion.div
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 0.7 }}
                    className="text-xs font-bold text-slate-300 bg-black/40 backdrop-blur-xs px-3 py-1.5 rounded-lg max-w-max"
                  >
                    {activeScene.overlayText}
                  </motion.div>
                </div>

                {/* Dialogue Track Overlay (Subtitles) */}
                {activeScene.dialogue && (
                  <div className="absolute bottom-6 left-6 right-6 z-25 flex justify-center">
                    <motion.div
                      initial={{ y: 15, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2, duration: 0.4 }}
                      className="bg-black/75 border border-slate-800/80 backdrop-blur-md px-5 py-3 rounded-2xl max-w-xl text-center shadow-2xl"
                    >
                      <p className="text-sm font-semibold tracking-wide text-white leading-relaxed whitespace-pre-line">
                        {activeScene.dialogue}
                      </p>
                    </motion.div>
                  </div>
                )}

                {/* Interactive Simulated Overlays */}
                {/* Scene 1: Taxi price ₹3,850 */}
                {currentIdx === 0 && (
                  <div className="absolute top-24 right-6 z-20 flex flex-col gap-2">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 1 }}
                      className="bg-red-950/90 border border-red-900/40 backdrop-blur-md p-3 rounded-xl text-right text-xs"
                    >
                      <p className="text-red-400 font-extrabold uppercase tracking-wide text-[9px]">
                        🚍 Bus Booking
                      </p>
                      <p className="text-white font-extrabold text-xs">
                        No buses available
                      </p>
                    </motion.div>
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 1.6 }}
                      className="bg-slate-900/90 border border-slate-800/80 backdrop-blur-md p-3.5 rounded-xl text-right text-xs shadow-lg"
                    >
                      <p className="text-slate-400 font-extrabold uppercase tracking-wide text-[9px]">
                        🚖 Standard Taxi
                      </p>
                      <p className="text-red-400 font-black text-lg">₹3,850</p>
                    </motion.div>
                  </div>
                )}

                {/* Scene 3: Driver Details match card */}
                {currentIdx === 2 && (
                  <motion.div
                    initial={{ x: 35, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 1.2 }}
                    className="absolute top-24 right-6 bg-slate-900/95 border border-slate-800 p-3 rounded-2xl text-xs space-y-2.5 max-w-[210px] z-20 shadow-xl"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] bg-blue-500/10 border border-blue-500/30 text-blue-400 px-2 py-0.5 rounded-md font-bold uppercase">
                        Verified Driver
                      </span>
                      <span className="text-emerald-400 font-black">₹450</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-slate-800 overflow-hidden ring-1 ring-slate-700">
                        <img
                          src="/ad/ref_char2.png"
                          alt="Ravi"
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <div>
                        <div className="font-extrabold text-white text-[10px]">
                          Ravi (4.9★)
                        </div>
                        <div className="text-[8px] text-slate-400">
                          Tata Nexon • Blue
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Scene 7: Mother's SMS */}
                {currentIdx === 6 && (
                  <motion.div
                    initial={{ y: -30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1.2 }}
                    className="absolute top-24 left-6 right-6 bg-slate-900/95 border border-slate-800 p-3 rounded-xl backdrop-blur-md z-20 shadow-xl flex items-start gap-3"
                  >
                    <div className="p-1.5 bg-blue-600/10 rounded-lg text-blue-400">
                      <Shield size={16} />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="text-[10px] font-bold text-slate-400">
                        Safety Contact (Mother)
                      </div>
                      <div className="text-[10px] text-slate-100 bg-slate-950 p-2 rounded-lg border border-slate-850 font-mono">
                        &quot;Ashik started a RideLink trip. Follow live:{" "}
                        <span className="text-blue-400 underline font-bold">
                          rlnk.in/t/88f2b
                        </span>
                        &quot;
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Custom rain keyframes */}
            {(currentIdx === 0 || currentIdx === 4 || currentIdx === 5) && (
              <style jsx global>{`
                @keyframes rain-fall {
                  0% {
                    background-position: 0px 0px;
                  }
                  100% {
                    background-position: 40px 400px;
                  }
                }
                .animate-rain {
                  animation: rain-fall 0.8s linear infinite;
                }
              `}</style>
            )}
          </div>
        </div>

        {/* Sidebar Script Overview */}
        <div className="w-full lg:w-96 flex flex-col gap-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 z-10 self-stretch">
          <div className="space-y-1">
            <span className="text-[9px] tracking-wider text-blue-500 font-extrabold uppercase">
              Scene {activeScene.id} of {SCENES.length}
            </span>
            <h3 className="text-md font-black tracking-tight text-white flex items-center justify-between">
              {activeScene.title}
              <span className="text-[10px] text-slate-400 font-bold bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700">
                {activeScene.duration}s
              </span>
            </h3>
          </div>

          <div className="border-t border-slate-800 pt-4 flex-1 flex flex-col gap-4 overflow-hidden">
            <div className="space-y-1.5">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">
                Visuals & Context
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                {activeScene.description}
              </p>
            </div>

            {/* Timeline script tracker */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-1">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Interactive Timeline
              </span>
              <div className="space-y-1.5">
                {SCENES.map((scene, idx) => (
                  <button
                    key={scene.id}
                    onClick={() => {
                      setCurrentIdx(idx);
                      setProgress(0);
                      startAudio();
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-left border transition-all text-xs ${
                      idx === currentIdx
                        ? "bg-blue-600/10 border-blue-500/30 text-white font-bold shadow-sm"
                        : "bg-slate-950/40 border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-950/60"
                    }`}
                  >
                    <span className="truncate flex items-center gap-1.5">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${idx === currentIdx ? "bg-blue-500" : "bg-slate-700"}`}
                      />
                      S{scene.id}: {scene.title.split(": ")[1]}
                    </span>
                    <span className="text-[9px] opacity-60 font-mono">
                      {scene.duration}s
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Timeline slider & navigation */}
          <div className="border-t border-slate-800 pt-4 space-y-4">
            <div className="space-y-1">
              <div className="flex justify-between text-[9px] text-slate-500 font-extrabold uppercase">
                <span>Play Time</span>
                <span>{Math.round(getGlobalProgress())}%</span>
              </div>
              <div
                onClick={handleProgressClick}
                className="w-full h-1.5 bg-slate-800 rounded-full cursor-pointer relative overflow-hidden group"
              >
                <div
                  className="absolute h-full bg-blue-600 rounded-full"
                  style={{ width: `${getGlobalProgress()}%` }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-2.5">
              <button
                onClick={handlePrev}
                className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <ChevronLeft size={16} />
              </button>

              <button
                onClick={() => {
                  setIsPlaying(!isPlaying);
                  startAudio();
                }}
                className={`flex-1 py-3 px-4 rounded-xl font-extrabold text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2 ${
                  isPlaying
                    ? "bg-slate-800 border border-slate-700 text-white hover:bg-slate-750"
                    : "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20"
                }`}
              >
                {isPlaying ? (
                  <Pause size={14} fill="currentColor" />
                ) : (
                  <Play size={14} fill="currentColor" />
                )}
                {isPlaying ? "Pause" : "Play Ad"}
              </button>

              <button
                onClick={() => {
                  setProgress(0);
                  setCurrentIdx(0);
                  setIsPlaying(true);
                  startAudio();
                }}
                className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                title="Restart"
              >
                <RotateCcw size={16} />
              </button>

              <button
                onClick={handleNext}
                className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Standalone Footer */}
      <footer className="py-4 border-t border-slate-900 bg-slate-950 flex items-center justify-between px-8 text-xs text-slate-500 z-10">
        <div>
          RideLink Cinematic Short Film Advertisement &copy; 2026. All Rights
          Reserved.
        </div>
        <div className="flex items-center gap-2.5">
          <Sparkles size={12} className="text-blue-500 animate-pulse" />
          <span className="text-blue-500/80 font-bold uppercase tracking-widest text-[9px] px-2.5 py-0.5 border border-blue-500/25 rounded-md bg-blue-500/5">
            Netflix 4K HDR Mockup
          </span>
        </div>
      </footer>
    </div>
  );
}
