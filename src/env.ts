const safeParseJSON = (val: any) => {
  try {
    return JSON.parse(val);
  } catch (err) {
    return val;
  }
};

const _env = process.env;

export const env = (
  name: string,
  defaultValue?: string | number | boolean | null
): string | number | boolean | null => {
  // @ts-ignore
  if (reactMicrofeEnv && name in reactMicrofeEnv) {
    // @ts-ignore
    return safeParseJSON(reactMicrofeEnv[name]);
  } else if (name in _env) {
    return safeParseJSON(_env[name]);
  } else if (defaultValue !== undefined) {
    return defaultValue;
  } else {
    throw Error(`Missing environment variable '${name}'`);
  }
};

export default env;
