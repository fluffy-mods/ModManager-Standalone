import { Module } from 'vuex';
import { loadMods } from '@/io';
import { IState } from '.';
import { Mod } from '@/io/mods';

interface IModsLoadMutationPayload {
    mods: Mod[]
}

export interface IModsState {
    loaded: Mod[]
}

export const mods: Module<IModsState, IState> = {
    namespaced: true,
    state: { loaded: [] },
    mutations: {
        loadMods( state, payload: IModsLoadMutationPayload ){
            state.loaded = payload.mods;
        }
    },
    getters: {
        findOneById: state => ( id: string ) => state.loaded.find( mod => mod.identifier === id ),
        findOneByName: state => ( name: string ) => state.loaded.find( mod => mod.name === name )
    }
}