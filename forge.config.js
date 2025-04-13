
module.exports = {
    packagerConfig: {
        asar: true,
    },
    rebuildConfig: {},
    makers: [
        {
            name: '@electron-forge/maker-zip',
            platforms: ["win32"],
        },
    ],
    plugins: [
        {
            name: '@electron-forge/plugin-webpack',
            config: {
                mainConfig: './webpack.main.config.js',
                renderer: {
                    config: './webpack.renderer.config.js',
                    entryPoints: [
                        {
                            html: './src/render/lockScreen.html',
                            js: './src/render/renderer.js',
                            name: 'kilit',
                            preload: {
                                js: './src/render/preload.js',
                            },
                        },
                    ],
                },
            },
        },
    ],
};
