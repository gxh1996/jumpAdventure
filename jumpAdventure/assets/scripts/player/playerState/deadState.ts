import PlayerState from "./playerState";
import DebugUtil, { DebugKey } from "../../modules/debugUtil";

const { ccclass, property } = cc._decorator;

@ccclass
export class DeadState extends PlayerState {


    moveBut(dir: number) {

    }

    releaseMoveBut() {

    }

    jumpBut() {

    }

    downSpeed() {

    }

    upSpeed() {

    }

    beginContact() {

    }

    endContact() {

    }

    impulsion() {

    }

    enter() {
        DebugUtil.ins.log(DebugKey.PlayerState, "进入到死亡状态");
    }

    exit() {


    }
}