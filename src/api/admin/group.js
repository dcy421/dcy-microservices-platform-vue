import axios from '@/libs/api.request'

/**
 * 添加用户组
 * @param group
 * @returns {ClientHttp2Stream | * | AxiosPromise<any> | ClientRequest | void}
 */
export const addGroup = (group) => {
  return axios.request({
    url: '/admin-center/group/save',
    method: 'post',
    data: group
  })
}

/**
 * 修改用户组
 * @param group
 * @returns {ClientHttp2Stream | * | AxiosPromise<any> | ClientRequest | void}
 */
export const updateGroup = (group) => {
  return axios.request({
    url: '/admin-center/group/update',
    method: 'post',
    data: group
  })
}

/**
 * 删除用户组
 * @param groupId
 * @returns {ClientHttp2Stream | * | AxiosPromise<any> | ClientRequest | void}
 */
export const deleteGroupById = (groupId) => {
  return axios.request({
    url: '/admin-center/group/delete',
    method: 'post',
    params: {
      id: groupId
    }
  })
}

/**
 * 批量删除用户组
 * @param groupIds
 * @returns {ClientHttp2Stream | * | AxiosPromise<any> | ClientRequest | void}
 */
export const deleteBatchGroupById = (groupIds) => {
  return axios.request({
    url: '/admin-center/group/deleteBatch',
    method: 'post',
    data: groupIds
  })
};

/**
 * 获取所有用户组组
 * @returns {*|AxiosPromise<any>|ClientRequest|void|ClientHttp2Stream}
 */
export const getGroupAllList = () => {
  return axios.request({
    url: '/admin-center/group/all'
  })
};

/**
 *根据用户组组id查询已授权的角色列表
 * @param userGroupId
 * @returns {*|AxiosPromise<any>|ClientRequest|void|ClientHttp2Stream}
 */
export const getAuthRoleListByUserGroupId = (userGroupId) => {
  return axios.request({
    url: '/admin-center/group/getAuthRoleListByUserGroupId',
    params: {
      userGroupId: userGroupId
    }
  })
};


/**
 * 保存授权角色
 * @param userGroupRoleDTO
 * @returns {*|AxiosPromise<any>|ClientRequest|void|ClientHttp2Stream}
 */
export const saveAuthGroupRole = (userGroupRoleDTO) => {
  return axios.request({
    url: '/admin-center/group/saveAuthRole',
    method: 'post',
    data: userGroupRoleDTO
  })
};
