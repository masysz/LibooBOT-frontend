import React, { useState, useEffect, useCallback } from 'react';
import { doc, collection, getDocs, runTransaction, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import styled from "styled-components";
import Animate from '../Components/Animate';
import Spinner from '../Components/Spinner';
import { useUser } from '../context/userContext';
import { IoClose, IoCheckmarkCircle } from "react-icons/io5";
import congratspic from '../images/congrats.png';

const Container = styled.div`
  position: relative;
  display: inline-block;
  text-align: center;
  width: 100%;
  height: 100%;
  margin-bottom: 100px;
  overflow-y: scroll;
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
`;

const ProgressBar = styled.div`
  height: 100%;
  background-color: #3d47ff;
  border-radius: 5px;
`;

const Description = styled.p`
  font-size: 14px;
  color: #b8b8b8;
  margin-bottom: 15px;
  line-height: 1.4;
`;

const LeaderboardContainer = styled.div`
  background-color: #2a2f4e;
  border-radius: 15px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const LeaderboardTitle = styled.h2`
  font-size: 24px;
  font-weight: semibold;
  margin-bottom: 15px;
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
  border-bottom: 1px solid #3d3d3d;
  &:last-child {
    border-bottom: none;
  }
`;

const Donate = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [donationAmount, setDonationAmount] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { balance, setBalance, loading: userLoading, id } = useUser();
  const [congrats, setCongrats] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);

  const fetchCampaigns = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const campaignsCollection = collection(db, 'campaigns');
      const campaignsSnapshot = await getDocs(campaignsCollection);
      const campaignsList = campaignsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        image: doc.data().image && typeof doc.data().image === 'string' ? doc.data().image : null
      }));
      console.log("Processed campaigns:", campaignsList);
      setCampaigns(campaignsList);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      setError("Failed to load campaigns. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchLeaderboard = useCallback(async () => {
    try {
      const leaderboardQuery = query(
        collection(db, 'telegramUsers'),
        orderBy('totalDonated', 'desc'),
        limit(5)
      );
      const leaderboardSnapshot = await getDocs(leaderboardQuery);
      const leaderboardData = leaderboardSnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
        totalDonated: doc.data().totalDonated || 0
      }));
      setLeaderboard(leaderboardData);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    }
  }, []);

  useEffect(() => {
    fetchCampaigns();
    fetchLeaderboard();
  }, [fetchCampaigns, fetchLeaderboard]);

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
    if (!id) {
      alert("You must be logged in to donate.");
      return;
    }

    try {
      await runTransaction(db, async (transaction) => {
        const campaignRef = doc(db, 'campaigns', selectedCampaign.id);
        const userRef = doc(db, 'telegramUsers', id.toString());

        const campaignDoc = await transaction.get(campaignRef);
        const userDoc = await transaction.get(userRef);

        if (!campaignDoc.exists() || !userDoc.exists()) {
          throw "Document does not exist!";
        }

        const newCampaignPoints = campaignDoc.data().pointsRaised + donationAmount;
        const newUserBalance = userDoc.data().balance - donationAmount;
        const newTotalDonated = (userDoc.data().totalDonated || 0) + donationAmount;

        if (newUserBalance < 0) {
          throw "Insufficient balance!";
        }

        transaction.update(campaignRef, { pointsRaised: newCampaignPoints });
        transaction.update(userRef, { 
          balance: newUserBalance,
          totalDonated: newTotalDonated
        });
      });

      setBalance(prevBalance => prevBalance - donationAmount);
      setCampaigns(prevCampaigns => 
        prevCampaigns.map(campaign =>
          campaign.id === selectedCampaign.id
            ? { ...campaign, pointsRaised: campaign.pointsRaised + donationAmount }
            : campaign
        )
      );
      
      // Refresh leaderboard after donation
      fetchLeaderboard();
      
      setCongrats(true);
      setTimeout(() => setCongrats(false), 3000);

      setShowPopup(false);
      setDonationAmount(0);
    } catch (error) {
      console.error("Error processing donation:", error);
      alert("An error occurred while processing your donation. Please try again.");
    }
  }, [donationAmount, balance, id, selectedCampaign, db, setBalance, fetchLeaderboard]);

  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num).replace(/,/g, " ");
  };

  const renderCampaignImage = (campaign) => {
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
  };

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
          
          <LeaderboardContainer>
            <LeaderboardTitle>Top Donors</LeaderboardTitle>
            <LeaderboardList>
              {leaderboard.map((user, index) => (
                <LeaderboardItem key={user.id}>
                  <span>{index + 1}. {user.name}</span>
                  <span>{formatNumber(user.totalDonated)} points</span>
                </LeaderboardItem>
              ))}
            </LeaderboardList>
          </LeaderboardContainer>

          <div className="w-full flex flex-col space-y-4 pb-20">
            {campaigns.map(campaign => (
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
                <button 
                  onClick={() => handleCampaignClick(campaign)} 
                  className="mt-4 w-full bg-gradient-to-b from-[#3d47ff] to-[#575fff] px-4 py-2 rounded-[8px] text-white font-semibold"
                >
                  View Campaign
                </button>
              </CampaignCard>
            ))}
          </div>
        </div>
      </Container>

      {showPopup && selectedCampaign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#1e2340] rounded-[20px] p-6 w-[90%] max-w-[500px] max-h-[90vh] overflow-y-auto">
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
          </div>
        </div>
      )}

      <div className={`${congrats === true ? "visible bottom-6" : "invisible bottom-[-10px]"} z-[60] ease-in duration-300 w-full fixed left-0 right-0 px-4`}>
        <div className="w-full text-[#54d192] flex items-center space-x-2 px-4 bg-[#121620ef] h-[50px] rounded-[8px]">
          <IoCheckmarkCircle size={24} className=""/>
          <span className="font-medium">
            Thank you for your donation!
          </span>
        </div>
      </div>
    </Animate>
  );
};

export default Donate;