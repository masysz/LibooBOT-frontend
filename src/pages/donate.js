import React, { useState, useEffect, useCallback, useRef } from 'react';
import { doc, collection, getDocs, runTransaction, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import styled from "styled-components";
import Animate from '../Components/Animate';
import Spinner from '../Components/Spinner';
import { useUser } from '../context/userContext';
import { IoClose, IoCheckmarkCircle, IoTrophy } from "react-icons/io5";
import congratspic from '../images/congrats.png';

const ScrollPadding = styled.div`
  height: 1px;
  opacity: 0;
`;

const Container = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
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
  overflow: hidden;
`;

const ProgressBar = styled.div`
  height: 100%;
  background-color: #3d47ff;
  border-radius: 5px;
  transition: width 0.3s ease-in-out;
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
    const preventCollapse = () => {
      if (window.scrollY === 0 && !showPopup) {
        window.scrollTo(0, 1);
      }
    };

    window.addEventListener('scroll', preventCollapse);
    preventCollapse();

    return () => window.removeEventListener('scroll', preventCollapse);
  }, [showPopup]);

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
    setTimeout(() => {
      if (containerRef.current) {
        containerRef.current.scrollTop = 0;
      }
    }, 0);
  }, []);

  const handleDonationSubmit = useCallback(async () => {
    if (donationAmount <= 0 || isNaN(donationAmount) || donationAmount > balance) {
      alert("Please enter a valid donation amount within your balance.");
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

        const updatedLeaderboard = updateLeaderboard(currentCampaignData.leaderboard, username, donationAmount);
        const isCompleted = newCampaignPoints >= currentCampaignData.targetPoints;

        transaction.update(campaignRef, { 
          pointsRaised: newCampaignPoints,
          leaderboard: updatedLeaderboard,
          isCompleted: isCompleted
        });
        transaction.update(userRef, { balance: newUserBalance });
        transaction.set(donationRef, {
          username: username,
          amount: donationAmount,
          timestamp: new Date()
        });

        if (isCompleted) {
          const allCampaignsQuery = query(collection(db, 'campaigns'));
          const allCampaignsSnapshot = await getDocs(allCampaignsQuery);
          allCampaignsSnapshot.docs.forEach(doc => {
            if (doc.id !== selectedCampaign.id) {
              transaction.update(doc.ref, {
                isActive: doc.data().isCompleted ? false : true
              });
            }
          });
        }
      });

      setCampaigns(prevCampaigns => 
        prevCampaigns.map(campaign => {
          if (campaign.id === selectedCampaign.id) {
            const newPoints = campaign.pointsRaised + donationAmount;
            const isCompleted = newPoints >= campaign.targetPoints;
            return { 
              ...campaign, 
              pointsRaised: newPoints,
              leaderboard: updateLeaderboard(campaign.leaderboard, username, donationAmount),
              isCompleted: isCompleted
            };
          } else if (campaign.id !== selectedCampaign.id && !campaign.isCompleted) {
            return { ...campaign, isActive: true };
          }
          return campaign;
        })
      );

      setBalance(prevBalance => prevBalance - donationAmount);
      setCongrats(true);
      setTimeout(() => setCongrats(false), 3000);

      setShowPopup(false);
      setDonationAmount(0);

      if (selectedCampaign.pointsRaised + donationAmount >= selectedCampaign.targetPoints) {
        alert("Congratulations! Your donation has completed this campaign!");
      }

    } catch (error) {
      console.error("Error processing donation:", error);
      alert("An error occurred while processing your donation. Please try again.");
    }
  }, [donationAmount, balance, id, username, selectedCampaign, db, setBalance]);

  const updateLeaderboard = (leaderboard, username, amount) => {
    const existingDonorIndex = leaderboard.findIndex(donor => donor.username === username);
    let updatedLeaderboard = [...leaderboard];
    
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

  const renderCampaignImage = (campaign) => {
    if (!campaign.image) return null;
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

  const calculateProgressPercentage = (pointsRaised, targetPoints) => {
    const percentage = (pointsRaised / targetPoints) * 100;
    return Math.min(percentage, 100);
  };

  if (userLoading || isLoading) return <Spinner />;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <Animate>
      <Container ref={containerRef}>
        <ScrollPadding />
        <div className="flex-grow">
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
                    <ProgressBar style={{ width: `${calculateProgressPercentage(campaign.pointsRaised, campaign.targetPoints)}%` }} />
                  </ProgressBarContainer>
                  <button 
                    onClick={() => handleCampaignClick(campaign)} 
                    className={`mt-4 w-full px-4 py-2 rounded-[8px] text-white font-semibold ${
                      campaign.isCompleted 
                        ? "bg-gray-500 cursor-not-allowed" 
                        : "bg-gradient-to-b from-[#3d47ff] to-[#575fff]"
                    }`}
                    disabled={campaign.isCompleted}
                  >
                    {campaign.isCompleted ? "Campaign Completed" : "View Campaign"}
                  </button>
                </CampaignCard>
              ))}
            </div>
          </div>
        </div>

        {showPopup && selectedCampaign && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[#1e2340] rounded-[20px] p-6 w-[90%] max-w-[500px] max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-[24px] font-semibold">{selectedCampaign.title}</h2>
                <button onClick={() => setShowPopup(false)} className="text-white">
                  <IoClose size={24} />
                </button>
              </div>
              {renderCampaignImage(selectedCampaign)}
              <Description>{selectedCampaign['short-description'] || 'No description available'}</Description>
              <div className="mb-4">
                <span className="text-[18px] font-medium">
                  {formatNumber(selectedCampaign.pointsRaised)} / {formatNumber(selectedCampaign.targetPoints)} points
                </span>
                <ProgressBarContainer>
                  <ProgressBar style={{ width: `${calculateProgressPercentage(selectedCampaign.pointsRaised, selectedCampaign.targetPoints)}%` }} />
                </ProgressBarContainer>
              </div>
              <div className="mb-4">
                <label htmlFor="donationAmount" className="block text-sm font-medium text-gray-300 mb-2">
                  Donation Amount
                </label>
                <input
                  type="number"
                  id="donationAmount"
                  value={donationAmount}
                  onChange={(e) => setDonationAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[#2a2f4e] text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  max={balance}
                />
              </div>
              <button
                onClick={handleDonationSubmit}
                className="w-full px-4 py-2 bg-gradient-to-b from-[#3d47ff] to-[#575fff] text-white font-semibold rounded-[8px]"
                disabled={donationAmount <= 0 || donationAmount > balance}
              >
                Donate {donationAmount} Points
              </button>
              <p className="mt-2 text-sm text-gray-400">Your current balance: {formatNumber(balance)} points</p>

              <LeaderboardContainer>
                <LeaderboardTitle>
                  <IoTrophy size={24} color="#ffd700" />
                  Top Donors
                </LeaderboardTitle>
                <LeaderboardList>
                  {selectedCampaign.leaderboard.map((donor, index) => (
                    <LeaderboardItem key={index}>
                      <div>
                        <LeaderboardRank>#{index + 1}</LeaderboardRank>
                        <LeaderboardUsername>{donor.username}</LeaderboardUsername>
                      </div>
                      <LeaderboardPoints>{formatNumber(donor.amount)} points</LeaderboardPoints>
                    </LeaderboardItem>
                  ))}
                </LeaderboardList>
              </LeaderboardContainer>
            </div>
          </div>
        )}
      </Container>
    </Animate>
  );
};

export default Donate;