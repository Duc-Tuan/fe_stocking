import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getOrdersClose } from '../../../api/historys';
import { Loading } from '../../../components/loading';
import type { QueryLots } from '../../../types/global';
import { getTime } from '../../../utils/timeRange';
import Filter from '../components/Filter';
import { initFilter, type IFilterAllLot, type IProfitOrderClose, type ISymbolAll } from '../type';
import { Button } from '../../../components/button';
import Icon from '../../../assets/icon';

const initPara: QueryLots = {
  page: 1,
  limit: 10,
  acc_transaction: undefined,
  end_time: undefined,
  start_time: undefined,
  symbol: undefined,
};

export default function Orders() {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<IFilterAllLot>(initFilter);
  const [data, setData] = useState<ISymbolAll[]>([]);
  const [dataProfit, setDataProfit] = useState<IProfitOrderClose[]>([]);
  const [query, setQuery] = useState<QueryLots>(initPara);
  const [total, setTotal] = useState<{ totalOrder: number }>({ totalOrder: 0 });
  const [loading, setLoading] = useState<boolean>(false);

  const [showInfo, setShowInfo] = useState<boolean>(false);

  useEffect(() => {
    const fetchApi = async () => {
      setLoading(true);
      const res = await getOrdersClose(query);
      setData(res.data.data);
      setLoading(false);
      setDataProfit(res.data.profit);
      setTotal({ totalOrder: res.data.totalOrder });
      setQuery((prev) => ({ ...prev, total: res.data.total, totalPage: Math.ceil(res.data.total / res.data.limit) }));
    };
    fetchApi();
  }, [query.page, query.acc_transaction, query.symbol, query.end_time, query.end_time]);

  const handleFilter = (data: IFilterAllLot) => {
    setQuery((prev) => {
      return {
        ...prev,
        acc_transaction: data.accTransaction ?? undefined,
        end_time: getTime(data.toFrom[1]),
        start_time: getTime(data.toFrom[0]),
        page: 1,
      };
    });
  };

  return (
    <div className="relative h-full">
      <Filter
        setFilter={setFilter}
        filter={filter}
        isStatus
        query={query}
        setQuery={setQuery}
        handleFilter={handleFilter}
      />
      <div className="p-2 flex flex-col justify-center items-start gap-2">
        {!loading ? (
          data.length === 0 ? (
            <div className="text-gray-300 flex justify-center items-center min-h-[70vh] w-full">
              {t('Hiện chưa có lệnh')}
            </div>
          ) : (
            data.map((a, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center w-full shadow-sm shadow-gray-300 p-2 rounded-sm"
              >
                <div className="text-[12px] md:text-sm">
                  <div className="font-bold mb-1 ">
                    {a.symbol}{' '}
                    <span
                      className={`text-[12px] md:text-sm font-semibold ${
                        a.type === 'SELL' ? 'text-red-500' : 'text-blue-500'
                      }`}
                    >
                      {a.type}
                    </span>
                  </div>
                  <div>
                    {a.volume} / {a.volume} {t('Thị trường')}
                  </div>
                </div>
                <div className="text-[12px] md:text-sm">
                  <div className={`mb-1 text-right text-red-500 font-semibold`}>
                    {a.profit} {t('Lệnh đã đóng')}
                  </div>
                  <div>
                    {a.account_transaction_id} |{' '}
                    {dayjs.utc(a.time).tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD HH:mm:ss')}
                  </div>
                </div>
              </div>
            ))
          )
        ) : (
          <Loading />
        )}
      </div>

      <div className="sticky bottom-0 left-0 right-0 bg-white p-2">
        <div className="flex justify-between items-center my-1 px-2">
          <div className="font-semibold text-[12px] md:text-sm">{t('Tổng lệnh')}</div>
          <span className="font-bold text-[12px] md:text-sm">{total.totalOrder}</span>
        </div>

        <div className="">
          <Button
            onClick={() => setShowInfo(!showInfo)}
            className="rounded-none shadow-none flex h-9 md:h-11 justify-between items-center w-full font-bold cursor-pointer text-black px-2 hover:bg-[var(--color-background-opacity-2)] transition text-[12px] md:text-sm"
          >
            <span>{t('Xem thông tin tài khoản')}</span>
            <Icon
              name="icon-up"
              width={14}
              height={14}
              className={`transition-transform duration-200 ${showInfo ? 'rotate-180' : 'rotate-0'}`}
            />
          </Button>

          <div
            className={`${
              showInfo ? `h-[${Math.ceil(dataProfit.length / 5) * 16}vh] max-h-[50vh] my-scroll` : 'h-0 overflow-hidden'
            } transition-all grid grid-cols-2 md:grid-cols-5 gap-1`}
          >
            {[
              ...dataProfit,
              // nếu ít hơn 5 thì thêm phần tử ảo cho đủ
              ...Array(Math.max(0, 5 - dataProfit.length)).fill({ isFake: true }),
            ].map((d, index) => {
              if (d.isFake) {
                return (
                  <div
                    className="col-span-1 border border-dashed border-gray-300 p-2 opacity-50 shadow-lg shadow-gray-300 rounded-sm"
                    key={`fake-${index}`}
                  >
                    <div className="text-[10px] md:text-sm text-gray-400 min-h-[15vh]">{t('Đang chờ tài khoản')}</div>
                  </div>
                );
              }

              return (
                <div className="shadow-lg shadow-gray-300 p-2 rounded-sm" key={index}>
                  <div className="flex justify-between items-center">
                    <div className="font-semibold text-[12px] md:text-sm">{t('Tài khoản')}:</div>
                    <span className="font-bold text-[12px] md:text-sm">{d.account_transaction_id}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="font-semibold text-[12px] md:text-sm">{t('Số lệnh đã đóng')}: </div>
                    <span className="font-bold text-[12px] md:text-sm">{d.transaction_count}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="font-semibold text-[12px] md:text-sm">{t('Tổng LN')}:</div>
                    <span className="font-bold text-[12px] md:text-sm">{d.total_profit.toFixed(4)}usd</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="font-semibold text-[12px] md:text-sm">{t('Thời gian xem')}: </div>
                    <span className="font-bold text-[12px] md:text-sm">{d.time}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
