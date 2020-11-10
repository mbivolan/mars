const axios = require('axios');
const { TranfsormJsonData, TransformObjToArr, TransformJson, ReportBuilder, ReportBuilderConvert } = require('./reports/utils');
const { InitAggregator, AddDataToAggregator, WriteDataFromAggregator } = require('./reports/report');

const init = async (pcfg, cfgIndex, config, DataStore, funcList, stats) => {
    console.log('Init Prisma cloud');
    const api = pcfg.api + '/login/';
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        url: api,
        data: {
            username: pcfg.ApiID,
            password: pcfg.ApiSecretKey,
        },
    };

    try {
        await axios(options).then(async (response) => {
            DataStore.set('x-redlock-auth', response.data.token);
            if (DataStore.get('x-redlock-auth') != undefined) {
                const AggConf = InitAggregator(config, config.PrismaCloud[cfgIndex].tag)
                outputWritter = { AggConf, AddDataToAggregator }
                for (const func of funcList) {
                    var runtimeReport
                    switch (func) {
                        case 'getUsers':
                            runtimeReport = await getUsers(pcfg.api, cfgIndex, config, DataStore, outputWritter);
                            break
                        case 'getSA':
                            runtimeReport = await getSA(pcfg.api, cfgIndex, config, DataStore, outputWritter)
                            break
                        case 'getAuditLogs':
                            runtimeReport = await getAuditLogs(pcfg.api, cfgIndex, config, DataStore, outputWritter);
                            break
                        case 'getPolicies':
                            runtimeReport = await getPolicies(pcfg.api, cfgIndex, config, DataStore, outputWritter)
                            break
                        case 'getCompliance':
                            runtimeReport = await getCompliance(pcfg.api, cfgIndex, config, DataStore, outputWritter)
                            break
                        case 'getPolicyCompliance':
                            runtimeReport = await getPolicyCompliance(pcfg.api, cfgIndex, config, DataStore, outputWritter)
                            break
                        case 'getAlerts':
                            runtimeReport = await getAlerts(pcfg.api, cfgIndex, config, DataStore, outputWritter)
                            break
                    }
                    stats.push({ ...runtimeReport, 'account id': pcfg.ApiID })
                };
                WriteDataFromAggregator(AggConf, config.PrismaCloud[cfgIndex].tag)
            }
        })
    } catch (err) {
        console.log('error:', err)
        stats.push({ name: 'login', apiURL: options.url, entries: 0, 'account id': pcfg.ApiID, reason: JSON.stringify(err, null, 4) })
    }
};

const getUsers = async (pcfgapi, cfgIndex, config, DataStore, outputWritter) => {
        console.log('Getting PrismaCLoud information');
        const api = pcfgapi + '/user';
        const jwt = DataStore.get('x-redlock-auth');
        const options = {
            method: 'GET',
            headers: {
                'x-redlock-auth': jwt,
                accept: '*/*',
            },
            url: api,
        };
        try {
        const headerList = [
            'Instance',
            'Email',
            'First Name',
            'Last Name',
            'Time Zone ',
            'Enabled',
            'Last Modified By',
            'Last Modified At',
            'Last Login At',
            'Role Name',
            'Role Type',
            'Display Name',
            'Access Keys Allowed'
        ]
        const replacements = {
            'email': 'Email',
            'firstName': 'First Name',
            'lastName': 'Last Name',
            'timeZone': 'Time Zone ',
            'enabled': 'Enabled',
            'lastModifiedBy': 'Last Modified By',
            'lastModifiedTs': 'Last Modified At',
            'lastLoginTs': 'Last Login At',
            'role': {
                'name': 'Role Name'
            },
            'roleType': 'Role Type',
            'displayName': 'Display Name',
            'accessKeysAllowed': 'Access Keys Allowed'
        };
        const extras = { 'Instance': config.PrismaCloud[cfgIndex].tag }
        const response = await axios(options)
        console.log('getUsers', JSON.stringify(response.data))
        const dataRemapped = TransformJson(response.data, replacements, extras)
        data = { data: dataRemapped, header: { header: headerList }, workSheetName: 'getUsers', funcName: 'getUsers' }
        outputWritter.AddDataToAggregator(outputWritter.AggConf, data)
        return { name: 'getUsers', apiURL: options.url, entries: response.data.length, reason: null }
    } catch (err) {
        console.log('error:', err)
        return { name: 'getUsers', apiURL: options.url, entries: 0, reason: JSON.stringify(err, null, 4) }
    }
};

