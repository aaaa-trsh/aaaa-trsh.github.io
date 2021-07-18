class NumberInput {
    constructor(element) {
        element.value = element.value.match(/\d*\.?\d+/);
        if (!element.value.includes("."))
            element.value += ".0";
        element.addEventListener("change", (e) => {
            element.value = element.value.match(/\d*\.?\d+/);
            if (!element.value.includes("."))
                element.value += ".0";
        });
        this.element = element;
    }

    value() {
        return this.element.value != "" ? parseFloat(this.element.value) : 0;
    }
}

let numberInputs = {

};
window.addEventListener("load", () => {
    Array.from(document.getElementsByClassName("numinput")).forEach((element) => {
        numberInputs[element.id] = new NumberInput(element);
    });
});
