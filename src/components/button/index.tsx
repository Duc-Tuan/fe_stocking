import { Button as ButtonCustom } from "@material-tailwind/react";
import { LoadingOnly } from "../loading/indexOnly";

interface IProps {
    children: any;
    isLoading?: boolean;
    [key: string]: any; // 👈 để truyền các props khác
}

export const Button = (props: IProps) => {
    const { children, isLoading, ...rest } = props
    return <ButtonCustom {...rest}>{!isLoading ? children : <LoadingOnly />}</ButtonCustom>
}