const getSA = async (pcfgapi, cfgIndex, config, DataStore, outputWritter) => {
        console.log('Getting PrismaCLoud information');
        const api = pcfgapi + '/access_keys';
        const jwt = DataStore.get('x-redlock-auth');
        const options = {
            method: 'GET',
            headers: {
                'x-redlock-auth': jwt,
                accept: '*/*',
            },
            url: api,
        };
        try {
        const headerList = [
            'Instance',
            'Name',
            'Created By',
            'Created At',
            'Last Used',
            'Status',
            'Expires On',
            'Role Name',
            'Role Type'
        ]
        const replacements = {
            'name': 'Name',
            'createdBy': 'Created By',
            'createdTs': 'Created At',
            'lastUsedTime': 'Last Used',
            'status': 'Status',
            'expiresOn': 'Expires On',
            'role': {
                'name': 'Role Name'
            },
            'roleType': 'Role Type'
        };
        const extras = { 'Instance': config.PrismaCloud[cfgIndex].tag }
        const response = await axios(options)
        console.log('getSA', JSON.stringify(response.data))
        const dataRemapped = TransformJson(response.data, replacements, extras)
        data = { data: dataRemapped, header: { header: headerList }, workSheetName: 'getSA', funcName: 'getSA' }
        outputWritter.AddDataToAggregator(outputWritter.AggConf, data)
        return { name: 'getSA', apiURL: options.url, entries: response.data.length, reason: null }
    } catch (err) {
        console.log('error:', err)
        return { name: 'getSA', apiURL: options.url, entries: 0, reason: JSON.stringify(err, null, 4) }
    }
};
//How we are authenticating 
const getAuditLogs = async (pcfgapi, cfgIndex, config, DataStore, outputWritter) => {
    console.log('Getting PrismaCLoud information');
    const api = pcfgapi + '/audit/redlock';
    const jwt = DataStore.get('x-redlock-auth');
    const options = {
        method: 'GET',
        headers: {
            'x-redlock-auth': jwt,
            accept: 'application/json; charset=UTF-8',
        },
        params: { timeType: 'relative', timeAmount: '7', timeUnit: 'day' }, // check here
        url: api,
    };
    try {
        const headerList = [
            'Instance',
            "Timestamp",
            "User",
            "IP",
            "Resource Type",
            "Resource Name",
            "Action",
            "Result"
        ]
        const replacements = {
            "timestamp": "Timestamp",
            "user": "User",
            "ipAddress": "IP",
            "resourceType": "Resource Type",
            "resourceName": "Resource Name",
            "action": "Action",
            "result": "Result"

        };
        const extras = { 'Instance': config.PrismaCloud[cfgIndex].tag }
        const response = await axios(options)
        console.log('getAuditLogs', JSON.stringify(response.data))
        const dataRemapped = TransformJson(response.data, replacements, extras)
        data = { data: dataRemapped, header: { header: headerList }, workSheetName: 'getAuditLogs', funcName: 'getAuditLogs' }
        outputWritter.AddDataToAggregator(outputWritter.AggConf, data)
        return { name: 'getAuditLogs', apiURL: options.url, entries: response.data.length, reason: null }
    } catch (err) {
        console.log('error:', err)
        return { name: 'getAuditLogs', apiURL: options.url, entries: 0, reason: JSON.stringify(err, null, 4) }
    }
};

