// ============================================
// CARRITO.JS - Sistema de Carrito Mejorado
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    initCarritoForms();
    initUpdateQuantityButtons();
    initRemoveButtons();
    calculateTotals();
});

// ============================================
// AGREGAR AL CARRITO CON AJAX
// ============================================
function initCarritoForms() {
    const forms = document.querySelectorAll('form[action*="agregar_al_carrito"]');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalContent = submitBtn.innerHTML;
            
            // Deshabilitar botón y mostrar loading
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            
            const formData = new FormData(this);
            
            fetch(this.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                }
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error en la respuesta del servidor');
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    // Actualizar contador del carrito con animación
                    updateCarritoCount(data.carrito_count);
                    
                    // Mostrar notificación de éxito
                    showCartNotification(data.producto_nombre, 'success');
                    
                    // Animar el botón de éxito
                    submitBtn.innerHTML = '<i class="fas fa-check"></i>';
                    submitBtn.classList.add('btn-success');
                    
                    // Restaurar botón después de 2 segundos
                    setTimeout(() => {
                        submitBtn.innerHTML = originalContent;
                        submitBtn.classList.remove('btn-success');
                        submitBtn.disabled = false;
                    }, 2000);
                } else {
                    throw new Error(data.message || 'Error al agregar producto');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showCartNotification('Error al agregar producto al carrito', 'error');
                
                // Restaurar botón en caso de error
                submitBtn.innerHTML = originalContent;
                submitBtn.disabled = false;
            });
        });
    });
}

// ============================================
// ACTUALIZAR CONTADOR DEL CARRITO
// ============================================
function updateCarritoCount(count) {
    const countBadge = document.getElementById('carrito-count');
    if (countBadge) {
        // Animación de pulso
        countBadge.style.transform = 'scale(1.5)';
        countBadge.textContent = count;
        
        setTimeout(() => {
            countBadge.style.transform = 'scale(1)';
        }, 300);
    }
}

// ============================================
// NOTIFICACIÓN DEL CARRITO
// ============================================
function showCartNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `cart-notification ${type}`;
    notification.innerHTML = `
        <div class="cart-notification-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} me-2"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Mostrar con animación
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Ocultar después de 3 segundos
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Estilos para la notificación
const style = document.createElement('style');
style.textContent = `
    .cart-notification {
        position: fixed;
        top: 80px;
        right: 20px;
        background: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        max-width: 350px;
    }
    
    .cart-notification.show {
        transform: translateX(0);
    }
    
    .cart-notification.success {
        border-left: 4px solid var(--guna-green);
    }
    
    .cart-notification.error {
        border-left: 4px solid var(--guna-red);
    }
    
    .cart-notification-content {
        display: flex;
        align-items: center;
        color: var(--gray-900);
        font-weight: 600;
    }
    
    .cart-notification.success i {
        color: var(--guna-green);
    }
    
    .cart-notification.error i {
        color: var(--guna-red);
    }
