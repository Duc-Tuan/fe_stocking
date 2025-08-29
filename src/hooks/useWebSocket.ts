// hooks/useSocket.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import type { ICurrentPnl } from "../types/global";

export function useSocket(
  url: string,
  listen: string,
  id_symbol: number | null,
) {
  const socketRef = useRef<Socket | null>(null);
  const token = useMemo(() => localStorage.getItem("token"), []);
  const [dataCurrent, setDataCurrent] = useState<ICurrentPnl>()

  const [dataCurrentPosition, setDataCurrentPosition] = useState<any>()
  const [dataCurrentAccTransaction, setDataCurrentAccTransaction] = useState<any>()
  const [dataOrder, setDataOrder] = useState<any>()

  useEffect(() => {
    if (id_symbol) {
      const socket = io(url, {
        query: {
          symbol_id: id_symbol,
          token,
          channels: listen
        }
      });
      socketRef.current = socket;

      socket.on("connect", () => {
        console.log("✅ Socket connected:", socket.id);
      });

      socket.on("disconnect", () => {
        console.log("❌ Socket disconnected");
      });

      const handleChat = (data: any) => {
        try {
          let parsed = JSON.parse(data.by_symbol);
          if (typeof parsed === "string") {
            parsed = JSON.parse(parsed);
          }
          const result = Object.entries(parsed).map(([key, value]: any[]) => ({
            symbol: key,
            ...value,
          }));
          setDataCurrent({ ...data, by_symbol: result });
        } catch (e) {
          console.error("Parse error", e);
        }
      };

      const handleOrderFilled = (data: any) => setDataOrder(data)
      const handlePosition = (data: any) => setDataCurrentPosition(data);
      const handleAccTransaction = (data: any) => setDataCurrentAccTransaction(data);

      // Đăng ký listener theo "listen"
      if (listen === "order_filled") socket.on("order_filled", handleOrderFilled);
      if (listen === "chat_message") socket.on("chat_message", handleChat);
      if (listen === "position_message") socket.on("position_message", handlePosition);
      if (listen === "acc_transaction_message")
        socket.on("acc_transaction_message", handleAccTransaction);

      return () => {
        if (listen === "order_filled") socket.off("order_filled", handleOrderFilled);
        if (listen === "chat_message") socket.off("chat_message", handleChat);
        if (listen === "position_message") socket.off("position_message", handlePosition);
        if (listen === "acc_transaction_message")
          socket.off("acc_transaction_message", handleAccTransaction);

        socket.disconnect();
      };
    }
  }, [url, id_symbol, listen]);

  return {
    dataCurrentPosition,
    dataCurrent,
    dataCurrentAccTransaction,
    dataOrder
  }
}
