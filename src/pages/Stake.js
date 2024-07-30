import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';
import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useUser } from '../context/userContext';
import coinsmall from "../images/main-logo.png";
import { IoClose, IoCheckmarkCircle } from 'react-icons/io5';

const maxStakingPerUser = 2

const PageContainer = styled.div`
  display: flex;
  height: 85vh;
  flex-direction: column;
  overflow: hidden;
`;

const ContentWrapper = styled.div`
  width: 100%;
  max-width: 64rem;
  margin: 0 auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  flex: 1;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
  }

  &::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #555;
  }
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: 1.5rem;
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: bold;
  color: #262626;
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  font-size: 16px;
  font-weight: 500;
  color: #4b5563;
`;

const StakingOptionsContainer = styled.div`
  display: inline-flex;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
`;

const StakingOption = styled.div`
  background-color: ${props => props.selected ? '#e6f7ff' : '#ffffff'};
  border: 2px solid ${props => props.selected ? '#1890ff' : '#e5e7eb'};
  border-radius: 0.5rem;
  padding: 1rem;
  cursor: pointer;
  text-align: center;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    text-align: center;
  }
`;

const OptionTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #262626;
  margin-bottom: 0.5rem;
`;

const APR = styled.p`
  font-size: 18px;
  font-weight: 700;
  color: #1890ff;
  margin-bottom: 0.5rem;
`;

const Duration = styled.p`
  font-size: 13px;
  color: #4b5563;
`;

const StakeAmountSection = styled.div`
  background-color: #ffffff;
  border-radius: 0.5rem;
  padding: 1.5rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  
`;

const BalanceInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const BalanceText = styled.p`
  font-size: 16px;
  color: #4b5563;
`;

const BalanceAmount = styled.span`
  font-weight: 600;
  color: #262626;
`;

const SliderContainer = styled.div`
  margin-bottom: 1rem;
`;

const StyledSlider = styled.input`
  width: 100%;
  -webkit-appearance: none;
  height: 8px;
  border-radius: 4px;
  background: #e5e7eb;
  outline: none;
  opacity: 0.7;
  transition: opacity 0.2s;

  &:hover {
    opacity: 1;
  }

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #1890ff;
    cursor: pointer;
  }

  &::-moz-range-thumb {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #1890ff;
    cursor: pointer;
  }
`;

const AmountInput = styled.input`
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.25rem;
  font-size: 15px;
  margin-bottom: 1rem;
`;

const RewardsPreview = styled.div`
  background-color: #f9fafb;
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 2rem;
`;

const RewardsTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #262626;
  margin-bottom: 1rem;
`;

const RewardItem = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
`;

const RewardLabel = styled.span`
  color: #4b5563;
`;

const RewardValue = styled.span`
  font-weight: 600;
  color: #262626;
