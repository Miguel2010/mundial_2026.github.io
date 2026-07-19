export function normalizeParticipantName(participante: string) {
  return participante
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLocaleLowerCase('es');
}

export const orderParticipantsByRanking = <Participant>(
  participants: Participant[],
  ranking: string[],
  currentParticipant: string,
  getParticipantName: (participant: Participant) => string,
) => {
  const normalizedCurrentParticipant = normalizeParticipantName(currentParticipant);
  const rankingByParticipant = new Map(
    ranking.map((participant, index) => [normalizeParticipantName(participant), index]),
  );

  return [...participants].sort((left, right) => {
    const normalizedLeft = normalizeParticipantName(getParticipantName(left));
    const normalizedRight = normalizeParticipantName(getParticipantName(right));
    const isLeftCurrentParticipant = normalizedLeft === normalizedCurrentParticipant;
    const isRightCurrentParticipant = normalizedRight === normalizedCurrentParticipant;

    if (isLeftCurrentParticipant !== isRightCurrentParticipant) {
      return isLeftCurrentParticipant ? -1 : 1;
    }

    const leftRanking = rankingByParticipant.get(normalizedLeft) ?? Number.MAX_SAFE_INTEGER;
    const rightRanking = rankingByParticipant.get(normalizedRight) ?? Number.MAX_SAFE_INTEGER;

    return leftRanking - rightRanking;
  });
};
