import React from 'react';
import { NavLink } from "react-router-dom";

const EnergyBar = ({ energy, battery, energyPercentage, flash, leaderboard }) => {
  return (
    <div className="fixed bottom-4 left-0 right-0 px-4">
      <div className="flex items-center justify-between bg-white/20 backdrop-blur-lg rounded-xl p-2">
        <div className="flex items-center space-x-2 text-white">
          <img src={flash} alt="Energy" className="w-5 h-5" />
          <span className="text-lg font-bold">{energy.toFixed(0)}</span>
          <span className="text-sm">/ {battery.energy}</span>
        </div>
        <div className="w-1/2 bg-energybar rounded-full h-4 overflow-hidden">
          <div
            className="bg-blue-500 h-full transition-all duration-300"
            style={{ width: `${energyPercentage}%` }}
          ></div>
        </div>
        <NavLink 
          to="/tapsleaderboard" 
          className="flex items-center space-x-1 bg-white/30 rounded-lg px-2 py-1 hover:bg-white/50 transition-colors"
        >
          <img src={leaderboard} alt="Leaderboard" className="w-4 h-4" />
          <span className="text-xs text-white font-semibold">Leaderboard</span>
        </NavLink>
      </div>
    </div>
  );
};

export default EnergyBar;