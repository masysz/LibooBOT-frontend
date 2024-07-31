import React, { useState, useEffect, useCallback, useRef } from 'react';
import { collection, query, orderBy, limit, getDocs, where, startAfter, runTransaction, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useUser } from '../context/userContext';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCrown, FaMedal } from 'react-icons/fa';
import { IoTrophyOutline, IoRefreshOutline } from 'react-icons/io5';

const PageContainer = styled.div`
  display: flex;
  height: 85vh;
  flex-direction: column;
  overflow: hidden;
`;

const ContentWrapper = styled.div`
  width: 100%;
  max-width: 64rem;
  margin: 0 auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  flex: 1;
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: 1rem;
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: bold;
  color: #262626;
  margin-bottom: 0.2rem;
`;

const Subtitle = styled.p`
  font-size: 16px;
  font-weight: 500;
  color: #4b5563;
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

const RewardBadge = styled(motion.span)`
  background-color: #22c55e;
  color: #ffffff;
  font-size: 12px;
  font-weight: bold;
  padding: 2px 6px;
  border-radius: 12px;
  margin-left: 8px;
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
  const [lastVisible, setLastVisible] = useState(null);
  const [loading, setLoading] = useState(false);
  const listRef = useRef(null);

  const fetchLeaderboard = useCallback(async (tab, startAfterDoc = null) => {
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
      orderBy('referralCount', 'desc'),
      limit(20)
    );

    if (startAfterDoc) {
      leaderboardQuery = query(leaderboardQuery, startAfter(startAfterDoc));
    }

    try {
      const querySnapshot = await getDocs(leaderboardQuery);
      const leaderboardData = querySnapshot.docs.map((doc, index) => ({
        id: doc.id,
        ...doc.data(),
        rank: index + 1 + (leaderboard.length || 0)
      }));

      if (startAfterDoc) {
        setLeaderboard(prev => [...prev, ...leaderboardData]);
      } else {
        setLeaderboard(leaderboardData);
      }

      setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setLoading(false);
    }
  }, [leaderboard.length]);

  useEffect(() => {
    fetchLeaderboard(activeTab);
  }, [activeTab, fetchLeaderboard]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setLastVisible(null);
    setLeaderboard([]);
  };

  const loadMore = () => {
    if (lastVisible && !loading) {
      fetchLeaderboard(activeTab, lastVisible);
    }
  };

  const handleScroll = () => {
    if (listRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = listRef.current;
      if (scrollTop + clientHeight >= scrollHeight - 5) {
        loadMore();
      }
    }
  };

  const getReward = (rank) => {
    if (activeTab === 'weekly') {
      if (rank === 1) return '10 TON';
      if (rank === 2) return '5 TON';
      if (rank === 3) return '2 TON';
    } else if (activeTab === 'monthly') {
      if (rank === 1) return '15 TON';
      if (rank === 2) return '8 TON';
      if (rank === 3) return '5 TON';
    }
    return null;
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

  const distributeRewards = async () => {
    const rewardsRef = doc(db, 'rewards', activeTab);

    try {
      await runTransaction(db, async (transaction) => {
        const rewardsDoc = await transaction.get(rewardsRef);
        const lastDistribution = rewardsDoc.data()?.lastDistribution?.toDate() || new Date(0);

        const now = new Date();
        let shouldDistribute = false;

        if (activeTab === 'weekly' && now - lastDistribution >= 7 * 24 * 60 * 60 * 1000) {
          shouldDistribute = true;
        } else if (activeTab === 'monthly' && now.getMonth() !== lastDistribution.getMonth()) {
          shouldDistribute = true;
        }

        if (shouldDistribute) {
          leaderboard.slice(0, 3).forEach((user, index) => {
            const userRef = doc(db, 'telegramUsers', user.id);
            const reward = getReward(index + 1);
            if (reward) {
              const [amount, currency] = reward.split(' ');
              transaction.update(userRef, {
                [`rewards.${activeTab}`]: {
                  amount: parseFloat(amount),
                  currency,
                  distributedAt: serverTimestamp()
                }
              });
            }
          });

          transaction.set(rewardsRef, { lastDistribution: serverTimestamp() }, { merge: true });
        }
      });

      console.log(`${activeTab} rewards distributed successfully`);
    } catch (error) {
      console.error("Error distributing rewards:", error);
    }
  };

  useEffect(() => {
    distributeRewards();
  }, [activeTab, leaderboard]);

  return (
    <PageContainer>
      <ContentWrapper>
        <Header>
          <Title>Referral Leaderboard</Title>
          <Subtitle>Top referrers compete for rewards</Subtitle>
        </Header>

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
          ref={listRef}
          onScroll={handleScroll}
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
                  {getReward(user.rank) && (
                    <RewardBadge
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    >
                      {getReward(user.rank)}
                    </RewardBadge>
                  )}
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
      </ContentWrapper>
    </PageContainer>
  );
};

export default React.memo(TapsLeaderboard);