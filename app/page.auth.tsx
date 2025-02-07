"use client";
import {
  AAWrapProvider,
  SendTransactionMode,
  SmartAccount,
} from '@particle-network/aa';
import { useConnect, useEthereum, useUserInfo } from "@particle-network/authkit";
import { Polygon } from '@particle-network/chains';
import { Eip1193Provider, ethers } from 'ethers';
import { useCallback, useEffect, useMemo, useState } from "react";
import ABI from './ABI.json';

const NFT_CONTRACT_ADDRESS = "0x59350e35D077e43b05c93a86ea29A0c7fb023a9F";
const DEFAULT_IPFS_URI = "ipfs://QmYzp9Rnt9YUSujqJwauLH7SRThEz63jfqDhAaaW1VFuLN";

export default function Home() {
  const { provider: particleProvider } = useEthereum();
  const { connect: particleConnect, disconnect: particleDisconnect, connected: particleConnected } = useConnect();
  const { userInfo } = useUserInfo();
  const [address, setAddress] = useState<string | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);

  const smartAccount = useMemo(() => new SmartAccount(particleProvider, {
    projectId: process.env.NEXT_PUBLIC_PARTICLE_PROJECT_ID!,
    clientKey: process.env.NEXT_PUBLIC_PARTICLE_CLIENT_KEY!,
    appId: process.env.NEXT_PUBLIC_PARTICLE_APP_ID!,
    aaOptions: {
      // biconomy: [{ chainId: Polygon.id, version: '1.0.0' }],
      // paymasterApiKeys: [{
      //   chainId: Polygon.id,
      //   apiKey: process.env.NEXT_PUBLIC_BICONOMY_DAPP_API_KEY!
      // }]
      accountContracts: {
        SIMPLE: [
          {
            version: '2.0.0', // SIMPLE allows 1.0.0 for and 2.0.0
            chainIds: [Polygon.id],
          },
        ]
      }
    }
  }), [particleProvider]);

  const ethersProvider = useMemo(() => new ethers.BrowserProvider(
    new AAWrapProvider(smartAccount, SendTransactionMode.Gasless) as Eip1193Provider,
    'any'
  ), [smartAccount]);

  useEffect(() => {
    if (!particleConnected || !ethersProvider || !smartAccount) return;
    ethersProvider
      .getSigner()
      .then(setSigner);

    smartAccount
      .getAddress()
      .then(add => {
        console.log(add);
        setAddress(add);
      });
  }, [particleConnected]);

  const connectParticle = useCallback(async () => {
    await particleConnect();
  }, []);

  const NFTContract = useMemo(() => new ethers.Contract(NFT_CONTRACT_ADDRESS, ABI, signer), [signer]);

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

  return (
    <div className='w-screen h-screen flex justify-center items-center flex-col gap-4'>
      {
        particleConnected
          ? <button className='p-4 bg-gray-300 rounded-lg' onClick={particleDisconnect}>Disconnect Particle</button>
          : <button className='p-4 bg-gray-300 rounded-lg' onClick={connectParticle}>Connect Particle</button>
      }
      {
        userInfo
          ? <div className='mt-4 flex flex-col gap-4'>
            <p>{userInfo.thirdparty_user_info?.user_info.email}</p>
            <p>{address}</p>
          </div>
          : null
      }
      {
        particleConnected && (
          <button className='p-4 bg-gray-300 rounded-lg' onClick={handleMint}>Mint</button>
        )
      }
    </div>
  );
}
