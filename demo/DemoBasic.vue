<template>
    <div class="h-400px relative border-1px border-#eee rounded-3px">
        <drag-resize
            v-bind="info"
            rotatable
            parent
            :active="active"
            @activated="updateCurrentCom"
            @change="handleChange"
        >
        </drag-resize>
    </div>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue';

interface Rect {
    x: number;
    y: number;
    w: number;
    h: number;
    angle: number;
}

const active = ref(false);
const info = reactive({
    w: 100,
    h: 100,
    z: 1,
    x: 0,
    y: 0,
    angle: 0,
    active: false,
});

const updateCurrentCom = () => {
    active.value = true;
};
const handleChange = (rect: Rect) => {
    info.x = rect.x;
    info.y = rect.y;
    info.w = rect.w;
    info.h = rect.h;
    info.angle = rect.angle;
};
</script>

<style scoped lang="less">
</style>
