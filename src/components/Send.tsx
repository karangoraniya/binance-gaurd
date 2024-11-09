"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { QrCode, X, Send as SendIcon } from "lucide-react";
import { parseEther, formatEther } from "viem";
import { Html5QrcodeScanner } from "html5-qrcode";
import toast from "react-hot-toast";
import TransactionSuccess from "./Success";

interface SendComponentProps {
  isOpen: boolean;
  onClose: () => void;
  recipientAddress?: string;
  defaultAmount?: string;
  balance: string;
  onSend: (to: string, amount: string) => Promise<string>;
}

const SendComponent = ({
  isOpen,
  onClose,
  recipientAddress = "",
  defaultAmount = "",
  balance,
  onSend,
}: SendComponentProps) => {
  const [address, setAddress] = useState(recipientAddress);
  const [amount, setAmount] = useState(defaultAmount);
  const [isScanning, setIsScanning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState<string>("");
  const [showSuccess, setShowSuccess] = useState(false);

  // Reset states when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      // Reset states when opening send modal
      setAddress(recipientAddress);
      setAmount(defaultAmount);
      setIsScanning(false);
      setIsLoading(false);
      setTxHash("");
      setShowSuccess(false);
    }
  }, [isOpen, recipientAddress, defaultAmount]);

  const initQRScanner = () => {
    setIsScanning(true);
    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    );

    scanner.render(
      (decodedText) => {
        setAddress(decodedText);
        scanner.clear();
        setIsScanning(false);
      },
      (error) => {
        console.warn("QR Scan Error:", error);
      }
    );
  };

  const handleSend = async () => {
    if (!address || !amount) return;

    try {
      setIsLoading(true);
      const hash = await onSend(address, amount);
      console.log("Transaction hash received:", hash);
      setTxHash(hash);
      // Close send modal first
      onClose();
      // Then show success modal
      setTimeout(() => {
        setShowSuccess(true);
      }, 100);
    } catch (error: any) {
      console.error("Send error:", error);
      toast.error(error.message || "Error sending transaction");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    setTxHash("");
    // Reset other states
    setAddress("");
    setAmount("");
    setIsLoading(false);
    setIsScanning(false);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send BNB</DialogTitle>
          </DialogHeader>
          <Card className="border-0 shadow-none">
            <CardContent className="space-y-4 p-0">
              <div className="space-y-2">
                <label className="text-sm font-medium">Recipient Address</label>
                <div className="flex space-x-2">
                  <Input
                    placeholder="0x..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                  <Button variant="outline" size="icon" onClick={initQRScanner}>
                    <QrCode className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {isScanning && <div id="qr-reader" className="w-full" />}

              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-sm font-medium">Amount (BNB)</label>
                  <span className="text-sm text-muted-foreground">
                    Balance: {parseFloat(balance).toFixed(4)} BNB
                  </span>
                </div>
                <Input
                  type="number"
                  placeholder="0.0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              <div className="flex justify-between gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setAmount(balance)}
                >
                  Max
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleSend}
                  disabled={!address || !amount || isLoading}
                >
                  {isLoading ? (
                    <div className="animate-spin">⭐</div>
                  ) : (
                    <>
                      <SendIcon className="mr-2 h-4 w-4" />
                      Send
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>

      {txHash && (
        <TransactionSuccess
          isOpen={showSuccess}
          onClose={handleSuccessClose}
          hash={txHash}
        />
      )}
    </>
  );
};

export default SendComponent;
