import PlayerState from "./playerState";
import Player from "../player";
import DebugUtil, { DebugKey } from "../../modules/debugUtil";

const { ccclass, property } = cc._decorator;

@ccclass
export class IdleState extends PlayerState {

    moveBut(dir: number) {
        this.player.setState(Player.runState);
    }

    releaseMoveBut() {
        // console.error("待机状态不应该收到该指令");
    }

    jumpBut() {
        this.player.setState(Player.jumpState);
    }

    downSpeed() {

    }

    upSpeed() {
        this.player.setState(Player.upState);
    }

    beginContact() {

    }

    endContact() {

    }

    impulsion() {

    }

    enter() {
        DebugUtil.ins.log(DebugKey.PlayerState, "进入到待机状态");

        this.player.anim.idle();
        this.property.resetJumpCount()
        // this.player.collider.friction = 0.2;
        // this.player.collider.apply();
    }

    exit() {
        this.player.anim.stop();
        // this.player.collider.friction = 0;
        // this.player.collider.apply();
    }
}