import Vuex from 'vuex';
import Vue from 'vue';
import { mods, IModsState } from './mods';
import { preferences, IPreferencesState } from './preferences';
import { modlists, IModlistsState } from './modlists';
import { saves, ISavesState } from './saves';

Vue.use( Vuex );

export interface IState {
    preferences: IPreferencesState,
    mods: IModsState,
    modlists: IModlistsState,
    saves: ISavesState
}

export const store = new Vuex.Store({
    modules: {
        preferences,
        mods,
        modlists,
        saves
    }
});
export default store;