declare interface IMod {
    identifier: string
    name: string
    description?: string
    url?: string
    author?: string
    supportedVersions?: string[]
    preview?: string
    source: source
}

declare interface ILink {
    label: string
    uri: string
}

declare type source = "local" | "steam" | "missing";