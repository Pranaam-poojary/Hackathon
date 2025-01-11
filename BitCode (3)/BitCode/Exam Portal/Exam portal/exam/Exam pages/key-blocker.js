class KeyBlocker {
    constructor() {
        this.blockedKeys = [
            'Escape', 
            'ControlLeft', 'ControlRight', 
            'ShiftLeft', 'ShiftRight', 
            'AltLeft', 'AltRight', 
            'MetaLeft', 'MetaRight', 
            'Tab'
        ];
        this.boundBlockKeys = this.blockKeys.bind(this);
    }

    blockKeys(event) {
        if (this.blockedKeys.includes(event.code)) {
            event.preventDefault();
            event.stopPropagation();
            return false;
        }
    }

    enableBlocking() {
        document.addEventListener('keydown', this.boundBlockKeys, true);
    }

    disableBlocking() {
        document.removeEventListener('keydown', this.boundBlockKeys, true);
    }
}