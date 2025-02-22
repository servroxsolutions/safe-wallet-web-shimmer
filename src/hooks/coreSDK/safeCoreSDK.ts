import chains from '@/config/chains'
import { getWeb3ReadOnly } from '@/hooks/wallets/web3'
import { getSafeSingletonDeployment, getSafeL2SingletonDeployment } from '@servrox/safe-deployments-shimmer'
import ExternalStore from '@/services/ExternalStore'
import { Gnosis_safe__factory } from '@/types/contracts'
import { invariant } from '@/utils/helpers'
import type { JsonRpcProvider, Web3Provider } from '@ethersproject/providers'
import Safe from '@servrox/safe-core-sdk-shimmer'
import type { SafeVersion } from '@servrox/safe-core-sdk-types-shimmer'
import EthersAdapter from '@servrox/safe-ethers-lib-shimmer'
import type { SafeInfo } from '@safe-global/safe-gateway-typescript-sdk'
import { ethers } from 'ethers'
import semverSatisfies from 'semver/functions/satisfies'
import { isValidMasterCopy } from '@/services/contracts/safeContracts'

export const isLegacyVersion = (safeVersion: string): boolean => {
  const LEGACY_VERSION = '<1.3.0'
  return semverSatisfies(safeVersion, LEGACY_VERSION)
}

export const isValidSafeVersion = (safeVersion?: SafeInfo['version']): safeVersion is SafeVersion => {
  const SAFE_VERSIONS: SafeVersion[] = ['1.3.0', '1.2.0', '1.1.1', '1.0.0']
  return !!safeVersion && SAFE_VERSIONS.some((version) => semverSatisfies(safeVersion, version))
}

// `assert` does not work with arrow functions
export function assertValidSafeVersion<T extends SafeInfo['version']>(safeVersion?: T): asserts safeVersion {
  return invariant(isValidSafeVersion(safeVersion), `${safeVersion} is not a valid Safe Account version`)
}

export const createEthersAdapter = (provider: Web3Provider) => {
  const signer = provider.getSigner(0)
  return new EthersAdapter({
    ethers,
    signerOrProvider: signer,
  })
}

export const createReadOnlyEthersAdapter = (provider = getWeb3ReadOnly()) => {
  if (!provider) {
    throw new Error('Unable to create `EthersAdapter` without a provider')
  }

  return new EthersAdapter({
    ethers,
    signerOrProvider: provider,
  })
}

type SafeCoreSDKProps = {
  provider: JsonRpcProvider
  chainId: SafeInfo['chainId']
  address: SafeInfo['address']['value']
  version: SafeInfo['version']
  implementationVersionState: SafeInfo['implementationVersionState']
  implementation: SafeInfo['implementation']['value']
}

// Safe Core SDK
export const initSafeSDK = async ({
  provider,
  chainId,
  address,
  version,
  implementationVersionState,
  implementation,
}: SafeCoreSDKProps): Promise<Safe | undefined> => {
  const safeVersion = version ?? (await Gnosis_safe__factory.connect(address, provider).VERSION())

  let isL1SafeMasterCopy = chainId === chains.eth

  // If it is an official deployment we should still initiate the safeSDK
  if (!isValidMasterCopy(implementationVersionState)) {
    const masterCopy = implementation

    const safeL1Deployment = getSafeSingletonDeployment({ network: chainId, version: safeVersion })
    const safeL2Deployment = getSafeL2SingletonDeployment({ network: chainId, version: safeVersion })

    isL1SafeMasterCopy = masterCopy === safeL1Deployment?.defaultAddress
    const isL2SafeMasterCopy = masterCopy === safeL2Deployment?.defaultAddress

    // Unknown deployment, which we do not want to support
    if (!isL1SafeMasterCopy && !isL2SafeMasterCopy) {
      return Promise.resolve(undefined)
    }
  }

  // Legacy Safe contracts
  if (isLegacyVersion(safeVersion)) {
    isL1SafeMasterCopy = true
  }

  return Safe.create({
    ethAdapter: createReadOnlyEthersAdapter(provider),
    safeAddress: address,
    isL1SafeMasterCopy,
  })
}

export const {
  getStore: getSafeSDK,
  setStore: setSafeSDK,
  useStore: useSafeSDK,
} = new ExternalStore<Safe | undefined>()
