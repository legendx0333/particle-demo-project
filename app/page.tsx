"use client";
import { ConnectButton, useAccount, useAddress, useSmartAccount, useConnect } from "@particle-network/connectkit";
import { AAWrapProvider, SendTransactionMode, Transaction } from "@particle-network/aa";
import { type Eip1193Provider, ethers, parseUnits } from 'ethers';
import { useCallback, useEffect, useMemo, useState } from "react";
import ABI from './ABI.json';
import VLRABI from './VLRABI.json';
import { Interface } from "ethers";

const NFT_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS!;
const VLR_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_VLR_CONTRACT_ADDRESS!;

const DEFAULT_IPFS_URI = "ipfs://QmYzp9Rnt9YUSujqJwauLH7SRThEz63jfqDhAaaW1VFuLN";
const SENDER_ADDRESS = "0xEF81ef2493525EC812F386465059D029691B8764";

console.log("VLR_CONTRACT_ADDRESS: ", VLR_CONTRACT_ADDRESS)

export default function Home() {
  const { isConnected } = useAccount();
  const address = useAddress();
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const { connect } = useConnect();

  const smartAccount = useSmartAccount();

  const provider = useMemo(() => smartAccount ? new ethers.BrowserProvider(new AAWrapProvider(smartAccount, SendTransactionMode.Gasless) as Eip1193Provider, "any") : null, [smartAccount]);

  const NFTContract = useMemo(() => new ethers.Contract(NFT_CONTRACT_ADDRESS, ABI, signer), [signer]);
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
    const amount = parseUnits("1", 18);
    const approveData = VLRContractInterface.encodeFunctionData('approve', [SENDER_ADDRESS, amount]);
    const transferData = VLRContractInterface.encodeFunctionData('transfer', [SENDER_ADDRESS, amount]);
    const txs: Transaction[] = [
      {
        to: VLR_CONTRACT_ADDRESS,
        data: approveData
      },
      {
        to: VLR_CONTRACT_ADDRESS,
        data: transferData
      }
    ];

    console.log("txs: ", txs);
    const feeQuotesResult = await smartAccount.getFeeQuotes(txs);

    const gaslessUserOp = feeQuotesResult.verifyingPaymasterGasless?.userOp;
    const gaslessUserOpHash = feeQuotesResult.verifyingPaymasterGasless?.userOpHash;

    const txHash = await smartAccount.sendUserOperation({ userOp: gaslessUserOp!, userOpHash: gaslessUserOpHash! });

    console.log("txHash: ", txHash);
    return txHash;
  }, [smartAccount])


  return (
    <div className='w-screen h-screen flex justify-center items-center flex-col gap-4'>
      <ConnectButton />
      {
        isConnected && (
          <>
            <h2>Address: {address}</h2>
          </>
        )
      }
      {
        isConnected && (
          <>
            <button className='p-4 bg-gray-300 rounded-lg' onClick={handleMint}>Mint</button>

            <div>1 VLR to send {SENDER_ADDRESS}</div>
            <button className='p-4 bg-gray-300 rounded-lg' onClick={tokenTransfer}>Transfer</button>
          </>
        )
      }
    </div>
  );
}
