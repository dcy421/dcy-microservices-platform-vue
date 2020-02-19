<template>
  <div class="app-container">
    <!-- 查询条件 -->
    <el-form ref="queryParams" :model="queryParams" inline label-width="80px" label-position="left">
      <el-form-item label="用户组">
        <el-input v-model="queryParams.userGroupName" clearable placeholder="请输入用户组"/>
      </el-form-item>
      <el-form-item label-width="0px">
        <el-button icon="el-icon-search" type="primary" @click="refresh()">查询</el-button>
        <el-button icon="el-icon-refresh" type="primary" @click="reset()">重置</el-button>
        <el-button icon="el-icon-plus" type="primary" @click="addGroup()">添加</el-button>
        <el-button icon="el-icon-delete" type="primary" @click="removeBatch()" :disabled="delBtnDisabled">删除</el-button>
      </el-form-item>
    </el-form>

    <!-- 表格 -->
    <dcy-table
      ref="dcyTable"
      url="admin-center/group/page"
      :columns="columns"
      :query-params="queryParams"
      @table-select-val="selectVal">
      <template slot-scope="{ row }" slot="action">
        <el-button @click="update(row)" type="text">修改</el-button>
        <el-button @click="remove(row)" type="text">删除</el-button>
        <el-button @click="authRole(row)" type="text">授权角色</el-button>
      </template>
    </dcy-table>

    <!-- 添加表单 -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogShow"
      :close-on-click-modal="false"
      @close="handleReset('form')">
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="用户组" prop="userGroupName">
          <el-input v-model="form.userGroupName" placeholder="请输入用户组名" @input="change($event)"/>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" placeholder="请输入备注" @input="change($event)"/>
        </el-form-item>
      </el-form>
      <!-- 自定义按钮组 -->
      <div slot="footer" class="dialog-footer">
        <el-button @click="handleReset('form')">取 消</el-button>
        <el-button type="primary" @click="handleSubmit('form')">确 定</el-button>
      </div>
    </el-dialog>



    <el-dialog
      title="授权角色"
      :visible.sync="dialogAuthRoleShow"
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


  </div>
</template>

<script>
  import DcyTable from '@/components/dcy/dcy-table'
  import { addGroup, deleteBatchGroupById, deleteGroupById, updateGroup } from '@/api/admin/group'
  import { MessageError, MessageSuccess, ConfirmCustom } from '@/libs/message'
  import { getAuthRoleListByUserGroupId, saveAuthGroupRole } from '../../api/admin/group'
  import { getRoleAllList } from '../../api/admin/role'

  export default {
    name: 'group-manage',
    components: { DcyTable },
    data() {
      return {
        columns: [
          { label: '用户组', prop: 'userGroupName' },
          { label: '备注', prop: 'remark' },
          { label: '操作', slot: 'action' }
        ],
        queryParams: {},
        dialogShow: false,
        dialogAuthRoleShow: false,
        delBtnDisabled: true,
        dialogTitle: '添加用户组',
        form: {},
        rules: {
          userGroupName: [this.$ruler('用户组名')]
        },
        // 授权角色使用
        userId: null,
        roleList: [],
        targetKeys: [],
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
      addGroup() {
        this.form = {}
        this.dialogTitle = '添加用户组'
        this.dialogShow = true
      },
      /**
       * 修改弹出框
       * @param row
       */
      update(row) {
        this.form = { ...row }
        this.dialogTitle = '修改用户组'
        this.dialogShow = true
      },
      /**
       * 点击每一行的checkbox
       */
      selectVal(ids) {
        this.ids = ids.map(val => val['userGroupId'])
        this.delBtnDisabled = !this.ids.length
      },
      /**
       * 批量删除
       */
      removeBatch() {
        ConfirmCustom({ type: 'warning' }).then(() => {
          deleteBatchGroupById(this.ids).then(res => {
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
          deleteGroupById(row.userGroupId).then(res => {
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
            if (this.dialogTitle === '添加用户组') {
              addGroup(this.form).then(res => {
                if (res.data) {
                  MessageSuccess('add')
                } else {
                  MessageError('add')
                }
                this.cancelDialogAndRefresh()
              })
            } else {
              updateGroup(this.form).then(res => {
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
       * 授权角色
       * @param row
       */
      authRole(row) {
        this.userGroupId = row.userGroupId;
        this.dialogAuthRoleShow = true;
        getRoleAllList().then(res => {
          if (res.success) {
            let roleList = [];
            res.data.forEach(e => {
              let role = {
                key: e.roleId,
                label: e.roleName,
                disabled: e.roleStatus === '1'
              };
              roleList.push(role);
            });
            this.roleList = roleList;
          }
        });
        getAuthRoleListByUserGroupId(this.userGroupId).then(res => {
          this.targetKeys = res.data.map(e => e.roleId);
        })
      },
      filterMethod(query, item) {
        return item.label.indexOf(query) > -1
      },
      cancelAuthRoleDialog() {
        this.dialogAuthRoleShow = false
      },
      /**
       * 保存授权角色
       */
      saveAuthRole() {
        let userGroupRoleDTO = {
          userGroupId: this.userGroupId,
          roleIds: this.targetKeys
        };
        saveAuthGroupRole(userGroupRoleDTO).then(res => {
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
    },
    mounted() {

    }
  }
</script>

<style scoped lang="scss">

</style>
