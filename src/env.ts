const env: string | undefined = typeof process.env.NODE_ENV !== 'undefined' ? process.env.NODE_ENV : 'development';

export {env};
