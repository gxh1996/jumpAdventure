import { Dir, ContactInfo, GiveExtraSpeed } from "../../common/commonVar";
import MyComponent from "../../common/myComponent";
import MovedPlatformBg from "./movedPlatformBg";
import DebugUtil, { DebugKey } from "../../modules/debugUtil";
import EventManager, { EventType } from "../../modules/eventManager/eventManager";

const { ccclass, property } = cc._decorator;

let Mode = cc.Enum({
    auto: 0,
    trigger: 1
})

@ccclass
export default class MovedPlatform extends cc.Component {

    @property(MovedPlatformBg)
    private platform: MovedPlatformBg = null;

    @property(cc.SpriteAtlas)
    private onAtlas: cc.SpriteAtlas = null;

    @property(cc.SpriteFrame)
    private offImg: cc.SpriteFrame = null;

    @property({
        type: Dir,
        displayName: "开始移动方向"
    })
    private movedDir: number = Dir.left;

    @property({
        type: Mode,
        displayName: "移动模式"
    })
    private mode: number = Mode.auto;

    @property({
        displayName: "移动起点",
        tooltip: "movedPlatform下的节点坐标"
    })
    private startP: cc.Vec2 = cc.v2(0, 0);

    @property({
        displayName: "移动终点",
        tooltip: "movedPlatform下的节点坐标"
    })
    private endP: cc.Vec2 = cc.v2(0, 0);

    @property({ displayName: "移动速度" })
    private speed: number = 5;

    @property({
        tooltip: "在自动模式中，在端点的停靠时间"
    })
    private dockingT: number = 2;

    /**
     * 是否为水平移动
     */
    private isHorizMove: boolean = null;
    /**
     * 移动向终点的轴速度，有方向
     */
    private speedToEndP: number = null;
    /**
     * 1:向终点移动；-1:向起点移动
     */
    private isToEndP: number = 1;
    /**
     * 正在停靠
     */
    private isDocking: boolean = false;
    private ct: number = 0;


    onLoad() {
        EventManager.ins.onEventOnce(EventType.InitGameScene, this.startup, this);
        this.node.on("playerUnderPlatform", this._playerUnderPlatform, this);
        this.node.on("exitUnderPlatform", this._exitUnderPlatform, this);

        this.dealAgrs();
        this.initPlatform();
    }

    start() {
    }

    /**
     * 启动
     */
    private startup() {
        if (this.mode === Mode.auto) {
            DebugUtil.ins.log(DebugKey.MovedPlatformBg, "自动模式下，平台开始移动");

            this.isToEndP = 1;
            this.refreshVelocity();
            this.isDocking = false;
        }
        else
            this.isDocking = true;
    }

    private initPlatform() {
        this.platform.node.setPosition(this.startP);
        this.platform.anim.setSpriteAtlas(this.onAtlas);
        this.platform.anim.setIdleImg(this.offImg);

        if ([Dir.right, Dir.left].indexOf(this.movedDir) === -1)
            this.isHorizMove = false;
        else
            this.isHorizMove = true;
    }

    /**
     * 处理参数
     */
    private dealAgrs() {
        switch (this.movedDir) {
            case Dir.down:
                this.isHorizMove = false;
                this.speedToEndP = -this.speed;
                break;
            case Dir.up:
                this.isHorizMove = false;
                this.speedToEndP = this.speed;
                break;
            case Dir.left:
                this.isHorizMove = true;
                this.speedToEndP = -this.speed;
                break;
            case Dir.right:
                this.isHorizMove = true;
                this.speedToEndP = this.speed;
                break;
        }
    }

    /*            碰撞回调            */

    private _playerUnderPlatform(e: cc.Event.EventCustom) {
        e.stopPropagation();

        this._dealBeginContact();
    }
    /**
     * 处理 开始碰撞
     */
    private _dealBeginContact() {
        if (this.mode === Mode.auto) {
            if (!this.isDocking) {
                DebugUtil.ins.log(DebugKey.MovedPlatformBg, "处于自动模式，平台在移动");

                this.affectPlayer();
            }
        }
        else {
            DebugUtil.ins.log(DebugKey.MovedPlatformBg, "处于触发模式，让平台向终点移动");

            this.isToEndP = 1;
            this.refreshVelocity();
            this.isDocking = false;

            this.affectPlayer();
        }

    }

    private _exitUnderPlatform(e: cc.Event.EventCustom) {
        e.stopPropagation();

        if (this.mode === Mode.auto) {
            if (!this.isDocking) {
                DebugUtil.ins.log(DebugKey.MovedPlatformBg, "处于自动模式，平台在移动");

                this.removeAffectToPlayer();
            }
        }
        else {
            DebugUtil.ins.log(DebugKey.MovedPlatformBg, "让平台向起点移动");

            this.isToEndP = -1;
            this.refreshVelocity();
            this.isDocking = false;

            this.removeAffectToPlayer();
        }
    }

