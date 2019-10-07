<template>
    <div class="section" id="path-preferences">
        <h1 class="title">Preferences > Paths</h1>
        <b-field label="Path to RimWorld" label-position="inside" 
            :type="rimworldValid ? 'is-success' : 'is-warning'">
            <b-input :value="rimworldPath" disabled expanded></b-input>
            <div class="control">
                <b-button type="is-info" @click.stop.prevent="setRimworldPath">
                    <b-icon icon="file-search" />
                </b-button>
            </div>
        </b-field>
        <b-field label="Path to local mods folder" label-position="inside" 
            :type="localValid ? 'is-success' : 'is-warning'">
            <b-input :value="localPath" disabled expanded></b-input>
            <div class="control">
                <b-button type="is-info" @click.stop.prevent="setPath('localPath')">
                    <b-icon icon="folder-search" />
                </b-button>
            </div>
        </b-field>
        <b-field label="Path to steam mods folder" label-position="inside" 
            :type="steamValid ? 'is-success' : 'is-warning'">
            <b-input :value="steamPath" disabled expanded></b-input>
            <div class="control">
                <b-button type="is-info" @click.stop.prevent="setPath('steamPath')">
                    <b-icon icon="folder-search" />
                </b-button>
            </div>
        </b-field>
        <b-field label="Path to config folder" label-position="inside" 
            :type="configValid ? 'is-success' : 'is-warning'">
            <b-input :value="configPath" disabled expanded></b-input>
            <div class="control">
                <b-button type="is-info" @click.stop.prevent="setPath('configPath')">
                    <b-icon icon="folder-search" />
                </b-button>
            </div>
        </b-field>
    </div>
</template>

<script lang="ts">
import Vue from 'vue'
import {remote} from 'electron';
import path from 'path';
import fs from 'mz/fs';
import {mapState, mapGetters} from 'vuex';
import {store} from '../store/index';

export default Vue.extend({
    name: "preferences",
    computed: {
        ...mapState("preferences", ["rimworldPath", "localPath", "steamPath", "configPath"]),
        ...mapGetters("preferences", ["configValid","localValid", "steamValid", "rimworldValid"])  
    },
    methods: {
        setRimworldPath: async function(){
            const chosenPath = await remote.dialog.showOpenDialog({
                 properties: ['openFile'],
                 filters: [{ name: "RimWorld executable", extensions: [ "exe", "app" ] }] });
            if( !chosenPath.canceled && chosenPath?.filePaths?.[0] ){
                store.commit("preferences/setPath", { type: "rimworldPath", path: chosenPath.filePaths[0] });

                const rimworldDir = path.dirname( chosenPath.filePaths[0] )
                // try to set local mods path
                const localPath = path.join( rimworldDir, "Mods" );
                try {
                    const localStat = await fs.stat( localPath );
                    if ( localStat.isDirectory() ){
                        store.commit("preferences/setPath", { type: "localPath", path: localPath })
                    }
                } catch ( err ) {
                    console.error( { err, localPath } );
                }

                // try to set steam mods path
                const steamPath = path.join( rimworldDir, "../../workshop/content/294100" );
                try {
                    const steamStat = await fs.stat( steamPath );
                    if( steamStat.isDirectory() ){
                        store.commit("preferences/setPath", { type: "steamPath", path: steamPath })
                    }
                } catch ( err ) {
                    console.error( {err, steamPath } );
                }
            }
        },
        setPath: async function( type: "steamPath" | "localPath" | "configPath" ){
            const choice = await remote.dialog.showOpenDialog({properties: ['openDirectory']});
            if( !choice.canceled && choice.filePaths && choice.filePaths.length && choice.filePaths[0] ){
                const path = choice.filePaths[0];
                try {
                    const stat = await fs.stat( path );
                    if ( stat.isDirectory() ){
                        store.commit("preferences/setPath", { type, path })
                    }
                } catch ( err ) {
                    console.error( {err, path} );
                }
            }
        }
    }
})
</script>

<style lang="scss" scope>
@import './../../node_modules/bulma/sass/utilities/_all.sass';
@import './../../node_modules/bulmaswatch/superhero/_variables.scss';

#path-preferences {
    width: 100%;
}

input { 
    color: $light !important;
    background-color: $grey-darker !important;
}
</style>