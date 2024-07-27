import React from 'react';
import { NavLink } from "react-router-dom";

const EnergyBar = ({ energy, battery, energyPercentage, flash, leaderboard }) => {
  return (
    <div className="w-full fixed bottom-[120px] left-0 right-0 px-5">
      <div className="flex w-full items-center justify-between bg-white bg-opacity-20 backdrop-filter backdrop-blur-lg rounded-2xl p-2">
        <div className="flex flex-col w-[70%]">
          <div className="flex items-center text-white mb-2">
            <img alt="flash" src={flash} className="w-[22px] mr-2" />
            <div className="relative w-full h-[18px] bg-energybar rounded-full border border-borders2">
              <div
                className="bg-[#3f88e8] h-full rounded-full transition-width duration-100"
                style={{ width: `${energyPercentage}%` }}
              ></div>
              <div className="absolute inset-0 flex items-center justify-center text-[12px] font-bold text-white">
                {energy.toFixed(0)} / {battery.energy}
              </div>
            </div>
          </div>
        </div>
        <NavLink 
          to="/tapsleaderboard" 
          className="w-[22%] flex items-center justify-center bg-white bg-opacity-30 rounded-xl p-2 transition-all duration-300 hover:bg-opacity-50"
        >
          <img src={leaderboard} alt="Leaderboard" className="w-5 h-5 mr-2" />
          <span className="text-[11px] text-white font-semibold whitespace-nowrap">Leaderboard</span>
        </NavLink>
      </div>
    </div>
  );
};

export default EnergyBar;