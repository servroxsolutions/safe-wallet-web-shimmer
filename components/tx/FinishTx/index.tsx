import { type SafeTransaction } from '@gnosis.pm/safe-core-sdk-types'
import { Typography } from '@mui/material'
import { useEffect, type ReactElement } from 'react'
import proposeTx from 'services/proposeTransaction'
import { useAppSelector } from 'store'
import { selectSafeInfo } from 'store/safeInfoSlice'
import css from './styles.module.css'

const FinishTx = ({ tx }: { tx: SafeTransaction }): ReactElement => {
  const { safe } = useAppSelector(selectSafeInfo)
  const { chainId } = safe
  const address = safe.address.value

  useEffect(() => {
    proposeTx(chainId, address, tx)
  }, [chainId, address, tx])

  return (
    <div className={css.container}>
      <Typography variant="h6">All done!</Typography>

      <pre style={{ overflow: 'auto', width: '100%' }}>
        {JSON.stringify(
          {
            ...tx,
            signatures: Object.fromEntries(tx.signatures.entries()),
          },
          null,
          2,
        )}
      </pre>
    </div>
  )
}

export default FinishTx