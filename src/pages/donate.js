import React, { useState, useEffect, useCallback } from 'react';
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
  overflow: hidden; /* Prevents scrolling issues */
  max-height: calc(100vh - 100px);
  touch-action: pan-y; /* Allows vertical scrolling only */
  overscroll-behavior: contain; /* Prevents scroll chaining */
`;

const CampaignCard = styled.div`
  background-color: #2a2f4e;
  border-radius: 15px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden; /* Prevents content overflow */
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
  overflow: hidden; /* Prevents content overflow */
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
        
        // Fetch leaderboard for each campaign
        const leaderboardQuery = query(
          collection(db, `campaigns/${doc.id}/donations`),
          orderBy('amount', 'desc'),
          limit(5)
        );
        const leaderboardSnapshot = await getDocs(leaderboardQuery);
        const leaderboard = leaderboardSnapshot.docs.map(donationDoc => ({
          username: donationDoc.data().username,
          amount: donationDoc.data().amount
        }));
        
        return { ...campaignData, leaderboard };
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

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const handleCampaignClick = useCallback((campaign) => {
    setSelectedCampaign(campaign);
    setShowPopup(true);
  }, []);

  const updateLeaderboard = (leaderboard, username, amount) => {
    const existingUserIndex = leaderboard.findIndex(donor => donor.username === username);
    let updatedLeaderboard;

    if (existingUserIndex !== -1) {
      // Usuario existe, actualizar su cantidad
      updatedLeaderboard = leaderboard.map((donor, index) => 
        index === existingUserIndex 
          ? { ...donor, amount: donor.amount + amount }
          : donor
      );
    } else {
      // Usuario nuevo, agregar al leaderboard
      updatedLeaderboard = [...leaderboard, { username, amount }];
    }

    // Ordenar el leaderboard y tomar los top 5
    return updatedLeaderboard
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  };

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

        const newCampaignPoints = campaignDoc.data().pointsRaised + donationAmount;
        const newUserBalance = userDoc.data().balance - donationAmount;

        if (newUserBalance < 0) {
          throw "Insufficient balance!";
        }

        transaction.update(campaignRef, { pointsRaised: newCampaignPoints });
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
  }, [donationAmount, balance, id, username, selectedCampaign, updateLeaderboard, setBalance]);

  return (
    <Container>
      {isLoading && <Spinner />}
      {error && <div>Error: {error}</div>}
      {congrats && (
        <Animate>
          <div style={{ position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#4caf50', color: '#fff', padding: '10px 20px', borderRadius: '5px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
            <IoCheckmarkCircle size={24} /> Thank you for your donation!
          </div>
        </Animate>
      )}
      <h1>Donate Points</h1>
      <div>
        {campaigns.map(campaign => (
          <CampaignCard key={campaign.id} onClick={() => handleCampaignClick(campaign)}>
            {campaign.image && <CampaignImage src={campaign.image} alt={campaign.title} />}
            <h2>{campaign.title}</h2>
            <Description>{campaign.description}</Description>
            <ProgressBarContainer>
              <ProgressBar progress={campaign.pointsRaised} target={campaign.targetPoints} />
            </ProgressBarContainer>
          </CampaignCard>
        ))}
      </div>
      {showPopup && selectedCampaign && (
        <div className="popup" style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: '#2a2f4e',
          padding: '20px',
          borderRadius: '15px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          zIndex: 1000
        }}>
          <IoClose
            size={24}
            style={{ position: 'absolute', top: '10px', right: '10px', cursor: 'pointer' }}
            onClick={() => setShowPopup(false)}
          />
          <h2>Donate to {selectedCampaign.title}</h2>
          <p>{selectedCampaign.description}</p>
          <ProgressBarContainer>
            <ProgressBar progress={selectedCampaign.pointsRaised} target={selectedCampaign.targetPoints} />
          </ProgressBarContainer>
          <div>
            <input
              type="number"
              value={donationAmount}
              onChange={(e) => setDonationAmount(Number(e.target.value))}
              placeholder="Enter amount"
              min="1"
              style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
            />
            <button
              onClick={handleDonationSubmit}
              style={{ width: '100%', padding: '10px', backgroundColor: '#4caf50', color: '#fff', border: 'none', borderRadius: '5px' }}
            >
              Donate
            </button>
          </div>
          <LeaderboardContainer>
            <LeaderboardTitle>
              <IoTrophy /> Leaderboard
            </LeaderboardTitle>
            <LeaderboardList>
              {selectedCampaign.leaderboard.map((donor, index) => (
                <LeaderboardItem key={index}>
                  <LeaderboardRank>{index + 1}.</LeaderboardRank>
                  <LeaderboardUsername>{donor.username}</LeaderboardUsername>
                  <LeaderboardPoints>{donor.amount} pts</LeaderboardPoints>
                </LeaderboardItem>
              ))}
            </LeaderboardList>
          </LeaderboardContainer>
        </div>
      )}
    </Container>
  );
};

export default Donate;