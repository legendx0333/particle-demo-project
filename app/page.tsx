"use client";
import {
  ConnectButton,
  useAccount,
  //useAddress,
  useSmartAccount,
} from "@particle-network/connectkit";
import {
  AAWrapProvider,
  SendTransactionMode,
  Transaction,
} from "@particle-network/aa";
import { type Eip1193Provider, ethers, parseUnits } from "ethers";
import { useCallback, useEffect, useMemo, useState } from "react";
import ABI from "./ABI.json";
import VLRABI from "./VLRABI.json";
import { Interface } from "ethers";

const NFT_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS!;
const VLR_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_VLR_CONTRACT_ADDRESS!;

const DEFAULT_IPFS_URI =
  "ipfs://QmYzp9Rnt9YUSujqJwauLH7SRThEz63jfqDhAaaW1VFuLN";
//const SENDER_ADDRESS = "0xEF81ef2493525EC812F386465059D029691B8764";
const RECEIVER_ADDRESS = "0xf25DADF841518A2cb516307876CE44F416661085"; // EDIT THIS

console.log("VLR_CONTRACT_ADDRESS: ", VLR_CONTRACT_ADDRESS);

export default function Home() {
  const { isConnected } = useAccount();
  //const address = useAddress();

  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [smartAccountAddress, setSmartAccountAddress] = useState<string | null>(
    null
  );

  const [txsString, setTxsString] = useState<string | null>(null);
  const [feeQuotesString, setFeeQuotesString] = useState<string | null>(null);

  const smartAccount = useSmartAccount();

  useEffect(() => {
    if (smartAccount) {
      smartAccount
        .getAddress()
        .then((address) => {
          setSmartAccountAddress(address);
          console.log("@SMART_ADDRESS:", smartAccountAddress);
        })
        .catch((error) => console.error("Error getting address:", error));
    }
  }, [smartAccount, smartAccountAddress]);

  const provider = useMemo(
    () =>
      smartAccount
        ? new ethers.BrowserProvider(
            new AAWrapProvider(
              smartAccount,
              SendTransactionMode.Gasless
            ) as Eip1193Provider,
            "any"
          )
        : null,
    [smartAccount]
  );

  const NFTContract = useMemo(
    () => new ethers.Contract(NFT_CONTRACT_ADDRESS, ABI, signer),
    [signer]
  );
  const VLRContractInterface = useMemo(() => new Interface(VLRABI), []);

  useEffect(() => {
    if (!provider) return;
    provider.getSigner().then(setSigner);
  }, [provider]);

  const handleMint = useCallback(async () => {
    try {
      if (!NFTContract) return;
      const tx = await NFTContract.createMultiToken([DEFAULT_IPFS_URI]);
      const { hash } = await tx.wait();
      console.log("Mint hash:", hash);
    } catch (error) {
      console.error("Mint Error:", error);
    }
  }, [NFTContract]);

  const tokenTransfer = useCallback(async () => {
    if (!smartAccount) return;

    try {
      const amount = parseUnits("0.1", 6);
      const approveData = VLRContractInterface.encodeFunctionData("approve", [
        smartAccountAddress,
        amount,
      ]);
      const transferData = VLRContractInterface.encodeFunctionData("transfer", [
        RECEIVER_ADDRESS,
        amount,
      ]);

      const txs: Transaction[] = [
        {
          to: VLR_CONTRACT_ADDRESS,
          data: approveData,
        },
        {
          to: VLR_CONTRACT_ADDRESS,
          data: transferData,
        },
      ];

      setTxsString(JSON.stringify(txs, null, 4));
      console.log("@TRANSACTIONS: ", txs);

      const feeQuotesResult = await smartAccount.getFeeQuotes(txs);
      console.log("@FEE_QUOTES", feeQuotesResult);

      setFeeQuotesString(JSON.stringify(feeQuotesResult, null, 4));

      const gaslessUserOp = feeQuotesResult.verifyingPaymasterGasless?.userOp;
      const gaslessUserOpHash =
        feeQuotesResult.verifyingPaymasterGasless?.userOpHash;

      if (!gaslessUserOp || !gaslessUserOpHash) {
        throw new Error("Gasless user operation or hash is undefined.");
      }

      const txHash = await smartAccount.sendUserOperation({
        userOp: gaslessUserOp,
        userOpHash: gaslessUserOpHash,
      });

      console.log("txHash: ", txHash);
      return txHash;
    } catch (error) {
      console.error("Token transfer failed:", error);
      alert(`Transaction failed: ${error}`);
    }
  }, [smartAccount, VLRContractInterface, smartAccountAddress]);

  return (
    <div className="w-screen h-screen flex justify-center items-center flex-col gap-4">
      <ConnectButton />
      {isConnected && (
        <>
          <h2>Address: {smartAccountAddress}</h2>
        </>
      )}
      {isConnected && (
        <>
          <button className="p-4 bg-gray-300 rounded-lg" onClick={handleMint}>
            Mint
          </button>

          <div>Send 1 token to {RECEIVER_ADDRESS}</div>
          <div>Sender Address {smartAccountAddress}</div>
          <button
            className="p-4 bg-gray-300 rounded-lg"
            onClick={tokenTransfer}
          >
            Transfer
          </button>

          {txsString && (
            <div className="p-4 bg-gray-100 rounded-lg w-1/2 text-xs overflow-x-auto">
              <h3 className="font-bold">Transactions:</h3>
              <pre className="whitespace-pre-wrap">{txsString}</pre>
            </div>
          )}

          {feeQuotesString && (
            <div className="p-4 bg-gray-100 rounded-lg w-1/2 text-xs overflow-x-auto">
              <h3 className="font-bold">Fee Quotes:</h3>
              <pre className="whitespace-pre-wrap">{feeQuotesString}</pre>
            </div>
          )}
        </>
      )}
    </div>
  );
}
