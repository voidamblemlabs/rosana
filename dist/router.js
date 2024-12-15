/**
 * A secure router that supports route guards, 404 handling, lazy loading, and nested routes.
 *
 * This router provides the ability to manage navigation, dynamically match routes with parameters,
 * and load components lazily. It also allows for route guards to be added, and includes support
 * for nested routes and handling of 404 errors.
 *
 * @param {Array<Route>} routes - The initial list of routes to configure the router with.
 *
 * @returns {Object} An API for managing routes, guards, and navigation within the app.
 */
function pageRouter(routes) {
    const guards = [];
    let params = null;
    let notFound = null;
    let currentRoute = null;
    /**
     * Handles the route change by matching the current URL path and loading the corresponding component.
     * It also checks the route guards before proceeding.
     */
    const handleRouteChange = async () => {
        const path = window.location.pathname;
        const matchedRoute = matchRoute(path, routes);
        if (matchedRoute) {
            params = matchedRoute.params;
            for (const guard of guards) {
                if (!(await guard(matchedRoute))) {
                    console.warn("Navigation cancelled by guard.");
                    return;
                }
            }
            currentRoute = matchedRoute;
            await loadComponent(matchedRoute);
        }
        else if (notFound) {
            //@ts-ignore
            await loadComponent({ component: notFound });
        }
        else {
            console.error(`Route not found for path: ${path}`);
        }
    };
    /**
     * Matches the given path to the defined routes, including handling dynamic route parameters
     * and nested routes.
     *
     * @param {string} path - The current URL path to match.
     * @param {Array<Route>} routes - The list of routes to search through.
     *
     * @returns {MatchedRoute | null} The matched route or null if no match is found.
     */
    const matchRoute = (path, routes) => {
        for (const route of routes) {
            const { regex, keys } = pathToRegex(route.path);
            const match = path.match(regex);
            if (match) {
                const params = keys.reduce((acc, key, index) => {
                    acc[key] = match[index + 1];
                    return acc;
                }, {});
                if (route.children) {
                    const nestedRoute = matchRoute(path.replace(regex, ""), route.children);
                    if (nestedRoute) {
                        return { ...route, params, nested: nestedRoute };
                    }
                }
                return { ...route, params };
            }
        }
        return null;
    };
    /**
     * Converts a route path to a regular expression, allowing for dynamic parameters.
     *
     * @param {string} path - The route path to convert to a regex.
     *
     * @returns {{ regex: RegExp, keys: string[] }} The regex and an array of parameter keys.
     */
    const pathToRegex = (path) => {
        const keys = [];
        const regexString = path
            .replace(/:([\w]+)/g, (_, key) => {
            keys.push(key);
            return "([^\\/]+)";
        })
            .replace(/\//g, "\\/");
        return { regex: new RegExp(`^${regexString}$`), keys };
    };
    /**
     * Loads a route's component, supporting lazy loading and nested routes.
     *
     * @param {MatchedRoute} route - The matched route for which to load the component.
     *
     * @returns {Promise<void>} Resolves when the component has been successfully loaded.
     */
    const loadComponent = async (route) => {
        let component = route.component;
        if (typeof component === "function") {
            const module = await component();
            component = module.default;
        }
        if (component && typeof route.onLoad === "function") {
            route.onLoad(component);
        }
        else if (component) {
            const container = document.querySelector("#app");
            if (container) {
                container.innerHTML = "";
                const instance = component;
                //@ts-ignore
                if (instance && instance.element) {
                    //@ts-ignore
                    container.appendChild(instance.element);
                    //@ts-ignore
                    if (typeof instance.routingInfo === "function") {
                        //@ts-ignore
                        instance.routingInfo(params);
                    }
                    if (route.nested) {
                        await loadComponent(route.nested);
                    }
                }
                else {
                    console.error(`Imported Route Is Not A Valid Component: ${instance}`);
                }
            }
        }
    };
    // Public API
    return {
        /**
         * Installs the router into the provided app instance.
         *
         * @param {any} app - The app instance where the router will be installed.
         */
        install(app) {
            app.router = this;
            this.init();
        },
        /**
         * Adds a guard function to the router that will be called before navigation.
         *
         * @param {(route: any) => boolean | Promise<boolean>} guardFn - The guard function that will be invoked on route changes.
         */
        addGuard(guardFn) {
            guards.push(guardFn);
        },
        /**
         * Sets the component to be shown when a route is not found.
         *
         * @param {() => Promise<{ default: any }>} component - The 404 component to be shown when a route is not found.
         */
        setNotFound(component) {
            notFound = component;
        },
        /**
         * Adds a new route to the router.
         *
         * @param {string} path - The route path to match.
         * @param {() => Promise<{ default: any }>} component - The component to be loaded for the route.
         * @param {RouteOptions} options - Additional options for the route.
         */
        add(path, component, options = {}) {
            routes.push({ path, component, options });
        },
        /**
         * Registers a function to be called when the route is loaded.
         *
         * @param {string} route - The route path to match.
         * @param {(component: any) => void} fn - The function to be called when the route is loaded.
         */
        on(route, fn) {
            const matchedRoute = routes.find((r) => r.path === route);
            if (matchedRoute)
                matchedRoute.onLoad = fn;
        },
        /**
         * Navigates to the specified path, replacing dynamic route parameters with provided values.
         *
         * @param {string} path - The route path to navigate to.
         * @param {Record<string, string>} params - The parameters to replace in the route path.
         */
        navigateTo(path, params = {}) {
            const fullPath = path.replace(/:([\w]+)/g, (_, key) => {
                if (params[key] === undefined) {
                    console.error(`Parameter "${key}" not provided for path: ${path}`);
                    return `:${key}`;
                }
                return params[key];
            });
            history.pushState(null, "", fullPath);
            handleRouteChange();
        },
        /**
         * Initializes the router and listens for popstate events (back/forward navigation).
         */
        init() {
            handleRouteChange();
            window.addEventListener("popstate", handleRouteChange);
        },
        /**
         * Navigates back in the browser history.
         */
        back() {
            history.back();
        },
        /**
         * Navigates forward in the browser history.
         */
        forward() {
            history.forward();
        },
    };
}
export default pageRouter;