    /**
     * 平台移动对角色的影响
     */
    private affectPlayer() {
        if (this.isHorizMove) {
            DebugUtil.ins.log(DebugKey.MovedPlatformBg, "给角色加上平台水平速度");

            EventManager.ins.sendEvent(EventType.GivePlayerConstantSpeed, new GiveExtraSpeed("movedPlatformBg", this.platform.rigid.linearVelocity));
        }
        else {
            DebugUtil.ins.log(DebugKey.MovedPlatformBg, "告诉角色你处于垂直移动平台上");

            EventManager.ins.sendEvent(EventType.InVerMovedEntity);
        }

    }

    /**
     * 角色离开平台时，移除对角色的影响
     */
    removeAffectToPlayer() {
        if (this.isHorizMove) {
            DebugUtil.ins.log(DebugKey.MovedPlatformBg, "移除对角色水平速度的影响");

            EventManager.ins.sendEvent(EventType.RemovePlayerConstantSpeed, "movedPlatformBg");
        }
        else {
            DebugUtil.ins.log(DebugKey.MovedPlatformBg, "告诉角色你离开了垂直移动的平台");

            EventManager.ins.sendEvent(EventType.ExitVerMovedEntiry);
        }
    }

    /**
     * 刷新线速度
     */
    private refreshVelocity() {
        if (this.isHorizMove)
            this.platform.rigid.linearVelocity = cc.v2(this.speedToEndP * this.isToEndP, 0);
        else
            this.platform.rigid.linearVelocity = cc.v2(0, this.speedToEndP * this.isToEndP);
    }
    /**
     * 能否停靠
     */
    private dockEnable(): boolean {
        let r: boolean = false;
        let c: cc.Vec2 = this.platform.node.getPosition();
        switch (this.movedDir) {
            case Dir.down:
                if (this.isToEndP === 1 && c.y <= this.endP.y || this.isToEndP === -1 && c.y >= this.startP.y)
                    r = true;
                break;
            case Dir.up:
                if (this.isToEndP === 1 && c.y >= this.endP.y || this.isToEndP === -1 && c.y <= this.startP.y)
                    r = true;
                break;
            case Dir.left:
                if (this.isToEndP === 1 && c.x <= this.endP.x || this.isToEndP === -1 && c.x >= this.startP.x)
                    r = true;
                break;
            case Dir.right:
                if (this.isToEndP === 1 && c.x >= this.endP.x || this.isToEndP === -1 && c.x <= this.startP.x)
                    r = true;
                break;
        }

        return r;
    }

    update(dt) {

        if (this.platform.isContactBottom)
            return;

        if (this.mode === Mode.auto) {
            if (this.isDocking) {
                this.ct += dt;
                if (this.ct >= this.dockingT) {
                    DebugUtil.ins.log(DebugKey.MovedPlatformBg, "自动模式下，停靠结束。向另一端移动");

                    this.isDocking = false;
                    this.ct = 0;

                    this.isToEndP = -this.isToEndP;
                    this.refreshVelocity();

                    if (this.platform.isPlayerUnder) {
                        DebugUtil.ins.log(DebugKey.MovedPlatformBg, "角色在平台上");

                        if (this.isHorizMove) {
                            DebugUtil.ins.log(DebugKey.MovedPlatformBg, "给角色加上平台水平速度");

                            EventManager.ins.sendEvent(EventType.GivePlayerConstantSpeed, new GiveExtraSpeed("movedPlatformBg", this.platform.rigid.linearVelocity));
                        }
                    }
                }
            }
            else if (this.dockEnable()) {
                DebugUtil.ins.log(DebugKey.MovedPlatformBg, "可以停靠，停止移动");

                this.isDocking = true;
                this.platform.rigid.linearVelocity = cc.v2(0, 0);

                if (this.platform.isPlayerUnder && this.isHorizMove) {
                    DebugUtil.ins.log(DebugKey.MovedPlatformBg, "有角色在平台上，移除对角色水平速度的影响");

                    EventManager.ins.sendEvent(EventType.RemovePlayerConstantSpeed, "movedPlatformBg");
                }
            }
        }
        else {
            //触发模式
            if (!this.isDocking && this.dockEnable()) {
                DebugUtil.ins.log(DebugKey.MovedPlatformBg, "达到路径端点，停止移动");

                if (this.isHorizMove)
                    EventManager.ins.sendEvent(EventType.RemovePlayerConstantSpeed, "movedPlatformBg");

                this.isDocking = true;
                this.platform.rigid.linearVelocity = cc.v2(0, 0);
            }
        }
    }

    // onDestroy() {
    //     EventManager.ins.deleteSubscriber(this);
    // }
}
