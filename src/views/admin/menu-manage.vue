<template>
  <div class="app-container">

    <!-- 表格 -->
    <dcy-table
      ref="dcyTable"
      url="admin-center/menu/getMenuTreeTableList"
      row-key="menuId"
      :page-ing-type="false"
      default-expand-all
      :check-box="false"
      :columns="columns">
      <template slot="type" slot-scope="{row}">
        <el-tag type="primary" v-if="row.type === '0'">模块</el-tag>
        <el-tag type="warning" v-if="row.type === '1'">菜单</el-tag>
      </template>
      <template slot="disabledStatus" slot-scope="{row}">
        <el-tag type="success" v-if="row.disabledStatus === '0'">正常</el-tag>
        <el-tag type="error" v-if="row.disabledStatus === '1'">禁用</el-tag>
      </template>
      <template slot-scope="{ row }" slot="action">
        <el-button @click="addMenu(row)" type="text">添加</el-button>
        <el-button @click="update(row)" type="text">修改</el-button>
        <el-button @click="remove(row)" v-if="row.children.length === 0" type="text">删除</el-button>
      </template>
    </dcy-table>

    <!-- 添加表单 -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogShow"
      :close-on-click-modal="false"
      @close="handleReset('form')">
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="父级名称" v-if="dialogTitle === '添加菜单'">
          <el-input disabled v-model="form.parentName" placeholder="请输入菜单名称"/>
        </el-form-item>
        <el-form-item label="名称" prop="menuName">
          <el-input v-model="form.menuName" placeholder="请输入名称"/>
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select v-model="form.type" placeholder="请输入类型" style="width: 100%">
            <template v-for="item in menuTypeOptionList">
              <el-option :value="item.dictValue" :label="item.dictLable"/>
            </template>
          </el-select>
        </el-form-item>
        <el-form-item label="地址" prop="href" v-if="form.type === '1'">
          <el-input v-model="form.href" placeholder="请输入地址"/>
        </el-form-item>
        <el-form-item label="权限code" prop="menuCode" v-if="form.type === '1'">
          <el-input v-model="form.menuCode" placeholder="请输入权限code"/>
        </el-form-item>
        <el-form-item label="图标" prop="icon">
          <el-input v-model="form.icon" placeholder="请输入图标"/>
        </el-form-item>
        <el-form-item label="状态" prop="disabledStatus">
          <el-select v-model="form.disabledStatus" placeholder="请输入状态" style="width: 100%">
            <template v-for="item in statusOptionList">
              <el-option :value="item.dictValue" :label="item.dictLable"/>
            </template>
          </el-select>
        </el-form-item>
        <el-form-item label="排序" prop="location">
          <el-input v-model="form.location" type="number" placeholder="请输入排序"/>
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
  import { addMenu, deleteBatchMenuById, deleteMenuById, updateMenu } from '@/api/admin/menu'
  import { MessageError, MessageSuccess, ConfirmCustom } from '@/libs/message'
  import { getDictByType } from '../../api/common'

  export default {
    name: 'menu-manage',
    components: { DcyTable },
    data() {
      return {
        columns: [
          { label: '菜单名称', prop: 'menuName',align:'left' },
          { label: '权限code', prop: 'menuCode' },
          { label: '类型', slot: 'type' },
          { label: '地址', prop: 'href' },
          { label: '打开方式', prop: 'target' },
          { label: '图标', prop: 'icon' },
          { label: '禁用', slot: 'disabledStatus' },
          { label: '排序', prop: 'location' },
          { label: '备注', prop: 'remark' },
          { label: '操作', slot: 'action' }
        ],
        dialogShow: false,
        dialogTitle: '添加菜单',
        form: {},
        rules: {
          menuName: [this.$ruler('菜单名称')],
          type: [this.$ruler('类型', 'change')],
          href: [this.$ruler('地址')],
          menuCode: [this.$ruler('权限code')],
          disabledStatus: [this.$ruler('状态', 'change')]
        },
        statusOptionList:[],
        menuTypeOptionList:[]
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
      addMenu(row) {
        this.form = {}
        if (row.type === '1') {
          this.$message.error('菜单类型下面不可以在添加子节点！')
        } else {
          this.selTreeNode = {...row};
          this.dialogTitle = '添加菜单';
          this.form.parentId = this.selTreeNode.menuId;
          this.form.parentName = this.selTreeNode.menuName;
          this.form.parentIds = this.selTreeNode.parentIds + ',' + this.selTreeNode.menuId;
          this.dialogShow = true;
        }
      },
      /**
       * 修改弹出框
       * @param row
       */
      update(row) {
        this.form = { ...row }
        this.dialogTitle = '修改菜单'
        this.dialogShow = true
      },
      /**
       * 行内删除
       * @param row
       */
      remove(row) {
        ConfirmCustom({ type: 'warning' }).then(() => {
          deleteMenuById(row.menuId).then(res => {
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
            if (this.dialogTitle === '添加菜单') {
              addMenu(this.form).then(res => {
                if (res.data) {
                  MessageSuccess('add')
                } else {
                  MessageError('add')
                }
                this.cancelDialogAndRefresh()
              })
            } else {
              updateMenu(this.form).then(res => {
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
      getDictByType('status').then(res=>{
        this.statusOptionList = res.data;
      });
      getDictByType('power_type').then(res=>{
        this.menuTypeOptionList = res.data;
      })
    }
  }
</script>

<style scoped lang="scss">

</style>
