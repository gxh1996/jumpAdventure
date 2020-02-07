import EventManager, { EventType } from "../eventManager/eventManager";

/**
 * 资源加载进度统计类
 */
export default class LoadProgress {
    private loadResArr: number[] = [];
    /**
     * 指向空记录
     */
    private p: number = 0;

    /**
     * 注册一个资源的加载进度
     */
    registerLoad(): number {
        this.loadResArr[this.p] = 0;
        return this.p++;
    }

    /**
     * 更新该资源的加载进度
     * @param id 资源标识
     * @param completeCount 完成的个数
     * @param total 资源个数
     */
    updateLoadState(id: number, completeCount: number, total: number) {
        if (!total)
            return;

        this.loadResArr[id] = completeCount / total;
        if (this.loadResArr[id] === 1)
            this.loadResArr[id] -= 0.01

        EventManager.ins.sendEvent(EventType.UpdateProgress, this.getloadedRate());
    }

    /**
     * 记录该资源完成加载。防止在加载进度回调中完成所有资源加载导致某些单个资源完成回调在所有资源加载完成回调之后才执行
     */
    completeId(id: number) {
        this.loadResArr[id] = 1;
    }

    /**
     * 是否加载完成
     */
    isLoadComplete(): boolean {
        EventManager.ins.sendEvent(EventType.UpdateProgress, this.getloadedRate());

        let r: boolean = true;
        for (let i = 0; i < this.p; i++)
            if (this.loadResArr[i] !== 1) {
                r = false;
                break;
            }
        return r;
    }

    /**
     * 清除加载记录
     */
    clearRecord() {
        this.p = 0;
    }

    private getloadedRate(): number {
        let sum: number = 0;
        this.loadResArr.forEach((v: number) => {
            sum += v;
        })
        return sum / this.loadResArr.length;
    }
}