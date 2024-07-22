import React, { useState, useEffect, useRef,  useCallback } from 'react';
import { db } from '../firebase'; // Adjust the path as needed
import styled, { keyframes } from "styled-components";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";
import Animate from '../Components/Animate';
import Spinner from '../Components/Spinner';
import { useUser } from '../context/userContext';
import Levels from '../Components/Levels';
import flash from "../images/flash.webp";
import coinsmall from "../images/coinsmall.webp";
import useSound from 'use-sound';
import boopSfx from '../get.mp3';
import burnSfx from '../burn.wav';

import { doc, updateDoc, getDoc, setDoc, collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import styled, { keyframes } from "styled-components";
import { useUser } from '../context/userContext';
import useSound from 'use-sound';
import boopSfx from '../sounds/boop.mp3';
import chirpSfx from '../sounds/chirp.wav';

const breathe = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const StorkContainer = styled.div`
  width: 300px;
  height: 300px;
  background-image: url(${props => props.appearance === 'baby' ? '/baby-stork.png' : 
                           props.appearance === 'juvenile' ? '/juvenile-stork.png' : '/adult-stork.png'});
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  animation: ${breathe} 3s infinite ease-in-out;
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.1);
  }
`;

const StatusBar = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  padding: 15px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  backdrop-filter: blur(5px);
`;

const InventoryContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  padding: 20px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 15px;
`;

const ActivityButton = styled.button`
  padding: 10px 20px;
  background: ${props => props.disabled ? '#ccc' : 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)'};
  color: white;
  border: none;
  border-radius: 25px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;

  &:hover {
    transform: ${props => props.disabled ? 'none' : 'translateY(-3px)'};
    box-shadow: ${props => props.disabled ? 'none' : '0 4px 20px rgba(0, 0, 0, 0.25)'};
  }
`;

const WeatherEffect = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  ${props => {
    switch(props.weather) {
      case 'rainy':
        return `
          background-image: url('/rain.gif');
          opacity: 0.5;
        `;
      case 'cloudy':
        return `
          background-color: rgba(200, 200, 200, 0.3);
        `;
      case 'windy':
        return `
          &::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-image: url('/wind.gif');
            opacity: 0.3;
          }
        `;
      default:
        return '';
    }
  }}
`;

const Plutos = () => {
  // Estados del personaje
  const [stats, setStats] = useState({
    mood: 100,
    hunger: 100,
    thirst: 100,
    energy: 100,
    health: 100,
    hygiene: 100,
    level: 1,
    exp: 0,
    strength: 1,
    intelligence: 1,
    agility: 1,
    charisma: 1
  });

  // Inventario
  const [inventory, setInventory] = useState({
    food: {},
    drinks: {},
    toys: {},
    cleaningItems: {},
    medicines: {},
    specialItems: {}
  });

  // Otros estados
  const [dayTime, setDayTime] = useState('day');
  const [weather, setWeather] = useState('sunny');
  const [isSleeping, setIsSleeping] = useState(false);
  const [currentActivity, setCurrentActivity] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [missions, setMissions] = useState([]);
  const [skills, setSkills] = useState({});
  const [friends, setFriends] = useState([]);
  const [storkAppearance, setStorkAppearance] = useState('baby');
  const [lastFeedTime, setLastFeedTime] = useState(null);
  const [gameTime, setGameTime] = useState(0);

  // Sonidos
  const [playBoop] = useSound(boopSfx);
  const [playChirp] = useSound(chirpSfx);

  // Referencias
  const storkRef = useRef(null);
  const gameLoopRef = useRef(null);

  // Context
  const { balance, setBalance, id } = useUser();

  // Efectos
  useEffect(() => {
    loadGameState();
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, []);

  useEffect(() => {
    if (stats.level > 5 && storkAppearance === 'baby') {
      setStorkAppearance('juvenile');
    } else if (stats.level > 10 && storkAppearance === 'juvenile') {
      setStorkAppearance('adult');
    }
  }, [stats.level, storkAppearance]);

 const Plutos = () => {
  // Estados del personaje
  const [stats, setStats] = useState({
    mood: 100,
    hunger: 100,
    thirst: 100,
    energy: 100,
    health: 100,
    hygiene: 100,
    level: 1,
    exp: 0,
    strength: 1,
    intelligence: 1,
    agility: 1,
    charisma: 1
  });

  // Inventario
  const [inventory, setInventory] = useState({
    food: {},
    drinks: {},
    toys: {},
    cleaningItems: {},
    medicines: {},
    specialItems: {}
  });

  // Otros estados
  const [dayTime, setDayTime] = useState('day');
  const [weather, setWeather] = useState('sunny');
  const [isSleeping, setIsSleeping] = useState(false);
  const [currentActivity, setCurrentActivity] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [missions, setMissions] = useState([]);
  const [skills, setSkills] = useState({});
  const [friends, setFriends] = useState([]);
  const [storkAppearance, setStorkAppearance] = useState('baby');
  const [lastFeedTime, setLastFeedTime] = useState(null);
  const [gameTime, setGameTime] = useState(0);

  // Sonidos
  const [playBoop] = useSound(boopSfx);
  const [playChirp] = useSound(chirpSfx);

  // Referencias
  const storkRef = useRef(null);
  const gameLoopRef = useRef(null);

  // Context
  const { balance, setBalance, id } = useUser();

  // Efectos
  useEffect(() => {
    loadGameState();
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, []);

  useEffect(() => {
    if (stats.level > 5 && storkAppearance === 'baby') {
      setStorkAppearance('juvenile');
    } else if (stats.level > 10 && storkAppearance === 'juvenile') {
      setStorkAppearance('adult');
    }
  }, [stats.level, storkAppearance]);



// Funciones principales
const loadGameState = async () => {
  if (!id) return;
  const userRef = doc(db, 'telegramUsers', id);
  const userDoc = await getDoc(userRef);
  if (userDoc.exists()) {
    const userData = userDoc.data();
    setStats(userData.stats || stats);
    setInventory(userData.inventory || inventory);
    setAchievements(userData.achievements || []);
    setMissions(userData.missions || []);
    setSkills(userData.skills || {});
    setFriends(userData.friends || []);
    setStorkAppearance(userData.storkAppearance || 'baby');
    setLastFeedTime(userData.lastFeedTime || null);
    setGameTime(userData.gameTime || 0);
  }
  startGameLoop();
};

const startGameLoop = useCallback(() => {
  gameLoopRef.current = setInterval(() => {
    updateGameState();
    checkEvents();
    saveGameState();
  }, 1000); // Actualizar cada segundo para mayor precisión
}, []);

const updateGameState = useCallback(() => {
  setGameTime(prevTime => prevTime + 1);
  setStats(prevStats => {
    const newStats = { ...prevStats };
    newStats.mood = Math.max(newStats.mood - 0.01, 0);
    newStats.hunger = Math.max(newStats.hunger - 0.02, 0);
    newStats.thirst = Math.max(newStats.thirst - 0.03, 0);
    newStats.energy = isSleeping 
      ? Math.min(newStats.energy + 0.1, 100) 
      : Math.max(newStats.energy - 0.01, 0);
    newStats.hygiene = Math.max(newStats.hygiene - 0.01, 0);

    const overallWellbeing = (newStats.mood + newStats.hunger + newStats.thirst + newStats.energy + newStats.hygiene) / 5;
    newStats.health = Math.max(0, Math.min(newStats.health + (overallWellbeing < 50 ? -0.02 : 0.01), 100));

    return newStats;
  });

  checkMissions();
  checkAchievements();
}, [isSleeping]);

const checkEvents = useCallback(() => {
  const hour = (Math.floor(gameTime / 3600) % 24);
  setDayTime(hour >= 6 && hour < 20 ? 'day' : 'night');

  if (gameTime % 3600 === 0) { // Cambiar clima cada hora de juego
    setWeather(['sunny', 'rainy', 'cloudy', 'windy'][Math.floor(Math.random() * 4)]);
  }
}, [gameTime]);

const saveGameState = async () => {
  if (!id) return;
  const userRef = doc(db, 'telegramUsers', id);
  try {
    await updateDoc(userRef, {
      stats,
      inventory,
      achievements,
      missions,
      skills,
      friends,
      storkAppearance,
      lastFeedTime,
      gameTime,
      balance
    });
  } catch (error) {
    console.error('Error saving game state:', error);
  }
};


   // Funciones de actividad
const performActivity = async (activityType, item) => {
  if (currentActivity) return; // Prevenir múltiples actividades simultáneas
  setCurrentActivity(activityType);
  
  let activityDuration = 5000; // 5 segundos por defecto
  let expGain = 5;

  switch (activityType) {
    case 'feed':
      await feedStork(item);
      break;
    case 'drink':
      await giveWater(item);
      break;
    case 'play':
      activityDuration = 10000; // Jugar toma más tiempo
      expGain = 10;
      await playWithStork(item);
      break;
    case 'clean':
      await cleanStork(item);
      break;
    case 'medicate':
      await medicateStork(item);
      break;
    case 'pet':
      activityDuration = 2000; // Acariciar es rápido
      expGain = 1;
      await petStork();
      break;
    default:
      break;
  }

  setTimeout(() => {
    setCurrentActivity(null);
    addExp(expGain);
  }, activityDuration);
};

const feedStork = async (foodItem) => {
  if (inventory.food[foodItem] > 0) {
    setInventory(prev => ({
      ...prev,
      food: { ...prev.food, [foodItem]: prev.food[foodItem] - 1 }
    }));
    setStats(prev => ({
      ...prev,
      hunger: Math.min(prev.hunger + 20, 100),
      mood: Math.min(prev.mood + 5, 100)
    }));
    playChirp();
    setLastFeedTime(Date.now());
    
    // Verificar sobrealimentación
    if (Date.now() - lastFeedTime < 3600000) { // Si se alimentó en la última hora
      setStats(prev => ({
        ...prev,
        health: Math.max(prev.health - 5, 0) // Disminuir salud si está sobrealimentado
      }));
    }
  }
};

const giveWater = async (drinkItem) => {
  if (inventory.drinks[drinkItem] > 0) {
    setInventory(prev => ({
      ...prev,
      drinks: { ...prev.drinks, [drinkItem]: prev.drinks[drinkItem] - 1 }
    }));
    setStats(prev => ({
      ...prev,
      thirst: Math.min(prev.thirst + 20, 100),
      mood: Math.min(prev.mood + 5, 100)
    }));
    playChirp();
  }
};

const playWithStork = async (toyItem) => {
  if (inventory.toys[toyItem] > 0) {
    setInventory(prev => ({
      ...prev,
      toys: { ...prev.toys, [toyItem]: prev.toys[toyItem] - 1 }
    }));
    setStats(prev => ({
      ...prev,
      mood: Math.min(prev.mood + 15, 100),
      energy: Math.max(prev.energy - 10, 0),
      agility: prev.agility + 0.1
    }));
    playBoop();
  }
};

const cleanStork = async (cleaningItem) => {
  if (inventory.cleaningItems[cleaningItem] > 0) {
    setInventory(prev => ({
      ...prev,
      cleaningItems: { ...prev.cleaningItems, [cleaningItem]: prev.cleaningItems[cleaningItem] - 1 }
    }));
    setStats(prev => ({
      ...prev,
      hygiene: Math.min(prev.hygiene + 20, 100),
      mood: Math.min(prev.mood + 5, 100)
    }));
    playBoop();
  }
};

const medicateStork = async (medicineItem) => {
  if (inventory.medicines[medicineItem] > 0 && stats.health < 100) {
    setInventory(prev => ({
      ...prev,
      medicines: { ...prev.medicines, [medicineItem]: prev.medicines[medicineItem] - 1 }
    }));
    setStats(prev => ({
      ...prev,
      health: Math.min(prev.health + 15, 100)
    }));
  }
};

const petStork = async () => {
  setStats(prev => ({
    ...prev,
    mood: Math.min(prev.mood + 5, 100),
    charisma: prev.charisma + 0.05
  }));
  playChirp();
};

const toggleSleep = () => {
  setIsSleeping(prev => !prev);
  if (!isSleeping) {
    addExp(5);
  }
};

const addExp = (amount) => {
  setStats(prev => {
    const newExp = prev.exp + amount;
    if (newExp >= 100) {
      return {
        ...prev,
        level: prev.level + 1,
        exp: newExp - 100,
        strength: prev.strength + 0.5,
        intelligence: prev.intelligence + 0.5,
        agility: prev.agility + 0.5,
        charisma: prev.charisma + 0.5
      };
    }
    return { ...prev, exp: newExp };
  });
};

// ... (el resto del componente continuará en la siguiente parte)

// Sistemas adicionales
const checkMissions = () => {
  setMissions(prevMissions => 
    prevMissions.map(mission => {
      switch(mission.type) {
        case 'feed':
          if (stats.hunger > 90 && !mission.completed) {
            return { ...mission, completed: true, reward: 50 };
          }
          break;
        case 'play':
          if (stats.mood > 90 && !mission.completed) {
            return { ...mission, completed: true, reward: 75 };
          }
          break;
        case 'clean':
          if (stats.hygiene > 95 && !mission.completed) {
            return { ...mission, completed: true, reward: 60 };
          }
          break;
        // Añadir más tipos de misiones aquí
      }
      return mission;
    })
  );
};

const checkAchievements = () => {
  const newAchievements = [];
  
  if (stats.level === 10 && !achievements.includes('Grown Up')) {
    newAchievements.push('Grown Up');
  }
  if (stats.charisma >= 10 && !achievements.includes('Charming Stork')) {
    newAchievements.push('Charming Stork');
  }
  if (gameTime >= 604800 && !achievements.includes('Dedicated Owner')) { // 7 días de juego
    newAchievements.push('Dedicated Owner');
  }
  // Añadir más logros aquí

  if (newAchievements.length > 0) {
    setAchievements(prev => [...prev, ...newAchievements]);
    newAchievements.forEach(achievement => {
      // Recompensar al jugador por cada logro
      setBalance(prev => prev + 100);
    });
  }
};

const buyItem = async (itemType, itemName, cost) => {
  if (balance >= cost) {
    setBalance(prev => prev - cost);
    setInventory(prev => ({
      ...prev,
      [itemType]: { ...prev[itemType], [itemName]: (prev[itemType][itemName] || 0) + 1 }
    }));
    // Añadir a Firebase
    const userRef = doc(db, 'telegramUsers', id);
    await updateDoc(userRef, {
      balance: balance - cost,
      [`inventory.${itemType}.${itemName}`]: (inventory[itemType][itemName] || 0) + 1
    });
    // Notificar al usuario
    alert(`¡Has comprado ${itemName} por ${cost} monedas!`);
  } else {
    alert('No tienes suficientes monedas para comprar este artículo.');
  }
};

const learnSkill = async (skillName, cost) => {
  if (stats.intelligence >= 5 && !skills[skillName] && balance >= cost) {
    setSkills(prev => ({ ...prev, [skillName]: 1 }));
    setStats(prev => ({ ...prev, intelligence: prev.intelligence + 1 }));
    setBalance(prev => prev - cost);
    // Añadir a Firebase
    const userRef = doc(db, 'telegramUsers', id);
    await updateDoc(userRef, {
      [`skills.${skillName}`]: 1,
      'stats.intelligence': stats.intelligence + 1,
      balance: balance - cost
    });
    alert(`¡Has aprendido la habilidad ${skillName}!`);
  } else if (stats.intelligence < 5) {
    alert('Tu cigüeña necesita más inteligencia para aprender esta habilidad.');
  } else if (balance < cost) {
    alert('No tienes suficientes monedas para aprender esta habilidad.');
  } else {
    alert('Ya has aprendido esta habilidad.');
  }
};

const addFriend = async (friendId) => {
  if (!friends.includes(friendId)) {
    setFriends(prev => [...prev, friendId]);
    // Añadir a Firebase
    const userRef = doc(db, 'telegramUsers', id);
    await updateDoc(userRef, {
      friends: [...friends, friendId]
    });
    // Notificar al usuario
    alert(`¡Has añadido un nuevo amigo con ID ${friendId}!`);
  } else {
    alert('Esta cigüeña ya es tu amiga.');
  }
};

// ... (el resto del componente continuará en la siguiente parte)

// Componentes adicionales
const StatBar = styled.div`
  width: 100%;
  height: 20px;
  background-color: #ddd;
  border-radius: 10px;
  overflow: hidden;
`;

const StatFill = styled.div`
  width: ${props => props.value}%;
  height: 100%;
  background-color: ${props => props.color};
  transition: width 0.3s ease-in-out;
`;

const Modal = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  z-index: 1000;
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
`;

// Componente principal
return (
  <div>
    <WeatherEffect weather={weather}>
      <StorkContainer ref={storkRef} appearance={storkAppearance}>
        {/* La imagen de la cigüeña se maneja en el styled component */}
      </StorkContainer>
    </WeatherEffect>
    
    <StatusBar>
      {Object.entries(stats).map(([stat, value]) => (
        <div key={stat}>
          <p>{stat}: {typeof value === 'number' ? value.toFixed(2) : value}</p>
          {['mood', 'hunger', 'thirst', 'energy', 'health', 'hygiene'].includes(stat) && (
            <StatBar>
              <StatFill 
                value={value} 
                color={
                  stat === 'mood' ? '#FFD700' :
                  stat === 'hunger' ? '#FF6347' :
                  stat === 'thirst' ? '#4169E1' :
                  stat === 'energy' ? '#32CD32' :
                  stat === 'health' ? '#FF69B4' :
                  '#8A2BE2'
                }
              />
            </StatBar>
          )}
        </div>
      ))}
    </StatusBar>

    <InventoryContainer>
      {Object.entries(inventory).map(([category, items]) => (
        <div key={category}>
          <h3>{category}</h3>
          {Object.entries(items).map(([item, quantity]) => (
            <div key={item}>{item}: {quantity}</div>
          ))}
        </div>
      ))}
    </InventoryContainer>

    <div>
      <ActivityButton onClick={() => performActivity('feed', 'worm')} disabled={currentActivity}>Feed Worm</ActivityButton>
      <ActivityButton onClick={() => performActivity('drink', 'water')} disabled={currentActivity}>Give Water</ActivityButton>
      <ActivityButton onClick={() => performActivity('play', 'ball')} disabled={currentActivity}>Play with Ball</ActivityButton>
      <ActivityButton onClick={() => performActivity('clean', 'soap')} disabled={currentActivity}>Clean</ActivityButton>
      <ActivityButton onClick={() => performActivity('medicate', 'vitamin')} disabled={currentActivity}>Give Vitamin</ActivityButton>
      <ActivityButton onClick={() => performActivity('pet')} disabled={currentActivity}>Pet Stork</ActivityButton>
      <ActivityButton onClick={toggleSleep}>{isSleeping ? 'Wake Up' : 'Sleep'}</ActivityButton>
    </div>

    <div>
      <h3>Missions</h3>
      {missions.map((mission, index) => (
        <div key={index}>
          <p>{mission.description} - {mission.completed ? 'Completed' : 'In Progress'}</p>
          {mission.completed && !mission.rewarded && (
            <button onClick={() => {
              setBalance(prev => prev + mission.reward);
              setMissions(prev => prev.map((m, i) => i === index ? {...m, rewarded: true} : m));
            }}>
              Claim Reward
            </button>
          )}
        </div>
      ))}
    </div>

    <div>
      <h3>Achievements</h3>
      {achievements.map((achievement, index) => (
        <div key={index}>{achievement}</div>
      ))}
    </div>

    <div>
      <h3>Shop</h3>
      <button onClick={() => buyItem('food', 'premium_worm', 50)}>Buy Premium Worm (50 coins)</button>
      <button onClick={() => buyItem('toys', 'deluxe_ball', 100)}>Buy Deluxe Ball (100 coins)</button>
      {/* Añadir más artículos a la tienda */}
    </div>

    <div>
      <h3>Skills</h3>
      <button onClick={() => learnSkill('flying', 200)}>Learn Flying (200 coins)</button>
      <button onClick={() => learnSkill('fishing', 150)}>Learn Fishing (150 coins)</button>
      {/* Añadir más habilidades */}
    </div>

    {/* Modal para mostrar mensajes importantes */}
    {showModal && (
      <>
        <Overlay onClick={() => setShowModal(false)} />
        <Modal>
          <h2>{modalTitle}</h2>
          <p>{modalMessage}</p>
          <button onClick={() => setShowModal(false)}>Close</button>
        </Modal>
      </>
    )}
  </div>
);
};
}
export default Plutos;