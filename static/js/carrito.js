document.addEventListener('DOMContentLoaded', function() {
    // Actualizar carrito con AJAX
    const forms = document.querySelectorAll('form[action*="agregar_al_carrito"]');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
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
                    // Actualizar contador del carrito
                    document.getElementById('carrito-count').textContent = data.carrito_count;
                    
                    // Mostrar mensaje de éxito
                    showAlert('Producto agregado al carrito', 'success');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showAlert('Error al agregar producto', 'danger');
            });
        });
    });
});

function showAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.insertBefore(alertDiv, document.body.firstChild);
    
    setTimeout(() => {
        alertDiv.remove();
    }, 3000);
}