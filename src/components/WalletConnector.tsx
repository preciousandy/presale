import React from 'react';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { useAccount } from 'wagmi';

function WalletConnector() {
  // Use the useWeb3Modal hook to open the modal
  const { open } = useWeb3Modal();
  // Use the useAccount hook to get the connected wallet status
  const { address, isConnected } = useAccount();

  // Helper to shorten the address for display
  const truncateAddress = (addr: string) =>
    `${addr.slice(0, 4)}...${addr.slice(-4)}`;

  return (
    <div>
      {isConnected ? (
        <button
          onClick={() => open()}
          className="bg-green-500 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 hover:bg-green-600"
        >
          {truncateAddress(address)}
        </button>
      ) : (
        <button
          onClick={() => open()}
          className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 hover:bg-blue-700"
        >
          Connect Wallet
        </button>
      )}
    </div>
  );
}

export default WalletConnector;