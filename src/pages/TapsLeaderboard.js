import React, { useState, useEffect, useCallback, useRef } from 'react';
import { collection, query, orderBy, limit, getDocs, where, startAfter, doc, runTransaction } from 'firebase/firestore';
import { db } from '../firebase';
import { useUser } from '../context/userContext';
import styled from 'styled-components';
import Animate from '../Components/Animate';
import { FaCrown, FaMedal, FaUserFriends, FaChartLine, FaHistory } from 'react-icons/fa';
import { IoTrophyOutline, IoRefreshOutline, IoArrowUp, IoArrowDown } from 'react-icons/io5';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { useInView } from 'react-intersection-observer';

const PageWrapper = styled.div`
  padding: 1rem;
  background-color: #f0f2f5;
  min-height: 100vh;
`;

const LeaderboardContainer = styled(motion.div)`
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: bold;
  color: #1a202c;
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  font-size: 1.125rem;
  color: #4a5568;
`;

const TabContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
  background-color: #edf2f7;
  border-radius: 0.75rem;
  padding: 0.5rem;
`;

const Tab = styled(motion.button)`
  padding: 0.75rem 1.5rem;
  border: none;
  background-color: ${props => props.active ? '#3182ce' : 'transparent'};
  color: ${props => props.active ? '#ffffff' : '#4a5568'};
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background-color: ${props => props.active ? '#2c5282' : '#e2e8f0'};
  }
`;

const LeaderboardList = styled(motion.ul)`
  list-style-type: none;
  padding: 0;
  overflow-y: auto;
  flex-grow: 1;
  max-height: 60vh;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #94a3b8;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #64748b;
  }
`;

const LeaderboardItem = styled(motion.li)`
  display: flex;
  align-items: center;
  padding: 1rem;
  background-color: ${props => props.isCurrentUser ? '#e6fffa' : '#ffffff'};
  border-radius: 0.75rem;
  margin-bottom: 1rem;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }
`;

const Rank = styled.span`
  font-size: 1.25rem;
  font-weight: 700;
  color: #2d3748;
  width: 40px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const UserInfo = styled.div`
  flex: 1;
  margin-left: 1rem;
  display: flex;
  flex-direction: column;
`;

const Username = styled.span`
  font-size: 1.125rem;
  font-weight: 600;
  color: #2d3748;
`;

const UserLevel = styled.span`
  font-size: 0.875rem;
  color: #718096;
`;

const ReferralsCount = styled.span`
  font-size: 1.125rem;
  font-weight: 600;
  color: #3182ce;
  display: flex;
  align-items: center;
`;

const RewardBadge = styled(motion.span)`
  background-color: #48bb78;
  color: #ffffff;
  font-size: 0.75rem;
  font-weight: bold;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  margin-left: 0.5rem;
`;

const RefreshButton = styled(motion.button)`
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  background-color: #3182ce;
  color: #ffffff;
  border: none;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
`;

const LoadMoreButton = styled(motion.button)`
  background-color: #3182ce;
  color: #ffffff;
  border: none;
  border-radius: 0.375rem;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 1rem;

  &:hover {
    background-color: #2c5282;
  }
`;

const StatsContainer = styled.div`
  display: flex;
  justify-content: space-around;
  margin-bottom: 2rem;
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: #2d3748;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: #718096;
`;

const TrendIndicator = styled.span`
  margin-left: 0.5rem;
  color: ${props => props.trend === 'up' ? '#48bb78' : '#e53e3e'};
`;

