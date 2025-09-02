import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
// Import the provider and hooks from the TON Connect library
import { TonConnectUIProvider, useTonAddress } from '@tonconnect/ui-react';
import WalletConnector from './components/WalletConnector';
import PresaleModule from './components/PresaleModule';
import AirdropClaimer from './components/AirdropClaimer';
import TokenomicsInfo from './components/TokenomicsInfo';
import './web3modal-styles.css';

import HydroLogo from './assets/logo.png';

//const API_BASE_URL = "http://localhost:8000/api";

interface TelegramUser {
    id: number;
    first_name?: string;
    last_name?: string;
    username?: string;
    language_code?: string;
    is_bot?: boolean;
}

export const TelegramUserContext = React.createContext<TelegramUser | null>(null);

// This component contains your app's main logic and UI.
// It's a child of TonConnectUIProvider, so it can use the hooks.
function AppContent() {
    const [telegramUser, setTelegramUser] = useState<TelegramUser | null>(null);
    const [activeTab, setActiveTab] = useState('presale');
    const [presaleMetrics, setPresaleMetrics] = useState({
        totalRaised: 0,
        softCap: 1000,
        hardCap: 5000,
        tokenPrice: 0.00075,
        minBuy: 0.1,
        maxBuy: 10,
    });
    const [targetDate] = useState(Date.now() + (3 * 24 * 60 * 60 * 1000));
    const [timeLeft, setTimeLeft] = useState<{ [key: string]: number }>({});

    // Use the hook to get the connected wallet address. It will be an empty string if not connected.
    const connectedWalletAddress = useTonAddress();

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

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);
        return () => clearInterval(timer);
    }, [calculateTimeLeft]);

    useEffect(() => {
        // --- Telegram User Logic (unchanged) ---
        if (window.Telegram && window.Telegram.WebApp) {
            const tg = window.Telegram.WebApp;
            tg.ready();
            tg.expand();

            if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
                setTelegramUser(tg.initDataUnsafe.user as TelegramUser);
            } else {
                console.warn("Telegram user data not found in initDataUnsafe.");
            }
        } else {
            console.warn("window.Telegram.WebApp is not available.");
        }
    }, []);

    const fetchPresaleStatus = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/presale-status`);
            setPresaleMetrics(prev => ({
                ...prev,
                totalRaised: response.data.total_raised || 0,
            }));
        } catch (error) {
            console.error("Error fetching presale status:", error);
        }
    };
    
    // Fetch initial status on component mount
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
                <span className="text-xs md:text-sm text-gray-300 mt-1 uppercase">{interval}</span>
            </div>
        );
    });

    return (
        <TelegramUserContext.Provider value={telegramUser}>
            <div className="min-h-screen flex flex-col items-center p-4 relative overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-20 h-20 bg-purple-500 opacity-20 rounded-full animate-bounce-slow"></div>
                <div className="absolute bottom-1/3 right-1/4 w-16 h-16 bg-blue-500 opacity-20 rounded-full animate-bounce-slow delay-500"></div>
                <div className="absolute top-1/2 right-1/3 w-24 h-24 bg-teal-500 opacity-20 rounded-full animate-bounce-slow delay-1000"></div>

                <header className="w-full max-w-6xl flex flex-col md:flex-row items-center justify-between py-4 px-6 bg-white bg-opacity-10 rounded-xl shadow-lg mb-8 z-20">
                    <div className="flex items-center space-x-3 mb-4 md:mb-0">
                        <img src={HydroLogo} alt="Hydro Coin Logo" className="h-10 w-10" />
                        <span className="text-xl md:text-2xl font-extrabold text-white">HydroMine</span>
                    </div>

                    <nav className="flex-grow flex justify-center space-x-6 mb-4 md:mb-0">
                        {['presale', 'airdrop', 'tokenomics'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`text-lg font-medium px-4 py-2 rounded-lg transition-colors duration-300 ${activeTab === tab ? 'bg-blue-600 text-white shadow-md' : 'text-gray-200 hover:text-white hover:bg-white hover:bg-opacity-20'}`}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </nav>

                    <div className="flex items-center space-x-4">
                        {/* WalletConnector no longer needs any props */}
                        <WalletConnector />
                        {telegramUser && (
                            <span className="text-sm text-white hidden md:block">
                                Welcome, {telegramUser.first_name || telegramUser.username || 'User'}!
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
                            Get the Best Next Gen Crypto Token of {new Date().getFullYear() + 1} Now!
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
                            <p>TOTAL USD RAISED: ${presaleMetrics.totalRaised.toLocaleString()}</p>
                            <p>1 $HYDRO = ${presaleMetrics.tokenPrice.toFixed(4)}</p>
                        </div>

                        <div className="w-full">
                            {activeTab === 'presale' && (
                                <PresaleModule
                                    metrics={presaleMetrics}
                                    // Pass the address from the hook directly
                                    connectedWallet={connectedWalletAddress}
                                    onContributionSuccess={fetchPresaleStatus}
                                    API_BASE_URL={API_BASE_URL}
                                />
                            )}
                            {activeTab === 'airdrop' && (
                                // Pass the address from the hook directly
                                <AirdropClaimer connectedWallet={connectedWalletAddress} />
                            )}
                            {activeTab === 'tokenomics' && (
                                <TokenomicsInfo />
                            )}
                        </div>
                    </section>
                </main>
            </div>
        </TelegramUserContext.Provider>
    );
}




function App() {
    return (
        
        <TonConnectUIProvider manifestUrl="https://8f3563cbe75e.ngrok-free.app/tonconnect-manifest.json">
            <AppContent />
        </TonConnectUIProvider>
    );
}

export default App;