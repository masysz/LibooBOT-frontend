// EnergyBar.js
import React from 'react';
import { NavLink } from "react-router-dom";

const EnergyBar = ({ energy, battery, energyPercentage, flash, leaderboard }) => {
  return (
    <div className="w-full fixed bottom-[120px] left-0 right-0 px-5">
      <div className="flex w-full items-end justify-between bg-white bg-opacity-20 backdrop-filter backdrop-blur-lg rounded-2xl p-3">
        <div className="flex flex-col w-[70%]">
          <div className="flex pb-3 space-x-2 items-center text-[#fff]">
            <img alt="flash" src={flash} className="w-[24px]" />
            <div>
              <span className="text-[18px] font-bold">{energy.toFixed(0)}</span>
              <span className="text-[16px] font-medium ml-1">/ {battery.energy}</span>
            </div>
          </div>
          <div className="flex w-full p-[3px] h-[20px] items-center bg-energybar rounded-[12px] border-[1px] border-borders2">
            <div
              className="bg-[#3f88e8] h-full rounded-full transition-width duration-100"
              style={{ width: `${energyPercentage}%` }}
            ></div>
          </div>
        </div>
        <NavLink 
          to="/tapsleaderboard" 
          className="w-[28%] flex items-center justify-center space-x-2 bg-white bg-opacity-30 rounded-xl px-3 p-1  py-2 transition-all duration-300 hover:bg-opacity-50"
        >
          <img src={leaderboard} alt="Leaderboard" className="w-5 h-5" />
          <span className="text-[11px] text-white font-semibold whitespace-nowrap">Leaderboard</span>
        </NavLink>
      </div>
    </div>
  );
};

export default EnergyBar;