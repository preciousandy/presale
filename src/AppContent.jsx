import React, { useState, useEffect, useCallback } from "react";

import { useAuth } from './context/AuthContext';
import apiClient from "./api/axiosConfig";
import { useAccount } from "wagmi";

import WalletConnector from "./components/WalletConnector";
import PresaleModule from "./components/PresaleModule";
import AirdropClaimer from "./components/AirdropClaimer";
import TokenomicsInfo from "./components/TokenomicsInfo";
import "./web3modal-styles.css";

import HydroLogo from "./assets/logo.png";

function AppContent() {
  
  const { user, isAuthenticated, logout } = useAuth();
  
  const [activeTab, setActiveTab] = useState("presale");
  const [presaleMetrics, setPresaleMetrics] = useState({
    totalRaised: 0,
    softCap: 1000,
    hardCap: 5000,
    tokenPrice: 0.00075,
    minBuy: 0.1,
    maxBuy: 10,
  });

  const [targetDate, setTargetDate] = useState(null);
  const [timeLeft, setTimeLeft] = useState({});
  const { address: connectedWalletAddress } = useAccount();

  
  const handleLogout = async () => {
    
    logout();
  };

  const calculateTimeLeft = useCallback(() => {
    if (!targetDate) return {};

    const difference = +new Date(targetDate) - +new Date();
    let newTimeLeft = {};

    if (difference > 0) {
      newTimeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }
    return newTimeLeft;
  }, [targetDate]);
  
  useEffect(() => {
    if (!targetDate) return;

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, [calculateTimeLeft, targetDate]);

  const fetchPresaleStatus = async () => {
  
    if (!isAuthenticated) {
        console.log("Not authenticated, skipping fetch.");
        return;
    }

    try {
      const response = await apiClient.get('/api/presale-status');
      
      setPresaleMetrics((prev) => ({
        ...prev,
        totalRaised: response.data.total_raised || 0,
      }));

      if (response.data.end_date) {
        setTargetDate(new Date(response.data.end_date));
      }

    } catch (error) {
      console.error("Error fetching presale status:", error);
      if (error.response && error.response.status === 401) {
       
        logout();
      }
    }
  };

  useEffect(() => {
    
    if (isAuthenticated) {
        fetchPresaleStatus();
    }
  }, [isAuthenticated]); 

  const timerComponents = Object.keys(timeLeft).map((interval) => {
    const value = timeLeft[interval];
    if (value === undefined) return null;
    return (
      <div key={interval} className="flex flex-col items-center mx-1 md:mx-2">
        <span className="text-xl md:text-3xl font-bold bg-blue-700 px-3 py-1 rounded-md">
          {value < 10 ? `0${value}` : value}
        </span>
        <span className="text-xs md:text-sm text-gray-300 mt-1 uppercase">
          {interval}
        </span>
      </div>
    );
  });
  
  
  if (!isAuthenticated) {
      return null; 
  }

  return (
    <div className="min-h-screen flex flex-col items-center p-4 relative overflow-hidden">
      <header className="w-full max-w-6xl flex flex-col md:flex-row items-center justify-between py-4 px-6 bg-white bg-opacity-10 rounded-xl shadow-lg mb-8 z-20">
        <div className="flex items-center space-x-3 mb-4 md:mb-0">
          <img src={HydroLogo} alt="Hydro Coin Logo" className="h-10 w-10" />
          <span className="text-xl md:text-2xl font-extrabold text-white">
            HydroMine
          </span>
        </div>

        <nav className="flex-grow flex justify-center space-x-6 mb-4 md:mb-0">
          {["presale", "airdrop", "tokenomics"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-lg font-medium px-4 py-2 rounded-lg transition-colors duration-300 ${
                activeTab === tab
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-gray-200 hover:text-white hover:bg-white hover:bg-opacity-20"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>

        <div className="flex items-center space-x-4">
          <WalletConnector />
          {/* We get the user from the context, no more state management here */}
          {user && (
            <span className="text-sm text-white hidden md:block">
              Welcome, {user.name}!
            </span>
          )}
          <button 
            onClick={handleLogout} 
            className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-3 rounded-lg transition-colors duration-300 text-sm"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="w-full max-w-6xl flex flex-col lg:flex-row items-center lg:items-start justify-center lg:justify-between space-y-8 lg:space-y-0 lg:space-x-8 z-10">
        <section className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-6 lg:w-1/2 p-4">
            <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight">
                <span className="text-purple-300">$HYDRO</span> Crypto Presale
            </h1>
            <p className="text-lg md:text-xl text-gray-200 max-w-md">
                Get the Best Next Gen Crypto Token of {new Date().getFullYear() + 1} Now!
            </p>
        </section>

        <section className="bg-white bg-opacity-10 p-6 md:p-8 rounded-2xl shadow-2xl border border-white border-opacity-20 flex flex-col items-center space-y-6 lg:w-1/2 max-w-lg w-full">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 text-center">
            Buy $HYDRO TOKEN In Presale Now!
          </h2>

          <div className="flex justify-center items-end text-white text-center">
            {targetDate ? (
                timerComponents.length > 0 ? (
                  timerComponents
                ) : (
                  <span className="text-xl">Presale has ended!</span>
                )
            ) : (
                <span className="text-xl">Loading countdown...</span>
            )}
          </div>

          <div className="w-full bg-blue-700 bg-opacity-50 py-2 px-4 rounded-lg text-center font-semibold text-lg">
            UNTIL PRICE INCREASE
          </div>

          <div className="w-full bg-blue-800 bg-opacity-30 p-4 rounded-lg flex flex-col items-center space-y-2 text-white text-lg font-medium">
            <p>
              TOTAL USD RAISED: ${presaleMetrics.totalRaised.toLocaleString()}
            </p>
            <p>1 $HYDRO = ${presaleMetrics.tokenPrice.toFixed(4)}</p>
          </div>

          <div className="w-full">
          {activeTab === "presale" && (
              <PresaleModule
                metrics={presaleMetrics}
                connectedWallet={connectedWalletAddress}
                onContributionSuccess={fetchPresaleStatus}
              />
            )} 
            {activeTab === "airdrop" && (
              <AirdropClaimer connectedWallet={connectedWalletAddress} />
            )}
            {activeTab === "tokenomics" && <TokenomicsInfo />}
          </div>
        </section>
      </main>
    </div>
  );
}

export default AppContent;