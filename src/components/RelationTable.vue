<template>
  <div class="relation-wapper">
    <div id="relation" class="relation-container" ref="relation-container" :style="[containerStyle]" @mouseup="thMouseupHandle()">
      <slot name="horizonScrollBar"></slot>
      <div class="table-header-wrapper">
        <table 
          cellspacing="0" cellpadding="0" border="0" class="table__header"
          :style="containerWidth ? 'width:' + containerWidth + 'px;' : ''">
          <colgroup>
            <col
              v-for="(col, c) in tableHead"
              :key="'col-' + col.prop + '-' + c"
              :align="col.align || 'left'" :width="col.width || col.minWidth || averageWidth" :span="col.span || 1">
          </colgroup>
          <thead class="table__thead">
            <tr class="is-row-thead" :style="[theadRowStyle]">
              <th 
                class="thead-th"
                :style="[theadThStyle(head)]"
                v-for="(head, h) in tableHead"
                :key="'th-' + head.prop + '-' + h"
                @mousedown="thMousedownHandle(head, h)"
                @mousemove="thMousemoveHandle(head, h)">
                <template v-if="head.prop === 'expand'">
                  <div :style="[{textAlign:'center', width:head.width + 'px'}]"></div>
                </template>
                <template v-if="head.prop === 'select'">
                  <div :style="[{textAlign:'center', width:head.width + 'px'}]" @click.stop="checkClick">
                    <input class="checkbox" id="checkedAll" type="checkbox" :value="checkedAll" @change="checkedAllChange">
                    <label for="checkedAll"></label>
                  </div>
                </template>
                <template v-if="head.prop !== 'expand' && head.prop !== 'select'">
                  <span class="th-text" :style="[{width: ((head.width || head.minWidth || averageWidth) - 20) + 'px'}]">{{head.label}}</span>
                </template>
              </th>
            </tr>
          </thead>
        </table>
      </div>
      <div class="table-body-wrapper">
        <div class="empty-box" v-if="!tableData || !tableData.length" :style="[emptyStyle]">
          <span>{{relationTable.emptyText || '暂无数据'}}</span>
        </div>
        <table
          v-if="tableData && tableData.length" 
          cellspacing="0" 
          cellpadding="0" 
          border="0" 
          class="table__body"
          :style="containerWidth ? 'width:' + containerWidth + 'px;' : ''">
          <colgroup>
            <col
              v-for="(_col, c) in tableHead"
              :key="'_col-' + _col.prop + '-' + c"
              :align="_col.align || 'left'" :width="_col.width || _col.minWidth || averageWidth" :span="_col.span || 1">
          </colgroup>
          <tbody class="table__tbody">
            <tr
              class="is-row-tbody" :style="[tbodyRowStyle]"
              :class="data.showRelation ? 'bg-light' : ''"
              v-for="(data, t) in tableData"
              :key="'tr-' + data.id + '-' + t"
              @mouseenter.stop="mouseenterTbodyRowHandle(data)"
              @mouseleave.stop="mouseleaveTbodyRowHandle(data)"
              @click.stop="rowClickHandle(data)">
              <td 
                class="tbody-td"
                :style="[tdStyle]"
                v-for="(head, h) in tableHead"
                :key="'td-' + head.pro + '-' + h">
                <template v-if="head.prop === 'expand' && data.children && data.children.length">
                  <div :style="[{textAlign:'center', width:head.width + 'px'}]" @click.stop="expandClick()">
                    <i :class="'expand-icon ' + (data.expanded ? 'el-icon-arrow-down' : 'el-icon-arrow-right')" @click.stop="expandHandle(data, t)"></i>
                  </div>
                </template>
                <template v-if="head.prop === 'select'">
                  <div :style="[{
                      textAlign:'center', 
                      width:head.width + 'px', 
                      position:'relative',
                      height:'100%',
                      userSelect: 'none'
                    }]" @click.stop="checkClick">
                    <input 
                      class="checkbox" 
                      :id="'checkboxId-' + data.id" 
                      type="checkbox" 
                      :value="data.selected"
                      :checked="data.selected"
                      @change="checkboxChange(data, t)">
                    <label :for="'checkboxId-' + data.id"></label>
                  </div>
                </template>
                <template v-if="head.prop !== 'expand' && head.prop !== 'select'">
                  <span 
                    v-if="!head.tooltip"
                    class="td-text" 
                    :style="[tdTextStyle(head, data)]">{{dataFormatter(head, data)}}</span>
                  <span 
                    v-else
                    class="td-text text-tooltip" 
                    :data-title="dataFormatter(head, data)"
                    :style="[tdTextStyle(head, data)]">{{dataFormatter(head, data)}}</span>
                </template>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="relationTable.pagination.page"
      :page-sizes="relationTable.pagination.pageSizes"
      :page-size="relationTable.pagination.pageSize"
      :layout="relationTable.pagination.layout"
      :total="relationTable.pagination.total">
    </el-pagination>
  </div>
