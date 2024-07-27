import React, { useEffect, useState, useRef } from "react";
import Animate from "../Components/Animate";
import { Outlet, useNavigate } from "react-router-dom";
import coinsmall from "../images/main-logo.png";
import gastank from "../images/baterai1.webp";
import battery3 from "../images/energylimit.webp";
import multi from "../images/multitap1.webp";
import flash from "../images/flash1.webp";
import botr from "../images/bott.webp";
import boost from "../images/booster2.webp";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase'; // Adjust the path as needed
import { useUser } from "../context/userContext";
import { IoClose } from "react-icons/io5";
import { IoCheckmarkCircle } from "react-icons/io5";
import Spinner from '../Components/Spinner';
import "../App.css";
import styled from 'styled-components';
import Modal from '../Components/boostmodals';


const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f9fafb;
`;

const ContentWrapper = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 1rem;
  width: 100%;
`;

const Header = styled.header`
  margin-bottom: 1.5rem;
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #171717;
`;

const BoosterSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const UpgradeSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Card = styled.div`
  background-color: #ffffff;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
`;

const BoosterCard = styled(Card)`
  flex-direction: column;
  text-align: center;
`;

const UpgradeCard = styled(Card)`
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.disabled ? 0.7 : 1};
`;

const IconWrapper = styled.div`
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.5rem;
`;

const BoosterIconWrapper = styled(IconWrapper)`
  background-color: #f0f4ff;
  border-radius: 50%;
`;

const UpgradeIconWrapper = styled(IconWrapper)`
  margin-right: 1rem;
`;

const Icon = styled.img`
  width: 30px;
  height: 30px;
`;

const BoosterIcon = styled(Icon)``;
const UpgradeIcon = styled(Icon)``;

const InfoWrapper = styled.div`
  flex: 1;
`;

const BoosterInfo = styled(InfoWrapper)`
  margin-bottom: 1rem;
`;

const UpgradeInfo = styled(InfoWrapper)``;

const Name = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #171717;
  margin-bottom: 0.25rem;
`;

const BoosterName = styled(Name)``;
const UpgradeName = styled(Name)``;

const Value = styled.div`
  font-size: 0.875rem;
  color: #4b5563;
`;

const BoosterValue = styled(Value)``;

const UpgradeValue = styled(Value)`
  display: flex;
  align-items: center;
`;

const CountdownTimer = styled.span`
  color: #507cff;
  font-weight: 500;
`;

const BoosterButton = styled.button`
  background-color: #507cff;
  color: #ffffff;
  border: none;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #3b5bdb;
  }

  &:disabled {
    background-color: #e5e7eb;
    color: #9ca3af;
    cursor: not-allowed;
  }
`;

const CoinIcon = styled.img`
  width: 16px;
  height: 16px;
  margin-right: 4px;
`;

const Divider = styled.span`
  width: 1px;
  height: 12px;
  background-color: #d1d5db;
  margin: 0 0.5rem;
`;

const LevelIndicator = styled.span`
  color: #507cff;
  font-weight: 500;
`;

const MaxLevel = styled.span`
  color: #10b981;
  font-weight: 600;
`;

const ArrowIcon = styled(MdOutlineKeyboardArrowRight)`
  color: #9ca3af;
  font-size: 1.5rem;
