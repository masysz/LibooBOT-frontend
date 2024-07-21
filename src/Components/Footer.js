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
            ? "bg-gradient-to-r from-blue-400 to-cyan-300 shadow-lg scale-105"
            : "hover:bg-white hover:bg-opacity-10"
        } ${isMain ? "transform -translate-y-4" : ""}`
      }
    >
      {({ isActive }) => (
        <>
          <div className={`${isMain ? "mb-1" : ""}`}>
            <img src={icon} className={`w-8 h-8 ${isMain ? "w-12 h-12" : ""}`} alt={label} />
          </div>
          <span className={`text-xs font-medium text-white ${isActive ? "font-bold" : ""}`}>{label}</span>
        </>
      )}
    </NavLink>
  );

  return (
    <div className="fixed bottom-0 left-0 right-0 w-full z-50">
      <div className="backdrop-filter backdrop-blur-lg bg-gradient-to-r from-blue-900 to-cyan-800 bg-opacity-80 rounded-t-3xl shadow-lg border-t border-blue-700">
        <div className="max-w-screen-xl mx-auto px-4 py-3">
          <div className="flex justify-around items-end">
            <NavItem to="/ref" icon={ref} label="Ref" />
            <NavItem to="/tasks" icon={tasks} label="Tasks" />
            <NavItem to="/" icon={coinsmall} label="Tap" isMain />
            <NavItem to="/boost" icon={boost} label="Boost" />
            <NavItem to="/Donate" icon={donate} label="Donate" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;