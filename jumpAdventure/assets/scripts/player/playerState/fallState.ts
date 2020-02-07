import PlayerState from "./playerState";
import Player from "../player";
import DebugUtil, { DebugKey } from "../../modules/debugUtil";

const { ccclass, property } = cc._decorator;

@ccclass
export class FallState extends PlayerState {

    moveBut(dir: number) {
        if (this.player.climbWallEnable()) {
            this.player.setState(Player.climbWallState);
        }
        else
            this.player.setSelfSpeed(this.property.speedInAir * dir);
    }

    releaseMoveBut() {
        this.player.setSelfSpeed(0);
    }

    jumpBut() {
        //如果角色没有按跳跃键，即不是主动在空中，就不能跳跃
        if (this.property.getJumpCount() === 1) {
            this.player.setState(Player.doubleJumpState);
        }
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
        else if (this.player.climbWallEnable())
            this.player.setState(Player.climbWallState);
    }

    endContact() {

    }

    downSpeed() {

    }

    upSpeed() {
        this.player.setState(Player.upState);
    }

    impulsion() {

    }

    enter() {
        DebugUtil.ins.log(DebugKey.PlayerState, "进入到下落状态");

        if (this.player.climbWallEnable()) {
            this.player.setState(Player.climbWallState);
            return;
        }

        this.player.anim.fall();

        let d: number = this.property.isClickMoveBut;
        if (d === 0)
            return;
        else
            this.player.setSelfSpeed(this.property.speedInAir * d);
    }

    exit() {

    }
}