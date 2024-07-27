import React, { useState } from 'react';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { useUser } from '../context/userContext';
import { IoCheckmarkCircle } from 'react-icons/io5';
import styled from 'styled-components';
import Animate from '../Components/Animate';
import congratspic from "../images/celebrate.gif";
import coinsmall from "../images/main-logo.png";

const friendsRewards = [
  { title: 'Invite 3 friends', referralsRequired: 2, bonusAward: 50000, imgRef: '/ref1.webp' },
  { title: 'Invite 5 friends', referralsRequired: 5, bonusAward: 150000, imgRef: '/ref2.webp' },
  { title: 'Invite 10 friends', referralsRequired: 10, bonusAward: 250000, imgRef: '/ref3.webp' },
];

const RewardsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const RewardItem = styled.div`
  background-color: #ffffff;
  border-radius: 10px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;

  &:hover {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
`;

const RewardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
`;

const RewardIconTitle = styled.div`
  display: flex;
  align-items: center;
`;

const RewardIcon = styled.img`
  width: 55px;
  height: 55px;
  margin-right: 10px;
`;

const RewardTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #171717;
`;

const RewardBonus = styled.div`
  display: flex;
  align-items: center;
  font-size: 14px;
  font-weight: 500;
  color: #171717;
`;

const ProgressBarContainer = styled.div`
  width: 100%;
  background-color: #f0f4ff;
  border-radius: 10px;
  overflow: hidden;
  margin-top: 10px;
`;

const ProgressBar = styled.div`
  height: 8px;
  background-color: #094e9d;
  border-radius: 10px;
  transition: width 0.3s ease;
`;

const ClaimButton = styled.button`
  background-color: ${props => props.disabled ? '#e5e7eb' : '#699cff'};
  color: ${props => props.disabled ? '#9ca3af' : '#ffffff'};
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: background-color 0.3s;
  margin-top: 10px;

  &:hover {
    background-color: ${props => props.disabled ? '#e5e7eb' : '#4fa764'};
  }
`;

const CongratsOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 50;
  pointer-events: none;
`;

const CongratsImage = styled.img`
  width: 80%;
  max-width: 300px;
`;

const ReferralRewards = () => {
  const { referrals, balance, setBalance, id, claimedReferralRewards, setClaimedReferralRewards } = useUser();
  const [congrats, setCongrats] = useState(false);

  const handleClaim = async (reward) => {
    if (referrals.length >= reward.referralsRequired && !claimedReferralRewards.includes(reward.title)) {
      const newBalance = balance + reward.bonusAward;
      try {
        const userRef = doc(db, 'telegramUsers', id);
        await updateDoc(userRef, {
          balance: newBalance,
          claimedReferralRewards: [...claimedReferralRewards, reward.title],
        });
        setBalance(newBalance);
        setClaimedReferralRewards([...claimedReferralRewards, reward.title]);
    
        setCongrats(true);

        setTimeout(() => {
          setCongrats(false);
        }, 4000);
      } catch (error) {
        console.error('Error claiming referral reward:', error);
      }
    }
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num).replace(/,/g, " ");
  };

  return (
    <Animate>
      <RewardsContainer>
        {friendsRewards.map((reward) => {
          const progress = (referrals.length / reward.referralsRequired) * 100;
          const isClaimable = referrals.length >= reward.referralsRequired && !claimedReferralRewards.includes(reward.title);
          return (
            <RewardItem key={reward.title}>
              <RewardHeader>
                <RewardIconTitle>
                  <RewardIcon src={reward.imgRef} alt={reward.title} />
                  <div>
                    <RewardTitle>{reward.title}</RewardTitle>
                    <RewardBonus>
                      <img src={coinsmall} alt="coin" style={{ width: '20px', marginRight: '4px' }} />
                      {formatNumber(reward.bonusAward)}
                    </RewardBonus>
                  </div>
                </RewardIconTitle>
                <ClaimButton
                  disabled={!isClaimable}
                  onClick={() => handleClaim(reward)}
                >
                  {isClaimable ? 'Claim' : 'Not Available'}
                </ClaimButton>
              </RewardHeader>
              <ProgressBarContainer>
                <ProgressBar style={{ width: `${Math.min(progress, 100)}%` }} />
              </ProgressBarContainer>
            </RewardItem>
          );
        })}
      </RewardsContainer>

      {congrats && (
        <CongratsOverlay>
          <CongratsImage src={congratspic} alt="Congratulations" />
        </CongratsOverlay>
      )}

      <div className={`${congrats ? "visible bottom-6" : "invisible bottom-[-10px]"} z-[60] ease-in duration-300 w-full fixed left-0 right-0 px-4`}>
        <div className="w-full text-[#54d192] flex items-center space-x-2 px-4 bg-[#121620ef] h-[50px] rounded-[8px]">
          <IoCheckmarkCircle size={24} />
          <span className="font-medium">Good</span>
        </div>
      </div>
    </Animate>
  );
};

export default ReferralRewards;