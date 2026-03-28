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

  if (currentPair.length === 1) {
      if (isFirstRound) {
          tempPool.push(currentPair[0]);
      } else {
          tempPoolA.push(currentPair[0]);
      }
  }

  let validEdges = 0;
  let matchCount = 0;
  let validPartnersForCurrent = 0;

  if (isFirstRound) {
      const n = tempPool.length;
      const adj = Array(n).fill(0).map(() => []);
      for(let i=0; i<n; i++) {
          for(let j=i+1; j<n; j++) {
              if(!isPairRepeated(tempPool[i], tempPool[j], historyPairs)) {
                  validEdges++;
                  adj[i].push(j);
                  adj[j].push(i);
                  
                  if (currentPair.length === 1) {
                      if (tempPool[i] === currentPair[0] || tempPool[j] === currentPair[0]) {
                          validPartnersForCurrent++;
                      }
                  }
              }
          }
      }
      
      let visited = Array(n).fill(false);
      let nodes = tempPool.map((_, i) => i).sort((a, b) => adj[a].length - adj[b].length);
      for(let u of nodes) {
         if(!visited[u]) {
            let bestV = -1;
            let minDeg = Infinity;
            for(let v of adj[u]) {
               if(!visited[v] && adj[v].length < minDeg) {
                  bestV = v;
                  minDeg = adj[v].length;
               }
            }
            if(bestV !== -1) {
               visited[u] = true;
               visited[bestV] = true;
               matchCount++;
            }
         }
      }
      const neededPairs = Math.floor(n / 2);
      return {
          validCombinations: validEdges,
          repeatedPairsNeeded: Math.max(0, neededPairs - matchCount),
          validPartnersForCurrent: currentPair.length === 1 ? validPartnersForCurrent : null
      };
  } else {
      const nA = tempPoolA.length;
      const nB = tempPoolB.length;
      const adj = Array(nA).fill(0).map(() => []);
      for(let i=0; i<nA; i++) {
          for(let j=0; j<nB; j++) {
              if(!isPairRepeated(tempPoolA[i], tempPoolB[j], historyPairs)) {
                  validEdges++;
                  adj[i].push(j);
                  if (currentPair.length === 1 && tempPoolA[i] === currentPair[0]) {
                      validPartnersForCurrent++;
                  }
              }
          }
      }

      const match = Array(nB).fill(-1);
      const dfs = (u, visited) => {
         for(let v of adj[u]) {
            if(!visited[v]) {
               visited[v] = true;
               if(match[v] === -1 || dfs(match[v], visited)) {
                  match[v] = u;
                  return true;
               }
            }
         }
         return false;
      };
      for(let i=0; i<nA; i++) {
         const visited = Array(nB).fill(false);
         if (dfs(i, visited)) matchCount++;
      }

      const neededPairs = Math.min(nA, nB);
      return {
          validCombinations: validEdges,
          repeatedPairsNeeded: Math.max(0, neededPairs - matchCount),
          validPartnersForCurrent: currentPair.length === 1 ? validPartnersForCurrent : null
      };
  }
};