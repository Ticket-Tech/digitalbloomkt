document.addEventListener('DOMContentLoaded', function() {

    // --- 1. Selecciona los elementos clave del carrusel ---
    const track = document.querySelector('.certificados-container');
    const nextButton = document.querySelector('.carousel-next-btn');
    const prevButton = document.querySelector('.carousel-prev-btn');
    const dotsContainer = document.querySelector('.carousel-dots');
    const carouselViewport = document.querySelector('.carousel-viewport');

    // --- VERIFICACIÓN CRÍTICA DE LOS ELEMENTOS DEL CARRUSEL ---
    if (!track || !nextButton || !prevButton || !dotsContainer || !carouselViewport) {
        console.error("ERROR: No se pudieron encontrar todos los elementos del carrusel. Verifica tus clases HTML. Asegúrate de tener: .certificados-container (como track), .carousel-next-btn, .carousel-prev-btn, .carousel-dots, .carousel-viewport.");
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

        const slideElementWidth = firstSlide.offsetWidth;
        const marginRight = parseFloat(slideComputedStyle.marginRight);

        slideWidth = slideElementWidth + marginRight;

        const visibleViewportWidth = carouselViewport.offsetWidth;
        const desktopBreakpoint = 1200;

        if (window.innerWidth >= desktopBreakpoint) {
            slidesPerPage = Math.floor(visibleViewportWidth / slideWidth);
            if (slidesPerPage === 0) slidesPerPage = 1;
            if (slidesPerPage > 5) slidesPerPage = 5; // No mostrar más de 5 si es tu límite deseado
        } else {
            slidesPerPage = Math.floor(visibleViewportWidth / slideWidth);
            if (slidesPerPage <= 0) {
                slidesPerPage = 1;
            }
        }

        if (slidesPerPage > slides.length) {
            slidesPerPage = slides.length;
        }

        if (slides.length <= slidesPerPage) {
            nextButton.style.display = 'none';
            prevButton.style.display = 'none';
            dotsContainer.style.display = 'none';
        } else {
            nextButton.style.display = 'block';
            prevButton.style.display = 'block';
            dotsContainer.style.display = 'block';
        }

        moveToSlide(currentSlideIndex);
    }

    /**
     * Mueve el carrusel a una posición de slide específica.
     * @param {number} index El índice del primer slide de la página a la que mover.
     */
    function moveToSlide(index) {
        let maxIndex = slides.length - slidesPerPage;
        if (maxIndex < 0) maxIndex = 0;

        if (index < 0) {
            currentSlideIndex = 0;
        } else if (index > maxIndex) {
            currentSlideIndex = maxIndex;
        } else {
            currentSlideIndex = index;
        }

        const offset = -currentSlideIndex * slideWidth;
        track.style.transform = `translateX(${offset}px)`;

        updateDots();
        updateArrowVisibility();
    }

    /**
     * Genera los puntos de navegación (dots) dinámicamente.
     */
    function setupDots() {
        dotsContainer.innerHTML = '';
        const totalPages = Math.ceil(slides.length / slidesPerPage);

        for (let i = 0; i < totalPages; i++) {
            const dot = document.createElement('span');
            dot.classList.add('dot');
            dot.addEventListener('click', () => moveToSlide(i * slidesPerPage));
            dotsContainer.appendChild(dot);
        }
        updateDots();
    }

    /**
     * Actualiza el estado activo de los puntos de navegación.
     */
    function updateDots() {
        const dots = Array.from(dotsContainer.children);
        if (dots.length === 0) return;

        dots.forEach((dot, i) => {
            dot.classList.remove('active');
            if (currentSlideIndex >= (i * slidesPerPage) && currentSlideIndex < ((i + 1) * slidesPerPage)) {
                dot.classList.add('active');
            }
            if (currentSlideIndex === (slides.length - slidesPerPage) && i === dots.length - 1 && slides.length > slidesPerPage) {
                dot.classList.add('active');
            }
        });
        if (currentSlideIndex === 0 && dots.length > 0) {
            dots[0].classList.add('active');
        }
    }

    /**
     * Actualiza el estado habilitado/deshabilitado de las flechas de navegación.
     */
    function updateArrowVisibility() {
        prevButton.disabled = currentSlideIndex === 0;
        nextButton.disabled = currentSlideIndex >= (slides.length - slidesPerPage);

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
        moveToSlide(currentSlideIndex + slidesPerPage);
    });

    prevButton.addEventListener('click', () => {
        moveToSlide(currentSlideIndex - slidesPerPage);
    });

    // --- EVENT LISTENERS PARA EL SWIPE TÁCTIL (TOUCH Y MOUSE PARA DRAG) ---
    track.addEventListener('touchstart', handleStart);
    track.addEventListener('mousedown', handleStart);

    function handleStart(e) {
        if (e.target.closest('.certificado-circulo')) {
            isDragging = false;
            return;
        }

        isDragging = true;
        startX = (e.touches ? e.touches[0].clientX : e.clientX);
        track.style.transition = 'none';
        if (e.type === 'mousedown') {
            e.preventDefault();
        }
    }

    track.addEventListener('touchmove', handleMove);
    track.addEventListener('mousemove', handleMove);

    function handleMove(e) {
        if (!isDragging) return;
        endX = (e.touches ? e.touches[0].clientX : e.clientX);
        const currentTranslateX = -currentSlideIndex * slideWidth;
        const dragDistance = endX - startX;
        track.style.transform = `translateX(${currentTranslateX + dragDistance}px)`;
    }

    track.addEventListener('touchend', handleEnd);
    track.addEventListener('mouseup', handleEnd);
    track.addEventListener('mouseleave', handleEnd);

    function handleEnd() {
        if (!isDragging) return;
        isDragging = false;

        track.style.transition = 'transform 0.3s ease-in-out';

        const swipeDistance = endX - startX;
        const swipeThreshold = 50;

        if (swipeDistance < -swipeThreshold) {
            moveToSlide(currentSlideIndex + slidesPerPage);
        } else if (swipeDistance > swipeThreshold) {
            moveToSlide(currentSlideIndex - slidesPerPage);
        } else {
            moveToSlide(currentSlideIndex);
        }

        startX = 0;
        endX = 0;
    }

    // --- 4. Inicialización del Carrusel ---
    calculateSlideDimensions();
    setupDots();
    moveToSlide(0);

    // --- 5. Manejo de la Responsividad ---
    window.addEventListener('resize', () => {
        calculateSlideDimensions();
        setupDots();
        moveToSlide(currentSlideIndex);
    });


    // --- 6. FUNCIONALIDAD PARA EL MODAL DE CERTIFICADOS ---
    const certificadoModal = document.getElementById('certificado-modal');
    const modalImg = document.getElementById('img-certificado-modal');
    const captionText = document.getElementById('modal-caption');
    const closeModal = document.querySelector('.cerrar-modal');

    const certificadosParaModal = slides.length > 0 ? slides : Array.from(document.querySelectorAll('.certificado-circulo'));

    if (certificadoModal && modalImg && closeModal && certificadosParaModal.length > 0) {
        certificadosParaModal.forEach(certificado => {
            certificado.addEventListener('click', function(e) {
                e.stopPropagation();

                const imageUrlToDisplay = this.dataset.largeImage;
                const caption = this.dataset.caption;

                if (imageUrlToDisplay) {
                    modalImg.src = imageUrlToDisplay;
                    modalImg.alt = caption || "Certificado Ampliado";
                    certificadoModal.style.display = 'flex';
                } else {
                    console.warn("No se encontró el atributo data-large-image en el certificado:", this);
                    return;
                }

                if (captionText) {
                    captionText.textContent = caption || '';
                }
            });
        });

        // Cierra el modal al hacer clic en el botón de cerrar
        closeModal.addEventListener('click', function() {
            certificadoModal.style.display = 'none';
            modalImg.src = '';
            if (captionText) captionText.textContent = '';
        });

        // Cierra el modal al hacer clic fuera de la imagen (en el overlay)
        certificadoModal.addEventListener('click', function(event) {
            if (event.target === certificadoModal) {
                certificadoModal.style.display = 'none';
                modalImg.src = '';
                if (captionText) captionText.textContent = '';
            }
        });

        // Cierra el modal al presionar la tecla 'Escape' (Solo uno por documento es suficiente)
        // Este ya lo maneja el 'document.addEventListener' general al final, por lo que lo removemos de aquí.
        /*
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape' || event.key === 'Esc') {
                if (certificadoModal.style.display === 'flex') {
                    certificadoModal.style.display = 'none';
                    modalImg.src = '';
                    if (captionText) captionText.textContent = '';
                }
            }
        });
        */

    } else {
        console.warn("Elementos HTML para el modal de certificados no encontrados o no hay certificados con clase '.certificado-circulo' para clickear. La funcionalidad del modal de certificados no se activará.");
    }


    // --- FUNCIONALIDAD PARA EL MODAL DE CONTENIDO GRATUITO ---

    // AHORA LAS DECLARACIONES DE CONSTANTES SON ÚNICAS EN TODO EL ARCHIVO.
    // SEGUNDA OCURRENCIA DE ESTAS LÍNEAS ELIMINADA.
    const btnAbrirContenidoModalGratuito = document.getElementById('descarga-aqui-btn'); // Renombrado para evitar conflicto
    const contenidoGratuitoModal = document.getElementById('contenido-gratuito-modal');
    const cerrarContenidoModalGratuito = document.querySelector('.cerrar-modal-gratuito'); // Renombrado
    const formContenidoGratuito = document.getElementById('form-contenido-gratuito');


    if (btnAbrirContenidoModalGratuito && contenidoGratuitoModal && cerrarContenidoModalGratuito && formContenidoGratuito) {

        btnAbrirContenidoModalGratuito.addEventListener('click', function(e) {
            e.preventDefault();
            contenidoGratuitoModal.style.display = 'flex';
        });

        cerrarContenidoModalGratuito.addEventListener('click', function() {
            contenidoGratuitoModal.style.display = 'none';
            formContenidoGratuito.reset();
        });

        contenidoGratuitoModal.addEventListener('click', function(event) {
            if (event.target === contenidoGratuitoModal) {
                contenidoGratuitoModal.style.display = 'none';
                formContenidoGratuito.reset();
            }
        });

        // Eliminamos el keydown aquí, será manejado por un único event listener global al final.
        /*
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape' || event.key === 'Esc') {
                if (contenidoGratuitoModal.style.display === 'flex') {
                    contenidoGratuitoModal.style.display = 'none';
                    formContenidoGratuito.reset();
                }
            }
        });
        */

        formContenidoGratuito.addEventListener('submit', function(e) {
            e.preventDefault();

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

            // --- LÍNEAS ELIMINADAS: const formData = new FormData(); formData.append(...); ---
            // Ya no son necesarias con el método mailto:

            // --- INICIO DEL CÓDIGO para el envío con mailto en nueva pestaña ---
            let emailBody = `Hola DIGITALBLOOMKT,\n\n`;
            emailBody += `El usuario ${userEmail} ha solicitado el siguiente contenido gratuito:\n\n`;

            emailBody += selectedContents.map(content => `- ${content}`).join('\n');

            emailBody += `\n\nPor favor, contacta a ${userEmail} para enviarle el contenido solicitado.`;
            emailBody += `\n\nSaludos,`;
            emailBody += `\nTu Sitio Web`;

            const recipientEmail = 'brendadujovich@gmail.com';
            const subject = encodeURIComponent('Solicitud de Contenido Gratuito desde el Sitio Web');
            const body = encodeURIComponent(emailBody);

            const mailtoUrl = `mailto:${recipientEmail}?subject=${subject}&body=${body}`;

            window.open(mailtoUrl, '_blank');

            contenidoGratuitoModal.style.display = 'none';
            formContenidoGratuito.reset();
            // --- FIN DEL CÓDIGO ---

        }); // Cierre del addEventListener('submit')

    } else {
        console.warn("Algunos elementos del modal de contenido gratuito no fueron encontrados. Asegúrate de tener un botón con ID 'descarga-aqui-btn', un modal con ID 'contenido-gratuito-modal', y un formulario con ID 'form-contenido-gratuito'.");
    }

    // --- MANEJO CENTRALIZADO DE LA TECLA ESCAPE PARA CERRAR MODALES ---
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' || event.key === 'Esc') {
            // Cierra el modal de certificados si está abierto
            if (certificadoModal && certificadoModal.style.display === 'flex') {
                certificadoModal.style.display = 'none';
                modalImg.src = '';
                if (captionText) captionText.textContent = '';
            }
            // Cierra el modal de contenido gratuito si está abierto
            if (contenidoGratuitoModal && contenidoGratuitoModal.style.display === 'flex') {
                contenidoGratuitoModal.style.display = 'none';
                formContenidoGratuito.reset();
            }
        }
    });

}); // <-- CIERRE FINAL DEL document.addEventListener('DOMContentLoaded')