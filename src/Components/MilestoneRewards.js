import React, { useState } from 'react';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { useUser } from '../context/userContext';
import { IoCheckmarkCircle, IoCheckmarkSharp } from 'react-icons/io5';
import { MdOutlineKeyboardArrowRight } from 'react-icons/md';
import styled from 'styled-components';
import congratspic from "../images/celebrate.gif";
import coinsmall from "../images/coinsmall.webp";

const milestones = [
  { name: 'Liboo Novice', icon: '/warm.webp', tapBalanceRequired: 500000, reward: 50000 },
  { name: 'Liboo Apprentice', icon: '/light.webp', tapBalanceRequired: 1000000, reward: 100000 },
  { name: 'Liboo Adept', icon: '/blaze.webp', tapBalanceRequired: 2000000, reward: 250000 },
  { name: 'Liboo Journeyman', icon: '/flame.webp', tapBalanceRequired: 4000000, reward: 500000 },
  { name: 'Liboo Veteran', icon: '/hot.webp', tapBalanceRequired: 8000000, reward: 1000000 },
  { name: 'Liboo Expert', icon: '/burning.webp', tapBalanceRequired: 25000000, reward: 1500000 },
  { name: 'Liboo Virtuoso', icon: '/burning.webp', tapBalanceRequired: 50000000, reward: 2500000 },
  { name: 'Liboo Champion', icon: '/burning.webp', tapBalanceRequired: 100000000, reward: 5000000 },
  { name: 'Liboo Legend', icon: '/burning.webp', tapBalanceRequired: 250000000, reward: 10000000 },
  { name: 'Liboo Maestro', icon: '/burning.webp', tapBalanceRequired: 500000000, reward: 25000000 },
  { name: 'Liboo Destroyer', icon: '/burning.webp', tapBalanceRequired: 1000000000, reward: 50000000 },
];

const MilestoneContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const MilestoneItem = styled.div`
  background-color: #ffffff;
  border-radius: 0.5rem;
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;

  &:hover {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
`;

const MilestoneIcon = styled.img`
  width: 2.5rem;
  height: 2.5rem;
  margin-right: 1rem;
`;

const MilestoneInfo = styled.div`
  flex: 1;
`;

const MilestoneName = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #262626;
  margin-bottom: 0.25rem;
`;

const MilestoneReward = styled.div`
  display: flex;
  align-items: center;
  font-size: 0.875rem;
  color: #4b5563;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background-color: #f0f4ff;
  border-radius: 4px;
  margin-top: 0.5rem;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  background-color: #5bd173;
  border-radius: 4px;
  transition: width 0.3s ease;
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

const MilestoneRewards = () => {
  const { tapBalance, balance, setBalance, id, claimedMilestones, setClaimedMilestones } = useUser();
  const [congrats, setCongrats] = useState(false);

  const handleClaim = async (milestone) => {
    if (tapBalance >= milestone.tapBalanceRequired && !claimedMilestones.includes(milestone.name)) {
      const newBalance = balance + milestone.reward;
      try {
        const userRef = doc(db, 'telegramUsers', id);
        await updateDoc(userRef, {
          balance: newBalance,
          claimedMilestones: [...claimedMilestones, milestone.name],
        });
        setBalance(newBalance);
        setClaimedMilestones([...claimedMilestones, milestone.name]);
        setCongrats(true);
  
        setTimeout(() => {
          setCongrats(false);
        }, 4000);
      } catch (error) {
        console.error('Error claiming milestone reward:', error);
      }
    } else {
      console.error('Already Claimed or not eligible:');
    }
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num).replace(/,/g, " ");
  };

  return (
    <MilestoneContainer>
      {milestones.map((milestone) => {
        const progress = (tapBalance / milestone.tapBalanceRequired) * 100;
        const isClaimable = tapBalance >= milestone.tapBalanceRequired && !claimedMilestones.includes(milestone.name);
        const isClaimed = claimedMilestones.includes(milestone.name);
        
        return (
          <MilestoneItem key={milestone.name}>
            <MilestoneIcon src={milestone.icon} alt={milestone.name} />
            <MilestoneInfo>
              <MilestoneName>{milestone.name}</MilestoneName>
              <MilestoneReward>
                <img src={coinsmall} alt="coin" style={{ width: '1rem', marginRight: '0.25rem' }} />
                {formatNumber(milestone.reward)}
              </MilestoneReward>
              <ProgressBar>
                <ProgressFill style={{ width: `${Math.min(progress, 100)}%` }} />
              </ProgressBar>
            </MilestoneInfo>
            {isClaimed ? (
              <IoCheckmarkSharp size={20} color="#5bd173" />
            ) : isClaimable ? (
              <button
                onClick={() => handleClaim(milestone)}
                className="bg-btn text-black rounded-[8px] font-semibold py-2 px-3"
              >
                Claim
              </button>
            ) : (
              <MdOutlineKeyboardArrowRight size={20} color="#171717" />
            )}
          </MilestoneItem>
        );
      })}

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
    </MilestoneContainer>
  );
};

export default MilestoneRewards;