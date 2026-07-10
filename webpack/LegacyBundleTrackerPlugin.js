const fs = require('fs');
const path = require('path');

const PLUGIN_NAME = 'LegacyBundleTrackerPlugin';

class LegacyBundleTrackerPlugin {
  constructor(options = {}) {
    this.options = {
      filename: 'webpack-stats.json',
      path: '.',
      ...options
    };
  }

  apply(compiler) {
    compiler.hooks.compile.tap(PLUGIN_NAME, () => {
      this.writeOutput(compiler, { status: 'compiling' });
    });

    compiler.hooks.done.tap(PLUGIN_NAME, stats => {
      if (stats.hasErrors()) {
        const [error] = stats.toJson({ all: false, errors: true }).errors;
        this.writeOutput(compiler, {
          status: 'error',
          error: (error && error.name) || 'unknown-error',
          message: (error && error.message) || String(error || '')
        });
        return;
      }

      const chunks = {};
      for (const chunk of stats.compilation.chunks) {
        if (!chunk.name) continue;

        chunks[chunk.name] = Array.from(chunk.files).map(filename => ({
          name: filename,
          ...(compiler.options.output.publicPath
            ? { publicPath: `${compiler.options.output.publicPath}${filename}` }
            : {}),
          ...(compiler.options.output.path ? { path: path.join(compiler.options.output.path, filename) } : {})
        }));
      }

      this.writeOutput(compiler, { status: 'done', chunks });
    });

    compiler.hooks.failed.tap(PLUGIN_NAME, error => {
      this.writeOutput(compiler, {
        status: 'error',
        error: error.name || 'unknown-error',
        message: error.message || String(error)
      });
    });
  }

  writeOutput(compiler, contents) {
    const outputPath = path.resolve(this.options.path, this.options.filename);
    const publicPath = this.options.publicPath || compiler.options.output.publicPath;
    const output = publicPath ? { ...contents, publicPath } : contents;

    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, JSON.stringify(output, null, this.options.indent));
  }
}

module.exports = LegacyBundleTrackerPlugin;
