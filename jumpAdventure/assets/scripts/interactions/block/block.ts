import BlockBg from "./blockBg";
import Chip from "../chip";
import MathUtil from "../../common/mathUtil";
import DebugUtil, { DebugKey } from "../../modules/debugUtil";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Block extends cc.Component {

    @property(BlockBg)
    private blockBg: BlockBg = null;

    @property(Chip)
    private down: Chip = null;

    @property(Chip)
    private up: Chip = null;

    /**
     * 随机速度范围
     */
    private randomSpeed: { min: number, max: number } = {
        min: -40,
        max: 40
    }

    onLoad() {
        this.node.on("hited", this.hitedEvent, this);
    }

    private hitedEvent(e: cc.Event) {
        DebugUtil.ins.log(DebugKey.Block, "block被攻击");

        e.stopPropagation();

        //播放被攻击动画
        this.blockBg.hit((() => {
            //隐藏完整块
            this.blockBg.node.active = false;
            this.showChip();
        }).bind(this));

        this.scheduleOnce(this.node.destroy, 5);
    }


    private showChip() {
        this.up.node.active = true;
        this.down.node.active = true;

        this.setRandomSpeed(this.up.rigid);
        this.setRandomSpeed(this.down.rigid);

    }

    private setRandomSpeed(rigid: cc.RigidBody) {
        let x = MathUtil.getRandomInteger(this.randomSpeed.min, this.randomSpeed.max);
        let y = MathUtil.getRandomInteger(this.randomSpeed.min, this.randomSpeed.max);
        rigid.linearVelocity = cc.v2(x, y);
    }


}
