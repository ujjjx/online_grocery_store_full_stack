class Order:
    def __init__(self, order_id, customer_id, product_id, quantity, status):
        self.order_id = order_id
        self.customer_id = customer_id
        self.product_id = product_id
        self.quantity = quantity
        self.status = status