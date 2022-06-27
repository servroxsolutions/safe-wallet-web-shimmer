import { useEffect } from 'react'
import { showNotification } from '@/store/notificationsSlice'
import { useAppDispatch } from '@/store'
import { TxEvent, txSubscribe } from '@/services/tx/txEvents'

const TxNotifications: Partial<Record<TxEvent, string>> = {
  [TxEvent.SIGN_FAILED]: 'Signature failed. Please try again.',
  [TxEvent.PROPOSED]: 'Your transaction was successfully proposed.',
  [TxEvent.PROPOSE_FAILED]: 'Proposal failed. Please try again.',
  [TxEvent.EXECUTING]: 'Please confirm the execution in your wallet.',
  [TxEvent.MINING]: 'Your transaction is mining.',
  [TxEvent.MINED]: 'Your transaction was succesfully mined and is now being indexed.',
  [TxEvent.REVERTED]: 'Please check your gas settings.',
  [TxEvent.SUCCESS]: 'Your transaction was successfully executed.',
  [TxEvent.FAILED]: 'Your transaction was unsuccessful.',
}

enum Variant {
  INFO = 'info',
  SUCCESS = 'success',
  ERROR = 'error',
}

const useTxNotifications = (): void => {
  const dispatch = useAppDispatch()

  useEffect(() => {
    const unsubFns = Object.entries(TxNotifications).map(([event, baseMessage]) =>
      txSubscribe(event as TxEvent, (detail) => {
        const isError = 'error' in detail
        const isSuccess = event === TxEvent.SUCCESS || event === TxEvent.PROPOSED
        const message = isError ? `${baseMessage} ${detail.error.message.slice(0, 300)}` : baseMessage
        const txId = 'txId' in detail && detail.txId

        dispatch(
          showNotification({
            id: '',
            message,
            groupKey: txId || '',
            variant: isError ? Variant.ERROR : isSuccess ? Variant.SUCCESS : Variant.INFO,
          }),
        )
      }),
    )

    return () => {
      unsubFns.forEach((unsub) => unsub())
    }
  }, [dispatch])
}

export default useTxNotifications