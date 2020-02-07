import EventManager, { EventType } from "./eventManager/eventManager";

export default class UIHelper {
    private static ins: UIHelper;

    static init() {
        if (this.ins)
            return;

        this.ins = new UIHelper();
    }

    private eventMgr: EventManager;

    private constructor() {
        this.eventMgr = EventManager.ins;

        this.eventMgr.onEvent(EventType.OpenPanel, this.openPanel, this);
        this.eventMgr.onEvent(EventType.ClosePanel, this.closePanel, this);
    }

    private openPanel(p: cc.Node) {
        p.active = true;
    }

    private closePanel(p: cc.Node) {
        p.active = false;
    }


}