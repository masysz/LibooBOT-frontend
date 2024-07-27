import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useUser } from '../context/userContext';
import styled from 'styled-components';
import Animate from '../Components/Animate';
import { FaCrown, FaMedal } from 'react-icons/fa';
import { IoTrophyOutline } from 'react-icons/io5';
import coinsmall from "../images/main-logo.png";

const LeaderboardContainer = styled.div`
  background-color: #f8fafc;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const LeaderboardHeader = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 20px;
  text-align: center;
`;

const LeaderboardList = styled.ul`
  list-style-type: none;
  padding: 0;
`;

const LeaderboardItem = styled.li`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background-color: ${props => props.isCurrentUser ? '#e0f2fe' : '#ffffff'};
  border-radius: 12px;
  margin-bottom: 8px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
`;

const Rank = styled.span`
  font-size: 18px;
  font-weight: 600;
  color: #64748b;
  width: 30px;
`;

const UserInfo = styled.div`
  flex: 1;
  margin-left: 12px;
`;

const Username = styled.span`
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
`;

const TapBalance = styled.span`
  font-size: 16px;
  font-weight: 600;
  color: #0284c7;
  display: flex;
  align-items: center;
`;

const CoinIcon = styled.img`
  width: 20px;
  height: 20px;
  margin-right: 4px;
`;

const CurrentUserSection = styled.div`
  background-color: #f1f5f9;
  border-radius: 12px;
  padding: 16px;
  margin-top: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const CurrentUserRank = styled.span`
  font-size: 18px;
  font-weight: 700;
  color: #0284c7;
`;

const LoadMoreButton = styled.button`
  background-color: #0284c7;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-top: 16px;
  width: 100%;

  &:hover {
    background-color: #0369a1;
  }
`;

const TapsLeaderboard = () => {
  const { id, name, tapBalance } = useUser();
  const [leaderboard, setLeaderboard] = useState([]);
  const [currentUserRank, setCurrentUserRank] = useState(null);
  const [visibleItems, setVisibleItems] = useState(10);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const leaderboardQuery = query(
        collection(db, 'telegramUsers'),
        orderBy('tapBalance', 'desc'),
        limit(100)
      );
      const querySnapshot = await getDocs(leaderboardQuery);
      const leaderboardData = querySnapshot.docs.map((doc, index) => ({
        id: doc.id,
        rank: index + 1,
        ...doc.data()
      }));
      setLeaderboard(leaderboardData);

      const userRank = leaderboardData.findIndex(user => user.id === id);
      setCurrentUserRank(userRank !== -1 ? userRank + 1 : 'N/A');
    };

    fetchLeaderboard();
  }, [id]);

  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num).replace(/,/g, " ");
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

  const loadMore = () => {
    setVisibleItems(prevItems => Math.min(prevItems + 10, leaderboard.length));
  };

  return (
    <Animate>
      <LeaderboardContainer>
        <LeaderboardHeader>Taps Leaderboard</LeaderboardHeader>
        <LeaderboardList>
          {leaderboard.slice(0, visibleItems).map((user, index) => (
            <LeaderboardItem key={user.id} isCurrentUser={user.id === id}>
              <Rank>{getRankIcon(user.rank) || `#${user.rank}`}</Rank>
              <UserInfo>
                <Username>{user.name}</Username>
              </UserInfo>
              <TapBalance>
                <CoinIcon src={coinsmall} alt="coin" />
                {formatNumber(user.tapBalance)}
              </TapBalance>
            </LeaderboardItem>
          ))}
        </LeaderboardList>
        {visibleItems < leaderboard.length && (
          <LoadMoreButton onClick={loadMore}>Load More</LoadMoreButton>
        )}
        <CurrentUserSection>
          <UserInfo>
            <Username>{name}</Username>
            <TapBalance>
              <CoinIcon src={coinsmall} alt="coin" />
              {formatNumber(tapBalance)}
            </TapBalance>
          </UserInfo>
          <CurrentUserRank>
            <IoTrophyOutline size={24} style={{ marginRight: '8px' }} />
            Rank: #{currentUserRank}
          </CurrentUserRank>
        </CurrentUserSection>
      </LeaderboardContainer>
    </Animate>
  );
};

export default TapsLeaderboard;