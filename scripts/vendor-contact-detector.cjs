// Regeneration only: the application/build uses the checked-in computation bundle.
// See js/viewer/contacts/vendor/README.md for pinned sources and provenance.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const esbuild = require('esbuild');

const referenceRoot = path.resolve(process.argv[2]);
const threeRoot = path.resolve(process.argv[3]);
const signalsRoot = path.resolve(process.argv[4]);
const repoRoot = path.resolve(__dirname, '..');
const bridge = path.join(__dirname, 'contact-detector');
const output = path.join(repoRoot, 'js/viewer/contacts/vendor');
const hash = bytes =>
  crypto
    .createHash('sha256')
    .update(bytes)
    .digest('hex');

async function generate() {
  const threeMath = fs
    .readdirSync(path.join(threeRoot, 'src/math'))
    .filter(name => name.endsWith('.js'))
    .map(name => `export * from ${JSON.stringify(path.join(threeRoot, 'src/math', name).replace(/\\/g, '/'))};`)
    .join('\n');
  const result = await esbuild.build({
    absWorkingDir: referenceRoot,
    entryPoints: [path.join(bridge, 'entry.js')],
    bundle: true,
    write: false,
    format: 'esm',
    platform: 'neutral',
    target: 'es2019',
    tsconfigRaw: { compilerOptions: { useDefineForClassFields: false } },
    metafile: true,
    legalComments: 'inline',
    plugins: [
      {
        name: 'computation-only',
        setup(build) {
          build.onResolve({ filter: /^three$/ }, () => ({ path: 'three-math', namespace: 'math' }));
          build.onLoad({ filter: /.*/, namespace: 'math' }, () => ({ contents: threeMath, resolveDir: threeRoot }));
          build.onResolve({ filter: /^signals$/ }, () => ({ path: path.join(signalsRoot, 'dist/signals.js') }));
          build.onResolve({ filter: /^(reference\/|\.)/ }, args => {
            let file = args.path.startsWith('reference/')
              ? path.join(referenceRoot, args.path.slice(10))
              : path.resolve(args.resolveDir, args.path);
            const relative = path
              .relative(referenceRoot, file)
              .replace(/\\/g, '/')
              .replace(/\.(js|ts)$/, '');
            if (relative === 'src/globals') return { path: path.join(bridge, 'globals.js') };
            if (relative === 'src/utils/picker') return { path: path.join(bridge, 'picker.js') };
            if (relative === 'src/surface/volume' || relative === 'src/surface/filtered-volume') {
              return { path: path.join(bridge, 'unsupported-volume.js') };
            }
            if (/^src\/(viewer|stage|component|representation|buffer|color|worker)\//.test(relative)) {
              throw new Error(`Rendering module must not enter contact detector: ${relative}`);
            }
            if (!fs.existsSync(file) && file.endsWith('.js') && fs.existsSync(file.slice(0, -3) + '.ts')) {
              file = file.slice(0, -3) + '.ts';
            }
            if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {
              file = ['.ts', '.js', '.json'].map(ext => file + ext).find(fs.existsSync);
            }
            if (file) return { path: file };
          });
        }
      }
    ]
  });
  const inputs = Object.keys(result.metafile.inputs)
    .filter(name => !name.startsWith('math:'))
    .map(name => {
      const file = path.resolve(referenceRoot, name);
      const source = file.startsWith(referenceRoot)
        ? `ngl/${path.relative(referenceRoot, file)}`
        : file.startsWith(threeRoot)
        ? `three/${path.relative(threeRoot, file)}`
        : file.startsWith(signalsRoot)
        ? `signals/${path.relative(signalsRoot, file)}`
        : `fragalysis/${path.relative(repoRoot, file)}`;
      return { source: source.replace(/\\/g, '/'), sha256: hash(fs.readFileSync(file)) };
    });
  fs.mkdirSync(output, { recursive: true });
  // Keep the upstream UUID format, but replace its weak entropy in the shipped bundle.
  const uuidRandomness = /var d0 = Math\.random\(\) \* 4294967295 \| 0;\s+var d1 = Math\.random\(\) \* 4294967295 \| 0;\s+var d2 = Math\.random\(\) \* 4294967295 \| 0;\s+var d3 = Math\.random\(\) \* 4294967295 \| 0;/;
  const secureSource = result.outputFiles[0].text.replace(
    uuidRandomness,
    'var [d0, d1, d2, d3] = crypto.getRandomValues(new Uint32Array(4));'
  );
  if (secureSource === result.outputFiles[0].text) {
    throw new Error('Could not apply the contact detector UUID security patch');
  }
  const code =
    '/* Vendored computation-only NGL 2.0.0-dev.37 contact detector. See README.md and LICENSE. */\n' +
    secureSource
      .replaceAll(
        path.relative(referenceRoot, path.join(signalsRoot, 'dist/signals.js')).replace(/\\/g, '/'),
        'signals/dist/signals.js'
      )
      .replace(/^\/\/ .*?(src\/|scripts\/contact-detector\/)/gm, '// $1');
  fs.writeFileSync(path.join(output, 'detector.mjs'), code);
  fs.writeFileSync(
    path.join(output, 'provenance.json'),
    JSON.stringify(
      {
        version: '2.0.0-dev.37',
        commit: 'fc81766d4376275ff703f6d8a840dc4990b173dc',
        esbuild: esbuild.version,
        modifications: ['UUID entropy uses Web Crypto getRandomValues instead of Math.random'],
        sha256: hash(code),
        inputs
      },
      null,
      2
    ) + '\n'
  );
  const mit = fs.readFileSync(path.join(referenceRoot, 'LICENSE'), 'utf8');
  fs.writeFileSync(
    path.join(output, 'LICENSE'),
    [
      `NGL\n\n${mit}`,
      `Three.js math\n\n${fs.readFileSync(path.join(threeRoot, 'LICENSE'), 'utf8')}`,
      `JS Signals 1.0.0 — MIT, Miller Medeiros\n\n${mit.replace(/Copyright[^\n]+/, 'Copyright (c) Miller Medeiros')}`
    ].join('\n\n')
  );
  console.log(`Vendored ${inputs.length} computational inputs, ${Buffer.byteLength(code)} bytes`);
}
generate().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
