module.exports = {
    pluginOptions: {
        electronBuilder: {
            builderOptions: {
                // options placed here will be merged with default configuration and passed to electron-builder
                "appId": "org.fluffy.electron.mod-manager",
                "productName": "RimWorld Mod Manager",
                "win": {
                    "target": ["nsis", "zip"],
                    "publish": ["github"]
                },
                "nsis": {
                    "oneClick": true,
                    "allowToChangeInstallationDirectory": false
                },
                "publish": [{
                    "provider": "github",
                    "owner": "fluffy-mods",
                    "repo": "ModManager-Standalone"
                }]
            }
        }
    }
}
