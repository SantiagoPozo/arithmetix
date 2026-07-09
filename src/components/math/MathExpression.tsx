import { useEffect, useRef } from "react";

const MATHJAX_SCRIPT_ID = "arithmetix-mathjax";
const MATHJAX_SRC =
  "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js";

declare global {
  interface Window {
    MathJax?: {
      tex?: {
        inlineMath?: string[][];
        displayMath?: string[][];
      };
      typesetClear?: (elements?: HTMLElement[]) => void;
      typesetPromise?: (elements?: HTMLElement[]) => Promise<void>;
      startup?: {
        promise?: Promise<void>;
      };
    };
    __arithmetixMathJaxLoader?: Promise<void>;
  }
}

function ensureMathJax(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.resolve();
  }

  if (window.MathJax?.typesetPromise) {
    return window.MathJax.startup?.promise ?? Promise.resolve();
  }

  if (window.__arithmetixMathJaxLoader) {
    return window.__arithmetixMathJaxLoader;
  }

  window.MathJax = {
    tex: {
      inlineMath: [
        ["$", "$"],
        ["\\(", "\\)"],
      ],
      displayMath: [
        ["$$", "$$"],
        ["\\[", "\\]"],
      ],
    },
    startup: {
      promise: Promise.resolve(),
    },
  };

  window.__arithmetixMathJaxLoader = new Promise((resolve, reject) => {
    const existingScript = document.getElementById(MATHJAX_SCRIPT_ID);

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener(
        "error",
        () => reject(new Error("MathJax script failed to load.")),
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    script.id = MATHJAX_SCRIPT_ID;
    script.async = true;
    script.src = MATHJAX_SRC;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("MathJax script failed to load."));

    document.head.appendChild(script);
  });

  return window.__arithmetixMathJaxLoader;
}

interface MathExpressionProps {
  expression: string;
  block?: boolean;
  className?: string;
}

export function MathExpression({
  expression,
  block = true,
  className,
}: MathExpressionProps) {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;

    const typesetExpression = async () => {
      try {
        await ensureMathJax();

        if (!isMounted || !elementRef.current) {
          return;
        }

        window.MathJax?.typesetClear?.([elementRef.current]);
        await window.MathJax?.typesetPromise?.([elementRef.current]);
      } catch {
        // If MathJax fails to load, plain text expression stays visible.
      }
    };

    void typesetExpression();

    return () => {
      isMounted = false;
    };
  }, [expression]);

  const content = block ? `$$${expression}$$` : `\\(${expression}\\)`;

  return (
    <div className={className} ref={elementRef}>
      {content}
    </div>
  );
}
