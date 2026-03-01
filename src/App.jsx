import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, addDoc, getDocs } from 'firebase/firestore';

export default function App() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [femaleRoster, setFemaleRoster] = useState([]);
  const [maleRoster, setMaleRoster] = useState([]);

  const [presentFemales, setPresentFemales] = useState([]);
  const [presentMales, setPresentMales] = useState([]);
  const [appStage, setAppStage] = useState('setup'); 

  const [pool, setPool] = useState([]);
  const [currentPair, setCurrentPair] = useState([]);
  const [historyPairs, setHistoryPairs] = useState([]);
  const [sessionPairs, setSessionPairs] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const historySnapshot = await getDocs(collection(db, "drawHistory"));
        const pairs = [];
        historySnapshot.forEach((doc) => {
          pairs.push(doc.data());
        });
        setHistoryPairs(pairs);

        const playersSnapshot = await getDocs(collection(db, "players"));
        const females = [];
        const males = [];
        playersSnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.gender === "F") females.push(data.name);
          if (data.gender === "M") males.push(data.name);
        });
        setFemaleRoster(females.sort());
        setMaleRoster(males.sort());
      } catch (error) {
        console.error("Error fetching data", error);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchData();
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      alert("Authentication failed. Check your credentials and try again.");
    }
  };

  const togglePresence = (player, group, setGroup) => {
    if (group.includes(player)) {
      setGroup(group.filter(p => p !== player));
    } else {
      setGroup([...group, player]);
    }
  };

  const startDraw = () => {
    if (presentFemales.length % 2 !== 0 || presentMales.length % 2 !== 0) {
      alert("Please ensure both male and female selections have an even number of present players.");
      return;
    }
    
    if (presentFemales.length === 0 && presentMales.length === 0) {
      alert("Please select at least one group of players to start the draw.");
      return;
    }

    if (presentFemales.length > 0) {
      setPool([...presentFemales]);
      setAppStage('drawFemale');
    } else {
      setPool([...presentMales]);
      setAppStage('drawMale');
    }
  };

  const handleAction = async () => {
    if (currentPair.length === 2) {
      setCurrentPair([]);
      if (pool.length === 0) {
        if (appStage === 'drawFemale' && presentMales.length > 0) {
          setAppStage('drawMale');
          setPool([...presentMales]);
        } else {
          setAppStage('done');
        }
      }
      return;
    }

    if (pool.length === 0) {
      if (appStage === 'drawFemale' && presentMales.length > 0) {
        setAppStage('drawMale');
        setPool([...presentMales]);
      } else {
        setAppStage('done');
      }
      return;
    }

    if (currentPair.length === 0) {
      const randomIndex = Math.floor(Math.random() * pool.length);
      const p1 = pool[randomIndex];
      setCurrentPair([p1]);
      setPool(pool.filter(p => p !== p1));
    } else if (currentPair.length === 1) {
      const p1 = currentPair[0];
      let p2 = null;
      let poolCopy = [...pool].sort(() => Math.random() - 0.5);

      if (poolCopy.length === 1) {
        p2 = poolCopy[0]; 
      } else {
        let foundValid = false;
        for (let candidate of poolCopy) {
          const hasPlayed = historyPairs.some(match =>
            (match.player1 === p1 && match.player2 === candidate) ||
            (match.player1 === candidate && match.player2 === p1)
          );
          if (!hasPlayed) {
            p2 = candidate;
            foundValid = true;
            break;
          }
        }
        if (!foundValid) {
          p2 = poolCopy[0]; 
        }
      }

      setCurrentPair([p1, p2]);
      setPool(pool.filter(p => p !== p2));

      const newPairData = { player1: p1, player2: p2, timestamp: new Date().toISOString() };
      try {
        await addDoc(collection(db, "drawHistory"), newPairData);
      } catch (err) {
        console.error("Error saving match to Firebase database", err);
      }
      setHistoryPairs([...historyPairs, newPairData]);
      setSessionPairs([...sessionPairs, newPairData]);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-lg shadow-xl w-96 border-t-4 border-brandRed">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-brandRed">Secos & Molhados</h2>
            <p className="text-gray-500 font-medium">Draw System 2026</p>
          </div>
          <input type="email" placeholder="Authorized Email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full p-3 mb-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-brandRed" />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full p-3 mb-6 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-brandRed" />
          <button type="submit" className="w-full bg-brandRed text-white font-bold py-3 rounded hover:bg-red-800 transition duration-300">Access System</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      <header className="bg-brandRed text-white p-4 shadow-md flex justify-between items-center border-b-4 border-brandGold">
        <h1 className="text-xl md:text-2xl font-bold tracking-wide">TTC Secos & Molhados Live Draw</h1>
        <button onClick={() => signOut(auth)} className="bg-white text-brandRed px-4 py-2 rounded font-bold hover:bg-gray-200 transition duration-300">Logout</button>
      </header>

      <main className="max-w-5xl mx-auto p-6 mt-6 bg-white rounded-lg shadow-lg border border-gray-200">
        {appStage === 'setup' && (
          <div>
            <h2 className="text-2xl font-bold text-brandRed mb-6 border-b pb-2">Step 1: Select Present Players</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                <h3 className="text-xl font-bold text-brandRed mb-4 flex justify-between">
                  <span>Female Division</span>
                  <span className="bg-white px-3 py-1 rounded-full text-sm border border-brandRed">{presentFemales.length} Selected</span>
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {femaleRoster.map(player => (
                    <label key={player} className="flex items-center space-x-2 cursor-pointer p-2 hover:bg-red-100 rounded transition duration-200">
                      <input type="checkbox" className="w-5 h-5 text-brandRed focus:ring-brandRed border-gray-300 rounded" onChange={() => togglePresence(player, presentFemales, setPresentFemales)} /> 
                      <span className="font-medium">{player}</span>
                    </label>
                  ))}
                  {femaleRoster.length === 0 && <p className="text-sm text-gray-500 col-span-2">Loading players</p>}
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="text-xl font-bold text-gray-700 mb-4 flex justify-between">
                  <span>Male Division</span>
                  <span className="bg-white px-3 py-1 rounded-full text-sm border border-gray-400">{presentMales.length} Selected</span>
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {maleRoster.map(player => (
                    <label key={player} className="flex items-center space-x-2 cursor-pointer p-2 hover:bg-gray-200 rounded transition duration-200">
                      <input type="checkbox" className="w-5 h-5 text-brandRed focus:ring-brandRed border-gray-300 rounded" onChange={() => togglePresence(player, presentMales, setPresentMales)} /> 
                      <span className="font-medium">{player}</span>
                    </label>
                  ))}
                  {maleRoster.length === 0 && <p className="text-sm text-gray-500 col-span-2">Loading players</p>}
                </div>
              </div>
            </div>
            <div className="mt-8 text-center">
              <button onClick={startDraw} className="bg-brandGold text-white text-lg font-bold py-3 px-8 rounded shadow hover:bg-yellow-600 transition duration-300">Initialize Draw Sequence</button>
            </div>
          </div>
        )}

        {(appStage === 'drawFemale' || appStage === 'drawMale') && (
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-8 text-gray-800">
              {appStage === 'drawFemale' ? 'Female Bracket Draw' : 'Male Bracket Draw'}
            </h2>
            
            <div className="flex justify-center items-center space-x-6 mb-10 h-40">
              {currentPair.length >= 1 ? (
                 <div className="bg-brandRed text-white text-4xl font-bold py-8 px-12 rounded-xl shadow-md border-4 border-brandGold animate-pulse">
                   {currentPair[0]}
                 </div>
              ) : (
                 <div className="bg-gray-100 text-gray-400 text-2xl font-bold py-8 px-12 rounded-xl border-4 border-dashed border-gray-300">
                   Waiting
                 </div>
              )}
              
              <div className="text-4xl font-black text-brandGold">&</div>
              
              {currentPair.length === 2 ? (
                 <div className="bg-brandRed text-white text-4xl font-bold py-8 px-12 rounded-xl shadow-md border-4 border-brandGold animate-pulse">
                   {currentPair[1]}
                 </div>
              ) : (
                 <div className="bg-gray-100 text-gray-400 text-2xl font-bold py-8 px-12 rounded-xl border-4 border-dashed border-gray-300">
                   Waiting
                 </div>
              )}
            </div>

            <button onClick={handleAction} className="bg-gray-800 text-white text-xl font-bold py-4 px-10 rounded shadow hover:bg-gray-900 transition duration-300">
              {currentPair.length === 0 ? 'Draw First Player' : currentPair.length === 1 ? 'Draw Second Player' : 'Confirm Pair and Next'}
            </button>

            <div className="mt-16 text-left">
              <h3 className="text-xl font-bold border-b pb-2 mb-4 text-gray-600">Current Session Matches</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {sessionPairs.map((pair, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded border border-gray-200 text-center font-bold text-lg shadow-sm">
                    <span className="text-brandRed">{pair.player1}</span> <span className="text-gray-400 mx-1">x</span> <span className="text-brandRed">{pair.player2}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {appStage === 'done' && (
          <div className="text-center py-10">
            <h2 className="text-4xl font-black text-brandRed mb-6">Draw Completed Successfully</h2>
            <p className="text-xl text-gray-600 mb-8">All pairs have been generated and saved to the database.</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
              {sessionPairs.map((pair, index) => (
                <div key={index} className="bg-white p-4 rounded-lg border-l-4 border-brandRed shadow-md font-bold text-lg">
                  {pair.player1} & {pair.player2}
                </div>
              ))}
            </div>
            <button onClick={() => window.location.reload()} className="mt-10 bg-brandGold text-white font-bold py-3 px-8 rounded hover:bg-yellow-600 transition duration-300">Start New Event</button>
          </div>
        )}
      </main>
    </div>
  );
}
