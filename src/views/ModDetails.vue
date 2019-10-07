<template>
    <div id="mod">
        <div class="available-list section">
            <div class="header">
                <div class="name">Available mods</div>
            </div>
            <mod-button-list :mods="mods" :draggable="false" />
        </div>
        <div class="details-panel">
            <div class="preview section">
                <img v-if="mod.preview" :src="previewData" :alt="`preview image for ${mod.name}`" class="preview-img">
            </div>
            <div class="details section">
                <info-link label="Name" :text="mod.name" :links="mod.modLinks" />
                <info-link label="Author" :text="mod.author" />
                <info-link label="Target version" :text="mod.supportedVersions.join( ', ' )" />
                <info-link label="Mod version" :text="mod.version" mod.updateLinks />
            </div>
            <div class="description section scrolling" v-html="mod.description"></div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Mod } from '@/io';
import store from '@/store';
import fs from 'mz/fs';
import { mapState } from 'vuex';
import modButtonList from '../components/ModButtonList.vue';
import infoLink from '../components/InfoLink.vue';

export default Vue.extend({
    data(): { mod: Mod, filter: string, steam?: boolean, local?: boolean } {
        return {
            mod: store.getters['mods/findOneById']( this.identifier ),
            filter: ''
        }
    },
    created() {
        this.setMod();
    },
    computed: {
        previewData(): string {
            const previewPath = this.mod?.preview;
            if (previewPath) {
                // note: this is not a pretty hack. Mixed-source content is a bit of an issue, 
                // even in electron - apparently.
                // The simple fact that we can sidestep it by using node/fs is just silly.
                const base64Data = fs.readFileSync( previewPath ).toString('base64');
                return `data:image/png;base64, ` + base64Data;
            }
            return "";
        },
        ... mapState( "mods", ["loaded"] ),
        mods(): Mod[] {
            return (<any>this).loaded.sort( ( a: Mod, b: Mod ) => `${a.name}`.localeCompare( b.name ) );
        }
    },
    beforeRouteUpdate( to, from, next ) {
        this.setMod( to.params.identifier );
        next();
    },
    props: {
        identifier: {
            type: String,
            required: true
        }
    },
    methods: {
        setMod( identifier?: string ) {
            this.mod = store.getters['mods/findOneById']( identifier ?? this.identifier );
        }
    },
    components: {
        modButtonList,
        infoLink
    }
})
</script>

<style lang="scss" scoped>
    @import './../../node_modules/bulmaswatch/superhero/_variables.scss';
    @import './../../node_modules/bulma/sass/utilities/_all.sass';

    #mod {
        display: flex;
        flex-direction: row;
        max-width: 100%;
        max-height: 100%;

        .available-list {
            flex: 0 1 40%;
            width: 40%;
            max-width: 40%;
            max-height: 100%;
            height: 100%;

            .header {
                flex: 0 0 40px;
                display: flex;
                flex-direction: row;
                width: 100%;
                height: 40px;

                .name{
                    flex: 1 1 auto;
                }
                .buttons {
                    flex: 0 1 auto;
                }
            }

            .mod-button-list {
                flex: 0 1 calc( 100% - 40px );
                max-height: calc( 100% - 40px );
            }
        }

        .details-panel {
            flex: 1 1 auto;
            width: 60%;
            padding-left: 1em;
            max-height: 100%;
            
            display: flex;
            flex-direction: column;

            .preview {
                flex: 0 0 auto;
                padding: 0;
                background-color: transparent;

                img {
                    width: 100%;
                    max-width: 640px;
                    max-height: 33vh;
                    display: block;
                }
            }

            .details {
                flex: 0 0 auto;
                display: flex;
                flex-wrap: wrap;
                overflow: visible;

                padding: .5em;
                margin-top: .5em;
            }

            .description {
                flex: 1 1 auto;

                white-space: pre-wrap;
                margin-top: .5em;
            }
        }
    }


</style>