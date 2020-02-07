export default interface IDataStorage {

    /**
     * 将数据存储到本地
     * @param key 
     * @param data 
     */
    setStorage(key: string, data: any);

    /**
     * 得到本地数据
     * @param key 
     */
    getStorage(key: string, success: (data: any) => void): any;
    /**同步获取本地数据 */
    getStorageSync(key: string): any;

    /**
     * 上传数据
     * @param key 
     * @param data 
     */
    uploadData(key: string, data: any);

    /**
     * 下载数据
     * @param key 
     */
    downloadData(key: string, success: (res) => void)
}