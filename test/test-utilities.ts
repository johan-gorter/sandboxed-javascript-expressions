/* eslint-disable no-console */

export let noop = (): void => undefined;

export let logger = {
  error: (...args: any[]): void => {
    console.error("Unexpected error", ...args);
  },
  info: (message: string, ...args: any[]): void => {
    console.info(message, ...args);
  },
};
