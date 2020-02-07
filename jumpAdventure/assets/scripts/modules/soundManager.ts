import ResManager from "./resManager/resManager";

export default class SoundsManager {

    static ins: SoundsManager = null;

    static init() {
        this.ins = new SoundsManager();
    }

    ''
    private isOpenSounds: boolean = true;

    openSound() {
        this.playBGM("sounds/BGM");
    }

    closeSound() {
        if (this.isOpenSounds)
            this.pauseBGM();
        this.isOpenSounds = false;
    }

    /**
     * 播放背景音乐
     * @param url 文件路径
     */
    playBGM(url: string, v?: number) {
        this.isOpenSounds = true;

        if (v)
            cc.audioEngine.setMusicVolume(v);
        cc.audioEngine.playMusic(ResManager.ins.getRes(url, cc.AudioClip), true);
    }

    pauseBGM() {
        this.isOpenSounds = false;
        cc.audioEngine.pauseMusic();
    }

    /**
     * 播放音效
     * @param url 文件路径
     */
    playEffect(url: string, v?: number) {
        if (!this.isOpenSounds)
            return;

        if (v)
            cc.audioEngine.setEffectsVolume(v);
        cc.audioEngine.playEffect(ResManager.ins.getRes(url, cc.AudioClip), false);
    }

}
