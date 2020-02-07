import PlayerState from "./playerState";
import Player from "../player";
import DebugUtil, { DebugKey } from "../../modules/debugUtil";

const { ccclass, property } = cc._decorator;

@ccclass
export class UpState extends PlayerState {

    moveBut(dir: number) {
        this.player.setSelfSpeed(this.property.speedInAir * dir);
    }

    releaseMoveBut() {
        this.player.setSelfSpeed(0);
    }

    jumpBut() {
        if (this.property.getJumpCount() === 1)
            this.player.setState(Player.doubleJumpState);
    }

    downSpeed() {
        this.player.setState(Player.fallState);
    }

    upSpeed() {

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
        DebugUtil.ins.log(DebugKey.PlayerState, "进入到上升状态");

        this.player.anim.up();
        let d: number = this.property.isClickMoveBut;
        if (d === 0)
            return;
        else
            this.player.setSelfSpeed(this.property.speedInAir * d);
    }

    exit() {

    }
}