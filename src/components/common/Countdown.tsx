import { useEffect, useMemo, useRef, useState } from "react";

import "./Countdown.css";

interface CountdownProps {
  seconds: number;
  isRunning: boolean;
  onTick?: (remaining: number) => void;
  onComplete?: () => void;
}

function formatSeconds(total: number): string {
  const safe = Math.max(0, total);
  const minutes = Math.floor(safe / 60);
  const rest = safe % 60;

  return `${minutes.toString().padStart(2, "0")}:${rest.toString().padStart(2, "0")}`;
}

export function Countdown({
  seconds,
  isRunning,
  onTick,
  onComplete,
}: CountdownProps) {
  const [remaining, setRemaining] = useState(Math.max(0, seconds));
  const completedRunRef = useRef(false);

  useEffect(() => {
    setRemaining(Math.max(0, seconds));
    completedRunRef.current = false;
  }, [seconds]);

  useEffect(() => {
    if (!isRunning || remaining <= 0) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setRemaining((current) => (current > 0 ? current - 1 : 0));
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [isRunning, remaining]);

  useEffect(() => {
    onTick?.(remaining);
  }, [remaining, onTick]);

  useEffect(() => {
    if (!isRunning || remaining > 0 || completedRunRef.current) {
      return;
    }

    completedRunRef.current = true;
    onComplete?.();
  }, [isRunning, remaining, onComplete]);

  const statusClass = useMemo(() => {
    if (remaining <= 10) {
      return "countdown--urgent";
    }

    if (remaining <= 20) {
      return "countdown--warning";
    }

    return "countdown--calm";
  }, [remaining]);

  return (
    <div className={`countdown ${statusClass}`}>
      <strong className="countdown__value">{formatSeconds(remaining)}</strong>
    </div>
  );
}
