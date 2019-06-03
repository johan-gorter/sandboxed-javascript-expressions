// tslint:disable no-console

export let noop = (): void => undefined;

export let logger = {
  error: (...args: any[]) => {
    console.error('Unexpected error', ...args);
  },
  info: (message: string, ...args: any[]) => {
    console.info(message, ...args);
  }
};
