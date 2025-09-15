import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { WagmiConfig, createConfig, http } from "wagmi";
import { mainnet, bsc, sepolia } from "wagmi/chains";
import { injected, walletConnect } from "wagmi/connectors";
import { createWeb3Modal } from "@web3modal/wagmi/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAccount } from "wagmi";

import WalletConnector from "./components/WalletConnector";
import PresaleModule from "./components/PresaleModule";
import AirdropClaimer from "./components/AirdropClaimer";
import TokenomicsInfo from "./components/TokenomicsInfo";
import ContributionHistory from "./components/ContributionHistory"; // Import the new component

import HydroLogo from "./assets/logo.png";

const API_BASE_URL = "https://be09e95ad5ba.ngrok-free.app";

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_bot?: boolean;
}

export const TelegramUserContext = React.createContext<TelegramUser | null>(
    null
);

const projectId = "2bc6628f92a6348c07c06e0aae6dfd27";

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
    connectors: [injected(), walletConnect({ projectId, showQrModal: false })],
});

createWeb3Modal({
    wagmiConfig: config,
    projectId,
    chains,
    metadata,
});

const queryClient = new QueryClient();

// Use a single axios instance with an interceptor to handle authentication headers
const api = axios.create({
  baseURL: API_BASE_URL,
});

function AppContent() {
    const [telegramUser, setTelegramUser] = useState<TelegramUser | null>(null);
    const [authToken, setAuthToken] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState("presale");
    const [userTokens, setUserTokens] = useState<number>(0);
    const [presaleMetrics, setPresaleMetrics] = useState({
        totalRaisedBNB: 0,
        totalRaised: 0,
        totalRaisedUSD: 0,
        softCap: 1000,
        hardCap: 5000,
        tokenPrice: 0.00075,
        minBuy: 0.1,
        maxBuy: 100,
    });
    const [targetDate] = useState(Date.now() + 3 * 24 * 60 * 60 * 1000);
    const [timeLeft, setTimeLeft] = useState<{ [key: string]: number }>({});

    const { address: connectedWalletAddress, isConnected } = useAccount();

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



    // Centralized function to fetch user tokens with the auth token

 const fetchUserTokens = useCallback(async (telegramId: number, token: string) => {
        try {
            console.log("Attempting to fetch user tokens with token:", token);
    
            const response = await api.get(`/api/user-tokens`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            console.log("API response for user tokens:", response.data);
            
            // Safely get the tokens value, defaulting to 0 if the key is missing or null
            const tokens = response.data.tokens_purchased ?? "0";
            
            console.log("Value of tokens_purchased:", tokens);
            console.log("Type of tokens_purchased:", typeof tokens);
            
            const userTokens = Number(tokens);
            
            if (!isNaN(userTokens)) {
                setUserTokens(userTokens);
                console.log("Successfully set user tokens:", userTokens);
            } else {
                setUserTokens(0);
                console.error("Could not parse tokens_purchased into a number. Defaulting to 0.");
            }
    
        } catch (error) {
            console.error("Error fetching user tokens:", error);
            setUserTokens(0);
        }
    }, []);



    // Centralized function to update the wallet address with the auth token
    const updateWalletAddress = useCallback(
        async (telegramId: number, walletAddress: string, token: string) => {
            try {
                const response = await api.post(`/api/update-wallet`, {
                    telegram_id: telegramId,
                    wallet_address: walletAddress,
                }, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                console.log("Wallet address updated:", response.data);
            } catch (error) {
                console.error("Error updating wallet address:", error);
            }
        },
        []
    );

    // --- AUTHENTICATION AND INITIAL DATA FETCHING EFFECT ---
 useEffect(() => {
  const initialize = async () => {
      if (window.Telegram && window.Telegram.WebApp) {
          const tg = window.Telegram.WebApp;
          tg.ready();
          tg.expand();

          if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
              const user = tg.initDataUnsafe.user as TelegramUser;
              const initData = tg.initData;

              try {
                  const authResponse = await api.post(`${API_BASE_URL}/api/login/telegram`, {
                      initData: initData,
                  });
                  
                  // Log the full response to verify the data
                  console.log("Authentication Response Data:", authResponse.data);
                  
                  const { token, user: authenticatedUser } = authResponse.data;

                  if (token && authenticatedUser) {

                      setAuthToken(token);
                      setTelegramUser(user);

                      // Use the tokens_purchased value directly from the login response
                      const tokens = authenticatedUser.tokens_purchased ?? "0";
                      const userTokens = Number(tokens);
                      
                      if (!isNaN(userTokens)) {
                          setUserTokens(userTokens);
                          console.log("Successfully set user tokens from auth response:", userTokens);
                      } else {
                          setUserTokens(0);
                          console.error("Could not parse tokens_purchased into a number from auth response. Defaulting to 0.");
                      }
                  }
              } catch (error) {
                  console.error("Authentication failed:", error);
              }
          } else {
              console.warn("Telegram user data not found in initDataUnsafe.");
          }
      } else {
          console.warn("window.Telegram.WebApp is not available.");
      }
  };
  initialize();
}, []);

    // Effect to update the wallet address when a wallet is connected
    useEffect(() => {
        if (isConnected && connectedWalletAddress && telegramUser && authToken) {
            updateWalletAddress(telegramUser.id, connectedWalletAddress, authToken);
        }
    }, [isConnected, connectedWalletAddress, telegramUser, authToken, updateWalletAddress]);

    // Timer effect
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);
        return () => clearInterval(timer);
    }, [calculateTimeLeft]);




