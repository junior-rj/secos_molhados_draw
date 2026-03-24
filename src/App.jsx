import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { collection, addDoc, getDocs } from 'firebase/firestore';

import { Header, LoadingScreen, DoneScreen } from './components/Shared';
import Auth from './components/Auth';
import History from './components/History';
import Setup from './components/Setup';
import Draw from './components/Draw';
import { validateFemaleDraw, validateMaleDraw } from './utils/logic';

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
        setEmail('');
        setPassword('');
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

  const startDrawFemale = async () => {
    const ts = new Date().toISOString();
    setSessionTimestamp(ts);

    if (isFirstRound) {
      setPool([...presentFemales]);
      try {
        await addDoc(collection(db, "drawSessions"), {
          timestamp: ts,
          date: new Date().toLocaleDateString('pt-BR'),
          gender: 'F',
          isFirstRound: true,
          presentPlayers: presentFemales
        });
      } catch (error) {
        console.error("Erro ao salvar dados do sorteio", error);
      }
    } else {
      setPoolA([...femaleGroupA]);
      setPoolB([...femaleGroupB]);
      try {
        await addDoc(collection(db, "drawSessions"), {
          timestamp: ts,
          date: new Date().toLocaleDateString('pt-BR'),
          gender: 'F',
          isFirstRound: false,
          groupA: femaleGroupA,
          groupB: femaleGroupB
        });
      } catch (error) {
        console.error("Erro ao salvar dados do sorteio", error);
      }
    }
    setAppStage('drawFemale');
  };

  const startDrawMale = async () => {
    const ts = new Date().toISOString();
    setSessionTimestamp(ts);

    if (isFirstRound) {
      setPool([...presentMales]);
      try {
        await addDoc(collection(db, "drawSessions"), {
          timestamp: ts,
          date: new Date().toLocaleDateString('pt-BR'),
          gender: 'M',
          isFirstRound: true,
          presentPlayers: presentMales
        });
      } catch (error) {
        console.error("Erro ao salvar dados do sorteio", error);
      }
    } else {
      setPoolA([...maleGroupA]);
      setPoolB([...maleGroupB]);
      try {
        await addDoc(collection(db, "drawSessions"), {
          timestamp: ts,
          date: new Date().toLocaleDateString('pt-BR'),
          gender: 'M',
          isFirstRound: false,
          groupA: maleGroupA,
          groupB: maleGroupB
        });
      } catch (error) {
        console.error("Erro ao salvar dados do sorteio", error);
      }
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
    }, 3000);
  };

  const confirmPair = async () => {
    const newPairData = { 
      player1: currentPair[0], 
      player2: currentPair[1], 
      timestamp: new Date().toISOString(),
      sessionTimestamp: sessionTimestamp,
      date: new Date().toLocaleDateString('pt-BR'),
      gender: appStage === 'drawFemale' ? 'F' : 'M'
    };
    
    try {
      await addDoc(collection(db, "drawHistory"), newPairData);
    } catch (err) {
      console.error("Erro ao salvar partida no Firebase", err);
    }
    
    setHistoryPairs([...historyPairs, newPairData]);
    setSessionPairs([...sessionPairs, newPairData]);
    setCurrentPair([]);

    if (isFirstRound) {
      if (pool.length === 0) setAppStage('done');
    } else {
      if (poolA.length === 0) setAppStage('done');
    }
  };

  const cancelPair = () => {
    if (isFirstRound) setPool([...pool, currentPair[0], currentPair[1]]);
    else {
      setPoolA([...poolA, currentPair[0]]);
      setPoolB([...poolB, currentPair[1]]);
    }
    setCurrentPair([]);
  };

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
            isFirstRound={isFirstRound} setIsFirstRound={setIsFirstRound}
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
          />
        )}
        {(appStage === 'drawFemale' || appStage === 'drawMale') && (
          <Draw 
            appStage={appStage} currentPair={currentPair} isAnimating={isAnimating}
            handleDrawSequence={handleDrawSequence} confirmPair={confirmPair}
            cancelPair={cancelPair} historyPairs={historyPairs} sessionPairs={sessionPairs}
          />
        )}
        {appStage === 'done' && <DoneScreen sessionPairs={sessionPairs} />}
      </main>
    </div>
  );
}
