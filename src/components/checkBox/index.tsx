import { useTranslation } from 'react-i18next';
import { useToggle } from '../../hooks/useToggle';

function CheckBox({ title, handle, init, id }: { title?: string; handle: (isCheck: boolean, id: number) => void, init?: boolean, id?: number }) {
  const { t } = useTranslation();
  const [isOpen, toggleOpen] = useToggle(init);
  
  const handleClick = () => {
    id && handle(!isOpen, id);
    toggleOpen()
  }

  return (
    <button className="flex items-center ml-4 cursor-pointer" onClick={handleClick}>
      <input
        checked={isOpen}
        readOnly
        type="checkbox"
        value=""
        className="custom-checkbox cursor-pointer appearance-none bg-gray-100 checked:bg-[var(--color-background)] w-4 h-4 rounded-sm dark:bg-white border border-[var(--color-background)] ring-offset-[var(--color-background)]"
      />
      {title && (
        <label
          htmlFor="green-checkbox"
          className="cursor-pointer ms-2 text-sm font-medium text-gray-900 dark:text-gray-900"
        >
          {t(title)}
        </label>
      )}
    </button>
  );
}

export default CheckBox;
