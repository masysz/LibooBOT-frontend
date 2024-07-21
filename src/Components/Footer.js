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
        `group flex flex-col items-center justify-center px-3 py-2 rounded-2xl transition-all duration-300 ${
          isActive
            ? "bg-gradient-to-br from-blue-500 to-cyan-400 shadow-lg"
            : "hover:bg-white/10"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <div className={`relative ${isMain ? "mb-1" : ""}`}>
            <img 
              src={icon} 
              className={`w-8 h-8 ${isMain ? "w-12 h-12" : ""} transition-transform duration-300 group-hover:scale-110`} 
              alt={label} 
            />
            {isActive && (
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full" />
            )}
          </div>
          <span className={`text-xs font-medium mt-1 transition-colors duration-300 ${isActive ? "text-white" : "text-gray-300 group-hover:text-white"}`}>
            {label}
          </span>
        </>
      )}
    </NavLink>
  );

  return (
    <div className="fixed bottom-0 left-0 right-0 w-full z-50">
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-cyan-900 backdrop-blur-lg bg-opacity-90 shadow-lg">
        <div className="max-w-screen-xl mx-auto px-4 py-3">
          <div className="flex justify-around items-center">
            <NavItem to="/ref" icon={ref} label="Ref" />
            <NavItem to="/tasks" icon={tasks} label="Tasks" />
            <div className="relative -mt-8">
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-16 bg-gradient-to-br from-blue-400 to-cyan-300 rounded-full flex items-center justify-center shadow-lg">
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