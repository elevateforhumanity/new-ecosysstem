/**
 * CLIENT-SIDE SECURITY MEASURES
 * Implements additional security measures on the client side
 */

(function() {
  'use strict';
  
  // Disable right-click context menu (basic protection)
  document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    return false;
  });
  
  // Disable F12, Ctrl+Shift+I, Ctrl+U (basic protection)
  document.addEventListener('keydown', function(e) {
    // F12
    if (e.keyCode === 123) {
      e.preventDefault();
      return false;
    }
    
    // Ctrl+Shift+I
    if (e.ctrlKey && e.shiftKey && e.keyCode === 73) {
      e.preventDefault();
      return false;
    }
    
    // Ctrl+U
    if (e.ctrlKey && e.keyCode === 85) {
      e.preventDefault();
      return false;
    }
    
    // Ctrl+S
    if (e.ctrlKey && e.keyCode === 83) {
      e.preventDefault();
      return false;
    }
  });
  
  // Detect developer tools (basic detection)
  let devtools = {
    open: false,
    orientation: null
  };
  
  setInterval(function() {
    if (window.outerHeight - window.innerHeight > 200 || 
        window.outerWidth - window.innerWidth > 200) {
      if (!devtools.open) {
        devtools.open = true;
        console.clear();
        console.log('%cDeveloper tools detected!', 'color: red; font-size: 20px; font-weight: bold;');
        console.log('%cThis site is protected. Unauthorized access is prohibited.', 'color: red; font-size: 14px;');
      }
    } else {
      devtools.open = false;
    }
  }, 500);
  
  // Console warning
  console.log('%cSTOP!', 'color: red; font-size: 50px; font-weight: bold;');
  console.log('%cThis is a browser feature intended for developers. Unauthorized access to this system is prohibited.', 'color: red; font-size: 16px;');
  console.log('%cIf someone told you to copy-paste something here, it is likely a scam.', 'color: red; font-size: 14px;');
  
  // Disable text selection (basic protection)
  document.onselectstart = function() {
    return false;
  };
  
  document.onmousedown = function() {
    return false;
  };
  
  // Clear console periodically
  setInterval(function() {
    console.clear();
  }, 10000);
  
  // Basic anti-debugging
  function detectDebugger() {
    const start = new Date().getTime();
    debugger;
    const end = new Date().getTime();
    
    if (end - start > 100) {
      console.log('Debugger detected!');
      // Could redirect or take other action
    }
  }
  
  // Run detection periodically
  setInterval(detectDebugger, 1000);
  
})();