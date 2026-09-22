// ============================================================
// File: Program.cs – Tầng API (Entry Point)
// Vai trò: Điểm khởi đầu của ứng dụng. Cấu hình và đăng ký:
//   - Database: SQL Server + EF Core
//   - Identity: ASP.NET Identity với ApplicationUser
//   - Authentication: JWT Bearer
//   - Services: CQRS (MediatR), FluentValidation, DI services
//   - Middleware Pipeline: Exception Handler, CORS, Auth, Controllers
//   - Swagger: với JWT security definition
// ============================================================

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using ProductManagement.Application.Common.Interfaces;
using ProductManagement.Application.Features.Auth.Register;
using ProductManagement.Infrastructure.Identity;
using ProductManagement.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using ProductManagement.Infrastructure.Persistence.Interceptors;
using ProductManagement.Infrastructure.Authorization;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using System.Text;
using ProductManagement.Infrastructure.Services;
using Microsoft.OpenApi.Models;
using FluentValidation;
using MediatR;
using ProductManagement.Application.Common.Behaviors;
using ProductManagement.Application.Features.Auth.Login;
using ProductManagement.Api.Middlewares;

var builder = WebApplication.CreateBuilder(args);

// ── CORS ──────────────────────────────────────────────────────
// Cho phép frontend (mọi origin) kết nối với backend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.SetIsOriginAllowed(origin => true)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});
// Đăng ký HttpContextAccessor & CurrentUserService
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();

// Đăng ký interceptor là Singleton để tránh lỗi DI lifetime với DbContext
// (Interceptor tự resolve ICurrentUserService bên trong via IHttpContextAccessor)
builder.Services.AddSingleton<AuditLogSaveChangesInterceptor>();

// Cấu hình AddDbContext sử dụng Interceptor:
builder.Services.AddDbContext<AppDbContext>((sp, options) =>
{
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"));
    options.AddInterceptors(sp.GetRequiredService<AuditLogSaveChangesInterceptor>());
});

// ── IDENTITY ──────────────────────────────────────────────────
builder.Services.AddIdentity<ApplicationUser, ApplicationRole>()
    .AddEntityFrameworkStores<AppDbContext>()
    .AddDefaultTokenProviders();

// ── JWT AUTHENTICATION ────────────────────────────────────────
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(builder.Configuration["Jwt:SecretKey"]!)),
        ValidateIssuer = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidateAudience = true,
        ValidAudience = builder.Configuration["Jwt:Audience"],
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero, // không cho phép sai lệch thời gian
        RoleClaimType = ClaimTypes.Role,
        NameClaimType = ClaimTypes.NameIdentifier
    };

    // Custom response cho 401/403 dạng JSON
    options.Events = new JwtBearerEvents
    {
        OnChallenge = async context =>
        {
            context.HandleResponse();
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            context.Response.ContentType = "application/json";
            await context.Response.WriteAsJsonAsync(new
            {
                success = false,
                message = "Bạn chưa đăng nhập hoặc token không hợp lệ."
            });
        },
        OnForbidden = async context =>
        {
            context.Response.StatusCode = StatusCodes.Status403Forbidden;
            context.Response.ContentType = "application/json";
            await context.Response.WriteAsJsonAsync(new
            {
                success = false,
                message = "Bạn không có quyền thực hiện thao tác này."
            });
        }
    };
});

// ── APPLICATION SERVICES ──────────────────────────────────────
builder.Services.AddScoped<IAppDbContext>(provider => provider.GetRequiredService<AppDbContext>());
builder.Services.AddScoped<IIdentityService, IdentityService>();
builder.Services.AddScoped<IJwtService, JwtService>();
builder.Services.AddScoped<ICategoryService, CategoryService>();
builder.Services.AddScoped<IProductService, ProductService>();
builder.Services.AddScoped<IOrderService, OrderService>();
builder.Services.AddScoped<IRoleService, RoleService>();

// ── PERMISSION-BASED AUTHORIZATION ───────────────────────────
builder.Services.AddMemoryCache();
builder.Services.AddSingleton<IAuthorizationPolicyProvider, PermissionAuthorizationPolicyProvider>();
builder.Services.AddScoped<IAuthorizationHandler, PermissionAuthorizationHandler>();


// ── MEDIATR (CQRS) ────────────────────────────────────────────
// Quét tất cả Commands/Queries/Handlers từ Application assembly
builder.Services.AddMediatR(cfg =>
    cfg.RegisterServicesFromAssembly(typeof(RegisterCommand).Assembly));

// ── FLUENTVALIDATION ──────────────────────────────────────────
// Quét tất cả validators từ Application assembly
builder.Services.AddValidatorsFromAssemblyContaining<LoginCommandValidation>();

// ── VALIDATION PIPELINE BEHAVIOR ─────────────────────────────
// Tự động chạy validation trước mỗi Handler
builder.Services.AddTransient(
    typeof(IPipelineBehavior<,>),
    typeof(ValidationBehavior<,>));

// ── CONTROLLERS & SWAGGER ─────────────────────────────────────
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
    });
builder.Services.AddEndpointsApiExplorer();

// Swagger với JWT security
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Product Management API",
        Version = "v1",
        Description = "API quản lý sản phẩm – Clean Architecture + CQRS"
    });

    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Nhập JWT token. Ví dụ: Bearer {token}"
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();


// ── MIDDLEWARE PIPELINE ───────────────────────────────────────
// Thứ tự quan trọng: Exception → Swagger → CORS → Auth → Controllers

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseMiddleware<GlobalExceptionHandlerMiddleware>(); // bắt mọi exception
app.UseCors("AllowFrontend");                          // cho phép cross-origin
app.UseAuthentication();                               // xác thực JWT
app.UseAuthorization();                                // kiểm tra quyền
app.MapControllers();                                  // map routes

// seed dữ liệu mặc định (roles, permissions, admin user)
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var roleManager = services.GetRequiredService<RoleManager<ApplicationRole>>();
        var userManager = services.GetRequiredService<UserManager<ApplicationUser>>();
        var context = services.GetRequiredService<AppDbContext>();
        await IdentitySeeder.SeedAsync(roleManager, userManager, context);
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "Lỗi khi seed dữ liệu mặc định.");
    }
}

app.Run();