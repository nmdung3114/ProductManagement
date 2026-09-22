using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Options;

namespace ProductManagement.Infrastructure.Authorization;

public class PermissionAuthorizationPolicyProvider : DefaultAuthorizationPolicyProvider
{
    public PermissionAuthorizationPolicyProvider(IOptions<AuthorizationOptions> options)
        : base(options)
    {
    }

    public override async Task<AuthorizationPolicy?> GetPolicyAsync(string policyName)
    {
        // Kiểm tra xem Policy tên policyName đã được định nghĩa chưa
        var policy = await base.GetPolicyAsync(policyName);
        if (policy != null)
            return policy;

        // Nếu chưa có (và có chứa dấu . như "Product.Create"), tự động tạo Policy mới
        if (policyName.Contains('.'))
        {
            return new AuthorizationPolicyBuilder()
                .AddRequirements(new PermissionRequirement(policyName))
                .Build();
        }

        return null;
    }
}
