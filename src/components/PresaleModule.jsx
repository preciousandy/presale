import React, { useState, useContext } from 'react';
import axios from 'axios';
import { TelegramUserContext } from '../App'; // Assuming you use context

function PresaleModule({ metrics, connectedWallet, onContributionSuccess, API_BASE_URL }) {
    const telegramUser = useContext(TelegramUserContext); // Get Telegram user from context
    const [amountToContribute, setAmountToContribute] = useState('');
    const [statusMessage, setStatusMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleContribute = async () => {
        if (!connectedWallet) {
            setStatusMessage("Please connect your wallet first.");
            return;
        }
        if (!telegramUser) {
            setStatusMessage("Telegram user data not available. Please restart the bot.");
            return;
        }
        if (isNaN(parseFloat(amountToContribute)) || parseFloat(amountToContribute) <= 0) {
            setStatusMessage("Please enter a valid amount.");
            return;
        }
        if (parseFloat(amountToContribute) < metrics.minBuy || parseFloat(amountToContribute) > metrics.maxBuy) {
            setStatusMessage(`Amount must be between ${metrics.minBuy} and ${metrics.maxBuy}.`);
            return;
        }

        setLoading(true);
        setStatusMessage("Simulating contribution...");

        try {
            // --- SIMULATED BLOCKCHAIN TRANSACTION ---
            // In a real app, this is where you'd interact with your presale smart contract
            // using ethers.js or web3.js to send BNB/SOL/USDT.
            // await yourPresaleContract.methods.buyTokens().send({ from: connectedWallet, value: amountToContribute });
            // For now, we call your Laravel API
            const response = await axios.post(`${API_BASE_URL}/simulate-contribution`, {
                telegram_user_id: telegramUser.id,
                wallet_address: connectedWallet,
                amount: parseFloat(amountToContribute),
            });
            setStatusMessage(`Success: ${response.data.message} (Tx: ${response.data.tx_hash})`);
            setAmountToContribute('');
            onContributionSuccess(); // Trigger parent to re-fetch presale status
        } catch (error) {
            console.error("Contribution error:", error);
            setStatusMessage(`Error: ${error.response?.data?.message || error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const calculatedHDC = amountToContribute ? (parseFloat(amountToContribute) / metrics.tokenPrice).toFixed(2) : '0.00';

    const progress = (metrics.totalRaised / metrics.hardCap) * 100;

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center text-blue-300">Presale Dashboard</h2>

            {/* Metrics Display */}
            <div className="grid grid-cols-2 gap-4 text-center bg-gray-700 p-4 rounded-lg shadow-inner">
                <div>
                    <p className="text-sm text-gray-400">Total Raised</p>
                    <p className="text-xl font-bold text-green-400">{metrics.totalRaised.toFixed(2)} TON</p>
                </div>
                <div>
                    <p className="text-sm text-gray-400">Soft Cap / Hard Cap</p>
                    <p className="text-xl font-bold">{metrics.softCap} / {metrics.hardCap} TON</p>
                </div>
                <div>
                    <p className="text-sm text-gray-400">Current Price</p>
                    <p className="text-xl font-bold text-yellow-400">1 TON = {1 / metrics.tokenPrice.toFixed(4)} $HDC</p>
                </div>
                <div>
                    <p className="text-sm text-gray-400">Min/Max Buy</p>
                    <p className="text-xl font-bold">{metrics.minBuy} / {metrics.maxBuy} TON</p>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-700 rounded-full h-4">
                <div
                    className="bg-blue-500 h-4 rounded-full"
                    style={{ width: `${Math.min(100, progress)}%` }}
                ></div>
            </div>
            <p className="text-sm text-center text-gray-400">{progress.toFixed(1)}% complete</p>


            {/* Token Purchase Module */}
            <div className="bg-gray-700 p-4 rounded-lg shadow-inner space-y-4">
                <h3 className="text-xl font-semibold text-blue-300">Buy $HDC Tokens</h3>
                <div className="flex flex-col">
                    <label htmlFor="amount" className="text-gray-300 text-sm mb-1">Amount (TON/BNB/SOL/USDT)</label>
                    <input
                        type="number"
                        id="amount"
                        placeholder={`Min ${metrics.minBuy} / Max ${metrics.maxBuy}`}
                        value={amountToContribute}
                        onChange={(e) => setAmountToContribute(e.target.value)}
                        step="0.1"
                        min={metrics.minBuy}
                        max={metrics.maxBuy}
                        className="p-2 rounded bg-gray-900 text-white border border-gray-600 focus:outline-none focus:border-blue-500"
                    />
                </div>
                <p className="text-sm text-gray-400">You will receive approximately: <span className="font-bold text-green-400">{calculatedHDC} $HDC</span></p>

                <button
                    onClick={handleContribute}
                    disabled={!connectedWallet || loading || !telegramUser || isNaN(parseFloat(amountToContribute)) || parseFloat(amountToContribute) <= 0}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Processing...' : 'Contribute Now'}
                </button>
                {statusMessage && (
                    <p className={`text-sm mt-2 text-center ${statusMessage.startsWith('Error') ? 'text-red-500' : 'text-green-400'}`}>
                        {statusMessage}
                    </p>
                )}
            </div>
        </div>
    );
}

export default PresaleModule;