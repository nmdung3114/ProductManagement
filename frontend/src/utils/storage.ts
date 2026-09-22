import { STORAGE_KEYS } from "../config/constants";
export const storage ={
    // lấy Access token
    getToken: ():string|null =>{
        return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    },
    // lưu Access token
    setToken: (token:string):void =>{
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
    },
    //lấy thong tin của người dùng
    getUser: <T>():T|null =>{
        const data = localStorage.getItem(STORAGE_KEYS.USER_INFO);
        if(!data) return null;
        try{
            return JSON.parse(data) as T;
        }
        catch{
            return null;
        }
    },
    // lưu thông tin người dùng
    setUser: <T>(user: T): void => {
        localStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(user));
    },
    // xóa tất cả thông tin khi logout
    clearAuth: (): void => {
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER_INFO);
    },
}

