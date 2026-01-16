import Mock from 'mockjs'
import { SUCCESS_CODE } from '@/constants'
import { toAnyString } from '@/utils'

const timeout = 1000

const adminList = [
  {
    path: '/custom-page',
    component: '#',
    name: '用户自定义页面',
    meta: {
      title: 'FFMPEG',
      icon: 'vi-cib:telegram-plane'
    },
    children: [
      {
        path: 'custom-seal-generator',
        component: 'views/CustomSealGenerator/SealGenerator',
        name: 'CustomSealGenerator',
        meta: {
          title: '印章生成大师',
          icon: 'vi-cib:telegram-plane'
        }
      },
    ]
  },
  {
    path: '/custom-powerful-video-player',
    component: '#',
    name: '用户视频播放器',
    meta: {
      title: 'FFMPEG',
      icon: 'vi-cib:telegram-plane'
    },
    children: [
      {
        path: 'custom-seal-generator',
        component: 'views/CustomPowerfulVideoPlayer/VideoPlayerPage',
        name: 'CustomPowerfulVideoPlayer',
        meta: {
          title: '视频播放器',
          icon: 'vi-cib:telegram-plane'
        }
      },
    ]
  },
  {
    path: '/dashboard',
    component: '#',
    redirect: '/dashboard/analysis',
    name: 'Dashboard',
    meta: {
      title: '首页',
      icon: 'vi-ant-design:dashboard-filled',
      alwaysShow: true
    },
    children: [
      {
        path: 'analysis',
        component: 'views/Dashboard/Analysis',
        name: 'Analysis',
        meta: {
          title: '分析页',
          noCache: true,
          affix: true
        }
      },
      {
        path: 'workplace',
        component: 'views/Dashboard/Workplace',
        name: 'Workplace',
        meta: {
          title: '工作台',
          noCache: true,
          affix: true
        }
      }
    ]
  },
  {
    path: '/ffmpeg',
    component: '#',
    name: 'FFMPEG',
    meta: {
      title: 'FFMPEG',
      icon: 'vi-cib:telegram-plane'
    },
    children: [
      {
        path: 'cropper-demo',
        component: 'views/Ffmpeg/CropperDemo',
        name: 'CropperDemo',
        meta: {
          title: 'Cropper裁剪示例',
        }
      },
      {
        path: 'ffmpeg-demo',
        component: 'views/Guide/Guide',
        name: 'CuptureDemo',
        meta: {
          title: 'Ffmpeg示例',
        }
      }
    ]
  },
  {
    path: '/hooks',
    component: '#',
    redirect: '/hooks/useWatermark',
    name: 'Hooks',
    meta: {
      title: 'hooks',
      icon: 'vi-ic:outline-webhook',
      alwaysShow: true
    },
    children: [
      {
        path: 'useWatermark',
        component: 'views/hooks/useWatermark',
        name: 'UseWatermark',
        meta: {
          title: 'useWatermark'
        }
      },
      {
        path: 'useTagsView',
        component: 'views/hooks/useTagsView',
        name: 'UseTagsView',
        meta: {
          title: 'useTagsView'
        }
      },
      {
        path: 'useValidator',
        component: 'views/hooks/useValidator',
        name: 'UseValidator',
        meta: {
          title: 'useValidator'
        }
      },
      {
        path: 'useCrudSchemas',
        component: 'views/hooks/useCrudSchemas',
        name: 'UseCrudSchemas',
        meta: {
          title: 'useCrudSchemas'
        }
      },
      {
        path: 'useClipboard',
        component: 'views/hooks/useClipboard',
        name: 'UseClipboard',
        meta: {
          title: 'useClipboard'
        }
      },
    ]
  },
  {
    path: '/error',
    component: '#',
    redirect: '/error/404',
    name: 'Error',
    meta: {
      title: '错误页面',
      icon: 'vi-ci:error',
      alwaysShow: true
    },
    children: [
      {
        path: '404-demo',
        component: 'views/Error/404',
        name: '404Demo',
        meta: {
          title: '404'
        }
      },
      {
        path: '403-demo',
        component: 'views/Error/403',
        name: '403Demo',
        meta: {
          title: '403'
        }
      },
      {
        path: '500-demo',
        component: 'views/Error/500',
        name: '500Demo',
        meta: {
          title: '500'
        }
      }
    ]
  },
  {
    path: '/authorization',
    component: '#',
    redirect: '/authorization/user',
    name: 'Authorization',
    meta: {
      title: '权限管理',
      icon: 'vi-eos-icons:role-binding',
      alwaysShow: true
    },
    children: [
      {
        path: 'department',
        component: 'views/Authorization/Department/Department',
        name: 'Department',
        meta: {
          title: '部门管理'
        }
      },
      {
        path: 'user',
        component: 'views/Authorization/User/User',
        name: 'User',
        meta: {
          title: '用户管理'
        }
      },
      {
        path: 'menu',
        component: 'views/Authorization/Menu/Menu',
        name: 'Menu',
        meta: {
          title: '菜单管理'
        }
      },
      {
        path: 'role',
        component: 'views/Authorization/Role/Role',
        name: 'Role',
        meta: {
          title: '角色管理'
        }
      }
    ]
  }
]

