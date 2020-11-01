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
const sc = require('@google-cloud/security-center');

const init = async (ccfg, cfgIndex, config, DataStore, funcList, LogWritter) => {
  try {
    console.log("Init CSCC");
    if (ccfg.ORG_ID != undefined) {
      if(!process.env.GOOGLE_APPLICATION_CREDENTIALS){
        process.env.GOOGLE_APPLICATION_CREDENTIALS=ccfg.GOOGLE_APPLICATION_CREDENTIALS
      }
      funcList.forEach(func => {
        switch (func) {
          case "get_assets": get_assets(ccfg.ORG_ID, cfgIndex, config, DataStore, LogWritter); break;
          case "get_findings": get_findings(ccfg.ORG_ID, cfgIndex, config, DataStore, LogWritter); break;
        }
      });
    }
  } catch (err) {
    console.log(err)
    LogWritter(config, "err", `${JSON.stringify(err, null, 4)}`, `cscc_init_${cfgIndex}`)
  }
};

const get_assets = async (organizationId, cfgIndex, config, DataStore, LogWritter) => {
  try {
    const client = new sc.SecurityCenterClient();
    const orgName = client.organizationPath(organizationId);
    const [response] = await client.listAssets({ parent: orgName });
    LogWritter(config, "json", `${JSON.stringify(response, null, 4)}`, `cscc_get_assets_${cfgIndex}`)
  } catch (err) {
    console.log(err)
    LogWritter(config, "err", `${JSON.stringify(err, null, 4)}`, `cscc_get_assets_${cfgIndex}`)
  }
};

const get_findings = async (organizationId, cfgIndex, config, DataStore, LogWritter) => {
  try {
    const client = new sc.SecurityCenterClient();
    const orgName = client.organizationPath(organizationId);
    const [response] = await client.listFindings({parent: orgName});
    LogWritter(config, "json", `${JSON.stringify(response, null, 4)}`, `cscc_get_assets_${cfgIndex}`)
  } catch (err) {
    console.log(err)
    LogWritter(config, "err", `${JSON.stringify(err, null, 4)}`, `cscc_get_assets_${cfgIndex}`)
  }
};

module.exports = { init };