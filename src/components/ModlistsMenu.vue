<template>
    <div id="modlists">
        <div class="menu-label">Mod Lists</div>
        <router-link v-if="!hasValidPaths" :to="{ name: 'options.paths' }">
            <b-button icon-left="alert" type="is-warning" outlined style="width: 100%;">
                Set up paths
            </b-button>
            <!-- <b-icon icon="alert" type="is-warning" />
            <span class="has-text-warning">Set up paths</span> -->
        </router-link>
        <template v-else>
            <ul class="menu-list modlist-list scrolling">
                <li v-for="(modlist, key) in modlists" :key="key">
                    <router-link :to="{ name: 'modlists', params: { list: key } }" class="modlist">
                        <span class="list-name">{{modlist.name}}</span>
                        <div v-if="active && activeModlist != key" class="hover-buttons buttons">
                            <b-field>
                                <div class="control">
                                <b-button
                                        v-on:click.stop.prevent="addToCurrentModlist( key )" 
                                        class="is-small"
                                        type="is-dark"
                                        :title="`add mods in '${modlist.name}' to active modlist`">
                                    <b-icon icon="plus" size="is-small"></b-icon>
                                </b-button>
                                </div>
                                <div class="control">
                                <b-button
                                        v-on:click.stop.prevent="replaceCurrentModlist( key )" 
                                        class="is-small"
                                        type="is-dark"
                                        :title="`replace mods in active modlist with those in '${modlist.name}'`">
                                    <b-icon icon="autorenew" size="is-small"></b-icon>
                                </b-button>
                                </div>
                            </b-field>
                        </div>
                    </router-link>
                </li>
            </ul>
            <b-field>
                <div class="control is-expanded">
                    <b-button type="is-dark"
                        class="is-darker"  
                        id="create-modlist-button" 
                        @click="createModlist"
                        style="width: 100%;">
                        Create new
                    </b-button>
                </div>
                <div class="control">
                    <b-dropdown>
                        <b-button type="is-dark" 
                            class="is-darker"  
                            id="create-modlist-from-save-button"
                            slot="trigger">
                            <b-icon icon="chevron-down" size="is-small" />
                            <b-icon icon="file" size="is-small" />
                        </b-button>
                        <b-dropwdown-item class="dropdown-label" custom>
                            Create modlist from saved game
                        </b-dropwdown-item>
                        <b-dropdown-item v-for="save in saves" :key="save.name" @click="createModlistFromSave(save)">
                            {{save.name}}
                        <span class="last-played">last played {{moment(save.time)}}</span>
                        </b-dropdown-item>
                    </b-dropdown>
                </div>
            </b-field>
        </template>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { loadModlists, Modlist, ISave, loadModlistFromSave } from '@/io';
import store from '@/store';
import { mapState, mapGetters } from 'vuex';
import { SnackbarProgrammatic as Snackbar } from 'buefy';
import { Moment } from 'moment';

export default Vue.extend({
    data(){
        return {
            activeModlist: -1
        }
    },
    computed: {
        ... mapState( "preferences", ["configPath", "localPath", "steamPath"]),
        ... mapGetters( "preferences", ["hasValidPaths"]),
        ... mapState( "modlists", ["modlists"]),
        ... mapState( "saves", ["saves"]),
        active(): boolean { 
            return this.activeModlist >= 0;
        }
    },
    created(){
        if( this.$router.currentRoute.name === "modlists" ){
            this.activeModlist = Number.parseInt( this.$router.currentRoute.params.list ) || 0;
        } else {
            this.activeModlist = -1;
        }
    },
    name: "modlists",
    watch: {
        "$route.path" ( to, from ) {
            if ( this.$route.name === "modlists" ){
                this.activeModlist = Number.parseInt( this.$route.params.list ) || 0;
            } else {
                this.activeModlist = -1;
            }
        }
    },
    methods: {
        async replaceCurrentModlist( index: number ) {
            await store.dispatch("modlists/updateModlist", 
            { index: this.activeModlist, mods: (<any>this).modlists[index].mods } );
        },
        async addToCurrentModlist( index: number ){
            const mods = [
                ... (<any>this).modlists[this.activeModlist].mods,
                ... (<any>this).modlists[index].mods
            ]
            await store.dispatch("modlists/updateModlist", { index: this.activeModlist, mods } );
        },
        moment( time: Moment ): string {
            return time.fromNow();
        },
        async createModlist() {
            this.$buefy.dialog.prompt({
                message: "Modlist name",
                inputAttrs: {
                    placeholder: 'e.g. super funky mods'
                },
                onConfirm: async ( value: string ) => {
                    try {
                        const index = await store.dispatch("modlists/createModlist", { name: value } );
                        await this.$router.push({name: "modlists", params: { list: index } });
                    } catch ( err ) {
                        console.error( err );
                    }
                } 
            })
        },
        async createModlistFromSave( save: ISave ){
            try {
                const modlist = await loadModlistFromSave( save );
                const index = await store.dispatch("modlists/createModlist", {name: modlist.name});
                await store.dispatch("modlists/updateModlist", { index, mods: modlist.mods });
                await this.$router.push( { name: "modlists", params: {list:index} } );
            } catch (err) {
                console.error( err );
            }
        }
    }
})
</script>

<style lang="scss" scoped>
    @import '../../node_modules/bulmaswatch/superhero/_variables.scss';

    #modlists {
        display: flex;
        flex-direction: column;
        max-height: 100%;

        .menu-label, .no-path, #create-modlist-button {
            flex: 0 0 auto;
        }

        .modlist-list {
            flex: 1 1 auto;
            padding: .5em 0;  
        }

        .menu-list {
            li {
                height: 35px;
                max-height: 35px;
                .modlist {
                    height: 100%
                } 
            }
        }

        .icon + .icon {
            margin-left: -.75em;
        }
    }

    .modlist {
        display: flex;
        justify-content: space-between;
        width: 100%;

        &.router-link-exact-active {
            background-color: $primary;
            &:hover, &:active {
                background-color: lighten( $primary, 3 )
            }
        }

        .list-name {
            text-overflow: ellipsis;
            white-space: nowrap;
            overflow: hidden;
        }

        .hover-buttons {
            position: relative;
            right: 0px;
        }
    }

</style>