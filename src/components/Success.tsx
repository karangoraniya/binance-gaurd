import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, ExternalLink } from "lucide-react";

interface TransactionSuccessProps {
  isOpen: boolean;
  onClose: () => void;
  hash: string;
}

const TransactionSuccess = ({
  isOpen,
  onClose,
  hash,
}: TransactionSuccessProps) => {
  const explorerUrl = `https://testnet.bscscan.com/tx/${hash}`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Transaction Sent!</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center space-y-4 py-4">
          <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
            <Check className="h-6 w-6 text-green-600" />
          </div>
          <p className="text-center text-sm text-muted-foreground">
            Your transaction has been successfully submitted to the network
          </p>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => window.open(explorerUrl, "_blank")}
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            View on Explorer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionSuccess;
