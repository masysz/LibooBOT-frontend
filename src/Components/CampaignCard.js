import React from 'react';
import styled from "styled-components";

const Card = styled.div`
  background-color: #2a2f4e;
  border-radius: 15px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const Image = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 10px;
  margin-bottom: 15px;
`;

const ProgressBarContainer = styled.div`
  width: 100%;
  height: 10px;
  background-color: #1a1f3d;
  border-radius: 5px;
  margin-top: 10px;
`;

const ProgressBar = styled.div`
  height: 100%;
  background-color: #3d47ff;
  border-radius: 5px;
  width: ${props => `min(100%, ${(props.progress / props.target) * 100}%)`};
`;

const Description = styled.p`
  font-size: 14px;
  color: #b8b8b8;
  margin-bottom: 15px;
  line-height: 1.4;
`;

const CampaignCard = ({ campaign, onCampaignClick, formatNumber }) => {
  return (
    <Card>
      {campaign.image && (
        <Image 
          src={campaign.image} 
          alt={campaign.title} 
          onError={(e) => {
            console.error(`Error loading image for campaign ${campaign.id}:`, e);
            e.target.src = 'https://via.placeholder.com/400x200?text=Image+Not+Found';
          }}
        />
      )}
      <h2 className="text-[24px] font-semibold mb-2">{campaign.title}</h2>
      <Description>{campaign['short-description'] || 'No description available'}</Description>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[18px] font-medium">
          {formatNumber(campaign.pointsRaised)} / {formatNumber(campaign.targetPoints)} points
        </span>
      </div>
      <ProgressBarContainer>
        <ProgressBar progress={campaign.pointsRaised} target={campaign.targetPoints} />
      </ProgressBarContainer>
      <button 
        onClick={() => onCampaignClick(campaign)} 
        className="mt-4 w-full bg-gradient-to-b from-[#3d47ff] to-[#575fff] px-4 py-2 rounded-[8px] text-white font-semibold"
      >
        View Campaign
      </button>
    </Card>
  );
};

export default CampaignCard;