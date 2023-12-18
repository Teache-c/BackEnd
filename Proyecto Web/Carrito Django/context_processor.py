def total_carrito(request):
    total = 0
    if request.user.is_authenticated:
        if "cart" in request.session.keys():
            for key, value in request.session["cart"].items():
                total += int(value["product_Sub"])
    return {"total_carrito": total}