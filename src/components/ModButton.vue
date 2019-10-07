<template>
    <div :class="{ modbutton: true, missing: mod.source === 'missing' }" @click="$router.push({ name: 'mods', params: { identifier: mod.identifier } })">
        <div class="badge" v-if="index !== undefined">{{index + 1}}</div>
        <div class="badge" :title="mod.identifier">
            <b-icon v-if="mod.source === 'missing'" icon="file-question" size="is-small" />
            <b-icon v-if="mod.source === 'local'" icon="folder" size="is-small" />
            <b-icon v-if="mod.source === 'steam'" icon="steam" size="is-small" />
        </div>
        <div class="name">{{mod.name}}</div>
        <div class="author">{{mod.author}}</div>
        <div class="buttons is-pulled-right">
            <b-button v-if="button === 'add'" 
                type="is-extra-dark" size="is-small"
                @click.stop.prevent="addToModlist" title="add to modlist">
                <b-icon icon="plus" size="is-small"></b-icon>
            </b-button>
            <b-button v-if="button === 'remove'" 
                type="is-extra-dark" size="is-small"
                @click.stop.prevent="removeFromModlist" title="remove from modlist">
                <b-icon icon="minus" size="is-small"></b-icon>
            </b-button>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Mod } from '../io';

export default Vue.extend({
    name: "mod-button",
    props: {
        mod: {
            type: Mod,
            required: true
        },
        index: {
            type: Number,
            required: false
        },
        button: {
            type: String,
            required: false
        }
    },
    methods: {
        activeModlist(): number {
            return Number.parseInt( this.$route.params.list );
        },
        removeFromModlist( this: any): void {
            this.$store.dispatch("modlists/removeModFromModlist", { index: this.activeModlist(), mod: this.mod });
        },
        addToModlist( this: any): void {
            this.$store.dispatch("modlists/addModToModlist", { index: this.activeModlist(), mod: this.mod });
        }
    }
})
</script>

<style lang="scss" scoped>
    @import '../../node_modules/bulmaswatch/superhero/_variables.scss';
    $darker: darken( $dark, 3 );
    $darkest: darken( $darker, 3 );

    .modbutton {
        background-color: $darker;        
        margin: .5em 0;
        display: flex;
        cursor: pointer;

        &.missing {
            background-color: rgba( 200, 0, 0, .2 );

            .button.is-extra-dark {            
                background-color: transparent;
            }
        }

        .badge {
            flex: 0 0 auto;
            background-color: $darkest;
            color: $grey;
            padding: .5em;
        }

        .name, .author {
            padding: .5em;
            text-overflow: ellipsis;
            white-space: nowrap;
            overflow: hidden;
            font-size: unset;
        }

        .name {
            flex: 0 1 auto;
        }

        .author {
            flex: 0 100 auto;

            color: $grey;
            &::before {
                content: "by ";
            }
        }

        .buttons {
            flex: 0 0 auto;

            display: flex;
            margin-left: auto;
            margin-right: .4em;
            flex-wrap: nowrap;
        }

        .button.is-extra-dark {
            background-color: $darker;
            border: none;

            &:hover, &:active, &:focus-within {
                background-color: $darkest;
            }
        }
    }
</style>