<template>
    <div id="modlist">
        <div class="half">
            <div class="section">
                <div class="header">
                    <span class="name">{{name}}</span>
                    <div class="buttons">
                        <div v-if="!modlist.isModConfig" @click="renameModlist" title="rename modlist">
                            <b-icon icon="textbox"></b-icon>
                        </div>
                        <div @click="resetModlist" title="reset modlist">
                            <b-icon icon="refresh"></b-icon>
                        </div>
                        <div v-if="!modlist.isModConfig" id="delete-button" @click="deleteModlist" title="delete modlist">
                            <b-icon icon="delete"></b-icon>
                        </div>
                    </div>
                </div>
            
                <mod-button-list :modlist="modlist" :mods="modlist.mods" :onUpdate="updateModlist" button="remove" :showIndex="true" />
            </div>
        </div>
        <div class="half">
            <div class="section">
                <div class="header">
                    <span class="name">Available</span>
                </div>
                <mod-button-list :mods="loaded" :except="modlist.mods" button="add" />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue'
import store from '../store'
import { mapState } from 'vuex';
import { Mod, Modlist } from '@/io';
import modButtonList from '../components/ModButtonList.vue';

export default Vue.extend({
    name: "modlist",
    data: function() {
        return {
            index: 0
        }
    },
    beforeRouteUpdate( to, from, next ): void {
        this.index = Number.parseInt( to.params.list );
        next();
    },
    computed: { 
        modlist(): Modlist {
            return store.getters['modlists/getByIndex']( this.index );
        },
        name(): string {
            return this.modlist?.name ?? "";
        },
        ... mapState("mods", ["loaded"])
    },
    methods: {
        deleteModlist(): void {
            this.$buefy.dialog.confirm({
                title: `Delete '${this.modlist.name}'`,
                message: `Are you sure you want to delete '${this.modlist.name}'? This action cannot be undone.`,
                confirmText: `Delete modlist`,
                type: `is-danger`,
                onConfirm: async () => {
                    try {
                        await store.dispatch("modlists/deleteModlist", { index: this.index } );
                        await this.$router.push({name: "modlists", params: { list: '0' } });
                    } catch ( err ) {
                        console.error( err );
                    }
                } 
            })
        },
        resetModlist(): void {
            this.$buefy.dialog.confirm({
                title: `Reset '${this.modlist.name}'`,
                message: `Are you sure you want to reset '${this.modlist.name}'? All ${this.modlist.mods.length} mods will be removed from the list.`,
                confirmText: `Reset modlist`,
                type: `is-info`,
                onConfirm: async () => {
                    try {
                        await store.dispatch("modlists/resetModlist", { index: this.index } );
                    } catch ( err ) {
                        console.error( err );
                    }
                } 
            })
        },
        renameModlist(): void {
            this.$buefy.dialog.prompt({
                title: `Rename '${this.modlist.name}'`,
                message: `New modlist name`,
                confirmText: `Rename modlist`,
                type: `is-info`,
                inputAttrs: {
                    placeholder: 'e.g. super funky mods'
                },
                onConfirm: async ( name: string ) => {
                    try {
                        await store.dispatch("modlists/renameModlist", { index: this.index, name } );
                    } catch ( err ) {
                        console.error( err );
                    }
                } 
            })
        },
        updateModlist( mods: Mod[] ): void {
            store.dispatch("modlists/updateModlist", {index: this.index, mods });
        }
    },
    components: {
        modButtonList
    }
})
</script>

<style lang="scss" scoped>
@import './../../node_modules/bulmaswatch/superhero/_variables.scss';
@import './../../node_modules/bulma/sass/utilities/_all.sass';

    #modlist {
        width: 100%;
        display: flex;
        align-items: flex-start;
    }

    .half {
        flex: 1 1 calc( 50% - .5em);
        width: calc( 50% - .5em);
        max-width: calc( 50% - .5em);

        &:nth-child(1) {
            margin-right: .5em;
        }
        &:nth-child(2) {
            margin-left: .5em;
        }    

        display: flex;
        flex-direction: column;
        height: 100%;

        .header {
            flex: 0 0 40px;
            display: flex;
            flex-direction: row;
            width: 100%;

            .name{
                flex: 1 1 auto;
            }
            .buttons {
                flex: 0 0 auto;
            }
        }

        .mod-button-list {
            flex: 0 1 auto;
            max-height: calc( 100% - 35px );
        }
    }

    .buttons {
        .icon {
            &:hover, &:active, &:focus-within {
                color: $info;
                cursor: pointer;
            }
        }       
        #delete-button .icon {
            &:hover, &:active, &:focus-within {
                color: $red;
                cursor: pointer;
            }
        }
}
</style>
