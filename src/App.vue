<template>
  <div id="app">
    <titlebar />
    <div class="container" id="main">
      <div id="sidebar">
        <b-field is-expanded id="play-button">
          <div class="control is-expanded">
            <button class="button is-primary is-large" 
              style="width: 100%" 
              :disabled="rimworldPath === undefined" 
              :title="rimworldPath === undefined ? 'RimWorld not found. Set up paths first.' : 'Start RimWorld!'"
              @click="startGame()">
              Play!
            </button>
          </div>
          <div v-if="showDropdown" class="control">
            <b-dropdown>
              <button class="button is-primary is-large" slot="trigger">
                <b-icon icon="chevron-down" size="is-small" />
              </button>
              <div class="dropdown-label" custom>
                Play with modlist
              </div>
              <!-- Should not be doing filter logic here, but doing it in a computed property just ain't working -->
              <b-dropdown-item v-for="(modlist, index) in modlists.filter( l => !l.isModConfig )" :key="index" @click="startGameWith( modlist )">
                {{modlist.name}}
              </b-dropdown-item>
              <div class="dropdown-label" custom>
                Continue saved game
              </div>
              <b-dropdown-item v-for="save in saves" :key="save.name" @click="loadGame(save)">
                {{save.name}} 
                <span class="last-played">last played {{moment(save.time)}}</span>
              </b-dropdown-item>
            </b-dropdown>
          </div>
        </b-field>
        <div class="section menu-modlists">
          <modlists />
        </div>
        <div class="section menu-preferences">
          <div class="menu-label">Options</div>
          <ul class="menu-list">
            <li><router-link to="/options/preferences">Preferences</router-link></li>
            <li><router-link to="/options/paths">Paths</router-link></li>
          </ul>
        </div>
        <div class="section menu-about">
          <div class="menu-label">About</div>
          <ul class="menu-list">
            <li><router-link to="/about/team">The team</router-link></li>
            <li><router-link to="/about/roadmap">Roadmap</router-link></li>
          </ul>
        </div>
      </div>
      <div id="content">
            <router-view/>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { remote } from 'electron';
import { spawn } from 'child_process';
import titlebar from './components/TitleBar.vue';
import modlists from './components/ModlistsMenu.vue';
import { store, IState } from './store';
import { mapState } from 'vuex';
import { loadAll, Modlist, ISave, loadModlistFromSave } from './io';
import moment, { Moment } from 'moment';
import log from 'electron-log';

export default Vue.extend({
  computed: {
    ... mapState( "paths", [ "rimworldPath" ] ),
    ... mapState( "modlists", [ "modlists" ] ),
    ... mapState( "saves", ["saves"] ),
    showDropdown( this: any ): boolean {
      return this.rimworldPath !== undefined 
        && ( this.modlists.length  || this.saves.length )
    }
  },
  methods: {
    moment( time: Moment ): string {
      return time.fromNow();
    },
    startGame( this: any ){
      // remote.app.quit();
      if(this.rimworldPath){ 
        var child = spawn( store.state.paths.rimworldPath, [], {
          detached: true,
          stdio: [ 'ignore', 'ignore', 'ignore' ]
        }).unref();
      }
    }, 
    async startGameWith( modlist: Modlist, force: boolean = false ){
      if ( !force && modlist.mods.some( mod => mod.source === "missing" ) ){
        const missing = modlist.mods.filter( mod => mod.source === "missing" );
        this.$buefy.dialog.confirm({
                    title: 'Missing mods',
                    message: `Are you sure you want to start the game with this modlist?</p><p>The following mods are missing:</p><ul>${missing.map( m => '<li>' + m.name + '</li>' ).join( "\n" )}</ul>`,
                    confirmText: 'Start anyway',
                    type: 'is-warning',
                    hasIcon: true,
                    onConfirm: () => this.startGameWith( modlist, true )
                })
      } else {
        await store.dispatch( "modlists/updateModlist", {
          index: 0, // should always be ModsConfig
          mods: modlist.mods
        } );
        this.startGame();
      }     
    },
    async loadGame( save: ISave, force: boolean = false ){
      const modlist = await loadModlistFromSave( save );
      if ( !force && modlist.mods.some( mod => mod.source === "missing" ) ){
        const missing = modlist.mods.filter( mod => mod.source === "missing" );
        this.$buefy.dialog.confirm({
                    title: 'Missing mods',
                    message: `Are you sure you want to load this game?</p><p>The following mods are missing:</p><ul>${missing.map( m => '<li>' + m.name + '</li>' ).join( "\n" )}</ul>`,
                    confirmText: 'Start anyway',
                    type: 'is-danger',
                    hasIcon: true,
                    onConfirm: () => this.loadGame( save, true )
                })
      } else {
        // await store.dispatch( "modlists/updateModlist", {
        //   index: 0, // should always be ModsConfig
        //   mods: modlist.mods
        // });
        this.$buefy.snackbar.open("sorry, that doesn't work yet.")
      }     
    }
  },
  components: { titlebar, modlists },
  created: async function() {
    store.watch( ( state: IState, getters: any ) => state.paths.configPath, () => loadAll() );
    store.watch( ( state: IState, getters: any ) => state.paths.steamPath, () => loadAll() );
    store.watch( ( state: IState, getters: any ) => state.paths.localPath, () => loadAll() );
    store.watch( ( state: IState, getters: any ) => state.mods, () => loadAll() );
    await loadAll();
  }
})
</script>

