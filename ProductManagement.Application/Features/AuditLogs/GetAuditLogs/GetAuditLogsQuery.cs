using MediatR;
using ProductManagement.Application.Common.Models;

namespace ProductManagement.Application.Features.AuditLogs.GetAuditLogs;

public record GetAuditLogsQuery(
    string? EntityName,
    string? Action,
    int Page = 1,
    int PageSize = 20) : IRequest<PagedResult<AuditLogDto>>;
