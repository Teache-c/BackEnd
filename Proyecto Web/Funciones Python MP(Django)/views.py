from django.shortcuts import render,  redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib.admin.views.decorators import staff_member_required
from django.contrib.auth import logout, authenticate, login as auth_login, login
from .models import Comments, Product, Sale, Category, Accounts, Detail, Region, County, Adress
from django.contrib.auth.models import User
from django.contrib import messages
from django.core.exceptions import ValidationError
from .cart import Cart
import logging
from datetime import date
# Create your views here.
@login_required
def index(request):
    return render(request,'core/index.html')

#Vistas Tienda
@login_required
def boleta(request):
    return render(request,'core/tienda/boleta.html')

@login_required
def carrito(request):
    productos = Product.objects.all()
    context = {"productos": productos}
    return render(request,'core/tienda/carrito.html', context)

@login_required
def agregar_producto(request, idProduct):
    carrito = Cart(request)
    product = Product.objects.get(idProduct=idProduct)
    carrito.add(product)
    return redirect('carrito')

@login_required
def eliminar_producto(request, idProduct):
    product = get_object_or_404(Product, idProduct=idProduct)
    product = Product.objects.get(idProduct=idProduct)
    cart = Cart(request)
    cart.remove(product)
    return redirect('carrito')

@login_required
def restar_producto(request, idProduct):
    carrito = Cart(request)
    product = Product.objects.get(idProduct=idProduct)
    carrito.decrement(product)
    return redirect('carrito')

@login_required
def limpiar_carrito(request):
    carrito = Cart(request)
    carrito.clean()
    return redirect('carrito')

@login_required
def contactos(request):
    return render(request,'core/tienda/contactos.html')

@login_required
def productos(request, category_id = None):
    categories = Category.objects.all()
    if category_id:
        category = Category.objects.get(idCategory=category_id)
        productos = Product.objects.filter(idCategory=category)
    else:
        productos = Product.objects.all()
    context = {
        "productos": productos,
        "categories": categories
        }
    return render(request,'core/tienda/productos.html', context)

@login_required
def producto(request, producto_id):
    usuario = request.user.accounts
    producto = get_object_or_404(Product, pk=producto_id)
    comentarios = Comments.objects.filter(idProduct=producto_id)
    context = {
        "usuario" : usuario,
        "producto": producto,
        "comentarios" : comentarios
    }
    return render(request,'core/tienda/producto.html', context)

@login_required
def enviarComentario(request, id):
    calificacion = request.POST['estrellas']
    comentario = request.POST['comentario']

    if 'estrellas' in request.POST:
        calificacion = request.POST['estrellas']
    else:
        calificacion = 1

    producto = Product.objects.get(idProduct=id)
    usuario = Accounts.objects.get(user=request.user)
    
    Comments.objects.create(comentTxt=comentario, comentPoints=calificacion, idProduct=producto, id=usuario)
    
    return redirect('producto', producto_id=producto.idProduct)

@login_required
def Compra(request):
    carrito = Cart(request)
    carrito.clean()
    return render(request,'core/tienda/Compra.html')

##### Vistas Usuario #####
@login_required
def cuenta(request):
    usuario = request.user.accounts
    direccion = usuario.adress_set.first()
    region = direccion.idCounty.idRegion if direccion else None
    context = {
        "usuario": usuario,
        "direccion": direccion,
        "region": region,
    }
    return render(request, 'core/usuario/cuenta.html', context)

def formLogin(request):
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']
        
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return redirect('inicio')
        else:
            messages.error(request, 'Credenciales inválidas. Por favor, verifica tus datos.')
    
    return render(request, 'login.html')

def logout_view(request):
    carrito = Cart(request)
    logout(request)
    carrito.save()
    return redirect('login')

def donacion(request):
    return render(request, 'core/tienda/donacion.html')

@login_required
def modCuenta(request):
    usuario = request.user.accounts
    user_img = usuario.userImg if usuario.userImg else None

    context = {
        'usuario': usuario,
        'user_img': user_img
    }
    return render(request,'core/usuario/mod_cuenta.html', context)

@login_required
def modificarCuenta(request, idUser):
    cuenta = get_object_or_404(Accounts, user=idUser)
    usuario = request.user.accounts
    
    if request.method == 'POST':
        vImg = request.POST.get('imgProd')
        vNameUser = request.POST.get('user-name')
        vEmail = request.POST.get('email')
        vPhoneNumber = request.POST.get('number')

        error_message = None

        try:
            if Accounts.objects.exclude(user=idUser).filter(nickName=vNameUser).exists():
                raise Exception('El nombre de usuario ya está en uso.')
            cuenta.nickName = vNameUser
            cuenta.userEmail = vEmail
            cuenta.userPhone = vPhoneNumber
            if vImg:
                cuenta.userImg = vImg
            cuenta.save()

            user = User.objects.get(id=idUser)
            user.username = vNameUser
            user.email = vEmail
            user.save()

            return redirect('mod_cuenta')

        except Exception as e:
            error_message = str(e)
            context = {
                'error_message': error_message,
                'usuario': usuario
            }
            return render(request, 'core/usuario/mod_cuenta.html', context)

    context = {
        'usuario': usuario
    }
    return render(request, 'core/usuario/mod_cuenta.html', context)

