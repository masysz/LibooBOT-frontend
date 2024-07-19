import React, { useState, useEffect, useCallback, useRef } from 'react';
import { doc, collection, getDocs, runTransaction, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import styled from "styled-components";
import Animate from '../Components/Animate';
import Spinner from '../Components/Spinner';
import { useUser } from '../context/userContext';
import { IoClose, IoCheckmarkCircle, IoTrophy } from "react-icons/io5";
import congratspic from '../images/congrats.png';
window.Telegram.WebApp.disableVerticalSwipes()
// Ensure the document is scrollable
function ensureDocumentIsScrollable() {
  const isScrollable =
    document.documentElement.scrollHeight > window.innerHeight;
  // Check if the document is scrollable
  if (!isScrollable) {
    document.documentElement.style.setProperty(
      "height",
      "calc(100vh + 1px)",
      "important"
    );
  }
}

// Call ensureDocumentIsScrollable function when the entire page has loaded.
window.addEventListener("load", ensureDocumentIsScrollable);

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
  width: ${props => `min(100%, ${(props.progress / props.target) * 100}%)`};
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
  font-weight: 800;
  color: #fffff;
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
  const containerRef = useRef(null);

  useEffect(() => {
    window.Telegram.WebApp.disableVerticalSwipes()
    const preventCollapse = (event) => {
      if (window.scrollY === 0) {
        window.scrollTo(0, 1);
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("touchstart", preventCollapse);
    }

    return () => {
      if (container) {
        container.removeEventListener("touchstart", preventCollapse);
      }
    };
  }, []);

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
          collection(db, `campaigns/${doc.id}/leaderboard`),
          orderBy('amount', 'desc'),
          limit(5)
        );
        const leaderboardSnapshot = await getDocs(leaderboardQuery);
        const leaderboard = leaderboardSnapshot.docs.map(donorDoc => ({
          id: donorDoc.id,
          ...donorDoc.data()
        }));
        
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
        const leaderboardRef = doc(db, `campaigns/${selectedCampaign.id}/leaderboard`, id.toString());

        const campaignDoc = await transaction.get(campaignRef);
        const userDoc = await transaction.get(userRef);
        const leaderboardDoc = await transaction.get(leaderboardRef);

        if (!campaignDoc.exists() || !userDoc.exists()) {
          throw "Document does not exist!";
        }

        const newCampaignPoints = campaignDoc.data().pointsRaised + donationAmount;
        const newUserBalance = userDoc.data().balance - donationAmount;

        if (newUserBalance < 0) {
          throw "Insufficient balance!";
        }

        transaction.update(campaignRef, { pointsRaised: newCampaignPoints });
        transaction.update(userRef, { balance: newUserBalance });

        if (leaderboardDoc.exists()) {
          const currentAmount = leaderboardDoc.data().amount;
          transaction.update(leaderboardRef, { 
            amount: currentAmount + donationAmount,
            username: username
          });
        } else {
          transaction.set(leaderboardRef, {
            username: username,
            amount: donationAmount
          });
        }
      });

      setBalance(prevBalance => prevBalance - donationAmount);
      setCampaigns(prevCampaigns => 
        prevCampaigns.map(campaign =>
          campaign.id === selectedCampaign.id
            ? { 
                ...campaign, 
                pointsRaised: campaign.pointsRaised + donationAmount,
                leaderboard: updateLeaderboardLocally(campaign.leaderboard, id, username, donationAmount)
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

  const updateLeaderboardLocally = (leaderboard, userId, username, amount) => {
    const existingUserIndex = leaderboard.findIndex(donor => donor.id === userId);
    let updatedLeaderboard;

    if (existingUserIndex !== -1) {
      updatedLeaderboard = leaderboard.map((donor, index) => 
        index === existingUserIndex 
          ? { ...donor, amount: donor.amount + amount }
          : donor
      );
    } else {
      updatedLeaderboard = [...leaderboard, { id: userId, username, amount }];
    }

    return updatedLeaderboard
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  };

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
      <Container ref={containerRef}>
        <div className="w-full absolute top-[-35px] left-0 right-0 flex justify-center z-20 pointer-events-none select-none">
          {congrats ? <img src={congratspic} alt="congrats" className="w-[80%]" /> : null}
        </div>

        <div className="w-full flex justify-center flex-col items-center">
          <h1 className="text-[32px] font-semibold mb-4">Donate to Campaigns</h1>

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
                  <ProgressBar progress={campaign.pointsRaised} target={campaign.targetPoints} />
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
                <ProgressBar progress={selectedCampaign.pointsRaised} target={selectedCampaign.targetPoints} />
              </ProgressBarContainer>
            </div>
            
            <LeaderboardContainer>
              <LeaderboardTitle>
                <IoTrophy size={24} color="#ffd700" />
                Top Donors
              </LeaderboardTitle>
              <LeaderboardList>
                {selectedCampaign.leaderboard.map((donor, index) => (
                  <LeaderboardItem key={donor.id}>
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
          </div>
        </div>
      )}

<div className={`${congrats === true ? "visible bottom-6" : "invisible bottom-[-10px]"} z-[60] ease-in duration-300 w-full fixed left-0 right-0 px-4`}>
          <div className="w-full text-[#54d192] flex items-center space-x-2 px-4 bg-[#121620ef] rounded-lg py-2">
            <IoCheckmarkCircle size={24} />
            <span className="text-[16px] font-semibold">Donation Successful!</span>
          </div>
        </div>
     
    </Animate>
  );
};

export default Donate;