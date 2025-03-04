import React, { useEffect } from 'react'

const ClaimLeveler = ({claimLevel, setClaimLevel}) => {

  // eslint-disable-next-line 
  const openLink = () => {
    window.open("https://t.me/liboo_chat");


  };

  useEffect(() => {
    const handleBackButtonClick = () => {
      setClaimLevel(false);
    };
  
    if (claimLevel) {
      window.Telegram.WebApp.BackButton.show();
      window.Telegram.WebApp.BackButton.onClick(handleBackButtonClick);
    } else {
      window.Telegram.WebApp.BackButton.hide();
      window.Telegram.WebApp.BackButton.offClick(handleBackButtonClick);
    }
  
    // Cleanup handler when component unmounts
    return () => {
      window.Telegram.WebApp.BackButton.offClick(handleBackButtonClick);
    };
  }, [claimLevel, setClaimLevel]);
  

  return (
    <>
    {claimLevel ? (
    
    <div className={`fixed bottom-0 left-0 z-50 right-0 h-[76vh] bg-[#1e2340f7] rounded-tl-[20px] rounded-tr-[20px] flex justify-center px-4 py-5`}>

    <div className='w-full flex flex-col justify-center py-8 relative'>
    <div className='w-full flex justify-start py-2 absolute left-2 top-3'>
                         
                        </div>

        <div className='w-full flex justify-center flex-col items-center'>


        <h3 className='font-normal text-[18px] py-4 text-center px-6'>
            Sorry, this feature is not available yet, You can message me for further development if you need all complete features or you want me to development a different kind of telegram app/bot for you
        </h3>
 

</div>

    <div className='w-full flex justify-center px-3'>
<button onClick={openLink}  className='bg-gradient-to-b gradient from-[#ffba4c] to-[#aa6900] w-full py-4 px-3 flex items-center justify-center text-center rounded-[12px] font-semibold text-[18px]'>
   Click here to message me
</button>
</div>

    </div>


</div>
) : null}
    
    </>
   
  )
}

export default ClaimLeveler