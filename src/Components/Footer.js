import React from "react";
import { NavLink } from "react-router-dom";
import frams from "../images/ref4.webp";
import tasks from "../images/tasks2.webp";
import tap from "../images/main-logo.png";
import boost from "../images/booster2.webp";
import donate from "../images/donate.png";
import "../App.css";

const Footer = () => {
  const navItems = [
    { name: "Tap", icon: tap, path: "/" },
    { name: "Frens", icon: frams, path: "/ref" },
    { name: "Tasks", icon: tasks, path: "/tasks" },
    { name: "Boost", icon: boost, path: "/boost" },
    { name: "Donate", icon: donate, path: "/donate" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white p-4 shadow-lg border-t border-gray-200">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) => `
              flex flex-col items-center justify-center w-1/5
              text-sm font-medium transition-all duration-300 ease-in-out
              ${isActive ? 'text-blue-600' : 'text-gray-600'}
            `}
          >
            {({ isActive }) => (
              <>
                <div
                  className={`
                    w-12 h-12 flex items-center justify-center
                    rounded-full
                    ${isActive ? 'bg-blue-100' : 'bg-gray-100'}
                    border-2 ${isActive ? 'border-blue-600' : 'border-gray-300'}
                    transition-all duration-300 ease-in-out
                  `}
                >
                  <img
                    src={item.icon}
                    alt={item.name}
                    className="w-6 h-6"
                  />
                </div>
                <span className={`mt-1 ${isActive ? 'font-bold' : 'font-medium'}`}>
                  {item.name}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default Footer;