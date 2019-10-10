import path from 'path';
import { remote } from 'electron';
import fs from 'mz/fs';
import { IPathsState } from '@/store/paths';
import { containsMods } from '@/io';
import log from 'electron-log';
// import { Key, windef } from 'windows-registry';

export async function getDefaultPaths(): Promise<IPathsState> {
    const rimworldPath = await defaultRimworldPath();
    const configPath = defaultConfigPath();
    const localPath = rimworldPath 
                        ? defaultLocalPath( rimworldPath )
                        : "";
    const steamPath = rimworldPath
                        ? defaultSteamPath( rimworldPath )
                        : "";
    const paths = {
        rimworldPath,
        configPath,
        localPath,
        steamPath
    }
    log.info( {paths} );
    return paths;
}

export function defaultConfigPath(): string {
    const configPath = path.join(
         remote.app.getPath( "userData" ),
         "../../LocalLow/Ludeon Studios/RimWorld by Ludeon Studios" );
    try {
        const stat = fs.statSync( configPath );
        if (stat.isDirectory()){
            return configPath;
        }
    } catch (err) {
        log.error( err )
        return ""; 
    }
    return "";
}

export function defaultRimworldPath(): string {
    const steamInstall = getRegistryKey( "\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\Steam App 294100", "InstallLocation" );
    const localInstall = getRegistryKey( "\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\RimWorld", "InstallLocation" );
    const steamPath = getRegistryKey( "\\SOFTWARE\\Valve\\Steam", "InstallPath" );
    return steamInstall || localInstall || steamPath ? path.join( steamPath, "steamapps/common/RimWorld" ) : "";
}

export function getRegistryKey( path: string, valueName: string, hive: string = "HKEY_LOCAL_MACHINE" ): string {
    return "";
}

// local is predictable: {rimworld}/mods
function defaultLocalPath( rimworldPath: string ) {
    try {
        const localPath = path.join( rimworldPath, "Mods" );
        const localStat = fs.statSync( localPath );
        if ( localStat.isDirectory() && containsMods( localPath ) )
            return localPath;
    } finally {
        return "";
    }
}

// steam is predictable: {rimworld}/../../workshop/294100
function defaultSteamPath( rimworldPath: string )
{
    try {
        const steamPath = path.join( rimworldPath, "../../workshop/content/294100" );
        const steamStat = fs.statSync( steamPath );
        if ( steamStat.isDirectory() && containsMods( steamPath ) )
            return steamPath;
    } finally {
        return "";
    }

}
