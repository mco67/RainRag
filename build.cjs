const esbuild = require("esbuild");

esbuild.build({
  entryPoints: ["src/index.ts"],
  bundle: true,
  platform : "node",
  outfile: "dist/index.cjs",
  sourcemap: true,
  target: "es2020",
  format: "cjs",
  external: ['mock-socket', '@babel/plugin-transform-modules-commonjs', '@babel/plugin-proposal-export-namespace-from'],
  resolveExtensions: [".ts", ".js", ".mjs", ".json"]
}).catch(() => process.exit(1));

esbuild.build({
  entryPoints: ["src/encoder.ts"],
  bundle: true,
  platform : "node",
  outfile: "dist/encoder.cjs",
  sourcemap: true,
  target: "es2020",
  format: "cjs",
  external: ['mock-socket', '@babel/plugin-transform-modules-commonjs', '@babel/plugin-proposal-export-namespace-from'],
  resolveExtensions: [".ts", ".js", ".mjs", ".json"]
}).catch(() => process.exit(1));