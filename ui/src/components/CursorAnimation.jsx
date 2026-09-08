import { useEffect, useRef } from 'react';
import './CursorAnimation.css';

const CursorAnimation = () => {
  const cursorRef = useRef(null);
  const followerRef = useRef(null);
  const trailsRef = useRef([]);
  const posRef = useRef({ x: 0, y: 0 });
  const followerPosRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    const follower = followerRef.current;

    // Create trail dots
    const TRAIL_COUNT = 8;
    const trails = [];
    for (let i = 0; i < TRAIL_COUNT; i++) {
      const trail = document.createElement('div');
      trail.className = 'cursor-trail';
      trail.style.opacity = (1 - i / TRAIL_COUNT) * 0.5;
      trail.style.transform = `scale(${1 - (i / TRAIL_COUNT) * 0.6})`;
      document.body.appendChild(trail);
      trails.push({ el: trail, x: 0, y: 0 });
    }
    trailsRef.current = trails;

    const handleMouseMove = (e) => {
      posRef.current = { x: e.clientX, y: e.clientY };
      if (cursor) {
        cursor.style.left = `${e.clientX}px`;
        cursor.style.top  = `${e.clientY}px`;
      }
    };

    const handleMouseDown = () => {
      cursor?.classList.add('cursor--click');
      follower?.classList.add('follower--click');
    };

    const handleMouseUp = () => {
      cursor?.classList.remove('cursor--click');
      follower?.classList.remove('follower--click');
    };

    const handleMouseEnterLink = () => {
      cursor?.classList.add('cursor--hover');
      follower?.classList.add('follower--hover');
    };

    const handleMouseLeaveLink = () => {
      cursor?.classList.remove('cursor--hover');
      follower?.classList.remove('follower--hover');
    };

    const updateInteractiveListeners = () => {
      const interactives = document.querySelectorAll(
        'a, button, input, select, textarea, [role="button"], label'
      );
      interactives.forEach((el) => {
        el.addEventListener('mouseenter', handleMouseEnterLink);
        el.addEventListener('mouseleave', handleMouseLeaveLink);
      });
      return interactives;
    };

    let interactiveElements = updateInteractiveListeners();

    const animate = () => {
      const lerp = (a, b, t) => a + (b - a) * t;

      followerPosRef.current.x = lerp(followerPosRef.current.x, posRef.current.x, 0.12);
      followerPosRef.current.y = lerp(followerPosRef.current.y, posRef.current.y, 0.12);

      if (follower) {
        follower.style.left = `${followerPosRef.current.x}px`;
        follower.style.top  = `${followerPosRef.current.y}px`;
      }

      for (let i = trails.length - 1; i > 0; i--) {
        trails[i].x = lerp(trails[i].x, trails[i - 1].x, 0.35);
        trails[i].y = lerp(trails[i].y, trails[i - 1].y, 0.35);
        trails[i].el.style.left = `${trails[i].x}px`;
        trails[i].el.style.top  = `${trails[i].y}px`;
      }
      if (trails[0]) {
        trails[0].x = lerp(trails[0].x, posRef.current.x, 0.5);
        trails[0].y = lerp(trails[0].y, posRef.current.y, 0.5);
        trails[0].el.style.left = `${trails[0].x}px`;
        trails[0].el.style.top  = `${trails[0].y}px`;
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    animate();
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup',   handleMouseUp);

    const observer = new MutationObserver(() => {
      interactiveElements.forEach((el) => {
        el.removeEventListener('mouseenter', handleMouseEnterLink);
        el.removeEventListener('mouseleave', handleMouseLeaveLink);
      });
      interactiveElements = updateInteractiveListeners();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup',   handleMouseUp);
      cancelAnimationFrame(rafRef.current);
      observer.disconnect();
      trails.forEach((t) => t.el.remove());
    };
  }, []);

  return (
    <>
      <div ref={cursorRef}   className="cursor-dot" />
      <div ref={followerRef} className="cursor-follower" />
    </>
  );
};

export default CursorAnimation;
