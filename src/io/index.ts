import { loadMods } from './mods';
import { loadModlists } from './modlists';
import { store } from '@/store';
import { setTimeout } from 'timers';
import { loadSaves } from './saves';

export * from './mods';
export * from './modlists';
export * from './saves';

export async function loadAll() {
    try {
        await waitForValidPaths();
        console.log("Reloading content...")

        const mods = await loadMods();
        console.log( {mods})
        store.commit( "mods/loadMods", { mods } );

        const modlists = await loadModlists();
        console.log({modlists})
        store.commit( "modlists/loadModlists", { modlists });

        const saves = await loadSaves();
        console.log({saves})
        store.commit( "saves/loadSaves", { saves });
    } catch ( err ) {
        console.log( err );
    }
}

async function waitForValidPaths(){
    return new Promise( (resolve, reject) => {
        console.log("Starting wait for paths")
        async function wait(){
            if( await store.getters['preferences/hasValidPaths'] ){
                return resolve();
            } else {
                console.log("Waiting for valid paths..." );
                console.log( store.state.preferences )
                setTimeout( wait, 500 );
            }
        }
        wait();
    })
}
