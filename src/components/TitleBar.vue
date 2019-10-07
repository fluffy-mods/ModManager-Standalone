<template>
    <div id="titlebar">
        <span class="titlebar-title">RimWorld Mod Manager</span>
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
            padding-left: 1em;
        }

        // padding: .75em;
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