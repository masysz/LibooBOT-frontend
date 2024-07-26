import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Outlet } from 'react-router-dom';
import { MdOutlineKeyboardArrowRight } from 'react-icons/md';
import { IoCheckmarkSharp } from "react-icons/io5";
import { useUser } from '../context/userContext';
import Spinner from '../Components/Spinner';
import TaskOne from '../Components/TaskOne';
import TaskTwo from '../Components/TaskTwo';
import TaskThree from '../Components/TaskThree';
import TaskFour from '../Components/TaskFour';
import TaskFive from '../Components/TaskFive';
import TaskSix from '../Components/TaskSix';
import TaskSeven from '../Components/TaskSeven';
import ClaimLeveler from '../Components/ClaimLeveler';
import Levels from '../Components/Levels';
import MilestoneRewards from '../Components/MilestoneRewards';
import ReferralRewards from '../Components/Rewards';
import DailyRewards from '../Components/DailyRewards';

// Import images
import coinsmall from "../images/main-logo.png";
import telegramicon from "../images/telegram.gif";
import twittericon from "../images/twitter.gif";
import instagramicon from "../images/instagram.gif";

const Tasks = () => {
  const { id, taskCompleted, setTaskCompleted, taskCompleted3, setTaskCompleted3, taskCompleted6, setTaskCompleted6 } = useUser();
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(1);
  const [showDailyRewards, setShowDailyRewards] = useState(false);

  const [modals, setModals] = useState({
    taskOne: false,
    taskTwo: false,
    taskThree: false,
    taskFour: false,
    taskFive: false,
    taskSix: false,
    taskSeven: false,
    claimLevel: false,
    levels: false,
  });

  const toggleModal = (modalName) => {
    setModals(prev => ({ ...prev, [modalName]: !prev[modalName] }));
    document.getElementById("footermain").style.zIndex = modals[modalName] ? "0" : "50";
  };

  useEffect(() => {
    // ... (keep your existing useEffect for checking task completion)
  }, [id, setTaskCompleted, setTaskCompleted3, setTaskCompleted6]);

  const TaskItem = ({ icon, title, reward, completed, onClick }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className='bg-white rounded-lg p-4 flex justify-between items-center shadow-md'
    >
      <div className='flex items-center space-x-4'>
        <img src={icon} alt={title} className='w-12 h-12 object-contain'/>
        <div>
          <h3 className='font-semibold text-gray-800'>{title}</h3>
          <div className='flex items-center space-x-1 text-sm text-gray-600'>
            <img src={coinsmall} className="w-4 h-4" alt="coin"/>
            <span>{reward}</span>
          </div>
        </div>
      </div>
      {completed ? (
        <IoCheckmarkSharp className="w-6 h-6 text-green-500"/>
      ) : (
        <MdOutlineKeyboardArrowRight className="w-6 h-6 text-gray-400"/>
      )}
    </motion.div>
  );

  const TabButton = ({ index, label }) => (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={() => setActiveIndex(index)}
      className={`py-2 px-4 rounded-md transition-colors ${
        activeIndex === index ? 'bg-white text-blue-600 shadow-md' : 'text-gray-600'
      }`}
    >
      {label}
    </motion.button>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className='min-h-screen bg-gradient-to-b from-blue-100 to-blue-200 p-4'
    >
      {loading ? (
        <Spinner />
      ) : (
        <div className='max-w-md mx-auto space-y-6'>
          <div className='bg-blue-50 rounded-lg p-2 flex justify-between shadow-md'>
            <TabButton index={1} label="Special" />
            <TabButton index={2} label="Leagues" />
            <TabButton index={3} label="Ref Bonus" />
          </div>

          <AnimatePresence mode='wait'>
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className='space-y-4'
            >
              {activeIndex === 1 && (
                <>
                  <TaskItem
                    icon={coinsmall}
                    title="Daily Rewards"
                    reward="Claim daily"
                    onClick={() => toggleModal('dailyRewards')}
                  />
                  <TaskItem
                    icon={telegramicon}
                    title="Join Our Telegram Channel"
                    reward="50 000"
                    completed={taskCompleted}
                    onClick={() => toggleModal('taskOne')}
                  />
                  <TaskItem
                    icon={twittericon}
                    title="Follow us on X"
                    reward="50 000"
                    completed={taskCompleted3}
                    onClick={() => toggleModal('taskThree')}
                  />
                  <TaskItem
                    icon={instagramicon}
                    title="Follow us on Instagram"
                    reward="80 000"
                    completed={taskCompleted6}
                    onClick={() => toggleModal('taskSix')}
                  />
                </>
              )}
              {activeIndex === 2 && <MilestoneRewards />}
              {activeIndex === 3 && <ReferralRewards />}
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      <TaskOne showModal={modals.taskOne} setShowModal={() => toggleModal('taskOne')} />
      <TaskTwo showModal={modals.taskTwo} setShowModal={() => toggleModal('taskTwo')} />
      <TaskThree showModal={modals.taskThree} setShowModal={() => toggleModal('taskThree')} />
      <TaskFour showModal={modals.taskFour} setShowModal={() => toggleModal('taskFour')} />
      <TaskFive showModal={modals.taskFive} setShowModal={() => toggleModal('taskFive')} />
      <TaskSix showModal={modals.taskSix} setShowModal={() => toggleModal('taskSix')} />
      <TaskSeven showModal={modals.taskSeven} setShowModal={() => toggleModal('taskSeven')} />
      <ClaimLeveler claimLevel={modals.claimLevel} setClaimLevel={() => toggleModal('claimLevel')} />
      <Levels showLevels={modals.levels} setShowLevels={() => toggleModal('levels')} />
      <DailyRewards showModal={showDailyRewards} setShowModal={setShowDailyRewards} />

      <Outlet />
    </motion.div>
  );
};

export default Tasks;