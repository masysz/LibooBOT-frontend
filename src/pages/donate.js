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
  background-color: #121620;
  color: #ffffff;
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
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #1e2635;
  }

  &::-webkit-scrollbar-thumb {
    background: #3a4556;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #4a5a70;
  }
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 32px;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  font-size: 18px;
  font-weight: 500;
  color: #a0aec0;
`;

const CampaignsList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
`;

const CampaignCard = styled(motion.div)`
  background-color: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 1.5rem;
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.37);
  border: 1px solid rgba(255, 255, 255, 0.18);
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 40px rgba(31, 38, 135, 0.5);
  }
`;

const CampaignImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 10px;
  margin-bottom: 1rem;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 10px;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 5px;
  overflow: hidden;
  margin: 0.5rem 0;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #094e9d, #0b62c4);
  border-radius: 5px;
  transition: width 0.5s ease-out;
`;

const Button = styled.button`
  background: linear-gradient(90deg, #094e9d, #0b62c4);
  color: white;
  font-weight: 600;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  transition: all 0.3s;
  text-align: center;
  width: 100%;
  border: none;
  cursor: pointer;

  &:hover {
    background: linear-gradient(90deg, #0b62c4, #094e9d);
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(9, 78, 157, 0.3);
  }

  &:disabled {
    background: #3a4556;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const PopupOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
`;

const PopupContent = styled(motion.div)`
  background-color: rgba(18, 22, 32, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 25px;
  padding: 2.5rem;
  width: 95%;
  max-width: 550px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #fff;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #1e2635;
  }

  &::-webkit-scrollbar-thumb {
    background: #3a4556;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #4a5a70;
  }
`;

const LeaderboardSection = styled.div`
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 1rem;
  margin-top: 1rem;
`;

const LeaderboardItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  color: #ffffff;

  &:last-child {
    border-bottom: none;
  }
`;

const RewardBadge = styled.span`
  background-color: #0b62c4;
  color: #ffffff;
  font-weight: bold;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 14px;
  margin-left: 0.5rem;
`;

const SliderContainer = styled.div`
  margin-bottom: 1rem;
`;

const StyledSlider = styled.input`
  -webkit-appearance: none;
  width: 100%;
  height: 8px;
  border-radius: 4px;
  background: linear-gradient(90deg, #094e9d, #0b62c4);
  outline: none;
  opacity: 0.7;
  transition: opacity 0.2s;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: #fff;
    cursor: pointer;
    box-shadow: 0 0 10px rgba(9, 78, 157, 0.5);
  }

  &::-moz-range-thumb {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: #fff;
    cursor: pointer;
    box-shadow: 0 0 10px rgba(9, 78, 157, 0.5);
  }
`;

const CheckIcon = styled(IoCheckmarkCircle)`
  position: absolute;
  top: 10px;
  right: 10px;
  color: #10B981;
  font-size: 24px;
`;

const LoadingSpinner = styled.div`
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top: 4px solid #ffffff;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 20px auto;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ErrorMessage = styled.div`
  color: #ff6b6b;
  text-align: center;
  font-size: 18px;
  margin: 20px 0;
`;

const Donate = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [donationAmount, setDonationAmount] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { balance = 0, setBalance, loading: userLoading, id, username } = useUser() || {};
  const [congrats, setCongrats] = useState(false);

  const fetchCampaigns = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const campaignsCollection = collection(db, 'campaigns');
      const campaignsSnapshot = await getDocs(campaignsCollection);
      const campaignsList = await Promise.all(campaignsSnapshot.docs.map(async doc => {
        const data = doc.data();
        const campaignData = {
          id: doc.id,
          title: data.title || 'Unnamed Campaign',
          'short-description': data['short-description'] || '',
          'large-description': data['large-description'] || '',
          pointsRaised: data.pointsRaised || 0,
          targetPoints: data.targetPoints || 0,
          image: data.image && typeof data.image === 'string' ? data.image : null,
          completed: (data.pointsRaised || 0) >= (data.targetPoints || 0),
          winnersSet: data.winnersSet || false
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

  const updateLeaderboardData = useCallback((leaderboardDocs, currentUserData, userId, username, amount) => {
    let updatedLeaderboard = leaderboardDocs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  
    const existingUserIndex = updatedLeaderboard.findIndex(donor => donor.id === userId);
    if (existingUserIndex !== -1) {
      updatedLeaderboard[existingUserIndex].amount += amount;
    } else {
      updatedLeaderboard.push({
        id: userId,
        username: username,
        amount: amount + (currentUserData?.amount || 0)
      });
    }
  
    return updatedLeaderboard
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
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
  
        const leaderboardQuery = query(
          collection(db, `campaigns/${selectedCampaign.id}/leaderboard`),
          orderBy('amount', 'desc'),
          limit(5)
        );
        const leaderboardSnapshot = await getDocs(leaderboardQuery);
  
        if (!campaignDoc.exists()) {
          throw new Error("Campaign does not exist!");
        }
        if (!userDoc.exists()) {
          throw new Error("User does not exist!");
        }
  
        const currentCampaignPoints = campaignDoc.data().pointsRaised || 0;
        const targetPoints = campaignDoc.data().targetPoints || 0;
        const newCampaignPoints = currentCampaignPoints + amount;
        const newUserBalance = (userDoc.data().balance || 0) - amount;
  
        if (newUserBalance < 0) {
          throw new Error("Insufficient balance!");
        }
  
        if (currentCampaignPoints >= targetPoints) {
          throw new Error("Campaign has already reached its goal!");
        }
  
        const updatedLeaderboard = updateLeaderboardData(leaderboardSnapshot.docs, leaderboardDoc.data(), id, username, amount);
  
        const topDonors = updatedLeaderboard.map((doc, index) => ({
          id: doc.id,
          username: doc.username,
          amount: doc.amount,
          reward: index === 0 ? 10 : index === 1 ? 5 : index === 2 ? 1 : 0
        }));
  
        const campaignCompleted = newCampaignPoints >= targetPoints;
  
        transaction.update(campaignRef, { 
          pointsRaised: newCampaignPoints,
          topDonors: topDonors,
          winners: topDonors.filter(donor => donor.reward > 0),
          completed: campaignCompleted,
          winnersSet: campaignCompleted
        });
  
        transaction.update(userRef, { balance: newUserBalance });
  
        transaction.set(leaderboardRef, {
          username: username,
          amount: amount + (leaderboardDoc.data()?.amount || 0)
        }, { merge: true });
      });
  
      setBalance(prevBalance => prevBalance - amount);
      setCampaigns(prevCampaigns => 
        prevCampaigns.map(campaign =>
          campaign.id === selectedCampaign.id
            ? { 
                ...campaign, 
                pointsRaised: (campaign.pointsRaised || 0) + amount,
                leaderboard: updateLeaderboardLocally(campaign.leaderboard, id, username, amount),
                completed: (campaign.pointsRaised || 0) + amount >= (campaign.targetPoints || 0)
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
  }, [donationAmount, balance, id, username, selectedCampaign, db, setBalance, fetchCampaigns, handleClosePopup, updateLeaderboardLocally]);

  const updateLeaderboardLocally = useCallback((leaderboard, userId, username, amount) => {
    const existingUserIndex = leaderboard.findIndex(donor => donor.id === userId);
    let updatedLeaderboard;

    if (existingUserIndex !== -1) {
      updatedLeaderboard = leaderboard.map((donor, index) => 
        index === existingUserIndex 
          ? { ...donor, amount: (donor.amount || 0) + amount }
          : donor
      );
    } else {
      updatedLeaderboard = [...leaderboard, { id: userId, username, amount }];
    }

    return updatedLeaderboard
      .sort((a, b) => (b.amount || 0) - (a.amount || 0))
      .slice(0, 5);
  }, []);

  const formatNumber = useMemo(() => (num) => {
    if (num == null) return '0';
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    } else {
      return num.toString();
    }
  }, []);

  const getReward = useMemo(() => (index) => {
    switch (index) {
      case 0: return '10 TON';
      case 1: return '5 TON';
      case 2: return '1 TON';
      default: return null;
    }
  }, []);

  const handleSliderChange = useCallback((e) => {
    const value = Math.min(Number(e.target.value), balance || 0);
    setDonationAmount(value);
  }, [balance]);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage>{error}</ErrorMessage>;

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
                  onClick={() => handleCampaignClick(campaign)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {campaign.completed && <CheckIcon />}
                  {campaign.image && (
                    <CampaignImage src={campaign.image} alt={campaign.title} />
                  )}
                  <h2 className="text-xl font-semibold mb-2 text-white">{campaign.title}</h2>
                  <p className="text-sm text-gray-300 mb-4">{campaign['short-description'] || 'No description available'}</p>
                  <div className="flex justify-between items-center mb-2 text-white">
                    <span className="text-sm font-medium">
                      {formatNumber(campaign.pointsRaised)} / {formatNumber(campaign.targetPoints)} points
                    </span>
                  </div>
                  <ProgressBar>
                    <ProgressFill style={{ width: `${Math.min(100, ((campaign.pointsRaised || 0) / (campaign.targetPoints || 1)) * 100)}%` }} />
                  </ProgressBar>
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
                  <button onClick={handleClosePopup} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                    <IoClose size={24} />
                  </button>
                  <h2 className="text-2xl font-semibold mb-4 text-white">{selectedCampaign.title}</h2>
                  {selectedCampaign.image && (
                    <img 
                      src={selectedCampaign.image} 
                      alt={selectedCampaign.title}
                      className="w-full h-[200px] object-cover rounded-lg mb-4"
                    />
                  )}
                  <p className="text-gray-300 mb-4">{selectedCampaign['large-description'] || 'No detailed description available'}</p>
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-2 text-white">Progress</h3>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-300">
                        {formatNumber(selectedCampaign.pointsRaised)} / {formatNumber(selectedCampaign.targetPoints)} points
                      </span>
                    </div>
                    <ProgressBar>
                      <ProgressFill style={{ width: `${Math.min(100, ((selectedCampaign.pointsRaised || 0) / (selectedCampaign.targetPoints || 1)) * 100)}%` }} />
                    </ProgressBar>
                  </div>
                  
                  <LeaderboardSection>
                    <h3 className="text-lg font-semibold mb-2 flex items-center text-white">
                      <IoTrophy size={24} color="#fbbf24" className="mr-2" />
                      Top Donors
                    </h3>
                    {(selectedCampaign.leaderboard || []).map((donor, index) => (
                      <LeaderboardItem key={donor?.id || index}>
                        <span>
                          {index + 1}. {donor?.username || 'Anonymous'}
                          {getReward(index) && <RewardBadge>{getReward(index)}</RewardBadge>}
                        </span>
                        <span className="font-bold">{formatNumber(donor?.amount)}</span>
                      </LeaderboardItem>
                    ))}
                  </LeaderboardSection>
                  
                  {!selectedCampaign.completed && (
                    <div className="mt-4">
                      <h3 className="text-lg font-semibold mb-2 text-white">Donate</h3>
                      <SliderContainer>
                        <StyledSlider
                          type="range"
                          min="0"
                          max={balance || 0}
                          value={donationAmount}
                          onChange={handleSliderChange}
                        />
                      </SliderContainer>
                      <p className="text-sm text-gray-300 mb-2">Amount to donate: {formatNumber(donationAmount)} points</p>
                      <p className="text-sm text-gray-300 mb-2">Your current balance: {formatNumber(balance)} points</p>
                      <Button
                        onClick={handleDonationSubmit}
                        disabled={Number(donationAmount) <= 0 || Number(donationAmount) > balance}
                      >
                        Confirm Donation
                      </Button>
                    </div>
                  )}
                  {selectedCampaign.completed && (
                    <div className="mt-4 text-center text-green-500 font-semibold">
                      This campaign has reached its goal!
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
                <div className="w-full text-green-500 flex items-center space-x-2 px-4 bg-gray-800 h-[50px] rounded-[8px]">
                  <IoCheckmarkCircle size={24} />
                  <span className="font-medium">Donation successful!</span>
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