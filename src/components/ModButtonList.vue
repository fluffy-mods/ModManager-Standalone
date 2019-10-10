<template>
    <div class="mod-button-list">
        <div class="filters" :title="!!onUpdate ? 'currently disabled for active modlist' : false">
            <b-field>
                <b-button @click="steam = !steam" :type="steam ? 'is-success' : 'is-default'" size="is-small" :disabled="!!onUpdate">
                    <b-icon icon="steam" size="is-small"></b-icon>
                </b-button>
                <b-button @click="local = !local" :type="local ? 'is-success' : 'is-default'" size="is-small" :disabled="!!onUpdate">
                    <b-icon icon="folder" size="is-small"></b-icon>
                </b-button>
                <b-button @click="missing = !missing" :type="missing ? 'is-success' : 'is-default'" size="is-small" :disabled="!!onUpdate">
                    <b-icon icon="file-question" size="is-small"></b-icon>
                </b-button>
                <b-input v-model="filter" size="is-small" expanded placeholder="Search..."  :disabled="!!onUpdate" />
            </b-field>
        </div>
        <draggable v-if="draggable" v-model="available" group="mods" class="mods scrolling" :ghostClass="ghostClass">
            <mod-button v-for="(mod, index) in available" :key="mod.identifier" :mod="mod" :index="showIndex ? index : undefined" :button="button" />
        </draggable>
        <div v-else class="mods scrolling">
            <mod-button v-for="(mod, index) in available" :key="mod.identifier" :mod="mod" :index="showIndex ? index : undefined" :button="button" />
        </div>
    </div>
    
</template>

<script lang="ts">
import Vue from 'vue'
import { Mod } from '../io';
import draggable from 'vuedraggable';
import modButton from '@/components/ModButton.vue';

export default Vue.extend({
    name: "mod-button-list",
    data: () => {
        return {
            steam: true,
            local: true,
            missing: true,
            filter: ''
        }
    },
    computed: {
        available: {
            get(): Mod[] {
                return (<Mod[]>this.mods)
                    .filter( mod => !this.except.includes( mod )
                                 && ( ( this.steam && mod.source == "steam" ) 
                                   || ( this.local && mod.source == "local" )
                                   || ( this.missing && mod.source == "missing" ) )
                                 && ( mod.name.toLowerCase().includes( this.filter.toLowerCase() ) 
                                   || mod.author.toLowerCase().includes( this.filter.toLowerCase() ) ) );
            },
            set( value: Mod[] ): void {
                if (this.onUpdate){
                    this.onUpdate( value );
                }
            }
        }
    },
    props: {
        modlist: {
            type: Object,
            required: false
        },
        mods: {
            type: Array,
            required: true
        },
        ghostClass: {
            type: String,
            required: false
        },
        except: {
            type: Array,
            default: () => [],
            required: false
        },
        showIndex: {
            type: Boolean,
            default: false
        },
        button: {
            type: String,
            default: undefined
        },
        draggable: {
            type: Boolean,
            default: true
        },
        onUpdate: {
            type: Function
        },
        clearFiltersOnUpdate: {
            type: Boolean,
            default: false
        }
    },
    components: {
        draggable,
        modButton
    }
})
</script>

<style lang="scss">
@import "./../../node_modules/bulmaswatch/superhero/_variables.scss";

.mod-button-list {
    display: flex;
    flex-direction: column;
    flex: 1 1 auto;

    .filters {
        flex: 0 0 30px;
    }

    .mods {
        margin-top: .25em;
        flex: 1 1 auto;
    }

    input, .input {
        border: none !important;
    }
    
    ::placeholder { 
        color: $grey-light;
        opacity: 1; 
    }
}

</style>