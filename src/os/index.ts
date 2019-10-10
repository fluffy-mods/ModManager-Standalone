import { getDefaultPaths as getDefaultPathsWindows } from './windows';
import { IPathsState } from '@/store/paths';

export async function getDefaultPaths(): Promise<IPathsState> {
    switch(getPlatform()){
        case "windows":
            return await getDefaultPathsWindows();
        default:
            return {
                rimworldPath: "",
                steamPath: "",
                localPath: "",
                configPath: ""
            }
    }    
}

export function getPlatform(): "windows" | "mac" | "linux" | "other" {
    switch (process.platform){
        case "win32":
            return "windows";
        case "darwin":
            return "mac";
        case "linux":
            return "linux";
        default:
            return "other";
    }
}