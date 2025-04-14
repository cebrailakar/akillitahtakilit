import { defaultConfig, globalConfig } from "../config/default";
import { Main } from "./MainController";

export class ConfigController {
  main: Main;
  constructor(main: Main) {
    this.main = main;
  }
  get<K extends keyof typeof defaultConfig>(
    value: K
  ): (typeof defaultConfig)[K] {
    return defaultConfig[value];
  }
  getGlobal<K extends keyof typeof globalConfig>(
    value: K
  ): (typeof globalConfig)[K] {
    return globalConfig[value];
  }
}
