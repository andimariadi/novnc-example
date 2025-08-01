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
    
    // Override the WebSocket URL if dynamic parameters are provided
    if (dynamicHost || dynamicPort) {
        // Wait for noVNC modules to load
        document.addEventListener('DOMContentLoaded', function() {
            // Set timeout to ensure all modules are loaded
            setTimeout(function() {
                // Override the getSetting function for host and port
                if (window.UI && typeof window.UI.getSetting === 'function') {
                    const originalGetSetting = window.UI.getSetting;
                    
                    window.UI.getSetting = function(name) {
                        if (name === 'host' && dynamicHost) {
                            return dynamicHost;
                        }
                        if (name === 'port' && dynamicPort) {
                            return dynamicPort;
                        }
                        // For path, we need to include the dynamic parameters
                        if (name === 'path') {
                            let path = originalGetSetting.call(this, name) || '/';
                            if (dynamicHost || dynamicPort) {
                                const params = new URLSearchParams();
                                if (dynamicHost) params.set('host', dynamicHost);
                                if (dynamicPort) params.set('port', dynamicPort);
                                path += (path.includes('?') ? '&' : '?') + params.toString();
                            }
                            return path;
                        }
                        return originalGetSetting.call(this, name);
                    };
                    
                    console.log('Dynamic WebSocket configuration enabled');
                    if (dynamicHost) console.log('Dynamic host:', dynamicHost);
                    if (dynamicPort) console.log('Dynamic port:', dynamicPort);
                }
            }, 1000);
        });
    }
})();
