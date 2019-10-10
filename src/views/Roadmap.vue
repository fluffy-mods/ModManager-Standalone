<template>
    <div class="section scrolling">
        <h1 class="title">Basic Functionality</h1>
        <ul class="checklist">
            <li class="done">Create and delete mod lists</li>
            <li class="done">Add mods to mod list <ul>
                <li class="done">Drag-n-drop</li>
                <li class="done">Button per mod</li>
                <li class="done">Add list to list</li>
                <li class="done">Replace active with list</li>
            </ul></li>
            <li class="done">Remove mods from mod list <ul>
                <li class="done">Drag-n-drop</li>
                <li class="done">Button</li>
                <li class="done">Reset</li>
            </ul></li>
            <li class="done">Mod details view</li>
            <li class="done">Launch game</li>
            <li class="done">Launch game with mod list</li>
            <li>Launch game into save
                <ul>
                    <li class="done">load modlist from save</li>
                    <li>companion mini-mod to allow quickstarting into arbitrary save</li>
                </ul>
            </li>
            <li class="done">Load mod list from save (streaming xml, yay!)</li>
            <li class="failed">Get RimWorld path from registry</li>
            <li class="done partial">Mod list searching/filtering</li>
            <li>write Readme</li>
            <li class="done">set up repository</li>
            <li class="done">Set up auto-update</li>
        </ul>
        <hr>
        <h1 class="title">Full release</h1>
        <ul class="checklist">
            <li>Deal with manifests <ul>
                <li>Infer load order</li>
                <li>Dependencies &amp; incompatibilities</li>
                <li>Version checking</li>
            </ul></li>
            <li>Basic non-windows support<ul>
                <li>Check it works</li>
                <li>Default paths</li>
            </ul></li>
            <li>Steam integration <ul>
                <li>Unsubscribe mods</li>
                <li>Subscribe to mods <ul>
                    <li>Missing dependency resolver</li>
                    <li>Other mods from authors</li>
                </ul></li>
                <li>Export mod list as collection</li>
            </ul></li>
            <li>Parse about.xml description unity text into html equivalent</li>
            <li>Keyboard navigation
                <ul>
                    <li>add/remove mods to/from modlist</li>
                    <li>move mods up/down (top/bottom)</li>
                    <li>navigate modlists</li>
                </ul>
            </li>
        </ul>
        <hr>
        <h1 class="title">Wouldn't that be nice</h1>
        <ul class="checklist">
            <li>Automatic mod updates (if desired, we're not Valve)</li>
            <li>Automatic mod installs (rimworldmod:// protocol, for e.g. installs from rimworld base?)</li>
            <li>crowd-sourced tag system</li>
            <li>get tags from curated mod databases</li>
        </ul>
    </div>
</template>

<style lang="scss">
ul.checklist {
    &, ul {
        padding-left: 10px;
    }

    li {
        padding-left: 1rem;
        padding-bottom: .3rem;
        text-indent: -0.7rem;
    }

    li::before {
        content: "☐ "; 
    }

    li.failed {
        &::before, &::after {
            content: "😭";
        }
        color: rgba( 160, 40, 40, 1 );
    }

    li.done {
        &::before, &::after {
            content: "🎉";
        }
        text-decoration: line-through;

        &.partial {
            text-decoration: none;
            font-style: italic;
            
            &::after {
                content: "... sortof ...";
            }
        }
    }
}
</style>