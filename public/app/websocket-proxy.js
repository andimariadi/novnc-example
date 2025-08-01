// Force WebSocket configuration for noVNC proxy
// This script ensures noVNC connects to our proxy server

(function() {
    'use strict';
    
    console.log('🔧 Loading WebSocket proxy configuration...');
    
    // Override WebSocket globally to redirect to our proxy
    const OriginalWebSocket = window.WebSocket;
    
    window.WebSocket = function(url, protocols) {
        console.log('📡 Original WebSocket URL:', url);
        
        // Parse the URL to extract VNC target info
        let targetHost, targetPort;
        
        // Check if URL contains VNC host/port
        const urlObj = new URL(url, window.location.href);
        if (urlObj.hostname !== window.location.hostname) {
            // This is a direct VNC connection, redirect to our proxy
            targetHost = urlObj.hostname;
            targetPort = urlObj.port || '5900';
            
            // Build new WebSocket URL pointing to our proxy
            const proxyUrl = new URL(window.location.href);
            proxyUrl.protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            proxyUrl.port = '7576'; // Our WebSocket proxy port
            proxyUrl.pathname = '/';
            proxyUrl.search = `?host=${targetHost}&port=${targetPort}`;
            
            console.log('🔄 Redirecting to proxy:', proxyUrl.href);
            console.log('🎯 Target VNC:', `${targetHost}:${targetPort}`);
            
            url = proxyUrl.href;
        }
        
        return new OriginalWebSocket(url, protocols);
    };
    
    // Copy static properties
    window.WebSocket.CONNECTING = OriginalWebSocket.CONNECTING;
    window.WebSocket.OPEN = OriginalWebSocket.OPEN;
    window.WebSocket.CLOSING = OriginalWebSocket.CLOSING;
    window.WebSocket.CLOSED = OriginalWebSocket.CLOSED;
    
    console.log('✅ WebSocket proxy configuration loaded');
})();
