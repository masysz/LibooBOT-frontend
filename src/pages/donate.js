import React, { useState, useEffect, useCallback, useRef } from 'react';
import { doc, collection, getDocs, runTransaction, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import Animate from '../Components/Animate';
import Spinner from '../Components/Spinner';
import { useUser } from '../context/userContext';
import { IoClose, IoCheckmarkCircle, IoTrophy } from "react-icons/io5";
import congratspic from '../images/congrats.png';

const Donate = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [donationAmount, setDonationAmount] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { balance, setBalance, loading: userLoading, id, username } = useUser();
  const [congrats, setCongrats] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    // Ajuste para Telegram Mini Apps
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
      
    }
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


    
    
      window.Telegram.WebApp.BackButton.show();
     
  


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
    } catch (error) {
      console.error("Error processing donation:", error);
      alert(error.message || "An error occurred while processing your donation. Please try again.");
    }
  }, [donationAmount, balance, id, username, selectedCampaign, db, setBalance]);

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
    return new Intl.NumberFormat().format(num).replace(/,/g, " ");
  }, []);

  if (userLoading || isLoading) {
    return <Spinner />;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <Animate>
      <div className="w-full h-full flex flex-col 	" style={{ height: '100vh' }}>
        <div className="w-full absolute top-[-35px] left-0 right-0 flex justify-center z-20 pointer-events-none select-none">
          {congrats ? <img src={congratspic} alt="congrats" className="w-[80%]" /> : null}
        </div>

        <h1 className="text-[32px] font-semibold mb-4 text-center">Donate to Campaigns</h1>

        <div ref={scrollRef} id="scrollable-element" className="flex-1  flex overflow-y-auto pb-50 mb-50" style={{ WebkitOverflowScrolling: 'touch' }}>
          <div className="w-full flex flex-col space-y-4  px-5 mb-[100px]">
            {campaigns.map(campaign => (
              <div key={campaign.id} className='bg-[#2a2f4e] rounded-[10px] p-[14px] flex flex-col'>
                {campaign.image && (
                  <img 
                    src={campaign.image} 
                    alt={campaign.title}
                    className="w-full h-[200px] object-cover rounded-[10px] mb-4"
                    onError={(e) => {
                      console.error(`Error loading image for campaign ${campaign.id}:`, e);
                      e.target.src = 'https://via.placeholder.com/400x200?text=Image+Not+Found';
                    }}
                  />
                )}
                <h2 className="text-[24px] font-semibold mb-2">{campaign.title}</h2>
                <p className="text-[14px] text-[#b8b8b8] mb-4">{campaign['short-description'] || 'No description available'}</p>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[18px] font-medium">
                    {formatNumber(campaign.pointsRaised)} / {formatNumber(campaign.targetPoints)} points
                  </span>
                </div>
                <div className='w-full bg-[#1a1f3d] h-[10px] rounded-[5px] mb-4'>
                  <div 
                    className='h-full bg-[#3d47ff] rounded-[5px]' 
                    style={{ width: `${Math.min(100, (campaign.pointsRaised / campaign.targetPoints) * 100)}%` }}
                  ></div>
                </div>
                <button 
                  onClick={() => handleCampaignClick(campaign)} 
                  className="w-full bg-gradient-to-b from-[#3d47ff] to-[#575fff] px-4 py-2 rounded-[8px] text-white font-semibold"
                >
                  View Campaign
                </button>
              </div>
            ))}
          </div>
        </div>

        {showPopup && selectedCampaign && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[#1e2340] rounded-[20px] p-6 w-[90%] max-w-[500px] max-h-[90vh] overflow-y-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-[24px] font-semibold">{selectedCampaign.title}</h2>
                <button onClick={() => setShowPopup(false)} className="text-[#9a96a6]">
                  <IoClose size={24} />
                </button>
              </div>
              {selectedCampaign.image && (
                <img 
                  src={selectedCampaign.image} 
                  alt={selectedCampaign.title}
                  className="w-full h-[200px] object-cover rounded-[10px] mb-4"
                />
              )}
              <p className="text-[14px] text-[#b8b8b8] mb-4">{selectedCampaign['large-description'] || 'No detailed description available'}</p>
              <div className="mb-4">
                <h3 className="text-[18px] font-semibold mb-2">Progress</h3>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[16px]">
                    {formatNumber(selectedCampaign.pointsRaised)} / {formatNumber(selectedCampaign.targetPoints)} points
                  </span>
                </div>
                <div className='w-full bg-[#1a1f3d] h-[10px] rounded-[5px]'>
                  <div 
                    className='h-full bg-[#3d47ff] rounded-[5px]' 
                    style={{ width: `${Math.min(100, (selectedCampaign.pointsRaised / selectedCampaign.targetPoints) * 100)}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="bg-[#343b66] rounded-[15px] p-5 mb-4">
                <h3 className="text-[20px] font-semibold mb-4 flex items-center gap-2">
                  <IoTrophy size={24} color="#ffd700" />
                  Top Donors
                </h3>
                <ul className="list-none p-0">
                  {selectedCampaign.leaderboard.map((donor, index) => (
                    <li key={donor.id} className="flex justify-between items-center py-2 border-b border-[#4a5280] last:border-b-0">
                      <div>
                        <span className="font-semibold text-[#ffd700] mr-2">{index + 1}.</span>
                        <span className="text-white">{donor.username}</span>
                      </div>
                      <span className="font-bold text-white">{formatNumber(donor.amount)} points</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="mb-4">
                <h3 className="text-[18px] font-semibold mb-2">Donate</h3>
                <input
                  type="number"
                  value={donationAmount}
                  onChange={(e) => setDonationAmount(e.target.value)}
                  className="w-full bg-[#252e57] text-white rounded-[8px] p-2 mb-4"
                  placeholder="Enter donation amount"
                />
                <p className="text-[14px] text-[#9a96a6] mb-2">Your current balance: {formatNumber(balance)} points</p>
              </div>
              <button
                onClick={handleDonationSubmit}
                className="w-full bg-gradient-to-b from-[#3d47ff] to-[#575fff] py-3 rounded-[12px] text-white font-semibold"
                disabled={Number(donationAmount) <= 0 || Number(donationAmount) > balance}
              >
                Confirm Donation
              </button>
            </div>
          </div>
        )}

        <div className={`${congrats ? "visible bottom-6" : "invisible bottom-[-10px]"} z-[60] ease-in duration-300 w-full fixed left-0 right-0 px-4`}>
          <div className="w-full text-[#54d192] flex items-center space-x-2 px-4 bg-[#121620ef] rounded-lg py-2">
            <IoCheckmarkCircle size={24} />
            <span className="text-[16px] font-semibold">Donation Successful!</span>
          </div>
        </div>
      </div>
    </Animate>
  );
};

export default Donate;
