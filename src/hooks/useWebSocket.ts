// hooks/useSocket.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

export function useSocket<T = any>(
  url: string,
  listenEvent: string = "",
  id_symbol: number | null
) {
  const socketRef = useRef<Socket | null>(null);
  const [data, setData] = useState<T | null>(null);
  const token = useMemo(() => localStorage.getItem("token"), []);

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

      if (listenEvent) {
        socket.on(listenEvent, (payload: T) => {
          setData(payload);
        });
      }

      socket.on("disconnect", () => {
        console.log("❌ Socket disconnected");
      });

      socket.on('chat_message', (data) => {
        setData(data) // hoặc xử lý tùy ý
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [url, listenEvent, id_symbol]);

  return { data };
}
