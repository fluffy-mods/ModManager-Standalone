import flow from 'xml-flow';
import fs from 'mz/fs';
import moment, { Moment } from 'moment';
import store from '../store';
import path from 'path';
import { Modlist, Mod } from '.';

const EXT = ".rws";

async function loadTagFromSave( save: ISave, tag: string, strict: boolean = true ): Promise<any> {
    return new Promise( (resolve, reject) => {
        const reader = fs.createReadStream( save.path );
        const parser = flow( reader, {strict} );
        
        parser.on( `tag:${tag}`, ( data: Event ) => {
            resolve( data )
            reader.close();
        });

        parser.on( `error`, ( error: Event ) => {
            reject( error );
            reader.close();
        });

        parser.on( `end`, ( end: Event ) => {
            reject( end );
            reader.close();
        });
    });
}

export async function loadModlistFromSave( save: ISave ): Promise<Modlist> {
    try {
        const meta: { modIds: string[], modNames: string[] } = await loadTagFromSave( save, "meta" );
        const mods: Mod[] = [];

        for( let i = 0; i < meta.modIds.length; i++ ){
            const mod = store.getters['mods/findOneById']( meta.modIds[i] ) 
                || store.getters['mods/findOneByName']( meta.modNames[i] );
            if( !!mod ) mods.push( mod )
            else mods.push( Mod.Missing( meta.modNames[i], meta.modIds[i] ) )
        }
        
        return new Modlist( save.name, mods, false );
    } catch ( err ) {
        console.error( err );
        throw err;
    }
}

export interface ISave {
    name: string
    path: string
    time: Moment
}

export async function loadSaves(): Promise<ISave[]> {
    try {
        const saveGamePath = path.join( store.state.preferences.configPath, "Saves" );
        const files = await fs.readdir( saveGamePath );
        const saves: ISave[] = [];

        for (const file of files) {
            if ( path.extname( file ) !== EXT )
                continue;
            try {
                const fileStat = await fs.stat( path.join( saveGamePath, file ) );
                const save = {
                    name: path.basename( file, EXT ),
                    path: path.join( saveGamePath, file ),
                    time: moment( fileStat.mtime )
                } 

                saves.push( save );
            } catch ( err ) {
                console.error( err )
            }
        }

        return saves;
    } catch ( err ) {
        console.error( err );
        return [];
    }

    return [];
}