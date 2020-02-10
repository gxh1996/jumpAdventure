
export default class Global {
    static ins: Global = new Global();

    private constructor() {
    }

    /**
     * 游戏是否启动过
     */
    isSetup: boolean = false;

    /**是否记录了全局资源 */
    isRecordGlobalRes: boolean = false;

    isFirstInitSelectPanel: boolean = true;

    /**
     * 当前为关卡几
     */
    curLevelNum: number;

    /**微信唯一标识 */
    openid: string;
}