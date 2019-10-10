import fs from 'mz/fs'
import path from 'path'
import xml from 'xml2js'
import store from '@/store';
import log from 'electron-log';

export async function loadMods(): Promise<Mod[]> {
    const localMods = await loadModsFromDir( store.state.paths.localPath, "local" );
    const steamMods = await loadModsFromDir( store.state.paths.steamPath, "steam" );
    const mods = [
        ...localMods,
        ...steamMods
    ]

    // this works, stop bitching
    // there's probably a fancy way to use ts 3.7's assertions here,
    // let's find out later.
    return (<any>mods).filter( Boolean );
}


async function loadModsFromDir( dir: string, source: source ): Promise<Mod[]> {
    try {
        const modFolders = await fs.readdir( dir );
        const mods = await Promise.all( modFolders.map( modFolder => Mod.fromPath( modFolder, dir, source ) ) ); 
        return (<any>mods).filter( Boolean );
    } catch( err ){
        // log.error( {err} )
        return [];
    }
}

export function containsMods( dir: string ): boolean {
    try {
        const modFolders = fs.readdirSync( dir );
        return modFolders.map( modFolder => Mod.isMod( path.join( dir, modFolder ) ) ).some( mod => !!mod );
    } catch {
        return false;
    }
}

export class Mod implements IMod {
    identifier: string;
    name: string;
    description: string;
    url: string;
    author: string;
    supportedVersions: string[];
    preview: string;
    source: source;

    constructor( mod: IMod ){
        this.identifier = mod.identifier;
        this.name = mod.name || "";
        this.description = mod.description || "";
        this.url = mod.url || "";
        this.author = mod.author || "";
        this.supportedVersions = mod.supportedVersions || [];
        this.preview = mod.preview || "";
        this.source = mod.source;
    }

    static Missing( name: string, identifier: string ){
        return new Mod({ name, identifier, source: "missing"})
    }

    get modLinks(): ILink[] {
        const links = [];
        if (this.url !== "")
            links.push({label: `${this.name} home page`, uri: this.url})
        if (this.source === "steam")
            links.push({label: `${this.name} steam workshop page`, uri: `https://steamcommunity.com/sharedfiles/filedetails/?id=${this.identifier}`})
        return links;
    }

    get updateLink(): ILink[] {
        return [];
    }

    static isMod( dir: string ): boolean {
        // check if dir/About/About.xml exists
        try {
            const modStat = fs.statSync( path.join( dir, "About", "About.xml" ) );
            return modStat.isFile();
        } catch {
            return false;
        }
    }

    static async fromPath( identifier: string, basePath: string, source: source ): Promise<Mod | undefined> {
        try {
            const aboutFilePath = path.join( basePath, identifier, "About/About.xml" );
            const aboutString = await fs.readFile( aboutFilePath, "utf8" );
            const about = ( await xml.parseStringPromise( aboutString, { explicitArray: false } ) ).ModMetaData;

            const supportedVersions: string[] = [];
            if( about.targetVersion )
                supportedVersions.push( about.ModMetaData.targetVersion )
            if( about.supportedVersions?.li ){
                const li = about.supportedVersions.li;
                if (typeof li === "string")
                    supportedVersions.push( li );
                else 
                    supportedVersions.push( ...li );
            }

            const mod = {
                ...about,
                supportedVersions,
                source,
                identifier
            }
            try {
                const previewPath = path.join( basePath, identifier, "About/Preview.png" );
                await fs.stat( previewPath ); // errors if not available
                mod.preview = previewPath; 
            } catch ( err ) {
                log.info( `No preview for: ${mod.name || mod.identifier}`)
            }
            return new Mod( mod );
        } catch ( err ) {
            // log.error( err );
            return;
        }
    }

    static get Core(): Mod | undefined {
        return store.state.mods.loaded.find( mod => mod.identifier === "Core" );
    }
}