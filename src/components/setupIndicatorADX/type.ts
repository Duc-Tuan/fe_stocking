import type { Option } from "../../pages/History/type";
import type { Func } from "../../types/global";

export interface IMenuSub extends Option<string> {
    onClick: Func
}