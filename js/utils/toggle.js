let Toggle = class {
    constructor(element, onCallback, offCallback, onState=true) {
        this.element = element;
        this.onState = onState;
        this.element.addEventListener("click", () => { this.onClicked(onCallback, offCallback); } );
        this.onCallback = onCallback;
        this.offCallback = offCallback;
        this.onSprite = () => { element.src = "./assets/eyeClosed.png"; }
        this.offSprite = () => { element.src = "./assets/eye.png"; }
    }
    get state() {
        return this.onState;
    }
    onClicked(on, off) {
        if (this.onState) { on(); this.onSprite(); }
        else { off(); this.offSprite(); }
        this.onState = !this.onState;
    }
};