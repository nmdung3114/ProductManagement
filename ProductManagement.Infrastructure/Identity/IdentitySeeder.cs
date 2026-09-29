using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using ProductManagement.Domain.Constants;
using ProductManagement.Domain.Entities;
using ProductManagement.Infrastructure.Persistence;

namespace ProductManagement.Infrastructure.Identity;

public class IdentitySeeder
{
    public static async Task SeedAsync(
        RoleManager<ApplicationRole> roleManager,
        UserManager<ApplicationUser> userManager,
        AppDbContext context)
    {
        // ============================================================
        // 1. Seed PermissionGroups
        // ============================================================

        var allGroups = PermissionGroups.GetAll();
        foreach (var (groupName, description, displayOrder) in allGroups)
        {
            if (!await context.PermissionGroups.AnyAsync(g => g.Name == groupName))
            {
                context.PermissionGroups.Add(new PermissionGroup
                {
                    Id           = Guid.NewGuid(),
                    Name         = groupName,
                    Description  = description,
                    DisplayOrder = displayOrder
                });
            }
        }
        await context.SaveChangesAsync();

        var groupDict = await context.PermissionGroups
            .ToDictionaryAsync(g => g.Name, g => g.Id);

        // ============================================================
        // 2. Seed Permissions
        // ============================================================

        foreach (var (name, groupName, description) in Permissions.GetAll())
        {
            if (groupDict.TryGetValue(groupName, out var groupId)
                && !await context.Permissions.AnyAsync(p => p.Name == name))
            {
                context.Permissions.Add(new Permission
                {
                    Id                = Guid.NewGuid(),
                    Name              = name,
                    PermissionGroupId = groupId,
                    Description       = description
                });
            }
        }
        await context.SaveChangesAsync();

        // ============================================================
        // 3. Seed tất cả Roles
        // ============================================================

        var roleDefinitions = new[]
        {
            (Roles.Admin,            "Quản trị viên toàn hệ thống",               true),
            (Roles.InventoryManager, "Quản lý kho & sản phẩm",                    false),
            (Roles.SalesStaff,       "Nhân viên bán hàng / xử lý đơn hàng",       false),
            (Roles.Auditor,          "Kiểm toán viên – chỉ đọc",                  false),
            (Roles.User,             "Người dùng / Khách hàng",                   true),
        };

        foreach (var (name, description, isSystem) in roleDefinitions)
        {
            if (!await roleManager.RoleExistsAsync(name))
            {
                await roleManager.CreateAsync(new ApplicationRole
                {
                    Name         = name,
                    Description  = description,
                    IsSystemRole = isSystem,
                });
            }
        }

        // ============================================================
        // 4. Seed Permissions cho từng Role theo Ma trận Phân quyền
        // ============================================================

        var permDict = await context.Permissions
            .ToDictionaryAsync(p => p.Name, p => p.Id);

        // Helper: gán permission vào role nếu chưa có
        async Task AssignPermissionAsync(string roleName, string permName)
        {
            var role = await roleManager.FindByNameAsync(roleName);
            if (role == null || !permDict.TryGetValue(permName, out var permId)) return;
            if (!await context.RolePermissions.AnyAsync(rp => rp.RoleId == role.Id && rp.PermissionId == permId))
            {
                context.RolePermissions.Add(new RolePermission { RoleId = role.Id, PermissionId = permId });
            }
        }

        // ─── Admin: Tất cả quyền ────────────────────────────────────
        var adminRole = await roleManager.FindByNameAsync(Roles.Admin);
        if (adminRole != null)
        {
            foreach (var perm in await context.Permissions.ToListAsync())
            {
                if (!await context.RolePermissions.AnyAsync(rp => rp.RoleId == adminRole.Id && rp.PermissionId == perm.Id))
                    context.RolePermissions.Add(new RolePermission { RoleId = adminRole.Id, PermissionId = perm.Id });
            }
        }

        // ─── InventoryManager: Kho + Sản phẩm + Danh mục + Xem đơn ─
        await AssignPermissionAsync(Roles.InventoryManager, Permissions.Category.View);
        await AssignPermissionAsync(Roles.InventoryManager, Permissions.Category.Create);
        await AssignPermissionAsync(Roles.InventoryManager, Permissions.Category.Update);
        await AssignPermissionAsync(Roles.InventoryManager, Permissions.Category.Delete);
        await AssignPermissionAsync(Roles.InventoryManager, Permissions.Product.View);
        await AssignPermissionAsync(Roles.InventoryManager, Permissions.Product.Create);
        await AssignPermissionAsync(Roles.InventoryManager, Permissions.Product.Update);
        await AssignPermissionAsync(Roles.InventoryManager, Permissions.Product.Delete);
        await AssignPermissionAsync(Roles.InventoryManager, Permissions.Order.View);        // Xem đơn để xuất kho
        await AssignPermissionAsync(Roles.InventoryManager, Permissions.Order.UpdateStatus);// Cập nhật trạng thái giao hàng

        // ─── SalesStaff: Bán hàng – xem sản phẩm, xử lý đơn, xem khách ─
        await AssignPermissionAsync(Roles.SalesStaff, Permissions.Category.View);
        await AssignPermissionAsync(Roles.SalesStaff, Permissions.Product.View);
        await AssignPermissionAsync(Roles.SalesStaff, Permissions.Order.View);
        await AssignPermissionAsync(Roles.SalesStaff, Permissions.Order.Create);
        await AssignPermissionAsync(Roles.SalesStaff, Permissions.Order.UpdateStatus);
        await AssignPermissionAsync(Roles.SalesStaff, Permissions.User.View);              // Xem thông tin liên hệ KH

        // ─── Auditor: Kiểm toán – chỉ đọc tất cả ──────────────────
        await AssignPermissionAsync(Roles.Auditor, Permissions.Category.View);
        await AssignPermissionAsync(Roles.Auditor, Permissions.Product.View);
        await AssignPermissionAsync(Roles.Auditor, Permissions.Order.View);
        await AssignPermissionAsync(Roles.Auditor, Permissions.User.View);
        await AssignPermissionAsync(Roles.Auditor, Permissions.Role.View);

        // ─── User (Customer): Xem sản phẩm & danh mục, tạo đơn ────
        await AssignPermissionAsync(Roles.User, Permissions.Category.View);
        await AssignPermissionAsync(Roles.User, Permissions.Product.View);
        await AssignPermissionAsync(Roles.User, Permissions.Order.Create);

        await context.SaveChangesAsync();

        // ============================================================
        // 5. Seed tài khoản Admin mặc định
        // ============================================================

        await EnsureUserAsync(userManager, "admin@gmail.com", "Admin@123", "Quản trị viên toàn hệ thống", Roles.Admin);

        // ============================================================
        // 6. Seed tài khoản test cho các Role mới (chỉ môi trường dev)
        // ============================================================

        await EnsureUserAsync(userManager, "inventory@gmail.com",  "Password123!", "Quản lý kho Nguyễn Văn A", Roles.InventoryManager);
        await EnsureUserAsync(userManager, "sales@gmail.com",      "Password123!", "NVKD Trần Thị B",          Roles.SalesStaff);
        await EnsureUserAsync(userManager, "auditor@gmail.com",    "Password123!", "Kiểm toán Lê Văn C",       Roles.Auditor);
        await EnsureUserAsync(userManager, "customer@gmail.com",   "Password123!", "Khách hàng Phạm Thị D",    Roles.User);

        // ============================================================
        // 7. Seed dữ liệu mẫu Category & Product
        // ============================================================

        if (!await context.Categories.AnyAsync())
        {
            var catPhone  = new Category("Điện thoại & Tablet",  "Các dòng di động thông minh, máy tính bảng cao cấp");
            var catLaptop = new Category("Laptop & Máy tính",    "Máy tính xách tay phục vụ công việc, đồ họa, gaming");
            var catAudio  = new Category("Thiết bị Âm thanh",    "Tai nghe chống ồn, loa Bluetooth cao cấp");
            var catAcc    = new Category("Phụ kiện Công nghệ",   "Bàn phím, chuột, sạc nhanh và cáp kết nối");

            context.Categories.AddRange(catPhone, catLaptop, catAudio, catAcc);
            await context.SaveChangesAsync();

            if (!await context.Products.AnyAsync())
            {
                var products = new[]
                {
                    new Product("iPhone 15 Pro Max 256GB",         "IP15PM-256",    34990000m, 25, catPhone.Id,  "Chip A17 Pro, Khung Titanium cao cấp"),
                    new Product("Samsung Galaxy S24 Ultra 512GB",  "SS-S24U-512",   31490000m, 18, catPhone.Id,  "AI Galaxy thông minh, Camera 200MP"),
                    new Product("MacBook Pro 14 M3 Pro",           "MBP14-M3PRO",   49990000m, 10, catLaptop.Id, "Chip M3 Pro 18GB RAM, màn hình ProMotion 120Hz"),
                    new Product("Dell XPS 13 9340",                "DELL-XPS13",    39900000m, 12, catLaptop.Id, "Intel Core Ultra 7, Màn hình OLED Touch"),
                    new Product("Tai nghe Sony WH-1000XM5",        "SONY-XM5-BLK",  8490000m, 30, catAudio.Id,  "Tai nghe chụp tai chống ồn chủ động đỉnh cao"),
                    new Product("Chuột Logitech MX Master 3S",     "LOGI-MX3S-GRY", 2490000m, 45, catAcc.Id,    "Cảm biến 8K DPI, sạc nhanh USB-C"),
                    new Product("Bàn phím cơ Keychron K2 Pro",     "KEY-K2PRO",     2150000m, 20, catAcc.Id,    "Layout 75%, Hotswap, Wireless Bluetooth 5.1"),
                    new Product("Loa Bluetooth Marshall Stanmore III", "MARSH-STAN3", 9990000m, 15, catAudio.Id, "Thiết kế cổ điển, công suất 80W, âm thanh đa hướng"),
                };
                context.Products.AddRange(products);
                await context.SaveChangesAsync();
            }
        }
    }

    // ────────────────────────────────────────────────────────────────
    // Helper: tạo user nếu chưa tồn tại và gán role
    // ────────────────────────────────────────────────────────────────
    private static async Task EnsureUserAsync(
        UserManager<ApplicationUser> userManager,
        string email,
        string password,
        string fullName,
        string role)
    {
        if (await userManager.FindByEmailAsync(email) != null) return;

        var user = new ApplicationUser
        {
            UserName       = email,
            Email          = email,
            FullName       = fullName,
            IsActive       = true,
            EmailConfirmed = true,
            CreatedAt      = DateTime.UtcNow
        };

        var result = await userManager.CreateAsync(user, password);
        if (result.Succeeded)
        {
            await userManager.AddToRoleAsync(user, role);
        }
        else
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            throw new Exception($"Không thể tạo tài khoản [{email}]: {errors}");
        }
    }
}