import React, { useEffect, useState } from "react";
import axios from "axios";
import { TelegramUser } from "../App";

interface Contribution {
  id: number;
  telegram_user_id: number;
  wallet_address: string;
  amount_contributed: number;
  simulated_tx_hash: string;
  created_at?: string;
}

interface ContributionHistoryProps {
  API_BASE_URL: string;
  authToken: string | null;
  telegramUser: TelegramUser | null;
}

const ContributionHistory: React.FC<ContributionHistoryProps> = ({
  API_BASE_URL,
  authToken,
  telegramUser,
}) => {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = async () => {
    if (!authToken || !telegramUser) {
      setLoading(false);
      setError("Missing authentication token or user data");
      return;
    }

    console.log("=== DEBUG INFO ===");
    console.log("API_BASE_URL:", API_BASE_URL);
    console.log("Auth Token:", authToken ? "Present" : "Missing");
    console.log("Telegram User ID:", telegramUser.id);

    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(
        `${API_BASE_URL}/api/contribution-history`,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'ngrok-skip-browser-warning': 'true',
            'Origin': 'https://b673c525e6d1.ngrok-free.app'
          },
          withCredentials: true, // Important: Enable credentials
          timeout: 10000, // 10 second timeout
        }
      );

      console.log("=== RESPONSE DEBUG ===");
      console.log("Status:", response.status);
      console.log("Content-Type:", response.headers['content-type']);
      console.log("Response data:", response.data);

      // Check if response is actually HTML
      if (typeof response.data === 'string' && response.data.trim().startsWith('<')) {
        console.error("RECEIVED HTML INSTEAD OF JSON!");
        setError("Server returned HTML page instead of JSON data. This might be an authentication or CORS issue.");
        return;
      }

      // Process the response
      if (response.data && typeof response.data === 'object') {
        if (Array.isArray(response.data.contributions)) {
          const formattedContributions = response.data.contributions.map((c: any) => ({
            ...c,
            amount_contributed: parseFloat(c.amount_contributed),
          }));
          setContributions(formattedContributions);
          setError(null);
        } else if (Array.isArray(response.data)) {
          const formattedContributions = response.data.map((c: any) => ({
            ...c,
            amount_contributed: parseFloat(c.amount_contributed),
          }));
          setContributions(formattedContributions);
          setError(null);
        } else {
          setContributions([]);
          setError("No contributions found or unexpected response format");
        }
      }
    } catch (err: any) {
      console.error("=== ERROR DEBUG ===");
      
      if (err.response) {
        console.error("Status:", err.response.status);
        console.error("Data:", err.response.data);
        
        if (err.response.status === 401) {
          setError("Authentication failed. Please try logging in again.");
        } else if (err.response.status === 403) {
          setError("Access denied. You don't have permission to view this data.");
        } else if (err.response.status === 404) {
          setError("API endpoint not found. Please check your backend configuration.");
        } else if (err.response.status >= 500) {
          setError("Server error. Please check your backend logs.");
        } else {
          setError(`Error ${err.response.status}: ${err.response.data?.message || 'Unknown error'}`);
        }
      } else if (err.request) {
        console.error("No response received:", err.request);
        setError("No response from server. Check your internet connection and CORS settings.");
      } else {
        console.error("Request setup error:", err.message);
        setError(`Request failed: ${err.message}`);
      }
      setContributions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [authToken, telegramUser]);

  if (loading) {
    return <div className="text-white text-center">Loading history...</div>;
  }

  if (error) {
    return (
      <div className="text-red-400 text-center">
        <div className="mb-2">{error}</div>
        <button 
          onClick={fetchHistory}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (contributions.length === 0) {
    return (
      <div className="text-white text-center">
        You have not made any contributions yet.
      </div>
    );
  }

  return (
    <div className="w-full">
      <h3 className="text-xl font-bold text-white mb-4 text-center">
        Your Contribution History
      </h3>
      <div className="overflow-x-auto rounded-lg">
        <table className="min-w-full text-sm text-left text-white bg-white bg-opacity-5">
          <thead className="text-xs text-gray-300 uppercase bg-blue-700 bg-opacity-50">
            <tr>
              <th scope="col" className="px-6 py-3">
                Amount (BNB)
              </th>
              <th scope="col" className="px-6 py-3">
                Wallet Address
              </th>
              <th scope="col" className="px-6 py-3">
                Date
              </th>
            </tr>
          </thead>
          <tbody>
            {contributions.map((c) => (
              <tr
                key={c.id}
                className="border-b border-gray-700 hover:bg-white hover:bg-opacity-10 transition-colors"
              >
                <td className="px-6 py-4">{c.amount_contributed}</td>
                <td className="px-6 py-4 font-mono">
                  {`${c.wallet_address.substring(0, 6)}...${c.wallet_address.substring(
                    c.wallet_address.length - 4
                  )}`}
                </td>
                <td className="px-6 py-4">
                  {c.created_at
                    ? new Date(c.created_at).toLocaleDateString()
                    : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ContributionHistory;