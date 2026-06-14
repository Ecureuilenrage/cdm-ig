// Classifieur de journée — le cerveau du moteur « 3 posts/jour ». À partir du calendrier
// football-data, dit pour un jour J (jour de PUBLICATION) : quels matchs raconter en recap
// (J-1), quels matchs teaser en preview (J), si c'est un jour de match ou un jour creux, et
// à quel round du tournoi on est. Tout fail-soft (API down / pas de clé → dayType 'unknown').

import { fetchMatchesRange, editorialDay, addDays, teamName } from './footballdata.mjs';

// libellés humains des stages football-data
const STAGE_LABEL = {
  GROUP_STAGE: 'Group stage',
  LAST_32: 'Round of 32',
  LAST_16: 'Round of 16',
  QUARTER_FINALS: 'Quarter-finals',
  SEMI_FINALS: 'Semi-finals',
  THIRD_PLACE: 'Third-place play-off',
  FINAL: 'Final',
};
export const stageLabel = (stage) => STAGE_LABEL[stage] || (stage ? String(stage) : '—');

const ko = (m) => `${new Date(m.utcDate).toISOString().slice(11, 16)} UTC`;
const matchup = (m) => ({ home: teamName(m.homeTeam), away: teamName(m.awayTeam), kickoff: ko(m), stage: m.stage, status: m.status });

// classifyDay(J) → état de la journée de publication J.
//   recap   : matchs TERMINÉS de J-1 (à raconter le matin)
//   preview : matchs programmés de J (à teaser le soir)
//   dayType : 'match' (au moins un match J-1 ou J) | 'rest' (rien) | 'unknown' (API indispo)
//   stage   : round du tournoi (preview prioritaire, sinon recap)
export async function classifyDay(date) {
  const recapDate = addDays(date, -1);
  let all = [];
  try {
    // fenêtre J-1 → J+2 : couvre le recap (J-1), la preview (J) et le débord UTC des soirées.
    all = await fetchMatchesRange(recapDate, addDays(date, 2));
  } catch (e) {
    return { date, recapDate, recap: [], preview: [], dayType: 'unknown', stage: null, error: e.message };
  }

  const byDay = (d) => all.filter((m) => editorialDay(m.utcDate) === d);
  const recapMatches = byDay(recapDate).filter((m) => m.status === 'FINISHED');
  const previewMatches = byDay(date);

  const dayType = recapMatches.length || previewMatches.length ? 'match' : 'rest';
  const stageOf = (arr) => arr.find((m) => m.stage)?.stage || null;
  const stage = stageOf(previewMatches) || stageOf(recapMatches) || null;

  return {
    date,
    recapDate,
    recap: recapMatches.map(matchup),
    preview: previewMatches.map(matchup),
    dayType,
    stage,
    all,
  };
}
