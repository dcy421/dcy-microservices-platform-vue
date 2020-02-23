<template>
  <div class="app-container">
    <!-- 查询条件 -->
    <el-form ref="queryParams" inline label-width="80px" label-position="left">
      <el-form-item label-width="0px">
        <el-button icon="el-icon-search" type="primary" @click="refresh()">查询</el-button>
      </el-form-item>
    </el-form>

    <!-- 表格 -->
    <dcy-table
      ref="dcyTable"
      url="workflow-center/process/list"
      :columns="columns"
      :check-box="false">
      <template slot-scope="{ row }" slot="isSuspended">
        <el-tag type="warning" v-if="row.isSuspended">已挂起</el-tag>
        <el-tag type="success" v-else>激活</el-tag>
      </template>
      <template slot-scope="{ row }" slot="action">
        <el-button @click="seeProcessPic(row)" type="text">流程图</el-button>
        <el-button @click="update(row)" type="text">{{row.isSuspended ? '激活':'挂起'}}</el-button>
        <el-button @click="remove(row)" type="text">删除</el-button>
      </template>
    </dcy-table>

    <el-dialog
      title="流程图"
      :visible.sync="dialogProcessPicShow"
      append-to-body>
      <img width="100%" :src="processPicUrl" alt="">
    </el-dialog>
  </div>
</template>

<script>
  import DcyTable from '_c/dcy/dcy-table'
  import {ConfirmCustom} from "_l/message";
  import {Message} from "element-ui";
  import {deleteProcessByDeploymentId, hangChange} from "_a/workflow/process";

  export default {
    name: 'process-manage',
    components: {DcyTable},
    data() {
      return {
        dialogProcessPicShow: false,
        processPicUrl: null,
        columns: [
          {label: '流程ID', prop: 'id', width: '320px'},
          {label: '流程名称', prop: 'name'},
          {label: '流程标识', prop: 'key'},
          {label: '版本', prop: 'version', width: '80px'},
          {label: '是否挂起', slot: 'isSuspended', width: '80px'},
          {label: '部署时间', prop: 'deploymentDate'},
          {label: '操作', slot: 'action'}
        ],
      }
    },
    methods: {
      /**
       * 刷新
       */
      refresh() {
        this.$refs.dcyTable.refresh()
      },
      seeProcessPic(row) {
        this.dialogProcessPicShow = true;
        this.processPicUrl = `${process.env.VUE_APP_PROXY_TARGET}workflow-center/diagram/getFlowDiagram/${row.id}`;
      },
      update(row) {
        ConfirmCustom({type: 'warning', message: `是否确认挂起为${row.id}的流程?`,}).then(() => {
          hangChange(row.id).then(res => {
            if (res.success) {
              Message.success({message: '操作成功'})
            } else {
              Message.error({message: '操作失败'})
            }
            // 刷新表格
            this.refresh()
          })
        })
      },
      /**
       * 行内删除
       * @param row
       */
      remove(row) {
        ConfirmCustom({type: 'warning', message: `是否确认删除为${row.id}的流程?`,}).then(() => {
          deleteProcessByDeploymentId(row.id).then(res => {
            if (res.success) {
              Message.success({message: '删除成功'})
            } else {
              Message.error({message: '删除失败'})
            }
            // 刷新表格
            this.refresh()
          })
        })
      },
    },
    mounted() {

    }
  }
</script>

<style scoped lang="scss">

</style>