const getPolicies = async (pcfgapi, cfgIndex, config, DataStore, outputWritter) => {
    console.log('Getting PrismaCLoud Policies Information');
    const api = pcfgapi + '/v2/policy';
    const jwt = DataStore.get('x-redlock-auth');
    const options = {
        method: 'GET',
        headers: {
            'x-redlock-auth': jwt,
            accept: 'application/json; charset=UTF-8',
        },
        url: api,
    };
    try {
        const response = await axios(options)
        const headerList = ['Instance', 'Policy Descriptor', 'Policy Name', 'Compliance Requirement', 'Compliance Section', 'Category', 'Policy Class', 'Policy Sub Types', 'Cloud', 'Severity', 'Policy Type', 'Labels', 'Remediable', 'Policy Mode', 'Standards', 'Last Modified By', 'Status', 'RQL']
        const KeysArrs = ['Compliance Requirement', 'Compliance Section', 'Policy Sub Types', 'Labels', 'Standards']
        const replacements = {
            'policyUpi': 'Policy Descriptor',
            'name': 'Policy Name',
            'complianceMetadata': {
                'requirementName': 'Compliance Requirement',
                'sectionId': 'Compliance Section',
                'standardName': 'Standards'
            },
            'rule': { 'criteria': 'RQL' },
            'policyCategory': 'Category',
            'policyClass': 'Policy Class',
            'policySubTypes': 'Policy Sub Types',
            'severity': 'Severity',
            'policyType': 'Policy Type',
            'labels': 'Labels',
            'remediable': 'Remediable',
            'policyMode': 'Policy Mode',
            'lastModifiedBy': 'Last Modified By',
            'lastModifiedOn': 'Last Modified On',
            'enabled': 'Status',
            'cloudType': 'Cloud'
        }
        const extras = { 'Instance': config.PrismaCloud[cfgIndex].tag }
        const dataRemapped = TransformJson(response.data, replacements, extras)
        const dataRemappedCP = JSON.parse(JSON.stringify(dataRemapped));
        await getQueryForPolicy(pcfgapi, DataStore, dataRemapped, (data) => {
            TranfsormJsonData(data, KeysArrs)
            data = { data: data, header: { header: headerList }, workSheetName: 'getPolicies', funcName: 'getPolicies' }
            outputWritter.AddDataToAggregator(outputWritter.AggConf, data)
        })
        const headerListSummary = ['Labels', 'Policy Name']
        reportData = ReportBuilder(dataRemappedCP, 'Labels', 'Policy Name')
        SummaryData = ReportBuilderConvert(reportData, 'Labels', 'Policy Name')
        TranfsormJsonData(SummaryData, ['Policy Name'])
        data = { data: SummaryData, header: { header: headerListSummary }, workSheetName: 'labelSummaryGetPoliciesLogs', funcName: 'labelSummaryGetPoliciesLogs' }
        outputWritter.AddDataToAggregator(outputWritter.AggConf, data)
        return { name: 'getPolicies', apiURL: options.url, entries: dataRemapped.length, reason: null }
    } catch (err) {
        console.log('error:', err)
        return { name: 'getPolicies', apiURL: options.url, entries: 0, reason: JSON.stringify(err, null, 4) }
    }
};

const getAlerts = async (pcfgapi, cfgIndex, config, DataStore, outputWritter) => {
    console.log('Getting PrismaCLoud Alerts Information');
    const api = pcfgapi + '/v2/alert';
    const jwt = DataStore.get('x-redlock-auth');
    const options = {
        method: 'GET',
        headers: {
            'x-redlock-auth': jwt,
            accept: 'application/json; charset=UTF-8',
        },
        url: api,
    };
    try {
        await axios(options).then((response) => {
            const headerList = ['Alert ID', 'Policy Name', 'Policy Type', 'Description', 'Policy Labels', 'Policy Severity', 'Resource Name', 'Cloud Type', 'Cloud Account Id', 'Cloud Account Name', 'Region', 'Recommendation', 'Alert Status', 'Alert Time', 'Event Occurred', 'Dismissed On', 'Dismissed By', 'Dismissal Reason', 'Resolved On', 'Resolution Reason', 'Resource ID']
            const KeysArrs = []
            const replacements = {
                'id': 'Alert ID',
                'policy': {
                    'name': 'Policy Name',
                    'policyType': 'Policy Type',
                    'description': 'Description',
                    'severity': 'Policy Severity',
                    'labels': 'Policy Labels'
                },
                'resource': {
                    'name': 'Resource Name',
                    'cloudType': 'Cloud Type',
                    '': 'Cloud Account Id',
                    '': 'Cloud Account Name'
                }
            }
            const extras = { 'Instance': config.PrismaCloud[cfgIndex].tag }
            const dataRemapped = TransformJson(response.data, replacements, extras)
            console.log(JSON.stringify(response.data))
            // const dataRemappedCP = JSON.parse(JSON.stringify(dataRemapped));
            // getQueryForPolicy(pcfgapi, DataStore, dataRemapped, (data) => {
            //     TranfsormJsonData(data, KeysArrs)
            //     data = { data: data, header: { header: headerList }, workSheetName: 'getPolicies', funcName: 'getPolicies' }
            //     outputWritter.AddDataToAggregator(outputWritter.AggConf, data)
            // })
            // const headerListSummary = ['Labels', 'Policy Name']
            // reportData = ReportBuilder(dataRemappedCP, 'Labels', 'Policy Name')
            // SummaryData = ReportBuilderConvert(reportData, 'Labels', 'Policy Name')
            // TranfsormJsonData(SummaryData, ['Policy Name'])
            // data = { data: SummaryData, header: { header: headerListSummary }, workSheetName: 'labelSummaryGetPoliciesLogs', funcName: 'labelSummaryGetPoliciesLogs' }
            // outputWritter.AddDataToAggregator(outputWritter.AggConf, data)
            return { name: 'getAlerts', apiURL: options.url, entries: response.data.length, reason: null }
        });
    } catch (err) {
        console.log('error:', err)
        return { name: 'getAlerts', apiURL: options.url, entries: 0, reason: JSON.stringify(err, null, 4) }
    }
};

