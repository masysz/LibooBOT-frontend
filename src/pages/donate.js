import React, { useState, useEffect, useCallback } from 'react';
import { doc, collection, getDocs, runTransaction, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import styled from "styled-components";
import Animate from '../Components/Animate';
import Spinner from '../Components/Spinner';
import { useUser } from '../context/userContext';
import { IoCheckmarkCircle } from "react-icons/io5";
import CampaignCard from '../Components/CampaignCard';
import DonationPopup from '../Components/DonationPopup';
import DonationHistory from '../Components/DonationHistory';

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

const Donate = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [congrats, setCongrats] = useState(false);
  const { balance, setBalance, loading: userLoading, id, username } = useUser();

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
        const leaderboard = leaderboardSnapshot.docs.map(donationDoc => ({
          username: donationDoc.data().username,
          amount: donationDoc.data().amount
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

  const handleDonationSubmit = useCallback(async (donationAmount) => {
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
    } catch (error) {
      console.error("Error processing donation:", error);
      alert("An error occurred while processing your donation. Please try again.");
    }
  }, [balance, id, username, selectedCampaign, db, setBalance]);

  const updateLeaderboard = (leaderboard, username, amount) => {
    const existingUserIndex = leaderboard.findIndex(donor => donor.username === username);
    let updatedLeaderboard;

    if (existingUserIndex !== -1) {
      updatedLeaderboard = leaderboard.map((donor, index) => 
        index === existingUserIndex 
          ? { ...donor, amount: donor.amount + amount }
          : donor
      );
    } else {
      updatedLeaderboard = [...leaderboard, { username, amount }];
    }

    return updatedLeaderboard
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num).replace(/,/g, " ");
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
        <div className="w-full flex justify-center flex-col items-center">
          <h1 className="text-[32px] font-semibold mb-4">Donate to Campaigns</h1>

          <div className="w-full flex flex-col space-y-4 pb-20">
            {campaigns.map(campaign => (
              <CampaignCard
                key={campaign.id}
                campaign={campaign}
                onCampaignClick={handleCampaignClick}
                formatNumber={formatNumber}
              />
            ))}
          </div>
        </div>

        <DonationHistory userId={id} />

        {showPopup && selectedCampaign && (
          <DonationPopup
            campaign={selectedCampaign}
            onClose={() => setShowPopup(false)}
            onDonate={handleDonationSubmit}
            balance={balance}
            formatNumber={formatNumber}
          />
        )}

        <div className={`${congrats ? "visible bottom-6" : "invisible bottom-[-10px]"} z-[60] ease-in duration-300 w-full fixed left-0 right-0 px-4`}>
          <div className="w-full text-[#54d192] flex items-center space-x-2 px-4 bg-[#121620ef] rounded-lg py-2">
            <IoCheckmarkCircle size={24} />
            <span className="text-[16px] font-semibold">Donation Successful!</span>
          </div>
        </div>
      </Container>
    </Animate>
  );
};

export default Donate;