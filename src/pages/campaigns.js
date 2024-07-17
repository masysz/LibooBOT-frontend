import React, { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase'; // Adjust the path as needed
import { useUser } from '../context/userContext';

const Campaigns = () => {
  const { userId, balance, setBalance } = useUser();
  const [campaigns, setCampaigns] = useState([]);

  useEffect(() => {
    const fetchCampaigns = async () => {
      const querySnapshot = await getDocs(collection(db, 'campaigns'));
      const campaignsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCampaigns(campaignsData);
    };

    fetchCampaigns();
  }, []);

  const handleDonate = async (campaignId, donationAmount) => {
    const campaignRef = doc(db, 'campaigns', campaignId);
    const campaignDoc = await getDoc(campaignRef);
    const currentAmount = campaignDoc.data().currentAmount;

    await updateDoc(campaignRef, {
      currentAmount: currentAmount + donationAmount,
    });

    setBalance(balance - donationAmount);
  };

  return (
    <div className="campaigns-container">
      <h1>Charity Campaigns</h1>
      {campaigns.map(campaign => (
        <div key={campaign.id} className="campaign">
          <img src={campaign.imageUrl} alt={campaign.title} />
          <h2>{campaign.title}</h2>
          <p>{campaign.description}</p>
          <div className="progress-bar">
            <div
              className="progress"
              style={{ width: `${(campaign.currentAmount / campaign.targetAmount) * 100}%` }}
            ></div>
          </div>
          <p>{campaign.currentAmount} / {campaign.targetAmount} points raised</p>
          <button onClick={() => handleDonate(campaign.id, 100)} disabled={balance < 100}>Donate 100 points</button>
        </div>
      ))}
    </div>
  );
};

export default Campaigns;
