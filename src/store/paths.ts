import ElectronStore from 'electron-store';
import path from 'path';
import fs from 'mz/fs';
import { containsMods } from '@/io/mods';
import { getDefaultPaths } from '@/os';
import log from 'electron-log';

interface IPathMutationPayload {
    type: string,
    path: string
}

const pathsStore = new ElectronStore({name: "paths"});

export interface IPathsState {
    rimworldPath: string
    steamPath: string
    localPath: string
    configPath: string
}

const state: IPathsState = {
    configPath: pathsStore.get( "configPath" ),
    rimworldPath: pathsStore.get( "rimworldPath" ),
    localPath: pathsStore.get( "localPath" ),
    steamPath: pathsStore.get( "steamPath" ),
}


if ( !pathsStore.get( "defaultsSet" ) ){
    setDefaults();
}

async function setDefaults(){
    const defaults = await getDefaultPaths()
    Object.assign( state, defaults );
    pathsStore.set("defaultsSet", true );
}

export const paths = {
    namespaced: true,
    state,
    mutations: {
        setPath( state: any, payload: IPathMutationPayload ){
            log.info(`Setting path '${payload.type}: ${payload.path}`)         
            pathsStore.set( payload.type, payload.path );
            state[payload.type] = payload.path;
        }
    },
    getters: {
        hasValidPaths: (state: IPathsState, getters: any ): boolean => {
            log.info("checking valid paths");
            return getters.configValid && getters.rimworldValid && ( getters.localValid || getters.steamValid );
        },
        configValid: ( state: IPathsState ): boolean => {
            log.info("checking config path");
            try {
                const configStat = fs.statSync( path.join( state.configPath, "Config" ) );
                return configStat.isDirectory();
            } catch {
                return false;
            }
        },
        localValid: ( state: IPathsState ): boolean => {
            log.info("checking local mod path");
            try {
                const localStat = fs.statSync( state.localPath );
                return localStat.isDirectory() && containsMods( state.localPath );
            } catch {
                return false;
            }
        },
        steamValid: ( state: IPathsState ): boolean => {
            log.info("checking steam mod path");
            try {
                const steamStat = fs.statSync( state.steamPath );
                return steamStat.isDirectory() && containsMods( state.steamPath );
            } catch {
                return false;
            }
        }, 
        rimworldValid: (state: IPathsState ): boolean => {
            log.info("checking rimworld path");
            try {
                const rimworldStat = fs.statSync( state.rimworldPath );
                return rimworldStat.isFile();
            } catch {
                return false;
            }
        }
    }
}