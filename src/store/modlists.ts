import { Modlist, Mod } from '@/io';
import { Module } from 'vuex';
import { IState } from '.';
import { writeModlist, deleteModlist } from '@/io/modlists';
import { ToastProgrammatic as Toast } from 'buefy';

export interface IModlistsState {
    modlists: Modlist[] 
}

interface IModlistsPayload {
    modlists: Modlist[]
}

interface IIndexPayload {
    index: number
}

interface INamePayload {
    name: string
}

interface IModlistPayload {
    modlist: Modlist
}
interface INameAndIndexPayload extends INamePayload, IIndexPayload {}

interface IModlistAndIndexPayload extends IModlistPayload, IIndexPayload {}

interface IIndexAndModPayload extends IIndexPayload {
    mod: Mod
}

interface IModsAndIndexPayload extends IIndexPayload {
    mods: Mod[]
}

export const modlists: Module<IModlistsState, IState> = {
    state: {
        modlists: []
    },
    namespaced: true,
    mutations: {
        loadModlists: ( state, payload: IModlistsPayload ) => {
            state.modlists = payload.modlists;
        },
        updateModlist: ( state, payload: IModlistAndIndexPayload ) => {
            state.modlists[payload.index] = payload.modlist;
        }, 
        createModlist: ( state, payload: IModlistPayload ) => {
            state.modlists.push( payload.modlist )
        },
        deleteModlist: ( state, payload: IIndexPayload ) => {
            state.modlists.splice( payload.index, 1 );
        },
        resetModlist: ( state, payload: IIndexPayload ) => {
            state.modlists[payload.index].mods = Mod.Core ? [ Mod.Core ] : [];
        },
        renameModlist: ( state, payload: INameAndIndexPayload ) => {
            state.modlists[payload.index].name = payload.name;
        }
    },
    getters: {
        getByIndex: state => ( index: number ) => state.modlists[index]
    },
    actions: {
        addModToModlist: async ({dispatch, state}, payload: IIndexAndModPayload ) => {
            const modlist = state.modlists[payload.index];
            const mods = [ ... modlist.mods, payload.mod ];
            return dispatch('updateModlist', { index: payload.index, mods } );
        },
        removeModFromModlist: async({dispatch, state}, payload: IIndexAndModPayload ) => {
            const modlist = state.modlists[payload.index];
            const mods = [ ... modlist.mods ].filter( mod => mod !== payload.mod );
            return dispatch('updateModlist', { index: payload.index, mods } );
        },
        renameModlist: async ( {commit, state}, payload: INameAndIndexPayload ) => {
            const modlist = state.modlists[payload.index];
            const oldName = modlist.name;
            try {
                modlist.name = payload.name;
                await writeModlist( modlist, false );
                commit( 'renameModlist', payload );
                Toast.open({
                    message: `Modlist '${modlist.name} renamed.'`,
                    type: "is-info"
                })
            } catch (err) {
                modlist.name = oldName;
                Toast.open( { 
                    message: `Renaming '${modlist?.name ?? "unknown"}' failed: ${err}`,
                    type: "is-warning"
                });
            }
        },
        resetModlist: async ( {commit, state}, payload: IIndexPayload ) => {
            const modlist = state.modlists[payload.index];
            try {
                commit( 'resetModlist', payload );
                Toast.open({
                    message: `Modlist '${modlist.name} reset.'`,
                    type: "is-info"
                })
            } catch (err) {
                Toast.open( { 
                    message: `Resetting '${modlist?.name ?? "unknown"}' failed: ${err}`,
                    type: "is-warning"
                });
            }
        },
        deleteModlist: async ( {commit, state}, payload: IIndexPayload ) => {
            const modlist = state.modlists[payload.index];
            try {
                await deleteModlist( modlist );
                commit( 'deleteModlist', payload );
                Toast.open({
                    message: `Modlist '${modlist.name}' deleted`,
                    type: "is-info"
                });
            } catch (err) {
                Toast.open( { 
                    message: `Deletion of '${modlist?.name ?? "unknown"}' failed: ${err}`,
                    type: "is-warning"
                });
            }
        },
        updateModlist: async ( {commit, state}, payload: IModsAndIndexPayload ) => {
            // write to disk
            const modlist = state.modlists[payload.index];
            modlist.mods = [ ... new Set( payload.mods ) ];

            try {
                await writeModlist( modlist );
                commit( 'updateModlist', { index: payload.index, modlist } );
            } catch (err) {
                Toast.open( { 
                    message: `Update of '${modlist?.name ?? "unknown"}' failed: ${err}`,
                    type: "is-danger"
                });
            }
        },
        createModlist: async ( {commit, state}, payload: INamePayload ) => {
            const core = Mod.Core;
            const modlist = new Modlist( payload.name, core ? [ core ] : [], false );
            try {
                await writeModlist( modlist, false );
                commit( 'createModlist', { modlist });
                Toast.open({
                    message: `Modlist ${modlist.name} created`,
                    type: "is-info"
                })
                return state.modlists.length - 1;
            } catch (err) {
                Toast.open( { 
                    message: `Creation of '${modlist?.name ?? "unknown"}' failed: ${err}`,
                    type: "is-warning"
                });
                return 0;
            }
        }
    }
}

