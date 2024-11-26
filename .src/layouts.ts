import { ComponentProperties } from "./component.js";
import type { Component, LayoutComponent } from "./types.js";
import { eventHandlersMap } from "./component.js";
import { debugInfo } from "./helpers.js";
let viewOptions = [
    "noscrollbar",
    "scrollxy",
    "scrollx",
    "scrolly",
    "top",
    "bottom",
    "left",
    "right",
    "horizontal",
    "vertical",
    "vcenter",
    "center",
    "fillxy",
    "fillx",
    "filly",
];

/**
 * Applies the provided options to the given HTML element by adding corresponding CSS classes.
 */
export const optionsApi = (element: HTMLElement, options: string) => {
    options
        .toLowerCase()
        .replace(/\s/g, "")
        .split(",")
        .forEach((option) => {
            if (viewOptions.includes(option)) {
                element.classList.add(option);
            } else {
                console.error(`Unknown option: ${option}`);
            }
        });
};

/**
 * Applies layout styles to the provided element based on the layout type and options.
 */
function layoutFitApi(layout: HTMLElement, type: string, options: string) {
    if (options) optionsApi(layout, options);

    const layoutTYPE = type.toLowerCase();

    switch (layoutTYPE) {
        case "linear":
            layout.classList.add("layout-linear");
            break;
        case "absolute":
            layout.classList.add("layout-absolute");
            break;
        case "frame":
            layout.classList.add("layout-frame");
            break;
        case "stack":
            const directionClass = options?.includes("vertical") ? "layout-stack-vertical" : "layout-stack-horizontal";
            layout.classList.add(directionClass);
            break;
        default:
            console.error("Unknown Layout", layoutTYPE);
    }
}

//@ts-ignore
const Layout: LayoutComponent = class extends ComponentProperties {
    type: string;
    /**
     * Creates a new layout element with the specified type and options.
     */
    constructor(type: string, options: string) {
        super();
        this.element = document.createElement("div");
        this.element.id = crypto.randomUUID();

        this.type = `LAYOUT`;
        type ? layoutFitApi(this.element, type, options) : null;
    }

    /*** Add a child component to this component.*/
    AddChild(child: Component): this {
        if (!child?.element) {
            console.warn(`The passed object is not a valid Rosana/HTML element.`, child);
            return this;
        }
        this.element.appendChild(child.element);
        return this;
    }

    /*** Remove a child component from the layout */
    DestroyChild(child: Component): this {
        if (!child?.element) {
            debugInfo("The passed child is null/undefined or not a valid Rosana component.", "destroyChild Function", child);
            return this;
        }

        eventHandlersMap.delete(child.element.id);
        child.element.remove();
        return this;
    }
};

export default Layout;
