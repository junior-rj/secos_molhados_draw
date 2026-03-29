import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';

import { Header, LoadingScreen } from './components/Shared';
import Auth from './components/Auth';
import History from './components/History';
import Setup from './components/Setup';
import Draw from './components/Draw';
import Review from './components/Review';
import { validateFemaleDraw, validateMaleDraw, calculateDrawStats } from './utils/logic';

export default function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [femaleRoster, setFemaleRoster] = useState([]);
  const [maleRoster, setMaleRoster] = useState([]);

  const [isFirstRound, setIsFirstRound] = useState(true);

  const [presentFemales, setPresentFemales] = useState([]);
  const [presentMales, setPresentMales] = useState([]);
  const [femaleGroupA, setFemaleGroupA] = useState([]);
  const [femaleGroupB, setFemaleGroupB] = useState([]);
  const [maleGroupA, setMaleGroupA] = useState([]);
  const [maleGroupB, setMaleGroupB] = useState([]);

  const [appStage, setAppStage] = useState('setup'); 

  const [pool, setPool] = useState([]);
  const [poolA, setPoolA] = useState([]);
  const [poolB, setPoolB] = useState([]);

  const [currentPair, setCurrentPair] = useState([]);
  const [historyPairs, setHistoryPairs] = useState([]);
  const [sessionPairs, setSessionPairs] = useState([]);
  
  const [selectedHistorySession, setSelectedHistorySession] = useState('');
  const [sessionTimestamp, setSessionTimestamp] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);

  const resetSystemState = () => {
    setEmail('');
    setPassword('');
    setIsFirstRound(true);
    setPresentFemales([]);
    setPresentMales([]);
    setFemaleGroupA([]);
    setFemaleGroupB([]);
    setMaleGroupA([]);
    setMaleGroupB([]);
    setAppStage('setup');
    setPool([]);
    setPoolA([]);
    setPoolB([]);
    setCurrentPair([]);
    setSessionPairs([]);
    setSelectedHistorySession('');
    setSessionTimestamp('');
    setIsAnimating(false);
  };

  const handleToggleFirstRound = (value) => {
    setIsFirstRound(value);
    setPresentFemales([]);
    setPresentMales([]);
    setFemaleGroupA([]);
    setFemaleGroupB([]);
    setMaleGroupA([]);
    setMaleGroupB([]);
  };

  const goBackToSetup = () => {
    setAppStage('setup');
    setSessionPairs([]);
    setCurrentPair([]);
    setPool([]);
    setPoolA([]);
    setPoolB([]);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const historySnapshot = await getDocs(collection(db, "drawHistory"));
        const pairs = [];
        historySnapshot.forEach((documentSnapshot) => {
          pairs.push(documentSnapshot.data());
        });
        
        pairs.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        
        setHistoryPairs(pairs);

        const playersSnapshot = await getDocs(collection(db, "players"));
        const females = [];
        const males = [];
        playersSnapshot.forEach((documentSnapshot) => {
          const data = documentSnapshot.data();
          if (data.gender === "F") females.push(data.name);
          if (data.gender === "M") males.push(data.name);
        });
        setFemaleRoster(females.sort());
        setMaleRoster(males.sort());
      } catch (error) {
        console.error("Erro ao buscar dados", error);
      } finally {
        setIsLoading(false);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchData();
      } else {
        resetSystemState();
        setIsLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      alert("Falha na autenticacao. Verifique as credenciais e tente novamente.");
    }
  };

  const startDrawFemale = () => {
    const ts = new Date().toISOString();
    setSessionTimestamp(ts);
    setSessionPairs([]);
    setCurrentPair([]);

    if (isFirstRound) {
      setPool([...presentFemales]);
    } else {
      setPoolA([...femaleGroupA]);
      setPoolB([...femaleGroupB]);
    }
    setAppStage('drawFemale');
  };

  const startDrawMale = () => {
    const ts = new Date().toISOString();
    setSessionTimestamp(ts);
    setSessionPairs([]);
    setCurrentPair([]);

    if (isFirstRound) {
      setPool([...presentMales]);
    } else {
      setPoolA([...maleGroupA]);
      setPoolB([...maleGroupB]);
    }
    setAppStage('drawMale');
  };

  const handleDrawSequence = (playerNumber) => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsAnimating(false);
      if (playerNumber === 1) {
        if (isFirstRound) {
          const randomIndex = Math.floor(Math.random() * pool.length);
          const p1 = pool[randomIndex];
          setCurrentPair([p1]);
          setPool(pool.filter(p => p !== p1));
        } else {
          const randomIndex = Math.floor(Math.random() * poolA.length);
          const p1 = poolA[randomIndex];
          setCurrentPair([p1]);
          setPoolA(poolA.filter(p => p !== p1));
        }
      } else {
        if (isFirstRound) {
          const randomIndex = Math.floor(Math.random() * pool.length);
          const p2 = pool[randomIndex];
          setCurrentPair([...currentPair, p2]);
          setPool(pool.filter(p => p !== p2));
        } else {
          const randomIndex = Math.floor(Math.random() * poolB.length);
          const p2 = poolB[randomIndex];
          setCurrentPair([...currentPair, p2]);
          setPoolB(poolB.filter(p => p !== p2));
        }
      }
    }, 1500);
  };

  const confirmPair = () => {
    const newPairData = { 
      player1: currentPair[0], 
      player2: currentPair[1], 
      timestamp: new Date().toISOString(),
      sessionTimestamp: sessionTimestamp,
      date: new Date().toLocaleDateString('pt-BR'),
      gender: appStage === 'drawFemale' ? 'F' : 'M'
    };
    
    setSessionPairs([...sessionPairs, newPairData]);
    setCurrentPair([]);

    if (isFirstRound) {
      if (pool.length === 0) setAppStage(appStage === 'drawFemale' ? 'reviewFemale' : 'reviewMale');
    } else {
      if (poolA.length === 0) setAppStage(appStage === 'drawFemale' ? 'reviewFemale' : 'reviewMale');
    }
  };

  const cancelPair = () => {
    if (isFirstRound) setPool([...pool, currentPair[0], currentPair[1]].filter(Boolean));
    else {
      setPoolA([...poolA, currentPair[0]].filter(Boolean));
      if (currentPair.length > 1) setPoolB([...poolB, currentPair[1]]);
    }
    setCurrentPair([]);
  };

  const saveTournament = async () => {
    setIsLoading(true);
    try {
      const isFemale = appStage === 'reviewFemale';
      const sessionData = {
        timestamp: sessionTimestamp,
        date: new Date().toLocaleDateString('pt-BR'),
        gender: isFemale ? 'F' : 'M',
        isFirstRound: isFirstRound,
      };
      
      if (isFirstRound) {
        sessionData.presentPlayers = isFemale ? presentFemales : presentMales;
      } else {
        sessionData.groupA = isFemale ? femaleGroupA : maleGroupA;
        sessionData.groupB = isFemale ? femaleGroupB : maleGroupB;
      }
      
      await addDoc(collection(db, "drawSessions"), sessionData);

      for (const pair of sessionPairs) {
        await addDoc(collection(db, "drawHistory"), pair);
      }

      setHistoryPairs([...historyPairs, ...sessionPairs]);

      if (isFemale) {
        setPresentFemales([]);
        setFemaleGroupA([]);
        setFemaleGroupB([]);
      } else {
        setPresentMales([]);
        setMaleGroupA([]);
        setMaleGroupB([]);
      }
      
      alert("Torneio confirmado e salvo com sucesso!");
      setAppStage('setup');
    } catch (err) {
      console.error("Erro ao salvar", err);
      alert("Erro ao salvar torneio.");
    }
    setIsLoading(false);
  };

  const discardTournament = () => {
    setSessionPairs([]);
    setCurrentPair([]);
    setAppStage('setup');
  };

  const handleDeleteByDate = async (dateToDelete) => {
    setIsLoading(true);
    try {
      const historySnapshot = await getDocs(collection(db, "drawHistory"));
      const sessionSnapshot = await getDocs(collection(db, "drawSessions"));

      const deletePromises = [];

      historySnapshot.forEach(documentSnapshot => {
        const data = documentSnapshot.data();
        const docDate = data.date || new Date(data.timestamp).toLocaleDateString('pt-BR');
        if (docDate === dateToDelete) {
          deletePromises.push(deleteDoc(doc(db, "drawHistory", documentSnapshot.id)));
        }
      });

      sessionSnapshot.forEach(documentSnapshot => {
        const data = documentSnapshot.data();
        const docDate = data.date || new Date(data.timestamp).toLocaleDateString('pt-BR');
        if (docDate === dateToDelete) {
          deletePromises.push(deleteDoc(doc(db, "drawSessions", documentSnapshot.id)));
        }
      });

      await Promise.all(deletePromises);

      setHistoryPairs(prev => prev.filter(p => {
        const pDate = p.date || new Date(p.timestamp).toLocaleDateString('pt-BR');
        return pDate !== dateToDelete;
      }));

      alert(`Todos os registros do dia ${dateToDelete} foram excluidos com sucesso do banco de dados.`);
    } catch (error) {
      console.error("Erro ao excluir registros", error);
      alert("Ocorreu um erro ao excluir os registros. Tente novamente.");
    }
    setIsLoading(false);
  };

  const drawStats = (appStage === 'drawFemale' || appStage === 'drawMale') 
    ? calculateDrawStats(isFirstRound, pool, poolA, poolB, currentPair, historyPairs)
    : { totalPossible: 0, alreadyPlayed: 0, uniqueAvailable: 0 };

  if (isLoading) return <LoadingScreen />;

  if (!user) {
    return <Auth email={email} setEmail={setEmail} password={password} setPassword={setPassword} handleLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      <Header />
      <main className="max-w-5xl mx-auto p-6 mt-6 bg-white rounded-lg shadow-lg border border-gray-200">
        {appStage === 'setup' && (
          <Setup 
            isFirstRound={isFirstRound} handleToggleFirstRound={handleToggleFirstRound}
            presentFemales={presentFemales} setPresentFemales={setPresentFemales}
            presentMales={presentMales} setPresentMales={setPresentMales}
            femaleGroupA={femaleGroupA} setFemaleGroupA={setFemaleGroupA}
            femaleGroupB={femaleGroupB} setFemaleGroupB={setFemaleGroupB}
            maleGroupA={maleGroupA} setMaleGroupA={setMaleGroupA}
            maleGroupB={maleGroupB} setMaleGroupB={setMaleGroupB}
            femaleRoster={femaleRoster} maleRoster={maleRoster}
            startDrawFemale={startDrawFemale} startDrawMale={startDrawMale}
            setAppStage={setAppStage}
            isFemaleDrawValid={validateFemaleDraw(isFirstRound, presentFemales, femaleGroupA, femaleGroupB)}
            isMaleDrawValid={validateMaleDraw(isFirstRound, presentMales, maleGroupA, maleGroupB)}
          />
        )}
        {appStage === 'history' && (
          <History 
            setAppStage={setAppStage} historyPairs={historyPairs} femaleRoster={femaleRoster}
            selectedHistorySession={selectedHistorySession} setSelectedHistorySession={setSelectedHistorySession}
            handleDeleteByDate={handleDeleteByDate}
          />
        )}
        {(appStage === 'drawFemale' || appStage === 'drawMale') && (
          <Draw 
            appStage={appStage} currentPair={currentPair} isAnimating={isAnimating}
            handleDrawSequence={handleDrawSequence} confirmPair={confirmPair}
            cancelPair={cancelPair} historyPairs={historyPairs} sessionPairs={sessionPairs}
            drawStats={drawStats} goBackToSetup={goBackToSetup}
          />
        )}
        {(appStage === 'reviewFemale' || appStage === 'reviewMale') && (
          <Review 
            sessionPairs={sessionPairs} 
            saveTournament={saveTournament} 
            discardTournament={discardTournament} 
            appStage={appStage}
            goBackToSetup={goBackToSetup}
          />
        )}
      </main>
    </div>
  );
}