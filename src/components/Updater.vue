<template>
    <div id="update-status">
        <div class='current-version'>{{currentVersion}}</div>
        <template v-if="status === 'checking'">
            <b-icon icon="sync-alt" custom-class="fa-spin" title="checking for update" type="is-info" size="is-small" />
        </template>
        <template v-if="status === 'available'">
            <b-button icon="download" type="is-info" @click="downloadUpdate()" size="is-small">
                download update
            </b-button>
        </template>
        <template v-if="status === 'latest'">
            <b-icon icon="check" title="this is the latest version" type="is-success" size="is-small" />
        </template>
        <!-- <b-progress id="update-progress" :value="progressPercent" type="is-info" show-value>{{progressLabel}}</b-progress> -->
        <template v-if="status === 'downloading'">
            <b-progress id="update-progress" :value="progressPercent" type="is-info" show-value>{{progressLabel}}</b-progress>
        </template>
        <template v-if="status === 'ready'">
            <b-button icon="arrow-up-bold" type="is-info" @click="installUpdate()" size="is-small">
                install update and reload
            </b-button>
        </template>
        <template v-if="status === 'installing'">
            <b-icon icon="sync-alt" custom-class="fa-spin" title="installing update" type="is-info" size="is-small" />
        </template>
        <template v-if="status === 'error'">
            <b-icon icon="alert-cirlce" title="`error updating: ${err}`" type="is-danger" size="is-small" />
        </template>
    </div>
</template>

<style lang="scss">
    @import "~bulmaswatch/superhero/bulmaswatch";

    #update-status {
        display: flex;
        align-items: center;

        .button {
            -webkit-app-region: no-drag;
        }

        .current-version {
            padding: 0 .5em;
            color: $grey;
        }

        #update-progress {
            width: 100%;
            max-width: 300px;
        }
        
        progress, .progress {
            height: .75em;
            border-radius: 0;
        }
    }
</style>

<script lang="ts">
import Vue from 'vue'
import { ipcRenderer } from 'electron';
import log from 'electron-log';
import {SnackbarProgrammatic as Snackbar} from 'buefy';
import { remote } from 'electron';

export interface IProgressInfo {
    total: number;
    delta: number;
    transferred: number;
    percent: number;
    bytesPerSecond: number;
}

interface UpdaterData {
    status: string,
    progress: IProgressInfo | undefined;
    error: Error | undefined;
}

export default Vue.extend({
    data: (): UpdaterData => { return {
        status: '',
        progress: undefined,
        error: undefined
    }},
    computed: {
        currentVersion( this: any ){
            return `v${remote.app.getVersion()}`;
        },
        progressPercent(){
            if (this.progress) 
                return this.progress!.percent;
        },
        progressLabel(this: any) {
            if(this.progress) {
                const percent = Math.round( this.progress.percent ) + "%";
                const speed = this.formatBytes( this.progress.bytesPerSecond ) + "/s";
                return `${percent}, ${speed}`;
            } else {
                return "N/A";
            }
        }
    },
    created( this: any ){
        ipcRenderer.on('checking-for-update', (event) => {
            log.info("checking-for-update", {event});
            this.status = 'checking';
        });

        ipcRenderer.on('update-not-available', (event, info) => {
            log.info("update-not-available", {event, info});
            this.status = 'latest';
        });

        ipcRenderer.on('update-available', (event, info)=>{
            log.info( "update-available", {event, info});
            this.status = 'available';

            Snackbar.open({
                message: `v${info.version} update is available`,
                type: `is-success`,
                actionText: `download`,     
                duration: 10000,

                onAction: () => {
                    this.downloadUpdate();
                }
            })
        });

        ipcRenderer.on('download-progress', (event, progress) => {
            log.silly("download-progress", {event, progress} );
            this.progress = progress;    
        });

        ipcRenderer.on('update-downloaded', (event, info) => {
            log.info("update-downloaded", {event, info});
            this.status = 'ready';

            Snackbar.open({
                message: `v${info.version} update is ready to install`,
                type: `is-success`,
                actionText: `install and reload`,
                duration: 10000,
                onAction: () => {
                    this.installUpdate();
                }
            })
        });

        ipcRenderer.on('update-error', (event, error) => {
            log.error('update-error', {event, error});
            this.status = 'error';
            this.error = error;
        });
    },
    methods: {
        formatBytes(bytes: number, decimals = 2) {
            if (bytes === 0) return 'N/A';

            const k = 1024;
            const dm = decimals < 0 ? 0 : decimals;
            const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

            const i = Math.floor(Math.log(bytes) / Math.log(k));

            return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
        },
        downloadUpdate(){
            ipcRenderer.send( 'download-update' );
            this.status = 'downloading';
        },
        installUpdate(){
            ipcRenderer.send( 'install-update' );
            this.status = 'installing';
        }
    }
})
</script>