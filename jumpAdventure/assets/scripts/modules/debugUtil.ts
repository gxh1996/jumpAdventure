/**
 * 用于debug的key
 */
const DebugKey = cc.Enum({
    GameLogic: "GameLogic",

    FruitManager: "FruitManager",
    Box: "Box",
    Block: "Block",
    PlayerState: "PlayerState",
    BlowWind: "BlowWind",
    ClickButton: "ClickButton",
    Fire: "Fire",
    MovedPlatformBg: "MovedPlatformBg",
    Property: "Property",
    RockHead: "RockHead",
    LoadPage: "LoadPage"
})

export { DebugKey };

export default class DebugUtil {

    static ins: DebugUtil;
    static init() {
        this.ins = new DebugUtil();
    }

    private keys: Map<string, boolean>;

    private constructor() {
        this.keys = new Map();
    }

    /**
     * @param key DebugKey
     * @param str 输出内容
     */
    log(key: string, str: string, data?: any) {
        if (this.keys[key]) {

            console.log(`#DEBUG-${key}:${str}`, data || "");
        }

    }

    /**
     * 所有的DebugKey默认是关的
     */
    openDebug(key: string) {
        this.keys[key] = true;
    }
}
