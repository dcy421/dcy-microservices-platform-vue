import axios from '@/libs/api.request'

/**
 * 部署模型
 * @param config
 * @returns {ClientHttp2Stream | * | AxiosPromise<any> | ClientRequest | void}
 */
export const deployModel = (modelId) => {
  return axios.request({
    url: `/workflow-center/models/deploy/${modelId}`,
  })
}

/**
 * 删除模型
 * @param modelId
 * @returns {AxiosPromise}
 */
export const deleteModelById = (modelId) => {
  return axios.request({
    url: `/workflow-center/models/${modelId}`,
    method: 'delete',
  })
}
