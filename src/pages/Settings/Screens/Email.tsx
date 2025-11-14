import NotDecent from '../../../components/notDecent';
import { useAppInfo } from '../../../hooks/useAppInfo';

export default function Email() {
  const { user } = useAppInfo();
  return (
    <div className="p-2 h-full">
      {user?.role === 200 ? (
        <div className="h-full">
          <NotDecent title="Hiện đang trong quá trình phát triển" />
        </div>
      ) : (
        <NotDecent />
      )}
    </div>
  );
}
