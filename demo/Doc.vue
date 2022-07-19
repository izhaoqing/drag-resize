<template>
    <div>
        <h1>Drag-Resize</h1>
        <p>一个基于 Vue3 的可拖拽可缩放可旋转的组件。</p>
        <h2><a id="features" href="#features">#</a> 特性</h2>
        <ul>
            <li>不错的性能，支持同时使用大量拖拽组件</li>
            <li>受控组件，使用更加灵活</li>
            <li>支持宽高限制、范围限制</li>
            <li>支持和父级保持相同的缩放比例</li>
        </ul>
        <demo-basic></demo-basic>
    </div>
</template>

<script lang="ts" setup>
import DemoBasic from './DemoBasic.vue';
</script>

<style scoped>
</style>
