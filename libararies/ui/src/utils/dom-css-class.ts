export function updateDomCssClass(
  element: HTMLElement,
  previousCssClass: string | undefined,
  nextCssClass: string | undefined,
): void {
  if (previousCssClass) {
    element.classList.remove(previousCssClass);
  }

  if (nextCssClass) {
    element.classList.add(nextCssClass);
  }
}
