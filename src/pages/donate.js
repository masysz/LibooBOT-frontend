import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  text-align: center;
  width: 100%;
  height: 100%;
  margin-bottom: 100px;
  overflow-y: auto;
  max-height: calc(100vh - 100px);
  -webkit-overflow-scrolling: touch;
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
    const ensureDocumentIsScrollable = () => {
      const isScrollable = document.documentElement.scrollHeight > window.innerHeight;
      if (!isScrollable) {
        document.documentElement.style.setProperty(
          "height",
          "calc(100vh + 1px)",
          "important"
        );
      }
    };

    ensureDocumentIsScrollable();
    window.addEventListener('resize', ensureDocumentIsScrollable);
    return () => {
      window.removeEventListener('resize', ensureDocumentIsScrollable);
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;

    const handleTouchMove = (e) => {
      const currentY = e.touches[0].clientY;
      const scrollTop = container.scrollTop;
      const scrollHeight = container.scrollHeight;
      const clientHeight = container.clientHeight;

      if ((scrollTop <= 0 && currentY > startY) || (scrollTop + clientHeight >= scrollHeight && currentY < startY)) {
        e.preventDefault();
      }
    };

    if (container) {
      container.addEventListener('touchmove', handleTouchMove, { passive: false });
    }

    return () => {
      if (container) {
        container.removeEventListener('touchmove', handleTouchMove);
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
        const userRef = doc(db, 'users', id);
        const campaignDoc = await transaction.get(campaignRef);
        const userDoc = await transaction.get(userRef);

        if (!campaignDoc.exists()) {
          throw new Error("Campaign does not exist!");
        }
        if (!userDoc.exists()) {
          throw new Error("User does not exist!");
        }

        const newRaisedAmount = (campaignDoc.data().raisedAmount || 0) + donationAmount;
        const newBalance = (userDoc.data().balance || 0) - donationAmount;

        transaction.update(campaignRef, { raisedAmount: newRaisedAmount });
        transaction.update(userRef, { balance: newBalance });

        const leaderboardRef = collection(db, `campaigns/${selectedCampaign.id}/leaderboard`);
        const leaderboardQuery = query(leaderboardRef, orderBy('amount', 'desc'));
        const leaderboardSnapshot = await getDocs(leaderboardQuery);

        let userDonationDoc = null;
        leaderboardSnapshot.forEach(doc => {
          if (doc.data().username === username) {
            userDonationDoc = doc;
          }
        });

        if (userDonationDoc) {
          transaction.update(doc(db, `campaigns/${selectedCampaign.id}/leaderboard`, userDonationDoc.id), {
            amount: userDonationDoc.data().amount + donationAmount
          });
        } else {
          transaction.set(doc(leaderboardRef), {
            username: username,
            amount: donationAmount
          });
        }

        setBalance(newBalance);
      });

      setDonationAmount(0);
      setShowPopup(false);
      setCongrats(true);
      setTimeout(() => setCongrats(false), 3000);
      fetchCampaigns(); // Refresh campaigns to update the UI
    } catch (error) {
      console.error("Donation failed:", error);
      alert("Failed to donate. Please try again later.");
    }
  }, [donationAmount, balance, selectedCampaign, id, username, setBalance, fetchCampaigns]);

  if (isLoading || userLoading) {
    return (
      <Container>
        <Spinner />
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <p>{error}</p>
      </Container>
    );
  }

  return (
    <Container ref={containerRef}>
      {campaigns.map((campaign) => (
        <CampaignCard key={campaign.id} onClick={() => handleCampaignClick(campaign)}>
          <h2>{campaign.title}</h2>
          {campaign.image && <CampaignImage src={campaign.image} alt={campaign.title} />}
          <Description>{campaign.description}</Description>
          <ProgressBarContainer>
            <ProgressBar progress={campaign.raisedAmount} target={campaign.targetAmount} />
          </ProgressBarContainer>
        </CampaignCard>
      ))}

      {showPopup && selectedCampaign && (
        <Animate>
          <div className="popup">
            <div className="popup-content">
              <button className="close-button" onClick={() => setShowPopup(false)}>
                <IoClose />
              </button>
              <h2>Donate to {selectedCampaign.title}</h2>
              <p>Enter your donation amount:</p>
              <input
                type="number"
                value={donationAmount}
                onChange={(e) => setDonationAmount(Number(e.target.value))}
              />
              <button onClick={handleDonationSubmit}>Donate</button>
            </div>
          </div>
        </Animate>
      )}

      {congrats && (
        <Animate>
          <div className="congrats-popup">
            <div className="congrats-content">
              <IoCheckmarkCircle className="congrats-icon" />
              <h2>Thank you for your donation!</h2>
              <img src={congratspic} alt="Congratulations" />
            </div>
          </div>
        </Animate>
      )}

      <LeaderboardContainer>
        <LeaderboardTitle>
          <IoTrophy />
          Top Donors
        </LeaderboardTitle>
        {campaigns.map((campaign) => (
          <div key={campaign.id}>
            <LeaderboardTitle>{campaign.title}</LeaderboardTitle>
            <LeaderboardList>
              {campaign.leaderboard.map((donor, index) => (
                <LeaderboardItem key={donor.id}>
                  <LeaderboardRank>{index + 1}</LeaderboardRank>
                  <LeaderboardUsername>{donor.username}</LeaderboardUsername>
                  <LeaderboardPoints>{donor.amount}</LeaderboardPoints>
                </LeaderboardItem>
              ))}
            </LeaderboardList>
          </div>
        ))}
      </LeaderboardContainer>
    </Container>
  );
};

export default Donate;
