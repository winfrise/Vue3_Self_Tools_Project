<script setup lang="ts">
import { ContentWrap } from '@/components/ContentWrap'
import { Avatars, AvatarItem } from '@/components/Avatars'
import { ref } from 'vue'


const data = ref<AvatarItem[]>([
  {
    name: 'Lily',
    url: 'https://avatars.githubusercontent.com/u/3459374?v=4'
  },
  {
    name: 'Amanda',
    url: 'https://avatars.githubusercontent.com/u/3459375?v=4'
  },
  {
    name: 'Daisy',
    url: 'https://avatars.githubusercontent.com/u/3459376?v=4'
  },
  {
    name: 'Olivia',
    url: 'https://avatars.githubusercontent.com/u/3459377?v=4'
  },
  {
    name: 'Tina',
    url: 'https://avatars.githubusercontent.com/u/3459378?v=4'
  },
  {
    name: 'Kitty',
    url: 'https://avatars.githubusercontent.com/u/3459323?v=4'
  },
  {
    name: 'Helen',
    url: 'https://avatars.githubusercontent.com/u/3459324?v=4'
  },
  {
    name: 'Sophia',
    url: 'https://avatars.githubusercontent.com/u/3459325?v=4'
  },
  {
    name: 'Wendy',
    url: 'https://avatars.githubusercontent.com/u/3459326?v=4'
  }
])
</script>

<template>
  <ContentWrap title="头像列表" message="头像列表组件，基于element-plus的Avatar组件二次封装">
    <Avatars :data="data" />
  </ContentWrap>
</template>
