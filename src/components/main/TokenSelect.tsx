'use client';

import { useState, useRef, useEffect, MouseEvent } from 'react';
import { ChevronDown } from 'lucide-react';
import { CHAIN_LIST } from '@/constants';
import { useChainId } from 'wagmi';

export default function TokenSelect(props: any) {
  const { chain, opChain, setChain, isFirst } = props
  const [showMenu, setShowMenu] = useState(false);
  const [animateIndex, setAnimateIndex] = useState<number | null>(null);
  const newRef = useRef<HTMLDivElement>(null);
  const wagmiChainId = useChainId();

  // Map wagmi chainId to CHAIN_LIST index
  const chainIdToIndex: Record<number, number> = { 1: 0, 8453: 1, 56: 2, 9030: 3 };

  // Set default for first select to connected chain
  useEffect(() => {
    if (isFirst && setChain && wagmiChainId && chainIdToIndex[wagmiChainId] !== undefined) {
      setChain(chainIdToIndex[wagmiChainId]);
    }
    // eslint-disable-next-line
  }, [wagmiChainId, isFirst]);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | Event) => {
      if (newRef.current && !newRef.current.contains(e.target as Node)) {
        closeMenu()
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  const toggleSelect = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setShowMenu((prev) => !prev);
  };

  const closeMenu = () => {
    setShowMenu(false)
  }

  const clickHandler = (index: number) => {
    if(setChain) setChain(index);
    setAnimateIndex(index);
    setTimeout(() => setAnimateIndex(null), 400);
    closeMenu();
  }

  // Filter chains based on whether this is the first or second select
  const availableChains = isFirst 
    ? CHAIN_LIST 
    : CHAIN_LIST.filter((_, index) => index !== opChain);

  return (
    <div className="relative w-full h-12" ref={newRef}>
      <button
        className="flex w-full h-full bg-[#1e1e1e] text-white/50 border-[#4a4a4a] border-[1px] rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-[#62e0ef]"
        onClick={toggleSelect}
        style={{alignItems: "center"}}
        type="button"
      >
        <div className="text-lg">
          {chain == null ? "Select Chain" : CHAIN_LIST[chain].chain}
        </div>
        <span
          onClick={e => e.stopPropagation()}
        >
          <ChevronDown className="ml-auto mt-1 text-blue-200" size={15} />
        </span>
      </button>
      {showMenu && (
        <div className="absolute w-full top-[110%] left-0 max-h-[300px] bg-primary-gray-200/50 shadow shadow-blue-400 backdrop-blur rounded-lg p-2 z-50 overflow-auto">
          {availableChains.map((item, index) => {
            const originalIndex = CHAIN_LIST.findIndex(c => c.id === item.id);
            return (
              <div 
                key={originalIndex} 
                className={`flex w-full gap-3 items-center p-3 rounded-lg hover:cursor-pointer text-blue-200 hover:bg-primary-gray-300 text-lg ${animateIndex === originalIndex ? 'animate-pulse' : ''}`}
                onClick={() => clickHandler(originalIndex)}
              >
                <div className="">
                  {item.chain}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
