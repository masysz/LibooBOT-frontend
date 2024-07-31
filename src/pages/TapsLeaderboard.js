import React, { useState, useEffect, useCallback } from 'react';
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import { db } from '../firebase';
import { useUser } from '../context/userContext';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCrown, FaMedal } from 'react-icons/fa';
import { IoTrophyOutline, IoRefreshOutline } from 'react-icons/io5';

const LeaderboardContainer = styled(motion.div)`
  border-radius: 1rem;
  height: 85vh;
  padding: 1rem;
  margin: 1rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: bold;
  color: #262626;
  text-align: center;
  margin-bottom: 1rem;
`;

const TabContainer = styled.div`
  display: flex;
  justify-content: space-around;
  margin-bottom: 20px;
  background-color: #f3f4f6;
  border-radius: 1rem;
  padding: 5px;
`;

const Tab = styled(motion.button)`
  padding: 10px 20px;
  border: none;
  background-color: ${props => props.active ? '#0284c7' : 'transparent'};
  color: ${props => props.active ? '#ffffff' : '#4b5563'};
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;

  &:hover {
    background-color: ${props => props.active ? '#0284c7' : '#e5e7eb'};
  }
`;

const LeaderboardList = styled(motion.ul)`
  list-style-type: none;
  padding: 0;
  overflow-y: auto;
  flex-grow: 1;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: #94a3b8;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #64748b;
  }
`;

const LeaderboardItem = styled(motion.li)`
  display: flex;
  align-items: center;
  padding: 12px;
  background-color: ${props => props.isCurrentUser ? '#e0f2fe' : '#ffffff'};
  border-radius: 0.75rem;
  margin-bottom: 8px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }
`;

const Rank = styled.span`
  font-size: 16px;
  font-weight: 700;
  color: #64748b;
  width: 30px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const UserInfo = styled.div`
  flex: 1;
  margin-left: 12px;
  display: flex;
  flex-direction: column;
`;

const Username = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
`;

const ReferralsCount = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: #0284c7;
  display: flex;
  align-items: center;
`;

const RefreshButton = styled(motion.button)`
  position: absolute;
  top: 20px;
  right: 20px;
  background-color: #0284c7;
  color: #ffffff;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
`;

const TapsLeaderboard = () => {
  const { id } = useUser();
  const [leaderboard, setLeaderboard] = useState([]);
  const [activeTab, setActiveTab] = useState('weekly');
  const [loading, setLoading] = useState(false);

  const fetchLeaderboard = useCallback(async (tab) => {
    setLoading(true);
    const leaderboardRef = collection(db, 'telegramUsers');
    let leaderboardQuery;

    const now = new Date();
    let startDate;

    switch (tab) {
      case 'weekly':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
        break;
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        break;
      case 'allTime':
        startDate = new Date(0); // Beginning of time
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
    }

    leaderboardQuery = query(
      leaderboardRef,
      where('lastReferralTimestamp', '>=', startDate),
      orderBy('lastReferralTimestamp', 'desc'),
      limit(100)
    );

    try {
      const querySnapshot = await getDocs(leaderboardQuery);
      const leaderboardData = await Promise.all(querySnapshot.docs.map(async (userDoc) => {
        const referralsQuery = query(collection(db, `telegramUsers/${userDoc.id}/referrals`), where('timestamp', '>=', startDate));
        const referralsSnapshot = await getDocs(referralsQuery);
        const referralCount = referralsSnapshot.size;

        return {
          id: userDoc.id,
          ...userDoc.data(),
          referralCount
        };
      }));

      // Sort the leaderboard data by referral count in descending order
      leaderboardData.sort((a, b) => b.referralCount - a.referralCount);

      // Add rank to each user
      leaderboardData.forEach((user, index) => {
        user.rank = index + 1;
      });

      setLeaderboard(leaderboardData);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard(activeTab);
  }, [activeTab, fetchLeaderboard]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <FaCrown size={20} color="#FFD700" />;
      case 2:
        return <FaMedal size={20} color="#C0C0C0" />;
      case 3:
        return <FaMedal size={20} color="#CD7F32" />;
      default:
        return null;
    }
  };

  return (
    <LeaderboardContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Title>Referrals Leaderboard</Title>
      <TabContainer>
        {['weekly', 'monthly', 'allTime'].map((tab) => (
          <Tab
            key={tab}
            active={activeTab === tab}
            onClick={() => handleTabChange(tab)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </Tab>
        ))}
      </TabContainer>
      <LeaderboardList
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <AnimatePresence>
          {leaderboard.map((user, index) => (
            <LeaderboardItem
              key={user.id}
              isCurrentUser={user.id === id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Rank>{getRankIcon(user.rank) || `#${user.rank}`}</Rank>
              <UserInfo>
                <Username>{user.username || `User ${user.id}`}</Username>
              </UserInfo>
              <ReferralsCount>
                <IoTrophyOutline size={16} style={{ marginRight: '4px' }} />
                {user.referralCount || 0}
              </ReferralsCount>
            </LeaderboardItem>
          ))}
        </AnimatePresence>
      </LeaderboardList>
      <RefreshButton
        onClick={() => fetchLeaderboard(activeTab)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <IoRefreshOutline size={24} />
      </RefreshButton>
    </LeaderboardContainer>
  );
};

export default TapsLeaderboard;