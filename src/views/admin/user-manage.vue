<template>
  <div class="app-container">
    <!-- 查询条件 -->
    <el-form ref="queryParams" :model="queryParams" inline label-width="80px" label-position="left">
      <el-form-item label="用户名">
        <el-input type="text" v-model="queryParams.username" clearable placeholder="请输入用户名"/>
      </el-form-item>
      <el-form-item label-width="0px">
        <el-button icon="el-icon-search" type="primary" @click="refresh()">查询</el-button>
        <el-button icon="el-icon-refresh" type="primary" @click="reset()">重置</el-button>
        <el-button icon="el-icon-plus" type="primary" @click="addUser()">添加</el-button>
        <el-button icon="el-icon-delete" type="primary" @click="removeBatch()" :disabled="delBtnDisabled">删除</el-button>
      </el-form-item>
    </el-form>

    <!-- 表格 -->
    <dcy-table
      ref="dcyTable"
      url="admin-center/user/page"
      :columns="columns"
      :query-params="queryParams"
      @table-select-val="selectVal"
    >
      <template slot-scope="{ row }" slot="sex">
        <el-tag type="success" v-if="row.sex === '0'">男</el-tag>
        <el-tag type="info" v-if="row.sex === '1'">女</el-tag>
      </template>
      <template slot-scope="{ row }" slot="userStatus">
        <el-tag type="success" v-if="row.userStatus === '0'">正常</el-tag>
        <el-tag type="error" v-if="row.userStatus === '1'">禁用</el-tag>
      </template>
      <template slot-scope="{ row }" slot="action">
        <el-button @click="update(row)" type="text">修改</el-button>
        <el-button @click="remove(row)" type="text">删除</el-button>
        <el-button @click="resetPassword(row)" type="text">重置密码</el-button>
        <el-button @click="authRole(row)" type="text">授权角色</el-button>
        <el-button @click="authGroup(row)" type="text">授权用户组</el-button>
      </template>
    </dcy-table>

    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogShow"
      append-to-body
      :modal-append-to-body="false"
      :close-on-click-modal="false"
      @close="handleReset('form')">
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="头像" prop="headPort">
          <dcy-avatar-upload
            action="/dev-api/file/upload"
            @success="uploadSuccess">
          </dcy-avatar-upload>
        </el-form-item>
        <el-form-item label="文件列表" prop="headPort">
          <dcy-file-upload
            action="/dev-api/file/upload"
            @success="uploadFileSuccess"
            multiple
            :file-list=" [{name: '壁纸六.png', url: 'http://192.168.189.183:8888/group1/M00/00/00/wKi9t134ZeWAXIkMAADU7JD7jqo062.png'},
            {name: '壁纸七.jpg', url: 'http://192.168.189.183:8888/group1/M00/00/00/wKi9t134SI2AJhLZABTlVmUrO4A332.jpg'}]"
          >
            <div class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
          </dcy-file-upload>
        </el-form-item>
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名"/>
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="dialogTitle === '添加用户'">
          <el-input v-model="form.password" placeholder="请输入密码" show-password @input="change($event)"/>
        </el-form-item>
        <el-form-item label="确认密码" prop="passwordCheck" v-if="dialogTitle === '添加用户'">
          <el-input v-model="form.passwordCheck" placeholder="请输入确认密码" show-password @input="change($event)"/>
        </el-form-item>
        <el-form-item label="昵称" prop="nickName">
          <el-input v-model="form.nickName" placeholder="请输入昵称"/>
        </el-form-item>
        <el-form-item label="性别" prop="sex">
          <el-select v-model="form.sex" placeholder="请选择性别" style="width: 100%">
            <template v-for="item in sexOptionList">
              <el-option :value="item.dictValue" :label="item.dictLable"/>
            </template>
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="userStatus">
          <el-select v-model="form.userStatus" placeholder="请选择状态" style="width: 100%">
            <template v-for="item in statusOptionList">
              <el-option :value="item.dictValue" :label="item.dictLable"/>
            </template>
          </el-select>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱"/>
        </el-form-item>
        <el-form-item label="手机号" prop="phoneNumber">
          <el-input v-model="form.phoneNumber" placeholder="请输入手机号"/>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入备注"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="handleReset('form')">取 消</el-button>
        <el-button type="primary" @click="handleSubmit('form')">确 定</el-button>
      </div>
    </el-dialog>


    <el-dialog
      title="授权角色"
      :visible.sync="dialogAuthRoleShow"
      append-to-body
      :modal-append-to-body="false"
      :close-on-click-modal="false">
      <el-transfer
        v-if="dialogAuthRoleShow"
        filterable
        :filter-method="filterMethod"
        v-model="targetKeys"
        :titles="['角色列表','已授权角色']"
        :data="roleList">
      </el-transfer>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelAuthRoleDialog()">取 消</el-button>
        <el-button type="primary" @click="saveAuthRole()">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog
      title="授权用户组"
      :visible.sync="dialogAuthGroupShow"
      append-to-body
      :modal-append-to-body="false"
      :close-on-click-modal="false">
      <el-transfer
        v-if="dialogAuthGroupShow"
        filterable
        :filter-method="filterMethod"
        v-model="targetGroupKeys"
        :titles="['用户组列表','已授权用户组']"
        :data="groupList">
      </el-transfer>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelAuthGroupDialog()">取 消</el-button>
        <el-button type="primary" @click="saveAuthGroup()">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import DcyTable from '../../components/dcy/dcy-table'
  import {
    addUserInfo,
    deleteBatchUserInfoById,
    deleteUserInfoById, getAuthGroupListByUserId, getAuthRoleListByUserId,
    getUserInfoByUsername, resetPassword, saveAuthGroup, saveAuthRole,
    updateUserInfo
  } from '../../api/admin/user'
  import { getDictByType } from '../../api/common'
  import { MessageError, MessageSuccess, ConfirmCustom } from '../../libs/message'
  import { getRoleAllList } from '../../api/admin/role'
  import { getGroupAllList } from '../../api/admin/group'
  import DcyFileUpload from '../../components/dcy/dcy-file-upload'
  import DcyAvatarUpload from '../../components/dcy/dcy-avatar-upload'

  export default {
    name: 'user-manage',
    components: { DcyAvatarUpload, DcyFileUpload, DcyTable },
    data() {
      const validateUsernameCount = (rule, value, callback) => {
        if (value !== '') {
          getUserInfoByUsername(this.form.username).then(res => {
            if (res.data !== null) {
              if (this.form.userId === res.data.userId) {
                callback()
              } else {
                callback(new Error('用户名重复，请重新输入'))
              }
            } else {
              callback()
            }
          })
        } else {
          callback()
        }
      }
      const validatePassCheck = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请输入确认密码'))
        } else if (value !== this.form.password) {
          callback(new Error('两次密码不一致，请重新输入'))
        } else {
          callback()
        }
      }
      return {
        columns: [
          { label: '用户名', prop: 'username', sortable: 'custom' },
          { label: '昵称', prop: 'nickName' },
          { label: '邮箱', prop: 'email' },
          { label: '手机号码', prop: 'phoneNumber' },
          { label: '性别', slot: 'sex' },
          { label: '状态', slot: 'userStatus' },
          { label: '操作', slot: 'action', width: 400 }
        ],
        queryParams: {},
        dialogShow: false,
        dialogAuthRoleShow: false,
        dialogAuthGroupShow: false,
        delBtnDisabled: true,
        dialogTitle: '添加用户',
        form: {},
        ids:[],
        rules: {
          username: [
            this.$ruler('用户名'),
            { type: 'string', max: 16, min: 6, message: '请输入6-16个字符', trigger: 'blur' },
            { validator: validateUsernameCount, trigger: 'blur' }
          ],
          password: [
            this.$ruler('密码'),
            { type: 'string', max: 16, min: 6, message: '请输入6-16个字符', trigger: 'blur' }
          ],
          passwordCheck: [
            this.$ruler('确认密码'),
            { validator: validatePassCheck, trigger: 'blur' }
          ],
          nickName: [
            this.$ruler('昵称')
          ],
          sex: [
            this.$ruler('性别', 'change')
          ],
          userStatus: [
            this.$ruler('状态', 'change')
          ],
          phoneNumber: [
            this.$ruler('手机号')
          ]
        },
        sexOptionList: [],
        statusOptionList: [],
        // 授权角色使用
        userId: null,
        roleList: [],
        targetKeys: [],
        // 授权用户组
        groupList: [],
        targetGroupKeys: []
      }
    },
    methods: {
      change(e) {
        this.$forceUpdate()
      },
      /**
       * 刷新
       */
      refresh() {
        this.$refs.dcyTable.refresh()
      },
      /**
       * 重置搜索条件
       */
      reset() {
        this.queryParams = {}
      },
      /**
       * 添加弹出框
       */
      addUser() {
        this.form = {}
        this.form.userType = 1
        this.dialogTitle = '添加用户'
        this.dialogShow = true
      },
      /**
       * 修改弹出框
       * @param row
       */
      update(row) {
        this.form = { ...row }
        this.dialogTitle = '修改用户'
        this.dialogShow = true
      },
      /**
       * 点击每一行的checkbox
       */
      selectVal(ids) {
        this.ids = ids.map(val => val['userId'])
        this.delBtnDisabled = !this.ids.length
      },
      /**
       * 批量删除
       */
      removeBatch() {
        ConfirmCustom({ type: 'warning' }).then(() => {
          deleteBatchUserInfoById(this.ids).then(res => {
            if (res.data) {
              MessageSuccess('del')
            } else {
              MessageError('del')
            }
            this.refresh()
          })
        })
      },
      /**
       * 行内删除
       * @param row
       */
      remove(row) {
        ConfirmCustom({ type: 'warning' }).then(() => {
          deleteUserInfoById(row.userId).then(res => {
            if (res.data) {
              MessageSuccess('del')
            } else {
              MessageError('del')
            }
            // 刷新表格
            this.refresh()
          })
        })
      },
      /**
       * 重置密码
       * @param row
       */
      resetPassword(row) {
        ConfirmCustom({ type: 'warning' }, '确定重置密码123456吗?').then(() => {
          row.password = '123456'
          resetPassword(row).then(res => {
            if (res.data) {
              MessageSuccess('upd')
            } else {
              MessageError('upd')
            }
            // 刷新表格
            this.refresh()
          })
        })
      },
      /**
       * 重置表单
       * @param name
       */
      handleReset(name) {
        this.dialogShow = false
        this.$refs[name].resetFields()
      },
      /**
       * 提交表单
       * @param name
       */
      handleSubmit(name) {
        this.$refs[name].validate((valid) => {
          if (valid) {
            if (this.dialogTitle === '添加用户') {
              addUserInfo(this.form).then(res => {
                if (res.data) {
                  MessageSuccess('add')
                } else {
                  MessageError('add')
                }
                this.cancelDialogAndRefresh()
              })
            } else {
              updateUserInfo(this.form).then(res => {
                if (res.data) {
                  MessageSuccess('upd')
                } else {
                  MessageError('upd')
                }
                this.cancelDialogAndRefresh()
              })
            }
          }
        })
      },
      /**
       * 关闭弹出框 和 刷新表格
       */
      cancelDialogAndRefresh() {
        // 清空表单
        this.handleReset('form')
        // 刷新表格
        this.refresh()
      },
      /**
       * 关闭授权角色弹出框
       */
      cancelAuthRoleDialog() {
        this.dialogAuthRoleShow = false
      },
      cancelAuthGroupDialog() {
        this.dialogAuthGroupShow = false
      },
      filterMethod(query, item) {
        return item.label.indexOf(query) > -1
      },
      /**
       * 授权角色
       * @param row
       */
      authRole(row) {
        this.userId = row.userId
        getRoleAllList().then(res => {
          if (res.success) {
            let roleList = []
            res.data.forEach(e => {
              let role = {
                key: e.roleId,
                label: e.roleName,
                disabled: e.roleStatus === '1'
              }
              roleList.push(role)
            })
            this.roleList = roleList
          }
        })
        getAuthRoleListByUserId(this.userId).then(res => {
          this.targetKeys = res.data.map(e => e.roleId)
        })
        this.dialogAuthRoleShow = true
      },
      /**
       * 授权用户组
       * @param row
       */
      authGroup(row) {
        this.userId = row.userId;
        getGroupAllList().then(res => {
          if (res.success) {
            let groupList = [];
            res.data.forEach(e => {
              let group = {
                key: e.userGroupId,
                label: e.userGroupName
              };
              groupList.push(group);
            });
            this.groupList = groupList;
          }
        });
        getAuthGroupListByUserId(this.userId).then(res => {
          this.targetGroupKeys = res.data.map(e => e.userGroupId);
        })
        this.dialogAuthGroupShow = true;
      },
      /**
       * 保存授权角色
       */
      saveAuthRole() {
        let userInfoRoleDTO = {
          userId: this.userId,
          roleIds: this.targetKeys
        }
        saveAuthRole(userInfoRoleDTO).then(res => {
          if (res.data) {
            MessageSuccess('save')
          } else {
            MessageError('save')
          }
          this.cancelAuthRoleDialog()
          // 刷新表格
          this.refresh()
        })
      },
      /**
       * 保存授权用户组
       */
      saveAuthGroup() {
        let userInfoGroupDTO = {
          userId: this.userId,
          userGroupIds: this.targetGroupKeys
        }
        saveAuthGroup(userInfoGroupDTO).then(res => {
          if (res.data) {
            MessageSuccess('save')
          } else {
            MessageError('save')
          }
          this.cancelAuthGroupDialog()
          // 刷新表格
          this.refresh()
        })
      },
      uploadSuccess(data) {
        console.log(data);
      },
      uploadFileSuccess(fileList) {
        console.log(fileList);
      }
    },
    mounted() {
      getDictByType('sex').then(res => {
        this.sexOptionList = res.data
      })
      getDictByType('status').then(res => {
        this.statusOptionList = res.data
      })
    }
  }
</script>

<style scoped lang="scss">

</style>
