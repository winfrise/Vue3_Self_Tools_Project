import { SUCCESS_CODE } from '@/constants'
import { MockMethod } from 'vite-plugin-mock'

const timeout = 1000

export default [
  // 分析页统计接口
  {
    url: '/mock/analysis/total',
    method: 'get',
    timeout,
    response: () => {
      return {
        code: SUCCESS_CODE,
        data: {
          users: 102400,
          messages: 81212,
          moneys: 9280,
          shoppings: 13600
        }
      }
    }
  },
  // 用户来源
  {
    url: '/mock/analysis/userAccessSource',
    method: 'get',
    timeout,
    response: () => {
      return {
        code: SUCCESS_CODE,
        data: [
          { value: 1000, name: 'directAccess', cname: '直接访问' }, // 直接访问
          { value: 310, name: 'mailMarketing', cname: '邮件营销' }, //  邮件营销
          { value: 234, name: 'allianceAdvertising', cname: '联盟广告' }, // 联盟广告
          { value: 135, name: 'videoAdvertising', cname: '视频广告'}, // 视频广告
          { value: 1548, name: 'searchEngines', cname: '搜索引擎' } // 搜索引擎
        ]
      }
    }
  },
  // 每周用户活跃量
  {
    url: '/mock/analysis/weeklyUserActivity',
    method: 'get',
    timeout,
    response: () => {
      return {
        code: SUCCESS_CODE,
        data: [
          { value: 13253, name: 'monday', cname: '周一' },
          { value: 34235, name: 'tuesday', cname: '周二' },
          { value: 26321, name: 'wednesday', cname: '周三' },
          { value: 12340, name: 'thursday', cname: '周四' },
          { value: 24643, name: 'friday',cname: '周五' },
          { value: 1322, name: 'saturday', cname: '周六' },
          { value: 1324, name: 'sunday', cname: '周日' }
        ]
      }
    }
  },
  // 每月销售额
  {
    url: '/mock/analysis/monthlySales',
    method: 'get',
    timeout,
    response: () => {
      return {
        code: SUCCESS_CODE,
        data: [
          { estimate: 100, actual: 120, name: 'analysis.january', cname: '预计' },
          { estimate: 120, actual: 82, name: 'analysis.february', cname: '二月' },
          { estimate: 161, actual: 91, name: 'analysis.march', cname: '三月' },
          { estimate: 134, actual: 154, name: 'analysis.april', cname: '四月' },
          { estimate: 105, actual: 162, name: 'analysis.may', cname: '五月' },
          { estimate: 160, actual: 140, name: 'analysis.june', cname: '六月' },
          { estimate: 165, actual: 145, name: 'analysis.july', cname: '七月' },
          { estimate: 114, actual: 250, name: 'analysis.august', cname: '八月' },
          { estimate: 163, actual: 134, name: 'analysis.september', cname: '九月' },
          { estimate: 185, actual: 56, name: 'analysis.october', cname: '十月' },
          { estimate: 118, actual: 99, name: 'analysis.november', cname: '十一月' },
          { estimate: 123, actual: 123, name: 'analysis.december', cname: '十二月' }
        ]
      }
    }
  }
] as MockMethod[]
