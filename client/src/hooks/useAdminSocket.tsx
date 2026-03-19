import { useEffect, useMemo } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "../contexts/AuthContext";
import { apiOrigin } from "../services/api";

export function useAdminSocket(onEvent: (event: string, payload: any) => void) {
  const { user, token } = useAuth();
  const socket = useMemo<Socket | null>(() => {
    if (!user || !token) return null;
    return io(apiOrigin, { transports: ["websocket"] });
  }, [user, token]);

  useEffect(() => {
    if (!socket || !user) return;
    socket.emit("join", { role: user.role });
    const handler = (event: string) => (payload: any) =>
      onEvent(event, payload);
    const events = ["vote_cast", "election_status", "election_created"];
    for (const e of events) socket.on(e, handler(e));
    return () => {
      for (const e of events) socket.off(e);
      socket.disconnect();
    };
  }, [socket, user, onEvent]);
}
