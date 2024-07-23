import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useUser } from '../context/userContext';
import coinsmall from "../images/coinsmall.webp";

const DailyRewards = ({ showModal, setShowModal }) => {
  const { id, balance, setBalance, tapBalance, setTapBalance } = useUser();
  const [currentStreak, setCurrentStreak] = useState(0);
  const [lastClaimDate, setLastClaimDate] = useState(null);
  const [canClaim, setCanClaim] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [claimAnimation, setClaimAnimation] = useState(false);

  const rewards = [
    2500, 7000, 18000, 52000, 80000, 100000, 250000, 320000, 500000, 1000000
  ];

  const fetchUserData = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      const userDocRef = doc(db, 'userDailyRewards', id);
      const docSnap = await getDoc(userDocRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        setCurrentStreak(data.currentStreak || 0);
        setLastClaimDate(data.lastClaimDate ? data.lastClaimDate.toDate() : null);
      } else {
        // Initialize user data if it doesn't exist
        await setDoc(userDocRef, {
          currentStreak: 0,
          lastClaimDate: null
        });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError('Failed to load user data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  useEffect(() => {
    if (lastClaimDate) {
      const today = new Date().setHours(0, 0, 0, 0);
      const lastClaim = new Date(lastClaimDate).setHours(0, 0, 0, 0);
      const diffDays = Math.floor((today - lastClaim) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        setCanClaim(true);
      } else if (diffDays > 1) {
        setCurrentStreak(0);
        setCanClaim(true);
      } else {
        setCanClaim(false);
      }
    } else {
      setCanClaim(true);
    }
  }, [lastClaimDate]);

  const claimReward = async () => {
    if (!canClaim || loading) return;

    setLoading(true);
    setError(null);

    try {
      const newStreak = currentStreak + 1;
      const reward = rewards[Math.min(newStreak - 1, rewards.length - 1)];
      const newBalance = balance + reward;
      const newTapBalance = tapBalance + reward;

      const userDocRef = doc(db, 'userDailyRewards', id);
      await setDoc(userDocRef, {
        currentStreak: newStreak,
        lastClaimDate: serverTimestamp(),
      }, { merge: true });

      const userRef = doc(db, 'telegramUsers', id);
      await updateDoc(userRef, { 
        balance: newBalance,
        tapBalance: newTapBalance
      });

      setBalance(newBalance);
      setTapBalance(newTapBalance);
      setCurrentStreak(newStreak);
      setLastClaimDate(new Date());
      setCanClaim(false);
      setClaimAnimation(true);

      setTimeout(() => {
        setClaimAnimation(false);
      }, 2000);

    } catch (error) {
      console.error('Error claiming reward:', error);
      setError('Failed to claim reward. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    document.getElementById("footermain").style.zIndex = "";
  };

  useEffect(() => {
    const handleBackButtonClick = () => {
      closeModal();
    };
  
    if (showModal) {
      window.Telegram.WebApp.BackButton.show();
      window.Telegram.WebApp.BackButton.onClick(handleBackButtonClick);
    } else {
      window.Telegram.WebApp.BackButton.hide();
      window.Telegram.WebApp.BackButton.offClick(handleBackButtonClick);
    }
  
    return () => {
      window.Telegram.WebApp.BackButton.offClick(handleBackButtonClick);
    };
  }, [showModal]);

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#1e2340] flex flex-col items-center justify-start overflow-y-auto">
      <div className="w-full max-w-md px-4 py-8">
        <h2 className="text-3xl font-bold mb-8 text-center text-white">Daily Rewards</h2>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <p className="text-red-500 text-center">{error}</p>
        ) : (
          <>
            <div className="grid grid-cols-5 gap-4 mb-8">
              {rewards.map((reward, index) => (
                <div 
                  key={index} 
                  className={`relative flex flex-col items-center justify-center p-3 rounded-lg ${
                    index < currentStreak ? 'bg-green-500' : 
                    index === currentStreak && canClaim ? 'bg-yellow-500 animate-pulse' : 
                    'bg-gray-700'
                  }`}
                >
                  <img src={coinsmall} alt="coin" className="w-8 h-8 mb-2" />
                  <span className="text-xs font-semibold text-white">{reward.toLocaleString()}</span>
                  <span className="text-xs text-white">Day {index + 1}</span>
                  {index < currentStreak && (
                    <IoCheckmarkCircle className="absolute top-1 right-1 text-white text-lg" />
                  )}
                </div>
              ))}
            </div>
            <div className="text-center mb-8">
              <p className="text-xl font-semibold text-white">Current Streak: {currentStreak} day{currentStreak !== 1 ? 's' : ''}</p>
            </div>
            <button
              onClick={claimReward}
              disabled={!canClaim || loading}
              className={`w-full py-4 px-6 rounded-lg text-white text-xl font-semibold ${
                canClaim && !loading ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-500 cursor-not-allowed'
              } transition duration-300 ease-in-out transform hover:scale-105`}
            >
              {canClaim ? 'Claim Reward' : 'Come back tomorrow!'}
            </button>
          </>
        )}
        {claimAnimation && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
            <div className="bg-green-500 text-white px-8 py-4 rounded-lg text-2xl font-bold animate-bounce">
              Reward Claimed!
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyRewards;