import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import TooltipNavigate from '../../../layouts/TooltipNavigate';
import type { QueryLots } from '../../../types/global';
import Icon from '../../../assets/icon';
import { Button } from '../../../components/button';
import useDebounce from '../../../hooks/useDebounce';

interface IProps {
  query: QueryLots;
  setQuery: Dispatch<SetStateAction<QueryLots>>;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

export default function Filter({ query, setQuery, setOpen }: IProps) {
  const { t } = useTranslation();
  const [value, setValue] = useState<string>('');

  const textSearch = useDebounce(value, 300);

  useEffect(() => {
    setQuery((prev) => ({ ...prev, page: 1, search: textSearch }));
  }, [textSearch]);

  const classInputBorder =
    'appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none p-1 w-full h-9 focus:outline-none focus:border-[var(--color-background)]';

  return (
    <div className="sticky top-0 md:flex justify-between items-center bg-white shadow-lg shadow-gray-100 z-10 p-2">
      <div className="flex justify-start items-center gap-2">
        <Button
          onClick={() => setOpen(true)}
          className="shadow-gray-400 cursor-pointer inline-flex justify-center items-center gap-1 rounded-sm bg-[var(--color-background)] px-3 py-2 text-sm font-semibold text-white shadow-md w-auto"
        >
          <Icon name="icon-add-circle" className="w-4 h-4" />
          {t('Thêm tài khoản')}
        </Button>

        <div className="flex justify-start items-center gap-1 text-[12px] md:text-sm border border-gray-300 shadow-sm shadow-gray-200 rounded px-2 pl-0 flex-1">
          <input
            type="text"
            placeholder="Tài khoản..."
            className={classInputBorder}
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          <Icon name="icon-search" />
        </div>
      </div>

      <div className="flex justify-center md:justify-between items-center gap-2 text-[12px] md:text-sm md:mt-0 mt-2">
        <TooltipNavigate
          disabled={query?.page === 1}
          handle={() => {
            setQuery && setQuery((prev) => ({ ...prev, page: query?.page === 1 ? 1 : (prev.page ?? 0) - 1 }));
          }}
          iconName="icon-left"
          path="#"
          title="Trang trước"
          className="w-[30px] md:w-[36px] h-[30px] md:h-[36px] p-0 flex justify-center items-center"
        />
        <div className="flex justify-between items-center gap-1">
          <div className="font-semibold w-[30px] md:w-[36px] h-[30px] md:h-[36px] shadow-md shadow-gray-500 flex justify-center items-center rounded-lg">
            {query?.page}
          </div>
          <div className="">/</div>
          <div className="font-semibold w-[30px] md:w-[36px] h-[30px] md:h-[36px] shadow-md shadow-gray-500 flex justify-center items-center rounded-lg">
            {query?.totalPage ?? 0}
          </div>
        </div>
        <TooltipNavigate
          disabled={query?.page === query?.totalPage || query?.totalPage === 0}
          handle={() => {
            setQuery &&
              setQuery((prev) => ({
                ...prev,
                page: query?.page === query?.totalPage ? prev.page : (prev.page ?? 0) + 1,
              }));
          }}
          iconName="icon-right"
          path="#"
          title="Trang sau"
          className="w-[30px] md:w-[36px] h-[30px] md:h-[36px] p-0 flex justify-center items-center"
        />
        <div className="h-[36px] px-2 ml-2 shadow-md shadow-gray-500 flex justify-center items-center rounded-lg font-semibold">
          {t('Tổng số bản')}: {query?.total ?? 0}
        </div>
      </div>
    </div>
  );
}
