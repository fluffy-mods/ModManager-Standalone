import { ISave } from '@/io';
import { Module } from 'vuex';
import { IState } from '.';

export interface ISavesState {
    saves: ISave[]
}

export interface ISavesMutationPayload {
    saves: ISave[]
}

export const saves: Module<ISavesState, IState> = {
    namespaced: true,
    state: { saves: [] },
    mutations: {
        loadSaves( state, payload: ISavesMutationPayload ){
            state.saves = payload.saves;
        }
    }
}