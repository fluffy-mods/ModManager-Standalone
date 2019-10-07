import store from '@/store';
import path from 'path';
import xml from 'xml2js';
import fs from 'mz/fs';
import { Mod } from './mods';
import { ISave } from '.';

export async function loadModlists(): Promise<Modlist[]>{
    return <any>[
        await loadActiveModlist(),
        ... await loadModManagerModlists()
    ].filter( Boolean );
}

async function loadActiveModlist(): Promise<Modlist | undefined> {
    try {
        const modsconfigString = await fs.readFile( getModsConfigPath(), "utf8" );
        const modsconfigObject = await xml.parseStringPromise( modsconfigString );
        const modIds: string[] = modsconfigObject.ModsConfigData.activeMods[0].li;
        const mods = modIds.map( id => store.getters['mods/findOneById'](id) );
        return new Modlist( "Active", mods, true );
    } catch (err) {        
        console.error( `Failed to load ModsConfig.xml: ${err}` );
    }
}

function getModsConfigPath(): string {
    return path.join(store.state.preferences.configPath, "Config/ModsConfig.xml" );
}
function getPath( fileName: string ): string {
    return path.join(store.state.preferences.configPath, "ModLists", path.extname( fileName ) == ".xml" ? fileName : fileName + ".xml" );
}

export async function writeModlist( modlist: Modlist, overwrite: boolean = true ){
    if (modlist.isModConfig ) return writeModsConfig( modlist );

    const filePath = path.join( store.state.preferences.configPath,
        "ModLists",
        modlist.name + ".xml" )

    const writeFlag = overwrite ? "w" : "wx";
    const builder = new xml.Builder({rootName: "ModList"});
    const xmlString = builder.buildObject( { 
        Name: modlist.name,
        modIds: { li: modlist.mods.map( mod => mod.identifier ) },
        modNames: { li: modlist.mods.map( mod => mod.name ) }
    } );

    return fs.writeFile( filePath, xmlString, { encoding: "utf8", flag: writeFlag } );
}

export async function writeModsConfig( modlist: Modlist ){
    const builder = new xml.Builder({rootName: "ModsConfigData"});

    const xmlString = builder.buildObject({
        version: "1.0.2282 rev726", // TODO: get RW version
        activeMods: { li: modlist.mods.map( mod => mod.identifier ) }
    });
    return fs.writeFile( getModsConfigPath(), xmlString, "utf8" );
}

export async function deleteModlist( modlist: Modlist ){
    return await fs.unlink( getPath( modlist.name ) );
}

async function loadModManagerModlists(): Promise<Modlist[]> {
    const modlists: Modlist[] = [];
    try {
        const modlistFiles = await fs.readdir( path.join( store.state.preferences.configPath, "ModLists" ) );
        for ( const modlistFile of modlistFiles ){
            try {
                const modlistString = await fs.readFile( getPath( modlistFile ), "utf8" );
                const modlistObject = await xml.parseStringPromise( modlistString );
                const name = modlistObject.ModList.Name[0];
                const modIds = modlistObject.ModList.modIds[0].li;
                const modNames = modlistObject.ModList.modNames[0].li;
                const mods: Mod[] = [];
                if( modIds && modNames ){
                    for ( let i = 0; i < modIds.length; i++ ){
                        const mod = store.getters['mods/findOneById']( modIds[i] ) 
                            || store.getters['mods/findOneByName']( modNames[i] );
                        if (!!mod) mods.push( mod )
                        else mods.push( Mod.Missing( modNames[i], modIds[i] ))
                    }
                }
                modlists.push( new Modlist( name, mods ) );
            } catch ( err ){
                console.error( `Failed to load ${modlistFile}: ${err}`);
            }
        }
    } catch (err){
        console.error( `Failed to load modlists: ${err}` );
    }
    return modlists;
}

export class Modlist implements IModList {

    constructor( 
        public name: string,
        public mods: Mod[],
        public isModConfig = false ){}
}