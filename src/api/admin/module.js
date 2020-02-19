import axios from '@/libs/api.request'

/**
 * 添加模块
 * @param module
 * @returns {ClientHttp2Stream | * | AxiosPromise<any> | ClientRequest | void}
 */
export const addModule = (module) => {
  return axios.request({
    url: '/admin-center/module/save',
    method: 'post',
    data: module
  })
}

/**
 * 修改模块
 * @param module
 * @returns {ClientHttp2Stream | * | AxiosPromise<any> | ClientRequest | void}
 */
export const updateModule = (module) => {
  return axios.request({
    url: '/admin-center/module/update',
    method: 'post',
    data: module
  })
}

/**
 * 删除模块
 * @param moduleId
 * @returns {ClientHttp2Stream | * | AxiosPromise<any> | ClientRequest | void}
 */
export const deleteModuleById = (moduleId) => {
  return axios.request({
    url: '/admin-center/module/delete',
    method: 'post',
    params: {
      id: moduleId
    }
  })
}

/**
 * 批量删除模块
 * @param moduleIds
 * @returns {ClientHttp2Stream | * | AxiosPromise<any> | ClientRequest | void}
 */
export const deleteBatchModuleById = (moduleIds) => {
  return axios.request({
    url: '/admin-center/module/deleteBatch',
    method: 'post',
    data: moduleIds
  })
}

/**
 * 获取模块tree-table数据
 * @returns {*|AxiosPromise<any>|ClientRequest|void|ClientHttp2Stream}
 */
export const getModuleTreeTableList = () => {
  return axios.request({
    url: '/admin-center/module/getModuleTreeTableList'
  })
}

/**
 * 获取tree列表数据
 * @returns {*|AxiosPromise<any>|ClientRequest|void|ClientHttp2Stream}
 */
export const getModuleTreeList = (powerId) => {
  return axios.request({
    url: '/admin-center/module/getModuleTreeListByPowerId',
    params: {
      powerId: powerId
    }
  })
}
