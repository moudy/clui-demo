const parseScalar = (str, type) => {
  const scalarType = getScalarType(type);

  switch (scalarType) {
    case 'ID':
    case 'String':
      return str;
    case 'Int':
      return parseInt(str, 10);
    case 'FLoat':
      return parseFloat(str);
    case 'Boolean':
      return ['0', 'false'].includes(str) ? false : !!str;
    default:
      return undefined;
  }
};

export const getScalarType = (argType) => {
  if (argType.kind === 'SCALAR' && argType.name) {
    return argType.name;
  }

  if (argType.ofType) {
    return getScalarType(argType.ofType);
  }

  return undefined;
};

export const isNonNull = (argType) => {
  if (argType.kind === 'NON_NULL') {
    return true;
  }

  if (argType.ofType) {
    return isNonNull(argType.ofType);
  }

  return false;
};

const parseValue = (value, type) => {
  const queue = [type];

  while (queue.length) {
    const node = queue.shift();

    if (!node) {
      continue;
    }

    if (node.kind === 'ENUM') {
      return value.toUpperCase();
    }

    if (node.kind === 'SCALAR') {
      return parseScalar(value, node);
    }

    if (node.kind === 'LIST' && node.ofType) {
      const { ofType } = node;

      return value.split(',').reduce((acc, v) => {
        const scalar = parseScalar(v.trim(), ofType);

        if (scalar) {
          acc.push(scalar);
        }

        return acc;
      }, []);
    }

    if (node.ofType) {
      queue.unshift(node.ofType);
    }
  }

  return undefined;
};

// The submitted data from the user is just a map to strings
// to string | boolean. This takes that map and casts it's values
// to match the types defined by the graphql field arguments
// so the query/mutation is called with valid variables
// Not hanldeing every case (like nested lists) and just
// uppercasing ENUM stings for now (could get actual ENUM type info later?)
export const parseArgs = (opts) => {
  const required = [];
  const optional = [];
  const variables = {};

  for (const arg of opts.fieldArgs) {
    const value = opts.argsProp[arg.name];

    const scalarType = getScalarType(arg.type);
    const isBool = scalarType === 'Boolean';
    const isNum = scalarType === 'Int' || scalarType === 'Float';

    if (
      (!isBool && typeof value === 'boolean') ||
      typeof value === 'undefined'
    ) {
      if (arg.type.kind === 'NON_NULL') {
        required.push(arg);
      } else {
        optional.push(arg);
      }
    } else if (isBool && typeof value === 'boolean') {
      variables[arg.name] = value;
    } else if (isNum && typeof value === 'number') {
      variables[arg.name] = value;
    } else if (typeof value === 'string') {
      const val = parseValue(value, arg.type);

      if (val) {
        variables[arg.name] = val;
      }
    }
  }

  const missing = {
    ...(required.length ? { required } : {}),
    ...(optional.length ? { optional } : {}),
  };

  return { variables, missing };
};