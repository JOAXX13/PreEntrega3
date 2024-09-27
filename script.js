document.addEventListener('DOMContentLoaded', () => {
    const productosContainer = document.getElementById('productos');
    const cotizacionContainer = document.getElementById('lista-cotizacion');
    const totalCompraElement = document.getElementById('total-compra');  // Elemento para mostrar el total
    const procesarCompraButton = document.getElementById('procesar-compra');

    let productos = [];
    let cotizacion = JSON.parse(localStorage.getItem('cotizacion')) || [];

    // Cargar productos desde el archivo JSON
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            productos = data;
            mostrarProductos();
        })
        .catch(error => {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo cargar los productos. Intenta más tarde.',
            });
        });

    // Mostrar productos disponibles
    function mostrarProductos() {
        productos.forEach(producto => {
            const productoDiv = document.createElement('div');
            productoDiv.classList.add('producto');
            productoDiv.innerHTML = `
                <h3>${producto.nombre}</h3>
                <img src="${producto.imagen}" alt="${producto.nombre}" class="img-fluid" style="max-width: 200px;">  <!-- Aquí se muestra la imagen -->
                <p>Precio: $${producto.precio}</p>
                <button onclick="agregarACotizacion(${producto.id})">Agregar</button>
            `;
            productosContainer.appendChild(productoDiv);
        });
    }

    // Agregar producto al carrito/cotización
    window.agregarACotizacion = (id) => {
        const producto = productos.find(p => p.id === id);
        producto.cantidad = 1; // Inicializa la cantidad en 1
        cotizacion.push(producto);
        actualizarCotizacion();
        guardarEnLocalStorage();

        Swal.fire({
            icon: 'success',
            title: 'Producto agregado',
            text: `${producto.nombre} ha sido añadido a tu cotización.`,
            timer: 1500,
            showConfirmButton: false
        });
    };

    // Actualizar la visualización del carrito/cotización
    function actualizarCotizacion() {
        cotizacionContainer.innerHTML = '';
        let total = 0;  // Variable para el total

        cotizacion.forEach((item, index) => {
            const itemDiv = document.createElement('div');
            itemDiv.innerHTML = `
                ${item.nombre} - $${item.precio} x ${item.cantidad} 
                <button onclick="eliminarDeCotizacion(${index})">Eliminar</button>
                <button onclick="incrementarCantidad(${index})">+</button>
                <button onclick="decrementarCantidad(${index})">-</button>
            `;
            cotizacionContainer.appendChild(itemDiv);
            total += item.precio * item.cantidad;  // Sumar precio al total
        });

        totalCompraElement.textContent = `Total: $${total}`;  // Mostrar el total en pantalla
    }

    // Guardar el carrito en localStorage
    function guardarEnLocalStorage() {
        localStorage.setItem('cotizacion', JSON.stringify(cotizacion));
    }

    // Eliminar producto del carrito
    window.eliminarDeCotizacion = (index) => {
        const productoEliminado = cotizacion.splice(index, 1);  // Elimina el producto del array
        actualizarCotizacion();
        guardarEnLocalStorage();  // Actualiza el localStorage

        Swal.fire({
            icon: 'info',
            title: 'Producto eliminado',
            text: `${productoEliminado[0].nombre} fue eliminado de tu cotización.`,
            timer: 1500,
            showConfirmButton: false
        });
    };

    // Incrementar cantidad de producto
    window.incrementarCantidad = (index) => {
        cotizacion[index].cantidad += 1;
        actualizarCotizacion();
        guardarEnLocalStorage();
    };

    // Decrementar cantidad de producto
    window.decrementarCantidad = (index) => {
        if (cotizacion[index].cantidad > 1) {
            cotizacion[index].cantidad -= 1;
        } else {
            eliminarDeCotizacion(index);  // Elimina el producto si la cantidad es 1 y se intenta reducir más
        }
        actualizarCotizacion();
        guardarEnLocalStorage();
    };

    // Procesar la compra
    procesarCompraButton.addEventListener('click', () => {
        if (cotizacion.length > 0) {
            let total = cotizacion.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);  // Calcular el total

            Swal.fire({
                icon: 'success',
                title: 'Compra procesada',
                text: `Tu compra ha sido procesada correctamente. El total es $${total}.`,
            }).then(() => {
                cotizacion = [];  // Vaciamos el carrito
                actualizarCotizacion();
                localStorage.removeItem('cotizacion');  // Limpiamos el localStorage
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Carrito vacío',
                text: 'No hay productos en el carrito.',
            });
        }
    });

    // Cargar cotización del localStorage al iniciar
    if (cotizacion.length > 0) {
        actualizarCotizacion();
    }
});