def sign_up(request):
    return render(request,'core/usuario/sign_up.html')

def formSignUp(request):
    if request.method == 'POST':
        user = request.POST['user-name']
        keys = request.POST['password']
        email = request.POST['email']
        phone = request.POST['phone-number']
        born_date = request.POST['born-date']


        error_message = None

        try:
            if Accounts.objects.filter(nickName=user).exists():
                raise Exception('El nombre de usuario ya está en uso.')
            
            user = User.objects.create_user(username=user, email=email, password=keys)
            user.is_staff = False
            user.save()
            Accounts.objects.create(
                nickName=user,  
                userEmail=email, 
                userPhone=phone, 
                bornDate=born_date, 
                user=user
            )
            return redirect('login')
        
        except Exception as e:
            error_message = str(e)
            context = {'error_message': error_message}
            return render(request,'core/usuario/sign_up.html', context)
        
    return redirect('sign_up')

@login_required
def agregarDireccion(request):
    comuna = County.objects.all()
    context = {"comuna": comuna}
    return render(request, 'core/usuario/agregarDireccion.html', context)

@login_required
def formAgreDirect(request):
    vComuna = request.POST['Comuna']
    vCalle = request.POST['Calle']
    vNumero = request.POST['Numero']
    vDescripcion = request.POST['Descripcion']
    vCod_post = request.POST['Cod_post']
    
    usuario = get_object_or_404(Accounts, user_id=request.user.id)
    vIdComuna = County.objects.get(idCounty=vComuna)

    # Verificar si el usuario ya tiene una dirección
    if Adress.objects.filter(id=usuario).exists():
        # Realizar la actualización de la dirección existente
        direccion = Adress.objects.get(id=usuario)
        direccion.streetAdress = vCalle
        direccion.streetNumber = vNumero
        direccion.descAdress = vDescripcion
        direccion.postalCodeAdress = vCod_post
        direccion.idCounty = vIdComuna
        direccion.save()
    else:
        # Crear una nueva dirección para el usuario
        Adress.objects.create(
            streetAdress=vCalle, 
            streetNumber=vNumero, 
            descAdress=vDescripcion, 
            postalCodeAdress=vCod_post, 
            idCounty=vIdComuna, 
            id=usuario
        )
    
    return redirect('agregarDireccion') 

#Vistas Recuperar
def Cod_Correo(request):
    if request.method == 'POST':
        return redirect('modificar_contraseña')
    return render(request,'core/recuperar/Cod_Correo.html')

@login_required
def mod_Pass(request):
    idUser = request.user
    context = {
        "idUser" : idUser   
    }
    return render(request,'core/recuperar/mod_Pass.html', context)

@login_required
def modificarContrasenia(request, idUser):
    if request.method == 'POST':
        oldPassword = request.POST['current-password']
        newPassword = request.POST['new-password']
        user = User.objects.get(id=idUser)

        try:
            if user.check_password(oldPassword):
                errors = validar_contrasenia(newPassword)
                if not errors:
                    user.set_password(newPassword)
                    user.save()

                    user = authenticate(request, username=user.username, password=newPassword)
                    if user is not None:
                        auth_login(request, user)
                    return redirect('mod_cuenta')
                    logging.info("Una contraseña se ha modificado. Saludos para Backend 🤨")
                else:
                    logging.info("No se ha podido modificar la contraseña. Atento Backend 🤨")
                    error_message = "\n".join(errors)
            else:
                logging.info("No se ha podido modificar la contraseña. Atento Backend 🤨")
                error_message = "La contraseña actual ingresada no es válida. No se ha podido realizar el cambio. Por favor, asegúrese de que la contraseña actual sea la correcta."
        except Exception as e:
            error_message = str(e)

        idUser = request.user
        context = {
            "error_message": error_message,
            "idUser": idUser
        }
        return render(request, 'core/recuperar/mod_Pass.html', context)
    
    return render(request, 'core/recuperar/mod_Pass.html')


def validar_contrasenia(password):
    errors = []

    if len(password) < 6 or len(password) > 8:
        errors.append("La contraseña debe tener entre 6 y 8 caracteres.")

    special_chars = "!@#$&*"
    if not any(char in special_chars for char in password):
        errors.append("La contraseña debe contener al menos un carácter especial (!@#$&*).")

    first_char = password[0]
    if not first_char.isupper():
        errors.append("La primera letra de la contraseña debe estar en mayúscula.")

    return errors

