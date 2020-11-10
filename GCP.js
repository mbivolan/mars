const sc = require('@google-cloud/security-center');
const Compute = require('@google-cloud/compute');
const { Resource } = require('@google-cloud/resource');
const { TranfsormJsonData, TransformObjToArr, TransformJson, ReportBuilder, ReportBuilderConvert } = require('./reports/utils');
const { InitAggregator, AddDataToAggregator, WriteDataFromAggregator } = require('./reports/report');

const init = async (gcpcfg, cfgIndex, config, DataStore, funcList, stats) => {
  try {
    console.log("Init GCP");
    if (gcpcfg.ORG_ID != undefined) {
      if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        process.env.GOOGLE_APPLICATION_CREDENTIALS = gcpcfg.GOOGLE_APPLICATION_CREDENTIALS
      }
      const AggConf = InitAggregator(config, config.GCP[cfgIndex].tag)
      outputWritter = { AggConf, AddDataToAggregator }

      for (const func of funcList) {
        var runtimeReport
        switch (func) {
          case "get_vms":
            runtimeReport = await get_vms(gcpcfg.ORG_ID, cfgIndex, config, DataStore, outputWritter);
            break;
          case "get_projects":
            runtimeReport = await get_projects(gcpcfg.ORG_ID, cfgIndex, config, DataStore, outputWritter);
            break;
          case "get_assets":
            runtimeReport = await get_assets(gcpcfg.ORG_ID, cfgIndex, config, DataStore, outputWritter);
            break;
          case "get_findings":
            runtimeReport = await get_findings(gcpcfg.ORG_ID, cfgIndex, config, DataStore, outputWritter);
            break;
        }
        stats.push({ ...runtimeReport, 'account id': gcpcfg.ORG_ID })
      };
      WriteDataFromAggregator(AggConf, config.GCP[cfgIndex].tag)
    }
  } catch (err) {
    console.log(err)
    stats.push({ name: 'login', apiURL: options.url, entries: 0, 'account id': gcpcfg.ORG_ID, reason: JSON.stringify(err, null, 4) })
  }
};
const get_projects = async (organizationId, cfgIndex, config, DataStore, outputWritter) => {
  try {
    const { Resource } = require('@google-cloud/resource');

    // Creates a client
    const resource = new Resource();

    // Lists current projects
    const [projects] = await resource.getProjects();

    console.log('Projects:');
    // console.log(JSON.stringify(projects, null, 4))
    console.log("muiecupula", projects[0].metadata.parent,Array.isArray(projects[0].metadata.parent))
    const replacements = {
      "metadata": {
        "projectNumber": "project_id",
        "projectId": "project_name",
        "createTime": "first_seen",
        "parent": {
          "id": "organization"
        }
      }
    }
    const extras = { 'Instance': config.GCP[cfgIndex].tag }
    const dataRemapped = TransformJson(projects, replacements, extras)
    console.log("muie",dataRemapped)
    // data = { data: dataRemapped, header: { header: headerList }, workSheetName: 'getSA', funcName: 'getSA' }
    // outputWritter.AddDataToAggregator(outputWritter.AggConf, data)

    // for (const project of projects) {
    //   // console.log(JSON.stringify(project.id, null, 4))
    //   // await get_vms(project.id)
    // }

    return { name: 'getUsers', apiURL: "@google-cloud/resource", entries: projects.length, reason: null }
  } catch (err) {
    console.log('error:', err)
    return { name: 'getUsers', apiURL: "@google-cloud/resource", entries: 0, reason: JSON.stringify(err, null, 4) }
  }
};

const get_vms = async (projectId) => {
  try {
    const client = new Compute({ projectId })

    const vms = await client.getVMs();

    console.log(JSON.stringify(vms, null, 4))

    // LogWritter(config, "json", `${JSON.stringify(response, null, 4)}`, `cscc_get_assets_${cfgIndex}`)
  } catch (err) {
    console.log(err)
    // LogWritter(config, "err", `${JSON.stringify(err, null, 4)}`, `cscc_get_assets_${cfgIndex}`)
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
  }
};

const get_findings = async (organizationId, cfgIndex, config, DataStore, LogWritter) => {
  try {
    const client = new sc.SecurityCenterClient();
    const orgName = client.organizationPath(organizationId);
    const [response] = await client.listFindings({ parent: orgName });
  } catch (err) {
    console.log(err)
  }
};

// const get_licenses = async ()=>{
//   const {google} = require('googleapis');
// var compute = google.compute('v1');

// authorize(function(authClient) {
//   var request = {
//     // Project ID for this request.
//     project: 'my-project',  // TODO: Update placeholder value.
//     auth: authClient,
//   };

//   var handlePage = function(err, response) {
//     if (err) {
//       console.error(err);
//       return;
//     }
//     var itemsPage = response['items'];
//     if (!itemsPage) {
//       return;
//     }
//     for (var i = 0; i < itemsPage.length; i++) {
//       // TODO: Change code below to process each resource in `itemsPage`:
//       console.log(JSON.stringify(itemsPage[i], null, 2));
//     }
//     if (response.nextPageToken) {
//       request.pageToken = response.nextPageToken;
//       compute.licenses.list(request, handlePage);
//     }
//   };

//   compute.licenses.list(request, handlePage);
// });

// function authorize(callback) {
//   google.auth.getClient({
//     scopes: ['https://www.googleapis.com/auth/cloud-platform']
//   }).then(client => {
//     callback(client);
//   }).catch(err => {
//     console.error('authentication failed: ', err);
//   });
// }
// }

const formatVMData = (data) => {
  const x = {
    "asset": {
      "resourceProperties": {
        "id": {
          "stringValue": "instance_id",
          "machineType": { "stringValue": "machine_type" },
          "cpuPlatform": { "stringValue": "cpu_type" },
          "zone": { "stringValue": "zone" }
        },
        "name": "vm_name",
        "securityCenterProperties": {
          "resourceProjectDisplayName": "project_id"
        }
      },
      "createTime": { "seconds": "creation_tls" },

      "metadata": {
        "lastStartTimestamp": "first_seen",
        "lastStopTimestamp": "last_seen"
      }
    }
  }
}




module.exports = { init };