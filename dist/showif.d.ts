/**
 * The `showIF` function conditionally shows or hides two elements based on a truthy or falsy value.
 * It takes a boolean `restingParameter` to determine which element to Show or Hide.
 *
 * - If `restingParameter` is truthy, the `onTruthyElement` is shown and `onFalseyElement` is hidden.
 * - If `restingParameter` is falsy, the `onFalseyElement` is shown and `onTruthyElement` is hidden.
 *
 * @param {boolean} restingParameter - The condition to determine which element should be shown or hidden.
 *                                    If truthy, the first element is shown, and the second is hidden.
 * @param {HTMLElement} onTruthyElement - The component to Show when `restingParameter` is truthy.
 * @param {HTMLElement} onFalseyElement - The component to Show when `restingParameter` is falsy.
 *
 * @throws {Error} If either `onTruthyElement` or `onFalseyElement` is `undefined`, an error is logged.
 */
declare const showIF: (restingParameter: boolean, onTruthyElement: HTMLElement, onFalseyElement: HTMLElement) => void;
export default showIF;
