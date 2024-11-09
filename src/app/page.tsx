"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Home,
  Activity,
  AppWindow,
  QrCode,
  RefreshCw,
  Send,
  ArrowDownToLine,
  RefreshCcw,
  DollarSign,
  Settings,
  Copy,
} from "lucide-react";
import {
  createPublicClient,
  createWalletClient,
  formatEther,
  http,
  parseEther,
} from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { bscTestnet } from "viem/chains";
import SendComponent from "@/components/Send";

// Create public client for balance checking
const publicClient = createPublicClient({
  chain: bscTestnet,
  transport: http(),
});

const WalletInterface = () => {
  const [hasWallet, setHasWallet] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [privateKey, setPrivateKey] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [balance, setBalance] = useState("0.00");
  const [bnbPrice, setBnbPrice] = useState("0.00");
  const [activeTab, setActiveTab] = useState("home");
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);

  useEffect(() => {
    const initWallet = async () => {
      try {
        const wallet = await checkExistingWallet();
        setIsLoading(false);
        const storedKey = localStorage.getItem("walletKey");
        const storedAddress = localStorage.getItem("walletAddress");

        if (storedKey && storedAddress) {
          setPrivateKey(storedKey);
          setWalletAddress(storedAddress);
          setHasWallet(true);
          await fetchBalance(storedAddress);
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Error initializing wallet:", error);
        setIsLoading(false);
      }
    };

    initWallet();
  }, []);

  // Function to fetch BNB balance
  const fetchBalance = async (address: any) => {
    try {
      const balanceWei = await publicClient.getBalance({ address });
      const balanceInBNB = formatEther(balanceWei);
      setBalance(parseFloat(balanceInBNB).toFixed(4));

      // In a real app, you'd fetch the actual BNB price from an API
      // For demo, we'll use a static price
      setBnbPrice("616.45"); // Example BNB price
    } catch (error) {
      console.error("Error fetching balance:", error);
    }
  };

  // Function to import wallet from private key

  const createWallet = async () => {
    try {
      const privateKey = generatePrivateKey();
      const account = privateKeyToAccount(privateKey);
      const address = account.address;

      // Store with 0x prefix
      localStorage.setItem("walletKey", privateKey);
      localStorage.setItem("walletAddress", address);

      setPrivateKey(privateKey);
      setWalletAddress(address);
      setHasWallet(true);

      await fetchBalance(address);
    } catch (error) {
      console.error("Error creating wallet:", error);
      throw error;
    }
  };

  const importWallet = async (inputKey: string) => {
    try {
      const formattedKey = inputKey.startsWith("0x")
        ? inputKey
        : `0x${inputKey}`;
      const account = privateKeyToAccount(formattedKey as `0x${string}`);
      const address = account.address;

      localStorage.setItem("walletKey", formattedKey);
      localStorage.setItem("walletAddress", address);

      setPrivateKey(formattedKey);
      setWalletAddress(address);
      setHasWallet(true);

      await fetchBalance(address);
    } catch (error) {
      console.error("Error importing wallet:", error);
      throw error;
    }
  };

  // Function to check if wallet exists

  const checkExistingWallet = async () => {
    const storedKey = localStorage.getItem("walletKey");
    const storedAddress = localStorage.getItem("walletAddress");

    if (storedKey && storedAddress) {
      try {
        const formattedKey = storedKey.startsWith("0x")
          ? storedKey
          : `0x${storedKey}`;
        const account = privateKeyToAccount(formattedKey as `0x${string}`);

        setPrivateKey(formattedKey);
        setWalletAddress(account.address);
        setHasWallet(true);
        await fetchBalance(account.address);

        return {
          privateKey: formattedKey,
          address: account.address,
        };
      } catch (error) {
        console.error("Error loading existing wallet:", error);
        localStorage.removeItem("walletKey");
        localStorage.removeItem("walletAddress");
        setHasWallet(false);
      }
    }
    return null;
  };

  const refreshWallet = async () => {
    if (walletAddress) {
      await fetchBalance(walletAddress);
    }
  };

  const handleSendTransaction = async (
    to: string,
    amount: string
  ): Promise<string> => {
    const storedKey = localStorage.getItem("walletKey");
    if (!storedKey) throw new Error("No wallet found");

    const account = privateKeyToAccount(storedKey as `0x${string}`);
    const client = createWalletClient({
      account,
      chain: bscTestnet,
      transport: http(),
    });

    const hash = await client.sendTransaction({
      to: to as `0x${string}`,
      value: parseEther(amount),
    });

    await refreshWallet();
    return hash; // Make sure to return the hash
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <RefreshCw className="animate-spin h-8 w-8" />
      </div>
    );
  }

  if (!hasWallet) {
    return (
      <div className="p-4 max-w-md mx-auto space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Create or Import Wallet</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full" onClick={createWallet}>
              Create New Wallet
            </Button>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <Input
                placeholder="Enter Private Key"
                type="password"
                onChange={(e) => setPrivateKey(e.target.value)}
              />
              <Button
                className="w-full"
                onClick={() => importWallet(privateKey)}
              >
                Import Wallet
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate USD value
  const bnbUsdValue = (parseFloat(balance) * parseFloat(bnbPrice)).toFixed(2);
  const shortAddress = `${walletAddress.slice(0, 6)}...${walletAddress.slice(
    -4
  )}`;

  const actionsSection = (
    <div className="grid grid-cols-4 gap-4 px-4">
      <Button variant="ghost" className="flex flex-col items-center">
        <ArrowDownToLine className="h-6 w-6 mb-1" />
        <span className="text-xs">Receive</span>
      </Button>
      <Button
        variant="ghost"
        className="flex flex-col items-center"
        onClick={() => setIsSendModalOpen(true)}
      >
        <Send className="h-6 w-6 mb-1" />
        <span className="text-xs">Send</span>
      </Button>
      <Button variant="ghost" className="flex flex-col items-center">
        <RefreshCcw className="h-6 w-6 mb-1" />
        <span className="text-xs">Swap</span>
      </Button>
      <Button variant="ghost" className="flex flex-col items-center">
        <DollarSign className="h-6 w-6 mb-1" />
        <span className="text-xs">Buy</span>
      </Button>
    </div>
  );

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="p-4 flex justify-between items-center border-b">
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
        </Button>
        <div className="flex items-center space-x-2">
          <span className="font-semibold">{shortAddress}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => {
              navigator.clipboard.writeText(walletAddress);
            }}
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex space-x-2">
          <Button variant="ghost" size="icon" onClick={refreshWallet}>
            <RefreshCw className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <QrCode className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Balance */}
      <div className="p-8 text-center">
        <h1 className="text-4xl font-bold">${bnbUsdValue}</h1>
        <p className="text-muted-foreground">Total Balance</p>
      </div>

      {/* Actions */}
      {actionsSection}

      {/* Asset List */}
      <div className="flex-1 overflow-auto px-4 py-2">
        <Card className="mb-2">
          <CardContent className="p-4 flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-yellow-500/10 rounded-full flex items-center justify-center">
                <span className="text-yellow-500 text-sm font-bold">BNB</span>
              </div>
              <div>
                <div className="font-semibold">BNB</div>
                <div className="text-sm text-muted-foreground">
                  {balance} BNB
                </div>
              </div>
            </div>
            <div className="text-right">
              <div>${bnbUsdValue}</div>
              <div className="text-sm text-muted-foreground">
                ${bnbPrice}/BNB
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Navigation */}
      <div className="border-t grid grid-cols-3 p-2">
        <Button
          variant="ghost"
          className="flex flex-col items-center"
          onClick={() => setActiveTab("home")}
        >
          <Home className="h-5 w-5 mb-1" />
          <span className="text-xs">Home</span>
        </Button>
        <Button
          variant="ghost"
          className="flex flex-col items-center"
          onClick={() => setActiveTab("activity")}
        >
          <Activity className="h-5 w-5 mb-1" />
          <span className="text-xs">Activity</span>
        </Button>
        <Button
          variant="ghost"
          className="flex flex-col items-center"
          onClick={() => setActiveTab("apps")}
        >
          <AppWindow className="h-5 w-5 mb-1" />
          <span className="text-xs">Apps</span>
        </Button>
      </div>
      <SendComponent
        isOpen={isSendModalOpen}
        onClose={() => setIsSendModalOpen(false)}
        balance={balance}
        onSend={handleSendTransaction}
      />
    </div>
  );
};

export default WalletInterface;