<style lang="scss">
  @import "~bulmaswatch/superhero/bulmaswatch";
  @import "~@mdi/font/css/materialdesignicons.min.css";
  @import "~buefy/src/scss/buefy";
  
  $darker: darken( $dark, 3 );
  $darkest: darken( $darker, 3 );

  html {
    // background-color: $grey-darker;
    background-image: url('./assets/backdrop.jpg');
    background-color:#000;
    background-size: cover;
    background-position: top center;
    background-repeat: no-repeat;
  }

  html, body, #app {
    height: 100%;
    max-height: 100%;
    width: 100%;
    max-width: 100%;
  }

  #app {
    display: flex;
    flex-flow: column;
  }

  #titlebar {
    flex: 0 0 36px;
  }

  #main {
    flex: 1 1 auto;
    display: flex;
    flex-direction: row;
    padding: 1em 0;
    max-height: calc( 100% - 36px );
    width: 100%;

    @media ( max-width: $desktop ){
      max-width: 100%;
    }
  }

  #sidebar {
    flex: 0 0 200px;
    padding-right: 1em;
    width: 200px;
    height: 100%;

    display: flex;
    flex-direction: column;

    #play-button, .menu-about, .menu-preferences {
      flex: 0 0 auto;
    }

    .dropdown-item:hover {
      background-color: $primary !important;
      color: $text;
    }

    .dropdown-item:nth-child(2n+1){
      background-color: rgba( 0, 0, 0, .1 );
    }

    .dropdown-label {
      display: block;
      margin-left: .75em;
      color: $grey-light;
      font-size: 0.75em;
      letter-spacing: 0.1em;
      text-transform: uppercase;

      &:not(:first-child) {
        margin-top: 1.5em;
      }
    }

    .last-played {
      display: block;
      color: $grey;
    }

    .menu-modlists {
      flex: 0 1 auto;
    }

    .section + .section {
      margin-top: 1em;
    }

    .menu-label {
      margin-bottom: .5em;
    }

    .menu-list {
      li {
        a {
          padding: .25em .5em;
        }
      }
    }
  }

  #content {
    flex: 1 0 calc( 100% - 200px );
    // background: rgba( 200, 100, 100, .5 );
    width: calc(100% - 200px);
    max-height: 100%;
    max-width: calc( 100% - 200px );
    display: flex;
  }

  .section {
    padding: .5em;
    max-height: 100%;
    background-color: $dark;
  }

  .name {
    font-size: x-large;

    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }

  .button.is-darker {
    background-color: darken( $dark, 3 );

    &:hover, &:active, &:focus-within {
      background-color: darken( $dark, 6 );
    }
  }

  html, body {
    overflow: hidden;
  }

  ::-webkit-scrollbar {
      width: 1em;
  }

  ::-webkit-scrollbar-track {
      box-shadow: inset 0 0 10px 10px $darker;
      border: solid 5px transparent;
  }

  ::-webkit-scrollbar-thumb {
      box-shadow: inset 0 0 10px 10px $darkest;
      border: solid 5px transparent;
  }

  .scrolling {
      overflow-y: auto;
  }

</style>