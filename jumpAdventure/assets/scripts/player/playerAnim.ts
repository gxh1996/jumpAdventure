import FrameAnimation from "../common/frameAnim";
import { HitData } from "../common/commonVar";
import EventManager, { EventType } from "../modules/eventManager/eventManager";
import ResManager from "../modules/resManager/resManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PlayerAnim extends cc.Component {

    @property(FrameAnimation)
    private frameAnim: FrameAnimation = null;

    @property(cc.SpriteAtlas)
    private doubleJumpAtlas: cc.SpriteAtlas = null;
    @property(cc.SpriteAtlas)
    private hitAtlas: cc.SpriteAtlas = null;
    @property(cc.SpriteAtlas)
    private idleAtlas: cc.SpriteAtlas = null;
    @property(cc.SpriteAtlas)
    private runAtlas: cc.SpriteAtlas = null;
    @property(cc.SpriteAtlas)
    private walkWallAtlas: cc.SpriteAtlas = null;
    @property(cc.SpriteFrame)
    private fallImg: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    private jumpImg: cc.SpriteFrame = null;

    @property(cc.SpriteAtlas)
    private appearingAtlas: cc.SpriteAtlas = null;

    @property(cc.SpriteAtlas)
    private desappearingAtlas: cc.SpriteAtlas = null;

    private resMgr: ResManager = null;

    onLoad() {
        this.resMgr = ResManager.ins;
    }

    /**
     * 加载动画资源
     */
    init() {
        this.frameAnim.setSpriteFrame(this.idleAtlas.getSpriteFrames()[0]);
    }

    /**
     * 播放行走动画
     */
    run() {
        this.frameAnim.setSpriteAtlas(this.runAtlas);
        this.frameAnim.play(true);
    }

    jump() {
        this.frameAnim.setSpriteFrame(this.jumpImg);
    }

    doubleJump() {
        this.frameAnim.setSpriteAtlas(this.doubleJumpAtlas);
        this.frameAnim.play();
    }

    fall() {
        this.frameAnim.setSpriteFrame(this.fallImg);
    }

    idle() {
        this.frameAnim.setSpriteAtlas(this.idleAtlas);
        this.frameAnim.play(true);
    }

    climbWall() {
        this.frameAnim.setSpriteAtlas(this.walkWallAtlas);
        this.frameAnim.play(true);
    }

    up() {
        this.frameAnim.setSpriteFrame(this.jumpImg);
    }

    dead(d: HitData) {
        this.frameAnim.setSpriteAtlas(this.hitAtlas);
        this.frameAnim.play();

        if (d) {
            if (d.force)
                EventManager.ins.sendEvent(EventType.ApplyImpulsionToPlayer, d.force);
            if (d.rotate)
                cc.tween(this.node).by(0.3, { angle: d.rotate }).start();
        }

    }

    /**出现动画 */
    appearing(func: Function) {
        this.frameAnim.setSpriteAtlas(this.appearingAtlas);
        this.frameAnim.play(false, func);
    }

    /**消失动画 */
    desappearing(func: Function) {
        this.frameAnim.setSpriteAtlas(this.desappearingAtlas);
        this.frameAnim.play(false, func);
    }

    /**
     * 是否在播放动画
     */
    isPlay(): boolean {
        return this.frameAnim.isPlaying();
    }

    /**
     * 停止播放动画
     */
    stop() {
        this.frameAnim.stop();
    }
}
