import { useTranslation } from 'react-i18next';
import { Loading } from '../../../components/loading';
import { useAppInfo } from '../../../hooks/useAppInfo';

export default function AccTransaction() {
  const { t } = useTranslation()
  const { dataServerTransaction, loadingserverTransaction } = useAppInfo()

  return (
    <div className='flex flex-col justify-center items-center gap-2'>
      {
        !loadingserverTransaction ? dataServerTransaction.map((d) => {
          return <div className="bg-[var(--color-background-opacity-1)] w-full p-2 shadow-sm shadow-gray-200 rounded-sm" key={d.id}>
            <div className=""><span className='font-bold mr-2'>{t("Tài khoản")}: </span>{d.name}</div>
            <div className=""><span className='font-bold mr-2'>{t("Máy chủ")}: </span>{d.server}</div>
            <div className=""><span className='font-bold mr-2'>{t("Số dư")}: </span>{d.balance}</div>
            <div className=""><span className='font-bold mr-2'>{t("Vốn chủ sở hữu / Tài sản ròng")}: </span>{d.equity}</div>
            <div className=""><span className='font-bold mr-2'>{t("Ký quỹ")}: </span>{d.margin}</div>
            <div className=""><span className='font-bold mr-2'>{t("Ký quỹ khả dụng")}: </span>{d.free_margin}</div>
            <div className=""><span className='font-bold mr-2'>{t("Đòn bẩy")}: </span>{d.leverage}</div>
          </div>
        }) : <Loading />
      }
    </div>
  )
}