</template>
<script type="text/ecmascript-6">

  export default {
    name: 'relationTable',
    props: {
      relationTable: {type:Object, default:{}},
    },
    components: {},
    created() {},
    mounted() {
      let container = document.getElementById('relation');
      this.getContainerWidth(container);
    },
    computed: {
      tableData() {return this.relationTable.tableList;},
      tableHead() {return this.relationTable.tableHeadList || [];},
      containerStyle() {return Object.assign(this.container_style, this.relationTable.style.container || {});},
      emptyStyle() {return Object.assign(this.empty_style, this.relationTable.style.empty);},
      theadRowStyle() {return Object.assign(this.thead_row_style, this.relationTable.style.thead || {});},
      tbodyRowStyle() {return Object.assign(this.tbody_row_style, this.relationTable.style.tbody || {});},
      thStyle() {return Object.assign(this.th_style, this.relationTable.style.th || {});},
      tdStyle() {return Object.assign(this.td_style, this.relationTable.style.td || {});},
      styleKeys() {return Object.assign(this.style_keys, this.relationTable.styleKeys || []);},
    },
    data() {
      return {
        containerWidth: 0, // 
        container_style: {
          backgroundColor: '#fff',
          border: '1px solid #ebeef5',
          borderRadius: '5px',
          marginTop: '10px',
        },
        empty_style: {
          height: '60px',
          lineHeight: '60px',
          textAlign: 'center',
          fontSize: '12px',
          color: '#909399'
        },
        thead_row_style: {
          height: '40px',
          lineHeight: '40px',
        },
        tbody_row_style: {
          height: '40px',
          lineHeight: '40px',
        },
        th_style: {
          height: '40px',
          lineHeight: '40px',
          color: '#333',
          fontSize: '12px',
          textAlign: 'left',
          borderRight: '1px solid #ebeef5',
          borderBottom: '1px solid #ebeef5'
        },
        td_style: {
          height: '40px',
          lineHeight: '40px',
          color: '#333',
          fontSize: '12px',
          textAlign: '',
          borderRight: '1px solid #ebeef5',
          borderBottom: '1px solid #ebeef5'
        },
        style_keys: [
          'width', 'textAlign', 'color', 'fontSize', 'position', 
          'top', 'bottom', 'left', 'bottom', 'overflow', 'textOverflow',
          'whiteSpace', 'height', 'lineHeight', 'cursor', 'border',
          'borderRadius', 'boxShadow', 'background', 'fontWeight', 'display',
          'float', 'zIndex'
        ],
        checkedAll: false, // 选中全部
        averageWidth: 0, // 列头平均宽度
        tableHeadDrag: { // 表格拖拽对象
          currentHead: null, // 当前操作的 head
          target: null, // 当前 th 对象
          targetOffsetWidth: 0, // target 对象的 offsetWidth
          oldX: 0, // 开始拖拽的状态
          oldWidth: 0, // 
          offsetWidth: 0, // 当前 head 的 offsetWidth
        }
      }
    },
    methods: {
      // 鼠标进入 表格主体行 tr
      mouseenterTbodyRowHandle(target) {
        this.$emit('mouseenterTbodyRowHandle', {target});
      },
      // 鼠标离开 表格主体行 tr
      mouseleaveTbodyRowHandle(target) {
        this.$emit('mouseleaveTbodyRowHandle', {target});
      },

      // 列表内容的格式化
      /*
        @param     Object     head         列表对应的列
        @param     Object     row          列表行数据(卡片数据)
        @return    any        任何可能的数据类型数据
      */
      dataFormatter(head, row) {return row[head.prop];},
      // 获取容器宽度(可以用来计算每个col的宽度)
      getContainerWidth(container) {
        if (!container) {return 0;}
        this.containerWidth = parseFloat(this._getStyle(container, 'width'));
        this.setColWidth(this.tableHead, this.containerWidth);
      },
      // 设置 col 的宽度
      setColWidth(thead, containerWidth) {
        if (!thead || !thead.length || !containerWidth) {return 0;}
        let width = 0, count = 0;
        thead.forEach(th => {if (th.width) {width += th.width; count += 1}});
        this.averageWidth = (containerWidth - width) / (thead.length - count);
      },
      // thead 内 th 样式
      theadThStyle(param) {return Object.assign(this.thStyle, this.setStyleData(param));},
      // 设置 style 数据
      setStyleData(data) {
        if (!data) {return {};}
        let style = {};
        for (let key in data) {if (this.styleKeys.includes(key)) {style[key] = data[key];}}
        return style;
      },
      // 卡片名称按层级左侧缩进距离
      tdTextStyle(head, data) {
        if (head.prop === 'name') {return {paddingLeft: ((data.level || 1) * 20) + 'px',}}
        else {return {paddingLeft: 10 + 'px',}}
      },
      checkClick() {}, // 复选框父元素点击事件，屏蔽掉行点击事件
      expandClick() {}, // 展开按钮父元素点击事件，屏蔽掉行点击事件
      // 展开按钮点击事件
      /*
        @param     target     Object     被点击展开的卡片对象
        @param     index      Number     卡片对象在tableList中的角标
        @return    undefined
      */
      expandHandle(target, index) {this.$emit('expandHandle', {target, index});},
      // 全选 | 取消全选
      checkedAllChange() {
        let target = event.target || event.srcElement;
        let selected = target.checked;
        let obj = {index:0, setIndex: function(i) {this.index += i;}}
        this.$emit('checkedAllChange', {selected, obj});
      },
      // 选中状态改变事件句柄
      checkboxChange(data, index) {
        let target = event.target || event.srcElement;
        let selected = target.checked;
        let id = data.id;
        this.$emit('checkboxChange', {selected, id, index});
      },
      // 行点击事件
      rowClickHandle(row) {
        this.$emit('rowClick', {row:row});
      },
      // th 鼠标按下事件
      thMousedownHandle(head, h) {
        if (!this.relationTable.tableHeadDragable || 
            this.relationTable.notDragableProp.includes(head.prop) || 
            !head.resizable) {return;}
        let target = event.target || event.srcElement;
        this.$set(this.tableHeadDrag, 'target', target);
        this.$set(this.tableHeadDrag, 'targetOffsetWidth', target.offsetWidth);

        if (event.offsetX > this.tableHeadDrag.targetOffsetWidth - 10) {
          this.$set(this.tableHeadDrag, 'currentHead', this.tableHead[h]);
          this.$emit('mousedown', true);
          this.$set(this.tableHeadDrag, 'oldX', event.x);
          this.$set(this.tableHeadDrag, 'oldWidth', this.tableHeadDrag.targetOffsetWidth);
        }
      },
      // th 鼠标移动事件
      thMousemoveHandle(head, h) {
        if (!this.relationTable.tableHeadDragable || this.relationTable.notDragableProp.includes(head.prop)) {return;}
        let target = event.target || event.srcElement;
        if (event.offsetX > target.offsetWidth - 10) {target.style.cursor = 'col-resize';}
        else {target.style.cursor = 'default';}
        
        if (this.relationTable.mousedown === true) {
          this.$set(this.tableHeadDrag.target.style, 'cursor', 'default');
          if (this.tableHeadDrag.oldWidth + (event.x - this.tableHeadDrag.oldX) > this.tableHeadDrag.currentHead.minWidth) {
            this.$set(this.tableHeadDrag.currentHead, 'width', this.tableHeadDrag.oldWidth + (event.x - this.tableHeadDrag.oldX));
          }
          this.$set(this.tableHeadDrag.target.style, 'cursor', 'col-resize');
          this.$emit('tableHeaderDragend', {
            newWidth: this.tableHeadDrag.currentHead.width, 
            oldWidth: this.tableHeadDrag.oldWidth, 
            column: this.tableHeadDrag.currentHead, 
            event: event
          });
        }
      },
      // table 鼠标抬起事件
      thMouseupHandle() {
        if (!this.relationTable.tableHeadDragable) {return;}
        if (this.relationTable.mousedown) {
          this.$emit('cellWidthChange', this.tableHeadDrag.currentHead);
          this.$emit('mousedown', false);
          this.$set(this.tableHeadDrag, 'currentHead', null);
          this.$set(this.tableHeadDrag.target.style, 'cursor', 'default');
          this.$set(this.tableHeadDrag, 'target', null);
          this.$set(this.tableHeadDrag, 'targetOffsetWidth', 0);
          this.$set(this.tableHeadDrag, 'oldX', 0);
          this.$set(this.tableHeadDrag, 'oldWidth', 0);
          this.$set(this.tableHeadDrag, 'offsetWidth', 0);
        }
      },
      // 每页显示条数变化
      handleSizeChange(pageSize) {this.$emit('pageSizeChange', pageSize);},
      // 页码变化
      handleCurrentChange(page) {this.$emit('pageChange', page);},
      // 获取样式
      _getStyle(element,cssPropertyName){
        if (window.getComputedStyle) {return window.getComputedStyle(element)[cssPropertyName];}
        else {return element.currentStyle[cssPropertyName];}
      },
    },
    watch: {},
    destroyed () {this.$emit('resetPagination');}
  }
