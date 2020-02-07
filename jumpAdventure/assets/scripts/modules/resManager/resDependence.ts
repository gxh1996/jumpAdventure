
/**
 * 资源依赖使用信息
 */
class ResDependInfo {
    /**
     * 我被哪些资源依赖 uuid
     */
    dependeds: Set<string>;
    /**
     * 我在哪里被使用:scripts/...
     */
    users: Set<string>;
}

interface CCLoader {
    /**资源缓存信息 */
    _cache: { [anyName: string]: any };
    /**url与uuid的对应关系 */
    assetTables: {
        /**用户资源 */
        assets: {
            _pathToUuid: {
                /**类型可能是对象或数组 */
                [anyName: string]: any
            }
        },
        /**内置资源 */
        internal: {
            _pathToUuid: {
                /**类型可能是对象或数组 */
                [anyName: string]: any
            }
        }
    }

    /**
     * 根据url得到自由uuid
     * @param url 路径
     * @param type 资源类型
     * @param mount 默认为'assets'
     * @param quiet 暂时不管
     */
    _getResUuid(url: string, type: typeof cc.Asset, mount?: string, quiet?: any): string;
    /**
     * 得到依赖Key。建议用uuid找
     * @param assetOrUrlOruuid 用url时该路径下必须只有一个资源，不然可能会出错 
     */
    _getReferenceKey(assetOrUrlOruuid: string | cc.Asset): string;
}

/**
 * 资源依赖管理类
 */
export default class ResDependence {

    /**
     * 资源依赖信息字典
     */
    private resMap: Map<string, ResDependInfo> = new Map<string, ResDependInfo>();

    private ccloader: CCLoader = <any>cc.loader;

    /**
     * 递归地告诉资源key依赖的资源，我依赖着你
     */
    recordDependence(key: string) {
        this.getResDependInfo(key);
        this._recordDependence(key);
    }
    private _recordDependence(key: string) {
        let dependKeys: string[] = this.getDependKeys(key);
        if (dependKeys) {
            // console.log(`资源${key}依赖的资源有${dependKeys}`);
            let depKey: string;
            let rd: ResDependInfo;
            for (depKey of dependKeys) {
                rd = this.getResDependInfo(depKey);
                rd.dependeds.add(key);

                //记录资源depKey依赖的资源
                this.recordDependence(depKey);
            }
        }
    }

    /**
     * 删除该资源的依赖信息
     * @param key cc.loader._cache.id
     */
    deleteResDependInfo(key: string) {
        this.resMap.delete(key);
    }

    /**
     * 得到记录的所有资源的key值
     */
    getAllResMapKeys(): IterableIterator<string> {
        return this.resMap.keys();
    }

    /**
     * 删除其使用引用
     * @param url 
     * @param user 
     */
    removeUse(key: string | string[], user: string) {
        let self = this;
        if (Array.isArray(key)) {
            for (let k of <string[]>key)
                this._removeUse(k, user);
        }
        else
            this._removeUse(key, user);
    }
    private _removeUse(key: string, user: string) {
        let rd: ResDependInfo = this.getResDependInfo(key);
        rd.users.delete(user);
    }

    /**
    * 记录其使用引用
    * @param url
    * @param user
    */
    recordUse(key: string | string[], user: string) {
        if (Array.isArray(key))
            for (let k of <string[]>key)
                this._recordUse(k, user);
        else
            this._recordUse(key, user);

    }
    private _recordUse(key: string, user: string) {
        let rd: ResDependInfo = this.getResDependInfo(key);
        rd.users.add(user);
    }

    /**
     * 得到该资源的依赖键值数组
     * @param key _cache的键值
     * @returns 存在返回key数组，没有返回null
     */
    getDependKeys(key: string): string[] {
        let ccloader: any = cc.loader;
        let cacheInfo = ccloader._cache[key];
        if (!cacheInfo) {
            console.warn(`不存在${key}`);
            //该资源已经被释放
            return null;
        }

        if ("dependKeys" in cacheInfo) {
            let dependKeys: any = cacheInfo.dependKeys;
            if (dependKeys && Array.isArray(dependKeys) && dependKeys.length > 0)
                return dependKeys;
        }

        return null;
    }

