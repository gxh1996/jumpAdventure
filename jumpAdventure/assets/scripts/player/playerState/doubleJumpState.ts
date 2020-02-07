import PlayerState from "./playerState";
import Player from "../player";
import DebugUtil, { DebugKey } from "../../modules/debugUtil";
import SoundsManager from "../../modules/soundManager";

const { ccclass, property } = cc._decorator;

@ccclass
export class DoubleJumpState extends PlayerState {

    moveBut(dir: number) {
        this.player.setSelfSpeed(this.property.speedInAir * dir);
    }

    releaseMoveBut() {
        this.player.setSelfSpeed(0);
    }

    jumpBut() {

    }

    beginContact() {
        if (this.player.isLand()) {
            if (this.property.isClickMoveBut === 0) {
                //没有按着移动键，即进入待机状态
                this.player.setState(Player.idleState);
            }
            else {
                //否则进入奔跑状态
                this.player.setState(Player.runState);
            }
        }
    }

    endContact() {

    }

    downSpeed() {
        if (!this.player.anim.isPlay()) {
            //二段跳动画播完了
            this.player.setState(Player.fallState);
        }
        // this.player.setState(Player.fallState);

    }

    upSpeed() {
        if (!this.player.anim.isPlay()) {
            //二段跳动画播完了
            this.player.setState(Player.upState);
        }
    }

    impulsion() {

    }

    enter() {
        DebugUtil.ins.log(DebugKey.PlayerState, "进入到二段跳跃状态");

        SoundsManager.ins.playEffect("sounds/jump");
        this.property.addJumpCount();
        this.player.anim.doubleJump();
        this.player.setSpeedY(0);
        this.player.applyImpulsion(cc.v2(0, this.property.jumpForce));

        let d: number = this.property.isClickMoveBut;
        if (d !== 0)
            this.player.setSelfSpeed(this.property.speedInAir * d);
    }

    exit() {
        this.player.anim.stop();
    }
}