const testList: string[] = [
  '/dashboard',
  '/dashboard/analysis',
  '/dashboard/workplace',
  'external-link',
  'https://element-plus-admin-doc.cn/',
  '/guide',
  '/guide/index',
  '/hooks',
  '/hooks/useWatermark',
  '/hooks/useTagsView',
  '/hooks/useValidator',
  '/hooks/useCrudSchemas',
  '/hooks/useClipboard',
  '/authorization',
  '/authorization/department',
  '/authorization/user',
  '/authorization/role',
  '/authorization/menu',
  '/error',
  '/error/404-demo',
  '/error/403-demo',
  '/error/500-demo'
]

const List: any[] = []

const roleNames = ['超级管理员', '管理员', '普通用户', '游客']
const menus = [
  [
    {
      path: '/dashboard',
      component: '#',
      redirect: '/dashboard/analysis',
      name: 'Dashboard',
      status: Mock.Random.integer(0, 1),
      id: 1,
      meta: {
        title: '首页',
        icon: 'vi-ant-design:dashboard-filled',
        alwaysShow: true
      },
      children: [
        {
          path: 'analysis',
          component: 'views/Dashboard/Analysis',
          name: 'Analysis',
          status: Mock.Random.integer(0, 1),
          id: 2,
          meta: {
            title: '分析页',
            noCache: true
          }
        },
        {
          path: 'workplace',
          component: 'views/Dashboard/Workplace',
          name: 'Workplace',
          status: Mock.Random.integer(0, 1),
          id: 3,
          meta: {
            title: '工作台',
            noCache: true
          }
        }
      ]
    },
    {
      path: '/external-link',
      component: '#',
      meta: {
        title: '文档',
        icon: 'vi-clarity:document-solid'
      },
      name: 'ExternalLink',
      status: Mock.Random.integer(0, 1),
      id: 4,
      children: [
        {
          path: 'https://element-plus-admin-doc.cn/',
          name: 'DocumentLink',
          status: Mock.Random.integer(0, 1),
          id: 5,
          meta: {
            title: '文档'
          }
        }
      ]
    },
    {
      path: '/example',
      component: '#',
      redirect: '/example/example-dialog',
      name: 'Example',
      status: Mock.Random.integer(0, 1),
      id: 12,
      meta: {
        title: '综合示例',
        icon: 'vi-ep:management',
        alwaysShow: true
      },
      children: [
        {
          path: 'example-dialog',
          component: 'views/Example/Dialog/ExampleDialog',
          name: 'ExampleDialog',
          status: Mock.Random.integer(0, 1),
          id: 13,
          permission: ['edit', 'add', 'delete'],
          meta: {
            title: '综合示例-弹窗',
            permission: ['edit', 'add', 'delete']
          }
        },
        {
          path: 'example-page',
          component: 'views/Example/Page/ExamplePage',
          name: 'ExamplePage',
          status: Mock.Random.integer(0, 1),
          id: 14,
          permission: ['edit', 'add', 'delete'],
          meta: {
            title: '综合示例-页面',
            permission: ['edit', 'add', 'delete']
          }
        },
        {
          path: 'example-add',
          component: 'views/Example/Page/ExampleAdd',
          name: 'ExampleAdd',
          status: Mock.Random.integer(0, 1),
          id: 15,
          permission: ['edit', 'add', 'delete'],
          meta: {
            title: '综合示例-新增',
            noTagsView: true,
            noCache: true,
            hidden: true,
            showMainRoute: true,
            activeMenu: '/example/example-page',
            permission: ['edit', 'add', 'delete']
          }
        },
        {
          path: 'example-edit',
          component: 'views/Example/Page/ExampleEdit',
          name: 'ExampleEdit',
          status: Mock.Random.integer(0, 1),
          id: 16,
          permission: ['edit', 'add', 'delete'],
          meta: {
            title: '综合示例-编辑',
            noTagsView: true,
            noCache: true,
            hidden: true,
            showMainRoute: true,
            activeMenu: '/example/example-page',
            permission: ['edit', 'add', 'delete']
          }
        },
        {
          path: 'example-detail',
          component: 'views/Example/Page/ExampleDetail',
          name: 'ExampleDetail',
          status: Mock.Random.integer(0, 1),
          id: 17,
          permission: ['edit', 'add', 'delete'],
          meta: {
            title: '综合示例-详情',
            noTagsView: true,
            noCache: true,
            hidden: true,
            showMainRoute: true,
            activeMenu: '/example/example-page',
            permission: ['edit', 'add', 'delete']
          }
        }
      ]
    }
  ],
  [
    {
      path: '/dashboard',
      component: '#',
      redirect: '/dashboard/analysis',
      name: 'Dashboard',
      status: Mock.Random.integer(0, 1),
      id: 1,
      meta: {
        title: '首页',
        icon: 'vi-ant-design:dashboard-filled',
        alwaysShow: true
      },
      children: [
        {
          path: 'analysis',
          component: 'views/Dashboard/Analysis',
          name: 'Analysis',
          status: Mock.Random.integer(0, 1),
          id: 2,
          meta: {
            title: '分析页',
            noCache: true
          }
        },
        {
          path: 'workplace',
          component: 'views/Dashboard/Workplace',
          name: 'Workplace',
          status: Mock.Random.integer(0, 1),
          id: 3,
          meta: {
            title: '工作台',
            noCache: true
          }
        }
      ]
    }
  ],
  [
    {
      path: '/external-link',
      component: '#',
      meta: {
        title: '文档',
        icon: 'vi-clarity:document-solid'
      },
      name: 'ExternalLink',
      status: Mock.Random.integer(0, 1),
      id: 4,
      children: [
        {
          path: 'https://element-plus-admin-doc.cn/',
          name: 'DocumentLink',
          status: Mock.Random.integer(0, 1),
          id: 5,
          meta: {
            title: '文档'
          }
        }
      ]
    },
  ],
  [
    {
      path: '/example',
      component: '#',
      redirect: '/example/example-dialog',
      name: 'Example',
      status: Mock.Random.integer(0, 1),
      id: 12,
      meta: {
        title: '综合示例',
        icon: 'vi-ep:management',
        alwaysShow: true
      },
      children: [
        {
          path: 'example-detail',
          component: 'views/Example/Page/ExampleDetail',
          name: 'ExampleDetail',
          status: Mock.Random.integer(0, 1),
          id: 17,
          permission: ['edit', 'add', 'delete'],
          meta: {
            title: '综合示例-详情',
            noTagsView: true,
            noCache: true,
            hidden: true,
            showMainRoute: true,
            activeMenu: '/example/example-page',
            permission: ['edit', 'add', 'delete']
          }
        }
      ]
    }
  ]
]

for (let i = 0; i < 4; i++) {
  List.push(
    Mock.mock({
      id: toAnyString(),
      // timestamp: +Mock.Random.date('T'),
      roleName: roleNames[i],
      role: '@first',
      status: Mock.Random.integer(0, 1),
      createTime: '@datetime',
      remark: '@cword(10, 15)',
      menu: menus[i]
    })
  )
}

export default [
  // 列表接口
  {
    url: '/mock/role/list',
    method: 'get',
    timeout,
    response: () => {
      return {
        code: SUCCESS_CODE,
        data: adminList
      }
    }
  },
  {
    url: '/mock/role/table',
    method: 'get',
    timeout,
    response: () => {
      return {
        code: SUCCESS_CODE,
        data: {
          list: List,
          total: 4
        }
      }
    }
  },
  // 列表接口
  {
    url: '/mock/role/list2',
    method: 'get',
    timeout,
    response: () => {
      return {
        code: SUCCESS_CODE,
        data: testList
      }
    }
  },
  {
    url: '/mock/role/table',
    method: 'get',
    timeout,
    response: () => {
      return {
        code: SUCCESS_CODE,
        data: {
          list: List,
          total: 4
        }
      }
    }
  }
]
