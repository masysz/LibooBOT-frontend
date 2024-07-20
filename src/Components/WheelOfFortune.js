import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { doc, updateDoc, getDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useUser } from '../context/userContext';
import tonIcon from '../images/ton-icon.webp';

const WheelContainer = styled.div`
  width: 300px;
  height: 300px;
  position: relative;
  margin: 0 auto;
`;

const Wheel = styled.div`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: conic-gradient(
    from 0deg,
    #ff6b6b 0deg 36deg,
    #feca57 36deg 72deg,
    #48dbfb 72deg 108deg,
    #ff9ff3 108deg 144deg,
    #54a0ff 144deg 180deg,
    #5f27cd 180deg 216deg,
    #ff6b6b 216deg 252deg,
    #feca57 252deg 288deg,
    #48dbfb 288deg 324deg,
    #ff9ff3 324deg 360deg
  );
  display: flex;
  justify-content: center;
  align-items: center;
  transition: transform 5s cubic-bezier(0.25, 0.1, 0.25, 1);
`;

const SpinButton = styled.button`
  margin-top: 20px;
  padding: 10px 20px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;

  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const RewardDisplay = styled.div`
  margin-top: 20px;
  font-size: 18px;
  font-weight: bold;
`;

const rewards = [
  { name: '10K Points', value: 10000, type: 'POINTS' },
  { name: '100K Points', value: 100000, type: 'POINTS' },
  { name: '5K Points', value: 5000, type: 'POINTS' },
  { name: '50K Points', value: 50000, type: 'POINTS' },
  { name: '200K Points', value: 200000, type: 'POINTS' },
  { name: '1 TON', value: 1, type: 'TON' },
  { name: '0.1 TON', value: 0.1, type: 'TON' },
  { name: '0.5 TON', value: 0.5, type: 'TON' },
  { name: 'Better luck next time', value: 0, type: 'NONE' },
  { name: '3 Extra Spins', value: 3, type: 'SPINS' },
];

const WheelOfFortune = () => {
  const [spinning, setSpinning] = useState(false);
  const [reward, setReward] = useState('');
  const [spinsLeft, setSpinsLeft] = useState(3);
  const [nextSpinTime, setNextSpinTime] = useState(null);
  const { balance, setBalance, tapBalance, setTapBalance } = useUser();

  const loadUserSpinData = useCallback(async () => {
    const telegramUser = window.Telegram.WebApp.initDataUnsafe?.user;
    if (telegramUser) {
      const { id: userId } = telegramUser;
      const userRef = doc(db, 'telegramUsers', userId.toString());
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data();
      
      if (userData.spinsLeft !== undefined) {
        setSpinsLeft(userData.spinsLeft);
      }
      if (userData.nextSpinTime) {
        setNextSpinTime(userData.nextSpinTime.toDate());
      }
    }
  }, []);

  useEffect(() => {
    loadUserSpinData();
  }, [loadUserSpinData]);

  const updateUserSpinData = async (newSpinsLeft, newNextSpinTime, newReward) => {
    const telegramUser = window.Telegram.WebApp.initDataUnsafe?.user;
    if (telegramUser) {
      const { id: userId } = telegramUser;
      const userRef = doc(db, 'telegramUsers', userId.toString());
      await updateDoc(userRef, {
        spinsLeft: newSpinsLeft,
        nextSpinTime: newNextSpinTime,
        spinRewards: arrayUnion({
          reward: newReward.name,
          value: newReward.value,
          type: newReward.type,
          timestamp: serverTimestamp()
        })
      });
    }
  };

  const spin = async () => {
    if (spinsLeft > 0 && (!nextSpinTime || new Date() > nextSpinTime)) {
      setSpinning(true);
      const randomDegrees = Math.floor(Math.random() * 360) + 1080; // At least 3 full spins
      const wheel = document.querySelector('#fortune-wheel');
      wheel.style.transform = `rotate(${randomDegrees}deg)`;

      setTimeout(() => {
        setSpinning(false);
        const selectedReward = rewards[Math.floor(Math.random() * rewards.length)];
        setReward(selectedReward.name);
        applyReward(selectedReward);

        const newSpinsLeft = spinsLeft - 1;
        const newNextSpinTime = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes from now
        setSpinsLeft(newSpinsLeft);
        setNextSpinTime(newNextSpinTime);
        updateUserSpinData(newSpinsLeft, newNextSpinTime, selectedReward);
      }, 5000);
    }
  };

  const applyReward = (selectedReward) => {
    switch (selectedReward.type) {
      case 'POINTS':
        setBalance(prevBalance => prevBalance + selectedReward.value);
        setTapBalance(prevTapBalance => prevTapBalance + selectedReward.value);
        break;
      case 'TON':
        // Handle TON reward (you might need to implement this part)
        console.log(`User won ${selectedReward.value} TON`);
        break;
      case 'SPINS':
        setSpinsLeft(prevSpins => prevSpins + selectedReward.value);
        break;
      default:
        // No reward or "Better luck next time"
        break;
    }
  };

  return (
    <div className="flex flex-col items-center">
      <WheelContainer>
        <Wheel id="fortune-wheel">
          {rewards.map((reward, index) => (
            <div
              key={index}
              className="absolute w-full h-full flex items-center justify-center"
              style={{ transform: `rotate(${index * 36}deg)` }}
            >
              <div className="text-white text-xs font-bold" style={{ transform: 'rotate(90deg)' }}>
                {reward.type === 'TON' ? (
                  <img src={tonIcon} alt="TON" className="w-6 h-6" />
                ) : (
                  reward.name
                )}
              </div>
            </div>
          ))}
        </Wheel>
      </WheelContainer>
      <SpinButton onClick={spin} disabled={spinning || spinsLeft === 0 || (nextSpinTime && new Date() < nextSpinTime)}>
        {spinning ? 'Spinning...' : 'Spin'}
      </SpinButton>
      <RewardDisplay>{reward}</RewardDisplay>
      <div>Spins left today: {spinsLeft}</div>
      {nextSpinTime && new Date() < nextSpinTime && (
        <div>Next spin available in: {Math.ceil((nextSpinTime - new Date()) / 60000)} minutes</div>
      )}
    </div>
  );
};

export default WheelOfFortune;