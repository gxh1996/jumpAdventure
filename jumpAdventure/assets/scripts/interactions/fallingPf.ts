import FrameAnimation from "../common/frameAnim";
import MathUtil from "../common/mathUtil";
import EventManager, { EventType } from "../modules/eventManager/eventManager";

const { ccclass, property } = cc._decorator;

enum State { fly, collide, fall }

@ccclass
export default class FallingPf extends cc.Component {

    @property(cc.SpriteAtlas)
    private onAtlas: cc.SpriteAtlas = null;

    @property(cc.SpriteFrame)
    private offImg: cc.SpriteFrame = null;

    @property(cc.ParticleSystem)
    private particle: cc.ParticleSystem = null;

    @property()
    private movedLen: number = 10;

    @property({ displayName: "抖动频率" })
    private rate: number = 0.5;

    @property({ displayName: "支撑时间" })
    private t: number = 2;

    private anim: FrameAnimation = null;

    private state: State = null;
    private rigid: cc.RigidBody = null;

    onLoad() {
        this.anim = this.node.getComponent("frameAnim");
        this.rigid = this.node.getComponent(cc.RigidBody);

        EventManager.ins.onEvent(EventType.ContinueGame, this.fly, this);
    }

    start() {
        this.fly();
    }

    onBeginContact(c: cc.PhysicsContact, s: cc.PhysicsBoxCollider, o: cc.PhysicsBoxCollider) {
        if (this.state === State.fall) {
            c.disabled = true;
            return;
        }

        if (o.node.group === "PLAYER") {
            //单向平台功能
            if (MathUtil.relativeLocationVertical(s, o) === 1)
                c.disabled = true;

            if (this.state === State.collide)
                return;

            this.collide();
        }
    }

    /**
     * 飞行
     */
    private fly() {
        this.node.stopAllActions();
        this.on();
        this.node.runAction(cc.sequence(
            cc.moveBy(this.rate, 0, this.movedLen),
            cc.moveBy(this.rate * 2, 0, -this.movedLen * 2),
            cc.moveBy(this.rate, 0, this.movedLen)
        ).repeatForever());

        this.state = State.fly;
    }

    /**
     * 碰撞时的动画
     */
    private collide() {
        let t: number = 0.03;
        let l: number = 1;
        this.node.stopAllActions();
        this.node.runAction(cc.sequence(
            cc.moveBy(t, l, 0),
            cc.moveBy(t * 2, -l * 2, 0),
            cc.moveBy(t, l, 0)
        ).repeatForever());
        this.scheduleOnce(this.fall, this.t);

        this.state = State.collide;
    }

    /**
     * 掉落
     */
    private fall() {
        let self = this;

        this.node.stopAllActions();
        this.off();

        this.state = State.fall;
        this.scheduleOnce(() => {
            self.destroy();
        }, 3);

        this.rigid.type = cc.RigidBodyType.Dynamic;
    }

    private on() {
        this.anim.setIdleImg(this.offImg);
        this.anim.setSpriteAtlas(this.onAtlas);
        this.anim.play(true);

        this.particle.resetSystem();
    }

    private off() {
        this.anim.stop();
        this.particle.stopSystem();
    }

    // update (dt) {}
}
