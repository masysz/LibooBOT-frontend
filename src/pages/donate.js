import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { doc, collection, getDocs, runTransaction, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import styled from "styled-components";
import Animate from '../Components/Animate';
import Spinner from '../Components/Spinner';
import { useUser } from '../context/userContext';
import { IoClose, IoCheckmarkCircle, IoTrophy } from "react-icons/io5";
import congratspic from '../images/congrats.png';

const Container = styled.div`
  position: relative;
  display: inline-block;
  text-align: center;
  width: 100%;
  height: 100%;
  margin-bottom: 100px;
  overflow-y: auto;
  max-height: calc(100vh - 100px);
  scrollbar-width: none;
  -ms-overflow-style: none;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const CampaignCard = styled.div`
  background-color: #2a2f4e;
  border-radius: 15px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease-in-out;
  &:hover {
    transform: translateY(-5px);
  }
`;

const CampaignImage = styled.img`
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
  overflow: hidden;
`;

const ProgressBar = styled.div`
  height: 100%;
  background-color: #3d47ff;
  border-radius: 5px;
  transition: width 0.5s ease-in-out;
`;

const Description = styled.p`
  font-size: 14px;
  color: #b8b8b8;
  margin-bottom: 15px;
  line-height: 1.4;
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

const Button = styled.button`
  width: 100%;
  background: linear-gradient(to bottom, #3d47ff, #575fff);
  color: white;
  font-weight: 600;
  padding: 12px;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  transition: opacity 0.3s ease;
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  &:hover:not(:disabled) {
    opacity: 0.9;
  }
`;

const Donate = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [donationAmount, setDonationAmount] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { balance, setBalance, loading: userLoading, id, username } = useUser();
  const [congrats, setCongrats] = useState(false);

  const fetchCampaigns = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const campaignsCollection = collection(db, 'campaigns');
      const campaignsSnapshot = await getDocs(campaignsCollection);
      const campaignsList = await Promise.all(campaignsSnapshot.docs.map(async doc => {
        const campaignData = {
          id: doc.id,
          ...doc.data(),
          image: doc.data().image && typeof doc.data().image === 'string' ? doc.data().image : null
        };
        
        const leaderboardQuery = query(
          collection(db, `campaigns/${doc.id}/donations`),
          orderBy('amount', 'desc'),
          limit(5)
        );
        const leaderboardSnapshot = await getDocs(leaderboardQuery);
        const leaderboard = leaderboardSnapshot.docs.reduce((acc, donationDoc) => {
          const { username, amount } = donationDoc.data();
          const existingDonor = acc.find(donor => donor.username === username);
          if (existingDonor) {
            existingDonor.amount += amount;
          } else {
            acc.push({ username, amount });
          }
          return acc;
        }, []).sort((a, b) => b.amount - a.amount).slice(0, 5);
        
        return { ...campaignData, leaderboard };
      }));
      setCampaigns(campaignsList);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      setError("Failed to load campaigns. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const handleCampaignClick = useCallback((campaign) => {
    setSelectedCampaign(campaign);
    setShowPopup(true);
  }, []);

  const handleDonationSubmit = useCallback(async () => {
    if (donationAmount <= 0 || isNaN(donationAmount)) {
      alert("Please enter a valid donation amount.");
      return;
    }
    if (donationAmount > balance) {
      alert("Insufficient balance!");
      return;
    }
    if (!id || !username) {
      alert("You must be logged in to donate.");
      return;
    }

    try {
      await runTransaction(db, async (transaction) => {
        const campaignRef = doc(db, 'campaigns', selectedCampaign.id);
        const userRef = doc(db, 'telegramUsers', id.toString());
        const donationRef = doc(collection(db, `campaigns/${selectedCampaign.id}/donations`));

        const campaignDoc = await transaction.get(campaignRef);
        const userDoc = await transaction.get(userRef);

        if (!campaignDoc.exists() || !userDoc.exists()) {
          throw "Document does not exist!";
        }

        const currentCampaignData = campaignDoc.data();
        const newCampaignPoints = currentCampaignData.pointsRaised + donationAmount;
        const newUserBalance = userDoc.data().balance - donationAmount;

        if (newUserBalance < 0) {
          throw "Insufficient balance!";
        }

        let updatedLeaderboard = [...(currentCampaignData.leaderboard || [])];
        const existingDonorIndex = updatedLeaderboard.findIndex(donor => donor.username === username);
        
        if (existingDonorIndex !== -1) {
          updatedLeaderboard[existingDonorIndex].amount += donationAmount;
        } else {
          updatedLeaderboard.push({ username, amount: donationAmount });
        }
        
        updatedLeaderboard.sort((a, b) => b.amount - a.amount);
        updatedLeaderboard = updatedLeaderboard.slice(0, 5);

        transaction.update(campaignRef, { 
          pointsRaised: newCampaignPoints,
          leaderboard: updatedLeaderboard
        });
        transaction.update(userRef, { balance: newUserBalance });
        transaction.set(donationRef, {
          username: username,
          amount: donationAmount,
          timestamp: new Date()
        });
      });

      setBalance(prevBalance => prevBalance - donationAmount);
      setCampaigns(prevCampaigns => 
        prevCampaigns.map(campaign =>
          campaign.id === selectedCampaign.id
            ? { 
                ...campaign, 
                pointsRaised: campaign.pointsRaised + donationAmount,
                leaderboard: updateLeaderboard(campaign.leaderboard, username, donationAmount)
              }
            : campaign
        )
      );
      
      setCongrats(true);
      setTimeout(() => setCongrats(false), 3000);

      setShowPopup(false);
      setDonationAmount(0);
    } catch (error) {
      console.error("Error processing donation:", error);
      alert("An error occurred while processing your donation. Please try again.");
    }
  }, [donationAmount, balance, id, username, selectedCampaign, db, setBalance]);

  const updateLeaderboard = (leaderboard, username, amount) => {
    const updatedLeaderboard = [...leaderboard];
    const existingDonorIndex = updatedLeaderboard.findIndex(donor => donor.username === username);
    
    if (existingDonorIndex !== -1) {
      updatedLeaderboard[existingDonorIndex].amount += amount;
    } else {
      updatedLeaderboard.push({ username, amount });
    }
    
    return updatedLeaderboard.sort((a, b) => b.amount - a.amount).slice(0, 5);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num).replace(/,/g, " ");
  };

  const renderCampaignImage = useCallback((campaign) => {
    if (!campaign.image) {
      console.log(`No image URL for campaign: ${campaign.id}`);
      return null;
    }
    return (
      <CampaignImage 
        src={campaign.image} 
        alt={campaign.title} 
        onError={(e) => {
          console.error(`Error loading image for campaign ${campaign.id}:`, e);
          e.target.src = 'https://via.placeholder.com/400x200?text=Image+Not+Found';
        }}
      />
    );
  }, []);

  const memoizedCampaigns = useMemo(() => (
    campaigns.map(campaign => (
      <CampaignCard key={campaign.id}>
        {renderCampaignImage(campaign)}
        <h2 className="text-[24px] font-semibold mb-2">{campaign.title}</h2>
        <Description>{campaign['short-description'] || 'No description available'}</Description>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[18px] font-medium">
            {formatNumber(campaign.pointsRaised)} / {formatNumber(campaign.targetPoints)} points
          </span>
        </div>
        <ProgressBarContainer>
          <ProgressBar style={{ width: `${(campaign.pointsRaised / campaign.targetPoints) * 100}%` }} />
        </ProgressBarContainer>
        <Button onClick={() => handleCampaignClick(campaign)}>
          View Campaign
        </Button>
      </CampaignCard>
    ))
  ), [campaigns, handleCampaignClick, renderCampaignImage]);

  if (userLoading || isLoading) {
    return <Spinner />;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <Animate>
      <Container>
        <div className="w-full absolute top-[-35px] left-0 right-0 flex justify-center z-20 pointer-events-none select-none">
          {congrats ? <img src={congratspic} alt="congrats" className="w-[80%]" /> : null}
        </div>

        <div className="w-full flex justify-center flex-col items-center">
          <h1 className="text-[32px] font-semibold mb-4">Donate to Campaigns</h1>

          <div className="w-full flex flex-col space-y-4 pb-20">
            {memoizedCampaigns}
          </div>
        </div>
      </Container>

      {showPopup && selectedCampaign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#1e2340] rounded-[20px] p-6 w-[90%] max-w-[500px] max-h-[90vh] overflow-y-auto scrollbar-hide">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-[24px] font-semibold">{selectedCampaign.title}</h2>
              <button onClick={() => setShowPopup(false)} className="text-[#9a96a6]">
                <IoClose size={24} />
              </button>
            </div>
            {renderCampaignImage(selectedCampaign)}
            <Description>{selectedCampaign['large-description'] || 'No detailed description available'}</Description>
            <div className="mb-4">
              <h3 className="text-[18px] font-semibold mb-2">Progress</h3>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[16px]">
                  {formatNumber(selectedCampaign.pointsRaised)} / {formatNumber(selectedCampaign.targetPoints)} points
                </span>
              </div>
              <ProgressBarContainer>
                <ProgressBar style={{ width: `${(selectedCampaign.pointsRaised / selectedCampaign.targetPoints) * 100}%` }} />
              </ProgressBarContainer>
            </div>
            
            <LeaderboardContainer>
              <LeaderboardTitle>
                <IoTrophy size={24} color="#ffd700" />
                Top Donors
              </LeaderboardTitle>
              <LeaderboardList>
                {selectedCampaign.leaderboard.map((donor, index) => (
                  <LeaderboardItem key={index}>
                    <div>
                      <LeaderboardRank>{index + 1}.</LeaderboardRank>
                      <LeaderboardUsername>{donor.username}</LeaderboardUsername>
                    </div>
                    <LeaderboardPoints>{formatNumber(donor.amount)}</LeaderboardPoints>
                  </LeaderboardItem>
                ))}
              </LeaderboardList>
            </LeaderboardContainer>

            <div className="mt-4">
              <h3 className="text-[18px] font-semibold mb-2">Make a Donation</h3>
              <input
                type="number"
                value={donationAmount}
                onChange={(e) => setDonationAmount(parseFloat(e.target.value) || 0)}
                placeholder="Enter amount"
                className="w-full p-2 rounded-md border border-gray-400"
              />
              <Button onClick={handleDonationSubmit} disabled={donationAmount <= 0 || donationAmount > balance}>
                Donate {donationAmount > 0 ? `($${donationAmount})` : ""}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Animate>
  );
};

export default Donate;
