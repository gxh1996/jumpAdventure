import EventManager, { EventType } from "../modules/eventManager/eventManager";
import DebugUtil, { DebugKey } from "../modules/debugUtil";

const { ccclass, property } = cc._decorator;

@ccclass
export default class LoadPage extends cc.Component {

    @property(cc.ProgressBar)
    private bar: cc.ProgressBar = null;

    onLoad() {
        EventManager.ins.onEvent(EventType.OpenLoadPage, this.open, this);
        EventManager.ins.onEvent(EventType.CloseLoadPage, this.close, this);
        EventManager.ins.onEvent(EventType.UpdateProgress, this.updateProgressBar, this);

        this.init();
    }

    private init() {
        this.node.setPosition(cc.v2());
        this.node.active = false;
    }

    private open() {
        this.bar.progress = 0;
        EventManager.ins.sendEvent(EventType.OpenPanel, this.node);
    }

    private close() {
        EventManager.ins.sendEvent(EventType.ClosePanel, this.node);
    }

    private updateProgressBar(r: number) {
        this.bar.progress = r;

        DebugUtil.ins.log(DebugKey.LoadPage, `加载进度：${r}`);
    }

    onDestroy() {
        EventManager.ins.deleteSubscriber(this);
    }

}