`;



const tapValues = [
  {
    level: 1,
    value: 1,
  },
  {
    level: 2,
    value: 2,
  },
  {
    level: 3,
    value: 3,
  },
  {
    level: 4,
    value: 4,
  },
  {
    level: 5,
    value: 5,
  },
  {
    level: 6,
    value: 6,
  },
  {
    level: 7,
    value: 7,
  },
  {
    level: 8,
    value: 8,
  },
  {
    level: 9,
    value: 9,
  },
  {
    level: 10,
    value: 10,
  },
  {
    level: 11,
    value: 11,
  },
  {
    level: 12,
    value: 12,
  },
  {
    level: 13,
    value: 13,
  },
  {
    level: 14,
    value: 14,
  },
];

const energyValues = [
  {
    level: 1,
    energy: 500,
  },
  {
    level: 2,
    energy: 1000,
  },
  {
    level: 3,
    energy: 1500,
  },
  {
    level: 4,
    energy: 2000,
  },
  {
    level: 5,
    energy: 2500,
  },
  {
    level: 6,
    energy: 3000,
  },
  {
    level: 7,
    energy: 3500,
  },
  {
    level: 8,
    energy: 4000,
  },
  {
    level: 9,
    energy: 4500,
  },
  {
    level: 10,
    energy: 5000,
  },
  {
    level: 11,
    energy: 5500,
  },
  {
    level: 12,
    energy: 6000,
  },
  {
    level: 13,
    energy: 6600,
  },
  {
    level: 14,
    energy: 7000,
  },
];

const chargingValues = [
  {
    level: 1,
    duration: 10,
    step: 700,
  },
  {
    level: 2,
    duration: 9,
    step: 600,
  },
  {
    level: 3,
    duration: 6,
    step: 500,
  },
  {
    level: 4,
    duration: 4,
    step: 300,
  },
  {
    level: 5,
    duration: 3,
    step: 200,
  },
  {
    level: 6,
    duration: 2,
    step: 100,
  },
  {
    level: 7,
    duration: 1,
    step: 80,
  },
  
]


const upgradeCosts = [0, 2000, 5000, 10000, 20000, 400000, 800000, 1000000, 1500000, 2000000, 2500000, 3000000, 4000000, 5000000];


const energyUpgradeCosts = [0, 3000, 6000, 12000, 24000, 500000, 1000000, 2000000, 3000000, 4000000, 6000000, 8000000, 10000000, 20000000];


const chargingUpgradeCosts = [0, 2000, 30000, 100000, 200000, 400000, 700000];


const Boost = () => {

  const { balance, id, freeGuru, refiller, setRefiller, setFreeGuru, setTapGuru, fullTank, setFullTank, setMainTap, startTimer, timeRefill, setTimeRefill, tapValue, setTapValue, battery, setEnergy, setBattery, setBalance, refBonus, loading } = useUser();
  const [openInfo, setOpenInfo] = useState(false);
  const [openInfoTwo, setOpenInfoTwo] = useState(false);
  const [isUpgradeModalVisible, setIsUpgradeModalVisible] = useState(false);
  const [isUpgradeModalVisibleEn, setIsUpgradeModalVisibleEn] = useState(false);
  const [isUpgradeModalVisibleEnc, setIsUpgradeModalVisibleEnc] = useState(false);
  const [congrats, setCongrats] = useState(false)
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [isUpgradingEn, setIsUpgradingEn] = useState(false);
  const [isUpgradingEnc, setIsUpgradingEnc] = useState(false);
  const [guru, setGuru] = useState(false);
  const [tank, setTank] = useState(false);
  const [bot, setBot] = useState(false);


  const infoRef = useRef(null);
  const infoRefTwo = useRef(null);

  const handleClickOutside = (event) => {
    if (infoRef.current && !infoRef.current.contains(event.target)) {
      setOpenInfo(false);
    }
    if (infoRefTwo.current && !infoRefTwo.current.contains(event.target)) {
      setOpenInfoTwo(false);
    }
  };

  useEffect(() => {
    if (openInfo || openInfoTwo) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openInfo, openInfoTwo]);



  const formatNumber = (num) => {
    if (num < 100000) {
      return new Intl.NumberFormat().format(num).replace(/,/g, " ");
    } else if (num < 1000000) {
      return new Intl.NumberFormat().format(num).replace(/,/g, " ");
    } else {
      // return (num / 1000000).toFixed(3).replace(".", ".") + " M";
      return new Intl.NumberFormat().format(num).replace(/,/g, " ");
    }
  };


  const handleUpgrade = async () => {
    setIsUpgrading(true);
    const nextLevel = tapValue.level;
    const upgradeCost = upgradeCosts[nextLevel];
    if (nextLevel < tapValues.length && (balance + refBonus) >= upgradeCost && id) {
      const newTapValue = tapValues[nextLevel];
      const userRef = doc(db, 'telegramUsers', id.toString());
      try {
        await updateDoc(userRef, {
          tapValue: newTapValue,
          balance: balance - upgradeCost
        });
        setTapValue(newTapValue);
        setBalance((prevBalance) => prevBalance - upgradeCost);
        setIsUpgrading(false);
        setIsUpgradeModalVisible(false);
        setCongrats(true)
        
        setTimeout(() => {
            setCongrats(false)
        }, 2000)
        console.log('Tap value upgraded successfully');
      } catch (error) {
        console.error('Error updating tap value:', error);
      }

    }

  };

  const handleEnergyUpgrade = async () => {
    setIsUpgradingEn(true);
    const nextEnergyLevel = battery.level;
    const energyUpgradeCost = energyUpgradeCosts[nextEnergyLevel];
    if (nextEnergyLevel< energyValues.length && (balance + refBonus) >= energyUpgradeCost && id) {
      const newEnergyValue = energyValues[nextEnergyLevel];
      const userRef = doc(db, 'telegramUsers', id.toString());
      try {
        await updateDoc(userRef, {
          battery: newEnergyValue,
          balance: balance - energyUpgradeCost,
          energy: newEnergyValue.energy
        });
        setBattery(newEnergyValue);
        localStorage.setItem('energy', newEnergyValue.energy);
        setEnergy(newEnergyValue.energy);
        setRefiller(newEnergyValue.energy);

        setBalance((prevBalance) => prevBalance - energyUpgradeCost);
        setIsUpgradingEn(false);
        setCongrats(true);
        setIsUpgradeModalVisibleEn(false);
        setTimeout(() => {
            setCongrats(false)
        }, 2000)
        console.log('Energy value upgraded successfully');
        console.log('Energy value upgraded successfully +', newEnergyValue.value);
        console.log('NEW REFILLER VALUES IS:', refiller)
      } catch (error) {
        console.error('Error updating energy value:', error);
      }

    }

  };

  const handlerRechargeUpgrade = async () => {
    setIsUpgradingEnc(true);
    const nextChargingLevel = timeRefill.level;
    const chargingUpgradeCost = chargingUpgradeCosts[nextChargingLevel];
    if (nextChargingLevel< chargingValues.length && (balance + refBonus) >= chargingUpgradeCost && id) {
      const newChargingValue = chargingValues[nextChargingLevel];
      const userRef = doc(db, 'telegramUsers', id.toString());
      try {
        await updateDoc(userRef, {
          timeRefill: newChargingValue,
          balance: balance - chargingUpgradeCost,
        });
        setTimeRefill(newChargingValue);
        setBalance((prevBalance) => prevBalance - chargingUpgradeCost);
        setIsUpgradingEnc(false);
        setEnergy(battery.energy);
        setCongrats(true)
        setIsUpgradeModalVisibleEnc(false);
        setTimeout(() => {
            setCongrats(false)
        }, 2000)
        console.log('Energy value upgraded successfully');
        console.log('Energy value upgraded successfully +', newChargingValue.value);
      } catch (error) {
        console.error('Error updating energy value:', error);
      }

    }

  };


  const nextUpgradeCost = upgradeCosts[tapValue.level];
  const hasSufficientBalance = (balance + refBonus) >= nextUpgradeCost;

  const nextEnergyUpgradeCost = energyUpgradeCosts[battery.level];
  const hasSufficientBalanceEn = (balance + refBonus) >= nextEnergyUpgradeCost;

  const nextChargingUpgradeCost = chargingUpgradeCosts[timeRefill.level];
  const hasSufficientBalanceEnc = (balance + refBonus) >= nextChargingUpgradeCost;

  const location = useNavigate();

  const [isDisabled, setIsDisabled] = useState(false);
  


  const handleTapGuru = async () => {
    if (id) {
    if (freeGuru > 0) {
      setIsDisabled(false);
      const newRemainingClicks = freeGuru - 1;
      setFreeGuru(newRemainingClicks);
      
      // Update the Firestore document
      const userRef = doc(db, 'telegramUsers', id.toString());
      await updateDoc(userRef, {
        freeGuru: newRemainingClicks,
        timeSta: new Date() 
      });
      startTimer();
      setMainTap(false);
      setTapGuru(true);
      location('/'); // Navigate to /home without refreshing the page
      setCongrats(true)
      setTimeout(() => {
        setCongrats(false)
    }, 2000)
    } else {
      setIsDisabled(true);
    }
    };
  };
 
  const handleFullTank = async () => {
    if (id) {
    if (fullTank > 0) {
      setIsDisabled(false);
      const newRemainingTank = fullTank - 1;
      setFullTank(newRemainingTank);
      
      // Update the Firestore document
      const userRef = doc(db, 'telegramUsers', id.toString());
      await updateDoc(userRef, {
        fullTank: newRemainingTank,
        timeStaTank: new Date() 
      });
      location('/'); // Navigate to /home without refreshing the page
      localStorage.setItem('energy', battery.energy);
      setEnergy(battery.energy);
      setRefiller(battery.energy);
      setCongrats(true)
      setTimeout(() => {
        setCongrats(false)
    }, 2000)
    } else {
      setIsDisabled(true);
    }
    };
  };
 
  const calculateTimeRemaining = () => {
    const now = new Date();
    const nextDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const timeDiff = nextDate - now;
  
    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
  
    return { hours, minutes, seconds };
  };
  const [timeRemaining, setTimeRemaining] = useState(calculateTimeRemaining());

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining());
    }, 1000);
    
    return () => clearInterval(interval); // Clear interval on component unmount
  }, []);


  return (
    <PageContainer>
      <ContentWrapper>
        {loading ? (
          <Spinner />
        ) : (
          <Animate>
            <Header>
              <Title>Your Daily Boosters</Title>
            </Header>
  
            <BoosterSection>
              <BoosterCard>
                <BoosterIconWrapper>
                  <BoosterIcon src={boost} alt="Booster" />
                </BoosterIconWrapper>
                <BoosterInfo>
                  <BoosterName>Booster</BoosterName>
                  <BoosterValue>
                    {freeGuru > 0 ? (
                      <span className="text-[#507cff]">{freeGuru}/3</span>
                    ) : (
                      <CountdownTimer>
                        {timeRemaining.hours}h {timeRemaining.minutes}m {timeRemaining.seconds}s
                      </CountdownTimer>
                    )}
                  </BoosterValue>
                </BoosterInfo>
                <BoosterButton
                  onClick={() => setGuru(true)}
                  disabled={freeGuru <= 0}
                >
                  Activate
                </BoosterButton>
              </BoosterCard>
  
              <BoosterCard>
                <BoosterIconWrapper>
                  <BoosterIcon src={gastank} alt="Full Energy" />
                </BoosterIconWrapper>
                <BoosterInfo>
                  <BoosterName>Full Energy</BoosterName>
                  <BoosterValue>
                    {fullTank > 0 ? (
                      <span className="text-[#507cff]">{fullTank}/3</span>
                    ) : (
                      <CountdownTimer>
                        {timeRemaining.hours}h {timeRemaining.minutes}m {timeRemaining.seconds}s
                      </CountdownTimer>
                    )}
                  </BoosterValue>
                </BoosterInfo>
                <BoosterButton
                  onClick={() => setTank(true)}
                  disabled={fullTank <= 0}
                >
                  Activate
                </BoosterButton>
              </BoosterCard>
            </BoosterSection>
  
            <Header>
              <Title>Boosters</Title>
            </Header>
  
            <UpgradeSection>
              <UpgradeCard
                onClick={() => setIsUpgradeModalVisible(true)}
                disabled={tapValue.level >= tapValues.length}
              >
                <UpgradeIconWrapper>
                  <UpgradeIcon src={multi} alt="Multitap" />
                </UpgradeIconWrapper>
                <UpgradeInfo>
                  <UpgradeName>Multitap</UpgradeName>
                  <UpgradeValue>
                    <CoinIcon src={coinsmall} alt="coin" />
                    {tapValue.level >= tapValues.length ? (
                      <MaxLevel>MAX</MaxLevel>
                    ) : (
                      <>{formatNumber(nextUpgradeCost)}</>
                    )}
                    <Divider />
                    <LevelIndicator>Level {tapValue.level}</LevelIndicator>
                  </UpgradeValue>
                </UpgradeInfo>
                <ArrowIcon />
              </UpgradeCard>
  
              <UpgradeCard
                onClick={() => setIsUpgradeModalVisibleEn(true)}
                disabled={battery.level >= energyValues.length}
              >
                <UpgradeIconWrapper>
                  <UpgradeIcon src={battery3} alt="Energy Limit" />
                </UpgradeIconWrapper>
                <UpgradeInfo>
                  <UpgradeName>Energy Limit</UpgradeName>
                  <UpgradeValue>
                    <CoinIcon src={coinsmall} alt="coin" />
                    {battery.level >= energyValues.length ? (
                      <MaxLevel>MAX</MaxLevel>
                    ) : (
                      <>{formatNumber(nextEnergyUpgradeCost)}</>
                    )}
                    <Divider />
                    <LevelIndicator>Level {battery.level}</LevelIndicator>
                  </UpgradeValue>
                </UpgradeInfo>
                <ArrowIcon />
              </UpgradeCard>
  
              <UpgradeCard
                onClick={() => setIsUpgradeModalVisibleEnc(true)}
                disabled={timeRefill.level >= chargingValues.length}
              >
                <UpgradeIconWrapper>
                  <UpgradeIcon src={flash} alt="Recharging Speed" />
                </UpgradeIconWrapper>
                <UpgradeInfo>
                  <UpgradeName>Recharging Speed</UpgradeName>
                  <UpgradeValue>
                    <CoinIcon src={coinsmall} alt="coin" />
                    {timeRefill.level >= chargingValues.length ? (
                      <MaxLevel>MAX</MaxLevel>
                    ) : (
                      <>{formatNumber(nextChargingUpgradeCost)}</>
                    )}
                    <Divider />
                    <LevelIndicator>Level {timeRefill.level}</LevelIndicator>
                  </UpgradeValue>
                </UpgradeInfo>
                <ArrowIcon />
              </UpgradeCard>
            </UpgradeSection>
            
        
       
        
                 

             


{/* multitap modal */}

<Modal
  isVisible={isUpgradeModalVisible}
  onClose={() => setIsUpgradeModalVisible(false)}
>
  <div className="w-full flex flex-col justify-between py-8">
    <div className="w-full flex justify-center flex-col items-center">
      <div className="w-[120px] h-[120px] rounded-[25px] bg-[#d6e4ff] flex items-center justify-center shadow-lg shadow-red/50">
        <img alt="claim" src={multi} className="w-[80px]" />
      </div>
      <h3 className="font-semibold text-[32px] py-4 text-[#171717]">
        Multitap
      </h3>
      <p className="pb-6 text-[#262626] text-[16px] text-center">
        Increase amount of LIBOO you can earn per one tap <br/>
        +1 per tap for each level
      </p>
      <div className="flex flex-1 items-center space-x-2">
        <div className="">
          <img src={coinsmall} className="w-[25px]" alt="Coin Icon" />
        </div>
        <div className="font-bold text-[26px] flex items-center text-[#262626]">
          {formatNumber(nextUpgradeCost)} <span className="text-[16px] font-medium text-[#262626] pl-2"> | {tapValues[tapValue.level]?.value} level</span>
        </div>
      </div>
    </div>
    <div className="w-full flex justify-center pb-6 pt-4">
      <button
        onClick={handleUpgrade}
        disabled={!hasSufficientBalance}
        className={`${!hasSufficientBalance ? 'bg-btn2 text-[#979797]' : 'bg-gradient-to-b gradient from-[#3d47ff] to-[#575fff]'} w-full py-5 px-3 flex items-center justify-center text-center rounded-[12px] font-semibold text-[22px]`}
      >
        {isUpgrading ? 'Boosting...' : hasSufficientBalance ? 'Go ahead!' : 'Insufficient Balance'}
      </button>
    </div>
  </div>
</Modal>

{/* Energy limit modal */}

<Modal
  isVisible={isUpgradeModalVisibleEn}
  onClose={() => setIsUpgradeModalVisibleEn(false)}
>
  <div className="w-full flex flex-col justify-between py-8">
    <div className="w-full flex justify-center flex-col items-center">
      <div className="w-[120px] h-[120px] rounded-[25px] bg-[#d6e4ff] flex items-center justify-center">
        <img alt="claim" src={battery3} className="w-[80px]" />
      </div>
      <h3 className="font-semibold text-[32px] py-4 text-[#171717]">
        Energy Limit
      </h3>
      <p className="pb-6 text-[#262626] text-[16px] text-center">
        Increase the limit of energy storage <br/>
        +500 energy limit for each level.
      </p>
      <div className="flex flex-1 items-center space-x-2">
        <div className="">
          <img src={coinsmall} className="w-[25px]" alt="Coin Icon" />
        </div>
        <div className="font-bold text-[26px] flex items-center text-[#262626]">
          {formatNumber(nextEnergyUpgradeCost)} <span className="text-[16px] font-medium text-[#262626] pl-2"> | {energyValues[battery.level]?.level} level</span>
        </div>
      </div>
    </div>
    <div className="w-full flex justify-center pb-6 pt-4">
      <button
        onClick={handleEnergyUpgrade}
        disabled={!hasSufficientBalanceEn}
        className={`${!hasSufficientBalanceEn ? 'bg-btn2 text-[#979797]' : 'bg-gradient-to-b gradient from-[#3d47ff] to-[#575fff]'} w-full py-5 px-3 flex items-center justify-center text-center rounded-[12px] font-semibold text-[22px]`}
      >
        {isUpgrading ? 'Boosting...' : hasSufficientBalanceEn ? 'Go ahead!' : 'Insufficient Balance'}
      </button>
    </div>
  </div>
</Modal>

{/* recharging speed modal */}
<Modal
  isVisible={isUpgradeModalVisibleEnc}
  onClose={() => setIsUpgradeModalVisibleEnc(false)}
>
  <div className="w-full flex flex-col justify-between py-8">
    <div className="w-full flex justify-center flex-col items-center">
      <div className="w-[120px] h-[120px] rounded-[25px] bg-[#d6e4ff] flex items-center justify-center">
        <img alt="claim" src={flash} className="w-[80px]" />
      </div>
      <h3 className="font-semibold text-[32px] py-4 text-[#171717]">
        Recharging Speed
      </h3>
      <p className="pb-6 text-[#262626] text-[16px] text-center">
        Increase speed of recharge<br/>
        more level, more recharge speed.
      </p>
      <div className="flex flex-1 items-center space-x-2">
        <div className="">
          <img src={coinsmall} className="w-[25px]" alt="Coin Icon" />
        </div>
        <div className="font-bold text-[26px] flex items-center text-[#262626]">
          {formatNumber(nextChargingUpgradeCost)} <span className="text-[16px] font-medium text-[#262626] pl-2"> | {chargingValues[timeRefill.level]?.level} level</span>
        </div>
      </div>
    </div>
    <div className="w-full flex justify-center pb-6 pt-4">
      <button
        onClick={handlerRechargeUpgrade}
        disabled={!hasSufficientBalanceEnc}
        className={`${!hasSufficientBalanceEnc ? 'bg-btn2 text-[#979797]' : 'bg-gradient-to-b gradient from-[#3d47ff] to-[#575fff]'} w-full py-5 px-3 flex items-center justify-center text-center rounded-[12px] font-semibold text-[22px]`}
      >
        {isUpgrading ? 'Boosting...' : hasSufficientBalanceEnc ? 'Go ahead!' : 'Insufficient Balance'}
      </button>
    </div>
  </div>
</Modal>

{/* booster modal */}
<Modal
  isVisible={guru}
  onClose={() => setGuru(false)}
>
  <div className="w-full flex flex-col justify-between py-8">
    <div className="w-full flex justify-center flex-col items-center">
      <div className="w-[120px] h-[120px] rounded-[25px] bg-[#d6e4ff] flex items-center justify-center">
        <img alt="claim" src={boost} className="w-[80px]" />
      </div>
      <h3 className="font-semibold text-[32px] py-4 text-[#171717]">
        Booster
      </h3>
      <p className="pb-6 text-[#262626] text-[16px] text-center">
        Multiply your taps by x5 for 20 seconds. Do not consume energy while active.
      </p>
      <div className="flex flex-1 items-center space-x-2">
        <div className="">
          <img src={coinsmall} className="w-[25px]" alt="Coin Icon" />
        </div>
        <div className="font-bold text-[26px] flex items-center">Free</div>
      </div>
    </div>
    <div className="w-full flex justify-center pb-6 pt-4">
      <button
        onClick={handleTapGuru}
        className="bg-gradient-to-b gradient from-[#3d47ff] to-[#575fff] w-full py-5 px-3 flex items-center justify-center text-center rounded-[12px] font-semibold text-[22px]"
      >
        Go ahead!
      </button>
    </div>
  </div>
</Modal>

{/* fulltank modal */}

<Modal
  isVisible={tank}
  onClose={() => setTank(false)}
>
  <div className="w-full flex flex-col justify-between py-8">
    <div className="w-full flex justify-center flex-col items-center">
      <div className="w-[120px] h-[120px] rounded-[25px] bg-[#d6e4ff] flex items-center justify-center">
        <img alt="claim" src={gastank} className="w-[80px]" />
      </div>
      <h3 className="font-semibold text-[32px] py-4 text-[#171717]">
        Full Energy
      </h3>
      <p className="pb-6 text-[#262626] text-[16px] text-center">
        Fill your energy to the max
      </p>
      <div className="flex flex-1 items-center space-x-2">
        <div className="">
          <img src={coinsmall} className="w-[25px]" alt="Coin Icon" />
        </div>
        <div className="font-bold text-[26px] flex items-center">Free</div>
      </div>
    </div>
    <div className="w-full flex justify-center pb-6 pt-4">
      <button
        onClick={handleFullTank}
        className="bg-gradient-to-b gradient from-[#3d47ff] to-[#575fff] w-full py-5 px-3 flex items-center justify-center text-center rounded-[12px] font-semibold text-[22px]"
      >
        Go ahead!
      </button>
    </div>
  </div>
</Modal>



               {/* Bot Modal */}



               <div
              className={`${
                bot  === true ? "visible" : "invisible"
              } absolute bottom-0 left-0 right-0 h-fit bg-[#BCCFFFF2] z-[100] rounded-tl-[20px] rounded-tr-[20px] flex justify-center px-4 py-5`}
            >
              <div className="w-full flex flex-col justify-between py-8">
              <button
                      onClick={() =>  setBot(false)}
                      className="flex items-center justify-center absolute right-8 top-8 text-center rounded-[12px] font-medium text-[16px]"
                    >
                     <IoClose size={24} className="text-[#9a96a6]"/>
                    </button>


                <div className="w-full flex justify-center flex-col items-center">
                  <div className="w-[120px] h-[120px] rounded-[25px] bg-[#d6e4ff] flex items-center justify-center">
                    <img alt="claim" src={botr} className="w-[80px]" />
                  </div>
                  <h3 className="font-semibold text-[32px] py-4">
                  Tap Bot
                  </h3>
                  <p className="pb-6 text-[#9a96a6] text-[16px] text-center">
                  Tap Bot will tap when your energy is full <br/>
                 Max bot work duration is 12 hours
                  </p>

                  <div className="flex flex-1 items-center space-x-2">
                    <div className="">
                      <img
                        src={coinsmall}
                        className="w-[25px]"
                        alt="Coin Icon"
                      />
                    </div>
                    <div className="font-bold text-[26px] flex items-center">1 000 000 
                    </div>
                  </div>
                </div>

                <div className="w-full flex justify-center pb-6 pt-4">
                  <button
                          
                                       disabled
                    className={`bg-btn2 text-[#979797] w-full py-5 px-3 flex items-center justify-center text-center rounded-[12px] font-semibold text-[22px]`}
                  >
                    Insufficient Balance
                  </button>
                </div>
              </div>
            </div>



            <div className={`${congrats === true ? "visible bottom-6" : "invisible bottom-[-10px]"} z-[60] ease-in duration-300 w-full fixed left-0 right-0 px-4`}>
              <div className="w-full text-[#54d192] flex items-center space-x-2 px-4 bg-[#121620ef] h-[50px] rounded-[8px]">



              <IoCheckmarkCircle size={24} className=""/>

              <span className="font-medium">
                Good
              </span>

              </div>


            </div>
{isUpgradingEn && (
  <>
  </>
)}
{isUpgradingEnc && (
  <>
  </>
)}
{isDisabled && (
  <>
  </>
)}
            <Outlet />
          </Animate>
        
        
      )}
    </ContentWrapper>
  </PageContainer>
)};

export default Boost;