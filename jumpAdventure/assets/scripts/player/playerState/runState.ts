import PlayerState from "./playerState";
import Player from "../player";
import DebugUtil, { DebugKey } from "../../modules/debugUtil";

const { ccclass, property } = cc._decorator;

@ccclass
export class RunState extends PlayerState {
    moveBut(dir: number) {

    }

    releaseMoveBut() {
        this.player.setState(Player.idleState);
    }

    jumpBut() {
        this.player.setState(Player.jumpState);
    }

    downSpeed() {
        this.player.setState(Player.fallState);
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
        DebugUtil.ins.log(DebugKey.PlayerState, "进入到奔跑状态");

        this.player.anim.run();
        this.player.setSelfSpeed(this.property.speed * this.property.isClickMoveBut);
        this.property.resetJumpCount()
        // this.player.collider.friction = 0.2;
        // this.player.collider.apply();
    }

    exit() {
        this.player.anim.stop();
        this.player.setSelfSpeed(0);
        // this.player.collider.friction = 0;
        // this.player.collider.apply();
    }


}