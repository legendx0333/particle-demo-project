'use client';

import { ConnectKitProvider, createConfig } from '@particle-network/connectkit';
import { aa } from '@particle-network/connectkit/aa';
import { authWalletConnectors } from '@particle-network/connectkit/auth';
import { defineChain, polygon, base } from '@particle-network/connectkit/chains';
import { evmWalletConnectors } from '@particle-network/connectkit/evm';
import { EntryPosition, wallet } from '@particle-network/connectkit/wallet';
import React from 'react';

//Retrived from https://dashboard.particle.network
const projectId = process.env.NEXT_PUBLIC_PARTICLE_PROJECT_ID!;
const clientKey = process.env.NEXT_PUBLIC_PARTICLE_CLIENT_KEY!;
const appId = process.env.NEXT_PUBLIC_PARTICLE_APP_ID!;
const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!;
const VLR_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_VLR_CONTRACT_ADDRESS;
const NFT_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS;

if (!projectId || !clientKey || !appId) {
    throw new Error('Please configure the Particle project in .env first!');
}

const customPolygon = defineChain({
    id: base.id,
    name: base.name,
    nativeCurrency: base.nativeCurrency,
    blockExplorers: base.blockExplorers,
    rpcUrls: {
        default: {
            http: [process.env.NEXT_PUBLIC_POLYGON_RPC_URL!],
            ws: [process.env.NEXT_PUBLIC_POLYGON_WS_URL!],
        }
    },
})

const config = createConfig({
    projectId,
    clientKey,
    appId,
    appearance: {
        // Optional, collection of properties to alter the appearance of the connection modal
        // Optional, label and sort wallets (to be shown in the connection modal)
        recommendedWallets: [
            { walletId: 'metaMask', label: 'Recommended' },
            { walletId: 'coinbaseWallet', label: 'popular' },
        ],
        language: 'en-US', // Optional, also supported ja-JP, zh-CN, zh-TW, and ko-KR
    },
    walletConnectors: [
        evmWalletConnectors({
            metadata: { name: 'My App', icon: '', description: '', url: '' }, // Optional, this is Metadata used by WalletConnect and Coinbase
            walletConnectProjectId: walletConnectProjectId, // optional, retrieved from https://cloud.walletconnect.com
        }),
        authWalletConnectors({
            // Optional, configure this if you're using social logins
            authTypes: ['email', 'google', 'apple', 'twitter', 'github'], // Optional, restricts the types of social logins supported
            fiatCoin: 'USD', // Optional, also supports CNY, JPY, HKD, INR, and KRW
            promptSettingConfig: {
                // Optional, changes the frequency in which the user is asked to set a master or payment password
                // 0 = Never ask
                // 1 = Ask once
                // 2 = Ask always, upon every entry
                // 3 = Force the user to set this password
                promptMasterPasswordSettingWhenLogin: 1,
                promptPaymentPasswordSettingWhenSign: 1,
            },
        }),
    ],
    plugins: [
        wallet({
            // Optional configurations for the attached embedded wallet modal
            entryPosition: EntryPosition.MC, // Alters the position in which the modal button appears upon login
            visible: true, // Dictates whether or not the wallet modal is included/visible or not
            customStyle: {
                displayTokenAddresses: [VLR_CONTRACT_ADDRESS], // Display a custom token within the wallet modal
                priorityTokenAddresses: [VLR_CONTRACT_ADDRESS],
            },
        }),
        aa({
            name: 'SIMPLE',
            version: '2.0.0',
        })
    ],
    chains: [customPolygon],
});

// Export ConnectKitProvider to be used within your index or layout file (or use createConfig directly within those files).
export const ParticleConnectkit = ({ children }: React.PropsWithChildren) => {
    return <ConnectKitProvider config={config}>{children}</ConnectKitProvider>;
};
