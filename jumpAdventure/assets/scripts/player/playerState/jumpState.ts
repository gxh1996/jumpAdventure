import PlayerState from "./playerState";
import Player from "../player";
import DebugUtil, { DebugKey } from "../../modules/debugUtil";
import SoundsManager from "../../modules/soundManager";

const { ccclass, property } = cc._decorator;

@ccclass
export class JumpState extends PlayerState {

    moveBut(dir: number) {
        this.player.setSelfSpeed(this.property.speedInAir * dir);
    }

    releaseMoveBut() {
        this.player.setSelfSpeed(0);
    }

    jumpBut() {
        this.player.setState(Player.doubleJumpState);
    }

    downSpeed() {
        this.player.setState(Player.fallState);
    }

    upSpeed() {
        this.player.setState(Player.upState);
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

    impulsion() {

    }

    enter() {
        DebugUtil.ins.log(DebugKey.PlayerState, "进入跳跃状态");

        SoundsManager.ins.playEffect("sounds/jump");
        this.property.addJumpCount()
        this.player.anim.jump();

        this.player.applyImpulsion(cc.v2(0, this.property.jumpForce))

        let d: number = this.property.isClickMoveBut
        if (d !== 0)
            this.player.setSelfSpeed(this.property.speedInAir * d);
    }

    exit() {

    }
}