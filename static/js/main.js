// ============================================
// MAIN.JS - Funcionalidad Principal
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    
    // Inicializar todas las funcionalidades
    initScrollAnimations();
    initImageLazyLoading();
    initTooltips();
    initProductFilters();
    initSearchBar();
    initQuantityControls();
    
});

// ============================================
// ANIMACIONES DE SCROLL
// ============================================
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observar elementos que necesitan animación
    document.querySelectorAll('.product-card, .categoria-card, section').forEach(el => {
        observer.observe(el);
    });
}

// ============================================
// LAZY LOADING DE IMÁGENES
// ============================================
function initImageLazyLoading() {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src || img.src;
                img.classList.add('loaded');
                observer.unobserve(img);
            }
        });
    });
    
    document.querySelectorAll('img[loading="lazy"]').forEach(img => {
        imageObserver.observe(img);
    });
}

// ============================================
// TOOLTIPS DE BOOTSTRAP
// ============================================
function initTooltips() {
    const tooltipTriggerList = [].slice.call(
        document.querySelectorAll('[data-bs-toggle="tooltip"]')
    );
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

// ============================================
// FILTROS DE PRODUCTOS
// ============================================
function initProductFilters() {
    const filterCheckboxes = document.querySelectorAll('.filter-section input[type="checkbox"]');
    const filterSelects = document.querySelectorAll('.filter-section select');
    
    // Aplicar filtros automáticamente al cambiar
    filterCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', applyFilters);
    });
    
    filterSelects.forEach(select => {
        select.addEventListener('change', applyFilters);
    });
}

function applyFilters() {
    // Recopilar valores de filtros activos
    const activeFilters = {
        tipos: [],
        comunidades: [],
        precioMin: null,
        precioMax: null
    };
    
    // Obtener tipos seleccionados
    document.querySelectorAll('.filter-section input[type="checkbox"]:checked').forEach(cb => {
        if (cb.id.includes('tipo')) {
            activeFilters.tipos.push(cb.value);
        }
    });
    
    // Obtener comunidad seleccionada
    const comunidadSelect = document.querySelector('select[name="comunidad"]');
    if (comunidadSelect && comunidadSelect.value) {
        activeFilters.comunidades.push(comunidadSelect.value);
    }
    
    // Filtrar productos visualmente
    const productCards = document.querySelectorAll('.product-card');
    let visibleCount = 0;
    
    productCards.forEach(card => {
        const shouldShow = matchesFilters(card, activeFilters);
        card.closest('.col-lg-3, .col-lg-4, .col-md-6').style.display = shouldShow ? '' : 'none';
        if (shouldShow) visibleCount++;
    });
    
    // Mostrar mensaje si no hay resultados
    updateNoResultsMessage(visibleCount);
}

function matchesFilters(card, filters) {
    // Implementar lógica de filtrado según los data attributes del card
    // Esta es una implementación básica, ajustar según necesidades
    return true;
}

