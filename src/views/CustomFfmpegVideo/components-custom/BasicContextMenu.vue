<template>
  <el-dropdown
    ref="elDropdownMenuRef"
    trigger="contextmenu"
    placement="bottom-start"
  >
    <slot></slot>
    <template #dropdown>
      <el-dropdown-menu>
        <slot name="menu" />
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>
