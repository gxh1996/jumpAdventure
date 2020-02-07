import IDataStorage from "./interface/IDataStorage";
import WXCloud from "../indexScene/wx/wxCloud";

export default class DataStorage implements IDataStorage {
    static ins: DataStorage;
    static init() {
        this.ins = new DataStorage();
    }

    setStorage(key: string, data: any) {
        wx.setStorage({
            key: key,
            data: data,
            success: () => {
                console.log("本地缓存成功");
            },
            fail: () => {
                console.log("本地缓存成功");
            },
            complete: () => {
                console.log(`缓存内容为{${key}:${data}`);
            }
        })
    }

    getStorage(key: string, success: (data: any) => void) {
        wx.getStorage({
            key: key,
            success: (data) => {
                console.log("获取本地缓存数据成功,data:", data);
                success(data);
            },
            fail: (e) => {
                console.log("获取本地缓存数据失败", e);
            },
            complete: () => {
                console.log("本地缓存数据key:", key);
            }
        })
    }
    getStorageSync(key: string): any {
        let r: any;
        try {
            r = wx.getStorageSync(key);
        }
        catch (e) {
            console.log("获取本地缓存数据key失败");
        }
        return r;
    }

    downloadData(key: string, success: (res) => void) {
        WXCloud.ins.Query(key, success);
    }

    uploadData(key: string, data: any) {
        WXCloud.ins.update(key, data);
    }

    addData(key: string, data: any) {
        WXCloud.ins.add(key, data);
    }
}