// src/pages/Cards.js

import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase';
import { useUser } from '../context/userContext';
import { FaCoins, FaBolt, FaClock, FaRocket } from 'react-icons/fa';
import Animate from '../Components/Animate';
import Spinner from '../Components/Spinner';

const Cards = () => {
  const { balance, id, setBalance, tapValue, setTapValue, battery, setBattery, energy, setEnergy, timeRefill, setTimeRefill } = useUser();
  const [cards, setCards] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [ownedCards, setOwnedCards] = useState([]);
  const [cardLevels, setCardLevels] = useState({});
  const [loading, setLoading] = useState(true);
  const [pointsPerHour, setPointsPerHour] = useState(0);
  const [lastCollected, setLastCollected] = useState(null);

  useEffect(() => {
    const fetchCardsAndUserData = async () => {
      try {
        const cardsCollection = collection(db, 'cards');
        const cardSnapshot = await getDocs(cardsCollection);
        const cardList = cardSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCards(cardList);

        const userRef = doc(db, 'telegramUsers', id.toString());
        const userDoc = await getDoc(userRef);
        const userData = userDoc.data();

        setOwnedCards(userData.ownedCards || []);
        setCardLevels(userData.cardLevels || {});
        setPointsPerHour(userData.pointsPerHour || 0);
        setLastCollected(userData.lastCollected?.toDate() || new Date());

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchCardsAndUserData();
  }, [id]);

  useEffect(() => {
    const collectOfflinePoints = async () => {
      const now = new Date();
      const timeDiff = (now - lastCollected) / (1000 * 60 * 60); // difference in hours
      const hoursToCollect = Math.min(timeDiff, 8); // max 8 hours
      const pointsToAdd = Math.floor(pointsPerHour * hoursToCollect);

      if (pointsToAdd > 0) {
        const newBalance = balance + pointsToAdd;
        const userRef = doc(db, 'telegramUsers', id.toString());
        await updateDoc(userRef, {
          balance: newBalance,
          lastCollected: now
        });
        setBalance(newBalance);
        setLastCollected(now);
      }
    };

    if (lastCollected) {
      collectOfflinePoints();
    }
  }, [lastCollected, pointsPerHour, balance, id, setBalance]);

  const handlePurchase = async (card) => {
    if (balance >= card.baseCost) {
      try {
        const newBalance = balance - card.baseCost;
        const userRef = doc(db, 'telegramUsers', id.toString());
        
        await updateDoc(userRef, {
          balance: newBalance,
          ownedCards: arrayUnion(card.id),
          [`cardLevels.${card.id}`]: 1
        });

        setBalance(newBalance);
        setOwnedCards([...ownedCards, card.id]);
        setCardLevels({...cardLevels, [card.id]: 1});

        applyCardEffect(card, 1);
      } catch (error) {
        console.error("Error purchasing card:", error);
      }
    }
  };

  const handleUpgrade = async (card) => {
    const currentLevel = cardLevels[card.id] || 1;
    if (currentLevel < card.maxLevel) {
      const upgradeCost = card.upgradeFormula(currentLevel);
      
      if (balance >= upgradeCost) {
        try {
          const newBalance = balance - upgradeCost;
          const newLevel = currentLevel + 1;
          const userRef = doc(db, 'telegramUsers', id.toString());
          
          await updateDoc(userRef, {
            balance: newBalance,
            [`cardLevels.${card.id}`]: newLevel
          });

          setBalance(newBalance);
          setCardLevels({...cardLevels, [card.id]: newLevel});

          applyCardEffect(card, newLevel);
        } catch (error) {
          console.error("Error upgrading card:", error);
        }
      }
    }
  };

  const applyCardEffect = async (card, level) => {
    const effect = card.baseEffect * level;
    const userRef = doc(db, 'telegramUsers', id.toString());

    switch (card.category) {
      case 'tap_boost':
        const newTapValue = { ...tapValue, value: tapValue.value + effect };
        setTapValue(newTapValue);
        await updateDoc(userRef, { tapValue: newTapValue });
        break;
      case 'energy_boost':
        const newBattery = { ...battery, energy: battery.energy + effect };
        setBattery(newBattery);
        setEnergy(Math.min(energy + effect, newBattery.energy));
        await updateDoc(userRef, { battery: newBattery, energy: Math.min(energy + effect, newBattery.energy) });
        break;
      case 'recharge_boost':
        const newTimeRefill = { ...timeRefill, duration: Math.max(timeRefill.duration - effect, 1) };
        setTimeRefill(newTimeRefill);
        await updateDoc(userRef, { timeRefill: newTimeRefill });
        break;
      case 'offline_earnings':
        const newPointsPerHour = pointsPerHour + effect;
        setPointsPerHour(newPointsPerHour);
        await updateDoc(userRef, { pointsPerHour: newPointsPerHour });
        break;
      default:
        console.warn("Unknown card category:", card.category);
    }
  };

  const formatNumber = (num) => {
    if (num < 1000000) {
      return new Intl.NumberFormat().format(num).replace(/,/g, " ");
    } else {
      const millions = num / 1000000;
      return millions.toFixed(2) + 'M';
    }
  };

  const getCardIcon = (category) => {
    switch (category) {
      case 'tap_boost': return <FaCoins className="text-yellow-400" />;
      case 'energy_boost': return <FaBolt className="text-blue-400" />;
      case 'recharge_boost': return <FaClock className="text-green-400" />;
      case 'offline_earnings': return <FaRocket className="text-purple-400" />;
      default: return null;
    }
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <Animate>
      <div className="cards-page p-4 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center text-white">Card Shop</h1>
        
        <div className="mb-6 flex justify-center space-x-4 overflow-x-auto">
          {['all', 'tap_boost', 'energy_boost', 'recharge_boost', 'offline_earnings'].map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full transition-colors duration-300 whitespace-nowrap ${
                selectedCategory === category
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {category.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards
            .filter(card => selectedCategory === 'all' || card.category === selectedCategory)
            .map(card => (
              <div
                key={card.id}
                className="bg-gray-800 rounded-lg p-4 flex flex-col justify-between hover:shadow-lg transition duration-300"
              >
                <div>
                  <div className="flex items-center mb-2">
                    {getCardIcon(card.category)}
                    <h3 className="text-xl font-semibold ml-2 text-white">{card.name}</h3>
                  </div>
                  <div className="mb-4 h-40 overflow-hidden rounded-lg">
                    <img src={card.imageUrl} alt={card.name} className="w-full h-full object-cover" />
                  </div>
                  <p className="text-gray-400 mb-4">{card.description}</p>
                  <p className="text-yellow-400 mb-2">
                    Cost: {formatNumber(ownedCards.includes(card.id) ? card.upgradeFormula(cardLevels[card.id] || 1) : card.baseCost)}
                  </p>
                  {ownedCards.includes(card.id) && (
                    <p className="text-green-400 mb-2">Level: {cardLevels[card.id] || 1} / {card.maxLevel}</p>
                  )}
                </div>
                <button
                  onClick={() => ownedCards.includes(card.id) ? handleUpgrade(card) : handlePurchase(card)}
                  className={`mt-4 px-4 py-2 rounded-full ${
                    ownedCards.includes(card.id)
                      ? cardLevels[card.id] < card.maxLevel
                        ? 'bg-green-500 hover:bg-green-600'
                        : 'bg-gray-500 cursor-not-allowed'
                      : balance >= card.baseCost
                      ? 'bg-blue-500 hover:bg-blue-600'
                      : 'bg-gray-500 cursor-not-allowed'
                  } text-white transition duration-300`}
                  disabled={
                    (ownedCards.includes(card.id) && cardLevels[card.id] >= card.maxLevel) ||
                    (!ownedCards.includes(card.id) && balance < card.baseCost)
                  }
                >
                  {ownedCards.includes(card.id)
                    ? cardLevels[card.id] < card.maxLevel
                      ? 'Upgrade'
                      : 'Max Level'
                    : 'Purchase'}
                </button>
              </div>
            ))}
        </div>

        <div className="mt-8 bg-gray-800 rounded-lg p-4">
          <h2 className="text-2xl font-bold mb-4 text-white">Your Stats</h2>
          <p className="text-gray-300 mb-2">Balance: {formatNumber(balance)}</p>
          <p className="text-gray-300 mb-2">Tap Value: {tapValue.value}</p>
          <p className="text-gray-300 mb-2">Energy Capacity: {battery.energy}</p>
          <p className="text-gray-300 mb-2">Energy Recharge Time: {timeRefill.duration} minutes</p>
          <p className="text-gray-300">Points Per Hour (Offline): {formatNumber(pointsPerHour)}</p>
        </div>
      </div>
    </Animate>
  );
};

export default Cards;