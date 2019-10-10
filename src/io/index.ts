import { loadMods } from './mods';
import { loadModlists } from './modlists';
import { store } from '@/store';
import { setTimeout } from 'timers';
import { loadSaves } from './saves';
import log from 'electron-log';

export * from './mods';
export * from './modlists';
export * from './saves';

export async function loadAll() {
    try {
        await waitForValidPaths();
        log.info("Reloading content...")

        const mods = await loadMods();
        log.silly( {mods})
        store.commit( "mods/loadMods", { mods } );

        const modlists = await loadModlists();
        log.silly({modlists})
        store.commit( "modlists/loadModlists", { modlists });

        const saves = await loadSaves();
        log.silly({saves})
        store.commit( "saves/loadSaves", { saves });
    } catch ( err ) {
        log.error( err );
    }
}

async function waitForValidPaths(){
    return new Promise( (resolve, reject) => {
        log.info("Starting wait for paths")
        async function wait(){
            if( await store.getters['paths/hasValidPaths'] ){
                return resolve();
            } else {
                log.info("Waiting for valid paths..." );
                log.info( store.state.paths )
                setTimeout( wait, 500 );
            }
        }
        wait();
    })
}
