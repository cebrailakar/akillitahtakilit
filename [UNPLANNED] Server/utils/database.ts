import config from "../config.js";
import path from "path";
import fs from "fs";
import { decodePack, encodePack } from "./pass.js";
const load = (file: string) =>
  JSON.parse(decodePack(fs.readFileSync(file, "utf-8"), config.password));

const write = (file: string, data: any) =>
  fs.writeFileSync(
    file,
    encodePack(JSON.stringify(data, null, 4), config.password)
  );

export default class Database {
  file: string;
  constructor(file: string) {
    this.file = file || "database.json";
    this.file = path.join(config.databasePath, this.file);
    try {
      load(this.file);
    } catch {
      write(this.file, {});
    }
  }

  set(data: string, value: any) {
    if (!data) throw Error("[err] no data to set");
    if (!value) throw Error("[err] no value to set");
    const fileData = load(this.file);
    fileData[data] = value;
    write(this.file, fileData);
    return;
  }
  remove(data: string) {
    if (!data) throw Error("[err] no value to remove");
    const fileData = load(this.file);
    if (!fileData[data])
      throw Error(
        "[err] mentioned data isn't in directory or cannot be reached"
      );
    fileData[data] = undefined;
    write(this.file, fileData);
    return;
  }

  //🪐 this is a nice planet.
  deleteEach(data: string) {
    if (!data) throw Error("[err] No data to deleteEach");
    const fileData = load(this.file);
    let item = Object.keys(fileData);
    if (item.length === 0) throw Error("[err] No data to deleteEach");
    item = item.filter((Data) => Data.includes(data));
    item.forEach((Data) => {
      this.remove(Data);
    });
    return;
  }

  push(array: string, value: string) {
    if (!array) throw Error("[err] No array to push");
    if (!value) throw Error("[err] No value to push to the array");
    const fileData = load(this.file);
    if (fileData[array] && Array.isArray(fileData[array])) {
      fileData[array].push(value);
      write(this.file, fileData);
    } else if (!fileData[array]) {
      this.set(array, [value]);
    }
    return;
  }

  delete(array: string, index: number) {
    if (!array) throw Error("[err] No array to index/value delete");
    if (index === undefined)
      throw Error("[err] No index/value to delete from the array");
    const fileData = load(this.file);
    if (!fileData[array] && !Array.isArray(fileData[array]))
      throw Error(
        "[err] The array to index/value delete dosen't exist or it's not array"
      );
    if (typeof index === "number") {
      fileData[array].splice(index, 1);
      write(this.file, fileData);
    } else if (isNaN(index)) {
      if (fileData[array].includes(index)) {
        fileData[array].splice(fileData[array].indexOf(index), 1);
        write(this.file, fileData);
      } else {
        throw Error(
          "[err] Unable to find a value with the provided index/value to delete"
        );
      }
    }
    return;
  }

  deleteKey(object: string, key: string | number) {
    if (!object) throw Error("[err] No object to key delete");
    if (!key) throw Error("[err] No key to delete from the object");
    const fileData = load(this.file);
    if (!fileData[object])
      throw Error(
        "[err] The object to delete key dosen't exist in the database"
      );
    if (typeof fileData[object] !== "object")
      throw Error(
        "[err] The provided object to key delete is not an object in the database"
      );
    delete fileData[object][key];
    write(this.file, fileData);
    return;
  }

  has(data: string) {
    if (!data) throw Error("[err] No data to has function");
    const fileData = load(this.file);
    if (!fileData[data]) return false;
    if (fileData[data]) return true;
  }

  clear() {
    write(this.file, {});
    return;
  }

  all() {
    return load(this.file);
  }

  destroy() {
    write(this.file, {});
    return;
  }

  get(data: string) {
    if (!data) throw Error("[err] No data to get");
    const fileData = load(this.file);
    if (!fileData[data]) fileData[data] = null;
    return fileData[data];
  }

  objectFetch(object: string, key: string) {
    const fileData = load(this.file);
    if (!object) throw Error("[err] No object to object fetch");
    if (!key) throw Error("[err] No key to object fetch");
    if (!fileData[object])
      throw Error(
        "[err] The object to object fetch dosen't exist in the database"
      );
    if (typeof fileData[object] !== "object")
      throw Error(
        "[err] The provided object to object fetch is not an object in the database"
      );
    if (!fileData[object][key]) fileData[object][key] = null;
    return fileData[object][key];
  }

  arrayFetch(array: string, number: number) {
    const fileData = load(this.file);
    if (!array) throw Error("[err] No array to array fetch");
    if (!number && number != 0)
      throw Error("[err] No index/number to array fetch");
    if (!fileData[array] && !Array.isArray(fileData[array]))
      throw Error("[err] The array to fetch dosen't exist or it's not array");
    if (typeof number !== "number" && number !== 0)
      throw Error(
        `[err] The number/index to array fetch must be a number, received type: ${typeof number}`
      );
    if (!fileData[array][number]) fileData[array][number] = null;
    return fileData[array][number];
  }
}
