import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '../context/SocketContext';

/**
 * Custom hook for real-time order tracking via Socket.io.
 * Automatically joins the order room and listens for status updates,
 * delivery location changes, and delivered events.
 *
 * @param {string|null} orderId - The order ID to track
 * @returns {{ status, riderLocation, deliveredAt, isTracking }}
 */
export function useOrderTracking(orderId) {
  const { socket, joinOrderRoom } = useSocket();
  const [status, setStatus] = useState(null);
  const [riderLocation, setRiderLocation] = useState(null);
  const [deliveredAt, setDeliveredAt] = useState(null);
  const [isTracking, setIsTracking] = useState(false);

  useEffect(() => {
    if (!orderId || !socket) return;

    joinOrderRoom(orderId);
    setIsTracking(true);

    const handleStatusChange = (data) => {
      if (data.orderId === orderId || data.deliveryId) {
        setStatus(data.status);
      }
    };

    const handleLocationUpdate = (data) => {
      if (data.orderId === orderId) {
        setRiderLocation({ lat: data.lat, lng: data.lng });
      }
    };

    const handleDelivered = (data) => {
      if (data.orderId === orderId) {
        setStatus('DELIVERED');
        setDeliveredAt(data.deliveredAt || new Date().toISOString());
      }
    };

    const handlePaid = (data) => {
      if (data.orderId === orderId) {
        setStatus('PAID');
      }
    };

    socket.on('order:status', handleStatusChange);
    socket.on('order:status_changed', handleStatusChange);
    socket.on('delivery:status_changed', handleStatusChange);
    socket.on('delivery:location_updated', handleLocationUpdate);
    socket.on('order:delivered', handleDelivered);
    socket.on('order:paid', handlePaid);

    return () => {
      socket.off('order:status', handleStatusChange);
      socket.off('order:status_changed', handleStatusChange);
      socket.off('delivery:status_changed', handleStatusChange);
      socket.off('delivery:location_updated', handleLocationUpdate);
      socket.off('order:delivered', handleDelivered);
      socket.off('order:paid', handlePaid);
      setIsTracking(false);
    };
  }, [orderId, socket, joinOrderRoom]);

  return { status, riderLocation, deliveredAt, isTracking };
}
