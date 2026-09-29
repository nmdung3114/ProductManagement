// ============================================================
// File: ProductService.cs – Tầng Infrastructure / Services
// Vai trò: Triển khai IProductService. Tương tác trực tiếp với
// AppDbContext để xử lý logic và truy vấn dữ liệu sản phẩm.
// ============================================================

using Microsoft.EntityFrameworkCore;
using ProductManagement.Application.Common.Exceptions;
using ProductManagement.Application.Common.Interfaces;
using ProductManagement.Application.Common.Models;
using ProductManagement.Domain.Entities;
using ProductManagement.Infrastructure.Persistence;

namespace ProductManagement.Infrastructure.Services;

public class ProductService : IProductService
{
    private readonly AppDbContext _context;

    public ProductService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<PagedResult<Product>> GetProductsAsync(
        string? name,
        string? sku,
        Guid? categoryId,
        decimal? minPrice,
        decimal? maxPrice,
        bool? isActive,
        string? sortBy,
        bool sortDescending,
        int page,
        int pageSize,
        CancellationToken cancellationToken = default)
    {
        var query = _context.Products
            .Include(p => p.Category)
            .AsNoTracking()
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(name))
            query = query.Where(p => p.Name.Contains(name));

        if (!string.IsNullOrWhiteSpace(sku))
            query = query.Where(p => p.SKU.Contains(sku));

        if (categoryId.HasValue)
            query = query.Where(p => p.CategoryId == categoryId.Value);

        if (minPrice.HasValue)
            query = query.Where(p => p.Price >= minPrice.Value);

        if (maxPrice.HasValue)
            query = query.Where(p => p.Price <= maxPrice.Value);

        if (isActive.HasValue)
            query = query.Where(p => p.IsActive == isActive.Value);

        query = (sortBy?.ToLower(), sortDescending) switch
        {
            ("stock", false)     => query.OrderBy(p => p.Stock),
            ("stock", true)      => query.OrderByDescending(p => p.Stock),
            ("price", false)     => query.OrderBy(p => p.Price),
            ("price", true)      => query.OrderByDescending(p => p.Price),
            ("name", false)      => query.OrderBy(p => p.Name),
            ("name", true)       => query.OrderByDescending(p => p.Name),
            ("createdat", false) => query.OrderBy(p => p.CreatedAt),
            ("createdat", true)  => query.OrderByDescending(p => p.CreatedAt),
            _                    => query.OrderByDescending(p => p.CreatedAt)
        };

        return await PagedResult<Product>.CreateAsync(query, page, pageSize, cancellationToken);
    }

    public async Task<Product?> GetProductByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Products
            .Include(p => p.Category)
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
    }

    public async Task<Guid> CreateProductAsync(
        string name,
        string sku,
        string? description,
        decimal price,
        int stock,
        Guid categoryId,
        CancellationToken cancellationToken = default)
    {
        var skuExists = await _context.Products.AnyAsync(p => p.SKU == sku, cancellationToken);
        if (skuExists)
            throw new InvalidOperationException($"Mã SKU '{sku}' đã tồn tại.");

        var categoryExists = await _context.Categories.AnyAsync(c => c.Id == categoryId, cancellationToken);
        if (!categoryExists)
            throw new NotFoundException("Danh mục", categoryId);

        var product = new Product(name, sku, price, stock, categoryId, description);
        _context.Products.Add(product);
        await _context.SaveChangesAsync(cancellationToken);

        return product.Id;
    }

    public async Task UpdateProductAsync(
        Guid id,
        string name,
        string sku,
        string? description,
        decimal price,
        int stock,
        Guid categoryId,
        CancellationToken cancellationToken = default)
    {
        var product = await _context.Products
            .FirstOrDefaultAsync(p => p.Id == id, cancellationToken)
            ?? throw new NotFoundException("Sản phẩm", id);

        var skuConflict = await _context.Products.AnyAsync(p => p.SKU == sku && p.Id != id, cancellationToken);
        if (skuConflict)
            throw new InvalidOperationException($"Mã SKU '{sku}' đã được sử dụng.");

        if (product.CategoryId != categoryId)
        {
            var categoryExists = await _context.Categories.AnyAsync(c => c.Id == categoryId, cancellationToken);
            if (!categoryExists)
                throw new NotFoundException("Danh mục", categoryId);
        }

        product.Update(name, sku, price, stock, categoryId, description);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteProductAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var product = await _context.Products
            .FirstOrDefaultAsync(p => p.Id == id, cancellationToken)
            ?? throw new NotFoundException("Sản phẩm", id);

        product.Deactivate();
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task RestoreProductAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var product = await _context.Products
            .FirstOrDefaultAsync(p => p.Id == id, cancellationToken)
            ?? throw new NotFoundException("Sản phẩm", id);

        product.Activate();
        await _context.SaveChangesAsync(cancellationToken);
    }
}