const getCompliance = async (pcfgapi, cfgIndex, config, DataStore, outputWritter) => {
        console.log('Getting PrismaCLoud Compliance information');
        const api = pcfgapi + '/compliance';
        const jwt = DataStore.get('x-redlock-auth');
        const options = {
            method: 'GET',
            headers: {
                'x-redlock-auth': jwt,
                accept: 'application/json; charset=UTF-8',
            },
            url: api,
        };
        try {
        const headerList = ['Instance', 'Name', 'Description', 'Cloud', 'Created By', 'Last Modified By', 'Last Modified On', 'Policies Assigned']
        const KeysArrs = ['Cloud']
        const replacements = {
            'description': 'Description',
            'createdBy': 'Created By',
            'lastModifiedBy': 'Last Modified By',
            'lastModifiedOn': 'Last Modified On',
            'policiesAssignedCount': 'Policies Assigned',
            'cloudType': 'Cloud',
            'name': 'Name'
        };
        const extras = { 'Instance': config.PrismaCloud[cfgIndex].tag }
        const response = await axios(options)
        console.log(response)
        const dataRemapped = TransformJson(response.data, replacements, extras)
        TranfsormJsonData(dataRemapped, KeysArrs)
        data = { data: dataRemapped, header: { header: headerList }, workSheetName: 'getCompliance', funcName: 'getCompliance' }
        outputWritter.AddDataToAggregator(outputWritter.AggConf, data)
        return { name: 'getCompliance', apiURL: options.url, entries: dataRemapped.length, reason: null }
    } catch (err) {
        console.log(err)
        return { name: 'getCompliance', apiURL: options.url, entries: 0, reason: JSON.stringify(err, null, 4) }
    }
};

const getPolicyCompliance = async (pcfgapi, cfgIndex, config, DataStore, outputWritter) => {
    const api = pcfgapi + '/policy/compliance';
    const jwt = DataStore.get('x-redlock-auth');
    const options = {
        method: 'GET',
        headers: {
            'x-redlock-auth': jwt,
            accept: 'application/json; charset=UTF-8',
        },
        url: api,
    };
    try {
        const headerList = [
            'Instance',
            'Standard Name',
            'Standard Description',
            'Requirement Id',
            'Rights of the data subject',
            'Section Id',
            'Section Description',
            'Section Label',
        ]
        const replacements = {
            'standardName': 'Standard Name',
            'standardDescription': 'Standard Description',
            'requirementId': 'Requirement Id',
            'requirementName': 'Rights of the data subject',
            'sectionId': 'Section Id',
            'sectionDescription': 'Section Description',
            'sectionLabel': 'Section Label',

        };
        const extras = { 'Instance': config.PrismaCloud[cfgIndex].tag }
        const response = await axios(options)
        console.log('getPolicyCompliance', JSON.stringify(response.data))
        dataArr = TransformObjToArr(response.data)
        const dataRemapped = TransformJson(dataArr, replacements, extras)
        data = { data: dataRemapped, header: { header: headerList }, workSheetName: 'getPolicyCompliance', funcName: 'getPolicyCompliance' }
        outputWritter.AddDataToAggregator(outputWritter.AggConf, data)
        return { name: 'getPolicyCompliance', apiURL: options.url, entries: dataArr.length, reason: null }
    } catch (err) {
        console.log(err)
        return { name: 'getPolicyCompliance', apiURL: options.url, entries: 0, reason: JSON.stringify(err, null, 4) }
    }
};


const getQueryForPolicy = async (pcfgapi, DataStore, data, callback) => {
    try {
        console.log('Getting PrismaCLoud RQL Information');
        for (const element of data) {
            if (element.RQL && element.RQL.match(/.{8}-.{4}-.{4}-.{4}-.{12}/g)) {
                const api = pcfgapi + `/search/history/${element.RQL}`;
                const jwt = DataStore.get('x-redlock-auth');
                const options = {
                    method: 'GET',
                    headers: {
                        'x-redlock-auth': jwt,
                        accept: 'application/json; charset=UTF-8',
                    },
                    url: api,
                };
                response = await axios(options)
                element.RQL = response.data.query
            } else {
                element.RQL = 'N/A'
            }
        }
        callback(data)
    } catch (err) {
        console.log('error:', err)
        throw err
    }
};


module.exports = { init };