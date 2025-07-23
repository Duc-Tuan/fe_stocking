import { Tooltip } from "@material-tailwind/react";
import type { JSX } from "react";
import type { IOptions } from "../../types/global";
import { Button } from "../button";

interface IProps {
    options: IOptions[];
    handleClick: (data: any) => void;
    children: JSX.Element;
    isLoading?: boolean
}

export default function Tabs(props: IProps) {
    const { options, handleClick, children, isLoading } = props;
    return <div className="text-center">
        <div className="flex flex-wrap text-sm font-medium text-center text-gray-500 dark:text-gray-400 gap-2">
            {options.map((item: IOptions) => (
                <Tooltip
                    key={item?.value}
                    content={
                        <div className="dark:text-white dark:bg-rose-400 rounded-lg py-1 px-2">
                            <div>
                                tài khoản: {item?.value}
                            </div>
                            <div>
                                server: {item?.label}
                            </div>
                            <div className="font-bold">
                                Cặp tiền: {JSON.stringify(item?.data)}
                            </div>
                        </div>
                    }
                >

                    <Button
                        disabled={isLoading}
                        isLoading={isLoading}
                        onClick={() => handleClick(item)}
                        className={`inline-block p-3 rounded-lg ${item.active
                            ? "text-white bg-rose-400 active"
                            : "bg-gray-200 text-black hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-rose-200 dark:hover:text-rose-900 border border-rose-100 dark:hover:border-rose-200"
                            } cursor-pointer`}
                        aria-current="page"
                    >
                       T {String(item?.value).slice(-6)}
                    </Button>
                </Tooltip>
            ))}
        </div>

        <div>{children}</div>
    </div>
}