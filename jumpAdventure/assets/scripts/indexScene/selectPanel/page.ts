import Level from "./level";
import DataManager from "../../modules/dataManager";
import ResManager from "../../modules/resManager/resManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Page extends cc.Component {

    private levelPre: cc.Prefab = null;
    private dataMgr: DataManager = null;
    private resMgr: ResManager = null;

    onLoad() {
        this.dataMgr = DataManager.ins;
        this.resMgr = ResManager.ins;

        this.levelPre = this.resMgr.getRes("prefabs/ui/selectPanel/level", cc.Prefab);
    }

    /**
     * 设置该页面
     * @param startN 关卡起始号
     * @param endNum 关卡结束号
     */
    init(startN: number, endNum: number) {
        let len: number = this.dataMgr.passLevelSum;
        let i: number;
        let enable: boolean;
        let getStar: number;
        for (i = startN; i <= endNum; i++) {
            if (i <= len + 1) {
                //能进入
                enable = true;
                if (i === len + 1)
                    getStar = 0;
                else
                    getStar = this.dataMgr.getLeveledStarN(i);
            }
            else
                enable = false;

            let level: Level = this.createLevel();
            level.init(i, enable, getStar);
        }
    }

    private createLevel(): Level {
        let n: cc.Node = cc.instantiate(this.levelPre);
        this.node.addChild(n);
        return n.getComponent("level");
    }
}
