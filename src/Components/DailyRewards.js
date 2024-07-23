import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { useUser } from '../context/userContext';
import coinsmall from "../images/coinsmall.webp";

const DailyRewards = ({ showModal, setShowModal }) => {
  const { id, balance, setBalance, tapBalance, setTapBalance } = useUser();
  const [currentStreak, setCurrentStreak] = useState(0);
  const [lastClaimDate, setLastClaimDate] = useState(null);
  const [canClaim, setCanClaim] = useState(false);

  const rewards = [
    2500, 7000, 18000, 52000, 80000, 100000, 250000, 320000, 500000, 1000000
  ];

  useEffect(() => {
    if (id) {
      fetchUserData();
    }
  }, [id]);

  useEffect(() => {
    if (lastClaimDate) {
      const today = new Date().setHours(0, 0, 0, 0);
      const lastClaim = new Date(lastClaimDate.toDate()).setHours(0, 0, 0, 0);
      const diffDays = Math.floor((today - lastClaim) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        setCanClaim(true);
      } else if (diffDays > 1) {
        setCurrentStreak(0);
        setCanClaim(true);
      }
    } else {
      setCanClaim(true);
    }
  }, [lastClaimDate]);

  const fetchUserData = async () => {
    try {
      const userDocRef = doc(db, 'userDailyRewards', id);
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setCurrentStreak(data.currentStreak);
        setLastClaimDate(data.lastClaimDate);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const claimReward = async () => {
    if (!canClaim) return;

    const newStreak = currentStreak + 1;
    const reward = rewards[Math.min(newStreak - 1, rewards.length - 1)];
    const newBalance = balance + reward;
    const newTapBalance = tapBalance + reward;

    try {
      const userDocRef = doc(db, 'userDailyRewards', id);
      await setDoc(userDocRef, {
        currentStreak: newStreak,
        lastClaimDate: new Date(),
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

      // Show success message or animation here
    } catch (error) {
      console.error('Error claiming reward:', error);
      // Show error message here
    }
  };

  return (
    <>
      {showModal && (
        <div className="fixed z-50 left-0 right-0 top-0 bottom-0 flex justify-center taskbg px-[16px] h-full">
          <div className="w-full flex flex-col items-center justify-start">
            <h1 className="text-[24px] font-semibold mb-4">Daily Rewards</h1>
            <div className="grid grid-cols-5 gap-4 w-full">
              {rewards.map((reward, index) => (
                <div 
                  key={index} 
                  className={`flex flex-col items-center justify-center p-2 rounded-lg ${
                    index < currentStreak ? 'bg-green-500' : 
                    index === currentStreak && canClaim ? 'bg-yellow-500 animate-pulse' : 
                    'bg-gray-700'
                  }`}
                >
                  <img src={coinsmall} alt="coin" className="w-8 h-8 mb-1" />
                  <span className="text-xs">{reward.toLocaleString()}</span>
                  <span className="text-xs">Day {index + 1}</span>
                </div>
              ))}
            </div>
            <button
              onClick={claimReward}
              disabled={!canClaim}
              className={`mt-6 py-3 px-6 rounded-lg text-lg font-semibold ${
                canClaim ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-500 cursor-not-allowed'
              }`}
            >
              {canClaim ? 'Claim Reward' : 'Come back tomorrow!'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default DailyRewards;