import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../contexts/AuthContext';

// Use the backend URL directly for socket connection
const SOCKET_URL = process.env.NODE_ENV === 'development'
  ? 'http://localhost:5000'
  : window.location.protocol + '//' + window.location.host;

export const useSocket = () => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user, token } = useAuth();
  const socketRef = useRef(null);

  useEffect(() => {
    if (user && token && !socketRef.current) {
      console.log('🔌 FRONTEND: Creating socket connection to:', SOCKET_URL);
      console.log('🔐 FRONTEND: Using token:', token ? 'Present' : 'Missing');
      console.log('👤 FRONTEND: User:', user.name, '(' + (user._id || user.id) + ')');

      // Create socket connection
      const newSocket = io(SOCKET_URL, {
        auth: {
          token: token,
        },
        transports: ['websocket', 'polling'],
        forceNew: true,
      });

      // Connection event handlers
      newSocket.on('connect', () => {
        console.log('🔌 FRONTEND: Socket connected:', newSocket.id);
        console.log('   User:', user.name, '(' + user._id + ')');
        console.log('   Role:', user.role);
        setIsConnected(true);

        // Authenticate with user data
        const authData = {
          userId: user._id,
          userName: user.name,
          userRole: user.role,
        };
        console.log('🔐 FRONTEND: Sending authentication:', authData);
        newSocket.emit('authenticate', authData);
      });

      newSocket.on('disconnect', (reason) => {
        console.log('🔌 FRONTEND: Socket disconnected:', reason);
        console.log('   User:', user.name, '(' + user._id + ')');
        setIsConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('❌ FRONTEND: Socket connection error:', error);
        setIsConnected(false);
      });

      newSocket.on('authenticated', (data) => {
        console.log('Socket authenticated:', data);
      });

      newSocket.on('authentication_error', (error) => {
        console.error('Socket authentication error:', error);
      });

      socketRef.current = newSocket;
      setSocket(newSocket);
    }

    // Cleanup function
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setIsConnected(false);
      }
    };
  }, [user, token]);

  // Reconnect when user changes
  useEffect(() => {
    if (socketRef.current && user) {
      socketRef.current.emit('authenticate', {
        userId: user._id,
        userName: user.name,
        userRole: user.role,
      });
    }
  }, [user]);

  return { socket, isConnected };
};

// Hook for managing socket events
export const useSocketEvent = (eventName, handler, dependencies = []) => {
  const { socket } = useSocket();

  useEffect(() => {
    if (socket && handler) {
      socket.on(eventName, handler);
      
      return () => {
        socket.off(eventName, handler);
      };
    }
  }, [socket, eventName, handler, ...dependencies]);
};

// Hook for emitting socket events
export const useSocketEmit = () => {
  const { socket } = useSocket();

  const emit = (eventName, data) => {
    if (socket && socket.connected) {
      console.log(`📤 FRONTEND: Emitting event '${eventName}':`);
      console.log('   Data:', data);
      socket.emit(eventName, data);
      return true;
    }
    console.warn('⚠️ FRONTEND: Socket not connected, cannot emit event:', eventName);
    return false;
  };

  return emit;
};
