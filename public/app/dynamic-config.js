// Dynamic WebSocket URL configuration for noVNC
// This script modifies the WebSocket URL to include host and port parameters

(function() {
    'use strict';
    
    // Parse URL parameters
    function getUrlParameter(name) {
        const urlParams = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        return hashParams.get(name) || urlParams.get(name);
    }
    
    // Get dynamic host and port
    const dynamicHost = getUrlParameter('host');
    const dynamicPort = getUrlParameter('port');
    
    console.log('Dynamic config loaded:', { dynamicHost, dynamicPort });
    
    // Override the WebSocket URL if dynamic parameters are provided
    if (dynamicHost || dynamicPort) {
        // Wait for noVNC modules to load
        document.addEventListener('DOMContentLoaded', function() {
            // Set timeout to ensure all modules are loaded
            setTimeout(function() {
                // Override WebUtil.getConfigVar function
                if (window.WebUtil && typeof window.WebUtil.getConfigVar === 'function') {
                    const originalGetConfigVar = window.WebUtil.getConfigVar;
                    
                    window.WebUtil.getConfigVar = function(name, defVal) {
                        // Override host to point to our proxy server
                        if (name === 'host') {
                            return window.location.hostname; // Use current server IP
                        }
                        // Override port to use our WebSocket proxy port
                        if (name === 'port') {
                            return '7576'; // Our WebSocket proxy port
                        }
                        // Override path to include dynamic parameters
                        if (name === 'path') {
                            let path = '/';
                            if (dynamicHost || dynamicPort) {
                                const params = new URLSearchParams();
                                if (dynamicHost) params.set('host', dynamicHost);
                                if (dynamicPort) params.set('port', dynamicPort);
                                path += '?' + params.toString();
                            }
                            return path;
                        }
                        // For encrypt, default to false for ws:// instead of wss://
                        if (name === 'encrypt') {
                            return false;
                        }
                        return originalGetConfigVar.call(this, name, defVal);
                    };
                    
                    console.log('✅ Dynamic WebSocket configuration enabled');
                    console.log('WebSocket will connect to:', window.location.hostname + ':7576');
                    if (dynamicHost) console.log('Target VNC host:', dynamicHost);
                    if (dynamicPort) console.log('Target VNC port:', dynamicPort);
                }
                
                // Also try to override UI.getSetting if it exists
                if (window.UI && typeof window.UI.getSetting === 'function') {
                    const originalGetSetting = window.UI.getSetting;
                    
                    window.UI.getSetting = function(name) {
                        if (name === 'host') {
                            return window.location.hostname;
                        }
                        if (name === 'port') {
                            return '7576';
                        }
                        if (name === 'path') {
                            let path = '/';
                            if (dynamicHost || dynamicPort) {
                                const params = new URLSearchParams();
                                if (dynamicHost) params.set('host', dynamicHost);
                                if (dynamicPort) params.set('port', dynamicPort);
                                path += '?' + params.toString();
                            }
                            return path;
                        }
                        if (name === 'encrypt') {
                            return false;
                        }
                        return originalGetSetting.call(this, name);
                    };
                }
            }, 1000);
        });
    }
})();
