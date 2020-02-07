import FrameAnimation from "../../common/frameAnim";
import MyComponent from "../../common/myComponent";
import { DIR } from "../../common/commonVar";
import DebugUtil, { DebugKey } from "../../modules/debugUtil";

const { ccclass, property } = cc._decorator;

@ccclass
export default class RockHeadBg extends cc.Component {

    @property(cc.SpriteAtlas)
    private blinkAtlas: cc.SpriteAtlas = null;

    @property(cc.SpriteAtlas)
    private leftHitAtlas: cc.SpriteAtlas = null;

    @property(cc.SpriteAtlas)
    private rightHitAtlas: cc.SpriteAtlas = null;

    @property(cc.SpriteAtlas)
    private bottomHitAtlas: cc.SpriteAtlas = null;

    @property(cc.SpriteAtlas)
    private topHitAtlas: cc.SpriteAtlas = null;

    @property(cc.SpriteFrame)
    private idleImg: cc.SpriteFrame = null;

    private anim: cc.Animation = null;
    private frameAnim: FrameAnimation = null;

    @property(cc.AnimationClip)
    private clip: cc.AnimationClip = null;

    /**
     * 当前移动的方向
     */
    curDir: DIR = null;
    /**
     * 过去移动的方向
     */
    postDir: DIR = null;
    /**
     * 接下来移动的方向
     */
    nextDir: DIR = null;

    animState: cc.AnimationState = null;

    private first: boolean = true;

    onLoad() {
        this.anim = this.node.getComponent(cc.Animation);
        this.frameAnim = this.node.getComponent("frameAnim");

        this.frameAnim.setIdleImg(this.idleImg);
    }

    start() {
    }

    init(speed: number) {
        this.anim.addClip(this.clip);
        this.animState = this.anim.getAnimationState(this.clip.name);
        this.animState.speed = speed;
    }

    /**
     * 启动动画
     */
    setupAnim(firstMoveDir: number) {
        DebugUtil.ins.log(DebugKey.RockHead, "启动移动头");

        this.curDir = firstMoveDir;

        // this.anim.play(this.clip.name);
        this.animState.play();
        this.blink();
    }

    /**
     * 动画事件-到达一点，根据方向来播放动画
     * @param nextDir 之后要移动的方向
     */
    arrivePoint(nextDir: string) {
        if (this.first) {
            this.first = false;
            return;
        }
        // debugger
        this.postDir = this.curDir;
        this.curDir = null;
        this.nextDir = this._stringTpDIR(nextDir);

        // this.anim.pause();
        this.animState.pause();
        this.playHit(this.postDir);

        this.node.dispatchEvent(new cc.Event.EventCustom("arriveP", true));
    }

    /**
     * 动画事件-到达一点前。此时检测是否挤压角色
     * @param dir 只有这个方向速度时才检测
     */
    arrivePointBefore(dir: string) {
        // debugger
        if (dir) {
            if (this._stringTpDIR(dir) !== this.curDir)
                return;
        }
        else {
            console.error("参数不能为空");
            return;
        }

        this.node.dispatchEvent(new cc.Event.EventCustom("pressCheck", true));
    }

    /**从一点开始向另一个点移动 */
    continuePlay() {
        this.curDir = this.nextDir;

        // this.anim.resume();
        this.animState.resume();
        this.blink();
    }

    private playHit(dir: DIR) {
        switch (dir) {
            case DIR.left:
                this.leftHit();
                break;
            case DIR.right:
                this.rightHit();
                break;
            case DIR.up:
                this.topHit();
                break;
            case DIR.down:
                this.bottomHit();
                break;
        }
    }
    private _stringTpDIR(d: string): DIR {
        switch (d) {
            case "left":
                return DIR.left;
            case "right":
                return DIR.right;
            case "up":
                return DIR.up;
            case "down":
                return DIR.down;
        }
    }

    leftHit() {
        this.frameAnim.stop();
        this.frameAnim.setSpriteAtlas(this.leftHitAtlas);
        this.frameAnim.play();
    }

    rightHit() {
        this.frameAnim.stop();
        this.frameAnim.setSpriteAtlas(this.rightHitAtlas);
        this.frameAnim.play();
    }

    bottomHit() {
        this.frameAnim.stop();
        this.frameAnim.setSpriteAtlas(this.bottomHitAtlas);
        this.frameAnim.play();
    }

    topHit() {
        this.frameAnim.stop();
        this.frameAnim.setSpriteAtlas(this.topHitAtlas);
        this.frameAnim.play();
    }

    private blink() {
        this.frameAnim.stop();
        this.frameAnim.setSpriteAtlas(this.blinkAtlas);
        this.frameAnim.play(true);
    }

    onDestroy() {
        if (this.animState)
            this.animState.stop();
    }
}
