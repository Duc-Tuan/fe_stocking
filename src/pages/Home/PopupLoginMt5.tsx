import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { memo, useState } from "react";
import Icon from "../../assets/icon";
import { Button } from "../../components/button";
import { useToggle } from "../../hooks/useToggle";
import toast from "react-hot-toast";
import { postAccMt5Api } from "../../api/serverSymbol";

interface IProps {
    open: boolean,
    setOpen: React.Dispatch<React.SetStateAction<boolean>>,
    handle: (data: any) => void
}

export interface ILoginMt5 {
    username: string;
    password: string;
    server: string
}

const init = {
    password: '',
    server: '',
    username: ''
}

const PopupLoginMt5 = (props: IProps) => {

    const { open, setOpen, handle } = props;
    const [isShow, toggleShow, setShow] = useToggle(false)
    const [loading, setLoading] = useState<boolean>(false)
    const [data, setData] = useState<ILoginMt5>(init);

    const hanleSubmit = async () => {
        if ((data.password === '') || (data.server === '') || (data.username === '')) return toast.error("Vui lòng nhập đầy đủ thông tin!");
        setLoading(true)
        try {
            const res = await postAccMt5Api(data);
            toast.success(res.message);
            handle(data);
            setData(init)
        } catch (error: any) {
            return toast.error(error?.response?.data?.detail);
        } finally {
            setLoading(false)
        }
    }


    return <Dialog open={open} onClose={setOpen} className="relative z-10" >
        <DialogBackdrop
            transition
            className="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
        />

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                <DialogPanel
                    transition
                    className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-lg data-closed:sm:translate-y-0 data-closed:sm:scale-95"
                >
                    <Button
                        type="button"
                        onClick={() => setOpen(false)}
                        className="cursor-pointer absolute top-3 right-3 rounded-md bg-white p-0 text-sm font-semibold text-gray-900 shadow-xs ring-gray-300 hover:bg-gray-50"
                    >
                        <Icon name="icon-close" color="red" width={20} height={20} />
                    </Button>

                    <h1 className="text-center mt-6 font-bold text-lg">Đăng nhập tài khoản Mt5</h1>

                    <main className="px-10 my-8 flex flex-col gap-3">
                        <div className="">
                            <label htmlFor="">Tài khoản:</label>
                            <input
                                value={data?.username}
                                onChange={(e) => setData((prev: ILoginMt5) => ({ ...prev, username: e.target.value }))}
                                className="border p-2 w-full rounded-sm"
                                placeholder="username"
                            />
                        </div>


                        <div className="relative">
                            <label htmlFor="">Mật khẩu:</label>
                            <input
                                type={isShow ? "text" : "password"}
                                value={data?.password}
                                onChange={(e) => setData((prev: ILoginMt5) => ({ ...prev, password: e.target.value }))}
                                className="border p-2 w-full pr-10 rounded-sm"
                                placeholder="Password"
                            />
                            <button onClick={toggleShow} type="button" className="h-min absolute inset-y-[50%] end-0 flex items-center z-20 px-3 cursor-pointer text-gray-400 rounded-e-md focus:outline-hidden focus:text-blue-600 dark:text-neutral-600 dark:focus:text-blue-500">
                                {isShow ? <Icon name="icon-eye" className="text-neutral-500 w-5 h-5" /> :
                                    <Icon name="icon-no-eye" className="text-neutral-500 w-5 h-5" />}
                            </button>
                        </div>

                        <div className="">
                            <label htmlFor="">Server:</label>
                            <input
                                value={data?.server}
                                onChange={(e) => setData((prev: ILoginMt5) => ({ ...prev, server: e.target.value }))}
                                className="border p-2 w-full rounded-sm"
                                placeholder="server"
                            />
                        </div>

                        <div className="flex justify-center items-center mt-4 w-full">
                            <Button
                                isLoading={loading}
                                onClick={hanleSubmit}
                                type="button"
                                className="inline-flex w-full justify-center rounded-md bg-red-600 py-3 text-md font-semibold text-white shadow-xs hover:bg-red-500"
                            >
                                Đăng nhập
                            </Button>
                        </div>
                    </main>

                </DialogPanel>
            </div>
        </div>
    </Dialog>
}

export default memo(PopupLoginMt5)