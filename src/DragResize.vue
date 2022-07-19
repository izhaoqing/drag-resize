<template>
    <div ref="outerEl" :style="outerStyle" :class="{active}" class="outer" @mousedown.stop>
        <div class="cover"></div>
        <div class="container">
            <div :style="innerStyle" class="content">
                <slot></slot>
            </div>
        </div>
        <div
            v-for="item in handles"
            v-show="active"
            :key="item"
            :class="['handle-' + item]"
            :style="handleStyle[item]"
            class="handler"
            @mousedown.stop.prevent="handleDown(item, $event)"
        ></div>
    </div>
</template>

<script lang="ts" setup>
import { toRef, onUnmounted, ref, watch, onMounted, effectScope, computed } from 'vue';
import type { StyleValue, EffectScope } from 'vue';
import { adjust, cos, sin, rotateAxis, round } from './utils';
import { useHandleStyle, useEventListener } from './composition';

const props = defineProps({
    w: {
        type: Number,
        default: 100,
    },
    h: {
        type: Number,
        default: 100,
    },
    minW: {
        type: Number,
        default: 0,
    },
    minH: {
        type: Number,
        default: 0,
    },
    x: {
        type: Number,
        default: 0,
    },
    y: {
        type: Number,
        default: 0,
    },
    angle: {
        type: Number,
        default: 0,
    },
    scale: {
        type: Number,
        default: 1,
    },
    active: {
        type: Boolean,
        default: false,
    },
    z: {
        type: Number,
        default: 1,
    },
});

const handles = ['tl', 't', 'tr', 'r', 'br', 'b', 'bl', 'l', 'R'];
let operation: 'move' | 'resize' | 'rotate' | '' = '';

const emits = defineEmits(['drag', 'activated', 'resize', 'rotate', 'change']);
const emitChange = (data: Record<string, number>) => {
    const { x, y, w, h, angle } = props;
    emits('change', { x, y, w, h, angle, ...data });
};

const handleStyle = useHandleStyle(toRef(props, 'angle')/* , toRef(props, 'scale') */);

const outerStyle = computed<StyleValue>(() => {
    return {
        width: `${props.w}px`,
        height: `${props.h}px`,
        left: `${props.x}px`,
        top: `${props.y}px`,
        zIndex: props.z,
        transform: `rotate(${props.angle}deg)`,
    };
});

const innerStyle = ref<StyleValue>();
const setInnerStyle = () => {
    innerStyle.value = {
        width: `${props.w}px`,
        height: `${props.h}px`,
    };
};
watch(() => operation === '' && `${props.w}${props.h}`, setInnerStyle);

const outerEl = ref<HTMLElement | null>(null);
const parentEl = ref<HTMLElement | null>(null);
const getParentRect = () => parentEl.value!.getBoundingClientRect();
let parentRect: DOMRect;

onMounted(() => {
    setInnerStyle();
    parentEl.value = outerEl.value!.parentElement;
});

let initialVal: Record<string, number> = {};
const updateInitialVal = (e: MouseEvent) => {
    initialVal = {
        pageX: e.pageX,
        pageY: e.pageY,
        w: props.w,
        h: props.h,
        x: props.x,
        y: props.y,
        angle: props.angle,
        centerX: props.x + props.w / 2,
        centerY: props.y + props.h / 2,
    };
};
let delta = {
    x: 0,
    y: 0,
};
let center = {
    x: 0,
    y: 0,
};
const updateCenter = () => {
    const { left, width, top, height } = outerEl.value!.getBoundingClientRect();
    center = {
        x: left + width / 2,
        y: top + height / 2,
    };
};

const emitDrag = () => {
    const x = delta.x / props.scale + initialVal.x;
    const y = delta.y / props.scale + initialVal.y;
    const { w, h } = props;
    const rect = {
        x: adjust(x, [-props.w / 2, parentRect.width / props.scale - props.w / 2]),
        y: adjust(y, [-props.h / 2, parentRect.height / props.scale - props.h / 2]),
        w,
        h,
    };
    const result = round(rect);
    emits('drag', result);
    emitChange(result);
};

