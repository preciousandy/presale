import React from 'react';
// You might use a charting library like Chart.js or Recharts here for actual charts
// For prototype, we'll just list percentages or use a simple visual representation.

function TokenomicsInfo() {
    // --- Hardcoded Tokenomics Data (for prototype) ---
    const tokenomicsData = {
        totalSupply: "1,000,000,000", // 1 Billion $HDC
        contractAddress: "0xPrototypeHDCContractAddress", // Replace with your actual deployed token contract address
        lockingSchedule: "Team: 24-month linear vesting after 6-month cliff. Marketing: 12-month linear vesting. Presale: 100% at TGE.",
        distributionPlan: [
            { label: "Presale", percentage: 40, color: "bg-blue-500" },
            { label: "Mining Rewards", percentage: 30, color: "bg-green-500" },
            { label: "Team", percentage: 15, color: "bg-purple-500" },
            { label: "Marketing & Partnerships", percentage: 10, color: "bg-yellow-500" },
            { label: "Liquidity", percentage: 5, color: "bg-red-500" },
        ],
        // Add more details as needed: whitepaper link, audit link, etc.
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center text-blue-300">Tokenomics & Info</h2>

            {/* Token Details */}
            <div className="bg-gray-700 p-4 rounded-lg shadow-inner space-y-2">
                <h3 className="text-xl font-semibold text-blue-200">Token Details</h3>
                <p><span className="font-bold">Total Supply:</span> {tokenomicsData.totalSupply} $HDC</p>
                <p><span className="font-bold">Contract Address:</span> <span className="break-all text-sm text-green-400">{tokenomicsData.contractAddress}</span></p>
                <p><span className="font-bold">Locking Schedule:</span> {tokenomicsData.lockingSchedule}</p>
            </div>

            {/* Allocation Chart (Simple Bar Representation for Prototype) */}
            <div className="bg-gray-700 p-4 rounded-lg shadow-inner">
                <h3 className="text-xl font-semibold text-blue-200 mb-4">Token Allocation</h3>
                <div className="space-y-3">
                    {tokenomicsData.distributionPlan.map((item, index) => (
                        <div key={index} className="flex items-center">
                            <div className={`w-4 h-4 rounded-full ${item.color} mr-3`}></div>
                            <div className="flex-grow">
                                <p className="text-md font-medium">{item.label}</p>
                                <div className="w-full bg-gray-600 rounded-full h-3">
                                    <div
                                        className={`${item.color} h-3 rounded-full`}
                                        style={{ width: `${item.percentage}%` }}
                                    ></div>
                                </div>
                            </div>
                            <span className="ml-3 font-bold">{item.percentage}%</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Add more info sections if needed, e.g., Roadmp, Team, Audits */}
        </div>
    );
}

export default TokenomicsInfo;