import FrameAnimation from "../../common/frameAnim";

const { ccclass, property, disallowMultiple, requireComponent } = cc._decorator;

@ccclass
@disallowMultiple
@requireComponent(cc.Animation)
export default class SawBg extends cc.Component {

    @property(cc.SpriteAtlas)
    private onAtlas: cc.SpriteAtlas = null;

    @property(cc.AnimationClip)
    private clip: cc.AnimationClip = null;

    private frameAnim: FrameAnimation = null;
    private anim: cc.Animation = null;

    private animState: cc.AnimationState = null;

    onLoad() {
        this.frameAnim = this.node.getComponent("frameAnim");
        this.anim = this.node.getComponent(cc.Animation);
    }

    /**
     * 初始化和启动动画
     * @param speed 动画播放速度
     * @param fixed 是固定的，就只播放帧动画
     */
    setup(speed: number, fixed: boolean) {
        this.frameAnim.setSpriteAtlas(this.onAtlas);

        if (!fixed) {
            this.anim.addClip(this.clip);
            this.animState = this.anim.getAnimationState(this.clip.name);
            this.animState.speed = speed;
            this.animState.play();
        }
        this.frameAnim.play(true);
    }

    /**动画事件，抵达需要停靠点。如果不需要停靠就不在动画中设置该事件 */
    arriveP() {
        this.node.dispatchEvent(new cc.Event.EventCustom("arriveP", true));
    }

    continueMove() {
        this.animState.resume();
        this.frameAnim.play(true);
    }

    pauseMove() {
        this.animState.pause();
        this.frameAnim.stop();
    }

    onBeginContact(c: cc.PhysicsContact, s, o: cc.PhysicsBoxCollider) {
        if (o.node.group === "PLAYER") {
            let e: cc.Event.EventCustom = new cc.Event.EventCustom("onBeginContact", true);
            e.detail = c;
            this.node.dispatchEvent(e);
        }
    }

    onDestroy() {
        if (this.animState)
            this.animState.stop();
    }

}
