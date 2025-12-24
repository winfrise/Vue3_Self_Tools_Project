import { SUCCESS_CODE } from '@/constants'

const timeout = 1000

export default [
  // 获取统计
  {
    url: '/mock/workplace/total',
    method: 'get',
    timeout,
    response: () => {
      return {
        code: SUCCESS_CODE,
        data: {
          project: 40,
          access: 2340,
          todo: 10
        }
      }
    }
  },
  // 获取项目
  {
    url: '/mock/workplace/project',
    method: 'get',
    timeout,
    response: () => {
      return {
        code: SUCCESS_CODE,
        data: [
          {
            name: 'Github',
            icon: 'akar-icons:github-fill',
            message: '一个正经的介绍',
            personal: 'Archer',
            time: new Date()
          },
          {
            name: 'Vue',
            icon: 'logos:vue',
            message: '一个正经的介绍',
            personal: 'Archer',
            time: new Date()
          },
          {
            name: 'Angular',
            icon: 'logos:angular-icon',
            message: '一个正经的介绍',
            personal: 'Archer',
            time: new Date()
          },
          {
            name: 'React',
            icon: 'logos:react',
            message: '一个正经的介绍',
            personal: 'Archer',
            time: new Date()
          },
          {
            name: 'Webpack',
            icon: 'logos:webpack',
            message: '一个正经的介绍',
            personal: 'Archer',
            time: new Date()
          },
          {
            name: 'Vite',
            icon: 'vscode-icons:file-type-vite',
            message: '一个正经的介绍',
            personal: 'Archer',
            time: new Date()
          }
        ]
      }
    }
  },
  // 获取动态
  {
    url: '/mock/workplace/dynamic',
    method: 'get',
    timeout,
    response: () => {
      return {
        code: SUCCESS_CODE,
        data: [
          {
            message: 'Archer 推送 代码到 Github',
            time: new Date()
          },
          {
            message: 'Archer 推送 代码到 Github',
            time: new Date()
          },
          {
            message: 'Archer 推送 代码到 Github',
            time: new Date()
          },
          {
            message: 'Archer 推送 代码到 Github',
            time: new Date()
          },
          {
            message: 'Archer 推送 代码到 Github',
            time: new Date()
          },
          {
            message: 'Archer 推送 代码到 Github',
            time: new Date()
          }
        ]
      }
    }
  },
  // 获取团队信息
  {
    url: '/mock/workplace/team',
    method: 'get',
    timeout,
    response: () => {
      return {
        code: SUCCESS_CODE,
        data: [
          {
            name: 'Github',
            icon: 'akar-icons:github-fill'
          },
          {
            name: 'Vue',
            icon: 'logos:vue'
          },
          {
            name: 'Angular',
            icon: 'logos:angular-icon'
          },
          {
            name: 'React',
            icon: 'logos:react'
          },
          {
            name: 'Webpack',
            icon: 'logos:webpack'
          },
          {
            name: 'Vite',
            icon: 'vscode-icons:file-type-vite'
          }
        ]
      }
    }
  },
  // 获取指数
  {
    url: '/mock/workplace/radar',
    method: 'get',
    timeout,
    response: () => {
      return {
        code: SUCCESS_CODE,
        data: [
          { name: 'quote', cname: '引用', max: 65, personal: 42, team: 50 },
          { name: 'contribution', cname: '贡献', max: 160, personal: 30, team: 140 },
          { name: 'hot', cname: '热度', max: 300, personal: 20, team: 28 },
          { name: 'yield', cname: '产量', max: 130, personal: 35, team: 35 },
          { name: 'follow', cname: '关注', max: 100, personal: 80, team: 90 }
        ]
      }
    }
  }
]