import { useState, useEffect } from "react";

export function useRightClickMenu(ref: React.RefObject<HTMLElement | null>) {
    const [menu, setMenu] = useState<{ x: number; y: number } | null>(null);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();
            setMenu({ x: e.clientX, y: e.clientY });
        };


        element.addEventListener("contextmenu", handleContextMenu);

        return () => {
            element.removeEventListener("contextmenu", handleContextMenu);
        };
    }, [ref]);

    return { menu, setMenu };
}