import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import styled from 'styled-components';
import { IoTimeOutline } from 'react-icons/io5';

const HistoryContainer = styled.div`
  background-color: #2a2f4e;
  border-radius: 15px;
  padding: 20px;
  margin-top: 20px;
  margin-bottom: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const HistoryTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const HistoryList = styled.ul`
  list-style-type: none;
  padding: 0;
`;

const HistoryItem = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #4a5280;
  &:last-child {
    border-bottom: none;
  }
`;

const CampaignName = styled.span`
  color: #ffffff;
  font-weight: 500;
`;

const DonationAmount = styled.span`
  font-weight: 600;
  color: #3d47ff;
`;

const DonationDate = styled.span`
  font-size: 12px;
  color: #9a96a6;
`;

const DonationHistory = ({ userId }) => {
  const [donations, setDonations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDonationHistory = async () => {
      setIsLoading(true);
      try {
        const donationsQuery = query(
          collection(db, 'donations'),
          where('userId', '==', userId),
          orderBy('timestamp', 'desc'),
          limit(10)
        );
        const donationsSnapshot = await getDocs(donationsQuery);
        const donationsList = donationsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setDonations(donationsList);
      } catch (error) {
        console.error('Error fetching donation history:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchDonationHistory();
    }
  }, [userId]);

  const formatDate = (timestamp) => {
    const date = timestamp.toDate();
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num).replace(/,/g, " ");
  };

  if (isLoading) {
    return <div>Loading donation history...</div>;
  }

  return (
    <HistoryContainer>
      <HistoryTitle>
        <IoTimeOutline size={24} />
        Recent Donations
      </HistoryTitle>
      {donations.length > 0 ? (
        <HistoryList>
          {donations.map((donation) => (
            <HistoryItem key={donation.id}>
              <div>
                <CampaignName>{donation.campaignName}</CampaignName>
                <DonationDate>{formatDate(donation.timestamp)}</DonationDate>
              </div>
              <DonationAmount>{formatNumber(donation.amount)} points</DonationAmount>
            </HistoryItem>
          ))}
        </HistoryList>
      ) : (
        <p>No donation history available.</p>
      )}
    </HistoryContainer>
  );
};

export default DonationHistory;