function updateNoResultsMessage(count) {
    let noResultsMsg = document.querySelector('.no-results-message');
    
    if (count === 0) {
        if (!noResultsMsg) {
            noResultsMsg = document.createElement('div');
            noResultsMsg.className = 'col-12 no-results-message';
            noResultsMsg.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">
                        <i class="fas fa-search"></i>
                    </div>
                    <h3>No se encontraron productos</h3>
                    <p>Intenta ajustar los filtros para ver más resultados</p>
                    <button class="btn btn-primary" onclick="clearFilters()">
                        <i class="fas fa-redo me-2"></i>Limpiar Filtros
                    </button>
                </div>
            `;
            document.querySelector('.row.g-4').appendChild(noResultsMsg);
        }
    } else if (noResultsMsg) {
        noResultsMsg.remove();
    }
}

function clearFilters() {
    // Limpiar todos los filtros
    document.querySelectorAll('.filter-section input[type="checkbox"]').forEach(cb => {
        cb.checked = false;
    });
    document.querySelectorAll('.filter-section select').forEach(select => {
        select.selectedIndex = 0;
    });
    applyFilters();
}

// ============================================
// BARRA DE BÚSQUEDA
// ============================================
function initSearchBar() {
    const searchInput = document.querySelector('.search-bar input');
    if (!searchInput) return;
    
    let searchTimeout;
    
    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        
        const clearBtn = this.parentElement.querySelector('.clear-btn');
        if (this.value.length > 0) {
            if (clearBtn) clearBtn.style.display = 'block';
            
            // Búsqueda con debounce
            searchTimeout = setTimeout(() => {
                performSearch(this.value);
            }, 300);
        } else {
            if (clearBtn) clearBtn.style.display = 'none';
            performSearch('');
        }
    });
    
    // Botón para limpiar búsqueda
    const clearBtn = document.querySelector('.search-bar .clear-btn');
    if (clearBtn) {
        clearBtn.addEventListener('click', function() {
            searchInput.value = '';
            searchInput.dispatchEvent(new Event('input'));
            searchInput.focus();
        });
    }
}

function performSearch(query) {
    const products = document.querySelectorAll('.product-card');
    const searchQuery = query.toLowerCase().trim();
    let visibleCount = 0;
    
    products.forEach(product => {
        const title = product.querySelector('.card-title')?.textContent.toLowerCase() || '';
        const description = product.querySelector('.card-text')?.textContent.toLowerCase() || '';
        
        const matches = title.includes(searchQuery) || description.includes(searchQuery);
        product.closest('.col-lg-3, .col-lg-4, .col-md-6').style.display = matches ? '' : 'none';
        
        if (matches) visibleCount++;
    });
    
    updateNoResultsMessage(visibleCount);
}

// ============================================
// CONTROLES DE CANTIDAD
// ============================================
function initQuantityControls() {
    document.querySelectorAll('input[type="number"][name="cantidad"]').forEach(input => {
        // Crear controles + y -
        const wrapper = document.createElement('div');
        wrapper.className = 'quantity-control d-flex align-items-center gap-2';
        
        const decreaseBtn = document.createElement('button');
        decreaseBtn.type = 'button';
        decreaseBtn.className = 'btn btn-outline-secondary btn-sm';
        decreaseBtn.innerHTML = '<i class="fas fa-minus"></i>';
        decreaseBtn.onclick = () => changeQuantity(input, -1);
        
        const increaseBtn = document.createElement('button');
        increaseBtn.type = 'button';
        increaseBtn.className = 'btn btn-outline-secondary btn-sm';
        increaseBtn.innerHTML = '<i class="fas fa-plus"></i>';
        increaseBtn.onclick = () => changeQuantity(input, 1);
        
        input.parentElement.insertBefore(wrapper, input);
        wrapper.appendChild(decreaseBtn);
        wrapper.appendChild(input);
        wrapper.appendChild(increaseBtn);
    });
}

function changeQuantity(input, delta) {
    const currentValue = parseInt(input.value) || 1;
    const min = parseInt(input.getAttribute('min')) || 1;
    const max = parseInt(input.getAttribute('max')) || 999;
    
    const newValue = Math.max(min, Math.min(max, currentValue + delta));
    input.value = newValue;
    
    // Disparar evento change si es necesario
    input.dispatchEvent(new Event('change'));
}

// ============================================
// GALERÍA DE IMÁGENES DEL PRODUCTO
// ============================================
function initProductGallery() {
    const thumbnails = document.querySelectorAll('.thumbnail');
    const mainImage = document.querySelector('.main-image img');
    
    if (!mainImage) return;
    
    thumbnails.forEach(thumbnail => {
        thumbnail.addEventListener('click', function() {
            // Remover active de todos
            thumbnails.forEach(t => t.classList.remove('active'));
            
            // Agregar active al clickeado
            this.classList.add('active');
            
            // Cambiar imagen principal con animación
            mainImage.style.opacity = '0';
            setTimeout(() => {
                mainImage.src = this.querySelector('img').src;
                mainImage.style.opacity = '1';
            }, 200);
        });
    });
}

// Inicializar galería si existe
if (document.querySelector('.product-image-gallery')) {
    initProductGallery();
}

// ============================================
// NOTIFICACIONES/TOAST
// ============================================
function showNotification(message, type = 'info') {
    const toastContainer = getOrCreateToastContainer();
    
    const toastId = 'toast-' + Date.now();
    const iconMap = {
        'success': 'fa-check-circle',
        'error': 'fa-exclamation-circle',
        'warning': 'fa-exclamation-triangle',
        'info': 'fa-info-circle'
    };
    
    const toast = document.createElement('div');
    toast.id = toastId;
    toast.className = `alert alert-${type} alert-dismissible fade show shadow-lg`;
    toast.style.cssText = 'min-width: 300px; margin-bottom: 1rem; animation: slideInRight 0.3s ease;';
    toast.innerHTML = `
        <i class="fas ${iconMap[type]} me-2"></i>
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    toastContainer.appendChild(toast);
    
    // Auto-remover después de 5 segundos
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 5000);
}

function getOrCreateToastContainer() {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 9999;';
        document.body.appendChild(container);
    }
    return container;
}

