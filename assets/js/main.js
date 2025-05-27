document.addEventListener('DOMContentLoaded', function() {
    // --- 1. Selecciona los elementos clave del carrusel ---
    const track = document.querySelector('.carousel-track');
    const nextButton = document.querySelector('.carousel-next-btn');
    const prevButton = document.querySelector('.carousel-prev-btn');
    const dotsContainer = document.querySelector('.carousel-dots');
    const carouselViewport = document.querySelector('.carousel-viewport');

    // --- VERIFICACIÓN CRÍTICA DE LOS ELEMENTOS DEL CARRUSEL ---
    if (!track || !nextButton || !prevButton || !dotsContainer || !carouselViewport) {
        console.error("ERROR: No se pudieron encontrar todos los elementos del carrusel. Verifica tus clases HTML. Asegúrate de tener: .carousel-track, .carousel-next-btn, .carousel-prev-btn, .carousel-dots, .carousel-viewport.");
        if (nextButton) nextButton.style.display = 'none';
        if (prevButton) prevButton.style.display = 'none';
        if (dotsContainer) dotsContainer.style.display = 'none';
        // No retorna aquí para permitir que el resto del script (como el modal de contenido gratuito) siga funcionando si es posible.
    }

    const slides = Array.from(track ? track.children : []); // Todos tus .certificado-circulo, manejando el caso si track es null

    let slideWidth;
    let currentSlideIndex = 0;
    let slidesPerPage = 0;

    // --- VARIABLES PARA EL SWIPE TÁCTIL (TOUCH Y MOUSE) ---
    let startX = 0;
    let endX = 0;
    let isDragging = false;


    // --- 2. Funciones del Carrusel (Solo si los elementos existen) ---
    if (track && nextButton && prevButton && dotsContainer && carouselViewport) {

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
                slidesPerPage = 5;
            } else {
                slidesPerPage = Math.floor(visibleViewportWidth / slideWidth);
            }

            if (slidesPerPage <= 0) {
                slidesPerPage = 1;
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

        function moveToSlide(index) {
            if (index < 0) {
                currentSlideIndex = 0;
            } else if (index > slides.length - slidesPerPage) {
                currentSlideIndex = slides.length - slidesPerPage;
            } else {
                currentSlideIndex = index;
            }

            const offset = -currentSlideIndex * slideWidth;
            track.style.transform = `translateX(${offset}px)`;

            updateDots();
            updateArrowVisibility();
        }

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

        function updateDots() {
            const dots = Array.from(dotsContainer.children);
            if (dots.length === 0) return;

            dots.forEach((dot, i) => {
                dot.classList.remove('active');
                if (currentSlideIndex >= (i * slidesPerPage) && currentSlideIndex < ((i + 1) * slidesPerPage)) {
                    dot.classList.add('active');
                }
            });

            if (currentSlideIndex === 0 && dots.length > 0) {
                dots[0].classList.add('active');
            }
            if (currentSlideIndex >= (slides.length - slidesPerPage) && dots.length > 0) {
                dots[dots.length - 1].classList.add('active');
            }
        }

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

            if (swipeDistance < -swipeThreshold && currentSlideIndex < slides.length - slidesPerPage) {
                moveToSlide(currentSlideIndex + slidesPerPage);
            }
            else if (swipeDistance > swipeThreshold && currentSlideIndex > 0) {
                moveToSlide(currentSlideIndex - slidesPerPage);
            }
            else {
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
            moveToSlide(0);
        });
    }


    // --- 6. FUNCIONALIDAD PARA EL MODAL DE CERTIFICADOS ---
    const certificadoModal = document.getElementById('certificado-modal');
    const modalImg = document.getElementById('img-certificado-modal');
    const captionText = document.getElementById('modal-caption');
    const closeModal = document.querySelector('.cerrar-modal');

    // Usamos los mismos 'slides' del carrusel para el modal si el carrusel se inicializó.
    // Si no, seleccionamos directamente todos los .certificado-circulo
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

        closeModal.addEventListener('click', function() {
            certificadoModal.style.display = 'none';
            modalImg.src = '';
            if (captionText) captionText.textContent = '';
        });

        certificadoModal.addEventListener('click', function(event) {
            if (event.target === certificadoModal) {
                certificadoModal.style.display = 'none';
                modalImg.src = '';
                if (captionText) captionText.textContent = '';
            }
        });

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
        console.warn("Elementos HTML para el modal de certificados no encontrados (ej: #certificado-modal, #img-certificado-modal, .cerrar-modal) o no hay certificados con clase '.certificado-circulo' para clickear. La funcionalidad del modal de certificados no se activará.");
    }


    // --- FUNCIONALIDAD PARA EL MODAL DE CONTENIDO GRATUITO ---

    // Elementos del modal de contenido gratuito
    const btnAbrirContenidoModal = document.getElementById('descarga-aqui-btn');
    const contenidoGratuitoModal = document.getElementById('contenido-gratuito-modal');
    const cerrarContenidoModal = document.querySelector('.cerrar-modal-gratuito');
    const formContenidoGratuito = document.getElementById('form-contenido-gratuito');

    if (btnAbrirContenidoModal && contenidoGratuitoModal && cerrarContenidoModal && formContenidoGratuito) {

        btnAbrirContenidoModal.addEventListener('click', function(e) {
            e.preventDefault();
            contenidoGratuitoModal.style.display = 'flex';
        });

        cerrarContenidoModal.addEventListener('click', function() {
            contenidoGratuitoModal.style.display = 'none';
            formContenidoGratuito.reset();
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

            const formData = new FormData();
            formData.append('email', userEmail);
            formData.append('contenidos_solicitados', selectedContents.join(', '));

            // --- ¡IMPORTANTE! Reemplaza 'https://formspree.io/f/TU_ENDPOINT_FORMSPREE' con tu URL real de Formspree ---
            fetch('https://formspree.io/f/TU_ENDPOINT_FORMSPREE', { // ¡CAMBIA ESTO!
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