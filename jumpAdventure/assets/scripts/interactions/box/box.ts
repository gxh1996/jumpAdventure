import BoxBg from "./boxBg";
import FruitManager from "../fruit/fruitManager";
import Fruit from "../fruit/fruit";
import MathUtil from "../../common/mathUtil";
import Chip from "../chip";
import EventManager, { EventType } from "../../modules/eventManager/eventManager";
import DebugUtil, { DebugKey } from "../../modules/debugUtil";

const { ccclass, property } = cc._decorator;

let BoxType = cc.Enum({
    Box1: 0,
    Box2: 1,
    Box3: 2
});
/**box1一共出1个水果,box2:3,box3:5 */
@ccclass
export default class Box extends cc.Component {

    @property(BoxBg)
    private boxBg: BoxBg = null;

    @property(Chip)
    private leftUp: Chip = null;

    @property(Chip)
    private rightUp: Chip = null;

    @property(Chip)
    private leftDown: Chip = null;

    @property(Chip)
    private rightDown: Chip = null;


    @property({
        type: cc.Enum(BoxType),
        displayName: "箱子类型"
    })
    private type: number = BoxType.Box1;

    @property({ tooltip: "能受攻击的次数" })
    private hitCount: number = 1;

    /**
     * 随机速度范围
     */
    private randomSpeed: { min: number, max: number } = {
        min: 5,
        max: 40
    }

    private fruitMgr: FruitManager = null;

    onLoad() {
        EventManager.ins.onEvent(EventType.FruitMgrNotice, this.fruitMgrNotice, this);
        this.node.on("hited", this.hitEvent, this);
    }

    start() {

    }

    /*          事件回调            */
    private fruitMgrNotice(mgr) {
        this.fruitMgr = mgr;
    }

    private hitEvent(e: cc.Event) {
        e.stopPropagation();
        this.hitCount--;

        this.boxBg.hit(null);
        if (this.hitCount === 0)
            this.break();
        else
            this.outFruit();
    }

    private break() {
        DebugUtil.ins.log(DebugKey.Box, "隐藏箱子, 显示碎片");

        //隐藏箱子
        this.boxBg.node.active = false;

        this.activeChip();
        this.outFruits();

        this.scheduleOnce(this.node.destroy, 5);
    }

    /**
     * 显示碎片和给予速度
     */
    private activeChip() {
        this.leftUp.node.active = true;
        this.rightUp.node.active = true;
        this.leftDown.node.active = true;
        this.rightDown.node.active = true;

        this.leftUp.rigid.linearVelocity = cc.v2(-this.getRandomSpeed(), this.getRandomSpeed());
        this.rightUp.rigid.linearVelocity = cc.v2(this.getRandomSpeed(), this.getRandomSpeed());
        this.leftDown.rigid.linearVelocity = cc.v2(-this.getRandomSpeed(), this.getRandomSpeed());
        this.rightDown.rigid.linearVelocity = cc.v2(this.getRandomSpeed(), this.getRandomSpeed());
    }

    /**
     * 爆出水果
     */
    private outFruits() {
        let c: number = 0;

        switch (this.type) {
            case BoxType.Box1:
                c = 1;
                break;
            case BoxType.Box2:
                c = 1;
                break;
            case BoxType.Box3:
                c = 2;
                break;
        }

        for (let i = 0; i < c; i++)
            this.outFruit();
    }
    private outFruit() {
        let f: Fruit = this.fruitMgr.createFruitRandom();
        if (f) {
            f.setDynamic();
            let np: cc.Vec2 = MathUtil.getNodePFromWP(f.node.parent, MathUtil.getWorldCoordinate(this.node));
            let dir: number = MathUtil.getRandomSelect();
            np.x += dir * 5;
            f.node.setPosition(np);
            f.rigid.linearVelocity = cc.v2(this.getRandomSpeed(20, 40) * dir, 0);

            DebugUtil.ins.log(DebugKey.Box, `水果速度：${f.rigid.linearVelocity}`);
        }
    }

    private getRandomSpeed(min?: number, max?: number): number {
        if (!min)
            min = this.randomSpeed.min;
        if (!max)
            max = this.randomSpeed.max;

        return MathUtil.getRandomInteger(min, max);
    }

}
