import { useState, useEffect } from "react";
import { Fab, Zoom } from "@mui/material";
import { KeyboardArrowUp } from "@mui/icons-material";

export function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);

    return () => {
      window.removeEventListener("scroll", toggleVisibility);
    };
  }, []);

  const scrollToTop = () => {
    const duration = 800;
    const start = window.scrollY;
    const startTime = performance.now();

    const easeInOutCubic = (t: number) => {
      return t < 0.5
        ? 4 * t * t * t
        : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
    };

    const scroll = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easing = easeInOutCubic(progress);

      window.scrollTo(0, start * (1 - easing));

      if (progress < 1) {
        requestAnimationFrame(scroll);
      }
    };

    requestAnimationFrame(scroll);
  };

  return (
    <Zoom in={isVisible}>
      <Fab
        onClick={scrollToTop}
        color="primary"
        size="medium"
        aria-label="voltar ao topo"
        sx={{
          position: "fixed",
          bottom: 32,
          right: 32,
          zIndex: 1000,
          boxShadow: 3,
          "&:hover": {
            transform: "scale(1.1)",
          },
          transition: "all 0.3s ease",
        }}
      >
        <KeyboardArrowUp />
      </Fab>
    </Zoom>
  );
}
