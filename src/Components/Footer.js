import React from "react";
import { NavLink } from "react-router-dom";
import frams from "../images/ref4.webp";
import tasks from "../images/tasks2.webp";
import tap from "../images/main-logo.png";
import boost from "../images/booster2.webp";
import donate from "../images/donate.png";

const Footer = () => {
  const navItems = [
    { name: "Frens", icon: frams, path: "/ref" },
    { name: "Tasks", icon: tasks, path: "/tasks" },
    { name: "Tap", icon: tap, path: "/" },
    { name: "Boost", icon: boost, path: "/boost" },
    { name: "Donate", icon: donate, path: "/donate" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-blue-100 to-blue-300 p-2 rounded-t-3xl shadow-lg">
      <div className="flex items-center justify-between max-w-md mx-auto">
        {navItems.map((item, index) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) => `
              ${index === 2 ? 'w-1/4' : 'w-1/5'}
              flex flex-col items-center justify-center
              ${index === 2 ? '-mt-8' : ''}
              ${isActive ? 'text-blue-700' : 'text-blue-600'}
              transition-all duration-300
            `}
          >
            {({ isActive }) => (
              <>
                <div
                  className={`
                    ${index === 2 ? 'w-18 h-18' : 'w-14 h-14'}
                    flex items-center justify-center
                    rounded-full
                    ${isActive ? 'bg-gradient-to-br from-blue-200 to-blue-400' : 'bg-blue-50'}
                    ${index === 2 ? 'border-4' : 'border-3'}
                    ${isActive ? 'border-blue-500' : 'border-blue-300'}
                    shadow-md transition-all duration-300
                  `}
                >
                  <img
                    src={item.icon}
                    alt={item.name}
                    className={`${index === 2 ? 'w-10 h-10' : 'w-8 h-8'} transition-transform duration-300 hover:scale-110`}
                  />
                </div>
                <span className={`mt-1 text-xs ${index === 2 ? 'font-bold' : 'font-medium'} transition-all duration-300`}>
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