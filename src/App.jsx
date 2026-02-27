import { Routes, Route } from "react-router-dom";
import { useEffect, useRef } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";

const FLOATING_SYMBOLS = [
  { char: "✦", x: 8, y: 14, size: 19, delay: "0s" },
  { char: "✧", x: 18, y: 34, size: 22, delay: "0.6s" },
  { char: "✶", x: 27, y: 72, size: 18, delay: "1.1s" },
  { char: "✺", x: 42, y: 21, size: 20, delay: "0.4s" },
  { char: "✹", x: 58, y: 81, size: 18, delay: "1.4s" },
  { char: "✦", x: 74, y: 19, size: 24, delay: "0.9s" },
  { char: "✧", x: 84, y: 45, size: 20, delay: "1.7s" },
  { char: "✶", x: 92, y: 72, size: 16, delay: "0.2s" }
];

function App() {
  const symbolRefs = useRef([]);

  useEffect(() => {
    const radius = 180;

    const handlePointerMove = (event) => {
      document.documentElement.style.setProperty("--mx", `${event.clientX}px`);
      document.documentElement.style.setProperty("--my", `${event.clientY}px`);

      symbolRefs.current.forEach((el) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const dx = centerX - event.clientX;
        const dy = centerY - event.clientY;
        const distance = Math.hypot(dx, dy) || 1;

        if (distance < radius) {
          const force = (radius - distance) / radius;
          const offsetX = (dx / distance) * force * 24;
          const offsetY = (dy / distance) * force * 24;
          el.style.setProperty("--tx", `${offsetX}px`);
          el.style.setProperty("--ty", `${offsetY}px`);
          el.style.setProperty("--ts", `${1 + force * 0.22}`);
          el.style.setProperty("--tr", `${force * 12}deg`);
        } else {
          el.style.setProperty("--tx", "0px");
          el.style.setProperty("--ty", "0px");
          el.style.setProperty("--ts", "1");
          el.style.setProperty("--tr", "0deg");
        }
      });
    };

    const handlePointerLeave = () => {
      symbolRefs.current.forEach((el) => {
        if (!el) return;
        el.style.setProperty("--tx", "0px");
        el.style.setProperty("--ty", "0px");
        el.style.setProperty("--ts", "1");
        el.style.setProperty("--tr", "0deg");
      });
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerleave", handlePointerLeave);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, []);

  return (
    <div className="premium-shell min-h-screen">
      <div className="symbol-layer" aria-hidden="true">
        {FLOATING_SYMBOLS.map((item, index) => (
          <span
            key={`${item.char}-${index}`}
            ref={(el) => {
              symbolRefs.current[index] = el;
            }}
            className="floating-symbol"
            style={{
              left: `${item.x}%`,
              top: `${item.y}%`,
              fontSize: `${item.size}px`,
              animationDelay: item.delay
            }}
          >
            {item.char}
          </span>
        ))}
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
