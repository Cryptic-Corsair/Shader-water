import { useEffect, useRef } from 'react';
import { prefersReducedMotion } from '../../lib/motion';
import {
  computeBreezeTilt,
  computeSoundModulation,
  createDustMotes,
  createMistWisps,
  createRainStreaks,
  createSeededRandom,
  createWaterRipples,
  stepWaterRipple,
  type DustMote,
  type MistWisp,
  type RainStreak,
  type WaterRipple,
} from './heroAtmosphereMath';

export interface RippleImpulse {
  xRatio: number;
  yRatio: number;
  id: number;
}

export interface HeroMonsoonCanvasProps {
  soundActive: boolean;
  pointerTargetRef: React.RefObject<{ x: number; y: number }>;
  rippleImpulseRef?: React.RefObject<RippleImpulse | null>;
}

const WISP_COLORS: Record<MistWisp['tone'], [number, number, number]> = {
  amber: [223, 188, 145], // #DFBC91
  cloud: [198, 190, 180], // #C6BEB4
  mist: [178, 194, 212],  // #B2C2D4
};

function createGlowSprite(
  size: number,
  stops: Array<[number, string]>
): HTMLCanvasElement {
  const off = document.createElement('canvas');
  off.width = size;
  off.height = size;
  const octx = off.getContext('2d');
  if (octx) {
    const half = size / 2;
    const grad = octx.createRadialGradient(half, half, 0, half, half, half);
    for (const [offset, color] of stops) {
      grad.addColorStop(offset, color);
    }
    octx.fillStyle = grad;
    octx.fillRect(0, 0, size, size);
  }
  return off;
}

