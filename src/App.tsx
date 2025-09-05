import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { WagmiConfig, createConfig, http } from "wagmi";
import { mainnet, bsc, sepolia } from "wagmi/chains"; 
import { injected, walletConnect } from "wagmi/connectors";
import { createWeb3Modal } from "@web3modal/wagmi/react";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'; 
import { useAccount } from "wagmi"; 

import WalletConnector from "./components/WalletConnector";
import PresaleModule from "./components/PresaleModule";
import AirdropClaimer from "./components/AirdropClaimer";
import TokenomicsInfo from "./components/TokenomicsInfo";
import "./web3modal-styles.css";

import HydroLogo from "./assets/logo.png";

const API_BASE_URL = "";

interface TelegramUser {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_bot?: boolean;
}

export const TelegramUserContext = React.createContext<TelegramUser | null>(
  null
);

const projectId = "5055ddceacd39cd7965a0fad21231b5c";

const metadata = {
  name: "HydroMine",
  description: "Web3Modal Example",
  url: "https://web3modal.com",
  icons: ["https://web3modal.com/logo.png"],
};

const chains = [mainnet, bsc, sepolia];

const config = createConfig({
  chains,
  transports: {
    [mainnet.id]: http(),
    [bsc.id]: http(),
    [sepolia.id]: http(),
  },
  connectors: [
    injected(),
    walletConnect({ projectId, showQrModal: false }),
  ],
});

createWeb3Modal({
  wagmiConfig: config,
  projectId,
  chains,
  metadata,
});

const queryClient = new QueryClient();

function AppContent() {
  const [telegramUser, setTelegramUser] = useState<TelegramUser | null>(null);
  const [activeTab, setActiveTab] = useState("presale");
  const [presaleMetrics, setPresaleMetrics] = useState({
    totalRaised: 0,
    softCap: 1000,
    hardCap: 5000,
    tokenPrice: 0.00075,
    minBuy: 0.1,
    maxBuy: 10,
  });
  const [targetDate] = useState(Date.now() + 3 * 24 * 60 * 60 * 1000);
  const [timeLeft, setTimeLeft] = useState<{ [key: string]: number }>({});

  const { address: connectedWalletAddress } = useAccount();

  const calculateTimeLeft = useCallback(() => {
    const difference = +new Date(targetDate) - +new Date();
    let newTimeLeft: { [key: string]: number } = {};

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

  // NEW: A function to save Telegram user data to the Laravel backend
  const saveTelegramUser = useCallback(async (user: TelegramUser) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/save-telegram-user`, {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        username: user.username,
      });
      console.log("Telegram user saved to backend:", response.data);
    } catch (error) {
      console.error("Error saving Telegram user to backend:", error);
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, [calculateTimeLeft]);

  // Modifying the existing useEffect to save the user data
  useEffect(() => {
    if (window.Telegram && window.Telegram.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();

      if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
        const user = tg.initDataUnsafe.user as TelegramUser;
        setTelegramUser(user);
        // Call the new function to save the user as soon as the app loads
        saveTelegramUser(user);
      } else {
        console.warn("Telegram user data not found in initDataUnsafe.");
      }
    } else {
      console.warn("window.Telegram.WebApp is not available.");
    }
  }, [saveTelegramUser]);

  const fetchPresaleStatus = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/presale-status`);
      setPresaleMetrics((prev) => ({
        ...prev,
        totalRaised: response.data.total_raised || 0,
      }));
    } catch (error) {
      console.error("Error fetching presale status:", error);
    }
  };

  useEffect(() => {
    fetchPresaleStatus();
  }, []);

  const timerComponents = Object.keys(timeLeft).map((interval) => {
    const value = timeLeft[interval as keyof typeof timeLeft];
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

  return (
    <TelegramUserContext.Provider value={telegramUser}>
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
            {telegramUser && (
              <span className="text-sm text-white hidden md:block">
                Welcome,{" "}
                {telegramUser.first_name || telegramUser.username || "User"}!
              </span>
            )}
          </div>
        </header>

        <main className="w-full max-w-6xl flex flex-col lg:flex-row items-center lg:items-start justify-center lg:justify-between space-y-8 lg:space-y-0 lg:space-x-8 z-10">
          <section className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-6 lg:w-1/2 p-4">
            <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight">
              <span className="text-purple-300">$HYDRO</span> Crypto Presale
            </h1>
            <p className="text-lg md:text-xl text-gray-200 max-w-md">
              Get the Best Next Gen Crypto Token of{" "}
              {new Date().getFullYear() + 1} Now!
            </p>
          </section>

          <section className="bg-white bg-opacity-10 p-6 md:p-8 rounded-2xl shadow-2xl border border-white border-opacity-20 flex flex-col items-center space-y-6 lg:w-1/2 max-w-lg w-full">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 text-center">
              Buy $HYDRO TOKEN In Presale Now!
            </h2>

            <div className="flex justify-center items-end text-white text-center">
              {timerComponents.length ? (
                timerComponents
              ) : (
                <span className="text-xl">Presale has ended!</span>
              )}
            </div>

            <div className="w-full bg-blue-700 bg-opacity-50 py-2 px-4 rounded-lg text-center font-semibold text-lg">
              UNTO PRICE INCREASE
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
                  API_BASE_URL={API_BASE_URL}
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
    </TelegramUserContext.Provider>
  );
}

function App() {
  return (
    <WagmiConfig config={config}>
      <QueryClientProvider client={queryClient}>
        <AppContent />
      </QueryClientProvider>
    </WagmiConfig>
  );
}

export default App;