`;

const StakeButton = styled.button`
  background: linear-gradient(to right, #094e9d, #0b62c4);
  color: white;
  font-weight: 500;
  padding: 0.75rem 1rem;
  border-radius: 0.375rem;
  width: 100%;
  font-size: 18px;
  transition: all 0.3s;

  &:hover {
    background: linear-gradient(to right, #0b62c4, #094e9d);
  }

  &:disabled {
    background: #cbd5e0;
    cursor: not-allowed;
  }
`;

const ActiveStakesSection = styled.div`
  background-color: #ffffff;
  border-radius: 0.5rem;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const ActiveStakesTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: #262626;
  margin-bottom: 1rem;
`;

const StakeItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: #f9fafb;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
`;

const StakeInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const StakeAmount = styled.span`
  font-size: 18px;
  font-weight: 600;
  color: #262626;
`;

const StakeDetails = styled.span`
  font-size: 14px;
  color: #4b5563;
`;

const StakeProgress = styled.div`
  width: 100px;
  height: 8px;
  background-color: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  background-color: #1890ff;
  width: ${props => props.progress}%;
`;

const PopupOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
`;

const PopupContent = styled(motion.div)`
  background-color: white;
  border-radius: 1rem;
  padding: 2rem;
  width: 90%;
  max-width: 400px;
  text-align: center;
`;

const Staking = () => {
  const { id, balance, setBalance } = useUser();
  const [selectedOption, setSelectedOption] = useState(null);
  const [stakeAmount, setStakeAmount] = useState(0);
  const [activeStakes, setActiveStakes] = useState([]);
  const [showPopup, setShowPopup] = useState(false);

  const stakingOptions = [
    { id: 1, apr: 2, duration: 4, label: '4 Days' },
    { id: 2, apr: 7, duration: 7, label: '7 Days' },
    { id: 3, apr: 20, duration: 14, label: '14 Days' },
  ];

  const fetchActiveStakes = useCallback(async () => {
    if (id) {
      const userStakesRef = doc(db, 'userStakes', id);
      const userStakesDoc = await getDoc(userStakesRef);
      if (userStakesDoc.exists()) {
        setActiveStakes(userStakesDoc.data().stakes || []);
      }
    }
  }, [id]);

  useEffect(() => {
    fetchActiveStakes();
  }, [fetchActiveStakes]);

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
  };

  const handleStakeAmountChange = (e) => {
    const value = Math.min(Number(e.target.value), balance);
    setStakeAmount(value);
  };

  const handleSliderChange = (e) => {
    const value = Math.min(Number(e.target.value), balance);
    setStakeAmount(value);
  };

  const calculateRewards = useMemo(() => {
    if (!selectedOption || stakeAmount <= 0) return 0;
    const dailyRate = selectedOption.apr / selectedOption.duration / 100;
    return stakeAmount * dailyRate * selectedOption.duration;
  }, [selectedOption, stakeAmount]);

  const handleStake = async () => {
    if (!selectedOption || stakeAmount <= 0 || stakeAmount > balance) return;

    try {
      const userRef = doc(db, 'telegramUsers', id.toString());
      const userStakesRef = doc(db, 'userStakes', id);

      await updateDoc(userRef, {
        balance: balance - stakeAmount
      });

      const newStake = {
        amount: stakeAmount,
        apr: selectedOption.apr,
        duration: selectedOption.duration,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + selectedOption.duration * 24 * 60 * 60 * 1000).toISOString(),
      };

      const userStakesDoc = await getDoc(userStakesRef);
      if (userStakesDoc.exists()) {
        await updateDoc(userStakesRef, {
          stakes: [...userStakesDoc.data().stakes, newStake]
        });
      } else {
        await setDoc(userStakesRef, { stakes: [newStake] });
      }

      setBalance(prevBalance => prevBalance - stakeAmount);
      setActiveStakes(prevStakes => [...prevStakes, newStake]);
      setStakeAmount(0);
      setSelectedOption(null);
      setShowPopup(true);
    } catch (error) {
      console.error("Error processing stake:", error);
      alert("An error occurred while processing your stake. Please try again.");
    }
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num).replace(/,/g, " ");
  };

  const calculateProgress = (stake) => {
    const now = new Date();
    const start = new Date(stake.startDate);
    const end = new Date(stake.endDate);
    const totalDuration = end - start;
    const elapsed = now - start;
    return Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
  };

  return (
    <PageContainer>
      <ContentWrapper>
        <Header>
          <Title>Stake Your Points</Title>
          <Subtitle>Earn rewards by staking your points</Subtitle>
        </Header>

        <StakingOptionsContainer>
          {stakingOptions.map(option => (
            <StakingOption
              key={option.id}
              selected={selectedOption?.id === option.id}
              onClick={() => handleOptionSelect(option)}
            >
              <OptionTitle>{option.label}</OptionTitle>
              <APR>{option.apr}%</APR>
              <Duration>{option.duration} days lock-up</Duration>
            </StakingOption>
          ))}
        </StakingOptionsContainer>

        <StakeAmountSection>
          <BalanceInfo>
            <BalanceText>Your Balance:</BalanceText>
            <BalanceAmount>{formatNumber(balance)} points</BalanceAmount>
          </BalanceInfo>

          <SliderContainer>
            <StyledSlider
              type="range"
              min="0"
              max={balance}
              value={stakeAmount}
              onChange={handleSliderChange}
            />
          </SliderContainer>

          <AmountInput
            type="number"
            value={stakeAmount}
            onChange={handleStakeAmountChange}
            placeholder="Enter stake amount"
            max={balance}
          />

          <RewardsPreview>
            <RewardsTitle>Rewards Preview</RewardsTitle>
            <RewardItem>
              <RewardLabel>Stake Amount:</RewardLabel>
              <RewardValue>{formatNumber(stakeAmount)} points</RewardValue>
            </RewardItem>
            <RewardItem>
              <RewardLabel>Estimated Reward:</RewardLabel>
              <RewardValue>{formatNumber(Math.floor(calculateRewards))} points</RewardValue>
            </RewardItem>
            <RewardItem>
              <RewardLabel>Total Return:</RewardLabel>
              <RewardValue>{formatNumber(Math.floor(stakeAmount + calculateRewards))} points</RewardValue>
            </RewardItem>
          </RewardsPreview>

          <StakeButton
            onClick={handleStake}
            disabled={!selectedOption || stakeAmount <= 0 || stakeAmount > balance}
          >
            Stake Now
          </StakeButton>
        </StakeAmountSection>

        <ActiveStakesSection>
          <ActiveStakesTitle>Your Active Stakes</ActiveStakesTitle>
          {activeStakes.length === 0 ? (
            <p>You don't have any active stakes.</p>
          ) : (
            activeStakes.map((stake, index) => (
              <StakeItem key={index}>
                <StakeInfo>
                  <StakeAmount>{formatNumber(stake.amount)} points</StakeAmount>
                  <StakeDetails>{stake.apr}% PR for {stake.duration} days</StakeDetails>
                </StakeInfo>
                <StakeProgress>
                  <ProgressFill progress={calculateProgress(stake)} />
                </StakeProgress>
              </StakeItem>
            ))
          )}
        </ActiveStakesSection>
      </ContentWrapper>

      <AnimatePresence>
        {showPopup && (
          <PopupOverlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <PopupContent
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <IoCheckmarkCircle size={50} color="#4CAF50" />
              <h2>Stake Successful!</h2>
              <p>Your points have been successfully staked.</p>
              <StakeButton onClick={() => setShowPopup(false)}>Close</StakeButton>
            </PopupContent>
          </PopupOverlay>
        )}
      </AnimatePresence>
    </PageContainer>
  );
};

export default React.memo(Staking);