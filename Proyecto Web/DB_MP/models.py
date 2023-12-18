from django.db import models
from django.contrib.auth.models import User
# Create your models here.

# MultiPatitas

""" Region """
class Region(models.Model):
    idRegion = models.AutoField(primary_key = True)
    regionName = models.CharField(max_length = 25)
    shippingValue = models.IntegerField()
    def __str__(self) -> str:
        return self.regionName

""" Comuna """
class County(models.Model):
    """ Id y Nombre de la comuna """
    idCounty = models.AutoField(primary_key = True)
    countyName = models.CharField(max_length = 25)
    """ Conexion con Region """
    idRegion = models.ForeignKey(Region,on_delete=models.CASCADE)
    def __str__(self) -> str:
        return self.countyName

""" Cuentas """
class Accounts(models.Model):
    """ Id y Nombre de las cuentas de usuarios"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True, db_column='id')
    nickName = models.CharField(max_length = 14)
    """ Email, numero telefonico y imagen del perfil de Usuarios """
    userEmail = models.EmailField()
    userPhone = models.CharField(max_length = 12 )
    userImg = models.ImageField(upload_to="core",default='jelly-carpet-ghz-g3d88c8d23_1280.jpg')
    bornDate = models.DateField(verbose_name="Fecha de nacimiento")
    def __str__(self) -> str:
        return self.nickName

""" Direccion """
class Adress(models.Model):
    """ Id y nombre de la calle """
    idAdress = models.AutoField(primary_key = True)
    streetAdress = models.CharField(max_length = 50)
    """ Numero de la calle, descripcion de la direccion """
    streetNumber = models.CharField(max_length = 4)
    descAdress = models.CharField(max_length = 300)
    """ Codigo postal """
    postalCodeAdress = models.IntegerField()
    """ Coneccion con usuario """
    id = models.ForeignKey(Accounts,on_delete=models.CASCADE)
    idCounty = models.ForeignKey(County,on_delete=models.CASCADE)
    def __str__(self) -> str:
        return self.streetAdress 

""" Venta """
class Sale(models.Model):
    """ Id, fecha y costo de venta """
    idSale = models.AutoField(primary_key = True)
    saleDate = models.DateField()
    saleTotal = models.IntegerField()
    """ Conexion con User """
    id = models.ForeignKey(Accounts,on_delete=models.CASCADE)

""" Categoria """
class Category(models.Model):
    """ Id y el nombre de la categoria """
    idCategory = models.AutoField(primary_key = True)
    categoryName = models.CharField(max_length = 30 )  
    def __str__(self) -> str:
        return self.categoryName

""" Producto """
class Product(models.Model):
    """ Id, nombre y descripcion del producto """
    idProduct = models.AutoField(primary_key = True)
    productName = models.CharField(max_length=150)
    productDesc = models.CharField(max_length=300)
    """ Valor, Stock, Descuento y imagen del producto """
    productValue = models.IntegerField(verbose_name = "Valor del producto")
    productStock = models.IntegerField(verbose_name ="Stock disponible del producto")
    productDiscount = models.IntegerField(verbose_name = "Descuento del producto")
    productImg = models.ImageField(upload_to="core")
    """ Conexion con Category """
    idCategory = models.ForeignKey(Category,on_delete=models.CASCADE)
    def __str__(self) -> str:
        return self.productName

""" Comentarios """
class Comments(models.Model):
    """ Id y el Texto del comentario """
    idComent = models.AutoField(primary_key = True)
    comentTxt = models.CharField(max_length =700, verbose_name= "comentario de usuario")
    comentPoints = models.IntegerField()
    
    """ Conexion con Productos y Usuarios """
    idProduct = models.ForeignKey(Product,on_delete=models.CASCADE)
    id = models.ForeignKey(Accounts,on_delete=models.CASCADE)
    
    def __str__(self) -> str:
        return self.comentPoints
    
""" Detalle De Compra """
class Detail (models.Model):
    """ Id y cantidad de producto """
    idDetail = models.AutoField(primary_key = True)
    productCount = models.IntegerField( verbose_name= "Cantidad de Producto por pagar")
    """ Conexion con Sale(Venta) y Productos """
    idSale = models.ForeignKey(Sale,on_delete=models.CASCADE)
    idProduct = models.ForeignKey(Product,on_delete=models.CASCADE)
