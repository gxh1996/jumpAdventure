import FrameAnimation from "../common/frameAnim";
import { Dir, GiveExtraSpeed } from "../common/commonVar";
import DebugUtil, { DebugKey } from "../modules/debugUtil";
import EventManager, { EventType } from "../modules/eventManager/eventManager";

const { ccclass, property } = cc._decorator;



@ccclass
export default class BlowWind extends cc.Component {

    @property(cc.SpriteAtlas)
    private onAtlas: cc.SpriteAtlas = null;

    @property(cc.SpriteFrame)
    private offImg: cc.SpriteFrame = null;

    @property(FrameAnimation)
    private anim: FrameAnimation = null;

    @property({ displayName: "风速" })
    private windSpeed: number = 40;

    @property({ displayName: "隔多久开启一次" })
    private intervalOfT: number = 5;

    @property({ displayName: "一次吹多久" })
    private duration: number = 5;

    @property({
        type: Dir,
        displayName: "风的方向"
    })
    private dir: number = Dir.up;

    @property(cc.ParticleSystem)
    private particle: cc.ParticleSystem = null;

    private rigid: cc.RigidBody = null;

    private cT: number = 0;
    /**
     * 装置是否打开
     */
    private isOn: boolean = false;
    /**
     * 是否碰撞到角色
     */
    private isCollided: boolean = false;

    onLoad() {
        this.rigid = this.node.getComponent(cc.RigidBody);
        this.anim.setIdleImg(this.offImg);
        this.anim.setSpriteAtlas(this.onAtlas);

        // this.initParticleAngle();

        this.rigid.enabledContactListener = true;
    }

    onBeginContact(contact, self: cc.Collider, other: cc.Collider) {
        if (other.node.group === "PLAYER") {
            DebugUtil.ins.log(DebugKey.BlowWind, "碰撞到玩家");
            this.isCollided = true;

            if (this.isOn)
                this.blowPlayer();
        }
    }



    onEndContact(contact, self: cc.Collider, other: cc.Collider) {
        if (other.node.group === "PLAYER") {
            DebugUtil.ins.log(DebugKey.BlowWind, "结束和玩家的碰撞");
            this.isCollided = false;

            if (this.isOn)
                this.endBlowPlayer();
        }
    }

    /**
     * 吹起角色
     */
    private blowPlayer() {
        let s: cc.Vec2 = this.getWindSpeed();
        DebugUtil.ins.log(DebugKey.BlowWind, `吹起角色，风速为${s}`);

        EventManager.ins.sendEvent(EventType.GivePlayerConstantSpeed, new GiveExtraSpeed("blowWind", s));
    }

    /**
     * 结束吹起角色
     */
    private endBlowPlayer() {
        let s: cc.Vec2 = this.getWindSpeed();
        DebugUtil.ins.log(DebugKey.BlowWind, `结束吹起角色`);

        EventManager.ins.sendEvent(EventType.RemovePlayerConstantSpeed, "blowWind");
    }

    /**
     * 初始化粒子的速度
     */
    private initParticleAngle() {
        let s: number;

        switch (this.dir) {
            case Dir.up:
                s = 90;
                break;
            case Dir.down:
                s = 270;
                break;
            case Dir.left:
                s = 180;
                break;
            case Dir.right:
                s = 0;
                break;
        }

        this.particle.angle = s;
    }

    /**
     * 根据设置的风向和风速得到作用与角色的线速度
     */
    private getWindSpeed(): cc.Vec2 {
        let ret: cc.Vec2;

        switch (this.dir) {
            case Dir.up:
                ret = cc.v2(0, this.windSpeed);
                break;
            case Dir.down:
                ret = cc.v2(0, -this.windSpeed);
                break;
            case Dir.left:
                ret = cc.v2(-this.windSpeed, 0);
                break;
            case Dir.right:
                ret = cc.v2(this.windSpeed, 0);
                break;
        }

        return ret;
    }

    /**
     * 打开吹风装置
     */
    private on() {
        DebugUtil.ins.log(DebugKey.BlowWind, "打开吹风装置");

        this.anim.play(true);
        this.particle.resetSystem();
        this.isOn = true;

        if (this.isCollided)
            this.blowPlayer();
    }

    /**
     * 关闭吹风装置
     */
    private off() {
        DebugUtil.ins.log(DebugKey.BlowWind, "关闭吹风装置");

        this.anim.stop();
        this.particle.stopSystem();
        this.isOn = false;

        if (this.isCollided)
            this.endBlowPlayer();
    }

    /**
     * 自动运行
     */
    private autoRun() {
        if (this.isOn) {
            if (this.cT >= this.duration) {
                //装置处于打开状态并到了关闭时间
                this.off();
                this.cT = 0;
            }
        }
        else if (this.cT >= this.intervalOfT) {
            //装置处于关闭状态并到了打开时间
            this.on();
            this.cT = 0;
        }
    }

    update(dt) {

        this.cT += dt;
        this.autoRun();
    }
}