const fetchPresaleStatus = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/presale-status`, {
      headers: {
        'ngrok-skip-browser-warning': 'true',
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    console.log("Presale Status API Response:", response.data);

    setPresaleMetrics((prev) => ({
      ...prev,
      totalRaisedBNB: parseFloat(response.data.total_raised_bnb) || 0,
      totalRaisedUSD: parseFloat(response.data.total_raised_usd) || 0,
      totalRaised: parseFloat(response.data.total_raised_bnb) || 0,
    }));
  } catch (error) {
    console.error("Error fetching presale status:", error);
    
    // If there's an error, at least try to show some default values
    setPresaleMetrics((prev) => ({
      ...prev,
      totalRaisedBNB: 0,
      totalRaisedUSD: 0,
      totalRaised: 0,
    }));
  }
};



    useEffect(() => {
        fetchPresaleStatus();
        const intervalId = setInterval(fetchPresaleStatus, 60000);
        return () => clearInterval(intervalId);
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
          {/* Use flex-1 to make this element take up proportional space on the left */}
          <div className="flex-1 flex items-center space-x-3 mb-4 md:mb-0">
              <img src={HydroLogo} alt="Hydro Coin Logo" className="h-10 w-10" />
              <span className="text-xl md:text-2xl font-extrabold text-white">
                  HydroMine
              </span>
          </div>
          {/* The navigation will be moved out of the header */}
          <div className="flex-1 flex items-center space-x-4 justify-end">
              <WalletConnector />
              {telegramUser && (
                  <span className="text-sm text-white hidden md:block">
                      Welcome,{" "}
                      {telegramUser.first_name || telegramUser.username || "User"}!
                  </span>
              )}
          </div>
      </header>

      {/* NEW FLEX CONTAINER TO HOLD THE MAIN CONTENT AND THE BOTTOM MENU */}
      <div className="flex-grow flex flex-col justify-between w-full max-w-6xl">
          {/* Main content section - This will now fill the top space */}
          <main className="flex flex-col lg:flex-row items-center lg:items-start justify-center lg:justify-between space-y-8 lg:space-y-0 lg:space-x-8 z-10 p-4">
              <section className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-6 lg:w-1/2">
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
                      {timerComponents.length ? timerComponents : <span className="text-xl">Presale has ended!</span>}
                  </div>
                  <div className="w-full bg-blue-700 bg-opacity-50 py-2 px-4 rounded-lg text-center font-semibold text-lg">
                      UNTO PRICE INCREASE
                  </div>
                  <div className="w-full bg-blue-800 bg-opacity-30 p-4 rounded-lg flex flex-col items-center space-y-2 text-white text-lg font-medium">
                      <p>
                          TOTAL USD RAISED: $
                          {presaleMetrics.totalRaisedUSD.toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                          })}
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
                              userTokens={userTokens}
                              authToken={authToken}
                          />
                      )}
                      {activeTab === "airdrop" && <AirdropClaimer connectedWallet={connectedWalletAddress} />}
                      {activeTab === "tokenomics" && <TokenomicsInfo />}
                      {activeTab === "history" && (
                          <ContributionHistory
                              API_BASE_URL={API_BASE_URL}
                              authToken={authToken}
                              telegramUser={telegramUser}
                          />
                      )}
                  </div>
              </section>
          </main>

          {/* NEW BOTTOM NAVIGATION BAR */}
          <nav className="w-full bg-white bg-opacity-10 rounded-t-xl shadow-lg z-20 mt-8 md:hidden">
              <div className="flex justify-around items-center py-4 px-2">
                  {["presale", "airdrop", "tokenomics", "history"].map((tab) => (
                      <button
                          key={tab}
                          onClick={() => setActiveTab(tab)}
                          className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors duration-300 ${
                              activeTab === tab
                                  ? "bg-blue-600 text-white shadow-md"
                                  : "text-gray-200 hover:text-white hover:bg-white hover:bg-opacity-20"
                          }`}
                      >
                          {tab.charAt(0).toUpperCase() + tab.slice(1)}
                      </button>
                  ))}
              </div>
          </nav>
      </div>
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