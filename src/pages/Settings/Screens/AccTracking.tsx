import { useTranslation } from 'react-i18next';
import { Loading } from '../../../components/loading';
import { useAppInfo } from '../../../hooks/useAppInfo';

export default function AccTracking() {
  const { loadingServerMonitor, serverMonitor } = useAppInfo();
  const { t } = useTranslation()

  return (
    <div className='flex flex-col justify-center items-center gap-2'>
      {
        !loadingServerMonitor ? serverMonitor.map((d) => {
          return <div className="bg-[var(--color-background-opacity-1)] w-full p-1 py-2 shadow-sm shadow-gray-200 rounded-sm" key={d.value}>
            <div className=""><span className='font-bold mr-2'>{t("Tài khoản")}: </span>{d.value}</div>
            <div className=""><span className='font-bold mr-2'>{t("Máy chủ")}: </span>{d.label}</div>
            <div className=""><span className='font-bold mr-2'>{t("Cặp tiền theo dõi")}: </span>
              <span className="text-[var(--color-background)] font-bold">{d.data?.map((a: string, i: number) => {
                return a + ((i !== (d.data.length - 1)) ? " - " : "")
              })}</span>
            </div>
          </div>
        }) : <Loading />
      }
    </div>
  )
}
