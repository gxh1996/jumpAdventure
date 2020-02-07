
export default class Global {
    static ins: Global = new Global();

    private constructor() {
    }

    /**
     * 游戏是否启动过
     */
    isSetup: boolean = false;
    /**
     * 首次初始化选关面板
     */
    isFirstInitSelectPanel: boolean = true;

    /**
     * 当前为关卡几
     */
    curLevelNum: number;

    /**微信唯一标识 */
    openid: string;
}