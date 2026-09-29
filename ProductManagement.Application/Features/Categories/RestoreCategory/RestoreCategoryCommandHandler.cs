using MediatR;
using ProductManagement.Application.Common.Interfaces;

namespace ProductManagement.Application.Features.Categories.RestoreCategory;

public class RestoreCategoryCommandHandler : IRequestHandler<RestoreCategoryCommand, Unit>
{
    private readonly ICategoryService _categoryService;

    public RestoreCategoryCommandHandler(ICategoryService categoryService)
    {
        _categoryService = categoryService;
    }

    public async Task<Unit> Handle(RestoreCategoryCommand request, CancellationToken cancellationToken)
    {
        await _categoryService.RestoreCategoryAsync(request.Id, cancellationToken);
        return Unit.Value;
    }
}
