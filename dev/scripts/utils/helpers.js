export function cloneTemplate(template) {
    const content = template.content.firstElementChild;
    if (!content) {
        throw new Error("Template content is empty");
    }
    return content.cloneNode(true);
}
export function updateElementsTextWithData(data, container) {
    Object.entries(data).forEach(([key, value]) => {
        const element = container.querySelector(`.${key}`);
        element.textContent = String(value);
    });
}
export function roundToDecimalPlace(amount, point) {
    const decimalPoint = Math.pow(10, point);
    return Math.round(amount * decimalPoint) / decimalPoint;
}
//# sourceMappingURL=helpers.js.map