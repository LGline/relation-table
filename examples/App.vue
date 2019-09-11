<template>
  <div id="app">
    <relation-table
      :config="config"
      :tableHeadList="tableHeadList"
      :relationList="relationList"
      @checkedAllChange="checkedAllChange"
      @checkChange="checkChange"
      @rowClick="rowClick"
      @cellWidthChange="cellWidthChange">
    </relation-table>
  </div>
</template>

<script>
import { mockData } from "../mock/mock.js";
export default {
  name: 'app',
  data() {
    return {
      config: {
        initExpanded: false, // 初始化是否展开
        tableHeadDragable: true, // 表头可拖拽改变宽度
        // emptyText: '', // 数据为空时的文字
        style: { // 组件各部分的样式
          // container: {},
          // empty: {},
          // thead: {},
          // tbody: {},
          // th: {},
          // td: {}
        }
      },
      tableHeadList: [ // 带关联关系表格表头数据对象
        {type:'',prop:'select', label:'', width:55, minWidth:55, tooltip:true, align:'', resizable:false},
        {type:'',prop:'id', label:'编号', tooltip:true, resizable:true},
        {type:'',prop:'name', label:'标题', tooltip:true, resizable:true},
        {type:'',prop:'createTime', label:'创建日期', width:120, minWidth:100, tooltip:false, resizable:true},
        {type:'',prop:'createUserName', label:'创建人', width:120, minWidth:100, tooltip:true, resizable:true},
        {type:'',prop:'type', label:'类型', width:120, minWidth:100, tooltip:true, resizable:true},
        {type:'',prop:'state', label:'状态', width:120, minWidth:100, tooltip:true, resizable:true},
        {type:'',prop:'level', label:'优先级', width:120, minWidth:100, tooltip:true, resizable:true},
        {type:'',prop:'importance', label:'重要程度', width:120, minWidth:100, tooltip:true, resizable:true},
        {type:'',prop:'receiver', label:'操作人', width:120, minWidth:100, tooltip:true, resizable:true},
      ],
      relationList: [], // 带关联关系的卡片数据(嵌套的层级结构)
    }
  },
  mounted() {
    this.getRelationTableData(true);
  },
  methods: {

    // 全部展开
    expandAll() {
      this.relationTable.initExpanded = true;
      this.getRelationTableData();
    },

    // 全部收起
    collapseAll() {
      this.relationTable.initExpanded = false;
      this.getRelationTableData();
    },

    // 获取带关联关系表格数据
    getRelationTableData(refresh) {
      if (refresh) {
        this.relationList = mockData(10).map(row => {
          return Object.assign(row, {level:1, children: mockData(2).map(ro => {
            return Object.assign(ro, {level:2, children: mockData(1).map(r => {
              return Object.assign(r, {level:3});
            })});
          })});
        });
      }
    },

    // 全选 | 取消全选
    checkedAllChange(selectedList) {
      console.log('=- 当前选中项 -=')
      console.log(selectedList)
    },

    // 选中项改变事件
    checkChange(selectedList) {
      console.log('=- 当前选中项 -=')
      console.log(selectedList)
    },

    // 行点击事件
    rowClick(row) {
      console.log('=- 当前点击行 -=')
      console.log(row)
    },

    // 表格列宽度改变
    cellWidthChange(cell) {
      console.log('=- 当前改变宽度的列 -=')
      console.log(cell.label)
      console.log('=- 当前列宽度 -=')
      console.log(cell.width)
    },
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
