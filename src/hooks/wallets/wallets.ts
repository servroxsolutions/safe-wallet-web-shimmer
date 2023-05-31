import { CYPRESS_MNEMONIC, TREZOR_APP_URL, TREZOR_EMAIL, WC_BRIDGE } from '@/config/constants'
import { type RecommendedInjectedWallets, type WalletInit } from '@web3-onboard/common/dist/types.d'
import type { ChainInfo } from '@safe-global/safe-gateway-typescript-sdk'

import coinbaseModule from '@web3-onboard/coinbase'
import injectedWalletModule, { ProviderLabel } from '@web3-onboard/injected-wallets'
import keystoneModule from '@web3-onboard/keystone/dist/index'
import ledgerModule from '@web3-onboard/ledger'
import trezorModule from '@web3-onboard/trezor'
import walletConnect from '@web3-onboard/walletconnect'
import tallyhoModule from '@web3-onboard/tallyho'

import pairingModule from '@/services/pairing/module'
import e2eWalletModule from '@/tests/e2e-wallet'
import { CGW_NAMES, WALLET_KEYS } from './consts'

const WALLET_MODULES: { [key in WALLET_KEYS]: () => WalletInit } = {
  [WALLET_KEYS.INJECTED]: injectedWalletModule,
  [WALLET_KEYS.PAIRING]: pairingModule,
  [WALLET_KEYS.WALLETCONNECT]: () => walletConnect({ bridge: WC_BRIDGE }),
  [WALLET_KEYS.LEDGER]: ledgerModule,
  [WALLET_KEYS.TREZOR]: () => trezorModule({ appUrl: TREZOR_APP_URL, email: TREZOR_EMAIL }),
  [WALLET_KEYS.KEYSTONE]: keystoneModule,
  [WALLET_KEYS.TALLYHO]: tallyhoModule,
  [WALLET_KEYS.COINBASE]: () =>
    coinbaseModule({ darkMode: !!window?.matchMedia('(prefers-color-scheme: dark)')?.matches }),
}

export const getAllWallets = (): WalletInit[] => {
  return Object.values(WALLET_MODULES).map((module) => module())
}

export const getRecommendedInjectedWallets = (): RecommendedInjectedWallets[] => {
  return [{ name: ProviderLabel.MetaMask, url: 'https://metamask.io' }]
}

export const isWalletSupported = (disabledWallets: string[], walletLabel: string): boolean => {
  const legacyWalletName = CGW_NAMES?.[walletLabel.toUpperCase() as WALLET_KEYS]
  return !disabledWallets.includes(legacyWalletName || walletLabel)
}

export const getSupportedWallets = (chain: ChainInfo): WalletInit[] => {
  if (window.Cypress && CYPRESS_MNEMONIC) {
    return [e2eWalletModule(chain.rpcUri)]
  }
  const enabledWallets = Object.entries(WALLET_MODULES).filter(([key]) => isWalletSupported(chain.disabledWallets, key))

  if (enabledWallets.length === 0) {
    return [WALLET_MODULES.INJECTED()]
  }

  return enabledWallets.map(([, module]) => module())
}
