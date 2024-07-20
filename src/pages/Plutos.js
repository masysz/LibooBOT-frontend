import React, { useState, useEffect, useRef } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase'; // Adjust the path as needed
import styled, { keyframes } from "styled-components";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";
import Animate from '../Components/Animate';
import Spinner from '../Components/Spinner';
import { useUser } from '../context/userContext';
import Levels from '../Components/Levels';
import flash from "../images/flash.webp";
import coinsmall from "../images/coinsmall.webp";
import useSound from 'use-sound';
import boopSfx from '../get.mp3';
import burnSfx from '../burn.wav';

const slideUp = keyframes`
  0% {
    opacity: 1;
    transform: translateY(0);
  }
  100% {
    opacity: 0;
    transform: translateY(-350px);
  }
`;

const SlideUpText = styled.div`
  position: absolute;
  animation: ${slideUp} 3s ease-out;
  font-size: 2.1em;
  color: #ffffffa6;
  font-weight: 600;
  left: ${({ x }) => x}px;
  top: ${({ y }) => y}px;
  pointer-events: none; /* To prevent any interaction */
`;

const Container = styled.div`
  position: relative;
  display: inline-block;
  text-align: center;
  width: 100%;
  height: 100%;
  margin-bottom:100px;
`;

const Plutos = () => {

  const imageRef = useRef(null);
  const [play] = useSound(boopSfx);
  const [play2] = useSound(burnSfx);
  const [clicks, setClicks] = useState([]);
  const { name, balance, tapBalance, energy, battery, tapGuru, mainTap, setIsRefilling, refillIntervalRef, refillEnergy, setEnergy, tapValue, setTapBalance, setBalance, refBonus, level, loading } = useUser();

  // eslint-disable-next-line
  const [points, setPoints] = useState(0);
    // eslint-disable-next-line
  const [isDisabled, setIsDisabled] = useState(false);
    // eslint-disable-next-line
  const [openClaim, setOpenClaim] = useState(false);
  // eslint-disable-next-line
  const [congrats, setCongrats] = useState(false);
    // eslint-disable-next-line
  const [glowBooster, setGlowBooster] = useState(false);
  const [showLevels, setShowLevels] = useState(false);
  const debounceTimerRef = useRef(null);
    // eslint-disable-next-line
  const refillTimerRef = useRef(null);
  const isUpdatingRef = useRef(false);
  const accumulatedBalanceRef = useRef(balance);
  const accumulatedEnergyRef = useRef(energy);
  const accumulatedTapBalanceRef = useRef(tapBalance);
  const refillTimeoutRef = useRef(null); // Add this line
  

  function triggerHapticFeedback() {
    const isAndroid = /Android/i.test(navigator.userAgent);
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
  
    if (isIOS && window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
      window.Telegram.WebApp.isVerticalSwipesEnabled.false();
    } else if (isAndroid && 'vibrate' in navigator) {
      // Use the vibration API on Android
      navigator.vibrate(50); // Vibrate for 50ms
    } else {
      console.warn('Haptic feedback not supported on this device.');
    }
  }




  const handleClick = (e) => {

    // Play the sound
    if (tapValue.value > 0) {
     // play();
    }
    triggerHapticFeedback();

    if (energy <= 0 || isDisabled || isUpdatingRef.current) {
      setGlowBooster(true); // Trigger glow effect if energy and points are 0
      setTimeout(() => {
        setGlowBooster(false); // Remove glow effect after 1 second
      }, 300);
      return; // Exit if no energy left or if clicks are disabled or if an update is in progress
    }

    const { offsetX, offsetY, target } = e.nativeEvent;
    const { clientWidth, clientHeight } = target;

    const horizontalMidpoint = clientWidth / 2;
    const verticalMidpoint = clientHeight / 2;

    const animationClass =
      offsetX < horizontalMidpoint
        ? 'wobble-left'
        : offsetX > horizontalMidpoint
        ? 'wobble-right'
        : offsetY < verticalMidpoint
        ? 'wobble-top'
        : 'wobble-bottom';

    // Remove previous animations
    imageRef.current.classList.remove(
      'wobble-top',
      'wobble-bottom',
      'wobble-left',
      'wobble-right'
    );

    // Add the new animation class
    imageRef.current.classList.add(animationClass);

    // Remove the animation class after animation ends to allow re-animation on the same side
    setTimeout(() => {
      imageRef.current.classList.remove(animationClass);
    }, 500); // duration should match the animation duration in CSS

    // Increment the count
    const rect = e.target.getBoundingClientRect();
    const newClick = {
      id: Date.now(), // Unique identifier
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };

    setClicks((prevClicks) => [...prevClicks, newClick]);

    // Update state immediately for UI
    setEnergy((prevEnergy) => {
      const newEnergy = Math.max(prevEnergy - tapValue.value, 0); // Ensure energy does not drop below zero
      accumulatedEnergyRef.current = newEnergy;
      return newEnergy;
    });

    setPoints((prevPoints) => prevPoints + tapValue.value);

    setBalance((prevBalance) => {
      const newBalance = prevBalance + tapValue.value;
      accumulatedBalanceRef.current = newBalance;
      return newBalance;
    });

    setTapBalance((prevTapBalance) => {
      const newTapBalance = prevTapBalance + tapValue.value;
      accumulatedTapBalanceRef.current = newTapBalance;
      return newTapBalance;
    });

    // Remove the click after the animation duration
    setTimeout(() => {
      setClicks((prevClicks) =>
        prevClicks.filter((click) => click.id !== newClick.id)
      );
    }, 1000); // Match this duration with the animation duration

    // Reset the debounce timer
    clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(updateFirestore, 1000); // Adjust the delay as needed

  // Reset the refill timer
  clearInterval(refillIntervalRef.current); // Stop refilling while the user is active
  setIsRefilling(false); // Set refilling state to false
  clearTimeout(refillTimeoutRef.current);
  refillTimeoutRef.current = setTimeout(() => {
    if (energy < battery.energy) {
      refillEnergy();
    }
  }, 1000); // Set the inactivity period to 3 seconds (adjust as needed)
};
  const handleClickGuru = (e) => {
    if (tapValue.value > 0) {
      play2();
    }
    triggerHapticFeedback();

    if (energy <= 0 || isDisabled || isUpdatingRef.current) {
      setGlowBooster(true); // Trigger glow effect if energy and points are 0
      setTimeout(() => {
        setGlowBooster(false); // Remove glow effect after 1 second
      }, 300);
      return; // Exit if no energy left or if clicks are disabled or if an update is in progress
    }

    const { offsetX, offsetY, target } = e.nativeEvent;
    const { clientWidth, clientHeight } = target;

    const horizontalMidpoint = clientWidth / 2;
    const verticalMidpoint = clientHeight / 2;

    const animationClass =
      offsetX < horizontalMidpoint
        ? 'wobble-left'
        : offsetX > horizontalMidpoint
        ? 'wobble-right'
        : offsetY < verticalMidpoint
        ? 'wobble-top'
        : 'wobble-bottom';

    // Remove previous animations
    imageRef.current.classList.remove(
      'wobble-top',
      'wobble-bottom',
      'wobble-left',
      'wobble-right'
    );

    // Add the new animation class
    imageRef.current.classList.add(animationClass);

    // Remove the animation class after animation ends to allow re-animation on the same side
    setTimeout(() => {
      imageRef.current.classList.remove(animationClass);
    }, 500); // duration should match the animation duration in CSS

    // Increment the count
    const rect = e.target.getBoundingClientRect();
    const newClick = {
      id: Date.now(), // Unique identifier
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };

    setClicks((prevClicks) => [...prevClicks, newClick]);

    // Update state immediately for UI
    setEnergy((prevEnergy) => {
      const newEnergy = Math.max(prevEnergy - 0, 0); // Ensure energy does not drop below zero
      accumulatedEnergyRef.current = newEnergy;
      return newEnergy;
    });

    setPoints((prevPoints) => prevPoints + tapValue.value * 5);

    setBalance((prevBalance) => {
      const newBalance = prevBalance + tapValue.value * 5;
      accumulatedBalanceRef.current = newBalance;
      return newBalance;
    });

    setTapBalance((prevTapBalance) => {
      const newTapBalance = prevTapBalance + tapValue.value * 5;
      accumulatedTapBalanceRef.current = newTapBalance;
      return newTapBalance;
    });

    // Remove the click after the animation duration
    setTimeout(() => {
      setClicks((prevClicks) =>
        prevClicks.filter((click) => click.id !== newClick.id)
      );
    }, 1000); // Match this duration with the animation duration


    // Reset the debounce timer
    clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(updateFirestore, 1000); // Adjust the delay as needed

  // Reset the refill timer
  clearInterval(refillIntervalRef.current); // Stop refilling while the user is active
  setIsRefilling(false); // Set refilling state to false
  clearTimeout(refillTimeoutRef.current);
  refillTimeoutRef.current = setTimeout(() => {
    if (energy < battery.energy) {
      refillEnergy();
    }
  }, 1000); // Set the inactivity period to 3 seconds (adjust as needed)
};

  const updateFirestore = async () => {
    const telegramUser = window.Telegram.WebApp.initDataUnsafe?.user;
    if (telegramUser) {
      const { id: userId } = telegramUser;
      const userRef = doc(db, 'telegramUsers', userId.toString());

      // Set updating flag
      isUpdatingRef.current = true;

      try {
        await updateDoc(userRef, {
          balance: accumulatedBalanceRef.current,
          energy: accumulatedEnergyRef.current,
          tapBalance: accumulatedTapBalanceRef.current,
        });

        // No need to update state here as it is already updated immediately in handleClick

        // Reset accumulated values to current state values
        accumulatedBalanceRef.current = balance;
        accumulatedEnergyRef.current = energy;
        accumulatedTapBalanceRef.current = tapBalance;
      } catch (error) {
        console.error('Error updating balance and energy:', error);
      } finally {
        // Clear updating flag
        isUpdatingRef.current = false;
      }
    }
  };


  
  const energyPercentage = (energy / battery.energy) * 100;


  // const handleClaim = async () => {
  //   const telegramUser = window.Telegram.WebApp.initDataUnsafe?.user;
  //   if (telegramUser) {
  //     const { id: userId } = telegramUser;
  //     const userRef = doc(db, 'telegramUsers', userId.toString());
  //     try {
  //       await updateDoc(userRef, {
  //         balance: balance + points,
  //         energy: energy,
  //         tapBalance: tapBalance + points
     
  //       });
  //       setBalance((prevBalance) => prevBalance + points);
  //       setTapBalance((prevTapBalance) => prevTapBalance + points);
  //       localStorage.setItem('energy', energy);

  //       if (energy <= 0) {
  //         setIsTimerVisible(true);
  //       }
  //       console.log('Points claimed successfully');
  //     } catch (error) {
  //       console.error('Error updating balance and energy:', error);
  //     }
  //   }
  //   openClaimer();
  // };



  const formatNumber = (num) => {
    if (num < 100000) {
      return new Intl.NumberFormat().format(num).replace(/,/g, " ");
    } else if (num < 1000000) {
      return new Intl.NumberFormat().format(num).replace(/,/g, " ");
    // } else {
    //   return (num / 1000000).toFixed(3).replace(".", ".") + " M";
    } else {
      return new Intl.NumberFormat().format(num).replace(/,/g, " ");
    }
  };

      // // Remove the click after the animation duration
      // setTimeout(() => {
      //   setTapGuru(false);
      //   setMainTap(true);
      // }, 22000); // Match this duration with the animation duration
  

      

      return (
        <>
          {loading ? (
            <Spinner />
          ) : (
            <Animate>
              <div className="w-full h-screen flex flex-col justify-start items-center p-4">
                {/* Top Section */}
                <div className="w-full flex flex-col items-center space-y-2 mb-4">
                  <div className="flex items-center space-x-2">
                    <img src={coinsmall} className="w-10 h-10" alt="coin" />
                    <h1 className="text-white text-4xl font-extrabold">
                      {formatNumber(balance + refBonus)}
                    </h1>
                  </div>
                  <div className="flex items-center space-x-1">
                    <img src={level.imgUrl} className="w-6 h-6" alt="level" />
                    <h2 onClick={() => setShowLevels(true)} className="text-[#9d99a9] text-lg font-medium">
                      {level.name}
                    </h2>
                    <MdOutlineKeyboardArrowRight className="w-5 h-5 text-[#9d99a9]" />
                  </div>
                </div>
    
                {/* Energy Bar - Now above the main image */}
                <div className="w-full max-w-md flex flex-col items-center space-y-2 mb-4">
                  <div className="flex items-center space-x-2 text-white">
                    <img alt="flash" src={flash} className="w-5 h-5" />
                    <div>
                      <span className="text-lg font-bold">{energy.toFixed(0)}</span>
                      <span className="text-sm font-medium">/ {battery.energy}</span>
                    </div>
                  </div>
                  <div className="w-full h-4 bg-energybar rounded-full border border-borders2 overflow-hidden">
                    <div
                      className="h-full bg-[#3f88e8] rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${energyPercentage}%` }}
                    ></div>
                  </div>
                </div>
    
                {/* Middle Section - Logo */}
                <div className="flex-1 flex items-center justify-center relative">
                  <div className="bg-[#0077cc] blur-[50px] absolute w-[200px] h-[220px] rounded-full"></div>
                  <div className={`${tapGuru ? 'block' : 'hidden'} pyro`}>
                    <div className="before"></div>
                    <div className="after"></div>
                  </div>
                  <div className="relative">
                    <img
                      src="/lihgt.gif"
                      alt="background"
                      className={`absolute w-[350px] rotate-45 ${tapGuru ? 'block' : 'hidden'}`}
                    />
                    <Container>
                      <img 
                        onPointerDown={mainTap ? handleClick : handleClickGuru}
                        ref={imageRef}
                        src={mainTap ? level.imgTap : level.imgBoost}
                        alt="Tap"
                        className="wobble-image w-[250px] select-none"
                      />
                      {clicks.map((click) => (
                        <SlideUpText key={click.id} x={click.x} y={click.y}>
                          +{mainTap ? tapValue.value : tapValue.value * 5}
                        </SlideUpText>
                      ))}
                    </Container>
                  </div>
                </div>
    
                <Levels showLevels={showLevels} setShowLevels={setShowLevels} />
              </div>
            </Animate>
          )}
        </>
      );
    };
    
    export default Plutos;