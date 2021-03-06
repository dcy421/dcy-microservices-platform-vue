<template>
  <div class="app-container">
    <!-- 查询条件 -->
    <el-form ref="queryParams" :model="queryParams" inline label-width="80px" label-position="left">
      <el-form-item label="参数名称">
        <el-input v-model="queryParams.configName" clearable placeholder="请输入参数名称"/>
      </el-form-item>
      <el-form-item label-width="0px">
        <el-button icon="el-icon-search" type="primary" @click="refresh()">查询</el-button>
        <el-button icon="el-icon-refresh" type="primary" @click="reset()">重置</el-button>
        <el-button icon="el-icon-plus" type="primary" @click="addConfig()">添加</el-button>
        <el-button icon="el-icon-delete" type="primary" @click="removeBatch()" :disabled="delBtnDisabled">删除</el-button>
      </el-form-item>
    </el-form>

    <!-- 表格 -->
    <dcy-table
      ref="dcyTable"
      url="admin-center/config/page"
      :columns="columns"
      :query-params="queryParams"
      @table-select-val="selectVal">
      <template slot-scope="{ row }" slot="action">
        <el-button @click="update(row)" type="text">修改</el-button>
        <el-button @click="remove(row)" type="text">删除</el-button>
      </template>
    </dcy-table>

    <!-- 添加表单 -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogShow"
      append-to-body
      :modal-append-to-body="false"
      :close-on-click-modal="false"
      @close="handleReset('form')">
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="参数名称" prop="configName">
          <el-input v-model="form.configName" placeholder="请输入参数名称"/>
        </el-form-item>
        <el-form-item label="参数键名" prop="configKey">
          <el-input v-model="form.configKey" placeholder="请输入参数键名"/>
        </el-form-item>
        <el-form-item label="参数键值" prop="configValue">
          <el-input v-model="form.configValue" placeholder="请输入参数键值"/>
        </el-form-item>
        <el-form-item label="系统内置" prop="configType">
          <el-input v-model="form.configType" placeholder="请输入系统内置"/>
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
  </div>
</template>

<script>
  import DcyTable from '_c/dcy/dcy-table'
  import { addConfig, deleteBatchConfigById, deleteConfigById, updateConfig } from '@/api/admin/config'
  import { MessageError, MessageSuccess, ConfirmCustom } from '@/libs/message'

  export default {
    name: 'config-manage',
    components: { DcyTable },
    data() {
      return {
        columns: [
          { label: '参数名称', prop: 'configName' },
          { label: '参数键名', prop: 'configKey' },
          { label: '参数键值', prop: 'configValue' },
          { label: '系统内置', prop: 'configType' },
          { label: '备注', prop: 'remark' },
          { label: '操作', slot: 'action' }
        ],
        queryParams: {},
        dialogShow: false,
        delBtnDisabled: true,
        dialogTitle: '添加配置',
        form: {},
        rules: {
          configName: [this.$ruler('参数名称')],
          configKey: [this.$ruler('参数键名')],
          configValue: [this.$ruler('参数键值')],
          configType: [this.$ruler('系统内置')],
          remark: [this.$ruler('备注')]
        }
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
      addConfig() {
        this.form = {}
        this.dialogTitle = '添加配置'
        this.dialogShow = true
      },
      /**
       * 修改弹出框
       * @param row
       */
      update(row) {
        this.form = { ...row }
        this.dialogTitle = '修改配置'
        this.dialogShow = true
      },
      /**
       * 点击每一行的checkbox
       */
      selectVal(ids) {
        this.ids = ids.map(val => val['configId'])
        this.delBtnDisabled = !this.ids.length
      },
      /**
       * 批量删除
       */
      removeBatch() {
        ConfirmCustom({ type: 'warning' }).then(() => {
          deleteBatchConfigById(this.ids).then(res => {
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
          deleteConfigById(row.configId).then(res => {
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
            if (this.dialogTitle === '添加配置') {
              addConfig(this.form).then(res => {
                if (res.data) {
                  MessageSuccess('add')
                } else {
                  MessageError('add')
                }
                this.cancelDialogAndRefresh()
              })
            } else {
              updateConfig(this.form).then(res => {
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
      }
    },
    mounted() {

    }
  }
</script>

<style scoped lang="scss">

</style>
