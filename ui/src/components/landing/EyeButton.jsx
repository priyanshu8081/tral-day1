import { useRef, useEffect } from 'react';
import '../../styles/EyeButton.css';

/* ── Single eyeball that tracks cursor / touch ── */
const EyeSocket = ({ socketRef }) => (
    <div ref={socketRef} className="eye-btn__socket">
        <div className="eye-btn__pupil" />
    </div>
);

/* ── Shared pupil-move logic ─────────────────────
   Works for both mouse (clientX/Y) and touch
   (touches[0].clientX/Y) events.
─────────────────────────────────────────────────── */
const movePupils = (refs, clientX, clientY) => {
    refs.forEach((ref) => {
        if (!ref.current) return;
        const rect  = ref.current.getBoundingClientRect();
        const cx    = rect.left + rect.width  / 2;
        const cy    = rect.top  + rect.height / 2;
        const angle = Math.atan2(clientY - cy, clientX - cx);
        const dist  = Math.min(4, Math.hypot(clientX - cx, clientY - cy) * 0.18);
        const pupil = ref.current.querySelector('.eye-btn__pupil');
        if (pupil) {
            pupil.style.transform =
                `translate(calc(-50% + ${Math.cos(angle) * dist}px), calc(-50% + ${Math.sin(angle) * dist}px))`;
        }
    });
};

/* ── Reusable EyeButton ──────────────────────────
   Props:
     label     – button text
     loading   – disables + shows loading label
     loadLabel – text shown while loading
     className – extra class for host button
     type      – button type (default "submit")
─────────────────────────────────────────────────── */
const EyeButton = ({
    label     = 'Submit',
    loading   = false,
    loadLabel = 'Please wait…',
    className = '',
    type      = 'submit',
}) => {
    const eyeL = useRef(null);
    const eyeR = useRef(null);

    useEffect(() => {
        // ── Mouse (desktop) ──────────────────────
        const onMouseMove = (e) => movePupils([eyeL, eyeR], e.clientX, e.clientY);

        // ── Touch (mobile / tablet) ──────────────
        const onTouchMove = (e) => {
            // prevent page scroll only when inside button area
            const touch = e.touches[0];
            movePupils([eyeL, eyeR], touch.clientX, touch.clientY);
        };

        // ── Touch start — eyes snap instantly ────
        const onTouchStart = (e) => {
            const touch = e.touches[0];
            movePupils([eyeL, eyeR], touch.clientX, touch.clientY);
        };

        // ── Touch end — pupils return to center ──
        const onTouchEnd = () => {
            [eyeL, eyeR].forEach((ref) => {
                if (!ref.current) return;
                const pupil = ref.current.querySelector('.eye-btn__pupil');
                if (pupil) pupil.style.transform = 'translate(-50%, -50%)';
            });
        };

        window.addEventListener('mousemove',  onMouseMove,  { passive: true });
        window.addEventListener('touchmove',  onTouchMove,  { passive: true });
        window.addEventListener('touchstart', onTouchStart, { passive: true });
        window.addEventListener('touchend',   onTouchEnd,   { passive: true });

        return () => {
            window.removeEventListener('mousemove',  onMouseMove);
            window.removeEventListener('touchmove',  onTouchMove);
            window.removeEventListener('touchstart', onTouchStart);
            window.removeEventListener('touchend',   onTouchEnd);
        };
    }, []);

    return (
        <button disabled={loading} type={type} className={`eye-btn ${className}`}>
            {/* two eyes */}
            <div className="eye-btn__eyes">
                <EyeSocket socketRef={eyeL} />
                <EyeSocket socketRef={eyeR} />
            </div>
            {/* label */}
            <span>{loading ? loadLabel : label}</span>
        </button>
    );
};

export default EyeButton;
