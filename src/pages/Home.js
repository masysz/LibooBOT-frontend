import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import "../App.css";
import "../fire.scss";
import { AnimatePresence } from "framer-motion";
import Footer from "../Components/Footer";
import { UserProvider } from "../context/userContext";
const tele = window.Telegram.WebApp;

const Home = () => {

  useEffect(() => {
    const handleContextMenu = (event) => event.preventDefault();
    const handleKeyDown = (event) => {
      if ((event.ctrlKey && (event.key === 'u' || event.key === 's')) || (event.ctrlKey && event.shiftKey && event.key === 'i')) {
        event.preventDefault();
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);


    useEffect(() => {
        tele.ready();
        tele.expand();
        
        window.Telegram.WebApp.setHeaderColor('#5496ff'); // Set header color to red
        window.Telegram.WebApp.enableClosingConfirmation('true');
        window.Telegram.WebApp.disableVerticalSwipes('false');
        

              // Haptic feedback
      if (tele.HapticFeedback) {
        tele.HapticFeedback.impactOccurred("medium");
      }


    }, []);

    

  return (
<>

<div className="w-full flex justify-center">
        <div className="w-full flex justify-center">
          <div className="flex flex-col pt-8 space-y-3 w-full">


            

  
      
          <UserProvider>
            <AnimatePresence mode="wait">
            <Outlet />
            </AnimatePresence>
            </UserProvider>
       
     
          
          



        

    

           <Footer/>
           </div>
           </div>
           </div>
           
           </>
  );
};

export default Home;
