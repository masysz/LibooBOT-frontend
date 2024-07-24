import React, { useEffect, useState } from 'react'
import Animate from '../Components/Animate';
import { Outlet } from 'react-router-dom';
import coinsmall from "../images/coinsmall.webp";
import taskbook from "../images/taskbook.webp";
import youtubeicon from "../images/youtube.gif";
import telegramicon from "../images/telegram.gif";
import twittericon from "../images/twitter.gif";
import facebookicon from "../images/facebook.gif";
import instagramicon from "../images/instagram.gif";
import tiktokicon from "../images/tiktok.gif";
import vkicon from "../images/vk.gif";
import { MdOutlineKeyboardArrowRight } from 'react-icons/md';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
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
import { IoCheckmarkSharp } from "react-icons/io5";
import congrats from "../images/celebrate.gif";
import { useUser } from '../context/userContext';
import MilestoneRewards from '../Components/MilestoneRewards';
import ReferralRewards from '../Components/Rewards';
import DailyRewards from '../Components/DailyRewards';

const Tasks = () => {
  const {
    id, 
    balance, 
    refBonus, 
    taskCompleted, 
    level, 
    setTaskCompleted, 
    taskCompleted2, 
    setTaskCompleted2, 
    taskCompleted3, 
    setTaskCompleted3, 
    taskCompleted4, 
    setTaskCompleted4, 
    taskCompleted5, 
    setTaskCompleted5, 
    taskCompleted6, 
    setTaskCompleted6, 
    taskCompleted7, 
    setTaskCompleted7
  } = useUser();

  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showModal2, setShowModal2] = useState(false);
  const [showModal3, setShowModal3] = useState(false);
  const [showModal4, setShowModal4] = useState(false);
  const [showModal5, setShowModal5] = useState(false);
  const [showModal6, setShowModal6] = useState(false);
  const [showModal7, setShowModal7] = useState(false);
  const [claimLevel, setClaimLevel] = useState(false);
  const [showLevels, setShowLevels] = useState(false);
  const [message, setMessage] = useState("");
  const [activeIndex, setActiveIndex] = useState(1);
  const [showDailyRewards, setShowDailyRewards] = useState(false);

  const taskID = "task_3100";
  const taskID2 = "task_3101";
  const taskID3 = "task_3102";
  const taskID4 = "task_3103";
  const taskID5 = "task_3104";
  const taskID6 = "task_3105";
  const taskID7 = "task_3106";

  const handleMenu = (index) => {
    setActiveIndex(index);
  };

  const taskOne = () => {
    setShowModal(true)
    document.getElementById("footermain").style.zIndex = "50";
  }

  const taskTwo = () => {
    setShowModal2(true)
    document.getElementById("footermain").style.zIndex = "50";
  }

  const taskThree = () => {
    setShowModal3(true)
    document.getElementById("footermain").style.zIndex = "50";
  }

  const taskFour = () => {
    setShowModal4(true)
    document.getElementById("footermain").style.zIndex = "50";
  }

  const taskFive = () => {
    setShowModal5(true)
    document.getElementById("footermain").style.zIndex = "50";
  }

  const taskSix = () => {
    setShowModal6(true)
    document.getElementById("footermain").style.zIndex = "50";
  }

  const taskSeven = () => {
    setShowModal7(true)
    document.getElementById("footermain").style.zIndex = "50";
  }

  const handleDailyRewards = () => {
    setShowDailyRewards(true);
    document.getElementById("footermain").style.zIndex = "50";
  };
  
  useEffect(() => {
    const checkTaskCompletion = async (id, taskId) => {
      try {
        const userTaskDocRef = doc(db, 'userTasks', `${id}_${taskId}`);
        const docSnap = await getDoc(userTaskDocRef);
        if (docSnap.exists()) {
          return docSnap.data().completed;
        } else {
          return false;
        }
      } catch (e) {
        console.error('Error checking task completion: ', e);
        return false;
      }
    };

    if (id) {
      checkTaskCompletion(id, taskID).then((completed) => {
        setTaskCompleted(completed);
        if (completed) {
          setMessage("");
        }
      });
      checkTaskCompletion(id, taskID2).then((completed) => {
        setTaskCompleted2(completed);
        if (completed) {
          setMessage("");
        }
      });
      checkTaskCompletion(id, taskID3).then((completed) => {
        setTaskCompleted3(completed);
        if (completed) {
          setMessage("");
        }
      });
      checkTaskCompletion(id, taskID4).then((completed) => {
        setTaskCompleted4(completed);
        if (completed) {
          setMessage("");
        }
      });
      checkTaskCompletion(id, taskID5).then((completed) => {
        setTaskCompleted5(completed);
        if (completed) {
          setMessage("");
        }
      });
      checkTaskCompletion(id, taskID6).then((completed) => {
        setTaskCompleted6(completed);
        if (completed) {
          setMessage("");
        }
      });
      checkTaskCompletion(id, taskID7).then((completed) => {
        setTaskCompleted7(completed);
        if (completed) {
          setMessage("");
        }
      });
    }
  }, [id, setTaskCompleted, setTaskCompleted2, setTaskCompleted3, setTaskCompleted4, setTaskCompleted5, setTaskCompleted6, setTaskCompleted7]);

  const levelsAction = () => {
    setShowLevels(true);
    document.getElementById("footermain").style.zIndex = "50";
  }

  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num).replace(/,/g, " ");
  };

  return (
    <>
      {loading ? (
        <Spinner />
      ) : (
        <Animate>
          <div className='w-full justify-center flex-col space-y-3 px-5'>
            <div className='fixed top-0 left-0 right-0 pt-8 px-5'>
              <div className="flex space-x-2 justify-center items-center relative">
                <div id="congrat" className='opacity-0 invisible w-[80%] absolute pl-10 ease-in-out duration-500 transition-all'>
                  <img src={congrats} alt="congrats" className="w-full"/>
                </div>
              </div>

              <div className='w-full border-[1px] border-borders rounded-[10px] p-1 flex items-center'>
                <div onClick={() => handleMenu(1)} className={`${activeIndex === 1 ? 'bg-cards' : ''}  rounded-[6px] py-[12px] px-3 w-[33%] flex justify-center text-center items-center`}>
                  Special
                </div>
                <div onClick={() => handleMenu(2)} className={`${activeIndex === 2 ? 'bg-cards' : ''}  rounded-[6px] py-[12px] px-3 w-[33%] flex justify-center text-center items-center`}>
                  Leagues
                </div>
                <div onClick={() => handleMenu(3)} className={`${activeIndex === 3 ? 'bg-cards' : ''}  rounded-[6px] py-[12px] px-3 w-[33%] flex justify-center text-center items-center`}>
                  Ref Bonus
                </div>
              </div>
            </div>

            <div className='!mt-[80px] w-full h-[60vh] flex flex-col overflow-y-auto'>
              <div className={`${activeIndex === 1 ? 'flex' : 'hidden'} alltaskscontainer flex-col w-full space-y-2`}>
                {/* Daily Rewards Button */}
                <div onClick={handleDailyRewards} className='bg-cards rounded-[10px] p-[14px] flex justify-between items-center'>
                  <div className='flex flex-1 items-center space-x-2'>
                    <div className=''>
                      <img src={coinsmall} alt="daily rewards" className='w-[50px]'/>
                    </div>
                    <div className='flex flex-col space-y-1'>
                      <span className='font-semibold'>
                        Daily Rewards
                      </span>
                      <div className='flex items-center space-x-1'>
                        <span className="w-[20px] h-[20px]">
                          <img src={coinsmall} className="w-full" alt="coin"/>
                        </span>
                        <span className='font-medium'>
                          Claim daily
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className=''>
                    <MdOutlineKeyboardArrowRight className="w-[20px] h-[20px] text-[#e0e0e0] mt-[2px]"/>
                  </div>
                </div>


                <div onClick={taskOne} className='bg-cards rounded-[10px] p-[14px] flex justify-between items-center'>

                    <div className='flex flex-1 items-center space-x-2'>

                        <div className=''>
                            <img src={telegramicon} alt="tasks" className='w-[50px]'/>
                        </div>
                        <div className='flex flex-col space-y-1'>
                            <span className='font-semibold'>
                                Join Our Telegram Channel
                            </span>
                            <div className='flex items-center space-x-1'>
                            <span className="w-[20px] h-[20px]">
                <img src={coinsmall} className="w-full" alt="coin"/>
              </span>
              <span className='font-medium'>
                50 000
              </span>
                            </div>
                        </div>

                    </div>

                    {/*  */}

                    <div className=''>
                    {taskCompleted ? (
                                    <>

                    <IoCheckmarkSharp className="w-[20px] h-[20px] text-[#5bd173] mt-[2px]"/>
                                    </>
                                    ) : (
                                    
                                    <>
                      
                    <MdOutlineKeyboardArrowRight className="w-[20px] h-[20px] text-[#e0e0e0] mt-[2px]"/>
                                    </>
                                    )}

                                    
                    </div>

                </div>

              



{/* TELERGAM GROUP CHAT TASK

                   <div onClick={taskTwo} className='bg-cards rounded-[10px] p-[14px] flex justify-between items-center'>

<div className='flex flex-1 items-center space-x-2'>

    <div className=''>
        <img src={telegramicon} alt="taskbook" className='w-[50px]'/>
    </div>
    <div className='flex flex-col space-y-1'>
        <span className='font-semibold'>
            Join Our Telegram Group
        </span>
        <div className='flex items-center space-x-1'>
        <span className="w-[20px] h-[20px]">
<img src={coinsmall} className="w-full" alt="coin"/>
</span>
<span className='font-medium'>
80 000
</span>
        </div>
    </div>

</div>


<div className=''>
{taskCompleted2 ? (
                                    <>

                    <IoCheckmarkSharp className="w-[20px] h-[20px] text-[#5bd173] mt-[2px]"/>
                                    </>
                                    ) : (
                                    
                                    <>
                      
                    <MdOutlineKeyboardArrowRight className="w-[20px] h-[20px] text-[#e0e0e0] mt-[2px]"/>
                                    </>
                                    )}
</div>

</div>


*/}

<div onClick={taskThree} className='bg-cards rounded-[10px] p-[14px] flex justify-between items-center'>

<div className='flex flex-1 items-center space-x-2'>

    <div className=''>
        <img src={twittericon} alt="taskbook" className='w-[50px]'/>
    </div>
    <div className='flex flex-col space-y-1'>
        <span className='font-semibold'>
            Follow us on X
        </span>
        <div className='flex items-center space-x-1'>
        <span className="w-[20px] h-[20px]">
<img src={coinsmall} className="w-full" alt="coin"/>
</span>
<span className='font-medium'>
50 000
</span>
        </div>
    </div>

</div>

{/*  */}

<div className=''>
{taskCompleted3 ? (
                                    <>

                    <IoCheckmarkSharp className="w-[20px] h-[20px] text-[#5bd173] mt-[2px]"/>
                                    </>
                                    ) : (
                                    
                                    <>
                      
                    <MdOutlineKeyboardArrowRight className="w-[20px] h-[20px] text-[#e0e0e0] mt-[2px]"/>
                                    </>
                                    )}
</div>

</div>

{/*  */}

{/* <div onClick={taskFour} className='bg-cards rounded-[10px] p-[14px] flex justify-between items-center'>

<div className='flex flex-1 items-center space-x-2'>

    <div className=''>
        <img src={vkicon} alt="taskbook" className='w-[50px]'/>
    </div>
    <div className='flex flex-col space-y-1'>
        <span className='font-semibold'>
            Follow us on VK
        </span>
        <div className='flex items-center space-x-1'>
        <span className="w-[20px] h-[20px]">
<img src={coinsmall} className="w-full" alt="coin"/>
</span>
<span className='font-medium'>
50 000
</span>
        </div>
    </div>

</div> */}

{/*  */}

{/* <div className=''>
{taskCompleted4 ? (
                                    <>

                    <IoCheckmarkSharp className="w-[20px] h-[20px] text-[#5bd173] mt-[2px]"/>
                                    </>
                                    ) : (
                                    
                                    <>
                      
                    <MdOutlineKeyboardArrowRight className="w-[20px] h-[20px] text-[#e0e0e0] mt-[2px]"/>
                                    </>
                                    )}
</div>

</div> */}

{/* <div onClick={taskFive} className='bg-cards rounded-[10px] p-[14px] flex justify-between items-center'>

<div className='flex flex-1 items-center space-x-2'>

    <div className=''>
        <img src={tiktokicon} alt="taskbook" className='w-[50px]'/>
    </div>
    <div className='flex flex-col space-y-1'>
        <span className='font-semibold'>
            Follow us on TikTok
        </span>
        <div className='flex items-center space-x-1'>
        <span className="w-[20px] h-[20px]">
<img src={coinsmall} className="w-full" alt="coin"/>
</span>
<span className='font-medium'>
50 000
</span>
        </div>
    </div>

</div> */}



{/* <div className=''>
{taskCompleted5 ? (
                                    <>

                    <IoCheckmarkSharp className="w-[20px] h-[20px] text-[#5bd173] mt-[2px]"/>
                                    </>
                                    ) : (
                                    
                                    <>
                      
                    <MdOutlineKeyboardArrowRight className="w-[20px] h-[20px] text-[#e0e0e0] mt-[2px]"/>
                                    </>
                                    )}
</div>

</div> */}



{/*  */}

<div onClick={taskSix} className='bg-cards rounded-[10px] p-[14px] flex justify-between items-center'>

<div className='flex flex-1 items-center space-x-2'>

    <div className=''>
        <img src={instagramicon} alt="taskbook" className='w-[50px]'/>
    </div>
    <div className='flex flex-col space-y-1'>
        <span className='font-semibold'>
            Follow us on Instagram
        </span>
        <div className='flex items-center space-x-1'>
        <span className="w-[20px] h-[20px]">
<img src={coinsmall} className="w-full" alt="coin"/>
</span>
<span className='font-medium'>
50 000
</span>
        </div>
    </div>

</div>

{/*  */}

<div className=''>
{taskCompleted6 ? (
                                    <>

                    <IoCheckmarkSharp className="w-[20px] h-[20px] text-[#5bd173] mt-[2px]"/>
                                    </>
                                    ) : (
                                    
                                    <>
                      
                    <MdOutlineKeyboardArrowRight className="w-[20px] h-[20px] text-[#e0e0e0] mt-[2px]"/>
                                    </>
                                    )}
</div>

</div>

{/* <div onClick={taskSeven} className='bg-cards rounded-[10px] p-[14px] flex justify-between items-center'>

<div className='flex flex-1 items-center space-x-2'>

    <div className=''>
        <img src={facebookicon} alt="taskbook" className='w-[50px]'/>
    </div>
    <div className='flex flex-col space-y-1'>
        <span className='font-semibold'>
            Follow us on Facebook
        </span>
        <div className='flex items-center space-x-1'>
        <span className="w-[20px] h-[20px]">
<img src={coinsmall} className="w-full" alt="coin"/>
</span>
<span className='font-medium'>
50 000
</span>
        </div>
    </div>

</div>
 */}


{/* <div className=''>
{taskCompleted7 ? (
                                    <>

                    <IoCheckmarkSharp className="w-[20px] h-[20px] text-[#5bd173] mt-[2px]"/>
                                    </>
                                    ) : (
                                    
                                    <>
                      
                    <MdOutlineKeyboardArrowRight className="w-[20px] h-[20px] text-[#e0e0e0] mt-[2px]"/>
                                    </>
                                    )}
</div>

</div>



             */}



</div>

{/*  */}


            <div className={`${activeIndex === 2 ? 'flex' : 'hidden'} alltaskscontainer flex-col w-full space-y-2`}>



<MilestoneRewards/>



</div>


{/*  */}


            <div className={`${activeIndex === 3 ? 'flex' : 'hidden'} alltaskscontainer flex-col w-full space-y-2`}>


<ReferralRewards/>







</div>

</div>




<TaskOne showModal={showModal} setShowModal={setShowModal} />
<TaskTwo showModal={showModal2} setShowModal={setShowModal2} />
<TaskThree showModal={showModal3} setShowModal={setShowModal3} />
<TaskFour showModal={showModal4} setShowModal={setShowModal4} />
<TaskFive showModal={showModal5} setShowModal={setShowModal5} />
<TaskSix showModal={showModal6} setShowModal={setShowModal6} />
<TaskSeven showModal={showModal7} setShowModal={setShowModal7} />
<ClaimLeveler claimLevel={claimLevel} setClaimLevel={setClaimLevel} />
<Levels showLevels={showLevels} setShowLevels={setShowLevels} />
<DailyRewards showModal={showDailyRewards} setShowModal={setShowDailyRewards} />



    </div>
    <Outlet />
    </Animate>
      )}
      </>
  )
}

export default Tasks