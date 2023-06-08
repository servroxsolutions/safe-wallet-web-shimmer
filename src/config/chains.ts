import { networks } from '@servrox/safe-core-sdk-utils-shimmer/dist/src/eip-3770/config'

/**
 * A static shortName<->chainId dictionary
 * E.g.:
 *
 * {
 *   eth: '1',
 *   gor: '5',
 *   ...
 * }
 */
type Chains = Record<string, string>

const chains = networks.reduce<Chains>((result, { shortName, chainId }) => {
  console.log(shortName, chainId)
  result[shortName] = chainId.toString()
  return result
}, {})

export default chains
