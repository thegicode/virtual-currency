import Nav from "@scripts/components/Nav";

export default class Base {
    private readonly name;

    constructor(name: string) {
        this.name = name;
    }

    log() {
        console.log("Nav", Nav);
        return this.name;
    }
}
