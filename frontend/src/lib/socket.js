import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_BACKEND_URL?.replace('/api/v1', '') || 'http://localhost:5000';

const socket = io(SOCKET_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 10000,
  transports: ['websocket', 'polling'],
});

socket.on('connect', () => {
  console.log('🟢 Socket.io: Connected —', socket.id);
});

socket.on('disconnect', (reason) => {
  console.log('🔴 Socket.io: Disconnected —', reason);
});

socket.on('connect_error', (err) => {
  console.warn('⚠️ Socket.io: Connection error —', err.message);
});

export default socket;
