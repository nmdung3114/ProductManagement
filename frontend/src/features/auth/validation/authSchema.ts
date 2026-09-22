import { z } from "zod";
// kiểm tra dữ liệu form đăng nhập 
export const loginSchema = z.object({
    email: z
        .string()
        .min(1,'Email không được để trống')
        .email('Email không hợp lệ'),
    password: z
        .string()
        .min(1,'Mật khẩu không được để trống')
        .min(6,'Mật khẩu tối thiểu 6 ký tự'),
});

// tạo type typescript tự động từ loginSchema
export type LoginFormData = z.infer<typeof loginSchema>;

//schema kiểm tra dữ liệu của form đăng kí
export const registerSchema = z.object({
    fullName: z
        .string()
        .min(1,'Họ tên không được để trống')
        .max(100,'Họ tên không được vượt quá 100 ký tự'),

    email: z
        .string()
        .min(1,'Email không được để trống')
        .email('Email không hợp lệ'),
    password: z
        .string()
        .min(1,'Mật khẩu không được để trống')
        .min(6,'Mật khẩu tối thiểu 6 ký tự'),
    confirmPassword: z
        .string()
        .min(1,'Xác nhận mật khẩu không được để trống')
        .min(6,'Xác nhận mật khẩu tối thiểu 6 ký tự'),
})
// kiểm tra xem password và passwordConfirm có giống nhau không
.refine(data => data.password ===data.confirmPassword,{
    message:"Mật khẩu và xác nhận mật khẩu không giống nhau",
    path:["confirmPassword"],
})

// tạo type typescript tự động từ registerSchema
export type RegisterFormData = z.infer<typeof registerSchema>;