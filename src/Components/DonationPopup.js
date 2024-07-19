import React, { useState } from 'react';
import styled from "styled-components";
import { IoClose, IoTrophy } from "react-icons/io5";

const PopupContainer = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
`;

const PopupContent = styled.div`
  background-color: #1e2340;
  border-radius: 20px;
  padding: 24px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
`;

const LeaderboardContainer = styled.div`
  background-color: #343b66;
  border-radius: 15px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
`;

const LeaderboardTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const LeaderboardList = styled.ul`
  list-style-type: none;
  padding: 0;
`;

const LeaderboardItem = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #4a5280;
  &:last-child {
    border-bottom: none;
  }
`;

const LeaderboardRank = styled.span`
  font-weight: 600;
  color: #ffd700;
  margin-right: 10px;
`;

const LeaderboardUsername = styled.span`
  color: #ffffff;
`;

const LeaderboardPoints = styled.span`
  font-weight: 600;
  color: #3d47ff;
`;

const DonationPopup = ({ campaign, onClose, onDonate, balance, formatNumber }) => {
  const [donationAmount, setDonationAmount] = useState(0);

  const handleDonationSubmit = () => {
    onDonate(donationAmount);
  };

  return (
    <PopupContainer>
      <PopupContent>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-[24px] font-semibold">{campaign.title}</h2>
          <button onClick={onClose} className="text-[#9a96a6]">
            <IoClose size={24} />
          </button>
        </div>
        {campaign.image && (
          <img 
            src={campaign.image} 
            alt={campaign.title} 
            className="w-full h-[200px] object-cover rounded-[10px] mb-4"
          />
        )}
        <p className="text-[14px] text-[#b8b8b8] mb-4 leading-[1.4]">
          {campaign['large-description'] || 'No detailed description available'}
        </p>
        <div className="mb-4">
          <h3 className="text-[18px] font-semibold mb-2">Progress</h3>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[16px]">
              {formatNumber(campaign.pointsRaised)} / {formatNumber(campaign.targetPoints)} points
            </span>
          </div>
          <div className="w-full h-[10px] bg-[#1a1f3d] rounded-[5px]">
            <div 
              className="h-full bg-[#3d47ff] rounded-[5px]"
              style={{ width: `${Math.min(100, (campaign.pointsRaised / campaign.targetPoints) * 100)}%` }}
            ></div>
          </div>
        </div>
        
        <LeaderboardContainer>
          <LeaderboardTitle>
            <IoTrophy size={24} color="#ffd700" />
            Top Donors
          </LeaderboardTitle>
          <LeaderboardList>
            {campaign.leaderboard.map((donor, index) => (
              <LeaderboardItem key={index}>
                <div>
                  <LeaderboardRank>{index + 1}.</LeaderboardRank>
                  <LeaderboardUsername>{donor.username}</LeaderboardUsername>
                </div>
                <LeaderboardPoints>{formatNumber(donor.amount)} points</LeaderboardPoints>
              </LeaderboardItem>
            ))}
          </LeaderboardList>
        </LeaderboardContainer>
        
        <div className="mb-4">
          <h3 className="text-[18px] font-semibold mb-2">Donate</h3>
          <input
            type="number"
            value={donationAmount}
            onChange={(e) => setDonationAmount(Number(e.target.value))}
            className="w-full bg-[#252e57] text-white rounded-[8px] p-2 mb-4"
            placeholder="Enter donation amount"
          />
          <p className="text-[14px] text-[#9a96a6] mb-2">Your current balance: {formatNumber(balance)} points</p>
        </div>
        <button
          onClick={handleDonationSubmit}
          className="w-full bg-gradient-to-b from-[#3d47ff] to-[#575fff] py-3 rounded-[12px] text-white font-semibold"
          disabled={donationAmount <= 0 || donationAmount > balance}
        >
          Confirm Donation
        </button>
      </PopupContent>
    </PopupContainer>
  );
};

export default DonationPopup;