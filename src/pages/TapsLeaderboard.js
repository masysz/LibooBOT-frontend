import React, { useState, useEffect, useRef } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useUser } from '../context/userContext';
import styled from 'styled-components';
import Animate from '../Components/Animate';
import { FaCrown, FaMedal, FaChevronDown } from 'react-icons/fa';
import { IoTrophyOutline, IoRocketOutline } from 'react-icons/io5';
import coinsmall from "../images/main-logo.png";

const LeaderboardContainer = styled.div`
  background-color: #f8fafc;
  border-radius: 16px;
  padding: 20px 10px; // Añadido padding horizontal de 10px
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  height: 85vh;
  display: flex;
  flex-direction: column;
`;

const LeaderboardHeader = styled.h2`
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 20px;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 2px;
`;

const LeaderboardList = styled.ul`
  list-style-type: none;
  padding: 0;
  overflow-y: auto;
  flex-grow: 1;
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 10px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #94a3b8;
    border-radius: 10px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #64748b;
  }
`;

const LeaderboardItem = styled.li`
  display: flex;
  align-items: center;
  padding: 16px;
  background-color: ${props => props.isCurrentUser ? '#e0f2fe' : '#ffffff'};
  border-radius: 12px;
  margin-bottom: 8px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent);
    transition: all 0.3s ease;
  }

  &:hover::after {
    transform: translateX(100%);
  }
`;

const Rank = styled.span`
  font-size: 20px;
  font-weight: 700;
  color: #64748b;
  width: 40px;
  text-align: center;
`;

const UserInfo = styled.div`
  flex: 1;
  margin-left: 16px;
  display: flex;
  flex-direction: column;
`;

const Username = styled.span`
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 4px;
`;

const UserStats = styled.div`
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #64748b;
`;

const TapBalance = styled.span`
  font-size: 18px;
  font-weight: 600;
  color: #0284c7;
  display: flex;
  align-items: center;
`;

const CoinIcon = styled.img`
  width: 24px;
  height: 24px;
  margin-right: 8px;
`;

const CurrentUserSection = styled.div`
  background-color: #f1f5f9;
  border-radius: 12px;
  padding: 16px;
  margin-top: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const CurrentUserRank = styled.span`
  font-size: 20px;
  font-weight: 700;
  color: #0284c7;
  display: flex;
  align-items: center;
`;

const LoadMoreButton = styled.button`
  background-color: #0284c7;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 16px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: #0369a1;
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  &:active {
    transform: translateY(0);
  }
`;

const RankChange = styled.span`
  display: flex;
  align-items: center;
  font-size: 14px;
  margin-left: 8px;
  color: ${props => props.change > 0 ? '#10b981' : props.change < 0 ? '#ef4444' : '#6b7280'};
`;

const TapsLeaderboard = () => {
  const { id, name, tapBalance } = useUser();
  const [leaderboard, setLeaderboard] = useState([]);
  const [currentUserRank, setCurrentUserRank] = useState(null);
  const [visibleItems, setVisibleItems] = useState(10);
  const listRef = useRef(null);

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
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    } else {
      return num.toString();
    }
  };

  const getUserDisplayName = (user) => {
    return user.name || 'Anonymous User';
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <FaCrown size={28} color="#FFD700" />;
      case 2:
        return <FaMedal size={28} color="#C0C0C0" />;
      case 3:
        return <FaMedal size={28} color="#CD7F32" />;
      default:
        return null;
    }
  };

  const loadMore = () => {
    setVisibleItems(prevItems => Math.min(prevItems + 10, leaderboard.length));
    setTimeout(() => {
      if (listRef.current) {
        listRef.current.scrollTop = listRef.current.scrollHeight;
      }
    }, 100);
  };

  return (
    <Animate>
      <LeaderboardContainer>
        <LeaderboardHeader>Taps Leaderboard</LeaderboardHeader>
        <LeaderboardList ref={listRef}>
          {leaderboard.slice(0, visibleItems).map((user) => (
            <LeaderboardItem key={user.id} isCurrentUser={user.id === id}>
              <Rank>{getRankIcon(user.rank) || `#${user.rank}`}</Rank>
              <UserInfo>
                <Username>{getUserDisplayName(user)}</Username>
                <UserStats>
                  <IoRocketOutline size={16} style={{ marginRight: '4px' }} />
                  Level {user.level?.name || 'N/A'}
                </UserStats>
              </UserInfo>
              <TapBalance>
                <CoinIcon src={coinsmall} alt="coin" />
                {formatNumber(user.tapBalance)}
              </TapBalance>
            </LeaderboardItem>
          ))}
        </LeaderboardList>
        {visibleItems < leaderboard.length && (
          <LoadMoreButton onClick={loadMore}>
            Load More
            <FaChevronDown style={{ marginLeft: '8px' }} />
          </LoadMoreButton>
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
            <IoTrophyOutline size={28} style={{ marginRight: '8px' }} />
            Rank: #{currentUserRank}
          </CurrentUserRank>
        </CurrentUserSection>
      </LeaderboardContainer>
    </Animate>
  );
};

export default TapsLeaderboard;