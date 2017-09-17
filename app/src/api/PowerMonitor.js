const electron = require('electron');

class PowerMonitor {
    enable() {
        const powerSaveBlocker = electron.powerSaveBlocker;

        // Activate sleep blocker
        powerSaveBlocker.start('prevent-display-sleep')
    }
}

module.exportts = PowerMonitor;
