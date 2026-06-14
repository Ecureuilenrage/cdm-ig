// Construit le 3e post « quiz » des jours de match, DÉTERMINISTE et 100% tiré de facts.json
// (aucune trivia inventée). Format : slide quiz (question + options) → stat-card (réponse
// révélée) → stat-card bonus (un chiffre du jour) → cta. Le LLM (enrichQuiz) raffine ensuite
// la copie dans la voix de marque. Si ESPN est absent (pas d'events), repli sur une question
// de score.

const cleanMinute = (m) => String(m).replace(/'\+/, '+'); // "90'+4'" → "90+4'"
const baseMinute = (m) => parseInt(String(m), 10) || 0;

// 2 distracteurs plausibles (pas des claims — juste des minutes leurres), déterministes.
const DECOYS = [9, 23, 38, 54, 67, 79, 88];
function minuteOptions(answerMin, answerDisplay) {
  const decoys = DECOYS.filter((x) => Math.abs(x - answerMin) >= 5 && x !== answerMin).slice(0, 2);
  const all = [{ v: answerMin, label: answerDisplay, correct: true }, ...decoys.map((x) => ({ v: x, label: `${x}'`, correct: false }))];
  all.sort((a, b) => a.v - b.v);
  return { options: all.map((o) => o.label), answerIndex: all.findIndex((o) => o.correct) };
}

// signature : carton → Vera (rouge), sinon Numa (bleu, les chiffres).
const signatureFor = (slate) => (slate.some((m) => (m.events?.redCount || 0) > 0) ? { character: 'vera', accent: 'red' } : { character: 'numa', accent: 'blue' });

export function buildQuizDoc(facts, { matchday = 'N' } = {}) {
  const slate = facts.matches || [];
  const featured = slate.find((m) => m.featured) || slate[0] || null;
  const sig = signatureFor(slate);
  const md = matchday;

  // total de buts sur la journée — un « bonus number » toujours factuel
  const totalGoals = slate.reduce((s, m) => s + (m.score?.home ?? 0) + (m.score?.away ?? 0), 0);
  const totalReds = slate.reduce((s, m) => s + (m.events?.redCount || 0), 0);

  let quizSlide, revealSlide;
  const goals = featured?.events?.goals || [];

  if (featured && goals.length) {
    const g = goals[goals.length - 1]; // le dernier but : le plus dramatique
    const display = cleanMinute(g.minute);
    const { options, answerIndex } = minuteOptions(baseMinute(g.minute), display);
    const letters = ['A', 'B', 'C', 'D'];
    const og = g.kind === 'own-goal';
    quizSlide = {
      type: 'quiz',
      kicker: `Quiz · matchday ${md}`,
      question: `${featured.home} ${featured.score.home}–${featured.score.away} ${featured.away}. What minute did the *last* goal go in?`,
      options,
      prompt: 'Swipe for the answer →',
      pose: 'pointing',
      accent: sig.accent,
      character: sig.character,
    };
    revealSlide = {
      type: 'stat-card',
      kicker: `Answer: ${letters[answerIndex]}`,
      value: display,
      unit: og ? `${g.scorer} (o.g.)` : g.scorer,
      context: `${g.scorer} ${og ? 'turned it into his own net' : 'made it count'} — ${featured.home} ${featured.score.home}–${featured.score.away} ${featured.away}.`,
      pose: 'shocked',
      accent: sig.accent,
    };
  } else if (featured) {
    // repli sans events : question de score
    const { home, away, score } = featured;
    const winner = score.home > score.away ? home : score.away > score.home ? away : 'Nobody';
    quizSlide = {
      type: 'quiz',
      kicker: `Quiz · matchday ${md}`,
      question: `${home} v ${away}. Who *won*?`,
      options: [home, 'A draw', away],
      prompt: 'Swipe for the answer →',
      pose: 'pointing',
      accent: sig.accent,
      character: sig.character,
    };
    revealSlide = {
      type: 'stat-card',
      kicker: 'Answer',
      value: `${score.home}–${score.away}`,
      unit: winner === 'Nobody' ? 'honours even' : `${winner} take it`,
      context: `Full time: ${home} ${score.home}–${score.away} ${away}.`,
      pose: 'shocked',
      accent: sig.accent,
    };
  } else {
    // aucun match exploitable — quiz minimal
    quizSlide = {
      type: 'quiz', kicker: `Quiz · matchday ${md}`,
      question: 'TODO — question tirée des faits du jour', options: [],
      prompt: 'Swipe for the answer →', pose: 'pointing', accent: sig.accent, character: sig.character,
    };
    revealSlide = { type: 'stat-card', kicker: 'Answer', value: '—', unit: 'TODO', context: 'TODO', accent: sig.accent };
  }

  const bonusSlide = {
    type: 'stat-card',
    kicker: 'One more for the board',
    value: String(totalReds > 0 ? totalReds : totalGoals),
    unit: totalReds > 0 ? `red card${totalReds > 1 ? 's' : ''} on the day` : `goals across ${slate.length} game${slate.length > 1 ? 's' : ''}`,
    context: totalReds > 0
      ? `${totalReds} sent off across the slate. Vera kept the file open.`
      : `${totalGoals} goals in ${slate.length} match${slate.length > 1 ? 'es' : ''}. Numa counted every one.`,
    accent: sig.accent,
  };

  return {
    matchDate: facts.matchDate,
    title: `Matchday ${md} — quiz`,
    slides: [
      quizSlide,
      revealSlide,
      bonusSlide,
      {
        type: 'cta',
        text: 'One illustrated story. *Every matchday.*',
        note: 'How many did you get? Tell us below.',
        pose: 'pointing',
        accent: sig.accent,
      },
    ],
  };
}
