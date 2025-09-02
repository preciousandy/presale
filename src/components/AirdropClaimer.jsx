import React, { useState, useEffect } from 'react';
// import { useYourAirdropContract } from '../hooks/useYourAirdropContract'; // For real contract interaction

function AirdropClaimer({ connectedWallet }) {
    const [airdropStatus, setAirdropStatus] = useState('unclaimed'); // 'unclaimed', 'claimed', 'not_eligible'
    const [tokensAvailable, setTokensAvailable] = useState(0);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    // For a real DApp, you would use a hook to interact with your Airdrop Smart Contract
    // const { getClaimableAmount, claimTokens } = useYourAirdropContract();

    useEffect(() => {
        const checkEligibility = async () => {
            if (!connectedWallet) {
                setAirdropStatus('Please connect wallet');
                setTokensAvailable(0);
                return;
            }
            setLoading(true);
            setMessage("Checking eligibility...");
            try {
                // --- SIMULATED Airdrop Check ---
                // In a real app, you'd call a read function on your Airdrop Smart Contract:
                // const available = await getClaimableAmount(connectedWallet);
                // setTokensAvailable(available);
                // setAirdropStatus(available > 0 ? 'unclaimed' : 'not_eligible');

                // Simulate based on connected wallet for prototype
                await new Promise(resolve => setTimeout(resolve, 1500));
                const isEligible = Math.random() > 0.5; // 50% chance for prototype
                const available = isEligible ? Math.floor(Math.random() * 500) + 50 : 0; // Random tokens
                const hasClaimed = Math.random() > 0.8; // Simulate some claimed

                setTokensAvailable(available);
                if (available > 0 && !hasClaimed) {
                    setAirdropStatus('unclaimed');
                    setMessage(`You are eligible for ${available} $HDC.`);
                } else if (hasClaimed) {
                    setAirdropStatus('claimed');
                    setMessage('You have already claimed your airdrop.');
                }
                else {
                    setAirdropStatus('not_eligible');
                    setMessage('No airdrop found for this wallet.');
                }

            } catch (error) {
                console.error("Error checking airdrop eligibility:", error);
                setMessage("Error checking eligibility.");
                setAirdropStatus('error');
            } finally {
                setLoading(false);
            }
        };
        checkEligibility();
    }, [connectedWallet]); // Re-check when wallet changes

    const handleClaim = async () => {
        if (!connectedWallet || airdropStatus !== 'unclaimed' || tokensAvailable <= 0) {
            setMessage("Cannot claim. Not eligible or wallet not connected.");
            return;
        }
        setLoading(true);
        setMessage("Claiming tokens...");
        try {
            // --- SIMULATED CLAIM TRANSACTION ---
            // In a real app, this would call your Airdrop Smart Contract's claim function:
            // await claimTokens(); // This would trigger a transaction
            await new Promise(resolve => setTimeout(resolve, 2000));
            setAirdropStatus('claimed');
            setTokensAvailable(0);
            setMessage("Tokens claimed successfully!");
        } catch (error) {
            console.error("Error claiming airdrop:", error);
            setMessage(`Error claiming: ${error.message || "Please try again."}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 text-center">
            <h2 className="text-2xl font-bold text-blue-300">Airdrop Claim</h2>

            {!connectedWallet ? (
                <p className="text-red-400">Please connect your wallet to check airdrop eligibility.</p>
            ) : (
                <>
                    <div className="bg-gray-700 p-4 rounded-lg shadow-inner">
                        <p className="text-sm text-gray-400">Your Connected Wallet:</p>
                        <p className="text-md font-semibold break-all">{connectedWallet}</p>
                    </div>

                    <div className="bg-gray-700 p-4 rounded-lg shadow-inner">
                        <p className="text-sm text-gray-400">Airdrop Status:</p>
                        <p className={`text-xl font-bold ${airdropStatus === 'unclaimed' ? 'text-green-400' : airdropStatus === 'claimed' ? 'text-yellow-400' : 'text-red-400'}`}>
                            {loading ? 'Checking...' : airdropStatus.replace('_', ' ').toUpperCase()}
                        </p>
                    </div>

                    {airdropStatus === 'unclaimed' && tokensAvailable > 0 && (
                        <div className="bg-gray-700 p-4 rounded-lg shadow-inner">
                            <p className="text-sm text-gray-400">Tokens Available to Claim:</p>
                            <p className="text-3xl font-bold text-green-400">{tokensAvailable} $HDC</p>
                            <button
                                onClick={handleClaim}
                                disabled={loading}
                                className="mt-4 w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Claiming...' : 'Claim Your $HDC'}
                            </button>
                        </div>
                    )}

                    {message && (
                        <p className={`text-sm mt-2 ${message.startsWith('Error') ? 'text-red-500' : 'text-gray-300'}`}>
                            {message}
                        </p>
                    )}
                </>
            )}
        </div>
    );
}

export default AirdropClaimer;