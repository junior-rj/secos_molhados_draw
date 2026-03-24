export const isPairRepeated = (p1, p2, historyPairs) => {
  return historyPairs.some(match =>
    (match.player1 === p1 && match.player2 === p2) ||
    (match.player1 === p2 && match.player2 === p1)
  );
};

export const validateFemaleDraw = (isFirstRound, presentFemales, femaleGroupA, femaleGroupB) => {
  if (isFirstRound) {
    return presentFemales.length >= 2 && presentFemales.length % 2 === 0;
  }
  return femaleGroupA.length >= 1 && femaleGroupA.length === femaleGroupB.length;
};

export const validateMaleDraw = (isFirstRound, presentMales, maleGroupA, maleGroupB) => {
  if (isFirstRound) {
    return presentMales.length >= 2 && presentMales.length % 2 === 0;
  }
  return maleGroupA.length >= 1 && maleGroupA.length === maleGroupB.length;
};

export const togglePlayerPresence = (player, group, setGroup) => {
  if (group.includes(player)) {
    setGroup(group.filter(p => p !== player));
  } else {
    setGroup([...group, player]);
  }
};

export const assignGroup = (player, targetGroup, setGrpA, setGrpB, grpA, grpB) => {
  if (targetGroup === 'A') {
    if (!grpA.includes(player)) setGrpA([...grpA, player]);
    if (grpB.includes(player)) setGrpB(grpB.filter(p => p !== player));
  } else if (targetGroup === 'B') {
    if (!grpB.includes(player)) setGrpB([...grpB, player]);
    if (grpA.includes(player)) setGrpA(grpA.filter(p => p !== player));
  } else {
    if (grpA.includes(player)) setGrpA(grpA.filter(p => p !== player));
    if (grpB.includes(player)) setGrpB(grpB.filter(p => p !== player));
  }
};
