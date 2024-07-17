import React from "react";
import ref from "../images/ref4.webp";
import boost from "../images/booster2.webp";
import tasks from "../images/tasks2.webp";
import stats from "../images/stats.webp";
import tonwallet from "../images/wallet2.webp";
import coinsmall from "../images/coins-6.webp";
import { NavLink } from "react-router-dom";

const Footer = () => {
  return (
    <div className="w-full flex items-center justify-center space-x-2">
      <NavLink
        to="/ref"
        className={({ isActive }) => {
          return `

${
  isActive
    ? "w-[20%] h-[65px] pt-1 bg-activebg border-[1px] border-activeborder flex flex-col rounded-[10px] items-center justify-center text-[#fff] text-[15px]"
    : "w-[20%] h-[65px] pt-1 bg-cards border-[1px] border-borders flex flex-col rounded-[10px] items-center justify-center text-[#fff] text-[15px]"
}
    `;
        }}
      >
        <img src={ref} className="w-[32px] -mb-1" alt="ref" />
        <span className="font-medium">Ref</span>
      </NavLink>
      <NavLink
        to="/tasks"
        className={({ isActive }) => {
          return `

${
  isActive
    ? "w-[20%] h-[65px] pt-1 bg-activebg border-[1px] border-activeborder flex flex-col rounded-[10px] items-center justify-center text-[#fff] text-[15px]"
    : "w-[20%] h-[65px] pt-1 bg-cards border-[1px] border-borders flex flex-col rounded-[10px] items-center justify-center text-[#fff] text-[15px]"
}
    `;
        }}
      >
        <img src={tasks} className="w-[30px]" alt="tasks" />
        <span className="font-medium">Tasks</span>
      </NavLink>

      {/*  */}

      <NavLink
        to="/"
        className={({ isActive }) => {
          return `

${
  isActive
    ? "w-[20%] h-[65px] pt-1 bg-activebg border-[1px] border-activeborder flex flex-col rounded-[10px] items-center justify-center text-[#fff] text-[15px]"
    : "w-[20%] h-[65px] pt-1 bg-cards border-[1px] border-borders flex flex-col rounded-[10px] items-center justify-center text-[#fff] text-[15px]"
}
    `;
        }}
      >
        <img src={coinsmall} className="w-[30px] -mb-[1px]" alt="tap" />
        <span className="font-medium">Tap</span>
      </NavLink>
      <NavLink
        to="/boost"
        className={({ isActive }) => {
          return `

${
  isActive
    ? "w-[20%] h-[65px] pt-[8px] bg-activebg border-[1px] border-activeborder flex flex-col rounded-[10px] items-center justify-center text-[#fff] text-[15px]"
    : "w-[20%] h-[65px] pt-[8px] bg-cards border-[1px] border-borders flex flex-col rounded-[10px] items-center justify-center text-[#fff] text-[15px]"
}
    `;
        }}
      >
        <img src={boost} className="w-[28px] -mb-[2px]" alt="boost" />
        <span className="font-medium">Boost</span>
      </NavLink>

      {/*  */}

      <NavLink
        to="/connect"
        className={({ isActive }) => {
          return `

${
  isActive
    ? "w-[20%] h-[65px] pt-[8px] bg-activebg border-[1px] border-activeborder flex flex-col rounded-[10px] items-center justify-center text-[#fff] text-[15px]"
    : "w-[20%] h-[65px] pt-[8px] bg-cards border-[1px] border-borders flex flex-col rounded-[10px] items-center justify-center text-[#fff] text-[15px]"
}
    `;
        }}
      >
        <img src={tonwallet} className="w-[24px]" alt="connect" />
        <span className="font-medium">Wallet</span>
      </NavLink>
    </div>
  );
};

export default Footer;
