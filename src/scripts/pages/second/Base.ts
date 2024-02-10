export default class Base {
    private readonly name;

    constructor(name: string) {
        this.name = name;
    }

    log() {
        return this.name;
    }
}