const TapsLeaderboard = () => {
  const { id } = useUser();
  const [leaderboard, setLeaderboard] = useState([]);
  const [activeTab, setActiveTab] = useState('weekly');
  const [lastVisible, setLastVisible] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [stats, setStats] = useState({
    totalReferrals: 0,
    averageReferrals: 0,
    topReferrer: '',
    trend: 'up'
  });

  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.5,
  });

  const fetchLeaderboard = useCallback(async (tab, startAfterDoc = null) => {
    if (loading || !hasMore) return;
    
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
        startDate = new Date(0);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
    }

    leaderboardQuery = query(
      leaderboardRef,
      where('lastReferralTimestamp', '>=', startDate),
      orderBy('lastReferralTimestamp', 'desc'),
      limit(20)
    );

    if (startAfterDoc) {
      leaderboardQuery = query(leaderboardQuery, startAfter(startAfterDoc));
    }

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

      leaderboardData.sort((a, b) => b.referralCount - a.referralCount);

      leaderboardData.forEach((user, index) => {
        user.rank = leaderboard.length + index + 1;
      });

      setLeaderboard(prev => [...prev, ...leaderboardData]);
      setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
      setHasMore(querySnapshot.docs.length === 20);

      // Calculate stats
      const totalReferrals = leaderboardData.reduce((sum, user) => sum + user.referralCount, 0);
      const averageReferrals = totalReferrals / leaderboardData.length;
      const topReferrer = leaderboardData[0]?.username || '';
      const trend = Math.random() > 0.5 ? 'up' : 'down'; // This is a placeholder. In a real app, you'd compare with previous period's data.

      setStats({
        totalReferrals,
        averageReferrals,
        topReferrer,
        trend
      });

    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setLoading(false);
    }
  }, [leaderboard.length]);

  useEffect(() => {
    setLeaderboard([]);
    setLastVisible(null);
    setHasMore(true);
    fetchLeaderboard(activeTab);
  }, [activeTab]);

  useEffect(() => {
    if (inView && hasMore) {
      fetchLeaderboard(activeTab, lastVisible);
    }
  }, [inView, hasMore, activeTab, lastVisible, fetchLeaderboard]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setLeaderboard([]);
    setLastVisible(null);
    setHasMore(true);
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
        return <FaCrown size={24} color="#FFD700" />;
      case 2:
        return <FaMedal size={24} color="#C0C0C0" />;
      case 3:
        return <FaMedal size={24} color="#CD7F32" />;
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
                  distributedAt: now
                }
              });
            }
          });

          transaction.set(rewardsRef, { lastDistribution: now }, { merge: true });
        }
      });

      console.log(`${activeTab} rewards distributed successfully`);
    } catch (error) {
      console.error("Error distributing rewards:", error);
    }
  };

  return (
    <PageWrapper>
      <Animate>
        <LeaderboardContainer
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Header>
            <Title>Referral Leaderboard</Title>
            <Subtitle>Top performers in our referral program</Subtitle>
          </Header>

          <StatsContainer>
            <StatItem>
              <StatValue>{stats.totalReferrals}</StatValue>
              <StatLabel>Total Referrals</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue>{stats.averageReferrals.toFixed(2)}</StatValue>
              <StatLabel>Average Referrals</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue>{stats.topReferrer}</StatValue>
              <StatLabel>Top Referrer</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue>
                {stats.trend === 'up' ? 'Increasing' : 'Decreasing'}
                <TrendIndicator trend={stats.trend}>
                  {stats.trend === 'up' ? <IoArrowUp /> : <IoArrowDown />}
                </TrendIndicator>
              </StatValue>
              <StatLabel>Trend</StatLabel>
            </StatItem>
          </StatsContainer>

          <TabContainer>
            <Tab
              active={activeTab === 'weekly'}
              onClick={() => handleTabChange('weekly')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaHistory /> Weekly
            </Tab>
            <Tab
              active={activeTab === 'monthly'}
              onClick={() => handleTabChange('monthly')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaChartLine /> Monthly
            </Tab>
            <Tab
              active={activeTab === 'allTime'}
              onClick={() => handleTabChange('allTime')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaUserFriends /> All Time
            </Tab>
          </TabContainer>

          <LeaderboardList>
            <AnimatePresence>
              {leaderboard.map((user) => (
                <LeaderboardItem
                  key={user.id}
                  isCurrentUser={user.id === id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Rank>{getRankIcon(user.rank) || user.rank}</Rank>
                  <UserInfo>
                    <Username>{user.username}</Username>
                    <UserLevel>Level {user.level || 1}</UserLevel>
                  </UserInfo>
                  <ReferralsCount>
                    {user.referralCount} <FaUserFriends size={16} style={{ marginLeft: '0.5rem' }} />
                  </ReferralsCount>
                  {getReward(user.rank) && (
                    <RewardBadge
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    >
                      <IoTrophyOutline style={{ marginRight: '0.25rem' }} />
                      {getReward(user.rank)}
                    </RewardBadge>
                  )}
                </LeaderboardItem>
              ))}
            </AnimatePresence>
          </LeaderboardList>

          {hasMore && (
            <div ref={loadMoreRef} style={{ height: '20px', margin: '20px 0' }}>
              {loading && <p>Loading more...</p>}
            </div>
          )}

          <RefreshButton
            onClick={() => {
              setLeaderboard([]);
              setLastVisible(null);
              setHasMore(true);
              fetchLeaderboard(activeTab);
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <IoRefreshOutline size={24} />
          </RefreshButton>
        </LeaderboardContainer>
      </Animate>
    </PageWrapper>
  );
};

export default TapsLeaderboard;