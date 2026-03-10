import React, { useEffect, useRef } from 'react';

const ParticleBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: Particle[] = [];
    let animationFrameId: number;
    let mouse = { x: -1000, y: -1000, radius: 180 };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };
    window.addEventListener('resize', resize);
    
    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    const handleMouseLeave = () => { mouse.x = -1000; mouse.y = -1000; };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseout', handleMouseLeave);

    class Particle {
      x: number; y: number; baseVx: number; baseVy: number; intVx: number; intVy: number; size: number;

      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        // Constant drift velocity that never slows down
        this.baseVx = (Math.random() - 0.5) * 1.2; 
        this.baseVy = (Math.random() - 0.5) * 1.2;
        // Interactive velocity (for mouse attraction)
        this.intVx = 0;
        this.intVy = 0;
        this.size = Math.random() * 2 + 1.5;
      }

      update() {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Mouse attraction affects ONLY interactive velocity
        if (distance < mouse.radius) {
            const force = (mouse.radius - distance) / mouse.radius;
            this.intVx += (dx / distance) * force * 0.8;
            this.intVy += (dy / distance) * force * 0.8;
        }

        // Friction only applies to the mouse pull, so they return to normal floating
        this.intVx *= 0.90;
        this.intVy *= 0.90;

        // Position = constant drift + mouse pull
        this.x += this.baseVx + this.intVx;
        this.y += this.baseVy + this.intVy;

        // Wrap around screen
        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 212, 255, 0.8)';
        ctx.shadowBlur = 12;
        ctx.shadowColor = '#00D4FF';
        ctx.fill();
      }
    }

    const initParticles = () => {
      particles = [];
      const count = window.innerWidth < 768 ? 60 : 150;
      for (let i = 0; i < count; i++) particles.push(new Particle());
    };

    const animate = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
        
        for (let j = i; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < 100) {
                ctx.beginPath();
                ctx.strokeStyle = `rgba(0, 212, 255, ${0.3 * (1 - distance / 100)})`;
                ctx.lineWidth = 1;
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
            }
        }
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    resize();
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseout', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full -z-10 bg-[#FAFAFA]" style={{ background: 'linear-gradient(135deg, #FFFFFF 0%, #F0F9FF 50%, #F5F3FF 100%)' }}>
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
};

export default ParticleBackground;