type ElRectType = Record<'x' | 'y' | 'w' | 'h', number>;
type centerDelta = Record<'x' | 'y', number>;
const resizeFn: Record<string, (rect: ElRectType, centerDelta: centerDelta) => void> = {
    t: (rect, centerDelta) => {
        const { h, angle } = initialVal;
        rect.h = -delta.y / props.scale + h;
        rect.h = adjust(rect.h, [props.minH, (props.y + props.h) * 2]);
        const deltaH = rect.h - h;
        centerDelta.x += deltaH / 2 * sin(angle);
        centerDelta.y -= deltaH / 2 * cos(angle);
    },
    l: (rect, centerDelta) => {
        const { w, angle } = initialVal;
        rect.w = -delta.x / props.scale + w;
        rect.w = adjust(rect.w, [props.minW, (props.x + props.w) * 2]);
        const deltaW = rect.w - w;
        centerDelta.x -= deltaW / 2 * cos(angle);
        centerDelta.y -= deltaW / 2 * sin(angle);
    },
    b: (rect, centerDelta) => {
        const { h, angle } = initialVal;
        rect.h = delta.y / props.scale + h;
        rect.h = adjust(rect.h, [props.minH, (parentRect.height / props.scale - props.y) * 2]);
        const deltaH = rect.h - h;
        centerDelta.x -= deltaH / 2 * sin(angle);
        centerDelta.y += deltaH / 2 * cos(angle);
    },
    r: (rect, centerDelta) => {
        const { w, angle } = initialVal;
        rect.w = delta.x / props.scale + w;
        rect.w = adjust(rect.w, [props.minW, (parentRect.width / props.scale - props.x) * 2]);
        const deltaW = rect.w - w;
        centerDelta.x += deltaW / 2 * cos(angle);
        centerDelta.y += deltaW / 2 * sin(angle);
    },
};

let currentHandle = '';
const emitResize = () => {
    const { x, y, w, h, angle } = initialVal;
    const rect = { x, y, w, h };
    const direction = currentHandle.split('');

    delta = rotateAxis(angle, delta);

    // 中心点变化量
    const centerDelta = { x: 0, y: 0 };
    direction.forEach(k => resizeFn[k](rect, centerDelta));
    const centerX = initialVal.centerX + centerDelta.x;
    const centerY = initialVal.centerY + centerDelta.y;
    // todo
    if (centerX < 0 || centerX > parentRect.width / props.scale) return;
    if (centerY < 0 || centerY > parentRect.height / props.scale) return;
    rect.x = centerX - rect.w / 2;
    rect.y = centerY - rect.h / 2;

    const result = round(rect);
    emits('resize', result);
    emitChange(result);
};

let scope: EffectScope;
const addScope = () => {
    scope?.stop();
    scope = effectScope();
    scope.run(() => {
        useEventListener(document, 'mousemove', (e: MouseEvent) => {
            e.preventDefault();
            delta = {
                x: e.pageX - initialVal.pageX,
                y: e.pageY - initialVal.pageY,
            };
            if (operation === 'move') {
                emitDrag();
            } else if (operation === 'resize') {
                emitResize();
            } else {
                let angle = Math.atan2(e.pageY - center.y, e.pageX - center.x) * 180 / Math.PI + 90;
                if (angle < 0) {
                    angle = 360 + angle;
                }
                const result = Math.round(angle);
                emits('rotate', result);
                emitChange({ angle: result });
            }
        });
        useEventListener(document, 'mouseup', () => {
            operation = '';
            scope?.stop();
            setInnerStyle();
        });
    });
};
onUnmounted(() => {
    scope?.stop();
});

useEventListener(outerEl, 'mousedown', (e: MouseEvent) => {
    addScope();
    emits('activated');
    parentRect = getParentRect();
    updateInitialVal(e);
    operation = 'move';
    e.preventDefault();
});

const handleDown = (handle: string, e: MouseEvent) => {
    addScope();
    updateInitialVal(e);
    e.preventDefault();

    if (handle === 'R') {
        operation = 'rotate';
        updateCenter();
    } else {
        operation = 'resize';
        currentHandle = handle;
        parentRect = getParentRect();
    }
};

</script>

<style scoped lang="less">
.outer {
    position: absolute;
}
.outer:hover::before,
.outer.active::before {
    position: absolute;
    width: 100%;
    height: 100%;
    outline: 1px dashed #d6d6d6;
    left: 0;
    top: 0;
    box-sizing: border-box;
    content: '';
}
.cover {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    cursor: move;
    z-index: 2;
}
.container {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    z-index: 1;
    pointer-events: none;
}
.handler {
    position: absolute;
    box-sizing: border-box;
    background: #1F76E5;
    border: 2px solid #fff;
    z-index: 3;
}
.handle-t {
    background: #fff;
}
.handle-R {
    background: #3d79ff url('./rotate.png') no-repeat center center / 16px 16px;
}
.handle-R::after {
    top: 100%;
    left: 50%;
    width: 2px;
    height: 9px;
    background-color: #fff;
    pointer-events: none;
    content: '';
}
</style>
