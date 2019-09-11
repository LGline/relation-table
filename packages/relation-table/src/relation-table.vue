<template>
  <div class="relation-wapper">
    <div id="relation-table" class="relation-container" ref="relation-container" :style="[tableConfig.style.container]" @mouseup="thMouseupHandle()">
      <div class="table-header-wrapper" v-if="tableHead && tableHead.length">
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
            <tr class="is-row-thead" :style="[tableConfig.style.thead]">
              <th 
                class="thead-th"
                :style="[tableConfig.style.th]"
                v-for="(head, h) in tableHead"
                :key="'th-' + head.prop + '-' + h"
                @mousedown="thMousedownHandle(head, h)"
                @mousemove="thMousemoveHandle(head)">
                <template v-if="head.prop === 'select'">
                  <div :style="[{textAlign:'center', width:head.width + 'px'}]" @click.stop="checkClick">
                    <input class="checkbox" id="checkedAll" type="checkbox" :value="checkedAll" @change="checkedAllChange">
                    <label for="checkedAll"></label>
                  </div>
                </template>
                <template v-if="head.prop !== 'select'">
                  <div :style="[setStyleData(head)]">
                    <span 
                      class="th-text"
                      :style="[{width: ((head.width || head.minWidth || averageWidth) - 20) + 'px'}]">
                      {{head.label}}
                    </span>
                  </div>
                </template>
              </th>
            </tr>
          </thead>
        </table>
      </div>
      <div class="empty-box" v-if="!tableHead || !tableHead.length || !tableData || !tableData.length" :style="[tableConfig.style.empty]">
        <span>{{tableConfig.emptyText}}</span>
      </div>
      <div class="table-body-wrapper" v-if="tableHead && tableHead.length && tableData && tableData.length">
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
              class="is-row-tbody" :style="[tableConfig.style.tbody]"
              :class="data.showRelation ? 'bg-light' : ''"
              v-for="(data, t) in tableData"
              :key="'tr-' + data.id + '-' + t"
              @mouseenter.stop="mouseenterTbodyRowHandle(data)"
              @mouseleave.stop="mouseleaveTbodyRowHandle(data)"
              @click.stop="rowClickHandle(data)">
              <td 
                class="tbody-td"
                v-for="(head, h) in tableHead"
                :key="'td-' + head.pro + '-' + h">
                <template v-if="head.prop === 'select'">
                  <div :style="[{
                      textAlign:'center', 
                      width:head.width + 'px', 
                      position:'relative',
                      height:'100%',
                      userSelect: 'none',
                      borderRight: tableConfig.style.td.borderRight,
                      borderBottom: tableConfig.style.td.borderBottom
                    }]" @click.stop="checkClick">
                    <input 
                      class="checkbox" 
                      :id="'checkboxId-' + data.id" 
                      type="checkbox" 
                      :value="data.selected"
                      :checked="data.selected"  
                      @change="checkChange(data, t)">
                    <label :for="'checkboxId-' + data.id"></label>
                  </div>
                </template>
                <template v-if="head.prop !== 'select'">
                  <div :style="[tableConfig.style.td]">
                    <span 
                      v-if="!head.tooltip"
                      class="td-text" 
                      :style="[tdTextStyle(head, data)]">
                      <i 
                        v-if="head.prop === 'name' && data.children && data.children.length"
                        style="color:#409EFF"
                        :class="'expand-icon iconfont ' + (data.expanded ? 'iconjianhao' : 'iconjiahao')" 
                        @click.stop="expandHandle(data, t)">
                      </i>
                      <i v-if="head.prop === 'name' && (!data.children || !data.children.length)" style="display:inline-block;width:12px;"></i>
                      {{data[head.prop]}}
                    </span>
                    <span 
                      v-else
                      class="td-text text-tooltip" 
                      :data-title="data[head.prop]"
                      :style="[tdTextStyle(head, data)]">
                      <i 
                        v-if="head.prop === 'name' && data.children && data.children.length"
                        style="color:#409EFF"
                        :class="'expand-icon iconfont ' + (data.expanded ? 'iconjianhao' : 'iconjiahao')" 
                        @click.stop="expandHandle(data, t)">
                      </i>
                      <i v-if="head.prop === 'name' && (!data.children || !data.children.length)" style="display:inline-block;width:12px;"></i>
                      {{data[head.prop]}}    
                    </span>
                  </div>
                </template>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
