namespace ProductManagement.Domain.Entities;
public class RefreshToken{
    public Guid Id {get; set; } = Guid.NewGuid();
    public Guid UserId {get; set;}
    public string Token {get; set;} = string.Empty;
    public DateTime ExpiresAt {get; set;}// thời gian hết hạn của token
    public DateTime CreatedAt {get; set;} // thời gian tạo token
    public DateTime? RevokedAt {get; set;}// thời gian bị thu hồi
    public string? ReplaceByToken {get; set;}// token được thay thế bởi token mới
    
    // cac thuoc tinh tien ich
    public bool IsExpired => DateTime.UtcNow >= ExpiresAt;
    public bool IsRevoked => RevokedAt != null;
    public bool IsActive => !IsExpired && !IsRevoked;

}    