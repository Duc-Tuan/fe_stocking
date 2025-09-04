import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { dataHistory } from '../type';
import type { ISymbolPosition } from '../../History/type';
import Icon from '../../../assets/icon';
import dayjs from 'dayjs';

export default function BootHistory() {
  const { t } = useTranslation();
  const [data, setData] = useState<ISymbolPosition[]>(dataHistory);
  return (
    <div>
      {data.map((a, idx) => (
        <div key={idx} className="flex justify-between items-center w-full shadow-sm shadow-gray-300 p-2 rounded-sm">
          <div className="">
            <div className="font-bold">
              {a.symbol}{' '}
              <span
                className={`text-sm font-semibold ${a.position_type === 'SELL' ? 'text-red-500' : 'text-blue-500'}`}
              >
                {a.position_type} {a.volume}
              </span>
            </div>
            <div className="text-sm flex justify-start items-center gap-1">
              {a.open_price} <Icon name="icon-right-v2" width={14} height={14} /> {a.current_price}
            </div>
          </div>
          <div className="">
            <div className="text-sm">
              {t('Tài khoản exness:')} {a.account_id}
            </div>
            <div className="text-sm">
              {t('Tài khoản quỹ:')} {a.account_id}
            </div>
          </div>
          <div className="">
            <div
              className={`text-right ${
                a.profit > 0 ? 'text-blue-700' : a.profit === 0 ? 'text-gray-400' : 'text-red-500'
              } font-semibold`}
            >
              {a.profit}
            </div>
            <div className="text-sm">{dayjs.utc(a.time).tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD HH:mm:ss')}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
