import { computed, unref, getCurrentScope, onScopeDispose, watch } from 'vue';
import type { Ref, ComputedRef, StyleValue } from 'vue';

const cursor = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];
export const useHandleStyle: (angle: Ref<number>, scaleRatio?: Ref<number>) => ComputedRef<Record<string, StyleValue>> = (angle, scaleRatio) => {
    return computed(() => {
        const ratio = 1 / (unref(scaleRatio) || 1);
        const styleMap: Record<string, any> = {
            tl: {
                width: `${20 * ratio}px`,
                height: `${20 * ratio}px`,
                borderRadius: '50%',
                top: `${-20 * ratio / 2}px`,
                left: `${-20 * ratio / 2}px`,
            },
            t: {
                width: `${16 * ratio}px`,
                height: `${6 * ratio}px`,
                borderRadius: `${12 * ratio}px`,
                left: `calc(50% - ${16 * ratio / 2}px)`,
                top: `${-6 * ratio / 2}px`,
            },
            tr: {
                width: `${20 * ratio}px`,
                height: `${20 * ratio}px`,
                borderRadius: '50%',
                top: `${-20 * ratio / 2}px`,
                right: `${-20 * ratio / 2}px`,
            },
            r: {
                width: `${12 * ratio}px`,
                height: `${32 * ratio}px`,
                borderRadius: `${12 * ratio}px`,
                top: `calc(50% - ${32 * ratio / 2}px)`,
                right: `${-12 * ratio / 2}px`,
            },
            br: {
                width: `${20 * ratio}px`,
                height: `${20 * ratio}px`,
                borderRadius: '50%',
                bottom: `${-20 * ratio / 2}px`,
                right: `${-20 * ratio / 2}px`,
            },
            b: {
                width: `${32 * ratio}px`,
                height: `${12 * ratio}px`,
                borderRadius: `${12 * ratio}px`,
                left: `calc(50% - ${32 * ratio / 2}px)`,
                bottom: `${-12 * ratio / 2}px`,
            },
            bl: {
                width: `${20 * ratio}px`,
                height: `${20 * ratio}px`,
                borderRadius: '50%',
                bottom: `${-20 * ratio / 2}px`,
                left: `${-20 * ratio / 2}px`,
            },
            l: {
                width: `${12 * ratio}px`,
                height: `${32 * ratio}px`,
                borderRadius: `${12 * ratio}px`,
                top: `calc(50% - ${32 * ratio / 2}px)`,
                left: `${-12 * ratio / 2}px`,
            },
            R: {
                width: `${28 * ratio}px`,
                height: `${28 * ratio}px`,
                borderRadius: '50%',
                left: `calc(50% - ${28 * ratio / 2}px)`,
                top: `${-28 * ratio - 10}px`,
                cursor: 'pointer',
            },
        };
        // 旋转后改变光标类型
        const offset = Math.floor((angle.value + 45 / 2) / 45);
        Object.values(styleMap).forEach((v, i) => {
            const index = (i + offset) % 8;
            if (cursor[i]) {
                v.cursor = `${cursor[index]}-resize`;
            }
        });
        return styleMap;
    });
};

const noop = () => {};
type MaybeRef<T> = Ref<T> | T;
export const useEventListener = (target: MaybeRef<EventTarget | null>, event: string, listener: (ev: any) => void) => {
    if (!target) return;
    let cleanup = noop;
    const stopWatch = watch(
        () => unref(target),
        el => {
            cleanup();
            if (!el) return;
            el.addEventListener(event, listener);
            cleanup = () => {
                el.removeEventListener(event, listener);
                cleanup = noop;
            };
        },
        { immediate: true, flush: 'post' },
    );
    const stop = () => {
        stopWatch();
        cleanup();
    };
    if (getCurrentScope()) {
        onScopeDispose(stop);
    }
};
