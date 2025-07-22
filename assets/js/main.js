document.addEventListener('DOMContentLoaded', function() {
    // --- 1. Selecciona los elementos clave del carrusel ---
    // Aseguramos que 'track' apunte al contenedor flex que tiene los slides
    const track = document.querySelector('.certificados-container'); 
    const nextButton = document.querySelector('.carousel-next-btn');
    const prevButton = document.querySelector('.carousel-prev-btn');
    const dotsContainer = document.querySelector('.carousel-dots');
    const carouselViewport = document.querySelector('.carousel-viewport');

    // --- VERIFICACIÓN CRÍTICA DE LOS ELEMENTOS DEL CARRUSEL ---
    if (!track || !nextButton || !prevButton || !dotsContainer || !carouselViewport) {
        console.error("ERROR: No se pudieron encontrar todos los elementos del carrusel. Verifica tus clases HTML. Asegúrate de tener: .certificados-container (como track), .carousel-next-btn, .carousel-prev-btn, .carousel-dots, .carousel-viewport.");
        // Ocultar controles si no se encuentran los elementos principales del carrusel
        if (nextButton) nextButton.style.display = 'none';
        if (prevButton) prevButton.style.display = 'none';
        if (dotsContainer) dotsContainer.style.display = 'none';
        return; // Es crucial retornar aquí para evitar errores si los elementos no existen
    }

    const slides = Array.from(track.children); // Tus .certificado-circulo

    let slideWidth; // Ancho de un solo certificado, incluyendo su margen derecho
    let currentSlideIndex = 0; // Índice del primer slide visible de la página actual
    let slidesPerPage = 0; // Cuántos slides caben o se muestran por "página" del carrusel

    // --- VARIABLES PARA EL SWIPE TÁCTIL (TOUCH Y MOUSE) ---
    let startX = 0;
    let endX = 0;
    let isDragging = false;


    // --- 2. Funciones del Carrusel ---

    /**
     * Calcula el ancho de un slide y cuántos slides caben por página.
     * Actualiza la visibilidad de los controles.
     */
    function calculateSlideDimensions() {
        if (slides.length === 0) {
            console.warn("No hay slides en el carrusel. Ocultando controles.");
            nextButton.style.display = 'none';
            prevButton.style.display = 'none';
            dotsContainer.style.display = 'none';
            return;
        }

        const firstSlide = slides[0];
        const slideComputedStyle = getComputedStyle(firstSlide);

        // offsetWidth incluye padding y borde, pero no margin. Por eso sumamos el margen derecho.
        const slideElementWidth = firstSlide.offsetWidth;
        const marginRight = parseFloat(slideComputedStyle.marginRight);

        // slideWidth ahora es el ancho de un solo slide + su margen derecho
        slideWidth = slideElementWidth + marginRight;

        const visibleViewportWidth = carouselViewport.offsetWidth;
        const desktopBreakpoint = 1200; // Define tu punto de quiebre para desktop

        if (window.innerWidth >= desktopBreakpoint) {
            // En desktop, si quieres mostrar 5, asegúrate de que el carousel-viewport sea lo suficientemente ancho.
            // slidesPerPage = 5; // Tu configuración anterior
            // ALTERNATIVA: Calcula cuántos caben realmente en el viewport grande para ser más adaptable
            slidesPerPage = Math.floor(visibleViewportWidth / slideWidth);
            if (slidesPerPage === 0) slidesPerPage = 1; // Mínimo 1
            // Si 5 es un valor fijo deseado, descomenta la línea anterior y comenta esta sección
            if (slidesPerPage > 5) slidesPerPage = 5; // No mostrar más de 5 si es tu límite deseado

        } else {
            // En mobile y tablet, calculamos cuántos caben
            slidesPerPage = Math.floor(visibleViewportWidth / slideWidth);
            if (slidesPerPage <= 0) { // Asegura que siempre se muestre al menos 1 slide
                slidesPerPage = 1;
            }
        }

        // Asegura que slidesPerPage no sea mayor que el número total de slides
        if (slidesPerPage > slides.length) {
            slidesPerPage = slides.length;
        }

        // Ocultar o mostrar controles (flechas y dots)
        // Solo mostramos controles si hay más slides de los que caben en una página
        if (slides.length <= slidesPerPage) {
            nextButton.style.display = 'none';
            prevButton.style.display = 'none';
            dotsContainer.style.display = 'none';
        } else {
            nextButton.style.display = 'block';
            prevButton.style.display = 'block';
            dotsContainer.style.display = 'block';
        }

        // Mueve el carrusel a la posición actual después de recalcular dimensiones
        // Esto es importante para que el carrusel se ajuste si la ventana se redimensiona
        moveToSlide(currentSlideIndex);
    }

    /**
     * Mueve el carrusel a una posición de slide específica.
     * @param {number} index El índice del primer slide de la página a la que mover.
     */
    function moveToSlide(index) {
        // Calcula el índice máximo al que podemos ir sin mostrar blanco al final
        // El último índice válido es (total de slides - cantidad de slides visibles en una página)
        let maxIndex = slides.length - slidesPerPage;
        if (maxIndex < 0) maxIndex = 0; // Evita índices negativos si hay pocos slides

        // Limita el índice para que no se salga de los límites
        if (index < 0) {
            currentSlideIndex = 0;
        } else if (index > maxIndex) {
            currentSlideIndex = maxIndex;
        } else {
            currentSlideIndex = index;
        }

        // Calcula el offset (desplazamiento en píxeles) para el transform
        // Este es el cálculo CRÍTICO: Mueve el track por el índice de la página actual
        // multiplicado por el ancho de UN solo slide. El `currentSlideIndex`
        // ya representa el inicio de la "página" que debe mostrarse.
        const offset = -currentSlideIndex * slideWidth;
        track.style.transform = `translateX(${offset}px)`;

        updateDots();
        updateArrowVisibility();
    }

    /**
     * Genera los puntos de navegación (dots) dinámicamente.
     */
    function setupDots() {
        dotsContainer.innerHTML = ''; // Limpia los dots existentes
        // El número total de páginas es el total de slides dividido por slidesPerPage
        const totalPages = Math.ceil(slides.length / slidesPerPage);

        for (let i = 0; i < totalPages; i++) {
            const dot = document.createElement('span');
            dot.classList.add('dot');
            // Cada dot navega a la primera slide de su "página"
            dot.addEventListener('click', () => moveToSlide(i * slidesPerPage));
            dotsContainer.appendChild(dot);
        }
        updateDots(); // Actualiza el estado activo de los dots
    }

    /**
     * Actualiza el estado activo de los puntos de navegación.
     */
    function updateDots() {
        const dots = Array.from(dotsContainer.children);
        if (dots.length === 0) return;

        dots.forEach((dot, i) => {
            dot.classList.remove('active');
            // Un dot está activo si el currentSlideIndex cae dentro de su rango de página
            if (currentSlideIndex >= (i * slidesPerPage) && currentSlideIndex < ((i + 1) * slidesPerPage)) {
                dot.classList.add('active');
            }
            // Manejo especial para el último dot si el currentSlideIndex está en el final
            // y hay más de una página.
            if (currentSlideIndex === (slides.length - slidesPerPage) && i === dots.length - 1 && slides.length > slidesPerPage) {
                dot.classList.add('active');
            }
        });
        // Asegurarse de que el primer dot esté activo si estamos en el inicio
        if (currentSlideIndex === 0 && dots.length > 0) {
            dots[0].classList.add('active');
        }
    }

    /**
     * Actualiza el estado habilitado/deshabilitado de las flechas de navegación.
     */
    function updateArrowVisibility() {
        prevButton.disabled = currentSlideIndex === 0; // Deshabilita "Anterior" en el primer slide
        // Deshabilita "Siguiente" si estamos en la última "página" visible
        nextButton.disabled = currentSlideIndex >= (slides.length - slidesPerPage);

        // También controla la visibilidad total de las flechas si no hay suficientes slides para deslizar
        if (slides.length <= slidesPerPage) {
            prevButton.style.display = 'none';
            nextButton.style.display = 'none';
        } else {
            prevButton.style.display = 'block';
            nextButton.style.display = 'block';
        }
    }

    // --- 3. Configuración de Event Listeners del Carrusel ---
    nextButton.addEventListener('click', () => {
        // Avanza el índice por la cantidad de slides por página
        moveToSlide(currentSlideIndex + slidesPerPage);
    });

    prevButton.addEventListener('click', () => {
        // Retrocede el índice por la cantidad de slides por página
        moveToSlide(currentSlideIndex - slidesPerPage);
    });

    // --- EVENT LISTENERS PARA EL SWIPE TÁCTIL (TOUCH Y MOUSE PARA DRAG) ---
    track.addEventListener('touchstart', handleStart);
    track.addEventListener('mousedown', handleStart);

    function handleStart(e) {
        // Evita iniciar el arrastre si el click es para el modal del certificado
        if (e.target.closest('.certificado-circulo')) {
            isDragging = false;
            return;
        }

        isDragging = true;
        startX = (e.touches ? e.touches[0].clientX : e.clientX);
        track.style.transition = 'none'; // Desactiva la transición CSS durante el arrastre
        if (e.type === 'mousedown') {
            e.preventDefault(); // Evita el comportamiento de arrastre por defecto del navegador
        }
    }

    track.addEventListener('touchmove', handleMove);
    track.addEventListener('mousemove', handleMove);

    function handleMove(e) {
        if (!isDragging) return;
        endX = (e.touches ? e.touches[0].clientX : e.clientX);
        // Calcula el offset temporal para el arrastre visual
        const currentTranslateX = -currentSlideIndex * slideWidth;
        const dragDistance = endX - startX;
        track.style.transform = `translateX(${currentTranslateX + dragDistance}px)`;
    }

    track.addEventListener('touchend', handleEnd);
    track.addEventListener('mouseup', handleEnd);
    track.addEventListener('mouseleave', handleEnd); // Para cuando el mouse se va del área de arrastre

    function handleEnd() {
        if (!isDragging) return;
        isDragging = false;

        track.style.transition = 'transform 0.3s ease-in-out'; // Reactiva la transición CSS

        const swipeDistance = endX - startX;
        const swipeThreshold = 50; // Distancia mínima en píxeles para considerar un swipe

        // Decide a qué "página" de slides moverte
        if (swipeDistance < -swipeThreshold) { // Swipe a la izquierda (avanza a la siguiente "página")
            moveToSlide(currentSlideIndex + slidesPerPage);
        } else if (swipeDistance > swipeThreshold) { // Swipe a la derecha (retrocede a la "página" anterior)
            moveToSlide(currentSlideIndex - slidesPerPage);
        } else {
            // Si el swipe no fue suficiente para cambiar de página, vuelve a la posición de la página actual
            moveToSlide(currentSlideIndex);
        }

        // Resetea las coordenadas de arrastre
        startX = 0;
        endX = 0;
    }

    // --- 4. Inicialización del Carrusel ---
    calculateSlideDimensions(); // Calcula las dimensiones al cargar la página
    setupDots(); // Configura los puntos de paginación
    moveToSlide(0); // Muestra el primer slide al inicio

    // --- 5. Manejo de la Responsividad ---
    window.addEventListener('resize', () => {
        // Recalcula todo y vuelve al slide actual (o al inicio si prefieres) al redimensionar
        calculateSlideDimensions();
        setupDots();
        moveToSlide(currentSlideIndex);
    });


    // --- 6. FUNCIONALIDAD PARA EL MODAL DE CERTIFICADOS ---
    const certificadoModal = document.getElementById('certificado-modal');
    const modalImg = document.getElementById('img-certificado-modal');
    const captionText = document.getElementById('modal-caption');
    const closeModal = document.querySelector('.cerrar-modal');

    // Usamos los mismos 'slides' del carrusel para el modal. Si el carrusel no se inicializó,
    // seleccionamos los certificados directamente.
    const certificadosParaModal = slides.length > 0 ? slides : Array.from(document.querySelectorAll('.certificado-circulo'));

    if (certificadoModal && modalImg && closeModal && certificadosParaModal.length > 0) {
        certificadosParaModal.forEach(certificado => {
            certificado.addEventListener('click', function(e) {
                e.stopPropagation(); // Evita que el evento se propague al documento o al carrusel

                // Asegúrate de que tus elementos .certificado-circulo tengan atributos data-large-image y data-caption
                const imageUrlToDisplay = this.dataset.largeImage;
                const caption = this.dataset.caption;

                if (imageUrlToDisplay) {
                    modalImg.src = imageUrlToDisplay;
                    modalImg.alt = caption || "Certificado Ampliado";
                    certificadoModal.style.display = 'flex'; // Muestra el modal
                } else {
                    console.warn("No se encontró el atributo data-large-image en el certificado:", this);
                    return; // Sale si no hay imagen para mostrar
                }

                if (captionText) {
                    captionText.textContent = caption || ''; // Muestra la descripción
                }
            });
        });

        // Cierra el modal al hacer clic en el botón de cerrar
        closeModal.addEventListener('click', function() {
            certificadoModal.style.display = 'none';
            modalImg.src = ''; // Limpia la imagen
            if (captionText) captionText.textContent = ''; // Limpia la descripción
        });

        // Cierra el modal al hacer clic fuera de la imagen (en el overlay)
        certificadoModal.addEventListener('click', function(event) {
            if (event.target === certificadoModal) {
                certificadoModal.style.display = 'none';
                modalImg.src = '';
                if (captionText) captionText.textContent = '';
            }
        });

        // Cierra el modal al presionar la tecla 'Escape'
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape' || event.key === 'Esc') {
                if (certificadoModal.style.display === 'flex') {
                    certificadoModal.style.display = 'none';
                    modalImg.src = '';
                    if (captionText) captionText.textContent = '';
                }
            }
        });

    } else {
        console.warn("Elementos HTML para el modal de certificados no encontrados o no hay certificados con clase '.certificado-circulo' para clickear. La funcionalidad del modal de certificados no se activará.");
    }


    // --- FUNCIONALIDAD PARA EL MODAL DE CONTENIDO GRATUITO ---

    // Elementos del modal de contenido gratuito
    const btnAbrirContenidoModal = document.getElementById('descarga-aqui-btn');
    const contenidoGratuitoModal = document.getElementById('contenido-gratuito-modal');
    const cerrarContenidoModal = document.querySelector('.cerrar-modal-gratuito');
    const formContenidoGratuito = document.getElementById('form-contenido-gratuito');

    if (btnAbrirContenidoModal && contenidoGratuitoModal && cerrarContenidoModal && formContenidoGratuito) {

        btnAbrirContenidoModal.addEventListener('click', function(e) {
            e.preventDefault(); // Evita el comportamiento por defecto del enlace
            contenidoGratuitoModal.style.display = 'flex'; // Muestra el modal
        });

        cerrarContenidoModal.addEventListener('click', function() {
            contenidoGratuitoModal.style.display = 'none'; // Oculta el modal
            formContenidoGratuito.reset(); // Reinicia el formulario
        });

        contenidoGratuitoModal.addEventListener('click', function(event) {
            if (event.target === contenidoGratuitoModal) {
                contenidoGratuitoModal.style.display = 'none';
                formContenidoGratuito.reset();
            }
        });

        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape' || event.key === 'Esc') {
                if (contenidoGratuitoModal.style.display === 'flex') {
                    contenidoGratuitoModal.style.display = 'none';
                    formContenidoGratuito.reset();
                }
            }
        });

        formContenidoGratuito.addEventListener('submit', function(e) {
            e.preventDefault(); // Evita el envío por defecto del formulario

            const userEmail = document.getElementById('user-email-gratuito').value;
            const selectedContents = [];
            const checkboxes = document.querySelectorAll('#form-contenido-gratuito input[name="contenido"]:checked');

            checkboxes.forEach(checkbox => {
                const labelText = checkbox.parentNode.textContent.trim();
                selectedContents.push(labelText);
            });

            if (selectedContents.length === 0) {
                alert('Por favor, selecciona al menos un contenido para descargar.');
                return;
            }

            const formData = new FormData();
            formData.append('email', userEmail);
            formData.append('contenidos_solicitados', selectedContents.join(', '));

            // --- ¡IMPORTANTE! Reemplaza 'https://formspree.io/f/TU_ENDPOINT_FORMSPREE' con tu URL real de Formspree ---
            // Este es un placeholder. Necesitas tu propia URL de Formspree aquí.
            fetch('https://formspree.io/f/TU_ENDPOINT_FORMSPREE', { // ¡CAMBIA ESTO POR TU ENDPOINT REAL DE FORMSPREE!
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            })
            .then(response => {
                if (response.ok) {
                    alert('¡Solicitud enviada! En breve un administrador se pondrá en contacto para enviarte el contenido.');
                    contenidoGratuitoModal.style.display = 'none';
                    formContenidoGratuito.reset();
                } else {
                    alert('Hubo un error al enviar tu solicitud. Por favor, inténtalo de nuevo más tarde.');
                }
            })
            .catch(error => {
                console.error('Error de red:', error);
                alert('Hubo un error de conexión. Por favor, inténtalo de nuevo más tarde.');
            });
        });

    } else {
        console.warn("Algunos elementos del modal de contenido gratuito no fueron encontrados. Asegúrate de tener un botón con ID 'descarga-aqui-btn', un modal con ID 'contenido-gratuito-modal', y un formulario con ID 'form-contenido-gratuito'.");
    }

}); // <-- CIERRE FINAL DEL document.addEventListener('DOMContentLoaded')