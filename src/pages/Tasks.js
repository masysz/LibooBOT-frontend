import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styled from "styled-components";
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useUser } from '../context/userContext';
import Spinner from '../Components/Spinner';
import coinsmall from "../images/main-logo.png";
import telegramicon from "../images/telegram.gif";
import twittericon from "../images/twitter.gif";
import instagramicon from "../images/instagram.gif";
import { MdOutlineKeyboardArrowRight } from 'react-icons/md';
import { IoCheckmarkSharp } from "react-icons/io5";
import TaskOne from '../Components/TaskOne';
import TaskThree from '../Components/TaskThree';
import TaskSix from '../Components/TaskSix';
import DailyRewards from '../Components/DailyRewards';
import MilestoneRewards from '../Components/MilestoneRewards';
import ReferralRewards from '../Components/Rewards';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 85vh;
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
  margin-bottom: 1.5rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: bold;
  color: #262626;
  margin-bottom: 0.25rem;
`;

const TabContainer = styled.div`
  display: flex;
  justify-content: space-between;
  background-color: #f0f4ff;
  border-radius: 1rem;
  padding: 0.25rem;
  margin-bottom: 1rem;
  position: sticky;
  top: 0;
  z-index: 10;
`;

const Tab = styled.button`
  flex: 1;
  padding: 0.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  transition: all 0.3s;
  font-size: 16px;
  background-color: ${props => props.active ? '#ffffff' : 'transparent'};
  box-shadow: ${props => props.active ? '0 2px 4px rgba(0, 0, 0, 0.1)' : 'none'};
`;

const TaskContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const TaskItem = styled.div`
  background-color: #ffffff;
  border-radius: 0.5rem;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;

  &:hover {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
`;

const TaskIcon = styled.img`
  width: 2.5rem;
  height: 2.5rem;
  margin-right: 1rem;
`;

const TaskInfo = styled.div`
  flex: 1;
`;

const TaskName = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #262626;
  margin-bottom: 0.25rem;
`;

const TaskReward = styled.div`
  display: flex;
  align-items: center;
  font-size: 0.875rem;
  color: #4b5563;
`;

const ScrollableContent = styled.div`
  overflow-y: auto;
  flex: 1;
  padding-right: 0.5rem;
  margin-right: -0.5rem;
  scroll-behavior: smooth;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
  }

  &::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #555;
  }
`;

const Tasks = () => {
  const { id, taskCompleted, setTaskCompleted, taskCompleted3, setTaskCompleted3, taskCompleted6, setTaskCompleted6 } = useUser();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('special');
  const [showModal, setShowModal] = useState(false);
  const [showModal3, setShowModal3] = useState(false);
  const [showModal6, setShowModal6] = useState(false);
  const [showDailyRewards, setShowDailyRewards] = useState(false);

  const taskID = "task_3100";
  const taskID3 = "task_3102";
  const taskID6 = "task_3105";

  const checkTaskCompletion = useCallback(async (userId, taskId) => {
    try {
      const userTaskDocRef = doc(db, 'userTasks', `${userId}_${taskId}`);
      const docSnap = await getDoc(userTaskDocRef);
      return docSnap.exists() ? docSnap.data().completed : false;
    } catch (e) {
      console.error('Error checking task completion: ', e);
      return false;
    }
  }, []);

  useEffect(() => {
    if (id) {
      checkTaskCompletion(id, taskID).then(setTaskCompleted);
      checkTaskCompletion(id, taskID3).then(setTaskCompleted3);
      checkTaskCompletion(id, taskID6).then(setTaskCompleted6);
    }
  }, [id, checkTaskCompletion, setTaskCompleted, setTaskCompleted3, setTaskCompleted6]);

  const formatNumber = useCallback((num) => {
    return new Intl.NumberFormat().format(num).replace(/,/g, " ");
  }, []);

  const renderTaskContent = () => {
    switch (activeTab) {
      case 'special':
        return (
          <TaskContainer>
            <TaskItem onClick={() => setShowDailyRewards(true)}>
              <TaskIcon src={coinsmall} alt="Daily Rewards" />
              <TaskInfo>
                <TaskName>Daily Rewards</TaskName>
                <TaskReward>
                  <img src={coinsmall} alt="coin" style={{ width: '1rem', marginRight: '0.25rem' }} />
                  Claim daily
                </TaskReward>
              </TaskInfo>
              <MdOutlineKeyboardArrowRight size={20} color="#171717" />
            </TaskItem>
            <TaskItem onClick={() => setShowModal(true)}>
              <TaskIcon src={telegramicon} alt="Telegram" />
              <TaskInfo>
                <TaskName>Join Our Telegram Channel</TaskName>
                <TaskReward>
                  <img src={coinsmall} alt="coin" style={{ width: '1rem', marginRight: '0.25rem' }} />
                  {formatNumber(50000)}
                </TaskReward>
              </TaskInfo>
              {taskCompleted ? <IoCheckmarkSharp size={20} color="#5bd173" /> : <MdOutlineKeyboardArrowRight size={20} color="#171717" />}
            </TaskItem>
            <TaskItem onClick={() => setShowModal3(true)}>
              <TaskIcon src={twittericon} alt="Twitter" />
              <TaskInfo>
                <TaskName>Follow us on X</TaskName>
                <TaskReward>
                  <img src={coinsmall} alt="coin" style={{ width: '1rem', marginRight: '0.25rem' }} />
                  {formatNumber(50000)}
                </TaskReward>
              </TaskInfo>
              {taskCompleted3 ? <IoCheckmarkSharp size={20} color="#5bd173" /> : <MdOutlineKeyboardArrowRight size={20} color="#171717" />}
            </TaskItem>
            <TaskItem onClick={() => setShowModal6(true)}>
              <TaskIcon src={instagramicon} alt="Instagram" />
              <TaskInfo>
                <TaskName>Follow us on Instagram</TaskName>
                <TaskReward>
                  <img src={coinsmall} alt="coin" style={{ width: '1rem', marginRight: '0.25rem' }} />
                  {formatNumber(80000)}
                </TaskReward>
              </TaskInfo>
              {taskCompleted6 ? <IoCheckmarkSharp size={20} color="#5bd173" /> : <MdOutlineKeyboardArrowRight size={20} color="#171717" />}
            </TaskItem>
          </TaskContainer>
        );
      case 'leagues':
        return <MilestoneRewards />;
      case 'refBonus':
        return <ReferralRewards />;
      default:
        return null;
    }
  };

  return (
    <PageContainer>
      <ContentWrapper>
        {loading ? (
          <Spinner />
        ) : (
          <>
            <Header>
              <Title>Tasks & Rewards</Title>
            </Header>
            <TabContainer>
              <Tab active={activeTab === 'special'} onClick={() => setActiveTab('special')}>Special</Tab>
              <Tab active={activeTab === 'leagues'} onClick={() => setActiveTab('leagues')}>Leagues</Tab>
              <Tab active={activeTab === 'refBonus'} onClick={() => setActiveTab('refBonus')}>Ref Bonus</Tab>
            </TabContainer>
            <ScrollableContent>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {renderTaskContent()}
                </motion.div>
              </AnimatePresence>
            </ScrollableContent>
          </>
        )}
      </ContentWrapper>
      <TaskOne showModal={showModal} setShowModal={setShowModal} />
      <TaskThree showModal={showModal3} setShowModal={setShowModal3} />
      <TaskSix showModal={showModal6} setShowModal={setShowModal6} />
      <DailyRewards showModal={showDailyRewards} setShowModal={setShowDailyRewards} />
    </PageContainer>
  );
};

export default React.memo(Tasks);