// ============================================
// ANIMACIÓN DE ENTRADA PARA ELEMENTOS
// ============================================
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .fade-in-up {
        animation: fadeInUp 0.6s ease-out;
    }
`;
document.head.appendChild(style);

// ============================================
// MANEJO DE FAVORITOS (SI EXISTE)
// ============================================
function toggleFavorito(productoId, button) {
    fetch(`/productos/favorito/${productoId}/toggle/`, {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCsrfToken(),
            'Content-Type': 'application/json',
        },
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const icon = button.querySelector('i');
            if (data.added) {
                icon.classList.remove('far');
                icon.classList.add('fas');
                button.classList.add('text-danger');
                showNotification('Producto agregado a favoritos', 'success');
            } else {
                icon.classList.remove('fas');
                icon.classList.add('far');
                button.classList.remove('text-danger');
                showNotification('Producto removido de favoritos', 'info');
            }
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('Error al actualizar favoritos', 'error');
    });
}

// ============================================
// OBTENER CSRF TOKEN
// ============================================
function getCsrfToken() {
    return document.querySelector('[name=csrfmiddlewaretoken]')?.value || '';
}

// ============================================
// SMOOTH SCROLL PARA ANCLAS
// ============================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#' || href === '#!') return;
        
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ============================================
// VALIDACIÓN DE FORMULARIOS
// ============================================
function initFormValidation() {
    const forms = document.querySelectorAll('.needs-validation');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(event) {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
                
                // Mostrar primer campo con error
                const firstInvalid = form.querySelector(':invalid');
                if (firstInvalid) {
                    firstInvalid.focus();
                    showNotification('Por favor completa todos los campos requeridos', 'warning');
                }
            }
            
            form.classList.add('was-validated');
        }, false);
    });
}

// Inicializar validación
initFormValidation();

// ============================================
// PREVENIR DOBLE SUBMIT EN FORMULARIOS
// ============================================
document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', function() {
        const submitBtn = this.querySelector('button[type="submit"]');
        if (submitBtn && !submitBtn.disabled) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Procesando...';
            
            // Re-habilitar después de 3 segundos por si hay error
            setTimeout(() => {
                submitBtn.disabled = false;
                submitBtn.innerHTML = submitBtn.dataset.originalText || 'Enviar';
            }, 3000);
        }
    });
});

// ============================================
// CONTADOR DE CARACTERES EN TEXTAREAS
// ============================================
document.querySelectorAll('textarea[maxlength]').forEach(textarea => {
    const maxLength = textarea.getAttribute('maxlength');
    const counter = document.createElement('small');
    counter.className = 'form-text text-muted';
    counter.textContent = `0 / ${maxLength} caracteres`;
    
    textarea.parentElement.appendChild(counter);
    
    textarea.addEventListener('input', function() {
        const length = this.value.length;
        counter.textContent = `${length} / ${maxLength} caracteres`;
        
        if (length >= maxLength * 0.9) {
            counter.classList.add('text-warning');
        } else {
            counter.classList.remove('text-warning');
        }
    });
});

// ============================================
// MANEJO DE IMÁGENES ROTAS
// ============================================
document.querySelectorAll('img').forEach(img => {
    img.addEventListener('error', function() {
        this.src = 'https://via.placeholder.com/400x300/667eea/ffffff?text=Imagen+No+Disponible';
        this.alt = 'Imagen no disponible';
    });
});

// ============================================
// COPY TO CLIPBOARD
// ============================================
function copyToClipboard(text, successMessage = 'Copiado al portapapeles') {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text)
            .then(() => showNotification(successMessage, 'success'))
            .catch(() => showNotification('Error al copiar', 'error'));
    } else {
        // Fallback para navegadores antiguos
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            showNotification(successMessage, 'success');
        } catch (err) {
            showNotification('Error al copiar', 'error');
        }
        document.body.removeChild(textArea);
    }
}

// ============================================
// FORMATEAR PRECIOS
// ============================================
function formatPrice(price) {
    return new Intl.NumberFormat('es-PA', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(price);
}

// ============================================
// UTILIDADES GLOBALES
// ============================================
window.GunaShop = {
    showNotification,
    toggleFavorito,
    copyToClipboard,
    formatPrice,
    clearFilters
};

// ============================================
// LOG DE INICIO
// ============================================
console.log('%c🎨 Molas Guna Shop ', 'background: linear-gradient(135deg, #D32F2F, #F57C00); color: white; padding: 10px 20px; font-size: 16px; font-weight: bold;');
console.log('%cSistema cargado correctamente ✓', 'color: #388E3C; font-weight: bold;');