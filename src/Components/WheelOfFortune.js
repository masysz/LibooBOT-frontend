import React, { useState, useEffect, useCallback, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { doc, updateDoc, getDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useUser } from '../context/userContext';
import tonIcon from '../images/ton-icon.webp';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const WheelContainer = styled.div`
  width: 300px;
  height: 300px;
  position: relative;
  margin: 0 auto;
  perspective: 1000px;
`;

const Wheel = styled.div`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  position: relative;
  transition: transform 5s cubic-bezier(0.25, 0.1, 0.25, 1);
  transform-style: preserve-3d;
  box-shadow: 0 0 50px rgba(0,0,0,0.2);
`;

const WheelSection = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: bold;
  color: white;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
  transform: rotateY(-90deg) translateZ(150px);
  background: ${props => props.color};
  clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
`;

const SpinButton = styled.button`
  margin-top: 20px;
  padding: 12px 24px;
  background: linear-gradient(45deg, #4CAF50, #45a049);
  color: white;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  font-size: 18px;
  font-weight: bold;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 8px rgba(0,0,0,0.15);
  }

  &:disabled {
    background: #cccccc;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const RewardDisplay = styled.div`
  margin-top: 20px;
  font-size: 24px;
  font-weight: bold;
  color: #333;
  text-align: center;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #333;
`;

const Marker = styled.div`
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 15px solid transparent;
  border-right: 15px solid transparent;
  border-top: 30px solid #333;
  z-index: 1;
`;

const rewards = [
  { name: '10K Points', value: 10000, type: 'POINTS', color: '#FF6B6B' },
  { name: '100K Points', value: 100000, type: 'POINTS', color: '#4ECDC4' },
  { name: '5K Points', value: 5000, type: 'POINTS', color: '#45B7D1' },
  { name: '50K Points', value: 50000, type: 'POINTS', color: '#F7B731' },
  { name: '200K Points', value: 200000, type: 'POINTS', color: '#5D9CEC' },
  { name: '1 TON', value: 1, type: 'TON', color: '#AC92EC' },
  { name: '0.1 TON', value: 0.1, type: 'TON', color: '#EC87C0' },
  { name: '0.5 TON', value: 0.5, type: 'TON', color: '#5D9CEC' },
  { name: 'Try Again', value: 0, type: 'NONE', color: '#ED5565' },
  { name: '3 Extra Spins', value: 3, type: 'SPINS', color: '#A0D468' }
];

const WheelOfFortune = ({ onClose }) => {
  const [spinning, setSpinning] = useState(false);
  const [reward, setReward] = useState('');
  const [spinsLeft, setSpinsLeft] = useState(3);
  const [nextSpinTime, setNextSpinTime] = useState(null);
  const { balance, setBalance, tapBalance, setTapBalance } = useUser();
  const wheelRef = useRef(null);

  const loadUserSpinData = useCallback(async () => {
    const telegramUser = window.Telegram.WebApp.initDataUnsafe?.user;
    if (telegramUser) {
      const { id: userId } = telegramUser;
      const userRef = doc(db, 'telegramUsers', userId.toString());
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data();
      
      if (userData?.spinsLeft !== undefined) {
        setSpinsLeft(userData.spinsLeft);
      }
      if (userData?.nextSpinTime) {
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
      try {
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
      } catch (error) {
        console.error("Error updating user spin data:", error);
      }
    }
  };

  const spin = async () => {
    if (spinsLeft > 0 && (!nextSpinTime || new Date() > nextSpinTime)) {
      setSpinning(true);
      const randomDegrees = Math.floor(Math.random() * 360) + 1440; // At least 4 full spins
      const selectedRewardIndex = Math.floor(randomDegrees % 360 / 36);
      const selectedReward = rewards[selectedRewardIndex];

      if (wheelRef.current) {
        wheelRef.current.style.transform = `rotateY(${randomDegrees}deg)`;
      }

      setTimeout(() => {
        setSpinning(false);
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
        // No reward or "Try Again"
        break;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg relative">
        <CloseButton onClick={onClose}>&times;</CloseButton>
        <WheelContainer>
          <Marker />
          <Wheel ref={wheelRef}>
            {rewards.map((reward, index) => (
              <WheelSection
                key={index}
                color={reward.color}
                style={{ transform: `rotateY(${index * 36}deg) translateZ(150px)` }}
              >
                {reward.type === 'TON' ? (
                  <img src={tonIcon} alt="TON" className="w-6 h-6" />
                ) : (
                  reward.name
                )}
              </WheelSection>
            ))}
          </Wheel>
        </WheelContainer>
        <SpinButton onClick={spin} disabled={spinning || spinsLeft === 0 || (nextSpinTime && new Date() < nextSpinTime)}>
          {spinning ? 'Spinning...' : 'SPIN'}
        </SpinButton>
        <RewardDisplay>{reward}</RewardDisplay>
        <div className="text-center mt-4">
          <div>Spins left today: {spinsLeft}</div>
          {nextSpinTime && new Date() < nextSpinTime && (
            <div>Next spin available in: {Math.ceil((nextSpinTime.getTime() - Date.now()) / 60000)} minutes</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WheelOfFortune;