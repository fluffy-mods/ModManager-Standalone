<template>
    <div id="titlebar">
        <span class="titlebar-title">
            RimWorld Mod Manager
        </span>
        <updater class="titlebar-updater" />
        <b-field class="buttons">
            <div class="control">
                <b-button type="is-dark" @click="minimize">
                    <b-icon size="is-small" icon="window-minimize"></b-icon>
                </b-button>
                <b-button type="is-dark" v-if="!maximized" @click="maximize">
                    <b-icon size="is-small" icon="window-maximize"></b-icon>
                </b-button>
                <b-button type="is-dark" v-if="maximized" @click="restore">
                    <b-icon size="is-small" icon="window-restore"></b-icon>
                </b-button>
                <b-button type="is-dark" @click="close" class="close">
                    <b-icon size="is-small" icon="window-close"></b-icon>
                </b-button>
            </div>
        </b-field>
    </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { remote } from 'electron';
import updater from './Updater.vue';

export default Vue.extend({
    name: "titlebar",
    data: function() {
        return {
            maximized: remote.getCurrentWindow().isMaximized(),
            window: remote.getCurrentWindow()
        }
    },
    methods: {
        maximize: function() {
            this.window.maximize()
            this.maximized = this.window.isMaximized()
        },
        restore: function() {
            this.window.restore()
            this.maximized = this.window.isMaximized()
        },
        minimize: function() {
            this.window.minimize()
            this.maximized = this.window.isMaximized()
        },
        close: function(){
            this.window.close()
        }
    },
    computed: {
        version: () => ( 'v' + remote.app.getVersion() )
    },
    components: {
        updater
    }
})
</script>

<style lang="scss" scoped>
    @import "~bulmaswatch/superhero/bulmaswatch";

    #titlebar {
        -webkit-app-region: drag;

        background-color: $grey-darker;
        display: flex;
        justify-content: space-between;
        align-items: center;
        
        .titlebar-title {
            flex: 0 0 auto;
            padding-left: 1em;
        }

        .titlebar-updater {
            flex: 1 1 auto;
        }

        .buttons {
            flex: 0 0 auto;
        }

        button, .button {
            -webkit-app-region: no-drag;
            width: 3em;
            background-color: $grey-darker;

            &:hover, &:active, &:focus-within {
                background-color: $dark;
            }

            &.close {
                &:hover {
                    background-color: $red;
                }
                &:active, &:focus-within {
                    background-color: darken( $red, 3 );
                }
            }
        }
    }
</style>