
import Mock from "mockjs"
const Random = Mock.Random

const nameList = "卡片1,卡片2,卡片3,卡片4,卡片5,卡片6,卡片7,卡片8,卡片9".split(',')

const typeList ='需求,任务,缺陷,用例'.split(',')

const stateList ='未开始,进行中,已完成'.split(',')

const levelList ='低,中,高'.split(',')

const importanceList ='一般,重要,紧急'.split(',')

const receiverList ='张三,李四,王五,赵六,刘七'.split(',')

var template = {
  'id': () => 'card' + Random.natural(100, 999) + Random.character('rel') + Random.character('rel'),
  'name':() => Random.ctitle(5, 10),
  'type':() => Random.pick(typeList),
  'state':() => Random.pick(stateList),
  'createTime': () => Random.date('yyyy-MM-dd'),
  'level': () => Random.pick(levelList),
  'importance': () => Random.pick(importanceList),
  'receiver': () => Random.pick(receiverList),
  'createUserName': () => Random.pick(receiverList),
  'children': () => []
}

function mockData(nums) {
  let list = []
  for (let i = 0, j = Random.natural(nums, nums); i < j; i++) {list.push(Mock.mock(template))}
  return list
}

export { mockData }