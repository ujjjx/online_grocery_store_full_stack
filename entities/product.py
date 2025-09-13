class Product:
    def __init__(self, product_id, name, description, company_name, price, quantity, reserved="N", customer_id=None, image_path=None):
        self.product_id = product_id
        self.name = name
        self.description = description
        self.company_name = company_name
        self.price = price
        self.quantity = quantity
        self.reserved = reserved   
        self.customer_id = customer_id
        self.image_path = image_path

    def to_dict(self):
        return {
            "product_id": self.product_id,
            "name": self.name,
            "description": self.description,
            "company_name": self.company_name,
            "price": self.price,
            "quantity": self.quantity,
            "reserved": self.reserved,
            "customer_id": self.customer_id,
            "image_path": self.image_path
        }