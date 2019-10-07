import ElectronStore from 'electron-store';
import { remote } from 'electron';
import path from 'path';
import fs from 'mz/fs';
import { containsMods } from '@/io/mods';

interface IPathMutationPayload {
    type: string,
    path: string
}

const preferencesStore = new ElectronStore({name: "preferences"});

export interface IPreferencesState {
    rimworldPath: string
    steamPath: string
    localPath: string
    configPath: string
}

const state: IPreferencesState = {
    rimworldPath: preferencesStore.get("rimworldPath"),
    steamPath: preferencesStore.get("steamPath"),
    localPath: preferencesStore.get("localPath"),
    configPath: preferencesStore.get("configPath") || defaultConfigPath()
}

export function defaultConfigPath(): string{
    const configPath = path.join(
         remote.app.getPath( "userData" ),
         "../../LocalLow/Ludeon Studios/RimWorld by Ludeon Studios" );
    try {
        const stat = fs.statSync( configPath );
        if (stat.isDirectory()){
            return configPath;
        }
    } catch (err) {
        console.error( err )
        return ""; 
    }
    return "";
}

export const preferences = {
    namespaced: true,
    state,
    mutations: {
        setPath( state: any, payload: IPathMutationPayload ){
            console.log(`Setting path '${payload.type}: ${payload.path}`)         
            preferencesStore.set( payload.type, payload.path );
            state[payload.type] = payload.path;
        }
    },
    getters: {
        hasValidPaths: (state: IPreferencesState, getters: any ): boolean => {
            console.log("checking valid paths");
            return getters.configValid && getters.rimworldValid && ( getters.localValid || getters.steamValid );
        },
        configValid: ( state: IPreferencesState ): boolean => {
            console.log("checking config path");
            try {
                const configStat = fs.statSync( path.join( state.configPath, "Config" ) );
                return configStat.isDirectory();
            } catch {
                return false;
            }
        },
        localValid: ( state: IPreferencesState ): boolean => {
            console.log("checking local mod path");
            try {
                const localStat = fs.statSync( state.localPath );
                return localStat.isDirectory() && containsMods( state.localPath );
            } catch {
                return false;
            }
        },
        steamValid: ( state: IPreferencesState ): boolean => {
            console.log("checking steam mod path");
            try {
                const steamStat = fs.statSync( state.steamPath );
                return steamStat.isDirectory() && containsMods( state.steamPath );
            } catch {
                return false;
            }
        }, 
        rimworldValid: (state: IPreferencesState ): boolean => {
            console.log("checking rimworld path");
            try {
                const rimworldStat = fs.statSync( state.rimworldPath );
                return rimworldStat.isFile();
            } catch {
                return false;
            }
        }
    }
}