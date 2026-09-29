export function parseArgs(argv) {
  const args = {
    city: null,
    days: 3,
    noCache: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === '--city') {
      const value = argv[i + 1];
      if (!value || value.startsWith('--')) {
        throw new Error('Параметр --city требует название города.');
      }
      args.city = value;
      i += 1;
    } else if (arg === '--days') {
      const value = argv[i + 1];
      if (!value || value.startsWith('--') || !/^\d+$/.test(value)) {
        throw new Error('Параметр --days должен быть целым числом от 1 до 7.');
      }
      args.days = Number(value);
      i += 1;
    } else if (arg === '--no-cache') {
      args.noCache = true;
    } else {
      throw new Error(`Неизвестный аргумент: ${arg}`);
    }
  }

  if (!args.city) {
    throw new Error('Параметр --city обязателен.');
  }

  if (args.days < 1 || args.days > 7) {
    throw new Error('Параметр --days должен быть в диапазоне от 1 до 7.');
  }

  const cities = args.city
    .split(',')
    .map((city) => city.trim())
    .filter(Boolean);

  if (cities.length === 0) {
    throw new Error('Необходимо указать хотя бы один город.');
  }

  return { ...args, cities };
}