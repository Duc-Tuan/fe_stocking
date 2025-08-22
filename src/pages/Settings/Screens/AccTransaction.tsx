import { useTranslation } from 'react-i18next';
import { Loading } from '../../../components/loading';
import { useAppInfo } from '../../../hooks/useAppInfo';
import { useSocket } from '../../../hooks/useWebSocket';
import { useEffect, useState } from 'react';
import type { IServerTransaction } from '../../../types/global';

interface IData extends IServerTransaction {
  open_orders?: any
}

export default function AccTransaction() {
  const { t } = useTranslation()
  const { dataServerTransaction, loadingserverTransaction } = useAppInfo()
  const [data, setData] = useState<IData[]>(dataServerTransaction)

  const { dataCurrentAccTransaction } = useSocket(
    import.meta.env.VITE_URL_API,
    "acc_transaction_message",
    2423423
  );

  useEffect(() => {
    if (dataCurrentAccTransaction) {
      const dataNew: any = [...data].map((i) => {
        const dataSocket = dataCurrentAccTransaction.find((d: any) => d.id === i.id)
        if (i.id === dataSocket.id) {
          return {
            id: dataSocket.id,
            username: dataSocket.username,
            name: dataSocket.name,
            balance: dataSocket.balance,
            equity: dataSocket.equity,
            margin: dataSocket.margin,
            free_margin: dataSocket.free_margin,
            leverage: dataSocket.leverage,
            server: dataSocket.server,
            loginId: dataSocket.loginId
          }
        }
        return i
      })
      setData(dataNew)
    }
  }, [dataCurrentAccTransaction])

  console.log(dataCurrentAccTransaction && dataCurrentAccTransaction.find((d: any) => d.username === 273912967));

  return (
    <div className='flex flex-col justify-center items-center gap-2'>
      {
        !loadingserverTransaction ? data.map((d) => {
          return <div className="bg-[var(--color-background-opacity-1)] w-full p-2 shadow-sm shadow-gray-200 rounded-sm" key={d.id}>
            <div className=""><span className='font-bold mr-2'>{t("Tài khoản")}: </span>{d.name}</div>
            <div className=""><span className='font-bold mr-2'>{t("Máy chủ")}: </span>{d.server}</div>
            <div className=""><span className='font-bold mr-2'>{t("Số dư")}: </span>{d.balance}</div>
            <div className=""><span className='font-bold mr-2'>{t("Vốn chủ sở hữu / Tài sản ròng")}: </span>{d.equity}</div>
            <div className=""><span className='font-bold mr-2'>{t("Ký quỹ")}: </span>{d.margin}</div>
            <div className=""><span className='font-bold mr-2'>{t("Ký quỹ khả dụng")}: </span>{d.free_margin}</div>
            <div className=""><span className='font-bold mr-2'>{t("Đòn bẩy")}: </span>{d.leverage}</div>
            <div className=""><span className='font-bold mr-2'>{t("Số lệnh đang mở")}: </span>{d.leverage}</div>
          </div>
        }) : <Loading />
      }
    </div>
  )
}
