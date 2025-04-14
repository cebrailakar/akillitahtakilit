const { MakerZIP } = require("@electron-forge/maker-zip");
const { AutoUnpackNativesPlugin } = require("@electron-forge/plugin-auto-unpack-natives");
const { WebpackPlugin } = require("@electron-forge/plugin-webpack");
const { FusesPlugin } = require("@electron-forge/plugin-fuses");
const { FuseV1Options, FuseVersion } = require("@electron/fuses");
const mainConfig = require("./webpack.main.config.js");
const rendererConfig = require("./webpack.renderer.config.js");

/** @type {import('@electron-forge/shared-types').ForgeConfig} */
const config = {
  packagerConfig: {
    asar: true,
  },
  rebuildConfig: {},
  makers: [new MakerZIP({}, ["win32"])],
  plugins: [
    new AutoUnpackNativesPlugin({}),
    new WebpackPlugin({
      mainConfig,
      renderer: {
        config: rendererConfig,
        entryPoints: [
          {
            html: "./src/site/index.html",
            js: "./src/site/renderer.ts",
            name: "main_window",
            preload: {
              js: "./src/site/preload.ts",
            },
          },
        ],
      },
    }),
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};

module.exports = config;