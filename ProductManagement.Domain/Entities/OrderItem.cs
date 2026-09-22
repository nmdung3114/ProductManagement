namespace ProductManagement.Domain.Entities;

public class OrderItem
{
    public Guid Id { get; private set; }
    public Guid OrderId { get; private set; }
    public Guid ProductId { get; private set; }
    public int Quantity { get; private set; }
    public decimal UnitPrice { get; private set; }// giá của 1 sản phẩm trong đơn hàng
    public decimal TotalPrice { get; private set; }// chưa có cái này chắc phải tự tính dựa vào UnitPrice * Quantity

    //navigational
    public Order Order { get; private set; }
    public Product Product { get; private set; }

    private OrderItem() { } // dùng cho EF Core, không được xóa
    public OrderItem(Guid orderId, Guid productId, int quantity, decimal unitPrice)
    {
        if (orderId == Guid.Empty)
        {
            throw new ArgumentException("OrderId cannot be empty.", nameof(orderId));
        }
        if (productId == Guid.Empty)
        {
            throw new ArgumentException("ProductId cannot be empty.", nameof(productId));
        }
        if (quantity <= 0)
        {
            throw new ArgumentException("Quantity must be greater than zero.", nameof(quantity));
        }
        if (unitPrice <= 0)
        {
            throw new ArgumentException("Unit price must be greater than 0.", nameof(unitPrice));
        }

        Id = Guid.NewGuid();
        OrderId = orderId;
        ProductId = productId;
        Quantity = quantity;
        UnitPrice = unitPrice;
        TotalPrice = quantity * unitPrice; // tính toán tổng giá trị

    }
    public void IncreaseQuantity(int additionalQuantity)// tăng số lượng sản phẩm trong đơn hàng
    {
        if (additionalQuantity <= 0)
        {
            throw new ArgumentException("Additional quantity must be greater than zero.", nameof(additionalQuantity));
        }

        Quantity += additionalQuantity;// tăng số lượng
        TotalPrice = Quantity * UnitPrice; // cập nhật lại tổng giá trị
    }
}