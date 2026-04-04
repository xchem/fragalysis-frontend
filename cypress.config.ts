import { defineConfig } from "cypress";
import * as dotenv from "dotenv";

const fs = require('fs')
const pixelmatchModule = require('pixelmatch')
const pixelmatch = pixelmatchModule.default || pixelmatchModule
const { PNG } = require('pngjs')

// Load environment variables from .env file
dotenv.config();

export default defineConfig({
  e2e: {
    baseUrl: "https://fragalysis-tibor-default.xchem-dev.diamond.ac.uk",
    env: {
      login: process.env.CYPRESS_LOGIN,
      password: process.env.CYPRESS_PASSWORD,
    },
    setupNodeEvents(on) {
      on("task", {
        compareScreenshots({ beforePath, afterPath }) {
          const before = PNG.sync.read(fs.readFileSync(beforePath));
          const after = PNG.sync.read(fs.readFileSync(afterPath));

          if (before.width !== after.width || before.height !== after.height) {
            return { changedPixels: -1, reason: "Different image size" };
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
        },
      });
    },
  },
});



