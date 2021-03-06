/*
     Copyright 2020 SJULTRA, inc.

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.

 */
const fs = require("fs");

class config {
    constructor(path) {
        if (fs.existsSync(`${path}`)) {
            const raw = fs.readFileSync(`${path}`);
            let config = JSON.parse(raw);
            this._ = config;
            return this._;
        } else {
            const raw = fs.readFileSync("./config.json");
            let config = JSON.parse(raw);
            this._ = config;
            return this._;
        }
    }
}

module.exports = config;