</script>
<style type="text/css">
  .relation-container table {border-collapse: collapse;}
  .relation-container table th, .relation-container table td{vertical-align:middle;}
  .relation-container .table-body-wrapper {height: calc(100% - 40px);}
  .relation-container table colgroup {display: table-column-group;}
  .table__body, .table__header {table-layout: fixed; border-collapse: separate;}
  .relation-container table .expand-icon {cursor: pointer;}
  .relation-container table tbody .is-row-tbody {position: relative;}
  .relation-container table tbody .is-row-tbody.bg-light {background: #f5f7fa;}
  .relation-container table tbody .is-row-tbody.bg-light:hover {background: #f1f1f1;}
  .table__thead .is-row-thead .thead-th {background-color: #94e1e1;}
  .table__thead .is-row-thead .thead-th .th-text {
    display: block;
    padding: 5px 10px 5px 10px;
    line-height: 1.5;
  }
  .table__tbody .tbody-td {position: relative;}
  .table__tbody .is-row-tbody .td-text {display: block; text-align: left;}
  .table__tbody .is-row-tbody .td-text.text-tooltip {
    overflow: hidden; 
    text-overflow: ellipsis; 
    white-space: nowrap;
  }
  .table__tbody .tbody-td .checkbox,.table__thead .thead-th .checkbox {
    position: absolute;
    visibility: hidden;
  }
  .table__tbody .tbody-td .checkbox + label,.table__thead .thead-th .checkbox + label {
    display: inline-block;
    position: relative;
    border: 1px solid #dcdfe6;
    border-radius: 2px;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    width: 14px;
    height: 14px;
    background-color: #fff;
    z-index: 1;
    top: 3px;
    cursor: pointer;
    -webkit-transition: border-color .25s cubic-bezier(.71,-.46,.29,1.46),background-color .25s cubic-bezier(.71,-.46,.29,1.46);
    transition: border-color .25s cubic-bezier(.71,-.46,.29,1.46),background-color .25s cubic-bezier(.71,-.46,.29,1.46);
  }
  .table__tbody .tbody-td .checkbox + label:hover,.table__thead .thead-th .checkbox + label:hover {border: 1px solid #409eff;}
  .table__tbody .tbody-td .checkbox:checked + label,.table__thead .thead-th .checkbox:checked + label {
    background-color: #409EFF;
    border-color: #409EFF;
  }
  .table__tbody .tbody-td .checkbox + label::after,.table__thead .thead-th .checkbox + label::after {
    box-sizing: content-box;
    content: "";
    border: 1px solid #fff;
    border-left: 0;
    border-top: 0;
    height: 7px;
    left: 4px;
    position: absolute;
    top: 1px;
    -webkit-transform: rotate(45deg) scaleY(0);
    transform: rotate(45deg) scaleY(0);
    width: 3px;
    -webkit-transition: -webkit-transform .15s ease-in .05s;
    transition: -webkit-transform .15s ease-in .05s;
    transition: transform .15s ease-in .05s;
    transition: transform .15s ease-in .05s,-webkit-transform .15s ease-in .05s;
    -webkit-transform-origin: center;
    transform-origin: center;
  }
  .table__tbody .tbody-td .checkbox:checked + label::after,.table__thead .thead-th .checkbox:checked + label::after {transform: rotate(45deg) scaleY(1);}
  .table__tbody .tbody-td .expand-icon {font-size: 12px; color:#666;}
  #app .relation-wapper .el-pagination {margin-top: 5px;}
</style>
<style lang="stylus" rel="stylesheet/stylus" scoped>
  .relation-container {
    position: relative;
    overflow-x: auto;
    box-sizing: border-box;
    max-width: 100%;
    background-color: #fff;
    font-size: 14px;
    color: #606266;
  }

  .text-tooltip {
    &:hover {
      cursor: default;
      &:after {
        content: attr(data-title);
        position: absolute;
        top: -40px;
        left: 15px;
        z-index: 1000;
        width: max-content;
        max-width: 250px;
        padding: 5px 10px;
        min-height: 24px;
        line-height: 1.8;
        font-size: 14px;
        color: #fff;
        word-break: break-all;
        background-color: #333;
        border-radius: 5px;
      }
    }
  }
</style>
