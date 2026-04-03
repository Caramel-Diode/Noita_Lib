import fs from "fs";
import path from "path";
const componentDirPath = `src/component`;
export const saveData = (pathToSave, data) => fs.writeFile(path.join(componentDirPath, pathToSave), data, err => err && console.log(err));
