const path = require('path');
const webpack = require('webpack');
const { createFsFromVolume, Volume } = require('memfs');

async function build() {
  const mode = process.argv[2];
  const config = require(mode === 'development' ? '../../webpack.config-dev' : '../../webpack.config');
  // Use the actual module rules/loaders without starting HMR or overwriting the
  // app's bundles/stats. The earlier worker tests mocked the detector import.
  const output = createFsFromVolume(new Volume());
  output.join = path.join;
  const outputPath = path.join(config.context, 'contact-worker-test-output');
  const compiler = webpack({
    mode,
    context: config.context,
    entry: './js/viewer/contacts/createContactWorker.js',
    module: config.module,
    resolve: config.resolve,
    optimization: config.optimization,
    // This isolated entry embeds the entire detector; bundle-size hints are
    // checked by the normal application build, not this import regression.
    performance: false,
    output: { path: outputPath, filename: 'worker-factory.js', library: { type: 'commonjs2' } }
  });
  compiler.outputFileSystem = output;
  try {
    const stats = await new Promise((resolve, reject) => {
      compiler.run((error, result) => (error ? reject(error) : resolve(result)));
    });
    process.stdout.write(
      JSON.stringify({
        diagnostics: stats.toJson({ all: false, errors: true, warnings: true }),
        source: stats.hasErrors() ? null : output.readFileSync(path.join(outputPath, 'worker-factory.js'), 'utf8')
      })
    );
  } finally {
    await new Promise((resolve, reject) => compiler.close(error => (error ? reject(error) : resolve())));
  }
}

build().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
