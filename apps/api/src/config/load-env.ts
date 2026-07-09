import { config } from 'dotenv';

import { getEnvFilePaths } from './env-path';

for (const path of getEnvFilePaths()) {
  config({ path, override: false });
}
