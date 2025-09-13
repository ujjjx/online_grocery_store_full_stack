class Transaction:
    def __init__(self, transaction_id, customer_id, product_id, total_amount, no_of_items):
        self.transaction_id = transaction_id
        self.customer_id = customer_id
        self.product_id = product_id
        self.total_amount = total_amount
        self.no_of_items = no_of_items