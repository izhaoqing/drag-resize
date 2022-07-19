<template>
    <div class="flex items-stretch w-1200px m-x-auto">
        <Doc class="flex-1 h-2000px mr-20px"></Doc>
        <div class="w-200px">
            <n-anchor
                affix
                listen-to="#app"
                :trigger-top="24"
                :top="88"
                :bound="24"
            >
                <n-anchor-link title="基础用法" href="#features"></n-anchor-link>
                <n-anchor-link title="忽略间隔" href="#ignore-gap"></n-anchor-link>
                <n-anchor-link title="固定" href="#affix"></n-anchor-link>
                <n-anchor-link title="滚动到" href="#scrollto"></n-anchor-link>
                <n-anchor-link title="Props" href="#Props"></n-anchor-link>
            </n-anchor>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { NAnchor, NAnchorLink } from 'naive-ui';
import Doc from './Doc.vue';
</script>

<style scoped lang="less">
</style>
