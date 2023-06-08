import { hasSafeFeature as sdkHasSafeFeature } from '@servrox/safe-core-sdk-utils-shimmer'
import type { SAFE_FEATURES } from '@servrox/safe-core-sdk-utils-shimmer'

import type { SafeInfo } from '@safe-global/safe-gateway-typescript-sdk'

// Note: backend returns `SafeInfo['version']` as `null` for unsupported contracts
export const hasSafeFeature = (feature: SAFE_FEATURES, version: SafeInfo['version']): boolean => {
  if (!version) {
    return false
  }
  return sdkHasSafeFeature(feature, version)
}
