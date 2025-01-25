"use client";
import { ConnectButton, useAccount, useAddress, useSmartAccount } from "@particle-network/connectkit";
import { AAWrapProvider, SendTransactionMode } from "@particle-network/aa"; 
import { type Eip1193Provider, ethers } from 'ethers';
import { useCallback, useEffect, useMemo, useState } from "react";
import ABI from './ABI.json';

const NFT_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS!;
const DEFAULT_IPFS_URI = "ipfs://QmYzp9Rnt9YUSujqJwauLH7SRThEz63jfqDhAaaW1VFuLN";

export default function Home() {
  const { isConnected } = useAccount();
  const address = useAddress();
  const [signer, setSigner] = useState<ethers.Signer | null>(null);

  const smartAccount = useSmartAccount();

  const provider = useMemo(() => smartAccount ? new ethers.BrowserProvider(new AAWrapProvider(smartAccount, SendTransactionMode.Gasless) as Eip1193Provider, "any") : null, [smartAccount]);

  const NFTContract = useMemo(() => new ethers.Contract(NFT_CONTRACT_ADDRESS, ABI, signer), [signer]);

  useEffect(() => {
    if(!provider) return;
    provider.getSigner().then(setSigner);
  }, [provider]);

  const handleMint = useCallback(async () => {
    try {
      if(!NFTContract) return;
      const tx = await NFTContract.createMultiToken([DEFAULT_IPFS_URI]);
      const { hash } = await tx.wait();
      console.log("Mint hash:", hash);
    } catch (error) {
      console.error("Mint Error:", error);
    }
  }, [NFTContract]);

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
          <button className='p-4 bg-gray-300 rounded-lg' onClick={handleMint}>Mint</button>
        )
      }
    </div>
  );
}
