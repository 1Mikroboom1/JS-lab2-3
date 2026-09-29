import { parseArgs } from './cli.js';
import { config } from './config.js';
import { getCityReport } from './services/weatherService.js';
import { formatReport } from './format/console.js';

async function main() {
  const { cities, days, noCache } = parseArgs(process.argv.slice(2));

  const results = await Promise.allSettled(
    cities.map((city) =>
      getCityReport(city, days, config, {
        noCache,
      }),
    ),
  );

  let hasErrors = false;

  for (const [index, result] of results.entries()) {
    if (result.status === 'fulfilled') {
      console.log(formatReport(result.value));
    } else {
      hasErrors = true;
      console.error(`\nОшибка для города «${cities[index]}»: ${result.reason?.message ?? 'Неизвестная ошибка'}`);
    }
  }

  if (hasErrors) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(`Ошибка: ${error.message}`);
  process.exitCode = 1;
});