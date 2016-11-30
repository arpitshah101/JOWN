import * as mongoose from "mongoose";

import { DataManager } from "./datamanager";

export class PreDefTasks {
    public jownprint(args?: string[]): string {
        if (!args) return null;
        let output = args.reduce((prev: string, curr: string) => prev.concat((prev.length > 0) ? " " + curr : curr), "");
        output.substring(0, output.length - 1);
        console.log(output);
        return output;
    }
}