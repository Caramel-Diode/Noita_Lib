import fs, { fstatSync, fsync } from "node:fs";
import path from "node:path";
import { XML } from "./serverUtil.js";

const asyncFS = fs.promises;
/**
 * 递归获取目录下所有文件的展平路径数组
 * @param {string} dirPath
 * @returns {Promise<Array<string>>}
 */
const flatPath = async (dirPath, result = []) => {
    for (const item of await asyncFS.readdir(dirPath, { withFileTypes: true })) {
        const fullPath = path.join(dirPath, item.name);
        if (item.isDirectory()) await flatPath(fullPath, result);
        else result.push(fullPath);
    }
    return result;
};
/**
 * @param {string} dataPath
 */
export const generateAnimalsEntitiesPaths = async dataPath => {
    const animalsPath = dataPath + "/entities/animals";
    const allPaths = await flatPath(animalsPath);
    // console.log(allPaths);
    const result = [];
    for (const p of allPaths) {
        if (!p.endsWith(".xml")) continue;
        const doc = XML.parse(await asyncFS.readFile(p, { encoding: "utf8" }), { ignore: ["#text", "#comment"] });
        const [root] = doc.childNodes;
        if (root.tagName !== "Entity") continue; // 应该忽略掉的 Sprite xml
        if (!root.attr.has("name")) continue; // 无name 实体xml移除

        result.push(p.replaceAll("\\", "/").slice(dataPath.length - 4));
    }
    fs.writeFileSync(`./src/parseTools/entity/animalsEntitiesList.json`, JSON.stringify(result, null, 4));
};
