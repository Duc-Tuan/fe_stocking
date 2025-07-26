import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login } from '../../auth/authSlice';
import type { AppDispatch } from '../../store';
import Icon from '../../assets/icon';
import { useToggle } from '../../hooks/useToggle';
import { Button } from '../../components/button';
import toast from 'react-hot-toast';
import { generateUUID } from '../../utils/timeRange';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isOpen, toggleOpen, setOpen] = useToggle(false);
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate(); // ⬅️ bạn bị thiếu dòng này

  const handleLogin = async () => {
    try {
      let deviceId = localStorage.getItem("device_id");
      if (!deviceId) {
        deviceId = generateUUID(); // fallback nếu cần
        localStorage.setItem("device_id", deviceId);
      }
      setIsLoading(true)
      await dispatch(login({ username, password, deviceId })).unwrap(); // ⬅️ thêm unwrap để bắt lỗi
      toast.success('Đăng nhập thành công!');
      return navigate('/'); // ⬅️ chuyển hướng sau khi login thành công
    } catch (e: any) {
      if (e?.message === "Request failed with status code 403") return toast.error('Chỉ được đăng nhập trên tối đa 2 thiết bị.', {
        style: {
          fontSize: '14px',
        },
      });
      return toast.error('Đăng nhập thất bại!');
    } finally {
      return setIsLoading(false)
    }
  };

  return (
    <div className="bg-gray-100 min-h-[100vh] flex justify-center items-center">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleLogin(); // ⬅️ gọi đúng hàm submit
        }}
        className="p-6 space-y-4 max-w-sm mx-auto bg-white min-w-[400px] rounded-xl shadow-sm shadow-red-200"
      >
        <h1 className='text-center font-bold mb-10 text-xl'>Đăng nhập</h1>

        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="border p-2 w-full rounded-sm"
          placeholder="Username"
        />

        <div className="max-w-sm">
          <div className="relative">
            <input
              type={isOpen ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border p-2 w-full mt-2 pr-10 rounded-sm"
              placeholder="Password"
            />
            <button onClick={toggleOpen} type="button" className="h-min absolute inset-y-[18px] end-0 flex items-center z-20 px-3 cursor-pointer text-gray-400 rounded-e-md focus:outline-hidden focus:text-blue-600 dark:text-neutral-600 dark:focus:text-blue-500">
              {isOpen ? <Icon name="icon-eye" className="text-neutral-500 w-5 h-5" /> :
                <Icon name="icon-no-eye" className="text-neutral-500 w-5 h-5" />}
            </button>
          </div>
        </div>


        <Button isLoading={isLoading} type="submit" className="w-full cursor-pointer bg-rose-400 px-4 py-2 text-white rounded mt-2">
          Đăng nhập
        </Button>
      </form>
    </div>
  );
}
