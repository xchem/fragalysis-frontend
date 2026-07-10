import { defineConfig } from 'cypress';
import * as dotenv from 'dotenv';

const fs = require('fs');
const pixelmatchModule = require('pixelmatch');
const pixelmatch = pixelmatchModule.default || pixelmatchModule;
const { PNG } = require('pngjs');

dotenv.config();

const defaultBaseUrl = 'https://fragalysis-simona-default.xchem-dev.diamond.ac.uk';

export default defineConfig({
  video: true,
  screenshotOnRunFailure: true,
  trashAssetsBeforeRuns: true,
  screenshotsFolder: 'cypress/screenshots',
  videosFolder: 'cypress/videos',
  e2e: {
    baseUrl: process.env.CYPRESS_BASE_URL || defaultBaseUrl,
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    env: {
      login: process.env.CYPRESS_LOGIN,
      password: process.env.CYPRESS_PASSWORD
    },
    setupNodeEvents(on) {
      on('task', {
        compareScreenshots({ beforePath, afterPath }) {
          const before = PNG.sync.read(fs.readFileSync(beforePath));
          const after = PNG.sync.read(fs.readFileSync(afterPath));

          if (before.width !== after.width || before.height !== after.height) {
            return { changedPixels: -1, reason: 'Different image size' };
          }

          const diff = new PNG({ width: before.width, height: before.height });
          const changedPixels = pixelmatch(
            before.data,
            after.data,
            diff.data,
            before.width,
            before.height,
            { threshold: 0.1 }
          );

          return { changedPixels };
        }
      });
    }
  }
});
