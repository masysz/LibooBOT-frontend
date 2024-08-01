import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { doc, collection, getDocs, runTransaction, query, orderBy, limit, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import Animate from '../Components/Animate';
import { useUser } from '../context/userContext';
import { IoClose, IoCheckmarkCircle, IoTrophy } from 'react-icons/io5';
import styled from 'styled-components';

// Styled components (sin cambios)
// ...

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
    document.body.style.overflow = 'hidden';
  }, []);

  const handleClosePopup = useCallback(() => {
    setShowPopup(false);
    document.body.style.overflow = 'auto';
  }, []);

  const handleDonationSubmit = useCallback(async () => {
    const amount = Number(donationAmount);
    if (amount <= 0 || isNaN(amount)) {
      alert("Please enter a valid donation amount.");
      return;
    }
    if (amount > balance) {
      alert("Insufficient balance!");
      return;
    }
    if (!id || !username) {
      alert("You must be logged in to donate.");
      return;
    }
    if (selectedCampaign.pointsRaised >= selectedCampaign.targetPoints) {
      alert("This campaign has already reached its target. Thank you for your support!");
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
          throw new Error("Document does not exist!");
        }

        const newCampaignPoints = campaignDoc.data().pointsRaised + amount;
        const newUserBalance = userDoc.data().balance - amount;

        if (newUserBalance < 0) {
          throw new Error("Insufficient balance!");
        }

        transaction.update(campaignRef, { pointsRaised: newCampaignPoints });
        transaction.update(userRef, { balance: newUserBalance });

        if (leaderboardDoc.exists()) {
          const currentAmount = leaderboardDoc.data().amount;
          transaction.update(leaderboardRef, { 
            amount: currentAmount + amount,
            username: username
          });
        } else {
          transaction.set(leaderboardRef, {
            username: username,
            amount: amount
          });
        }

        if (newCampaignPoints >= campaignDoc.data().targetPoints && !campaignDoc.data().winnersSet) {
          const leaderboardQuery = query(
            collection(db, `campaigns/${selectedCampaign.id}/leaderboard`),
            orderBy('amount', 'desc'),
            limit(3)
          );
          const leaderboardSnapshot = await getDocs(leaderboardQuery);
          const winners = leaderboardSnapshot.docs.map((doc, index) => ({
            id: doc.id,
            username: doc.data().username,
            amount: doc.data().amount,
            reward: index === 0 ? 10 : index === 1 ? 5 : 1
          }));

          transaction.update(campaignRef, { 
            winnersSet: true,
            winners: winners
          });

          // Update user balances for winners
          for (const winner of winners) {
            const winnerRef = doc(db, 'telegramUsers', winner.id);
            const winnerDoc = await transaction.get(winnerRef);
            if (winnerDoc.exists()) {
              const currentBalance = winnerDoc.data().balance;
              transaction.update(winnerRef, { balance: currentBalance + winner.reward });
            }
          }
        }
      });

      setBalance(prevBalance => prevBalance - amount);
      setCampaigns(prevCampaigns => 
        prevCampaigns.map(campaign =>
          campaign.id === selectedCampaign.id
            ? { 
                ...campaign, 
                pointsRaised: campaign.pointsRaised + amount,
                leaderboard: updateLeaderboardLocally(campaign.leaderboard, id, username, amount)
              }
            : campaign
        )
      );
      
      setCongrats(true);
      setTimeout(() => setCongrats(false), 3000);

      handleClosePopup();
      setDonationAmount(0);
      fetchCampaigns();
    } catch (error) {
      console.error("Error processing donation:", error);
      alert(error.message || "An error occurred while processing your donation. Please try again.");
    }
  }, [donationAmount, balance, id, username, selectedCampaign, db, setBalance, fetchCampaigns, handleClosePopup]);

  const updateLeaderboardLocally = useCallback((leaderboard, userId, username, amount) => {
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
  }, []);

  const formatNumber = useCallback((num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    } else {
      return num.toString();
    }
  }, []);

  const getReward = useCallback((index) => {
    switch (index) {
      case 0: return '10 TON';
      case 1: return '5 TON';
      case 2: return '1 TON';
      default: return null;
    }
  }, []);

  const handleSliderChange = useCallback((e) => {
    const value = Math.min(Number(e.target.value), balance);
    setDonationAmount(value);
  }, [balance]);

  const renderCampaignCard = useCallback((campaign) => (
    <CampaignCard
      key={campaign.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      onClick={() => handleCampaignClick(campaign)}
    >
      {campaign.image && (
        <CampaignImage src={campaign.image} alt={campaign.title} />
      )}
      <h2 className="text-xl font-semibold mb-2 text-[#171717]">{campaign.title}</h2>
      <p className="text-sm text-[#171717] mb-4">{campaign['short-description'] || 'No description available'}</p>
      <div className="flex justify-between items-center mb-2 text-[#171717]">
        <span className="text-sm font-medium">
          {formatNumber(campaign.pointsRaised)} / {formatNumber(campaign.targetPoints)} points
        </span>
        {campaign.pointsRaised >= campaign.targetPoints && (
          <IoCheckmarkCircle size={24} color="#10B981" />
        )}
      </div>
      <ProgressBar>
        <ProgressFill style={{ width: `${Math.min(100, (campaign.pointsRaised / campaign.targetPoints) * 100)}%` }} />
      </ProgressBar>
    </CampaignCard>
  ), [formatNumber, handleCampaignClick]);

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <Animate>
      <PageContainer>
        <ContentWrapper>
          <Header>
            <Title>Donate to Campaigns</Title>
            <Subtitle>Support causes you care about</Subtitle>
          </Header>

          <CampaignsList>
            <AnimatePresence>
              {campaigns.map(renderCampaignCard)}
            </AnimatePresence>
          </CampaignsList>

          <AnimatePresence>
            {showPopup && selectedCampaign && (
              <PopupOverlay
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <PopupContent
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                >
                  <button onClick={handleClosePopup} className="absolute top-4 right-4 text-gray-500">
                    <IoClose size={24} />
                  </button>
                  <h2 className="text-2xl font-semibold mb-4 text-[#171717]">{selectedCampaign.title}</h2>
                  {selectedCampaign.image && (
                    <img 
                      src={selectedCampaign.image} 
                      alt={selectedCampaign.title}
                      className="w-full h-[200px] object-cover rounded-lg mb-4"
                    />
                  )}
                  <p className="text-[#171717] mb-4">{selectedCampaign['large-description'] || 'No detailed description available'}</p>
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-2 text-[#171717]">Progress</h3>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-[#171717]">
                        {formatNumber(selectedCampaign.pointsRaised)} / {formatNumber(selectedCampaign.targetPoints)} points
                      </span>
                    </div>
                    <ProgressBar>
                      <ProgressFill style={{ width: `${Math.min(100, (selectedCampaign.pointsRaised / selectedCampaign.targetPoints) * 100)}%` }} />
                    </ProgressBar>
                  </div>
                  
                  <LeaderboardSection>
                    <h3 className="text-lg font-semibold mb-2 flex items-center text-[#171717]">
                      <IoTrophy size={24} color="#fbbf24" className="mr-2" />
                      Top Donors
                    </h3>
                    {selectedCampaign.leaderboard.map((donor, index) => (
                      <LeaderboardItem key={donor.id}>
                        <span>
                          {index + 1}. {donor.username}
                          {getReward(index) && <RewardBadge>{getReward(index)}</RewardBadge>}
                        </span>
                        <span className="font-bold">{formatNumber(donor.amount)}</span>
                      </LeaderboardItem>
                    ))}
                  </LeaderboardSection>
                  
                  {selectedCampaign.pointsRaised < selectedCampaign.targetPoints && (
                    <div className="mt-4">
                      <h3 className="text-lg font-semibold mb-2 text-[#171717]">Donate</h3>
                      <SliderContainer>
                        <StyledSlider
                          type="range"
                          min="0"
                          max={balance}
                          value={donationAmount}
                          onChange={handleSliderChange}
                        />
                      </SliderContainer>
                      <p className="text-sm text-[#171717] mb-2">Amount to donate: {formatNumber(donationAmount)} points</p>
                      <p className="text-sm text-[#171717] mb-2">Your current balance: {formatNumber(balance)} points</p>
                      <Button
                        onClick={handleDonationSubmit}
                        disabled={Number(donationAmount) <= 0 || Number(donationAmount) > balance}
                      >
                        Confirm Donation
                      </Button>
                    </div>
                  )}
      {selectedCampaign.pointsRaised < selectedCampaign.targetPoints && (
                  <div className="mt-4">
                    <h3 className="text-lg font-semibold mb-2 text-[#171717]">Donate</h3>
                    <SliderContainer>
                      <StyledSlider
                        type="range"
                        min="0"
                        max={balance}
                        value={donationAmount}
                        onChange={handleSliderChange}
                      />
                    </SliderContainer>
                    <p className="text-sm text-[#171717] mb-2">Amount to donate: {formatNumber(donationAmount)} points</p>
                    <p className="text-sm text-[#171717] mb-2">Your current balance: {formatNumber(balance)} points</p>
                    <Button
                      onClick={handleDonationSubmit}
                      disabled={Number(donationAmount) <= 0 || Number(donationAmount) > balance}
                    >
                      Confirm Donation
                    </Button>
                  </div>
                )}
                {selectedCampaign.pointsRaised >= selectedCampaign.targetPoints && (
                  <div className="mt-4 text-green-500 font-semibold">
                    This campaign has reached its target. Thank you for your support!
                  </div>
                )}
                                </PopupContent>
                              </PopupOverlay>
                            )}
                          </AnimatePresence>
                
                          <AnimatePresence>
                            {congrats && (
                              <motion.div
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 50 }}
                                className="fixed bottom-6 left-0 right-0 px-4 z-50"
                              >
                             <div className="w-full text-[#54d192] flex items-center space-x-2 px-4 bg-[#121620ef] h-[50px] rounded-[8px]">
          <IoCheckmarkCircle size={24} />
          <span className="font-medium">Donation Successfull</span>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </ContentWrapper>
                      </PageContainer>
                    </Animate>
                  );
                };
                
                export default React.memo(Donate);


                