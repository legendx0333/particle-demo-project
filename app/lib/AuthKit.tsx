
'use client';

// Particle imports
import {
  AuthCoreContextProvider,
  PromptSettingType,
} from '@particle-network/authkit';
import { polygon } from '@particle-network/authkit/chains'; // Chains are imported here
import { EntryPosition } from '@particle-network/wallet';

const VLR_CONTRACT_ADDRESS = '0x221d160BA7E3552FeE22A33B3982AD408C3D6E65';
const NFT_CONTRACT_ADDRESS = '0x59350e35D077e43b05c93a86ea29A0c7fb023a9F';

export const ParticleAuthkit = ({ children }: React.PropsWithChildren) => {

  return (
    <AuthCoreContextProvider
      options={{
        projectId: process.env.NEXT_PUBLIC_PARTICLE_PROJECT_ID!,
        clientKey: process.env.NEXT_PUBLIC_PARTICLE_CLIENT_KEY!,
        appId: process.env.NEXT_PUBLIC_PARTICLE_APP_ID!,
        // authTypes: [AuthType.email, AuthType.google, AuthType.twitter, AuthType.github],
        themeType: 'dark',
        // List the chains you want to include
        chains: [polygon],
        erc4337: {
          name: 'SIMPLE',
          version: '1.0.0',
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