    /**得到依赖Key */
    getCacheKey(url: string, type: typeof cc.Asset): string;
    getCacheKey(uuid: string): string;
    getCacheKey(asset: cc.Asset): string;
    getCacheKey() {
        let arg = arguments;
        if (typeof arg[0] === "string") {
            if (arg[1]) {
                let uuid: string = this.ccloader._getResUuid(arg[0], arg[1]);
                return this.ccloader._getReferenceKey(uuid);
            }
            else
                return this.ccloader._getReferenceKey(arg[0]);
        }
        else if (typeof arg[0] === "object")
            return this.ccloader._getReferenceKey(arg[0]);
    }

    /**
     * 得到_cache信息块
     * @param key
     */
    getCacheItem(key: string): any {
        let ccloader: any = cc.loader;
        let cacheInfo = ccloader._cache[key];
        return cacheInfo;
    }

    /**
     * 递归地释放资源
     * @param key 
     */
    releaseResRecursion(key: string) {
        //先尝试释放依赖我的资源
        let depeds: string[] = this.getDependedKeys(key);
        if (depeds && Array.isArray(depeds) && depeds.length > 0) {
            let i: number;
            for (i = 0; i < depeds.length; i++)
                this.releaseResRecursion(depeds[i]);
        }

        //如果该资源没有被其他资源依赖，并且没有被使用，就先移除对其他资源的依赖并释放自己
        if (this.releaseEnable(key)) {
            let item = this.getCacheItem(key);
            if (!item && this.resMap.has(key)) {
                //该资源已经被释放
                if (!this.releaseEnable(key))
                    console.error(`该资源被释放了，但还有资源依赖着它${key}`);
                this.resMap.delete(key);
                return;
            }

            let deps: string[] = item.dependKeys;
            if (deps && Array.isArray(deps) && deps.length > 0) {
                let i: number;
                for (i = 0; i < deps.length; i++)
                    this.removeDepended(key, deps[i]);
            }

            this.releaseOneRes(key);
        }
    }

    /**
     * 得到该资源被哪些资源依赖 
     */
    private getDependedKeys(key: string): string[] {
        let set: Set<string> = this.getResDependInfo(key).dependeds;
        return this.convertIteratorToArray(set.values());
    }

    private convertIteratorToArray(it: Iterator<any>): any[] {
        let arr: string[] = [];
        let v: string;
        while (v = it.next().value) {
            arr.push(v);
        }
        return arr;
    }

    /**
     * 释放单个资源
     */
    private releaseOneRes(key: string) {
        let item: any = this.getCacheItem(key);
        if (item.uuid) {
            cc.loader.release(item.uuid);
            // console.log("通过uuid释放资源", item);
        } else if (item.id) {
            cc.loader.release(item.id);
            // console.log("通过id释放资源", item);
        }
        else {
            console.warn("资源释放失败", item);
        }
        this.resMap.delete(key);
    }

    /**
     * 是否能释放该资源
     */
    releaseEnable(key: string): boolean {
        let rd: ResDependInfo = this.resMap.get(key);
        if (!rd) {
            console.error("没有这个资源的记录");
            return false;
        }

        if (rd.dependeds.size === 0 && rd.users.size === 0)
            return true;
        return false;
    }

    /**
     * 移除key对depK的依赖
     */
    private removeDepended(key: string, depK: string) {
        let rd: ResDependInfo = this.getResDependInfo(depK);
        rd.dependeds.delete(key);
    }

    /**
     * 得到该资源的 资源依赖使用信息。没有就创建一个加入resMap并返回
     * @param string
     */
    private getResDependInfo(key: string): ResDependInfo {
        if (this.resMap.has(key))
            return this.resMap.get(key);
        else {
            let rd: ResDependInfo = new ResDependInfo();
            rd.dependeds = new Set<string>();
            rd.users = new Set<string>();

            this.resMap.set(key, rd);
            return rd;
        }
    }


}
