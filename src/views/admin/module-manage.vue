<template>
  <div class="app-container">

    <!-- 表格 -->
    <dcy-table
      ref="dcyTable"
      url="admin-center/module/getModuleTreeTableList"
      row-key="moduleId"
      :page-ing-type="false"
      default-expand-all
      :check-box="false"
      :columns="columns">
      <template slot="type" slot-scope="{row}">
        <el-tag type="primary" v-if="row.type === '0'">模块</el-tag>
        <el-tag type="warning" v-if="row.type === '1'">操作</el-tag>
      </template>
      <template slot="httpMethod" slot-scope="{row}">
        <el-tag type="primary" v-if="row.httpMethod === 'GET'">GET</el-tag>
        <el-tag type="warning" v-if="row.httpMethod === 'POST'">POST</el-tag>
      </template>
      <template slot="moduleStatus" slot-scope="{row}">
        <el-tag type="success" v-if="row.moduleStatus === '0'">正常</el-tag>
        <el-tag type="error" v-if="row.moduleStatus === '1'">禁用</el-tag>
      </template>
      <template slot-scope="{ row }" slot="action">
        <el-button @click="addModule(row)" type="text">添加</el-button>
        <el-button @click="update(row)" type="text">修改</el-button>
        <el-button @click="remove(row)" v-if="row.children.length === 0" type="text">删除</el-button>
      </template>
    </dcy-table>

    <!-- 添加表单 -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogShow"
      :close-on-click-modal="false"
      append-to-body
      :modal-append-to-body="false"
      @close="handleReset('form')">
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="父级名称" v-if="dialogTitle === '添加模块'">
          <el-input disabled v-model="form.parentName" placeholder="请输入模块名称"/>
        </el-form-item>

        <el-form-item label="名称" prop="moduleName">
          <el-input v-model="form.moduleName" placeholder="请输入模块名称"/>
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select v-model="form.type" placeholder="请输入类型" style="width: 100%">
            <template v-for="item in moduleTypeOptionList">
              <el-option :value="item.dictValue" :label="item.dictLable"/>
            </template>
          </el-select>
        </el-form-item>
        <el-form-item label="地址" prop="modulePath" v-if="form.type === '1'">
          <el-input v-model="form.modulePath" placeholder="请输入地址"/>
        </el-form-item>

        <el-form-item label="请求方式" prop="httpMethod" v-if="form.type === '1'">
          <el-select v-model="form.httpMethod" placeholder="请输入请求方式" style="width: 100%">
            <template v-for="item in httpMethodOptionList">
              <el-option :value="item.dictValue" :label="item.dictLable"/>
            </template>
          </el-select>
        </el-form-item>
        <el-form-item label="权限字符" prop="moduleCode" v-if="form.type === '1'">
          <el-input v-model="form.moduleCode" placeholder="请输入权限字符" @input="change($event)"/>
        </el-form-item>
        <el-form-item label="状态" prop="moduleStatus">
          <el-select v-model="form.moduleStatus" placeholder="请输入状态" style="width: 100%">
            <template v-for="item in statusOptionList">
              <el-option :value="item.dictValue" :label="item.dictLable"/>
            </template>
          </el-select>
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input v-model="form.sort" placeholder="请输入排序"/>
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
  import DcyTable from '@/components/dcy/dcy-table'
  import { addModule, deleteBatchModuleById, deleteModuleById, updateModule } from '@/api/admin/module'
  import { MessageError, MessageSuccess, ConfirmCustom } from '@/libs/message'
  import { getDictByType } from '../../api/common'

  export default {
    name: 'module-manage',
    components: { DcyTable },
    data() {
      return {
        columns: [
          { label: '名称', prop: 'moduleName', align: 'left', width: '400' },
          { label: '类型', slot: 'type' , width: '100'},
          { label: '地址', prop: 'modulePath' },
          { label: '请求方式', slot: 'httpMethod', width: '100' },
          { label: '权限字符', prop: 'moduleCode' },
          { label: '状态', slot: 'moduleStatus' , width: '100'},
          { label: '排序', prop: 'sort' , width: '100'},
          { label: '操作', slot: 'action' }
        ],
        dialogShow: false,
        dialogTitle: '添加模块',
        form: {},
        rules: {
          moduleName: [this.$ruler('名称')],
          modulePath: [this.$ruler('地址')],
          httpMethod: [this.$ruler('方式', 'change')],
          moduleCode: [{pattern: /^[A-Za-z_:]{3,20}$/, message: '请输入大小写字母，下划线，冒号并且3-15个字符'}],
          moduleStatus: [this.$ruler('状态', 'change')],
          type: [this.$ruler('类型', 'change')]
        },
        statusOptionList: [],
        httpMethodOptionList: [],
        moduleTypeOptionList: []
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
       * 添加弹出框
       */
      addModule(row) {
        this.form = {}
        if (row.type === '1') {
          this.$message.error('操作类型下面不可以在添加子节点！')
        } else {
          this.selTreeNode = { ...row }
          this.dialogTitle = '添加模块'
          this.form.parentId = this.selTreeNode.moduleId
          this.form.parentName = this.selTreeNode.moduleName
          this.form.parentIds = this.selTreeNode.parentIds + ',' + this.selTreeNode.moduleId
          this.dialogShow = true
        }
      },
      /**
       * 修改弹出框
       * @param row
       */
      update(row) {
        this.form = { ...row }
        this.dialogTitle = '修改模块'
        this.dialogShow = true
      },
      /**
       * 行内删除
       * @param row
       */
      remove(row) {
        ConfirmCustom({ type: 'warning' }).then(() => {
          deleteModuleById(row.moduleId).then(res => {
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
            if (this.dialogTitle === '添加模块') {
              addModule(this.form).then(res => {
                if (res.data) {
                  MessageSuccess('add')
                } else {
                  MessageError('add')
                }
                this.cancelDialogAndRefresh()
              })
            } else {
              updateModule(this.form).then(res => {
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
      getDictByType('status').then(res => {
        this.statusOptionList = res.data
      })
      getDictByType('module_type').then(res => {
        this.moduleTypeOptionList = res.data
      })
      getDictByType('http_method').then(res => {
        this.httpMethodOptionList = res.data
      })
    }
  }
</script>

<style scoped lang="scss">

</style>
