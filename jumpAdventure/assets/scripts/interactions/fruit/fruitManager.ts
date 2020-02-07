import Fruit from "./fruit";
import DebugUtil, { DebugKey } from "../../modules/debugUtil";
import MathUtil from "../../common/mathUtil";
import EventManager, { EventType } from "../../modules/eventManager/eventManager";
import ResManager from "../../modules/resManager/resManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class FruitManager extends cc.Component {

    @property([cc.SpriteAtlas])
    private fruitAtlas: cc.SpriteAtlas[] = [];

    @property(cc.Prefab)
    private fruitPrefab: cc.Prefab = null;

    private pool: cc.NodePool;

    onLoad() {
        this.pool = new cc.NodePool();

        EventManager.ins.onEvent(EventType.DeleteFruit, this.recoverFruitNode, this);
    }

    start() {
        EventManager.ins.sendEvent(EventType.FruitMgrNotice, this);
    }


    createFruitRandom(): Fruit {
        if (this.fruitAtlas.length === 0) {
            console.error("没有水果可以生成");
            return null;
        }

        let n: cc.Node = this.getFruitNode();
        this.node.addChild(n);
        let s: Fruit = n.getComponent("fruit");
        s.init(this.fruitAtlas[MathUtil.getRandomInteger(0, this.fruitAtlas.length - 1)]);

        DebugUtil.ins.log(DebugKey.FruitManager, "节点树中加入一个水果！");
        return s;
    }

    private getFruitNode(): cc.Node {
        if (this.pool.size() > 0) {
            let n: cc.Node = this.pool.get();
            n.opacity = 255;
            return n;
        }
        else
            return cc.instantiate(this.fruitPrefab);
    }

    /**回收 */
    private recoverFruitNode(n: cc.Node) {
        this.pool.put(n);

        DebugUtil.ins.log(DebugKey.FruitManager, "回收一个水果节点");
    }

    onDestroy() {
        EventManager.ins.deleteSubscriber(this);
    }
}
