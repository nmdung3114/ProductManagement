// cấu trúc thông tin người dùng (khớp với UserDto ở phía Backend)
export interface User{
    id: string;
    email: string;
    fullName: string;
    roles: string[];
}
// dữ liệu gửi đi khi đăng kí (khớp với RegisterCommand ở phía backend)
export interface RegisterRequest{
    email: string;
    password: string;
    fullName: string;
}
//dữ liệu gửi đi khi đăng nhập ( Khớp với LoginCommand ở phía backend)
export interface LoginRequest{
    email: string;
    password: string;
}
// dữ liệu nhận về khi đăng nhập thành công (khớp với AuthController.Login)
export interface AuthResponse{
    message: string;
    token: string;
    expiresAt: string;
    user: User;
}
//cấu trúc lỗi trả về từ backend khi có lỗi validate 400 hoặc unauth 401
export interface ApiErrorResponse{
    success: boolean;
    message: string;
    errors?: Record<string, string[]>;
}
    

