import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { doc, collection, getDocs, runTransaction, query, orderBy, limit, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import Animate from '../Components/Animate';
import { useUser } from '../context/userContext';
import { IoClose, IoCheckmarkCircle, IoTrophy } from 'react-icons/io5';
import styled from 'styled-components';
import Spinner from '../Components/Spinner';

const PageContainer = styled.div`
  display: flex;
  min-height: 85vh;
  flex-direction: column;
`;

const ContentWrapper = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: bold;
  color: #262626;;
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  font-size: 16px;
  font-weight: 500;
  color: #4b5563;
`;

const CampaignsList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
`;

const CampaignCard = styled(motion.div)`
  background-color: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
`;

const CampaignImage = styled.img`
  width: 100%;
  height: 180px;
  object-fit: cover;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 10px;
  background-color: #e5e7eb;
  border-radius: 5px;
  overflow: hidden;
  margin: 0.5rem 0;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(to right, #094e9d, #0b62c4);
  border-radius: 5px;
`;

const Button = styled.button`
  background: linear-gradient(to right, #094e9d, #0b62c4);
  color: white;
  font-weight: 500;
  padding: 0.75rem 1rem;
  border-radius: 0.375rem;
  transition: all 0.3s;
  text-align: center;
  width: 100%;

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
  z-index: 1000;
`;

const PopupContent = styled(motion.div)`
  background-color: white;
  border-radius: 1rem;
  padding: 2rem;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
`;

const LeaderboardSection = styled.div`
  background-color: #f3f4f6;
  border-radius: 0.5rem;
  padding: 1rem;
  margin-top: 1rem;
`;

const LeaderboardItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #e5e7eb;
  color: #171717;

  &:last-child {
    border-bottom: none;
  }
`;

const RewardBadge = styled.span`
  background-color: #507cff;
  color: #ffff;
  font-weight: bold;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  margin-left: 0.5rem;
`;

const Donate = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [donationAmount, setDonationAmount] = useState('');
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

      setShowPopup(false);
      setDonationAmount('');
      fetchCampaigns();
    } catch (error) {
      console.error("Error processing donation:", error);
      alert(error.message || "An error occurred while processing your donation. Please try again.");
    }
  }, [donationAmount, balance, id, username, selectedCampaign, db, setBalance, fetchCampaigns]);

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

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <Animate>
      <PageContainer>
        <ContentWrapper>
          {isLoading ? (
            <Spinner />
          ) : (
            <>
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
                      </div>
                      <ProgressBar>
                        <ProgressFill style={{ width: `${Math.min(100, (campaign.pointsRaised / campaign.targetPoints) * 100)}%` }} />
                      </ProgressBar>
                      <Button onClick={() => handleCampaignClick(campaign)}>
                        View Campaign
                      </Button>
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
                      <button onClick={() => setShowPopup(false)} className="absolute top-4 right-4 text-gray-500">
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
                      
                      <div className="mt-4">
                        <h3 className="text-lg font-semibold mb-2 text-[#171717]">Donate</h3>
                        <input
                          type="number"
                          value={donationAmount}
                          onChange={(e) => setDonationAmount(e.target.value)}
                          className="w-full bg-gray-100 rounded-lg p-2 mb-2 text-[#171717]"
                          placeholder="Enter donation amount"
                        />
                        <p className="text-sm text-[#171717] mb-2">Your current balance: {formatNumber(balance)} points</p>
                        <Button
                          onClick={handleDonationSubmit}
                          disabled={Number(donationAmount) <= 0 || Number(donationAmount) > balance}
                        >
                          Confirm Donation
                        </Button>
                      </div>
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
                    <div className="w-full text-green-500 flex items-center space-x-2 px-4 bg-white rounded-lg py-2 shadow-lg">
                      <IoCheckmarkCircle size={24} />
                      <span className="text-lg font-semibold">Donation Successful!</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </ContentWrapper>
      </PageContainer>
    </Animate>
  );
};

export default React.memo(Donate);