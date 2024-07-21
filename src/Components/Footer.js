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
        `group flex flex-col items-center justify-center px-4 py-3 rounded-full transition-all duration-300 ${
          isActive
            ? "bg-blue-600 shadow-lg"
            : "hover:bg-gray-800"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <div className="relative mb-1">
            <img 
              src={icon} 
              className={`w-6 h-6 ${isMain ? "w-8 h-8" : ""} transition-transform duration-300 group-hover:scale-110 ${isActive ? "filter brightness-0 invert" : "opacity-70 group-hover:opacity-100"}`} 
              alt={label} 
            />
          </div>
          <span className={`text-xs font-medium transition-colors duration-300 ${isActive ? "text-white" : "text-gray-400 group-hover:text-white"}`}>
            {label}
          </span>
        </>
      )}
    </NavLink>
  );

  return (
    <div className="fixed bottom-0 left-0 right-0 w-full z-50">
      <div className="bg-gray-900 shadow-lg border-t border-gray-800">
        <div className="max-w-screen-xl mx-auto px-4 py-2">
          <div className="flex justify-around items-center">
            <NavItem to="/ref" icon={ref} label="Ref" />
            <NavItem to="/tasks" icon={tasks} label="Tasks" />
            <div className="relative -mt-8">
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
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