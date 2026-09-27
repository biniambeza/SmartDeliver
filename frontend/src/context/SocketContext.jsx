import React, { createContext, useContext, useEffect, useState } from 'react';
import socket from '../lib/socket';
import { useAuth } from './AuthContext';

const SocketContext = createContext({
  socket: null,
  isConnected: false,
  joinOrderRoom: () => {},
  leaveOrderRoom: () => {},
});

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (user) {
      // Connect when user is authenticated
      if (!socket.connected) {
        socket.connect();
      }
    } else {
      // Disconnect when user logs out
      if (socket.connected) {
        socket.disconnect();
      }
    }

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, [user]);

  /**
   * Join an order-specific Socket.io room for real-time tracking.
   */
  const joinOrderRoom = (orderId) => {
    if (socket.connected && orderId) {
      socket.emit('join:order', orderId);
    }
  };

  /**
   * Leave an order-specific Socket.io room.
   */
  const leaveOrderRoom = (orderId) => {
    if (socket.connected && orderId) {
      socket.emit('leave:order', orderId);
    }
  };

  return (
    <SocketContext.Provider value={{ socket, isConnected, joinOrderRoom, leaveOrderRoom }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}

export default SocketContext;
