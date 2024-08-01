import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { doc, collection, getDocs, runTransaction, query, orderBy, limit, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import Animate from '../Components/Animate';
import { useUser } from '../context/userContext';
import { IoClose, IoCheckmarkCircle, IoTrophy } from 'react-icons/io5';
import styled from 'styled-components';

const PageContainer = styled.div`
  display: flex;
  height: 85vh;
  flex-direction: column;
  border-radius: 20px;
`;

const ContentWrapper = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  flex: 1;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
  }

  &::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 2px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #555;
  }
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: 1rem;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: bold;
  color: #262626;
  margin-bottom: 0.25rem;
`;

const Subtitle = styled.p`
  font-size: 14px;
  font-weight: 500;
  color: #4b5563;
`;

const CampaignsList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
`;

const CampaignCard = styled(motion.div)`
  background-color: white;
  border-radius: 0.75rem;
  padding: 0.75rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: transform 0.2s ease-in-out;

  &:hover {
    transform: translateY(-2px);
  }
`;

const CampaignImage = styled.img`
  width: 100%;
  height: 120px;
  object-fit: cover;
  border-radius: 0.5rem;
  margin-bottom: 0.75rem;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 6px;
  background-color: #e5e7eb;
  border-radius: 3px;
  overflow: hidden;
  margin: 0.25rem 0;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(to right, #094e9d, #0b62c4);
  border-radius: 3px;
`;

const Button = styled.button`
  background: linear-gradient(to right, #094e9d, #0b62c4);
  color: white;
  font-weight: 500;
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  transition: all 0.3s;
  text-align: center;
  width: 100%;
  font-size: 14px;

  &:hover {
    background: linear-gradient(to right, #0b62c4, #094e9d);
  }

  &:disabled {
    background: #cbd5e0;
    cursor: not-allowed;
  }
`;

const PopupOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
`;

const PopupContent = styled(motion.div)`
  background-color: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  width: 90%;
  max-width: 450px;
  max-height: 85vh;
  overflow-y: auto;
  position: relative;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
  }

  &::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 2px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #555;
  }
`;

const LeaderboardSection = styled.div`
  background-color: #f3f4f6;
  border-radius: 0.5rem;
  padding: 0.75rem;
  margin-top: 0.75rem;
`;

const LeaderboardItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.25rem 0;
  border-bottom: 1px solid #e5e7eb;
  color: #171717;
  font-size: 14px;

  &:last-child {
    border-bottom: none;
  }
`;

const RewardBadge = styled.span`
  background-color: #507cff;
  color: #ffff;
  font-weight: bold;
  padding: 0.15rem 0.35rem;
  border-radius: 9999px;
  font-size: 12px;
  margin-left: 0.5rem;
`;

const SliderContainer = styled.div`
  margin-bottom: 0.75rem;
`;

const StyledSlider = styled.input`
  width: 100%;
  -webkit-appearance: none;
  height: 6px;
  border-radius: 3px;
  background: #e5e7eb;
  outline: none;
  opacity: 0.7;
  transition: opacity 0.2s;

  &:hover {
    opacity: 1;
  }

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #1890ff;
    cursor: pointer;
  }

  &::-moz-range-thumb {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #1890ff;
    cursor: pointer;
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
        
          // Create winners collection
          const winnersCollectionRef = collection(db, `campaigns/${selectedCampaign.id}/winners`);
          winners.forEach((winner, index) => {
            transaction.set(doc(winnersCollectionRef, winner.id), {
              username: winner.username,
              amount: winner.amount,
              reward: winner.reward,
              position: index + 1
            });
          });
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

  const isTargetReached = useCallback((campaign) => {
    return campaign.pointsRaised >= campaign.targetPoints;
  }, []);

  if (error) {
    return <div className="text-red-500 text-sm">{error}</div>;
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
              {campaigns.map((campaign) => (
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
                  <h2 className="text-lg font-semibold mb-1 text-[#171717]">{campaign.title}</h2>
                  <p className="text-xs text-[#4b5563] mb-2">{campaign['short-description'] || 'No description available'}</p>
                  <div className="flex justify-between items-center mb-1 text-[#171717]">
                    <span className="text-xs font-medium">
                      {formatNumber(campaign.pointsRaised)} / {formatNumber(campaign.targetPoints)} points
                    </span>
                  </div>
                  <ProgressBar>
                    <ProgressFill style={{ width: `${Math.min(100, (campaign.pointsRaised / campaign.targetPoints) * 100)}%` }} />
                  </ProgressBar>
                  {isTargetReached(campaign) && (
                    <div className="mt-2 text-green-500 flex items-center justify-center">
                      <IoCheckmarkCircle size={20} className="mr-1" />
                      <span className="text-sm font-medium">Target Reached</span>
                    </div>
                  )}
                </CampaignCard>
              ))}
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
                  <button onClick={handleClosePopup} className="absolute top-2 right-2 text-gray-500">
                    <IoClose size={20} />
                  </button>
                  <h2 className="text-xl font-semibold mb-3 text-[#171717]">{selectedCampaign.title}</h2>
                  {selectedCampaign.image && (
                    <img 
                      src={selectedCampaign.image} 
                      alt={selectedCampaign.title}
                      className="w-full h-[150px] object-cover rounded-lg mb-3"
                    />
                  )}
                  <p className="text-sm text-[#171717] mb-3">{selectedCampaign['large-description'] || 'No detailed description available'}</p>
                  <div className="mb-3">
                    <h3 className="text-md font-semibold mb-1 text-[#171717]">Progress</h3>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-[#171717]">
                        {formatNumber(selectedCampaign.pointsRaised)} / {formatNumber(selectedCampaign.targetPoints)} points
                      </span>
                    </div>
                    <ProgressBar>
                      <ProgressFill style={{ width: `${Math.min(100, (selectedCampaign.pointsRaised / selectedCampaign.targetPoints) * 100)}%` }} />
                    </ProgressBar>
                  </div>
                  
                  <LeaderboardSection>
                    <h3 className="text-md font-semibold mb-2 flex items-center text-[#171717]">
                      <IoTrophy size={20} color="#fbbf24" className="mr-1" />
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
                  
                  {!isTargetReached(selectedCampaign) ? (
                    <div className="mt-3">
                      <h3 className="text-md font-semibold mb-2 text-[#171717]">Donate</h3>
                      <SliderContainer>
                        <StyledSlider
                          type="range"
                          min="0"
                          max={balance}
                          value={donationAmount}
                          onChange={handleSliderChange}
                        />
                      </SliderContainer>
                      <p className="text-xs text-[#171717] mb-1">Amount to donate: {formatNumber(donationAmount)} points</p>
                      <p className="text-xs text-[#171717] mb-2">Your current balance: {formatNumber(balance)} points</p>
                      <Button
                        onClick={handleDonationSubmit}
                        disabled={Number(donationAmount) <= 0 || Number(donationAmount) > balance}
                      >
                        Confirm Donation
                      </Button>
                    </div>
                  ) : (
                    <div className="mt-3 text-green-500 flex items-center justify-center">
                      <IoCheckmarkCircle size={24} className="mr-2" />
                      <span className="text-lg font-medium">Target Reached</span>
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
                  <span className="font-medium">Donation Successful!</span>
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