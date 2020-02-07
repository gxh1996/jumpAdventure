import EventCenter from "./eventCenter";

const { ccclass, property } = cc._decorator;

/**
 * 事件类型
 */
// export let EventType = cc.Enum({
//     /* ----------------通用--------------- */

//     InitModuleComplete: "InitModuleComplete",
//     LoadTaskResListComplete: "LoadTaskResListComplete",
//     ResLoadComplete: "ResLoadComplete",

//     /* ----------------UI----------------- */

//     openPanel: "openPanel",
//     closePanel: "closePanel",

//     /**
//      * 打开选择关卡面板
//      */
//     openSelectLevelPanel: "openSelectLevelPanel",
//     /**
//      * 关闭选择关卡面板
//      */
//     closeSelectLevelPanel: "closeSelectLevelPanel",
// })

export enum EventType {
    /* ----------------通用--------------- */

    InitModuleComplete,
    LoadTaskResListComplete,
    LoadGameConfigComplete,
    ResLoadComplete,
    GotOpenId,
    InitConfigComplete,
    InitUserDataComplete,
    InitGameScene,
    ResetGame,
    NextLevel,

    PauseGame,
    ContinueGame,

    LoadGameScene,
    LoadIndexScene,

    /* ----------------微信--------------- */

    LoginSuccess,
    InitRankList,

    /* ----------------UI----------------- */

    OpenPanel,
    ClosePanel,

    // InitSelectPanel,
    /**
     * 打开选择关卡面板
     */
    OpenSelectLevelPanel,
    /**
     * 关闭选择关卡面板
     */
    CloseSelectLevelPanel,

    OpenLoadPage,
    CloseLoadPage,
    UpdateProgress,

    ShowFailPanel,
    ShowWinPanel,

    OpenCtrlPlayer,
    CloseCtrlPlayer,



    /* --------------角色----------------- */
    InitPlayer,
    InitPlayerComplete,

    MoveButDown,
    MoveButUp,
    JumpButDown,
    hangeSpeedYPlayer,

    ChangeSpeedYPlayer,
    ApplyImpulsionToPlayer,
    GivePlayerConstantSpeed,
    RemovePlayerConstantSpeed,
    InVerMovedEntity,
    ExitVerMovedEntiry,
    CanRotate,

    Dead,
    Win,

    /* --------------摄像机----------------- */
    StopCameraFollow,
    StartCameraFollow,
    CheckPlayerOutFace,
    PlayerOutFace,
    InitCamera,

    /* --------------水果----------------- */
    FruitMgrNotice,
    DeleteFruit,

    /* --------------计分系统----------------- */
    AddScore,
    /**打分 */
    MakeScore,
    InitScoreMgr,

    /* --------------滚动背景----------------- */
    ActiveRunBackGround,
}


export default class EventManager {

    static ins: EventManager;
    static init() {
        if (this.ins) {
            console.warn("重复初始化");
            return;
        }

        this.ins = new EventManager();
    }

    private eventCenter: EventCenter;

    private constructor() {
        this.eventCenter = new EventCenter();
    }

    onEvent(type: EventType, callBack: Function, target: any) {
        this.eventCenter.addSubscribe(target, type.toString(), callBack);
    }

    onEventOnce(type: EventType, callBack: Function, target: any) {
        let self = this;
        this.eventCenter.addSubscribe(target, type.toString(), (d) => {
            callBack.call(target, d);
            self.eventCenter.cancelSubscribe(target, type.toString());
        });
    }

    sendEvent(type: EventType, date?: any) {
        this.eventCenter.publishEvent(type.toString(), date);
    }


    /**
     * 删除该订阅者所有订阅
     * @param subscriber this
     */
    deleteSubscriber(subscriber: any) {
        this.eventCenter.deleteSubscriber(subscriber);
    }

}