export function HeroMonsoonCanvas({
  soundActive,
  pointerTargetRef,
  rippleImpulseRef,
}: HeroMonsoonCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const soundActiveRef = useRef(soundActive);
  soundActiveRef.current = soundActive;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const reduced = prefersReducedMotion();
    let width = 0;
    let height = 0;
    let streaks: RainStreak[] = [];
    let motes: DustMote[] = [];
    let ripples: WaterRipple[] = [];
    const interactiveRipples: WaterRipple[] = [];
    let lastImpulseId = -1;
    const wisps = createMistWisps();
    const rippleRand = createSeededRandom(9012);

    // Pre-bake radial mist & mote sprites once (zero per-frame gradient allocations)
    const wispSprites: Record<MistWisp['tone'], HTMLCanvasElement> = {
      amber: createGlowSprite(256, [
        [0, `rgba(${WISP_COLORS.amber.join(',')}, 1)`],
        [0.52, `rgba(${WISP_COLORS.amber.join(',')}, 0.42)`],
        [1, `rgba(${WISP_COLORS.amber.join(',')}, 0)`],
      ]),
      cloud: createGlowSprite(256, [
        [0, `rgba(${WISP_COLORS.cloud.join(',')}, 1)`],
        [0.52, `rgba(${WISP_COLORS.cloud.join(',')}, 0.42)`],
        [1, `rgba(${WISP_COLORS.cloud.join(',')}, 0)`],
      ]),
      mist: createGlowSprite(256, [
        [0, `rgba(${WISP_COLORS.mist.join(',')}, 1)`],
        [0.52, `rgba(${WISP_COLORS.mist.join(',')}, 0.42)`],
        [1, `rgba(${WISP_COLORS.mist.join(',')}, 0)`],
      ]),
    };

    const moteSprite = createGlowSprite(64, [
      [0, 'rgba(246, 244, 239, 1)'],
      [0.45, 'rgba(223, 188, 145, 0.55)'],
      [1, 'rgba(223, 188, 145, 0)'],
    ]);

    const smoothPointer = { x: 0, y: 0 };
    let soundBlend = soundActiveRef.current ? 1 : 0;
    let inView = true;
    let rafId = 0;
    let lastTs = performance.now();

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      width = Math.max(320, Math.round(rect.width));
      height = Math.max(420, Math.round(rect.height));

      canvas.width = width;
      canvas.height = height;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(1, 0, 0, 1, 0, 0);

      const rainCount = width < 768 ? 28 : 48;
      const moteCount = width < 768 ? 14 : 24;
      const rippleCount = width < 768 ? 5 : 8;
      streaks = createRainStreaks(rainCount, width, height, 2024);
      motes = createDustMotes(moteCount, width, height, 1971);
      ripples = createWaterRipples(rippleCount, width, height, 777);
    };

    const drawHorizonWaves = (timeSec: number, mistShiftX: number) => {
      const waveConfigs = [
        { yBase: height * 0.77, amp: 11, freq: 0.0042, speed: 0.42, alpha: 0.08, color: '223, 188, 145' },
        { yBase: height * 0.83, amp: 14, freq: 0.0034, speed: -0.31, alpha: 0.07, color: '178, 194, 212' },
        { yBase: height * 0.89, amp: 9, freq: 0.0052, speed: 0.25, alpha: 0.06, color: '246, 244, 239' },
      ];

      const step = Math.max(28, Math.round(width / 28));
      for (const cfg of waveConfigs) {
        ctx.beginPath();
        for (let x = 0; x <= width + step; x += step) {
          const y =
            cfg.yBase +
            Math.sin(x * cfg.freq + timeSec * cfg.speed + mistShiftX * 0.015) *
              cfg.amp +
            Math.cos(x * cfg.freq * 0.55 - timeSec * 0.22) * (cfg.amp * 0.45);
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.strokeStyle = `rgba(${cfg.color}, ${cfg.alpha * (1 + 0.35 * soundBlend)})`;
        ctx.lineWidth = 1.25;
        ctx.stroke();
      }
    };

    const drawRippleSet = (list: WaterRipple[], isInteractive: boolean) => {
      for (const r of list) {
        const life = 1 - Math.min(1, r.radius / r.maxRadius);
        if (life <= 0.01) continue;
        const alpha = r.alpha * life * (isInteractive ? 1.45 : 1 + 0.28 * soundBlend);
        const rx = r.radius;
        const ry = r.radius * 0.24;

        ctx.beginPath();
        ctx.ellipse(r.x, r.y, rx, ry, 0, 0, Math.PI * 2);
        ctx.strokeStyle =
          r.tone === 'amber'
            ? `rgba(223, 188, 145, ${Math.min(0.65, alpha)})`
            : `rgba(246, 244, 239, ${Math.min(0.55, alpha)})`;
        ctx.lineWidth = isInteractive ? 1.25 : 0.9;
        ctx.stroke();

        // Inner harmonic echo ring
        if (rx > 16) {
          ctx.beginPath();
          ctx.ellipse(r.x, r.y, rx * 0.62, ry * 0.62, 0, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(246, 244, 239, ${Math.min(0.38, alpha * 0.55)})`;
          ctx.lineWidth = 0.65;
          ctx.stroke();
        }
      }
    };

    const drawFrame = (nowTs: number, animate: boolean) => {
      const dt = Math.min(0.05, Math.max(0.001, (nowTs - lastTs) / 1000));
      lastTs = nowTs;
      const timeSec = nowTs / 1000;

      // Consume any interactive click/tap ripple impulse
      const impulse = rippleImpulseRef?.current;
      if (impulse && impulse.id !== lastImpulseId) {
        lastImpulseId = impulse.id;
        interactiveRipples.push({
          x: impulse.xRatio * width,
          y: Math.max(height * 0.52, impulse.yRatio * height),
          radius: 6,
          maxRadius: 96,
          speed: 58,
          alpha: 0.46,
          tone: 'amber',
        });
        if (interactiveRipples.length > 6) {
          interactiveRipples.shift();
        }
      }

      const targetPtr = pointerTargetRef.current ?? { x: 0, y: 0 };
      smoothPointer.x += (targetPtr.x - smoothPointer.x) * 0.06;
      smoothPointer.y += (targetPtr.y - smoothPointer.y) * 0.06;

      const targetSound = soundActiveRef.current ? 1 : 0;
      soundBlend += (targetSound - soundBlend) * 0.04;

      const breeze = computeBreezeTilt(smoothPointer.x, smoothPointer.y);
      const soundMod = computeSoundModulation(timeSec, true);
      const mistScale = 1 + (soundMod.mistScale - 1) * soundBlend;
      const moteBoost = 1 + (soundMod.moteAlphaBoost - 1) * soundBlend;
      const velocityFactor =
        0.86 + (soundMod.rainVelocityFactor - 0.86) * soundBlend;

      ctx.clearRect(0, 0, width, height);

      // 1. Volumetric Cloud & Mist Wisps (cached sprite blitting)
      for (const wisp of wisps) {
        const driftX = animate
          ? Math.sin(timeSec * wisp.driftSpeedX + wisp.phase) * 34
          : 0;
        const driftY = animate
          ? Math.cos(timeSec * wisp.driftSpeedY + wisp.phase) * 20
          : 0;
        const cx =
          wisp.xRatio * width +
          driftX +
          breeze.mistShiftX * (0.7 + wisp.phase * 0.1);
        const cy =
          wisp.yRatio * height +
          driftY +
          breeze.mistShiftY * (0.7 + wisp.phase * 0.1);
        const radius = Math.max(width, height) * wisp.radiusRatio * mistScale;
        const alpha = Math.min(0.32, wisp.baseAlpha * (1 + 0.22 * soundBlend));

        ctx.globalAlpha = alpha;
        ctx.drawImage(
          wispSprites[wisp.tone],
          cx - radius,
          cy - radius,
          radius * 2,
          radius * 2
        );
      }

      ctx.globalAlpha = 1;

      // 2. Caustic Horizon Light Waves across lower dusk plane
      drawHorizonWaves(animate ? timeSec : 0, breeze.mistShiftX);

      // 3. Expanding Concentric Raindrop Ripples (organic + pointer-triggered)
      if (animate) {
        for (let i = 0; i < ripples.length; i += 1) {
          ripples[i] = stepWaterRipple(
            ripples[i],
            dt,
            width,
            height,
            rippleRand
          );
        }
        for (let i = interactiveRipples.length - 1; i >= 0; i -= 1) {
          interactiveRipples[i].radius += interactiveRipples[i].speed * dt;
          if (interactiveRipples[i].radius >= interactiveRipples[i].maxRadius) {
            interactiveRipples.splice(i, 1);
          }
        }
      }
      drawRippleSet(ripples, false);
      drawRippleSet(interactiveRipples, true);

      // 4. Out-of-focus Diagonal Monsoon Rain Streaks (varying depth-of-field)
      const cosA = Math.cos(breeze.angleRad);
      const sinA = Math.sin(breeze.angleRad);
      ctx.lineCap = 'round';

      for (const s of streaks) {
        if (animate) {
          const step = s.speed * velocityFactor * dt;
          s.y += step * cosA;
          s.x += step * sinA;

          if (s.y - s.length > height + 20) {
            s.y = -s.length - 10;
            s.x = ((s.x + width + 180) % (width + 160)) - 80;
          }
          if (s.x < -120) s.x += width + 160;
          if (s.x > width + 120) s.x -= width + 160;
        }

        const x2 = s.x - sinA * s.length;
        const y2 = s.y - cosA * s.length;
        ctx.strokeStyle =
          s.depth > 0.72 && s.x > width * 0.45
            ? 'rgba(223, 188, 145, 1)'
            : 'rgba(246, 244, 239, 1)';
        ctx.globalAlpha = Math.min(0.42, s.opacity * (1 + 0.24 * soundBlend));
        ctx.lineWidth = s.width;
        ctx.beginPath();
        ctx.moveTo(x2, y2);
        ctx.lineTo(s.x, s.y);
        ctx.stroke();
      }

      // 5. Floating Luminous Dust & Dawn Motes (cached sprite blitting)
      for (const m of motes) {
        if (animate) {
          m.y += m.speedY * dt;
          m.x +=
            (m.speedX + breeze.mistShiftX * 0.25 * (0.4 + m.depth)) * dt;

          if (m.y < -12) m.y = height + 12;
          if (m.x < -12) m.x = width + 12;
          if (m.x > width + 12) m.x = -12;
        }

        const twinkle = 0.65 + 0.35 * Math.sin(timeSec * 1.4 + m.phase);
        const alpha = Math.min(0.68, m.alpha * twinkle * moteBoost);
        const haloR = m.radius * (2.6 + 0.6 * soundBlend);

        ctx.globalAlpha = alpha;
        ctx.drawImage(
          moteSprite,
          m.x - haloR,
          m.y - haloR,
          haloR * 2,
          haloR * 2
        );
      }

      ctx.globalAlpha = 1;
    };

    resize();

    if (reduced) {
      drawFrame(performance.now(), false);
      window.addEventListener('resize', resize);
      return () => {
        window.removeEventListener('resize', resize);
      };
    }

    const observer =
      typeof IntersectionObserver !== 'undefined'
        ? new IntersectionObserver(
            ([entry]) => {
              inView = entry.isIntersecting;
            },
            { threshold: 0.01 }
          )
        : null;

    if (observer) {
      observer.observe(canvas);
    }

    let lastDrawTs = 0;
    const tick = (nowTs: number) => {
      if (inView && !document.hidden) {
        if (nowTs - lastDrawTs >= 24) {
          lastDrawTs = nowTs;
          drawFrame(nowTs, true);
        }
      } else {
        lastTs = nowTs;
      }
      rafId = window.requestAnimationFrame(tick);
    };

    lastTs = performance.now();
    rafId = window.requestAnimationFrame(tick);
    window.addEventListener('resize', resize);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      observer?.disconnect();
    };
  }, [pointerTargetRef, rippleImpulseRef]);

  return (
    <canvas
      ref={canvasRef}
      data-testid="hero-monsoon-canvas"
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}
