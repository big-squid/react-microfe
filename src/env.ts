const safeParseJSON = (val: any) => {
  try {
    return JSON.parse(val);
  } catch (err) {
    return val;
  }
};

/**
 * Get a variable in scope called `reactMicrofeEnv`
 * Wrapped in a try / catch to prevent this from exploding
 * If the variable is undefined
 */
const getMicrofeEnv = () => {
  try {
    // eslint-disable-next-line
    // @ts-ignore
    return reactMicrofeEnv || {};
  } catch (err) {
    return {};
  }
};

/**
 * Gets process.env safely
 * Wrapped in a try / catch to prevent this from exploding
 * If the variable is undefined
 */
const getProcessEnv = () => {
  try {
    // eslint-disable-next-line
    // @ts-ignore
    return process.env;
  } catch (err) {
    return {};
  }
};

export const env = (
  name: string,
  defaultValue?: string | number | boolean | null
): string | number | boolean | null => {
  const mEnv = getMicrofeEnv();
  const pEnv = getProcessEnv();
  if (name in mEnv) {
    return safeParseJSON(mEnv[name]);
  } else if (name in pEnv) {
    return safeParseJSON(pEnv[name]);
  } else if (defaultValue !== undefined) {
    return defaultValue;
  } else {
    throw Error(`Missing environment variable '${name}'`);
  }
};

export default env;
