// ============================================================
// File: CategoryService.cs – Tầng Infrastructure / Services
// Vai trò: Triển khai ICategoryService, tương tác trực tiếp
// với AppDbContext để thực hiện các thao tác CRUD cho danh mục.
// ============================================================

using Microsoft.EntityFrameworkCore;
using ProductManagement.Application.Common.Exceptions;
using ProductManagement.Application.Common.Interfaces;
using ProductManagement.Application.Common.Models;
using ProductManagement.Domain.Entities;
using ProductManagement.Infrastructure.Persistence;

namespace ProductManagement.Infrastructure.Services;

public class CategoryService : ICategoryService
{
    private readonly AppDbContext _context;

    public CategoryService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<PagedResult<Category>> GetCategoriesAsync(
        string? name,
        bool? isActive,
        int page,
        int pageSize,
        CancellationToken cancellationToken = default)
    {
        var query = _context.Categories
            .Include(c => c.Products)
            .AsNoTracking()
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(name))
            query = query.Where(c => c.Name.Contains(name));

        if (isActive.HasValue)
            query = query.Where(c => c.IsActive == isActive.Value);

        query = query.OrderBy(c => c.Name);

        return await PagedResult<Category>.CreateAsync(query, page, pageSize, cancellationToken);
    }

    public async Task<Category?> GetCategoryByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Categories
            .Include(c => c.Products.Where(p => p.IsActive))
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);
    }

    public async Task<Guid> CreateCategoryAsync(
        string name,
        string? description,
        CancellationToken cancellationToken = default)
    {
        // Kiểm tra tên danh mục không trùng
        var nameExists = await _context.Categories
            .AnyAsync(c => c.Name == name, cancellationToken);
        if (nameExists)
            throw new InvalidOperationException($"Danh mục '{name}' đã tồn tại.");

        var category = new Category(name, description);
        _context.Categories.Add(category);
        await _context.SaveChangesAsync(cancellationToken);

        return category.Id;
    }

    public async Task UpdateCategoryAsync(
        Guid id,
        string name,
        string? description,
        CancellationToken cancellationToken = default)
    {
        var category = await _context.Categories
            .FirstOrDefaultAsync(c => c.Id == id, cancellationToken)
            ?? throw new NotFoundException("Danh mục", id);

        // Kiểm tra tên không trùng với danh mục khác
        var nameConflict = await _context.Categories
            .AnyAsync(c => c.Name == name && c.Id != id, cancellationToken);
        if (nameConflict)
            throw new InvalidOperationException($"Tên danh mục '{name}' đã được sử dụng.");

        category.Update(name, description);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteCategoryAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var category = await _context.Categories
            .FirstOrDefaultAsync(c => c.Id == id, cancellationToken)
            ?? throw new NotFoundException("Danh mục", id);

        category.Deactivate();
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task RestoreCategoryAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var category = await _context.Categories
            .FirstOrDefaultAsync(c => c.Id == id, cancellationToken)
            ?? throw new NotFoundException("Danh mục", id);

        category.Activate();
        await _context.SaveChangesAsync(cancellationToken);
    }
}