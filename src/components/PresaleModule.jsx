import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios'; // Add axios import back in
import { parseEther } from 'viem';
import { useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { TelegramUserContext } from '../App';

function PresaleModule({ metrics, connectedWallet, onContributionSuccess, API_BASE_URL }) {
    const telegramUser = useContext(TelegramUserContext);
    const [amountToContribute, setAmountToContribute] = useState('');
    const [statusMessage, setStatusMessage] = useState('');
    const [loading, setLoading] = useState(false);

    
    const PRESALE_CONTRACT_ADDRESS = '0x12E220045a26B4Ac2333cEDB715B5f3df982A70B'; 

    // 1. Prepare the transaction using Wagmi's useSendTransaction
    const { 
        data: hash, 
        sendTransactionAsync, 
        isPending, 
        error: sendError 
    } = useSendTransaction();

    // 2. Wait for the transaction to be confirmed
    const { 
        data: receipt, 
        isLoading: isConfirming, 
        isSuccess: isConfirmed, 
        error: confirmError 
    } = useWaitForTransactionReceipt({
        hash,
    });

    
    const handleContribute = async () => {
        // Validation checks
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

        // Check if the address is set
        if (!PRESALE_CONTRACT_ADDRESS || PRESALE_CONTRACT_ADDRESS.length !== 42) {
             setStatusMessage("Presale address is not configured correctly.");
             return;
        }

        setStatusMessage("Awaiting wallet confirmation...");
        setLoading(true);

        try {
            const value = parseEther(amountToContribute);
            
            await sendTransactionAsync({
                to: PRESALE_CONTRACT_ADDRESS,
                value: value,
            });

            setStatusMessage("Transaction sent! Waiting for confirmation...");
        } catch (err) {
            console.error("Transaction failed:", err);
            setStatusMessage(`Error: ${err.shortMessage || err.message}`);
            setLoading(false);
        }
    };
    
    useEffect(() => {
        if (isConfirmed && receipt) {
            setStatusMessage(`Success! Transaction confirmed. Your TX Hash is: ${receipt.transactionHash}`);
            setLoading(false);
            onContributionSuccess(); 

            axios.post(`${API_BASE_URL}/record-contribution`, {
                telegram_user_id: telegramUser.id,
                wallet_address: connectedWallet,
                amount: parseFloat(amountToContribute),
                tx_hash: receipt.transactionHash 
            }).catch(backendError => {
                console.error("Failed to record contribution on backend:", backendError);
            });
        }
    }, [isConfirmed, receipt, amountToContribute, connectedWallet, telegramUser, onContributionSuccess, API_BASE_URL]);

    // Handle errors from the send transaction hook
    useEffect(() => {
        if (sendError) {
            setStatusMessage(`Error sending transaction: ${sendError.shortMessage || sendError.message}`);
            setLoading(false);
        }
        if (confirmError) {
            setStatusMessage(`Error confirming transaction: ${confirmError.message}`);
            setLoading(false);
        }
    }, [sendError, confirmError]);

    // Add a check to prevent rendering with incomplete data, which can also cause errors.
    if (!metrics) {
        return <div className="text-center text-gray-400">Loading presale data...</div>;
    }

    const calculatedHDC = amountToContribute ? (parseFloat(amountToContribute) / metrics.tokenPrice).toFixed(2) : '0.00';
    const progress = (metrics.totalRaised / metrics.hardCap) * 100;

    const buttonText = isPending || isConfirming
      ? 'Processing...'
      : loading
        ? 'Awaiting Wallet'
        : 'Contribute Now';

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center text-blue-300">Presale Dashboard</h2>
            
            {/* ... rest of the component (metrics, progress bar, etc.) remains the same ... */}
             <div className="grid grid-cols-2 gap-4 text-center bg-gray-700 p-4 rounded-lg shadow-inner">
                <div>
                    <p className="text-sm text-gray-400">Total Raised</p>
                    <p className="text-xl font-bold text-green-400">{metrics.totalRaised.toFixed(2)} BNB</p>
                </div>
                <div>
                    <p className="text-sm text-gray-400">Soft Cap / Hard Cap</p>
                    <p className="text-xl font-bold">{metrics.softCap} / {metrics.hardCap} BNB</p>
                </div>
                <div>
                    <p className="text-sm text-gray-400">Current Price</p>
                    <p className="text-xl font-bold text-yellow-400">1 BNB = { (1 / metrics.tokenPrice).toFixed(0)} $HDC</p>
                </div>
                <div>
                    <p className="text-sm text-gray-400">Min/Max Buy</p>
                    <p className="text-xl font-bold">{metrics.minBuy} / {metrics.maxBuy} BNB</p>
                </div>
            </div>

            <div className="w-full bg-gray-700 rounded-full h-4">
                <div
                    className="bg-blue-500 h-4 rounded-full"
                    style={{ width: `${Math.min(100, progress)}%` }}
                ></div>
            </div>
            <p className="text-sm text-center text-gray-400">{progress.toFixed(1)}% complete</p>

            <div className="bg-gray-700 p-4 rounded-lg shadow-inner space-y-4">
                <h3 className="text-xl font-semibold text-blue-300">Buy $HDC Tokens</h3>
                <div className="flex flex-col">
                    <label htmlFor="amount" className="text-gray-300 text-sm mb-1">Amount (BNB)</label>
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
                    disabled={!connectedWallet || loading || !telegramUser || isNaN(parseFloat(amountToContribute)) || parseFloat(amountToContribute) <= 0 || isPending || isConfirming}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {buttonText}
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