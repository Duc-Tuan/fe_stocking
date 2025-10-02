import { useEffect } from "react";

export function useClickOutside(
    ref: React.RefObject<HTMLElement | null>,
    onClickOutside: () => void,
    enabled: boolean = true
) {
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                onClickOutside();
            }
        }

        if (enabled) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [ref, onClickOutside, enabled]);
}
