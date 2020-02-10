import ResDependence from "./resDependence";
import LoadProgress from "./loadProgress";
import DebugUtil, { DebugKey } from "../debugUtil";
import EventManager, { EventType } from "../eventManager/eventManager";
import MathUtil from "../../common/mathUtil";

class SceneInfo {
    name: string;
    /**场景资源依赖的资源 */
    deps: string[];
    /**在场景中加载的资源 */
    private loadRes: string[];
    constructor(name?: string) {
        this.name = name;
        this.deps = [];
        this.loadRes = [];
    }
    /**设置该场景中加载的资源 */
    setLoadRes(key: string) {
        if (this.loadRes.indexOf(key) === -1)
            this.loadRes.push(key);
    }
    getLoadRes(): string[] {
        return this.loadRes;
    }
    /**清空加载资源的记录 */
    clearLoadRes() {
        this.loadRes = [];
    }
}

export default class ResManager {

    static ins: ResManager = null;

    static init() {
        this.ins = new ResManager();
    }

    private resDependence: ResDependence;
    private loadProgress: LoadProgress;


    private curScene: SceneInfo;
    private lastScene: SceneInfo;

    private constructor() {
        this.resDependence = new ResDependence();
        this.loadProgress = new LoadProgress();
    }

    /****************************************************************************************
    *                                         场景相关                                        *
    ****************************************************************************************/

    /**记录当前场景资源的使用 */
    recordCurSceneResUses() {
        this.lastScene = this.curScene;
        this.curScene = this.getSceneInfo();
        this.recordResDepsAndUseOfScene(this.curScene);
    }

    /**
     * 切换场景
     * @param name 场景名
     * @param onLaunched 成功切换场景回调
     */
    switchScene(name: string, onLaunched?: Function) {
        let self = this;

        this.lastScene = this.curScene;
        this.curScene = new SceneInfo(name);

        cc.director.preloadScene(name, (c, t, i) => {
            let r: number;
            if (c === 0 || t === 0)
                r = 0;
            else
                r = c / t;

            EventManager.ins.sendEvent(EventType.SceneLoadRate, r);
        }, (e, r: cc.SceneAsset) => {
            if (e) {
                console.error(`预加载场景${name}失败。${e}`);
                return;
            }

            finish();
        })

        let finish: Function = () => {
            cc.director.loadScene(name, () => {
                //移除上个场景资源的使用
                self.removeResUseOfScene(self.lastScene);

                //对当前场景建立资源使用与依赖关系
                self.curScene.deps = self.getSceneInfo().deps;
                self.recordResDepsAndUseOfScene(self.curScene);

                //释放空闲资源
                self.releaseIdleRes();

                if (onLaunched)
                    onLaunched();
            });
        }
    }

    /**递归记录依赖和使用  */
    private recordResDepsAndUseOfScene(sI: SceneInfo) {
        let resDeps: string[] = sI.deps;
        let k: string;
        for (k of resDeps)
            this.resDependence.recordDependence(k);
        this.resDependence.recordUse(resDeps, sI.name);
    }

    /**移除使用 */
    private removeResUseOfScene(sI: SceneInfo) {
        let resDeps: string[] = [...sI.getLoadRes(), ...sI.deps];
        this.resDependence.removeUse(resDeps, sI.name);
    }

    /**
     * 得到当前场景直接依赖的资源
     */
    private getSceneInfo(): SceneInfo {
        let sI: SceneInfo = new SceneInfo();
        let _s: any = cc.director.getScene();
        sI.name = _s.name;
        sI.deps = _s.dependAssets;
        return sI;
    }


    /****************************************************************************************
    *                                         加载与得到资源                                   *
    ****************************************************************************************/

    getRes(url: string, type: typeof cc.Asset): any {
        let r = cc.loader.getRes(url, type);
        if (!r)
            console.error(`${url}资源不存在`);
        return r;
    }

    recordUse(asset: cc.Asset, user: string) {
        let key: string = this.resDependence.getCacheKey(asset);
        this.resDependence.recordDependence(key);
        this.resDependence.recordUse(key, user);
    }

    /****************************************************************************************
    *                                         释放资源                                        *
    ****************************************************************************************/

    /**
     * 释放空闲资源，谨慎使用
     */
    releaseIdleRes() {
        let key: string;
        let keys: IterableIterator<string> = this.resDependence.getAllResMapKeys();
        while (key = keys.next().value)
            this.resDependence.releaseResRecursion(key);
    }

    outputCurResNum() {
        let ccloader: any = cc.loader;
        console.log("当前资源数:", MathUtil.lenOfObject(ccloader._cache));
        console.log(cc.director.getScene());
    }

}