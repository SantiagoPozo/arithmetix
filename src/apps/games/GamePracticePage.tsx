import { useMemo, useState } from "react";
import type { FormEvent } from "react";

import { type GameId } from "@/apps/games/routes";
import { GameHeader } from "@/apps/games/GameHeader";
import { Button } from "@/components/common/Button";
import { Container } from "@/components/common/Container";
import { Countdown } from "@/components/common/Countdown";
import { Scoreboard } from "@/components/common/Scoreboard";
import { MathExpression } from "@/components/math/MathExpression";
import { useI18n } from "@/i18n/useI18n";

import "./GamePracticePage.css";

interface GamePracticePageProps {
  locale: "es" | "en";
  gameId: GameId;
  defaultRoundSeconds?: number;
}

const MIN_SECONDS = 5;
const MAX_SECONDS = 3600;
const DEFAULT_SECONDS = 60;

interface Challenge {
  expression: string;
  solution: number;
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function initialChallengeFor(gameId: GameId): Challenge {
  if (gameId === "equations") {
    return { expression: "x = 0", solution: 0 };
  }

  return { expression: "1 - 1", solution: 0 };
}

function nextChallengeFor(gameId: GameId): Challenge {
  if (gameId === "integer") {
    const left = randomInt(-12, 12);
    const right = randomInt(-12, 12);
    const operation = Math.random() > 0.5 ? "+" : "-";

    if (operation === "+") {
      return {
        expression: `${left} + ${right}`,
        solution: left + right,
      };
    }

    return {
      expression: `${left} - (${right})`,
      solution: left - right,
    };
  }

  if (gameId === "equations") {
    const x = randomInt(-9, 9);
    const a = randomInt(1, 9);
    const b = randomInt(-9, 9);
    const c = a * x + b;
    const bSign = b < 0 ? "-" : "+";

    return {
      expression: `${a}x ${bSign} ${Math.abs(b)} = ${c}`,
      solution: x,
    };
  }

  const a = randomInt(2, 10);
  const b = randomInt(2, 8);
  const c = randomInt(2, 9);
  const d = randomInt(1, c - 1);

  return {
    expression: `${a} + ${b}\\times(${c} - ${d})`,
    solution: a + b * (c - d),
  };
}

function normalizeAnswer(rawAnswer: string): string {
  return rawAnswer
    .trim()
    .replace(/^x\s*=\s*/i, "")
    .replace(",", ".");
}

export function GamePracticePage({
  locale,
  gameId,
  defaultRoundSeconds = DEFAULT_SECONDS,
}: GamePracticePageProps) {
  const { t } = useI18n(["games"]);

  const [activeSeconds, setActiveSeconds] = useState(defaultRoundSeconds);
  const [runId, setRunId] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [challenge, setChallenge] = useState<Challenge>(
    initialChallengeFor(gameId),
  );

  const pageTitleKey = `games:pages.${gameId}.title`;
  const pageSubtitleKey = `games:pages.${gameId}.subtitle`;
  const pageDate = useMemo(
    () =>
      new Date().toLocaleDateString(locale === "es" ? "es-ES" : "en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    [locale],
  );

  const startRound = () => {
    const safeSeconds = Math.min(
      MAX_SECONDS,
      Math.max(MIN_SECONDS, defaultRoundSeconds),
    );

    setActiveSeconds(safeSeconds);
    setRunId((current) => current + 1);
    setIsRunning(true);
    setFeedback(null);
    setAnswer("");
    setChallenge(nextChallengeFor(gameId));
  };

  const handleRoundComplete = () => {
    setIsRunning(false);
    setFeedback(t("games:status.timeUp"));
  };

  const handleSubmitAnswer = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isRunning) {
      return;
    }

    const parsedAnswer = Number.parseFloat(normalizeAnswer(answer));

    if (Number.isNaN(parsedAnswer)) {
      setFeedback(t("games:feedback.invalid"));
      return;
    }

    const isCorrect = Math.abs(parsedAnswer - challenge.solution) < 0.000001;

    if (isCorrect) {
      setScore((current) => current + 1);
      setCorrectCount((current) => current + 1);
      setFeedback(t("games:feedback.correct"));
    } else {
      setScore((current) => current - 2);
      setWrongCount((current) => current + 1);
      setFeedback(
        t("games:feedback.incorrect", { solution: challenge.solution }),
      );
    }

    setAnswer("");
    setChallenge(nextChallengeFor(gameId));
  };

  return (
    <main className="game-page">
      <GameHeader gameId={gameId} locale={locale} />

      <section className="game-page__title-block">
        <h1>{t(pageTitleKey)}</h1>
        <p>{t(pageSubtitleKey)}</p>
      </section>

      <section className="game-page__grid">
        <Container className="game-page__timer" variant="soft">
          <h2>{t("games:timer.title")}</h2>

          <Button onClick={startRound}>{t("games:timer.start")}</Button>

          <Countdown
            key={runId}
            isRunning={isRunning}
            onComplete={handleRoundComplete}
            seconds={activeSeconds}
          />

          <Scoreboard
            correctCount={correctCount}
            correctLabel={t("games:scoreboard.correct")}
            score={score}
            scoreLabel={t("games:scoreboard.score")}
            title={t("games:scoreboard.title")}
            wrongCount={wrongCount}
            wrongLabel={t("games:scoreboard.wrong")}
          />
        </Container>

        <Container className="game-page__workspace">
          <h2>{t("games:workspace.challengeTitle")}</h2>

          <MathExpression
            className="game-page__formula"
            expression={challenge.expression}
          />

          <form
            className="game-page__answer-form"
            onSubmit={handleSubmitAnswer}
          >
            <label className="game-page__label" htmlFor="challenge-answer">
              {t("games:workspace.answerLabel")}
            </label>
            <input
              className="game-page__input"
              disabled={!isRunning}
              id="challenge-answer"
              onChange={(event) => setAnswer(event.target.value)}
              placeholder={t("games:workspace.answerPlaceholder")}
              value={answer}
            />
            <Button disabled={!isRunning} type="submit">
              {t("games:workspace.submit")}
            </Button>
          </form>

          <p className="game-page__feedback" role="status">
            {feedback ?? t("games:feedback.waiting")}
          </p>
        </Container>
      </section>

      <footer className="game-page__footer">
        <span>{t("games:footer.copyright")}</span>
        <a
          href="https://creativecommons.org/licenses/by-nc-sa/4.0/deed.es"
          rel="noreferrer"
          target="_blank"
        >
          {t("games:footer.license")}
        </a>
        <span>{pageDate}</span>
      </footer>
    </main>
  );
}
