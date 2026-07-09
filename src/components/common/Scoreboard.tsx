import "./Scoreboard.css";

interface ScoreboardProps {
  title: string;
  scoreLabel: string;
  correctLabel: string;
  wrongLabel: string;
  score: number;
  correctCount: number;
  wrongCount: number;
}

export function Scoreboard({
  title,
  scoreLabel,
  correctLabel,
  wrongLabel,
  score,
  correctCount,
  wrongCount,
}: ScoreboardProps) {
  return (
    <section aria-label={title} className="scoreboard">
      <p className="scoreboard__title">{title}</p>

      <div className="scoreboard__grid">
        <article className="scoreboard__stat scoreboard__stat--score">
          <span className="scoreboard__label">{scoreLabel}</span>
          <strong className="scoreboard__value">{score}</strong>
        </article>

        <article className="scoreboard__stat scoreboard__stat--correct">
          <span className="scoreboard__label">{correctLabel}</span>
          <strong className="scoreboard__value">{correctCount}</strong>
        </article>

        <article className="scoreboard__stat scoreboard__stat--wrong">
          <span className="scoreboard__label">{wrongLabel}</span>
          <strong className="scoreboard__value">{wrongCount}</strong>
        </article>
      </div>
    </section>
  );
}
