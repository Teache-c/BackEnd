from .models import Sale, Detail, Product
class Cart:
    def __init__(self, request):
        self.request = request
        self.session = request.session
        cart = self.session.get("cart")
        if not cart:
            self.session["cart"] = {}
            self.cart = self.session["cart"]
        else:
            self.cart = cart
        
    def add (self, Product):
        productId = str(Product.idProduct)
        """ Agregar el producto al carrito obteniendo su id y atributos """
        if (productId not in self.cart.keys()):
            self.cart[productId] = {
                "product_id" : Product.idProduct,
                "product_name" : Product.productName,
                "product_Sub": Product.productValue,
                "product_Count" : 1, 
                "product_Img" : Product.productImg.url,
                "product_Discount" : Product.productDiscount,
                "product_Value" : Product.productValue, 
                "product_stock" : Product.productStock,  
            }
            if(Product.productDiscount == 0):
                self.cart[productId]["product_Sub"] = Product.productValue
            else:
                self.cart[productId]["product_Sub"] = int(Product.productValue - (int(Product.productValue) * int(Product.productDiscount) / 100))
        else:
            """ Si el producto ya se encuentra en el carrito este se sumara automaticamente 
                y este se sumara, restara del stock a corde la necesidad del usuario"""
            """ AGREGAR """
            self.cart[productId]["product_Count"] += 1
            """ VALOR DEL PRODUCTO """
            self.cart[productId]["product_Value"] = Product.productValue
            """ CONDICION: si el producto no tiene descuento solo se le sumara 
                el valor del producto cuando este aumente su cantidad y en el caso de que no ocurra 
                asi se realizara un calculo del subtotal del producto aplicando dicho descuento"""
            if(Product.productDiscount == 0):
                self.cart[productId]["product_Sub"] += Product.productValue            
            else:
                self.cart[productId]["product_Sub"] += int(Product.productValue - (int(Product.productValue) * int(Product.productDiscount) / 100))
            if( self.cart[productId]["product_Count"] == self.cart[productId]["product_stock"] ) :
                self.remove(Product)
        self.save()
        
    def save(self):
        self.session["cart"] = self.cart
        self.session.modified = True
        

    def remove (self, Product):
        productId  = str(Product.idProduct)
        if productId  in self.cart:
            del self.cart[productId]
            self.save()

    def decrement(self, Product):
        productId = str(Product.idProduct)
        if productId in self.cart.keys():
            self.cart[productId]["product_Count"] -= 1
            if(Product.productDiscount == 0):
                self.cart[productId]["product_Sub"] -= Product.productValue
            else:
                self.cart[productId]["product_Sub"] -= int(Product.productValue - (int(Product.productValue) * int(Product.productDiscount) / 100))
            if self.cart[productId]["product_Count"] <= 0: 
                self.remove(Product)
        self.save()
    def clean(self):
        cart = self.session["cart"] = {}
        self.session.modified = True