<script type="text/ecmascript-6">
  import './iconfont/font.css'
  export default {
    name: 'relation-table',
    props: {
      config: null, 
      tableHeadList: null, 
      relationList: null
    },
    components: {},
    computed: {
      relationData() {
        return this.relationList || []
      },
      tableData() {
        return this.tableList
      },
      tableHead() {
        return this.tableHeadList || []
      },
      tableConfig() {
        return {
          initExpanded: this.config ? this.config.initExpanded : this.defaultTableData.config.initExpanded,
          tableHeadDragable: this.config ? this.config.tableHeadDragable : this.defaultTableData.config.tableHeadDragable,
          emptyText: this.config ? (this.config.emptyText ? this.config.emptyText : this.defaultTableData.config.emptyText) : this.defaultTableData.config.emptyText,
          style: {
            container: Object.assign(this.defaultTableData.config.style.container, this.config ? (this.config.style ? this.config.style.container : {}) : {}),
            thead: Object.assign(this.defaultTableData.config.style.thead, this.config ? (this.config.style ? this.config.style.thead : {}) : {}),
            tbody: Object.assign(this.defaultTableData.config.style.tbody, this.config ? (this.config.style ? this.config.style.tbody : {}) : {}),
            th: Object.assign(this.defaultTableData.config.style.th, this.config ? (this.config.style ? this.config.style.th : {}) : {}),
            td: Object.assign(this.defaultTableData.config.style.td, this.config ? (this.config.style ? this.config.style.td : {}) : {}),
            empty: Object.assign(this.defaultTableData.config.style.empty, this.config ? (this.config.style ? this.config.style.empty : {}) : {})
          },
          notDragableProp: this.defaultTableData.config.notDragableProp,
          styleKeys: this.defaultTableData.config.styleKeys,
        }
      }
    },
    data() {
      return {
        containerWidth: 0, // 
        tableList: [], // 
        selectedList: [],
        defaultTableData: {
          config: {
            initExpanded: false, 
            tableHeadDragable: true, 
            notDragableProp: ['select'],
            emptyText: '暂无数据',
            styleKeys: [
              'width', 'minWidth', 'textAlign', 'color', 'fontSize', 'position', 
              'top', 'bottom', 'left', 'bottom', 'overflow', 'textOverflow',
              'whiteSpace', 'height', 'lineHeight', 'cursor', 'border',
              'borderRadius', 'boxShadow', 'background', 'fontWeight', 'display',
              'float', 'zIndex', 'backgroundColor', 'padding', 'margin', 
              'paddingLeft', 'paddingRight', 'paddingTop', 'paddingBottom',
              'marignLeft', 'marginRight', 'marginTop', 'marginBottom'
            ],
            style: {
              container: {
                backgroundColor: '#fff',
                border: '1px solid #ebeef5',
                borderRadius: '5px',
                marginTop: '10px',
              },
              empty: {
                height: '60px',
                lineHeight: '60px',
                textAlign: 'center',
                fontSize: '12px',
                color: '#909399'
              },
              thead: {
                height: '40px',
                lineHeight: '40px',
              },
              tbody: {
                height: '40px',
                lineHeight: '40px',
              },
              th: {
                height: '40px',
                lineHeight: '40px',
                color: '#333',
                fontSize: '12px',
                textAlign: 'left',
                borderRight: '1px solid #ebeef5',
                borderBottom: '1px solid #ebeef5'
              },
              td: {
                height: '40px',
                lineHeight: '40px',
                color: '#333',
                fontSize: '12px',
                textAlign: 'left',
                borderRight: '1px solid #ebeef5',
                borderBottom: '1px solid #ebeef5'
              }
            }
          }
        },
        checkedAll: false, // 选中全部
        averageWidth: 0, // 列头平均宽度
        tableHeadDrag: { // 表格拖拽对象
          currentHead: null, // 当前操作的 head
          target: null, // 当前 th 对象
          targetOffsetWidth: 0, // target 对象的 offsetWidth
          oldX: 0, // 开始拖拽的状态
          oldWidth: 0, // 
          offsetWidth: 0, // 当前 head 的 offsetWidth
        },
        mousedown: false,
      }
    },
    created() {},
    mounted() {
      this.$nextTick(_ => {
        let container = document.getElementById('relation-table')
        this.getContainerWidth(container)
      })
    },
    watch: {
      'relationData': function (newValue) {
        this.$set(this, 'tableList', [])
        this.initTableData(newValue)
      }
    },
    methods: {

      // 递归设置 table 数据
      initTableData(list) {
        if (!list || !list.length) {return}
        list.forEach((row, c) => {
          this.$set(row, 'expanded', this.tableConfig.initExpanded)
          this.$set(row, 'selected', false)
          this.$set(row, 'rootRowId', row.rootRowId ? row.rootRowId : row.id)
          this.$set(row, 'showRelation', false)
          this.tableList.push(row)
          if (row.expanded && row.children && row.children.length) {
            row.children.forEach(child => {
              this.$set(row, 'rootRowId', row.rootRowId ? row.rootRowId : row.id)
              this.$set(row, 'showRelation', false)
            })
            this.initTableData(row.children)
          }
        })
      },

      // 鼠标进入 表格主体行 tr
      mouseenterTbodyRowHandle(target) {
        let row = this.getRow(this.relationData, target)
        this.setters(row, 'showRelation', true, 'children')
      },

      // 鼠标离开 表格主体行 tr
      mouseleaveTbodyRowHandle(target) {
        let row = this.getRow(this.relationData, target)
        this.setters(row, 'showRelation', false, 'children')
      },

      // 获取容器宽度(可以用来计算每个col的宽度)
      getContainerWidth(container) {
        if (!container) {return 0}
        this.$set(this, 'containerWidth', parseFloat(this._getStyle(container, 'width')))
        this.setColWidth(this.tableHead, this.containerWidth)
      },

      // 设置 col 的宽度
      setColWidth(thead, containerWidth) {
        if (!thead || !thead.length || !containerWidth) {return 0}
        let width = 0, count = 0
        thead.forEach(th => {
          if (th.width) {
            width += th.width;
            count += 1
          }
        })
        this.$set(this, 'averageWidth', (containerWidth - width) / (thead.length - count))
      },

      // thead 内 th 样式
      theadThStyle(param) {
        return Object.assign(this.tableConfig.style.th, this.setStyleData(param))
      },

      // 设置 style 数据
      setStyleData(data) {
        if (!data) {return {};}
        let style = {}
        for (let key in data) {
          if (this.tableConfig.styleKeys.includes(key)) {
            style[key] = data[key]
          }
        }
        return style
      },

      // 卡片名称按层级左侧缩进距离
      tdTextStyle(head, data) {
        if (head.prop === 'name') {
          return {
            paddingLeft: ((data.level || 1) * 10) + 'px'
          }
        }
        else {
          return {
            paddingLeft: 10 + 'px'
          }
        }
      },

      checkClick() {}, // 复选框父元素点击事件，屏蔽掉行点击事件

      expandClick() {}, // 展开按钮父元素点击事件，屏蔽掉行点击事件

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
          list: this.selectedList,
          getList: function(arr) {
            arr.forEach(item => {
              let noRepeatList = this.list.map(it => {
                return it[noRepeatKey]
              })
              if (item[prop] === value) {
                if (!noRepeatList.includes(item[noRepeatKey])) {
                  this.list.push(item)
                }
              } else {
                let index = noRepeatList.findIndex(id => {
                  return id === item[noRepeatKey]
                })
                if (index !== -1) {
                  this.list.splice(index, 1)
                }
              }
              if (item[key] && item[key].length) {
                this.getList(item[key])
              }
            })
          }
        }
        obj.getList(array)
        return obj.list
      },

      // 递归获取卡片下已展开的(需要收起的)子卡片个数
      childrenLength(row, prop) {
        let obj = {
          length: 0,
          getLength: function(row) {
            row.children.forEach(child => {
              this.length++
              if (prop) {
                if (child.children && child.children.length && child[prop]) {
                  this.getLength(child)
                }
              } else {
                if (child.children && child.children.length) {
                  this.getLength(child)
                }
              }
            })
          }
        }
        obj.getLength(row)
        return obj.length
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
          let tableList = this.tableList
          console.log(tableList, index)
          let obj = {
            index: index,
            foreach: function(row, expanded) {
              row.children.forEach((child, c) => {
                let rowIdList = tableList.map(row => {
                  return row.id
                })
                if (!rowIdList.includes(child.id)) {
                  this.splice(child, (this.index + c), expanded)
                } else {
                  this.index++
                }
                if (child.children && child.children.length) {
                  this.foreach(child, expanded)
                }
              })
            },
            splice: function(row, i, expanded) {
              this.index++
              tableList.splice(this.index, 0, row)
            }
          }
          obj.foreach(row, expanded)
        } else { // 在相对应的位置移除
          this.tableList.splice((index + 1), this.childrenLength(row, 'expanded'));
        }
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
              if (list[i].id === target.id) {
                this.row = list[i]
              }
              else {
                if (list[i].children && list[i].children.length) {
                  this.getter(list[i].children, target)
                }
              }
            }
          }
        }
        obj.getter(list, target)
        return obj.row
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
        this.$set(data, prop, value)
        if (data[key] && data[key].length) {
          data[key].forEach(da => {
            this.setters(da, prop, value, key)
          })
        }
      },

      // 展开按钮点击事件
      /*
        @param     target     Object     被点击展开的卡片对象
        @param     index      Number     卡片对象在tableList中的角标
        @return    undefined
      */
      expandHandle(target, index) {
        let row = this.getRow(this.relationData, target);
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
      checkedAllChange() {
        let target = event.target || event.srcElement
        let selected = target.checked
        let obj = {
          index:0, 
          setIndex: function(i) {
            this.index += i
          }
        }
        this.relationData.forEach((rootRow, r) => {
          if (selected) {
            if (obj.index !== 0) {
              let rowIdList = this.tableList.map(row => {
                return row.id
              })
              if (!rowIdList.includes(rootRow.id)) {
                this.splice(rootRow, obj.index, selected)
              }
              else {
                obj.index++
              }
            }
            this.setTableData(rootRow, obj.index, selected)
            this.setters(rootRow, 'expanded', selected, 'children')
            this.setters(rootRow, 'rootRowId', rootRow.id, 'children')
            this.setters(rootRow, 'showRelation', false, 'children')
            this.setters(rootRow, 'selected', selected, 'children')
            obj.setIndex(this.childrenLength(rootRow))
          } else {
            this.setters(rootRow, 'selected', selected, 'children')
          }
        })
        this.selectedList = this.getters(this.relationData, 'selected', true, 'children', 'id')
        this.$emit('checkedAllChange', this.selectedList)
      },

      // 选中状态改变事件句柄
      checkChange(data, index) {
        let target = event.target || event.srcElement
        let selected = target.checked
        let row = this.getRow(this.relationData, data)
        if (selected) {
          this.setTableData(row, index, true)
          this.setters(row, 'expanded', true, 'children')
          this.setters(row, 'rootRowId', row.id, 'children')
          this.setters(row, 'showRelation', true, 'children')
          this.setters(row, 'selected', true, 'children')
        } else {
          this.setters(row, 'selected', false, 'children')
        }
        this.selectedList = this.getters([row], 'selected', true, 'children', 'id');
        this.$emit('checkChange', this.selectedList);
      },

      // 行点击事件
      rowClickHandle(row) {
        this.$emit('rowClick', row)
      },

      // th 鼠标按下事件
      thMousedownHandle(head, h) {
        if (!this.tableConfig.tableHeadDragable 
            || this.tableConfig.notDragableProp.includes(head.prop) 
            || head.resizable === false) {
          return
        }
        let target = event.target || event.srcElement
        this.$set(this.tableHeadDrag, 'target', target)
        this.$set(this.tableHeadDrag, 'targetOffsetWidth', target.offsetWidth)

        if (event.offsetX > this.tableHeadDrag.targetOffsetWidth - 10) {
          this.$set(this.tableHeadDrag, 'currentHead', this.tableHead[h])
          this.$set(this, 'mousedown', true)
          this.$set(this.tableHeadDrag, 'oldX', event.x)
          this.$set(this.tableHeadDrag, 'oldWidth', this.tableHeadDrag.targetOffsetWidth)
        }
      },

      // th 鼠标移动事件
      thMousemoveHandle(head) {
        if (!this.tableConfig.tableHeadDragable 
            || this.tableConfig.notDragableProp.includes(head.prop) 
            || head.resizable === false) {
          return
        }
        let target = event.target || event.srcElement
        if (event.offsetX > target.offsetWidth - 10) {
          target.style.cursor = 'col-resize'
        } else {
          target.style.cursor = 'default'
        }
        
        if (this.mousedown === true) {
          this.$set(this.tableHeadDrag.target.style, 'cursor', 'default')
          if (this.tableHeadDrag.oldWidth + (event.x - this.tableHeadDrag.oldX) > (this.tableHeadDrag.currentHead.minWidth || 50)) {
            this.$set(this.tableHeadDrag.currentHead, 'width', this.tableHeadDrag.oldWidth + (event.x - this.tableHeadDrag.oldX))
          }
          this.$set(this.tableHeadDrag.target.style, 'cursor', 'col-resize')
          this.tableHead.forEach(head => {
            if (head.prop === this.tableHeadDrag.currentHead.prop) {
              this.$set(head, 'width', this.tableHeadDrag.currentHead.width)
            }
          })
        }
      },

      // table 鼠标抬起事件
      thMouseupHandle() {
        if (!this.tableConfig.tableHeadDragable) {
          return
        }
        if (this.mousedown) {
          this.$emit('cellWidthChange', this.tableHeadDrag.currentHead);
          this.$set(this, 'mousedown', false);
          this.$set(this.tableHeadDrag, 'currentHead', null);
          this.$set(this.tableHeadDrag.target.style, 'cursor', 'default');
          this.$set(this.tableHeadDrag, 'target', null);
          this.$set(this.tableHeadDrag, 'targetOffsetWidth', 0);
          this.$set(this.tableHeadDrag, 'oldX', 0);
          this.$set(this.tableHeadDrag, 'oldWidth', 0);
          this.$set(this.tableHeadDrag, 'offsetWidth', 0);
        }
      },
      // 获取样式
      _getStyle(element,cssPropertyName){
        if (window.getComputedStyle) {
          return window.getComputedStyle(element)[cssPropertyName]
        } else {
          return element.currentStyle[cssPropertyName]
        }
      },
    },
    destroyed () {}
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
  .table__thead .is-row-thead .thead-th .th-text {padding-left: 10px;}
  .table__tbody .tbody-td {position: relative;}
  .table__tbody .is-row-tbody .tbody-td>div {
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
  .table__tbody .tbody-td .expand-icon {font-size: 14px; color:#666;}
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
