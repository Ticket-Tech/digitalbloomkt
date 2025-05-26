document.addEventListener('DOMContentLoaded', function() {
    // Selecciona los elementos clave del carrusel
    const track = document.querySelector('.carousel-track'); // Contenedor de los certificados que se desliza
    const nextButton = document.querySelector('.carousel-next-btn');
    const prevButton = document.querySelector('.carousel-prev-btn');
    const dotsContainer = document.querySelector('.carousel-dots');
    const carouselViewport = document.querySelector('.carousel-viewport'); // La "ventana" visible del carrusel

    // --- VERIFICACIÓN CRÍTICA DE LOS ELEMENTOS ---
    // Si falta alguno de los elementos principales, mostramos un error y detenemos el script
    if (!track || !nextButton || !prevButton || !dotsContainer || !carouselViewport) {
        console.error("ERROR: No se pudieron encontrar todos los elementos del carrusel. Verifica tus clases HTML.");
        console.log("Track:", track);
        console.log("Next Button:", nextButton);
        console.log("Prev Button:", prevButton);
        console.log("Dots Container:", dotsContainer);
        console.log("Viewport:", carouselViewport);
        // Ocultamos los controles si no se encuentran los elementos clave para evitar errores visuales
        if (nextButton) nextButton.style.display = 'none';
        if (prevButton) prevButton.style.display = 'none';
        if (dotsContainer) dotsContainer.style.display = 'none';
        return; // Detiene la ejecución del script
    }

    const slides = Array.from(track.children); // Todos tus .certificado-circulo

    let slideWidth; // Ancho total de un slide (incluyendo su margen)
    let currentSlideIndex = 0; // Índice del slide actual visible
    let slidesPerPage = 0; // Cuántos slides se muestran por "página"

    // --- VARIABLES PARA EL SWIPE TÁCTIL (TOUCH Y MOUSE) ---
    let startX = 0; // Posición X donde el toque/click comenzó
    let endX = 0;   // Posición X donde el toque/click terminó o se está moviendo
    let isDragging = false; // Bandera para controlar si el usuario está arrastrando


    // Función principal para calcular las dimensiones y cuántos slides caben
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
        
        const slideElementWidth = firstSlide.offsetWidth; // Ancho renderizado del elemento
        
        // Obtenemos el margin-right como un número flotante
        const marginRight = parseFloat(slideComputedStyle.marginRight);
        
        // El ancho de un slide es su ancho propio más su margen derecho
        slideWidth = slideElementWidth + marginRight; 

        // Ancho visible del área del carrusel
        const visibleViewportWidth = carouselViewport.offsetWidth;
        
        const desktopBreakpoint = 1200; // Define tu breakpoint para escritorio

        // Lógica para determinar cuántos slides mostrar por página
        if (window.innerWidth >= desktopBreakpoint) { 
            slidesPerPage = 5; // Para pantallas de escritorio, siempre 5
        } else {
            // Para otras resoluciones (tabletas, móviles), calcula cuántos caben
            slidesPerPage = Math.floor(visibleViewportWidth / slideWidth);
        }
        
        // Asegurarse de que siempre mostremos al menos 1 slide
        if (slidesPerPage <= 0) {
            slidesPerPage = 1; 
        }
        
        // Asegurarse de no mostrar más slides de los que existen
        if (slidesPerPage > slides.length) {
            slidesPerPage = slides.length;
        }

        // Ocultar/mostrar botones y puntos si todos los slides caben en una página
        if (slides.length <= slidesPerPage) {
            nextButton.style.display = 'none';
            prevButton.style.display = 'none';
            dotsContainer.style.display = 'none';
        } else {
            nextButton.style.display = 'block';
            prevButton.style.display = 'block';
            dotsContainer.style.display = 'block';
        }

        // Importante: Después de recalcular, asegura que la posición sea correcta.
        // Esto evita que se "corte" o se vea raro si se redimensiona la ventana.
        moveToSlide(currentSlideIndex); 
    }

    // Función para mover el carrusel al slide en el índice dado
    function moveToSlide(index) {
        // Limitar el índice para que no vaya más allá del inicio o el final
        if (index < 0) {
            currentSlideIndex = 0; 
        } else if (index > slides.length - slidesPerPage) {
            currentSlideIndex = slides.length - slidesPerPage; 
        } else {
            currentSlideIndex = index;
        }

        // Calcular el desplazamiento en píxeles y aplicarlo al 'track'
        const offset = -currentSlideIndex * slideWidth;
        track.style.transform = `translateX(${offset}px)`; 
        
        updateDots(); // Actualiza el estado de los puntos de paginación
        updateArrowVisibility(); // Actualiza el estado de las flechas
    }

    // Función para crear los puntos de paginación
    function setupDots() {
        dotsContainer.innerHTML = ''; // Limpia los puntos existentes
        // Calcula el número total de "páginas" basándose en slidesPerPage
        const totalPages = Math.ceil(slides.length / slidesPerPage); 
        
        for (let i = 0; i < totalPages; i++) {
            const dot = document.createElement('span');
            dot.classList.add('dot');
            // Al hacer clic en un punto, va a la primera slide de esa "página"
            dot.addEventListener('click', () => moveToSlide(i * slidesPerPage)); 
            dotsContainer.appendChild(dot);
        }
        updateDots(); // Asegura que el punto inicial esté activo
    }

    // Función para actualizar el estado activo de los puntos de paginación
    function updateDots() {
        const dots = Array.from(dotsContainer.children);
        if (dots.length === 0) return; 

        dots.forEach((dot, i) => {
            dot.classList.remove('active');
            // Determina qué "página" está activa según el slide actual
            if (currentSlideIndex >= (i * slidesPerPage) && currentSlideIndex < ((i + 1) * slidesPerPage)) {
                 dot.classList.add('active');
            }
        });
        
        // Ajustes para el primer y último punto, asegurando que estén activos en los extremos
        if (currentSlideIndex === 0 && dots.length > 0) {
            dots[0].classList.add('active');
        }
        if (currentSlideIndex >= (slides.length - slidesPerPage) && dots.length > 0) {
            // Asegura que el último punto se active cuando se llega al final
            dots[dots.length - 1].classList.add('active');
        }
    }

    // Función para habilitar o deshabilitar las flechas de navegación
    function updateArrowVisibility() {
        // Deshabilita la flecha "anterior" si estás en el primer slide
        prevButton.disabled = currentSlideIndex === 0;
        // Deshabilita la flecha "siguiente" si estás en el último slide visible
        nextButton.disabled = currentSlideIndex >= (slides.length - slidesPerPage);
        
        // Si todos los slides caben en la vista, oculta ambas flechas
        if (slides.length <= slidesPerPage) {
            prevButton.style.display = 'none';
            nextButton.style.display = 'none';
        } else {
            // Si no caben, asegúrate de que las flechas estén visibles
            // (y luego las habilita/deshabilita con disabled)
            prevButton.style.display = 'block'; 
            nextButton.style.display = 'block'; 
        }
    }

    // --- Configuración de Event Listeners de Clicks ---
    // Escucha el clic en el botón "siguiente"
    nextButton.addEventListener('click', () => {
        moveToSlide(currentSlideIndex + slidesPerPage); // Mueve por el número de slides por página
    });

    // Escucha el clic en el botón "anterior"
    prevButton.addEventListener('click', () => {
        moveToSlide(currentSlideIndex - slidesPerPage); // Mueve hacia atrás por el número de slides por página
    });

    // --- EVENT LISTENERS PARA EL SWIPE TÁCTIL (TOUCH Y MOUSE PARA DRAG) ---

    // Evento de inicio (touchstart para táctil, mousedown para mouse)
    track.addEventListener('touchstart', handleStart);
    track.addEventListener('mousedown', handleStart);

    function handleStart(e) {
        isDragging = true;
        // Guarda la posición inicial del toque/click
        startX = (e.touches ? e.touches[0].clientX : e.clientX);
        // Desactiva transiciones CSS para un arrastre más fluido
        track.style.transition = 'none';
        // Para mouse, evita arrastrar texto o imágenes
        if (e.type === 'mousedown') {
            e.preventDefault(); 
        }
    }

    // Evento de movimiento (touchmove para táctil, mousemove para mouse)
    track.addEventListener('touchmove', handleMove);
    track.addEventListener('mousemove', handleMove);

    function handleMove(e) {
        if (!isDragging) return; // Solo si estamos arrastrando

        endX = (e.touches ? e.touches[0].clientX : e.clientX);
        const currentTranslateX = -currentSlideIndex * slideWidth;
        const dragDistance = endX - startX;
        
        // Mueve el track directamente con el dedo/mouse
        track.style.transform = `translateX(${currentTranslateX + dragDistance}px)`;
        
        // Opcional: Prevenir el desplazamiento vertical de la página
        // si el movimiento horizontal es dominante. Úsalo con precaución.
        // if (Math.abs(dragDistance) > 10) { 
        //     e.preventDefault();
        // }
    }

    // Evento de fin (touchend para táctil, mouseup para mouse, mouseleave para mouse)
    track.addEventListener('touchend', handleEnd);
    track.addEventListener('mouseup', handleEnd);
    // Agregamos mouseleave en el track para si el usuario suelta el mouse fuera del carrusel
    track.addEventListener('mouseleave', handleEnd); 

    function handleEnd() {
        if (!isDragging) return; // Solo si estábamos arrastrando
        isDragging = false; // Resetea la bandera de arrastre

        // Reactiva las transiciones CSS
        track.style.transition = 'transform 0.3s ease-in-out'; 

        const swipeDistance = endX - startX;
        const swipeThreshold = 50; // Mínima distancia para considerar un swipe válido (en píxeles)

        // Si el swipe es hacia la izquierda (next slide) y es lo suficientemente largo
        if (swipeDistance < -swipeThreshold && currentSlideIndex < slides.length - slidesPerPage) {
            moveToSlide(currentSlideIndex + slidesPerPage);
        } 
        // Si el swipe es hacia la derecha (prev slide) y es lo suficientemente largo
        else if (swipeDistance > swipeThreshold && currentSlideIndex > 0) {
            moveToSlide(currentSlideIndex - slidesPerPage);
        } 
        // Si no fue un swipe válido o no se movió lo suficiente, vuelve a la posición actual
        else {
            moveToSlide(currentSlideIndex); // Vuelve al slide actual sin cambiar
        }

        // Resetea las posiciones de inicio y fin
        startX = 0;
        endX = 0;
    }


    // --- Inicialización del Carrusel ---
    // Estas funciones se llaman al cargar la página
    calculateSlideDimensions(); 
    setupDots(); 
    moveToSlide(0); // Inicia el carrusel en el primer slide (posición 0)

    // --- Manejo de la Responsividad ---
    // Recalcula y ajusta el carrusel cuando se cambia el tamaño de la ventana
    window.addEventListener('resize', () => {
        calculateSlideDimensions(); 
        setupDots(); 
        // Es mejor reiniciar la posición al redimensionar para evitar glitches de visualización
        moveToSlide(0); 
    });
});