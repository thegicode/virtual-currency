export function cloneTemplate<T extends HTMLElement>(
    template: HTMLTemplateElement
) {
    const content = template.content.firstElementChild;
    if (!content) {
        throw new Error("Template content is empty");
    }
    return content.cloneNode(true) as T;
}

export function updateElementsTextWithData<T>(data: T, container: HTMLElement) {
    Object.entries(data as Record<string, unknown>).forEach(([key, value]) => {
        const element = container.querySelector(`.${key}`) as HTMLElement;
        element.textContent = String(value);
    });
}
