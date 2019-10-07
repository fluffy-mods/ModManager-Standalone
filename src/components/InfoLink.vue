<template>
    <div class="infolink">
        <span class="linkLabel">{{label}}: </span>
            <b-dropdown v-if="links !== undefined" hoverable aria-role="list">
                <span class="link text" slot="trigger">{{text}}</span>
                <b-dropdown-item v-for="(link, index) in links" :key="index" aria-role="listitem"><a :href="link.uri" target="_blank">{{link.label}}</a></b-dropdown-item>
            </b-dropdown>
            <span class="text" v-else>{{text}}</span>
    </div>    
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
    props: {
        label: {
            type: String,
            required: true
        },
        text: {
            type: String,
            default: ""
        },
        links: {
            type: Array,
        }
    }
})
</script>

<style lang="scss">
    @import '../../node_modules/bulmaswatch/superhero/_variables.scss';

    @media (max-width: 1200px){
        .infolink{
            width: 100%;
        }
    }

    @media ( min-width: 1200px ){
        .infolink{
            width: 50%;
        }
    }

    .infolink {
        display: flex;

        .linkLabel {
            color: $grey;
            width: 35%;
            text-overflow: ellipsis;
            white-space: nowrap;
            overflow: hidden;
        }

        .text {
            padding: 0 .5em;
            width: 65%;
            text-overflow: ellipsis;
            white-space: nowrap;
            overflow: hidden;
        }

        .link {
            text-decoration: underline;
            cursor: pointer;

            &:hover, &:active, &:focus-within {
                background-color: $grey-darker;
            }
        }

        .dropdown {
            width: 60%;

            .dropdown-trigger {
                width: 100%;
                height: 24px;

                .text {
                    width: 100%;
                }
            }
        }
    }
</style>