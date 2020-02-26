<template>
  <div class="app-container">
    <!-- 查询条件 -->
    <el-form ref="queryParams" :model="queryParams" inline label-width="80px" label-position="left">
      <el-form-item label="角色名">
        <el-input v-model="queryParams.roleName" clearable placeholder="请输入角色名称"/>
      </el-form-item>
      <el-form-item label-width="0px">
        <el-button icon="el-icon-search" type="primary" @click="refresh()">查询</el-button>
        <el-button icon="el-icon-refresh" type="primary" @click="reset()">重置</el-button>
        <el-button icon="el-icon-plus" type="primary" @click="addRole()">添加</el-button>
        <el-button icon="el-icon-delete" type="primary" @click="removeBatch()" :disabled="delBtnDisabled">删除</el-button>
      </el-form-item>
    </el-form>

    <!-- 表格 -->
    <dcy-table
      ref="dcyTable"
      url="admin-center/role/page"
      :columns="columns"
      :query-params="queryParams"
      @table-select-val="selectVal">
      <template slot-scope="{ row, index }" slot="roleStatus">
        <el-tag type="success" v-if="row.roleStatus === '0'">正常</el-tag>
        <el-tag type="error" v-if="row.roleStatus === '1'">禁用</el-tag>
      </template>
      <template slot-scope="{ row, index }" slot="roleKey">
        {{row.roleKey.substring(5)}}
      </template>
      <template slot-scope="{ row }" slot="action">
        <el-button @click="update(row)" type="text">修改</el-button>
        <el-button @click="remove(row)" type="text">删除</el-button>
        <el-button @click="authPower(row)" type="text">授权</el-button>
      </template>
    </dcy-table>

    <!-- 添加表单 -->
    <el-dialog
      :label="dialogTitle"
      :visible.sync="dialogShow"
      append-to-body
      :modal-append-to-body="false"
      :close-on-click-modal="false"
      @close="handleReset('form')">
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="名称" prop="roleName">
          <el-input v-model="form.roleName" placeholder="请输入角色名称"/>
        </el-form-item>
        <el-form-item label="权限字符" prop="roleKey">
          <el-input v-model="form.roleKey" placeholder="请输入角色权限字符串"/>
        </el-form-item>
        <el-form-item label="状态" prop="roleStatus">
          <el-select v-model="form.roleStatus" placeholder="请输入角色状态" style="width: 100%">
            <template v-for="item in statusOptionList">
              <el-option :value="item.dictValue" :label="item.dictLable"/>
            </template>
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" placeholder="请输入备注"/>
        </el-form-item>
      </el-form>
      <!-- 自定义按钮组 -->
      <div slot="footer" class="dialog-footer">
        <el-button @click="handleReset('form')">取 消</el-button>
        <el-button type="primary" @click="handleSubmit('form')">确 定</el-button>
      </div>
    </el-dialog>


    <el-dialog
      title="授权"
      width="600"
      :visible.sync="dialogAuthPowerShow"
      append-to-body
      :modal-append-to-body="false"
      :close-on-click-modal="false">
      <el-transfer
        v-if="dialogAuthPowerShow"
        filterable
        :filter-method="filterMethod"
        :render-content="render"
        v-model="targetKeys"
        :titles="['权限列表','已授权列表']"
        :data="powerList">
      </el-transfer>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelAuthPowerDialog()">取 消</el-button>
        <el-button type="primary" @click="saveAuthPower()">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import DcyTable from '@/components/dcy/dcy-table'
  import { addRole, deleteBatchRoleById, deleteRoleById, updateRole } from '@/api/admin/role'
  import { MessageError, MessageSuccess, ConfirmCustom } from '@/libs/message'
  import { getDictByType } from '../../api/common'
  import { getPowerAllList } from '../../api/admin/power'
  import { getAuthPowerListByRoleId, saveAuthPower } from '../../api/admin/role'

  export default {
    name: 'role-manage',
    components: { DcyTable },
    data() {
      return {
        columns: [
          { label: '名称', prop: 'roleName' },
          { label: '权限字符', slot: 'roleKey' },
          { label: '状态', slot: 'roleStatus' },
          { label: '备注', prop: 'remark' },
          { label: '操作', slot: 'action' }
        ],
        queryParams: {},
        dialogShow: false,
        delBtnDisabled: true,
        dialogTitle: '添加角色',
        form: {},
        ids:[],
        rules: {
          roleName: [this.$ruler('角色名称')],
          roleKey: [this.$ruler('角色权限字符串'), {pattern: /^[A-Z_]{3,10}$/, message: '请输入大写字母或者下划线并且3-10个字符'}],
          roleStatus: [this.$ruler('角色状态')]
        },
        roleId: null,
        dialogAuthPowerShow: false,
        powerList: [],
        targetKeys: [],
        statusOptionList:[],
      }
    },
    methods: {
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
      addRole() {
        this.form = {}
        this.dialogTitle = '添加角色'
        this.dialogShow = true
      },
      /**
       * 修改弹出框
       * @param row
       */
      update(row) {
        this.form = { ...row }
        this.form.roleKey = this.form.roleKey.substring(5);
        this.dialogTitle = '修改角色'
        this.dialogShow = true
      },
      /**
       * 点击每一行的checkbox
       */
      selectVal(ids) {
        this.ids = ids.map(val => val['roleId'])
        this.delBtnDisabled = !this.ids.length
      },
      /**
       * 批量删除
       */
      removeBatch() {
        ConfirmCustom({ type: 'warning' }).then(() => {
          deleteBatchRoleById(this.ids).then(res => {
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
          deleteRoleById(row.roleId).then(res => {
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
            this.form.roleKey = 'ROLE_' + this.form.roleKey;
            if (this.dialogTitle === '添加角色') {
              addRole(this.form).then(res => {
                if (res.data) {
                  MessageSuccess('add')
                } else {
                  MessageError('add')
                }
                this.cancelDialogAndRefresh()
              })
            } else {
              updateRole(this.form).then(res => {
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
      authPower(row) {
        this.roleId = row.roleId;
        getPowerAllList().then(res => {
          if (res.success) {
            let powerList = [];
            res.data.forEach(e => {
              let powTypeName = null;
              switch (e.powType) {
                case '0':
                  powTypeName = '模块权限';
                  break;
                case '1':
                  powTypeName = '菜单权限';
                  break;
              }
              let power = {
                key: e.powId,
                label: e.powName,
                powTypeName: powTypeName,
                disabled: e.powStatus === '1'
              };
              powerList.push(power);
            });
            this.powerList = powerList;
          }
        });
        getAuthPowerListByRoleId(this.roleId).then(res => {
          this.targetKeys = res.data.map(e => e.powId);
        });
        this.dialogAuthPowerShow = true;
      },
      cancelAuthPowerDialog() {
        this.dialogAuthPowerShow = false;
      },
      filterMethod(query, item) {
        return item.label.indexOf(query) > -1
      },
      render(h, option) {
        console.log(option)
        // return option.label + ':' + option.powTypeName;
        return <span>{ option.label }:{ option.powTypeName }</span>;
      },
      saveAuthPower() {
        let rolePowerDTO = {
          roleId: this.roleId,
          powerIds: this.targetKeys
        };
        saveAuthPower(rolePowerDTO).then(res => {
          if (res.data) {
            MessageSuccess('save')
          } else {
            MessageError('save')
          }
          this.cancelAuthPowerDialog()
          // 刷新表格
          this.refresh()
        })
      }
    },
    mounted() {
      getDictByType('status').then(res=>{
        this.statusOptionList = res.data;
      })
    }
  }
</script>

<style scoped lang="scss">

</style>