`;
document.head.appendChild(style);

// ============================================
// ACTUALIZAR CANTIDAD EN EL CARRITO
// ============================================
function initUpdateQuantityButtons() {
    const updateForms = document.querySelectorAll('form[action*="actualizar_carrito"]');
    
    updateForms.forEach(form => {
        const input = form.querySelector('input[name="cantidad"]');
        const updateBtn = form.querySelector('button[type="submit"]');
        
        if (!input || !updateBtn) return;
        
        // Actualizar solo cuando cambie la cantidad
        let originalValue = input.value;
        
        input.addEventListener('change', function() {
            if (this.value !== originalValue) {
                updateBtn.classList.add('btn-warning');
                updateBtn.innerHTML = '<i class="fas fa-sync-alt me-1"></i>Actualizar';
            }
        });
        
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            updateBtn.disabled = true;
            updateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            
            const formData = new FormData(this);
            
            fetch(this.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Actualizar subtotal
                    const row = form.closest('tr');
                    const subtotalCell = row.querySelector('td:nth-last-child(2)');
                    if (subtotalCell) {
                        subtotalCell.textContent = '$' + data.subtotal.toFixed(2);
                    }
                    
                    // Actualizar totales generales
                    updateCartTotals(data.total, data.carrito_count);
                    
                    // Actualizar valor original
                    originalValue = input.value;
                    
                    // Restaurar botón
                    updateBtn.classList.remove('btn-warning');
                    updateBtn.classList.add('btn-success');
                    updateBtn.innerHTML = '<i class="fas fa-check"></i>';
                    
                    setTimeout(() => {
                        updateBtn.classList.remove('btn-success');
                        updateBtn.innerHTML = 'Actualizar';
                        updateBtn.disabled = false;
                    }, 1500);
                    
                    showCartNotification('Cantidad actualizada', 'success');
                } else {
                    throw new Error(data.message || 'Error al actualizar');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showCartNotification('Error al actualizar cantidad', 'error');
                updateBtn.disabled = false;
                updateBtn.innerHTML = 'Actualizar';
            });
        });
    });
}

// ============================================
// ELIMINAR PRODUCTO DEL CARRITO
// ============================================
function initRemoveButtons() {
    const removeForms = document.querySelectorAll('form[action*="eliminar_del_carrito"]');
    
    removeForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const row = this.closest('tr');
            const productoNombre = row.querySelector('a').textContent.trim();
            
            // Confirmar eliminación
            if (!confirm(`¿Estás seguro de eliminar "${productoNombre}" del carrito?`)) {
                return;
            }
            
            const submitBtn = this.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            
            const formData = new FormData(this);
            
            fetch(this.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Animar la eliminación de la fila
                    row.style.opacity = '0';
                    row.style.transform = 'translateX(-100%)';
                    row.style.transition = 'all 0.3s ease';
                    
                    setTimeout(() => {
                        row.remove();
                        
                        // Actualizar totales
                        updateCartTotals(data.total, data.carrito_count);
                        
                        // Si el carrito está vacío, recargar la página
                        if (data.carrito_count === 0) {
                            location.reload();
                        }
                    }, 300);
                    
                    showCartNotification(`${productoNombre} eliminado del carrito`, 'success');
                } else {
                    throw new Error(data.message || 'Error al eliminar');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showCartNotification('Error al eliminar producto', 'error');
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Eliminar';
            });
        });
    });
}

// ============================================
// ACTUALIZAR TOTALES DEL CARRITO
// ============================================
function updateCartTotals(total, count) {
    // Actualizar contador del carrito
    updateCarritoCount(count);
    
    // Calcular ITBMS (7%)
    const itbms = total * 0.07;
    const totalConImpuestos = total + itbms;
    
    // Actualizar valores en la página
    const subtotalElement = document.querySelector('.cart-summary tr:nth-child(1) td:last-child');
    const itbmsElement = document.querySelector('.cart-summary tr:nth-child(2) td:last-child');
    const totalElement = document.querySelector('.cart-summary-total');
    
    if (subtotalElement) subtotalElement.textContent = '$' + total.toFixed(2);
    if (itbmsElement) itbmsElement.textContent = '$' + itbms.toFixed(2);
    if (totalElement) totalElement.textContent = '$' + totalConImpuestos.toFixed(2);
}

// ============================================
// CALCULAR TOTALES AL CARGAR
// ============================================
function calculateTotals() {
    const rows = document.querySelectorAll('tbody tr');
    let total = 0;
    
    rows.forEach(row => {
        const subtotalText = row.querySelector('td:nth-last-child(2)')?.textContent;
        if (subtotalText) {
            const subtotal = parseFloat(subtotalText.replace('$', ''));
            total += subtotal;
        }
    });
    
    const count = rows.length;
    updateCartTotals(total, count);
}

// ============================================
// MINI CARRITO (OPCIONAL - PARA DROPDOWN)
// ============================================
function initMiniCarrito() {
    const carritoIcon = document.querySelector('.nav-link[href*="carrito"]');
    if (!carritoIcon) return;
    
    carritoIcon.addEventListener('mouseenter', function() {
        // Cargar y mostrar mini carrito
        loadMiniCarrito();
    });
}

function loadMiniCarrito() {
    // Implementar carga del mini carrito si se desea
    // Hacer fetch a un endpoint que devuelva los items del carrito
}

// Inicializar mini carrito si está en el DOM
initMiniCarrito();

// ============================================
// EXPORTAR FUNCIONES GLOBALES
// ============================================
window.CarritoShop = {
    updateCarritoCount,
    showCartNotification,
    updateCartTotals
};