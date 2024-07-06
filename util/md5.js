import crypto from "crypto";
import fs from "fs";
/**
 *
 * @param {String} path
 * @returns {Promise<String>}
 */
const md5 = path => {
    const hash = crypto.createHash("md5");
    const stream = fs.createReadStream(path);
    return new Promise((resolve, reject) => {
        stream.on("data", chunk => hash.update(chunk));
        stream.on("end", () => resolve(hash.digest("hex")));
        stream.on("error", err => reject(err));
    });
};

export default md5;
