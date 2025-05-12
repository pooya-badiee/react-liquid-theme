export function throttle<T extends (...args: Parameters<T>) => ReturnType<T>>(
  fn: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null

  return function (this: ThisParameterType<T>, ...args: Parameters<T>): void {
    if (timeout) return

    timeout = setTimeout(() => {
      fn.apply(this, args)
      timeout = null
    }, delay)
  }
}
