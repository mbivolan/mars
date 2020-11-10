const { model_VM_GCP,GCP_VM_DATA } = require('./gcp')

const toDateTime = (secs) => {
  // 1970, 0, 1 -> epoch
  return new Date(1970, 0, 1).setSeconds(parseInt(secs))
}

const getStructureOfModel = (model = null, dataObject = null) => {
  if (model === null || dataObject === null) return null
  switch (model.getTableName()) {
      case 'gcp_vm_data':
        return new model(model_VM_GCP(dataObject.asset))
  
      default:
          break;
  }
}


const modelChecker = (resourceType = null) => {
  if (resourceType === null) return null
  if (resourceType === 'google.compute.Instance') return GCP_VM_DATA
}

module.exports = { getStructureOfModel,modelChecker }