def modificar_contraseña(request):
    if request.method == 'POST':
        username = request.POST['username']
        nueva_contraseña = request.POST['nueva_contraseña']

        try:
            usuario = User.objects.get(username=username)
        except User.DoesNotExist:
            return render(request, 'core/recuperar/recuperar_pass.html', {'mensaje': 'Usuario no encontrado'})

        errors = validar_contrasenia(nueva_contraseña)
        if not errors:
            usuario.set_password(nueva_contraseña)
            usuario.save()

            return redirect('inicio')
        else:
            error_message = "\n".join(errors)
            return render(request, 'core/recuperar/recuperar_pass.html', {'error_message': error_message})

    return render(request, 'core/recuperar/recuperar_pass.html')

##### Vistas Admin #####
@login_required
@staff_member_required
def add_product(request):
    usuario = request.user.accounts
    categories = Category.objects.all()
    context = {
        "categories": categories,
        "usuario": usuario
        }
    return render(request,'core/admin/add_product.html', context)

""" Vista formulario agregar producto """
@login_required
@staff_member_required
def formAgreProd(request):
    vImg = request.FILES['imgProd']
    vCategory = request.POST['category']
    vNameProduct = request.POST['nomProd']
    vDescription = request.POST['desProd']
    vPrice = request.POST['valProd']
    vStock = request.POST['stockProduct']
    vDiscProducto = request.POST['discProduct']

    vCategoryProduct = Category.objects.get(idCategory = vCategory)
    
    Product.objects.create(
        productImg = vImg, 
        idCategory = vCategoryProduct, 
        productName = vNameProduct, 
        productDesc = vDescription, 
        productValue = vPrice, 
        productStock = vStock, 
        productDiscount = vDiscProducto
        )
    return redirect('add_product')

@login_required
@staff_member_required
def mod_productos(request):
    productos = Product.objects.all()
    context = {"productos": productos}
    return render(request,'core/admin/mod_productos.html', context)

""" Vista formulario modificar producto """
@login_required
@staff_member_required
def modificarProducto(request, id):
    if request.method == 'POST':
        vProduct = request.POST.get('imputValProd')
        vStock = request.POST.get('imputStock')
        vDescuento = request.POST.get('inputDescuent')
        vImg = request.FILES.get('imgProd')

        producto = Product.objects.get(idProduct=id)

        try:
            if vProduct:
                product_value = int(vProduct)
                if product_value < 0:
                    raise ValidationError("Ingrese un valor valido.")
                producto.productValue = product_value

            if vStock:
                product_stock = int(vStock)
                if product_stock < 0:
                    raise ValidationError("Ingrese un valor valido.")
                producto.productStock = product_stock

            if vDescuento:
                product_discount = int(vDescuento)
                if product_discount < 0:
                    raise ValidationError("Ingrese un valor valido.")
                producto.productDiscount = product_discount

            if vImg:
                producto.productImg = vImg

            producto.save()
            return redirect('mod_productos')
        
        except ValidationError as e:
            productos = Product.objects.all()
            error_message = str(e.message)
            context = {
                "productos": productos,
                "error_message": error_message
            }
            return render(request, 'core/admin/mod_productos.html', context)
    return redirect('mod_productos')

""" Eliminar producto """
@login_required
@staff_member_required
def EliminarProducto(request, id):
    producto = Product.objects.get(idProduct=id)
    producto.delete()
    return redirect('mod_productos')
@login_required
@staff_member_required
def sales(request):
    ventas = Sale.objects.all()
    usuario = Accounts.objects.all()
    return render(request, 'core/admin/sales.html', {'ventas': ventas}, {'usuario':usuario})

@login_required
def confirmar_venta(request, venta_id):
    cart = request.session.get("cart")
    venta = Sale.objects.get(idSale=venta_id)
    if cart:
        total = 0
        venta = None
        
        for item in cart.values():
            product_id = item["product_id"]
            product_count = item["product_Count"]
            total += int(item["product_Sub"])
            
            # Obtén el producto relacionado al item del carrito
            product = Product.objects.get(idProduct=product_id)
            
            if not venta:
                fecha = date.today()
                
                # Crea una nueva instancia de Sale para representar la venta
                venta = Sale.objects.create(
                    id=request.user.accounts,
                    saleDate=fecha,
                    saleTotal=total
                )
            
            # Crea una instancia de Detail para representar el detalle de la venta
            detalle = Detail.objects.create(
                idSale=venta,
                idProduct=product,
                productCount=product_count
            )
            
            # Actualiza el stock del producto
            product.productStock -= product_count
            product.save()
        
        del request.session["cart"]
        
        return redirect('sales', venta_id=venta.idSale)
    
    return redirect('carrito')
@login_required
def mostrar_detalle(request, venta_id):
    venta = Sale.objects.get(idSale=venta_id)
    return render(request, 'sales', {'venta': venta})

