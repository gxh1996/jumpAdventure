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

/**
 * 任务里得一项
 */
interface TaskItem {
    /**
     * 资源类型
     */
    type: string;
    /**
     * 资源路径
     */
    urls: string[];
}

/**
 * 任务对象
//  */
interface TaskObj {
    [anykey: string]: TaskItem[];
}


export default class ResManager {

    static ins: ResManager = null;

    static init(resListUrl: string) {
        this.ins = new ResManager(resListUrl);
    }

    private resDependence: ResDependence;
    /**
    * 每个任务要加载的资源,{任务名：[{type:资源类型,urls:[url,...]},...]}
    */
    private taskResUrls: TaskObj;
    private loadProgress: LoadProgress;
    private callback: Function = null;


    private curScene: SceneInfo;
    private lastScene: SceneInfo;

    private constructor(url: string) {
        let self = this;

        this.resDependence = new ResDependence();
        this.loadProgress = new LoadProgress();

        this.loadRes(url, cc.JsonAsset, "resManager", null, () => {
            self.taskResUrls = this.getRes(url, cc.JsonAsset).json;
            DebugUtil.ins.log(DebugKey.GameLogic, `资源列表${url}加载完成`);
            EventManager.ins.sendEvent(EventType.LoadTaskResListComplete);
        })
    }

    /****************************************************************************************
    *                                         场景相关                                        *
    ****************************************************************************************/

    /**
     * 建立首场景的资源依赖关系并加载首场景资源(仅游戏启动时进行)
     * @param task 任务名
     * @param completeCallback 任务加载完成回调
     */
    initFirstScene(task?: string, completeCallback?: Function) {
        let self = this;
        this.curScene = this.getSceneResDeps();

        let finish: Function = () => {
            self.recordResDepsAndUseOfScene(self.curScene);

            if (completeCallback)
                completeCallback();
        }

        if (task)
            this.excuteLoadTask(task, this.curScene.name, finish);
        else
            finish();
    }

    /**
     * 先预加载场景和执行加载任务，完成后记录该场景直接依赖的资源，递归地建立依赖资源的关系。释放本场景资源，再跳转场景
     * @param name 场景名
     * @param onLaunched 成功切换场景回调
     */
    loadScene(name: string, task?: string, onLaunched?: Function) {
        let self = this;

        this.lastScene = this.curScene;
        this.curScene = new SceneInfo(name);

        let no: number = this.loadProgress.registerLoad();
        cc.director.preloadScene(name, (c, t, i) => {
            self.loadProgress.updateLoadState(no, c, t);
        }, (e, r: cc.SceneAsset) => {
            if (e) {
                console.error(`预加载场景${name}失败。${e}`);
                return;
            }

            //每次加载完一个资源判断一下所有资源是否加载完毕
            self.loadProgress.completeId(no);
            if (self.loadProgress.isLoadComplete())
                self.loadCompelete();
        })

        let finish: Function = () => {
            cc.director.loadScene(name, () => {
                //移除上个场景资源的使用
                self.removeResUseOfScene(self.lastScene);

                //对当前场景建立资源使用与依赖关系
                self.curScene.deps = self.getSceneResDeps().deps;
                self.recordResDepsAndUseOfScene(self.curScene);

                //释放空闲资源
                self.releaseIdleRes();

                if (onLaunched)
                    onLaunched();
            });
        }

        if (task)
            this.excuteLoadTask(task, name, finish);
        else
            this.callback = finish;
    }

    /**递归记录依赖，记录使用  */
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
    private getSceneResDeps(): SceneInfo {
        let sI: SceneInfo = new SceneInfo();
        let _s: any = cc.director.getScene();
        sI.name = _s.name;
        sI.deps = _s.dependAssets;
        return sI;
    }

    /****************************************************************************************
    *                                         加载任务                                        *
    ****************************************************************************************/

    /**
     * 执行加载任务
     * @param task 任务名
     * @param user 资源使用者
     * @param completeCallback 任务完成得回调函数
     */
    excuteLoadTask(task: string, user: string, completeCallback?: Function) {
        let self = this;
        if (!this.taskResUrls) {
            console.error("任务资源对象为空");
            return;
        }

        if (completeCallback)
            this.callback = completeCallback;

        let tI: TaskItem[] = this.taskResUrls[task];
        let item: TaskItem;
        for (item of tI) {
            this.loadResArray(item.urls, this.stringToType(item.type), user);
        }
    }

    /**
     * 加载下一关的预制体
     * @param task 
     */
    loadNextLevel(task: string, completeCallback: Function) {
        let self = this;
        let loadedKeys: string[] = this.curScene.getLoadRes();
        this.curScene.clearLoadRes();
        this.resDependence.removeUse(loadedKeys, this.curScene.name);
        this.excuteLoadTask(task, this.curScene.name, () => {
            self.releaseIdleRes();
            if (completeCallback)
                completeCallback();
        });
    }

    private loadResArray(urls: string[], type: typeof cc.Asset, user: string) {
        let self = this;
        let u: string;
        for (u of urls) {
            let i: number = this.loadProgress.registerLoad();
            this.loadRes(u, type, user, (c, t) => {
                self.loadProgress.updateLoadState(i, c, t);
            }, (key) => {
                self.loadProgress.completeId(i);

                if (self.curScene)
                    self.curScene.setLoadRes(key);

                //每次加载完一个资源判断一下所有资源是否加载完毕
                if (self.loadProgress.isLoadComplete())
                    self.loadCompelete();
            })
        }
    }

    /**
     * 根据字符串内容返回资源类型
     */
    private stringToType(s: string): typeof cc.Asset {
        switch (s) {
            case "prefab": return cc.Prefab;
            case "spriteAtlas": return cc.SpriteAtlas;
            case "spriteFrame": return cc.SpriteFrame;
            case "json": return cc.JsonAsset;
            case "audio": return cc.AudioClip;
        }
    }

    /**
     * 完成加载任务
     */
    private loadCompelete() {
        //任务加载完成，清理记录，方便下次加载
        let t: Function;
        if (this.callback) {
            t = this.callback;
            this.callback = null;
        }

        this.loadProgress.clearRecord();

        if (t)
            t();
    }


    /****************************************************************************************
    *                                         加载与得到资源                                   *
    ****************************************************************************************/

    /**
     * 加载资源
     */
    private loadRes(url: string, type: typeof cc.Asset, user: string, loadProgress: (completedCount: number, totalCount: number) => void, completeCallback: (key) => void) {
        let self = this;

        let finish: Function = (r) => {
            //记录该资源
            let key: string = this.resDependence.getCacheKey(url, type);
            self.resDependence.recordUse(key, user);
            self.resDependence.recordDependence(key);

            if (completeCallback)
                completeCallback(key);
        }

        let r: any = cc.loader.getRes(url, type);
        if (r) {
            console.warn(`资源${url}已加载`);
            finish();
            return;
        }

        cc.loader.loadRes(url, type, (c, t, i) => {
            if (loadProgress)
                loadProgress(c, t);
        }, (e, r) => {
            if (e) {
                console.error(e);
                return;
            }

            finish(r);
        });
    }

    getRes(url: string, type: typeof cc.Asset): any {
        let r = cc.loader.getRes(url, type);
        if (!r)
            console.error(`${url}资源不存在`);
        return r;
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