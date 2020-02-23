<template>
  <div class="app-container">
    <!-- 查询条件 -->
    <el-form ref="queryParams" inline label-width="80px" label-position="left">
      <el-form-item label-width="0px">
        <el-button icon="el-icon-search" type="primary" @click="refresh()">查询</el-button>
        <el-button icon="el-icon-plus" type="primary" @click="addModel()">添加</el-button>
      </el-form-item>
    </el-form>

    <!-- 表格 -->
    <dcy-table
      ref="dcyTable"
      url="workflow-center/models/list"
      :columns="columns"
      :check-box="false">
      <template slot-scope="{ row }" slot="isDeployment">
        <el-tag type="success" v-if="row.isDeployment">已部署</el-tag>
        <el-tag type="warning" v-else>未部署</el-tag>
      </template>
      <template slot-scope="{ row }" slot="action">
        <el-button @click="seeDetails(row)" type="text">查看</el-button>
        <el-button @click="update(row)" type="text">修改</el-button>
        <el-button @click="deploy(row)" type="text">部署</el-button>
        <el-button @click="remove(row)" type="text">删除</el-button>
      </template>
    </dcy-table>

  </div>
</template>

<script>
  import DcyTable from '_c/dcy/dcy-table'
  import {ConfirmCustom} from '@/libs/message'
  import {deleteModelById, deployModel} from "_a/workflow/model";
  import {Message} from "element-ui";

  export default {
    name: 'model-manage',
    components: {DcyTable},
    data() {
      return {
        columns: [
          {label: '模型ID', prop: 'id', width: '300px'},
          {label: '模型名称', prop: 'name'},
          {label: '模型标识', prop: 'key'},
          {label: '描述', prop: 'description'},
          {label: '版本号', prop: 'version', width: '80px'},
          {label: '是否部署', slot: 'isDeployment', width: '120px'},
          {label: '更新时间', prop: 'lastUpdatedDate'},
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
      addModel(){
        window.open(`${process.env.VUE_APP_PROXY_TARGET}workflow-center/#/processes`)
      },
      seeDetails(row) {
        window.open(`${process.env.VUE_APP_PROXY_TARGET}workflow-center/#/processes/${row.id}`)
      },
      update(row) {
        window.open(`${process.env.VUE_APP_PROXY_TARGET}workflow-center/#/editor/${row.id}`)
      },
      deploy(row) {
        ConfirmCustom({type: 'warning',message : `是否确认部署ID为${row.id}的模型?`,}).then(() => {
          deployModel(row.id).then(res => {
            if (res.success) {
              Message.success({message: '部署成功'})
            } else {
              Message.error({message: '部署失败'})
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
        ConfirmCustom({type: 'warning',message : `是否确认删除为${row.id}的模型?`,}).then(() => {
          deleteModelById(row.id).then(res => {
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
