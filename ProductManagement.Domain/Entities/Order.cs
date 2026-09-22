
using ProductManagement.Domain.Enums;

namespace ProductManagement.Domain.Entities;
public class Order
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    
    public decimal TotalAmount { get; set; }
    public OrderStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    
    private readonly List<OrderItem> _items = new List<OrderItem>();
    public IReadOnlyCollection<OrderItem> Items => _items.AsReadOnly();

    private Order() { } // dùng cho EF Core, không được xóa

    public Order(Guid userId)
    {
        if (userId == Guid.Empty)
        {
            throw new ArgumentException("UserId cannot be empty.", nameof(userId));
        }

        Id = Guid.NewGuid();
        UserId = userId;
        TotalAmount = 0; // tổng amount sẽ được tính sau khi thêm các OrderItem
        Status = OrderStatus.Pending; // mặc định trạng thái khi tạo đơn hàng mới
        CreatedAt = DateTime.UtcNow;
    }
    public void AddItem(Guid ProductId, int quantity, decimal unitPrice)

    {
        if(ProductId == Guid.Empty)
        {
            throw new ArgumentException("ProductId cannot be empty.", nameof(ProductId));
        }
        if(quantity <= 0)
        {
            throw new ArgumentException("Quantity must be greater than zero.", nameof(quantity));   
        }
        if(unitPrice < 0)
        {
            throw new ArgumentException("UnitPrice cannot be negative.", nameof(unitPrice));
        }
        var exitingItem = _items.FirstOrDefault(i => i.ProductId == ProductId);
        if(exitingItem != null)
        {
            exitingItem.IncreaseQuantity(quantity);
        }
        else
        {
            var newItem = new OrderItem(Id, ProductId, quantity, unitPrice);
            _items.Add(newItem);
        }
        RecalculateTotal();
    }
    public void RemoveItem(Guid productId)
    {
        if(Status != OrderStatus.Pending)
        {
            throw new InvalidOperationException("Khong thể xóa sản phẩm từ đơn hàng đã được xác nhận hoặc hoàn thành.");
        }
        var itemToRemove = _items.FirstOrDefault(i => i.ProductId == productId);
        if (itemToRemove == null)
        {
            throw new InvalidOperationException("Sản phẩm không tồn tại trong đơn hàng.");
        }
        _items.Remove(itemToRemove);
        RecalculateTotal();

    }

    public void ConfirmOrder()
    {
        if (Status != OrderStatus.Pending)
        {
            throw new InvalidOperationException("Chỉ có thể xác nhận đơn hàng đang ở trạng thái Pending.");
        }
        if (!_items.Any())
        {
            throw new InvalidOperationException("Không thể xác nhận đơn hàng mà không có sản phẩm.");
        }
        Status = OrderStatus.Confirmed;
        RecalculateTotal(); // tính toán lại tổng số tiền khi xác nhận đơn hàng
    }
    public void CancelOrder()
    {
        if (Status!= OrderStatus.Pending)
        {
            throw new InvalidOperationException("Chỉ có thể hủy đơn hàng đang ở trạng thái Pending.");
        }
        Status = OrderStatus.Cancelled;
    }
    public void CompleteOrder()
    {
        if (Status != OrderStatus.Confirmed)
        {
            throw new InvalidOperationException("Chỉ có thể hoàn thành đơn hàng đang ở trạng thái Confirmed.");
        }
        Status = OrderStatus.Completed;
    }


    private void RecalculateTotal()
    {
        TotalAmount = _items.Sum(i=> i.Quantity * i.UnitPrice);
    }
    
}