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

export const handleGroupCheckbox = (player, group, setGrpA, setGrpB, grpA, grpB) => {
  if (group === 'A') {
    if (grpA.includes(player)) {
      setGrpA(grpA.filter(p => p !== player));
    } else {
      setGrpA([...grpA, player]);
      setGrpB(grpB.filter(p => p !== player));
    }
  } else {
    if (grpB.includes(player)) {
      setGrpB(grpB.filter(p => p !== player));
    } else {
      setGrpB([...grpB, player]);
      setGrpA(grpA.filter(p => p !== player));
    }
  }
};

export const calculateDrawStats = (isFirstRound, pool, poolA, poolB, currentPair, historyPairs) => {
  let tempPool = [...pool];
  let tempPoolA = [...poolA];
  let tempPoolB = [...poolB];

  if (currentPair.length > 0) {
    if (isFirstRound) {
      tempPool.push(...currentPair);
    } else {
      tempPoolA.push(currentPair[0]);
      if (currentPair.length > 1) {
        tempPoolB.push(currentPair[1]);
      }
    }
  }

  let totalPossible = 0;
  let alreadyPlayed = 0;

  if (isFirstRound) {
    const n = tempPool.length;
    totalPossible = (n * (n - 1)) / 2;
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        if (isPairRepeated(tempPool[i], tempPool[j], historyPairs)) {
          alreadyPlayed++;
        }
      }
    }
  } else {
    const nA = tempPoolA.length;
    const nB = tempPoolB.length;
    totalPossible = nA * nB;
    for (let i = 0; i < nA; i++) {
      for (let j = 0; j < nB; j++) {
        if (isPairRepeated(tempPoolA[i], tempPoolB[j], historyPairs)) {
          alreadyPlayed++;
        }
      }
    }
  }

  return {
    totalPossible,
    alreadyPlayed,
    uniqueAvailable: totalPossible - alreadyPlayed
  };
};