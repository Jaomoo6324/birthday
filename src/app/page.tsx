'use client';
import { useState, useEffect, useRef } from 'react';
import CandleHint from './component/CandleHint';

export default function Home() {
  const [lit, setLit] = useState(false);
  const prevLitRef = useRef(false); // ใช้เก็บค่าก่อนหน้า

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const musicRef = useRef<HTMLAudioElement | null>(null);

  const playMusic = () => {
    if (!musicRef.current) {
      const music = new Audio('/music/birthday.mp3');
      music.loop = true;
      music.volume = 0.8;
      music.play().catch(err => console.error('เล่นเพลงไม่สำเร็จ:', err));
      musicRef.current = music;
    } else {
      musicRef.current.play().catch(err => console.error('เล่นเพลงไม่สำเร็จ:', err));
    }
  };

  const stopMusic = () => {
    if (musicRef.current) {
      musicRef.current.pause();
      musicRef.current.currentTime = 0;
      musicRef.current = null;
    }
  };

  // ฟังก์ชันเริ่มฟังเสียงเป่า
  const startListening = async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      if (audioContextRef.current) {
        await audioContextRef.current.close();
        audioContextRef.current = null;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;

      const mic = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 512;
      mic.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const detectBlow = () => {
        analyser.getByteFrequencyData(dataArray);
        const volume = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;

        if (volume > 150) {
          setLit(false); // ดับไฟเทียน
          if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
          }
          if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
          }
        } else {
          animationRef.current = requestAnimationFrame(detectBlow);
        }
      };

      detectBlow();
    } catch (err) {
      console.error('Microphone error:', err);
    }
  };

  useEffect(() => {
    startListening();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  // โค้ดวาดพลุลง canvas
  useEffect(() => {
        if (lit) {
          playMusic();
        } else {
          stopMusic();
           // ถ้า lit เปลี่ยนจาก true ➜ false (คือ "เป่า")
          if (prevLitRef.current === true && lit === false) {
            startFireworks();
          }     
        }
  }, [lit]);

  // ฟังก์ชันพลุแบบง่าย ๆ
  const startFireworks = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    if (!ctx) return;

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    let fireworks: Firework[] = [];
    let particles: Particle[] = [];

    class Firework {
      x: number;
      y: number;
      targetY: number;
      speed: number;
      exploded: boolean;

      constructor() {
        this.x = Math.random() * width;
        this.y = height;
        this.targetY = Math.random() * height / 2 + height / 4;
        this.speed = 5 + Math.random() * 3;
        this.exploded = false;
      }

      update() {
        this.y -= this.speed;
        if (this.y <= this.targetY && !this.exploded) {
          this.exploded = true;
          explode(this.x, this.y);
        }
      }

      draw() {

        if (!this.exploded) {
          ctx.beginPath();
          ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
          ctx.fillStyle = 'white';
          ctx.fill();
        }
      }
    }

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      alpha: number;
      color: string;

      constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        const angle = Math.random() * 2 * Math.PI;
        const speed = Math.random() * 5 + 2;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.alpha = 1;
        this.color = `hsl(${Math.random() * 360}, 100%, 50%)`;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.1; // gravity
        this.alpha -= 0.02;
      }

      draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.restore();
      }
    }

    const explode = (x: number, y: number) => {
      for (let i = 0; i < 30; i++) {
        particles.push(new Particle(x, y));
      }
    };

    // สร้างพลุเริ่มต้น 10 ดอก
    for (let i = 0; i < 10; i++) {
      fireworks.push(new Firework());
    }

    let frame = 0;
    const maxFrames = 200;

    const animate = () => {
      frame++;

      fireworks.forEach((f, i) => {
        f.update();
        f.draw();
        if (f.exploded) {
          fireworks.splice(i, 1);
        }
      });

      particles.forEach((p, i) => {
        p.update();
        if (p.alpha <= 0) {
          particles.splice(i, 1);
        } else {
          p.draw();
        }
      });

      if (frame < maxFrames) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, width, height);
      }
    };

    animate();
  };

  return (
    <>
    <CandleHint lit={lit} />
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          pointerEvents: 'none',
          width: '100%',
          height: '100%',
          zIndex: 9999,
        }}
      ></canvas>

      <div className="birthday-container" style={{ position: 'relative', zIndex: 1 }}>
      
        <div
          className="cake"
          onClick={() => {
            if (!lit) {
              setLit(true);   // จุดเทียนใหม่
              startListening(); // เริ่มฟังเสียงใหม่

            }
          }}
          style={{ cursor: 'pointer' }}
        >
          {[...Array(7)].map((_, i) => (
            <div
              key={i}
              className="candle"
              style={{ left: `${(i + 1) * 12}%` }}
            >
              {lit && <div className="fuego"></div>}
            </div>
          ))}
          <div className="icing"></div>
        </div>

        <h2> HAPPY BIRTHDAY 🎉</h2>
        <p>🐇 PIGKA PLOY 👸🏻</p>
        <p>19 ขวบแล้ววว</p>
      </div>
    </>
  );
}
