import EventManager, { EventType } from "../modules/eventManager/eventManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default abstract class MyComponent extends cc.Component {

    private gamePause: boolean = false;

    onLoad() {
        // EventManager.ins.onEvent(EventType.PauseGame, () => {
        //     this.gamePause = true;
        // }, this);
        // EventManager.ins.onEvent(EventType.ContinueGame, () => {
        //     this.gamePause = false;
        // }, this);

        this._onLoad();
    }

    update(dt) {
        if (this.gamePause)
            return;

        this._update(dt);
    }


    abstract _onLoad();
    abstract _update(dt: number);

}
