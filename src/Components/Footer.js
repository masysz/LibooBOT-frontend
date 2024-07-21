import React from "react";
import ref from "../images/ref4.webp";
import boost from "../images/booster2.webp";
import tasks from "../images/tasks2.webp";
import donate from "../images/stats.webp";
import tonwallet from "../images/wallet2.webp";
import coinsmall from "../images/coins-6.webp";
import { NavLink } from "react-router-dom";

const Footer = () => {
  const NavItem = ({ to, icon, label, isMain = false }) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-300 ${
          isActive
            ? "bg-white bg-opacity-20 shadow-lg scale-110"
            : "hover:bg-white hover:bg-opacity-10"
        } ${isMain ? "transform -translate-y-4" : ""}`
      }
    >
      <img src={icon} className={`w-6 h-6 mb-1 ${isMain ? "w-10 h-10" : ""}`} alt={label} />
      <span className="text-xs font-medium text-white">{label}</span>
    </NavLink>
  );

  return (
    <div className="fixed bottom-0 left-0 right-0 w-full">
      <div className="backdrop-filter backdrop-blur-lg bg-black bg-opacity-30 rounded-t-3xl shadow-lg">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="flex justify-around items-end py-2">
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