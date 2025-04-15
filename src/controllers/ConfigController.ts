import { mkdirSync, readFileSync, statSync, writeFileSync } from "fs";
import { defaultConfig, globalConfig } from "../config/default";
import { Main } from "./MainController";
import path from "path";
export class ConfigController {
  main: Main;
  database: typeof defaultConfig;
  private first: boolean = false;
  constructor(main: Main) {
    this.main = main;
    this.database = { ...defaultConfig };
    try {
      statSync(this.getGlobal("databasePath"));
      console.log("Config dizini mevcut.");
    } catch (err) {
      mkdirSync(this.getGlobal("databasePath"), { recursive: true });
      console.log("Klasör oluşturuldu.");
    }
  }
  isFirst() {
    const first = this.first || !!this.get("url");
    if (first) this.first = false;
    return first;
  }
  get<K extends keyof typeof defaultConfig>(
    value: K
  ): (typeof defaultConfig)[K] {
    this.getData();
    return this.database[value];
  }
  getGlobal<K extends keyof typeof globalConfig>(
    value: K
  ): (typeof globalConfig)[K] {
    return globalConfig[value];
  }
  set<K extends keyof typeof defaultConfig>(
    get: K,
    set: (typeof defaultConfig)[K]
  ) {
    this.getData();
    this.database[get] = set;
    this.writeData();
  }
  private getData() {
    try {
      const read = readFileSync(
        path.join(this.getGlobal("databasePath"), "data"),
        "utf-8"
      );
      const decoded = this.main.packet.decodePack(
        read,
        this.getGlobal("systemPassword")
      );
      const json = JSON.parse(decoded);
      this.database = json;
    } catch (error) {
      this.first = true;
      this.writeData();
    }
  }
  private writeData() {
    try {
      const string = JSON.stringify(this.database);
      const encoded = this.main.packet.encodePack(
        string,
        this.getGlobal("systemPassword")
      );
      writeFileSync(path.join(this.getGlobal("databasePath"), "data"), encoded);
    } catch (error) {
      console.log("Database yok");
      console.log(error);
    }
  }
}
