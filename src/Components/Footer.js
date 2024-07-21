import React from "react";
import { NavLink } from "react-router-dom";
import ref from "../images/ref4.webp";
import boost from "../images/booster2.webp";
import tasks from "../images/tasks2.webp";
import donate from "../images/stats.webp";
import coinsmall from "../images/coins-6.webp";

const Footer = () => {
  const NavItem = ({ to, icon, label, isMain = false }) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex flex-col items-center justify-center px-2 py-1 rounded-xl transition-all duration-300 ${
          isActive
            ? "bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg scale-105"
            : "hover:bg-white hover:bg-opacity-10"
        } ${isMain ? "relative" : ""}`
      }
    >
      {({ isActive }) => (
        <>
          <div className={`relative ${isMain ? "mb-2" : ""}`}>
            <img src={icon} className={`w-8 h-8 ${isMain ? "w-12 h-12" : ""}`} alt={label} />
            {isMain && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-white">+</span>
              </div>
            )}
          </div>
          <span className={`text-xs font-medium ${isActive ? "text-white" : "text-gray-300"}`}>{label}</span>
        </>
      )}
    </NavLink>
  );

  return (
    <div className="fixed bottom-0 left-0 right-0 w-full z-50">
      <div className="backdrop-filter backdrop-blur-lg bg-gradient-to-r from-black to-gray-800 bg-opacity-80 rounded-t-3xl shadow-lg border-t border-gray-700">
        <div className="max-w-screen-xl mx-auto px-4 py-3">
          <div className="flex justify-around items-center">
            <NavItem to="/ref" icon={ref} label="Ref" />
            <NavItem to="/tasks" icon={tasks} label="Tasks" />
            <div className="relative -mt-6 z-10">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-16 h-16 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                <NavItem to="/" icon={coinsmall} label="Tap" isMain />
              </div>
            </div>
            <NavItem to="/boost" icon={boost} label="Boost" />
            <NavItem to="/Donate" icon={donate} label="Donate" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;