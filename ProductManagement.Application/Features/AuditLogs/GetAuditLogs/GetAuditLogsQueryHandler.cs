using MediatR;
using Microsoft.EntityFrameworkCore;
using ProductManagement.Application.Common.Interfaces;
using ProductManagement.Application.Common.Models;

namespace ProductManagement.Application.Features.AuditLogs.GetAuditLogs;

public class GetAuditLogsQueryHandler : IRequestHandler<GetAuditLogsQuery, PagedResult<AuditLogDto>>
{
    private readonly IAppDbContext _dbContext;

    public GetAuditLogsQueryHandler(IAppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<PagedResult<AuditLogDto>> Handle(GetAuditLogsQuery request, CancellationToken cancellationToken)
    {
        var query = _dbContext.AuditLogs.AsNoTracking().AsQueryable();

        // Filter theo tên Entity (ví dụ: Product, Category, ApplicationRole...)
        if (!string.IsNullOrWhiteSpace(request.EntityName))
        {
            query = query.Where(a => a.EntityName.ToLower() == request.EntityName.Trim().ToLower());
        }

        // Filter theo Action (ADDED, MODIFIED, DELETED)
        if (!string.IsNullOrWhiteSpace(request.Action))
        {
            query = query.Where(a => a.Action.ToLower() == request.Action.Trim().ToLower());
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var page = Math.Max(1, request.Page);
        var pageSize = Math.Clamp(request.PageSize, 1, 100);

        var items = await query
            .OrderByDescending(a => a.Timestamp)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(a => new AuditLogDto(
                a.Id,
                a.UserId,
                a.UserName,
                a.Action,
                a.EntityName,
                a.EntityId,
                a.OldValues,
                a.NewValues,
                a.Timestamp))
            .ToListAsync(cancellationToken);

        return new PagedResult<AuditLogDto>(items, totalCount, page, pageSize);
    }
}
