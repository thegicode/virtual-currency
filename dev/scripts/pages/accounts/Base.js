import Nav from "@scripts/components/Nav";
export default class Base {
    constructor(name) {
        this.name = name;
    }
    log() {
        console.log("Nav", Nav);
        return this.name;
    }
}
//# sourceMappingURL=Base.js.map