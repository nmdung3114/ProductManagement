// ============================================================
// File: CreateCategoryCommand.cs – Feature: Categories / CreateCategory
// Vai trò: Command (yêu cầu ghi dữ liệu) để tạo danh mục mới.
// Chỉ Admin mới được gọi endpoint này.
// Được validate bởi CreateCategoryCommandValidation trước khi
// đến Handler (qua ValidationBehavior trong MediatR pipeline).
// ============================================================

using MediatR;

namespace ProductManagement.Application.Features.Categories.CreateCategory;

/// <summary>Command tạo danh mục mới – chỉ Admin.</summary>
public record CreateCategoryCommand(
    string Name,
    string? Description) : IRequest<Guid>;