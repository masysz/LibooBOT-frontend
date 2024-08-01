import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';
import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useUser } from '../context/userContext';
import { IoCheckmarkCircle, IoTrophyOutline } from 'react-icons/io5';
import { FaLock } from 'react-icons/fa';

const maxStakingPerUser = 2;

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
  flex-direction: column;
  background-color: #f9fafb;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;

  @media (min-width: 640px) {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
`;

const StakeInfo = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;

  @media (min-width: 640px) {
    margin-bottom: 0;
  }
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

const StakeReward = styled.span`
  font-size: 14px;
  color: #10B981;
  font-weight: 500;
`;

const StakeProgressWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;

  @media (min-width: 640px) {
    width: auto;
    align-items: flex-end;
  }
`;

const StakeProgress = styled.div`
  width: 100%;
  height: 8px;
  background-color: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;

  @media (min-width: 640px) {
    width: 100px;
  }
`;

const ProgressFill = styled.div`
  height: 100%;
  background-color: #1890ff;
  width: ${props => props.progress}%;
`;

const ClaimButton = styled.button`
  background: linear-gradient(to right, #10B981, #059669);
  color: white;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 14px;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;

  @media (min-width: 640px) {
    width: auto;
  }

  &:hover {
    background: linear-gradient(to right, #059669, #10B981);
  }

  svg {
    margin-right: 0.5rem;
  }
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


const StakeLimitMessage = styled.p`
  color: #EF4444;
  font-size: 14px;
  margin-top: 1rem;
`;

const Staking = () => {
  const { id, balance, setBalance } = useUser();
  const [selectedOption, setSelectedOption] = useState(null);
  const [stakeAmount, setStakeAmount] = useState(0);
  const [activeStakes, setActiveStakes] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [congrats, setCongrats] = useState(false);

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

  const canStake = useMemo(() => {
    return activeStakes.length < maxStakingPerUser;
  }, [activeStakes]);

  const handleStake = async () => {
    if (!selectedOption || stakeAmount <= 0 || stakeAmount > balance || !canStake) return;

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
      setCongrats(true);
      setTimeout(() => setCongrats(false), 3000);
    } catch (error) {
      console.error("Error processing stake:", error);
      alert("An error occurred while processing your stake. Please try again.");
    }
  };

  const handleClaim = async (stakeIndex) => {
    try {
      const userRef = doc(db, 'telegramUsers', id.toString());
      const userStakesRef = doc(db, 'userStakes', id);

      const stake = activeStakes[stakeIndex];
      const reward = Math.floor(stake.amount * (stake.apr / 100) * (stake.duration / 365));

      await updateDoc(userRef, {
        balance: balance + stake.amount + reward
      });

      const updatedStakes = activeStakes.filter((_, index) => index !== stakeIndex);
      await updateDoc(userStakesRef, {
        stakes: updatedStakes
      });

      setBalance(prevBalance => prevBalance + stake.amount + reward);
      setActiveStakes(updatedStakes);
      alert(`Successfully claimed ${formatNumber(stake.amount + reward)} points!`);
      
    } catch (error) {
      console.error("Error claiming stake:", error);
      alert("An error occurred while claiming your stake. Please try again.");
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
            disabled={!selectedOption || stakeAmount <= 0 || stakeAmount > balance || !canStake}
          >
            {canStake ? 'Stake Now' : <><FaLock /> Stake Limit Reached</>}
          </StakeButton>
  
          {!canStake && (
            <StakeLimitMessage>
              You have reached the maximum number of active stakes ({maxStakingPerUser}).
            </StakeLimitMessage>
          )}
        </StakeAmountSection>
  
        <ActiveStakesSection>
          <ActiveStakesTitle>Your Active Stakes</ActiveStakesTitle>
          {activeStakes.length === 0 ? (
            <p>You don't have any active stakes.</p>
          ) : (
            activeStakes.map((stake, index) => {
              const progress = calculateProgress(stake);
              const estimatedReward = Math.floor(stake.amount * (stake.apr / 100) * (stake.duration / 365));
              return (
                <StakeItem key={index}>
                  <StakeInfo>
                    <StakeAmount>{formatNumber(stake.amount)} points staked</StakeAmount>
                    <StakeDetails>{stake.apr}% APR for {stake.duration} days</StakeDetails>
                    <StakeReward>Estimated reward: {formatNumber(estimatedReward)} points</StakeReward>
                  </StakeInfo>
                  <StakeProgressWrapper>
                    <StakeProgress>
                      <ProgressFill progress={progress} />
                    </StakeProgress>
                    {progress === 100 ? (
                      <ClaimButton onClick={() => handleClaim(index)}>
                        <IoTrophyOutline /> Claim {formatNumber(stake.amount + estimatedReward)} points
                      </ClaimButton>
                    ) : (
                      <StakeDetails>{Math.floor(progress)}% complete</StakeDetails>
                    )}
                  </StakeProgressWrapper>
                </StakeItem>
            )}))};
         
            
        
        </ActiveStakesSection>
      </ContentWrapper>
  
      <AnimatePresence>
            {congrats && (
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                className="fixed bottom-6 left-0 right-0 px-4 z-50"
              >
            <div className="w-full text-[#54d192] flex items-center space-x-2 px-4 bg-[#121620ef] h-[50px] rounded-[8px]">
          <IoCheckmarkCircle size={24} />
          <span className="font-medium">Good</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
    </PageContainer>
  );
  };
  
  export default React.memo(Staking);