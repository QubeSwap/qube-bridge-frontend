'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit';
import Image from 'next/image';
import Logo from "@/../public/Logo.png"

function TopBar() {
  return (
    <div className="flex w-full fixed justify-between items-center px-8 py-2 z-50">
      <div className="flex flex-row gap-3 sm:gap-6 items-center">
            <Image src={Logo} alt="Logo" className="flex flex-col" />
      </div>
	  <div className="flex justify-center items-left text-2xl font-bold hover:cursor-pointer text-gray-200">
		TRADE
	  </div>
	  <div className="flex justify-center items-left text-2xl font-bold hover:cursor-pointer text-gray-200">
		TOKEN ADDRESS
	  </div>
	  <div className="flex justify-center items-left text-2xl font-bold hover:cursor-pointer text-gray-200">
		DISCOVERY
	  </div>
	  <div className="flex justify-center items-left text-2xl font-bold hover:cursor-pointer text-gray-200">
		ABOUT
	  </div>
      <div className='h-8'>
        <ConnectButton />
      </div>
    </div>
  );
}

export default TopBar;
