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
const axios = require("axios");
let xmlParser = require('xml2json');

const init = async (qcfg, cfgIndex, config, DataStore, funcList, LogWritter) => {
  try {
    console.log("Init Qualys");
    if (qcfg.api != undefined) {
      funcList.forEach(func => {
        switch (func) {
          case "get_assets": get_assets(qcfg, cfgIndex, config, DataStore, LogWritter); break;
        }
      });
    }
  } catch (err) {
    LogWritter(config, "err", `${JSON.stringify(err, null, 4)}`, `cscc_init_${cfgIndex}`)
  }
};

const get_assets = async (qcfg, cfgIndex, config, DataStore, LogWritter) => {
        try {
            console.log("Getting Qualys information");
            const api = qcfg.api + "/api/2.0/fo/asset/host/?action=list";
            const options = {
                method: "GET",
                headers: {
                    "Content-Type": "text/xml",
                    "X-Requested-With": "Agent reporter",
                },
                url: api,
                auth: {
                    username: qcfg.username,
                    password: qcfg.password,
                },
            };
            const response = await axios(options);
            fmtData=xmlParser.toJson(response.data,{object: true})
            LogWritter(config, "json", `${JSON.stringify(fmtData, null, 4)}`, `qualys_get_assets_${cfgIndex}`)
        } catch (err) {
            LogWritter(config, "err", `${JSON.stringify(err, null, 4)}`, `qualys_get_assets_${cfgIndex}`)
        }
};

module.exports = { init };

