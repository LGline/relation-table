<template>
  <div id="app">

    <div class="tools">
      <el-button @click="expandAll">全部展开</el-button>
      <el-button @click="collapseAll">全部收起</el-button>
    </div>

    <RelationTable
      :relationTable="relationTable"
      @resetPagination="resetPagination"
      @mousedown="mousedownHandle"
      @expandHandle="expandHandle"
      @checkedAllChange="checkedAllChange"
      @checkboxChange="checkboxChange"
      @rowClick="rowClick"
      @cellWidthChange="cellWidthChange"
      @pageChange="pageChange"
      @pageSizeChange="pageSizeChange"
      @mouseenterTbodyRowHandle="mouseenterTbodyRowHandle"
      @mouseleaveTbodyRowHandle="mouseleaveTbodyRowHandle"
      @tableHeaderDragend="tableHeaderDragend">
    </RelationTable>

    <el-dialog
      title="详情"
      :visible.sync="centerDialogVisible"
      width="40%"
      center>
      {{currentRow}}
      <span slot="footer" class="dialog-footer">
        <el-button @click="centerDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="centerDialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import RelationTable from './components/RelationTable.vue'
import { mockData } from "../mock/mock.js";

export default {
  name: 'app',
  components: {RelationTable},
  data() {
    return {
      centerDialogVisible: false,
      currentRow: null,
      relationTable: {
        initExpanded: false, // 初始化是否展开
        tableHeadDragable: true, // 表头可拖拽改变宽度
        notDragableProp: ['expand', 'select'], // 不支持拖拽改变宽度的列
        emptyText: '', // 数据为空时的文字
        mousedown: false, // 
        tableHeadList: [ // 带关联关系表格表头数据对象
          {type:'',prop:'id', label:'编号', width:100, minWidth:80, tooltip:true, align:'', resizable:true},
          {type:'',prop:'expand', label:'', width:50, minWidth:50, tooltip:true, align:'', resizable:false},
          {type:'',prop:'select', label:'', width:55, minWidth:55, tooltip:true, align:'', resizable:false},
          {type:'',prop:'name', label:'标题', width:300, minWidth:80, tooltip:true, align:'', resizable:true},
          {type:'',prop:'createTime', label:'创建日期', width:120, minWidth:100, tooltip:false, align:'', resizable:true, isCustom:false},
          {type:'',prop:'createUserName', label:'创建人', width:120, minWidth:100, tooltip:true, align:'', resizable:true},
          {type:'',prop:'type', label:'类型', width:120, minWidth:100, tooltip:true, align:'', resizable:true},
          {type:'',prop:'state', label:'状态', width:120, minWidth:100, tooltip:true, align:'', resizable:true},
          {type:'',prop:'level', label:'优先级', width:120, minWidth:100, tooltip:true, align:'', resizable:true},
          {type:'',prop:'importance', label:'重要程度', width:120, minWidth:100, tooltip:true, align:'', resizable:true},
          {type:'',prop:'receiver', label:'操作人', width:120, minWidth:100, tooltip:true, align:'', resizable:true},
        ],
        tableList: [], // 将层级结构数据解析成并列结构
        relationList: [], // 带关联关系的卡片数据(嵌套的层级结构)
        selectedList: [], // 选中的卡片集合
        styleKeys: [ // 组件接受的可设置样式的属性
          'width', 'minWidth', 'textAlign', 'color', 'fontSize', 'position', 
          'top', 'bottom', 'left', 'bottom', 'overflow', 'textOverflow',
          'whiteSpace', 'height', 'lineHeight', 'cursor', 'border',
          'borderRadius', 'boxShadow', 'background', 'fontWeight', 'display',
          'float', 'zIndex'
        ],
        style: { // 组件各部分的样式
          container: {},
          empty: {},
          thead: {},
          tbody: {},
          th: {},
          td: {}
        },
        pagination: { // 表格分页
          page: 1,
          pageSize: 10,
          pageSizes: [10, 15, 20],
          layout: 'total, sizes, prev, pager, next, jumper',
          total: 50
        }
      }
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
        this.relationTable.relationList = mockData(this.relationTable.pagination.pageSize).map(row => {
          return Object.assign(row, {level:1, children: mockData(2).map(ro => {
            return Object.assign(ro, {level:2, children: mockData(1).map(r => {
              return Object.assign(r, {level:3});
            })});
          })});
        });
      }
      this.relationTable.tableList = [];
      this.initTableData(this.relationTable.relationList);
    },

    // 递归设置 table 数据
    initTableData(list) {
      list.forEach((row, c) => {
        // 通过组件全局initExpanded属性控制是否默认展开
        this.$set(row, 'expanded', this.relationTable.initExpanded);
        // 给卡片添加rootRowId属性来标识哪些卡片拥有相同的根节点
        this.$set(row, 'rootRowId', row.rootRowId ? row.rootRowId : row.id);
        // 给卡片添加是否显示从属关系的属性，来控制父卡片被hover时子卡片的显示样式
        this.$set(row, 'showRelation', false);

        this.relationTable.tableList.push(row);
        if (row.expanded && row.children && row.children.length) {
          row.children.forEach(child => {
            this.$set(row, 'rootRowId', row.rootRowId ? row.rootRowId : row.id);
            this.$set(row, 'showRelation', false);
          });
          this.initTableData(row.children);
        }
      });
    },

    // 递归获取卡片
    /*
      @param     list     Array     带有关联关系(嵌套关系)的卡片列表
      @param     target   Object    被点击的卡片对象
      @return    row      Object    带关联关系卡片列表内与tableList内被点击卡片ID对应的卡片对象
    */
    getRow(list, target) {
      let obj = {
        row: null,
        getter: function(list, target) {
          for (let i = 0; i < list.length; i++) {
            if (list[i].id === target.id) {this.row = list[i];}
            else {if (list[i].children && list[i].children.length) {this.getter(list[i].children, target);}}
          }
        }
      }
      obj.getter(list, target);
      return obj.row;
    },

    // 递归获取卡片下已展开的(需要收起的)子卡片个数
    childrenLength(row, prop) {
      let obj = {
        length: 0,
        getLength: function(row) {
          row.children.forEach(child => {
            this.length++;
            if (prop) {
              if (child.children && child.children.length && child[prop]) {this.getLength(child);}
            } else {
              if (child.children && child.children.length) {this.getLength(child);}
            }
          });
        }
      }
      obj.getLength(row);
      return obj.length;
    },

    // 递归设置 table 数据
    /*
      @param     row          Object     relationList内的卡片数据(relationList内与tableList内被点击的卡片ID相对应的卡片)
      @param     index        Number     被点击的卡片的角标(tableList内被点击的卡片的角标)
      @param     expanded     Boolean    卡片是否展开
      @return    undefined
    */
    setTableData(row, index, expanded) {
      if (expanded) { // 在相对应的位置插入
        let tableList = this.relationTable.tableList;
        let obj = {
          index: index,
          foreach: function(row, expanded) {
            row.children.forEach((child, c) => {
              let rowIdList = tableList.map(row => {return row.id;});
              if (!rowIdList.includes(child.id)) {
                this.splice(child, (this.index + c), expanded);
              } else {this.index++;}
              if (child.children && child.children.length) {
                this.foreach(child, expanded);
              }
            });
          },
          splice: function(row, i, expanded) {
            this.index++;
            tableList.splice(this.index, 0, row);
          }
        }
        obj.foreach(row, expanded);
      } else { // 在相对应的位置移除
        this.relationTable.tableList.splice((index + 1), this.childrenLength(row, 'expanded'));
      }
    },

    // 递归 getter 某个集合内指定属性值的对象的集合
    /*
      @param     array          Array      数据集合
      @param     prop           String     对象内用来get的属性名(按照该属性get)
      @param     value          Any        对象内要get的属性对应的值(按照该属性值get)(传入非原始数据类型的数据，结果会有误)
      @param     key            String     递归的关键key(以该key判断是否递归)
      @param     noRepeatKey    String     去重时用到的 key
      @return    undefined
    */
    getters(array, prop, value, key, noRepeatKey) {
      let obj = {
        list: this.relationTable.selectedList,
        getList: function(arr) {
          arr.forEach(item => {
            let noRepeatList = this.list.map(it => {return it[noRepeatKey];});
            if (item[prop] === value) {
              if (!noRepeatList.includes(item[noRepeatKey])) {this.list.push(item);}
            } else {
              let index = noRepeatList.findIndex(id => {return id === item[noRepeatKey]});
              if (index !== -1) {this.list.splice(index, 1);}
            }
            if (item[key] && item[key].length) {this.getList(item[key]);}
          });
        }
      }
      obj.getList(array);
      return obj.list;
    },

    // 递归 setter 某个对象的某个属性
    /*
      @param     data           Object     要设置属性的对象
      @param     prop           String     对象内要设置属性值的属性名
      @param     value          Any        要设置的属性值(可能是任何类型的值)
      @param     key            String     递归的关键key(以该key判断是否递归)
      @return    undefined
    */
    setters(data, prop, value, key) {
      this.$set(data, prop, value);
      if (data[key] && data[key].length) {
        data[key].forEach(da => {this.setters(da, prop, value, key);});
      }
    },

    // 重置分页对象
    resetPagination() {
      this.$set(this.relationTable.pagination, 'page', 1);
      this.$set(this.relationTable.pagination, 'pageSize', 10);
    },

    // 鼠标按下
    mousedownHandle(mousedown) {this.relationTable.mousedown = mousedown;},

    // 展开按钮点击事件
    /*
      @param     target     Object     被点击展开的卡片对象
      @param     index      Number     卡片对象在tableList中的角标
      @return    undefined
    */
    expandHandle({target, index}) {
      let row = this.getRow(this.relationTable.relationList, target);
      this.setTableData(row, index, !row.expanded);
      this.setters(row, 'expanded', !row.expanded, 'children');
      if (!row.expanded) {
        this.setters(row, 'rootRowId', row.id, 'children');
        this.setters(row, 'showRelation', false, 'children');
      }
      else {
        this.setters(row, 'rootRowId', undefined, 'children');
        this.setters(row, 'showRelation', true, 'children');
      }
    },

    // 全选 | 取消全选
    /*
      @param     selected     Boolean     是否选中
      @param     obj          Object      递归用的对象(包含递归方法和闭包)
      @return    undefined
    */
    checkedAllChange({selected, obj}) {
      this.relationTable.relationList.forEach((rootRow, r) => {
        if (selected) {
          if (obj.index !== 0) {
            let rowIdList = this.relationTable.tableList.map(row => {return row.id;});
            if (!rowIdList.includes(rootRow.id)) {this.splice(rootRow, obj.index, selected);}
            else {obj.index++;}
          }
          this.setTableData(rootRow, obj.index, selected);
          this.setters(rootRow, 'expanded', selected, 'children');
          this.setters(rootRow, 'rootRowId', rootRow.id, 'children');
          this.setters(rootRow, 'showRelation', false, 'children');
          this.setters(rootRow, 'selected', selected, 'children');
          obj.setIndex(this.childrenLength(rootRow));
        } else {
          this.setters(rootRow, 'selected', selected, 'children');
        }
      });
      this.relationTable.selectedList = this.getters(this.relationTable.relationList, 'selected', true, 'children', 'id');
      console.log('=- 当前选中项 -=')
      console.log(this.relationTable.selectedList)
    },

    // 选中项改变事件
    /*
      @param     selected     Object      是否选中
      @param     id           Object      被点击的卡片ID
      @param     index        Number      被点击的卡片在 tableList 中的角标
      @return    undefined
    */ 
    checkboxChange({selected, id, index}) {
      let row = this.getRow(this.relationTable.relationList, {id:id});
      if (selected) {
        this.setTableData(row, index, true);
        this.setters(row, 'expanded', true, 'children');
        this.setters(row, 'rootRowId', row.id, 'children');
        this.setters(row, 'showRelation', true, 'children');
        this.setters(row, 'selected', true, 'children');
      } else {
        this.setters(row, 'selected', false, 'children');
      }
      
      this.relationTable.selectedList = this.getters([row], 'selected', true, 'children', 'id');
      console.log('=- 当前选中项 -=')
      console.log(this.relationTable.selectedList)
    },

    // 行点击事件
    rowClick({row}) {
      setTimeout(() => {
        this.currentRow = row;
        this.centerDialogVisible = true;
      },300);
    },

    // 表格列宽度改变
    cellWidthChange(cell) {
      console.log('=- 当前改变宽度的列 -=')
      console.log(cell.label)
      console.log('=- 当前列宽度 -=')
      console.log(cell.width)
    },

    // 页码改变
    pageChange(page) {
      this.relationTable.pagination.page = page;
      this.getRelationTableData(true);
    },

    // 每页显示条数改变
    pageSizeChange(pageSize) {
      this.relationTable.pagination.pageSize = pageSize;
      this.getRelationTableData(true);
    },

    // 鼠标进入 表格主体行 tr
    mouseenterTbodyRowHandle({target}) {
      let row = this.getRow(this.relationTable.relationList, target);
      this.setters(row, 'showRelation', true, 'children');
    },

    // 鼠标离开 表格主体行 tr
    mouseleaveTbodyRowHandle({target}) {
      let row = this.getRow(this.relationTable.relationList, target);
      this.setters(row, 'showRelation', false, 'children');
    },

    // 当拖动表头改变了列的宽度的时候会触发该事件
    tableHeaderDragend({newWidth, oldWidth, column, event}) {
      this.relationTable.tableHeadList.forEach(head => {if (head.prop === column.prop) {head.width = newWidth;}});
    }
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
}
</style>
