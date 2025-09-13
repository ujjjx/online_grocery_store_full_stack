class UnverifiedUser:
    def __init__(self, email, name, password, address, contact, otp_code):
        self.email = email
        self.name = name
        self.password = password
        self.address = address
        self.contact = contact
        self.otp_code = otp_code