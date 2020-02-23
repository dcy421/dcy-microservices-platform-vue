import axios from '@/libs/api.request'

/**
 * 根据流程定义id 操作挂起激活 true 挂起， false 未挂起
 * @param processDefinedId
 * @returns {ClientHttp2Stream | * | AxiosPromise<any> | ClientRequest | void}
 */
export const hangChange = (processDefinedId) => {
  return axios.request({
    url: `/workflow-center/process/hangChange/${processDefinedId}`,
  })
}

/**
 * 删除流程定义
 * @param deploymentId
 * @returns {AxiosPromise}
 */
export const deleteProcessByDeploymentId = (deploymentId) => {
  return axios.request({
    url: `/workflow-center/delete/${deploymentId}`,
    method: 'delete',
  })
}


