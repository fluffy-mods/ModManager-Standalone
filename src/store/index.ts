import Vuex from 'vuex';
import Vue from 'vue';
import { mods, IModsState } from './mods';
import { paths, IPathsState } from './paths';
import { modlists, IModlistsState } from './modlists';
import { saves, ISavesState } from './saves';

Vue.use( Vuex );

export interface IState {
    paths: IPathsState,
    mods: IModsState,
    modlists: IModlistsState,
    saves: ISavesState
}

export const store = new Vuex.Store({
    modules: {
        paths,
        mods,
        modlists,
        saves
    }
});
export default store;