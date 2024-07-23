import React, { useState, useEffect, useRef, useCallback } from 'react';
import { collection, getDocs, doc, getDoc, updateDoc, arrayUnion, runTransaction } from 'firebase/firestore';
import { db } from '../firebase';
import { useUser } from '../context/userContext';
import { FaCoins, FaBolt, FaClock, FaRocket, FaStar } from 'react-icons/fa';
import Animate from '../Components/Animate';
import Spinner from '../Components/Spinner';
import debounce from 'lodash/debounce';

const RARITY_COLORS = {
  common: 'text-gray-400',
  rare: 'text-blue-400',
  epic: 'text-purple-400',
  legendary: 'text-yellow-400'
};

const Cards = () => {
  const { 
    balance, id, setBalance, tapValue, setTapValue, 
    battery, setBattery, energy, setEnergy, 
    timeRefill, setTimeRefill, refBonus, SetRefBonus 
  } = useUser();
  
  const [cards, setCards] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [ownedCards, setOwnedCards] = useState([]);
  const [cardLevels, setCardLevels] = useState({});
  const [loading, setLoading] = useState(true);
  const [pointsPerHour, setPointsPerHour] = useState(0);
  const [lastCollected, setLastCollected] = useState(null);
  const [error, setError] = useState(null);
  const [userStats, setUserStats] = useState({});

  const containerRef = useRef(null);

  const fetchCardsAndUserData = useCallback(async () => {
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
      setUserStats(userData.stats || {});

      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to load data. Please try again later.");
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCardsAndUserData();
  }, [fetchCardsAndUserData]);

  useEffect(() => {
    const collectOfflinePoints = async () => {
      const now = new Date();
      const timeDiff = (now - lastCollected) / (1000 * 60 * 60);
      const hoursToCollect = Math.min(timeDiff, 8);
      const pointsToAdd = Math.floor(pointsPerHour * hoursToCollect);

      if (pointsToAdd > 0) {
        try {
          await runTransaction(db, async (transaction) => {
            const userRef = doc(db, 'telegramUsers', id.toString());
            const userDoc = await transaction.get(userRef);
            const userData = userDoc.data();
            
            const newBalance = userData.balance + pointsToAdd;
            transaction.update(userRef, { 
              balance: newBalance,
              lastCollected: now
            });
            
            setBalance(newBalance);
            setLastCollected(now);
          });
        } catch (error) {
          console.error("Error collecting offline points:", error);
          setError("Failed to collect offline points. Please try again.");
        }
      }
    };

    if (lastCollected) {
      collectOfflinePoints();
    }
  }, [lastCollected, pointsPerHour, id, setBalance]);

  const handlePurchase = async (card) => {
    if (balance >= card.baseCost) {
      try {
        await runTransaction(db, async (transaction) => {
          const userRef = doc(db, 'telegramUsers', id.toString());
          const userDoc = await transaction.get(userRef);
          const userData = userDoc.data();
          
          const newBalance = userData.balance - card.baseCost;
          const newOwnedCards = [...userData.ownedCards, card.id];
          const newCardLevels = { ...userData.cardLevels, [card.id]: 1 };
          
          transaction.update(userRef, {
            balance: newBalance,
            ownedCards: newOwnedCards,
            cardLevels: newCardLevels
          });
          
          setBalance(newBalance);
          setOwnedCards(newOwnedCards);
          setCardLevels(newCardLevels);
        });

        await applyCardEffect(card, 1);
      } catch (error) {
        console.error("Error purchasing card:", error);
        setError("Failed to purchase card. Please try again.");
      }
    }
  };

  const handleUpgrade = async (card) => {
    const currentLevel = cardLevels[card.id] || 1;
    if (currentLevel < card.maxLevel) {
      const upgradeCost = card.upgradeFormula(currentLevel);
      
      if (balance >= upgradeCost) {
        try {
          await runTransaction(db, async (transaction) => {
            const userRef = doc(db, 'telegramUsers', id.toString());
            const userDoc = await transaction.get(userRef);
            const userData = userDoc.data();
            
            const newBalance = userData.balance - upgradeCost;
            const newLevel = currentLevel + 1;
            const newCardLevels = { ...userData.cardLevels, [card.id]: newLevel };
            
            transaction.update(userRef, {
              balance: newBalance,
              cardLevels: newCardLevels
            });
            
            setBalance(newBalance);
            setCardLevels(newCardLevels);
          });

          await applyCardEffect(card, currentLevel + 1);
        } catch (error) {
          console.error("Error upgrading card:", error);
          setError("Failed to upgrade card. Please try again.");
        }
      }
    }
  };

  const applyCardEffect = async (card, level) => {
    const effect = card.baseEffect * level;
    const userRef = doc(db, 'telegramUsers', id.toString());

    try {
      await runTransaction(db, async (transaction) => {
        const userDoc = await transaction.get(userRef);
        const userData = userDoc.data();

        const updates = {};

        switch (card.category) {
          case 'tap_boost':
            const newTapValue = { ...userData.tapValue, value: userData.tapValue.value + effect };
            updates.tapValue = newTapValue;
            setTapValue(newTapValue);
            break;
          case 'energy_boost':
            const newBattery = { ...userData.battery, energy: userData.battery.energy + effect };
            const newEnergy = Math.min(userData.energy + effect, newBattery.energy);
            updates.battery = newBattery;
            updates.energy = newEnergy;
            setBattery(newBattery);
            setEnergy(newEnergy);
            break;
          case 'recharge_boost':
            const newTimeRefill = { ...userData.timeRefill, duration: Math.max(userData.timeRefill.duration - effect, 1) };
            updates.timeRefill = newTimeRefill;
            setTimeRefill(newTimeRefill);
            break;
          case 'offline_earnings':
            const newPointsPerHour = userData.pointsPerHour + effect;
            updates.pointsPerHour = newPointsPerHour;
            setPointsPerHour(newPointsPerHour);
            break;
          case 'ref_bonus':
            const newRefBonus = userData.refBonus + effect;
            updates.refBonus = newRefBonus;
            SetRefBonus(newRefBonus);
            break;
          default:
            console.warn("Unknown card category:", card.category);
        }

        transaction.update(userRef, updates);

        // Update user stats
        const newStats = { ...userData.stats };
        newStats[card.category] = (newStats[card.category] || 0) + effect;
        transaction.update(userRef, { stats: newStats });
        setUserStats(newStats);
      });
    } catch (error) {
      console.error("Error applying card effect:", error);
      setError("Failed to apply card effect. Please try again.");
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
      case 'ref_bonus': return <FaStar className="text-orange-400" />;
      default: return null;
    }
  };

  const handleScroll = debounce(() => {
    // Implement infinite scrolling or lazy loading here
  }, 200);

  useEffect(() => {
    const currentContainer = containerRef.current;
    if (currentContainer) {
      currentContainer.addEventListener('scroll', handleScroll);
    }
    return () => {
      if (currentContainer) {
        currentContainer.removeEventListener('scroll', handleScroll);
      }
    };
  }, [handleScroll]);

  if (loading) {
    return <Spinner />;
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  return (
    <Animate>
      <div ref={containerRef} className="cards-page p-4 max-w-4xl mx-auto overflow-auto h-screen">
        <h1 className="text-3xl font-bold mb-6 text-center text-white">Card Shop</h1>
        
        <div className="mb-6 flex justify-center space-x-4 overflow-x-auto">
          {['all', 'tap_boost', 'energy_boost', 'recharge_boost', 'offline_earnings', 'ref_bonus'].map(category => (
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
                className={`bg-gray-800 rounded-lg p-4 flex flex-col justify-between hover:shadow-lg transition duration-300 border-2 ${RARITY_COLORS[card.rarity]}`}
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
                  <p className={`mb-2 ${RARITY_COLORS[card.rarity]}`}>Rarity: {card.rarity}</p>
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
  <p className="text-gray-300 mb-2">Points Per Hour (Offline): {formatNumber(pointsPerHour)}</p>
  <p className="text-gray-300 mb-2">Referral Bonus: {formatNumber(refBonus)}</p>
  <h3 className="text-xl font-bold mt-4 mb-2 text-white">Card Effects</h3>
  <div className="grid grid-cols-2 gap-4">
    {Object.entries(userStats).map(([category, value]) => (
      <div key={category} className="bg-gray-700 rounded-lg p-3">
        <p className="text-gray-300 font-semibold">{category.replace('_', ' ')}:</p>
        <p className="text-white">{formatNumber(value)}</p>
      </div>
    ))}
  </div>
</div>

{/* Card Collection Section */}
<div className="mt-8 bg-gray-800 rounded-lg p-4">
  <h2 className="text-2xl font-bold mb-4 text-white">Your Card Collection</h2>
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
    {ownedCards.map(cardId => {
      const card = cards.find(c => c.id === cardId);
      return (
        <div key={cardId} className={`bg-gray-700 rounded-lg p-2 border-2 ${RARITY_COLORS[card.rarity]}`}>
          <img src={card.imageUrl} alt={card.name} className="w-full h-24 object-cover rounded-lg mb-2" />
          <p className="text-white text-sm font-semibold">{card.name}</p>
          <p className="text-gray-300 text-xs">Level: {cardLevels[cardId] || 1}</p>
        </div>
      );
    })}
  </div>
</div>

{/* Achievements Section */}
<div className="mt-8 bg-gray-800 rounded-lg p-4">
  <h2 className="text-2xl font-bold mb-4 text-white">Achievements</h2>
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
    {achievements.map(achievement => (
      <div key={achievement.id} className="bg-gray-700 rounded-lg p-3">
        <h4 className="text-white font-semibold">{achievement.name}</h4>
        <p className="text-gray-300 text-sm">{achievement.description}</p>
        <div className="mt-2 bg-gray-600 rounded-full h-2">
          <div
            className="bg-blue-500 rounded-full h-2"
            style={{ width: `${(achievement.progress / achievement.goal) * 100}%` }}
          ></div>
        </div>
        <p className="text-right text-gray-300 text-xs mt-1">
          {achievement.progress} / {achievement.goal}
        </p>
      </div>
    ))}
  </div>
</div>

{/* Leaderboard Preview */}
<div className="mt-8 bg-gray-800 rounded-lg p-4">
  <h2 className="text-2xl font-bold mb-4 text-white">Leaderboard Preview</h2>
  <table className="w-full">
    <thead>
      <tr>
        <th className="text-left text-gray-300">Rank</th>
        <th className="text-left text-gray-300">Player</th>
        <th className="text-right text-gray-300">Score</th>
      </tr>
    </thead>
    <tbody>
      {leaderboard.slice(0, 5).map((player, index) => (
        <tr key={player.id} className={player.id === id ? "bg-blue-900" : ""}>
          <td className="text-white">{index + 1}</td>
          <td className="text-white">{player.name}</td>
          <td className="text-right text-white">{formatNumber(player.score)}</td>
        </tr>
      ))}
    </tbody>
  </table>
  <button className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
    View Full Leaderboard
  </button>
</div>

      </div>
    </Animate>
  );
};

export default Cards;