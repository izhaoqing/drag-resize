export const adjust = (val: number, range: number[]) => {
    let value = val < range[0] ? range[0] : (val > range[1] ? range[1] : val);
    if (value < range[0]) {
        value = range[0];
    }
    return value;
};

export const round = (obj: Record<string, number>) => {
    Object.keys(obj).forEach(k => {
        obj[k] = Math.round(obj[k]);
    });
    return obj;
};

// 角度转弧度
export const degToRadian = (deg: number) => deg * Math.PI / 180;
export const cos = (deg: number) => Math.cos(degToRadian(deg));
export const sin = (deg: number) => Math.sin(degToRadian(deg));

// 转轴公式：https://baike.baidu.com/item/%E8%BD%AC%E8%BD%B4%E5%85%AC%E5%BC%8F/22777145
export const rotateAxis = (d: number, delta: Record<'x' | 'y', number>) => {
    return {
        x: delta.x * cos(d) + delta.y * sin(d),
        y: -delta.x * sin(d) + delta.y * cos(d),
    };
};
