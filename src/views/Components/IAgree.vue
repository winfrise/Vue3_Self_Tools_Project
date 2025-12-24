<script setup lang="ts">
import { ContentWrap } from '@/components/ContentWrap'
import { IAgree } from '@/components/IAgree'

</script>

<template>
  <ContentWrap title="我同意">
    <IAgree
      :link="[
        {
          text: '《隐私政策》',
          url: 'https://www.baidu.com'
        }
      ]"
      text="我同意《隐私政策》"
    />
  </ContentWrap>
</template>
