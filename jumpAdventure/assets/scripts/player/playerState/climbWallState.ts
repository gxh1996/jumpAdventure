import PlayerState from "./playerState";
import Player from "../player";
import DebugUtil, { DebugKey } from "../../modules/debugUtil";

const { ccclass, property } = cc._decorator;

@ccclass
export class ClimbWallState extends PlayerState {


    beginContact() {
        if (this.player.isLand())
            this.player.setState(Player.idleState);
    }

    endContact() {
        if (!this.player.climbWallEnable())
            this.player.setState(Player.fallState);
    }

    moveBut(dir: number) {
        //爬墙时是按着墙方向的键的
    }

    releaseMoveBut() {
        this.player.setState(Player.fallState);
    }

    jumpBut() {
        if (this.property.getJumpCount() === 1)
            this.player.setState(Player.doubleJumpState);
        else
            this.player.setState(Player.jumpState);
    }

    downSpeed() {

    }

    upSpeed() {
        this.player.setState(Player.upState);
    }

    impulsion() {
        this.player.setState(Player.upState);
    }

    enter() {
        DebugUtil.ins.log(DebugKey.PlayerState, "进入爬墙状态");

        this.player.anim.climbWall();
        this.player.rigid.gravityScale = 0;
        this.player.updateSpeed = false;
        this.player.setSelfSpeed(0);
        this.player.setSpeedY(-this.player.property.climbWallSpeed);
    }

    exit() {
        this.player.anim.stop();
        this.player.rigid.gravityScale = 1;
        this.player.updateSpeed = true;
        this.player.setSpeedY(0);
    }
}