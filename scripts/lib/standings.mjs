// 3e post des jours CREUX : « état du tournoi » tiré des classements football-data
// (/standings) + top buteur. Déterministe et factuel (des chiffres). Fail-soft : si les
// classements sont indisponibles (ex. en pleine phase à élimination directe), renvoie null
// et l'orchestrateur retombe sur un evergreen.

import { fetchStandings, fetchScorers, teamName } from './footballdata.mjs';

export async function buildStandingsThird(date, { matchday } = {}) {
  let standings = [];
  try {
    standings = await fetchStandings();
  } catch {
    return null;
  }

  // tables de groupe (type TOTAL). On agrège les chiffres du tournoi à ce stade.
  const tables = standings.filter((s) => (s.type === 'TOTAL' || !s.type) && Array.isArray(s.table));
  const rows = tables.flatMap((s) => s.table);
  if (!rows.length) return null;

  const totalGoals = rows.reduce((a, r) => a + (r.goalsFor || 0), 0);
  const totalPlayed = Math.round(rows.reduce((a, r) => a + (r.playedGames || 0), 0) / 2);
  const goalAvg = totalPlayed ? (totalGoals / totalPlayed).toFixed(1) : '0';

  // le leader le plus en vue : plus de points, puis meilleure différence de buts
  const leader = [...rows].sort((a, b) =>
    (b.points || 0) - (a.points || 0) || (b.goalDifference || 0) - (a.goalDifference || 0)
  )[0];

  let topScorer = null;
  try {
    const sc = await fetchScorers(1);
    topScorer = sc[0] || null;
  } catch {}

  const slides = [
    {
      type: 'stat-card',
      kicker: 'The tournament so far',
      value: String(totalGoals),
      unit: 'goals and counting',
      context: `${totalPlayed} matches in, ${goalAvg} goals a game. The board stays busy.`,
      pose: 'shocked',
      accent: 'blue',
    },
  ];

  if (topScorer) {
    slides.push({
      type: 'stat-card',
      kicker: 'Leading the charts',
      value: String(topScorer.goals),
      unit: topScorer.player?.name || 'top scorer',
      context: `${topScorer.player?.name || 'The leader'} (${teamName(topScorer.team)}) is out in front for goals.`,
      pose: 'celebrating',
      accent: 'blue',
    });
  }

  if (leader) {
    slides.push({
      type: 'stat-card',
      kicker: 'Top of the pile',
      value: `${leader.points}`,
      unit: 'points',
      context: `${teamName(leader.team)} set the pace — ${leader.won}W ${leader.draw}D ${leader.lost}L so far.`,
      accent: 'orange',
      pose: 'pointing',
    });
  }

  slides.push({
    type: 'cta',
    text: 'One illustrated story. *Every matchday.*',
    note: 'Back to the matches soon.',
    pose: 'pointing',
    accent: 'blue',
  });

  const caption = `CAPTION

The tournament so far, by the numbers.
● ${totalGoals} goals in ${totalPlayed} matches (${goalAvg} a game)
${topScorer ? `● ${topScorer.player?.name} leads the scoring on ${topScorer.goals}\n` : ''}● ${leader ? `${teamName(leader.team)} top the standings on ${leader.points}` : ''}
Who's your dark horse? Tell us below.
#ScribblePitch #FootballNumbers #TournamentSoFar #IllustratedFootball
`;

  return {
    doc: {
      matchDate: date,
      title: `Tournament state — ${date}`,
      slides,
    },
    caption,
  };
}
