
'use client';

// Particle imports
import {
  AuthCoreContextProvider,
  PromptSettingType,
} from '@particle-network/authkit';
import { polygon } from '@particle-network/authkit/chains'; // Chains are imported here
import { EntryPosition } from '@particle-network/wallet';

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID!;
const clientKey = process.env.NEXT_PUBLIC_CLIENT_KEY!;
const appId = process.env.NEXT_PUBLIC_APP_ID!;
const VLR_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_VLR_CONTRACT_ADDRESS;
const NFT_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS;

export const ParticleAuthkit = ({ children }: React.PropsWithChildren) => {

  return (
    <AuthCoreContextProvider
      options={{
        projectId: projectId!,
        clientKey: clientKey!,
        appId: appId!,
        // authTypes: [AuthType.email, AuthType.google, AuthType.twitter, AuthType.github],
        themeType: 'dark',
        // List the chains you want to include
        chains: [polygon],
        erc4337: {
          name: 'SIMPLE',
          version: '2.0.0',
        },
        
        // erc4337: {
        //   name: 'BICONOMY',
        //   version: '1.0.0',
        // },

        customStyle: {
          logo: '/advalorem_mark.png',
          projectName: '',
          subtitle: 'Login to Advalorem to continue'
        },

        supportEIP6963: true,

        // You can prompt the user to set up extra security measures upon login or other interactions
        promptSettingConfig: {
          promptPaymentPasswordSettingWhenSign: PromptSettingType.none,
          promptMasterPasswordSettingWhenLogin: PromptSettingType.none,
        },

        wallet: {
          themeType: 'dark', // Wallet modal theme
          // Set to false to remove the embedded wallet modal
          visible: true,
          preload: true,
          entryPosition: EntryPosition.BR,
          topMenuType: 'close',
          customStyle: {
            supportUIModeSwitch: false,
            supportLanguageSwitch: false,
            evmSupportWalletConnect: true,
            displayTokenAddresses: [VLR_CONTRACT_ADDRESS!],
            priorityTokenAddresses: [VLR_CONTRACT_ADDRESS!],
            displayNFTContractAddresses: [NFT_CONTRACT_ADDRESS!],
            priorityNFTContractAddresses: [NFT_CONTRACT_ADDRESS!],
            supportAddToken: true,
          },
        },
      }}
    >
      {children}
    </AuthCoreContextProvider>
  );
};

