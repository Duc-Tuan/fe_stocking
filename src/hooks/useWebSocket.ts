// hooks/useSocket.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import type { ICurrentPnl } from "../types/global";

export function useSocket(
  url: string,
  listen: string,
  id_symbol: number | null
) {
  const socketRef = useRef<Socket | null>(null);
  const token = useMemo(() => localStorage.getItem("token"), []);
  const [dataCurrent, setDataCurrent] = useState<ICurrentPnl>()

  const [dataCurrentPosition, setDataCurrentPosition] = useState<any>()

  useEffect(() => {
    if (id_symbol) {
      const socket = io(url, {
        query: {
          symbol_id: id_symbol, token
        }
      });
      socketRef.current = socket;

      socket.on("connect", () => {
        console.log("✅ Socket connected:", socket.id);
      });

      socket.on("disconnect", () => {
        console.log("❌ Socket disconnected");
      });

      if (listen === "chat_message") {
        socket.on('chat_message', (data) => {
          let parsed = JSON.parse(data.by_symbol);

          // Nếu parse ra mảng ký tự → nghĩa là bị double-encode → parse thêm lần nữa
          if (typeof parsed === "string") {
            parsed = JSON.parse(parsed);
          }

          const result = Object.entries(parsed).map(([key, value]: any[]) => ({
            symbol: key,
            ...value
          }));

          setDataCurrent({
            ...data,
            by_symbol: result
          })
        });
      }

      if (listen === "position_message") {
        socket.on('position_message', (data) => {
          setDataCurrentPosition(data);
        });
      }

      return () => {
        socket.disconnect();
      };
    }
  }, [url, id_symbol]);

  return {
    dataCurrentPosition, dataCurrent
  }
}
