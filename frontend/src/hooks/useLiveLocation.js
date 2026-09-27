import { useState, useEffect, useCallback, useRef } from 'react';
import { useSocket } from '../context/SocketContext';

/**
 * Custom hook for broadcasting and receiving live GPS coordinates.
 * Used by the Rider dashboard to send location updates and by
 * the Customer tracking screen to receive them.
 *
 * @param {string|null} deliveryId - The delivery record ID
 * @param {string|null} orderId - The associated order ID
 * @param {boolean} isBroadcasting - If true, this client sends location updates
 * @param {number} intervalMs - GPS broadcast interval in ms (default: 5000)
 * @returns {{ currentLocation, error, isBroadcasting }}
 */
export function useLiveLocation(deliveryId, orderId, isBroadcasting = false, intervalMs = 5000) {
  const { socket, joinOrderRoom } = useSocket();
  const [currentLocation, setCurrentLocation] = useState(null);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);

  // Join order room to receive updates
  useEffect(() => {
    if (orderId) {
      joinOrderRoom(orderId);
    }
  }, [orderId, joinOrderRoom]);

  // Listen for location updates from the rider
  useEffect(() => {
    if (!socket || !orderId) return;

    const handleLocation = (data) => {
      if (data.orderId === orderId) {
        setCurrentLocation({ lat: data.lat, lng: data.lng });
      }
    };

    socket.on('delivery:location_updated', handleLocation);

    return () => {
      socket.off('delivery:location_updated', handleLocation);
    };
  }, [socket, orderId]);

  // Broadcast own GPS position (rider mode)
  const broadcastLocation = useCallback(async () => {
    if (!isBroadcasting || !deliveryId) return;

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ lat: latitude, lng: longitude });

        try {
          const api = (await import('../lib/api')).default;
          await api.post(`/deliveries/${deliveryId}/location`, {
            lat: latitude,
            lng: longitude,
          });
        } catch (err) {
          console.error('Failed to broadcast location:', err.message);
        }
      },
      (posError) => {
        setError(posError.message);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, [isBroadcasting, deliveryId]);

  // Start/stop GPS broadcasting interval
  useEffect(() => {
    if (isBroadcasting && deliveryId) {
      broadcastLocation(); // Immediate first broadcast
      intervalRef.current = setInterval(broadcastLocation, intervalMs);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isBroadcasting, deliveryId, intervalMs, broadcastLocation]);

  return { currentLocation, error, isBroadcasting };
}
