import { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  twinkleSpeed: number;
  twinkleOffset: number;
  depth: number; // 0 = far/small parallax, 1 = near/strong parallax
  vx: number; // slow independent drift
  vy: number;
}

interface ShootingStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  length: number;
}

const Starfield = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const shootingStarsRef = useRef<ShootingStar[]>([]);
  const animationRef = useRef<number>();
  const mouseRef = useRef({ x: 0, y: 0 });
  const targetMouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initStars();
    };

    const initStars = () => {
      // Denser field than before for a fuller night-sky look.
      const starCount = Math.floor((canvas.width * canvas.height) / 2800);
      starsRef.current = [];

      for (let i = 0; i < starCount; i++) {
        const driftAngle = Math.random() * Math.PI * 2;
        const driftSpeed = prefersReducedMotion ? 0 : Math.random() * 0.035 + 0.008;

        starsRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 1.2 + 0.4,
          opacity: Math.random() * 0.5 + 0.3,
          twinkleSpeed: Math.random() * 0.02 + 0.005,
          twinkleOffset: Math.random() * Math.PI * 2,
          depth: Math.random(),
          vx: Math.cos(driftAngle) * driftSpeed,
          vy: Math.sin(driftAngle) * driftSpeed,
        });
      }
    };

    const maybeSpawnShootingStar = () => {
      if (prefersReducedMotion) return;
      // low, randomised chance each frame -> roughly one every several seconds
      if (Math.random() < 0.0025 && shootingStarsRef.current.length < 2) {
        const startX = Math.random() * canvas.width * 0.6 + canvas.width * 0.2;
        const angle = Math.PI / 6 + Math.random() * (Math.PI / 8); // downward-right
        const speed = 9 + Math.random() * 6;
        shootingStarsRef.current.push({
          x: startX,
          y: -20,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 0,
          maxLife: 60 + Math.random() * 20,
          length: 80 + Math.random() * 60,
        });
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      // normalised -1..1 from center
      targetMouseRef.current = {
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      };
    };

    const animate = (time: number) => {
      // ease the mouse position for a smooth parallax drift
      mouseRef.current.x += (targetMouseRef.current.x - mouseRef.current.x) * 0.04;
      mouseRef.current.y += (targetMouseRef.current.y - mouseRef.current.y) * 0.04;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      starsRef.current.forEach((star) => {
        // slow independent drift, wrapping around the edges of the screen
        star.x += star.vx;
        star.y += star.vy;
        if (star.x < -10) star.x = canvas.width + 10;
        if (star.x > canvas.width + 10) star.x = -10;
        if (star.y < -10) star.y = canvas.height + 10;
        if (star.y > canvas.height + 10) star.y = -10;

        const twinkle = Math.sin(time * star.twinkleSpeed + star.twinkleOffset);
        const currentOpacity = Math.max(0.05, Math.min(1, star.opacity + twinkle * 0.3));

        // stars further along "depth" shift more with the cursor -> parallax
        const parallaxStrength = star.depth * 14;
        const px = star.x + mouseRef.current.x * parallaxStrength;
        const py = star.y + mouseRef.current.y * parallaxStrength;

        ctx.beginPath();
        ctx.arc(px, py, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${currentOpacity})`;
        ctx.fill();
      });

      maybeSpawnShootingStar();

      shootingStarsRef.current = shootingStarsRef.current.filter((s) => s.life < s.maxLife);
      shootingStarsRef.current.forEach((s) => {
        s.x += s.vx;
        s.y += s.vy;
        s.life += 1;

        const fadeIn = Math.min(1, s.life / 8);
        const fadeOut = Math.min(1, (s.maxLife - s.life) / 15);
        const alpha = Math.min(fadeIn, fadeOut);

        const dist = Math.hypot(s.vx, s.vy) || 1;
        const tailX = s.x - (s.vx / dist) * s.length;
        const tailY = s.y - (s.vy / dist) * s.length;

        const gradient = ctx.createLinearGradient(s.x, s.y, tailX, tailY);
        gradient.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1.4;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();

        // bright head of the shooting star
        ctx.beginPath();
        ctx.arc(s.x, s.y, 1.3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.fill();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    if (!prefersReducedMotion) {
      window.addEventListener('mousemove', handleMouseMove);
    }
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return <canvas ref={canvasRef} className="starfield-canvas" />;
};

export default Starfield;
