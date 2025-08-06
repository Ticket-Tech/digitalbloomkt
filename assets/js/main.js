document.addEventListener('DOMContentLoaded', function() {

    // --- Declaración de variables globales para modales y otros elementos ---
    const certificadoModal = document.getElementById('certificado-modal');
    const modalImg = document.getElementById('img-certificado-modal');
    const captionText = document.getElementById('modal-caption');
    const closeModal = document.querySelector('.cerrar-modal'); 

    const contenidoGratuitoModal = document.getElementById('contenido-gratuito-modal');
    const formContenidoGratuito = document.getElementById('form-contenido-gratuito');
    const cerrarContenidoModalGratuito = document.querySelector('.cerrar-modal-gratuito'); 


    // --- 1. Lógica para el botón "Enviar Consulta" del formulario de contacto ---
    const contactForm = document.getElementById('contactForm');
    const enviarConsultaBtn = document.getElementById('enviarConsultaBtn');

    if (enviarConsultaBtn && contactForm) {
        enviarConsultaBtn.addEventListener('click', function() {
            if (!contactForm.checkValidity()) {
                contactForm.reportValidity(); 
                return; 
            }

            const nombre = document.getElementById('nombre').value;
            const email = document.getElementById('email').value;
            const consulta = document.getElementById('consulta').value;

            // ¡IMPORTANTE! Ambos formularios ahora usarán este email.
            const destinatario = 'brendadujovich@gmail.com'; 

            const asunto = encodeURIComponent('Nueva Consulta desde el Sitio Web de DigitalBloomKT');

            const cuerpo = encodeURIComponent(
                `Nombre: ${nombre}\n` +
                `Email: ${email}\n\n` +
                `Mensaje:\n${consulta}`
            );

            const mailtoLink = `mailto:${destinatario}?subject=${asunto}&body=${cuerpo}`;

            window.open(mailtoLink, '_blank');

            contactForm.reset();
        });
    }


    // --- 2. Lógica del Carrusel de Certificados ---
    const track = document.querySelector('.certificados-container');
    const nextButton = document.querySelector('.carousel-next-btn');
    const prevButton = document.querySelector('.carousel-prev-btn');
    const dotsContainer = document.querySelector('.carousel-dots');
    const carouselViewport = document.querySelector('.carousel-viewport');

    if (track && nextButton && prevButton && dotsContainer && carouselViewport) {
        const slides = Array.from(track.children); 
        let slideWidth; 
        let currentSlideIndex = 0; 
        let slidesPerPage = 0; 

        let startX = 0;
        let endX = 0;
        let isDragging = false;

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
                if (slidesPerPage > 5) slidesPerPage = 5; 
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
                if (currentSlideIndex === (slides.length - slidesPerPage) && i === dots.length - 1 && slides.length > slidesPerPage) {
                    dot.classList.add('active');
                }
            });
            if (currentSlideIndex === 0 && dots.length > 0) {
                dots[0].classList.add('active');
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

        nextButton.addEventListener('click', () => {
            moveToSlide(currentSlideIndex + slidesPerPage);
        });

        prevButton.addEventListener('click', () => {
            moveToSlide(currentSlideIndex - slidesPerPage);
        });

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

        calculateSlideDimensions();
        setupDots();
        moveToSlide(0);

        window.addEventListener('resize', () => {
            calculateSlideDimensions();
            setupDots();
            moveToSlide(currentSlideIndex);
        });
    } else {
        console.error("ERROR: No se pudieron encontrar todos los elementos del carrusel. Verifica tus clases HTML.");
        if (nextButton) nextButton.style.display = 'none';
        if (prevButton) prevButton.style.display = 'none';
        if (dotsContainer) dotsContainer.style.display = 'none';
    }


    // --- 3. FUNCIONALIDAD PARA EL MODAL DE CERTIFICADOS ---
    const certificadosParaModal = document.querySelectorAll('.certificado-circulo'); 

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

    } else {
        console.warn("Elementos HTML para el modal de certificados no encontrados o no hay certificados para clickear. La funcionalidad del modal de certificados no se activará.");
    }


    // --- 4. FUNCIONALIDAD PARA EL MODAL DE CONTENIDO GRATUITO ---
    const btnAbrirContenidoModalGratuito = document.getElementById('descarga-aqui-btn');

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

            // Ambos formularios ahora usarán este email.
            const recipientEmail = 'brendadujovich@gmail.com'; 
            const subject = encodeURIComponent('Solicitud de Contenido Gratuito desde el Sitio Web');
            let emailBody = `Hola DIGITALBLOOMKT,\n\n`;
            emailBody += `El usuario ${userEmail} ha solicitado el siguiente contenido gratuito:\n\n`;
            emailBody += selectedContents.map(content => `- ${content}`).join('\n');
            emailBody += `\n\nPor favor, contacta a ${userEmail} para enviarle el contenido solicitado.`;
            emailBody += `\n\nSaludos,`;
            emailBody += `\nTu Sitio Web`;

            const body = encodeURIComponent(emailBody);

            const mailtoUrl = `mailto:${recipientEmail}?subject=${subject}&body=${body}`;

            window.open(mailtoUrl, '_blank'); 

            contenidoGratuitoModal.style.display = 'none';
            formContenidoGratuito.reset();
        });

    } else {
        console.warn("Algunos elementos del modal de contenido gratuito no fueron encontrados. La funcionalidad no se activará.");
    }

    // --- 5. MANEJO CENTRALIZADO DE LA TECLA ESCAPE PARA CERRAR CUALQUIER MODAL ---
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' || event.key === 'Esc') {
            if (certificadoModal && certificadoModal.style.display === 'flex') {
                certificadoModal.style.display = 'none';
                modalImg.src = '';
                if (captionText) captionText.textContent = '';
            }
            if (contenidoGratuitoModal && contenidoGratuitoModal.style.display === 'flex') {
                contenidoGratuitoModal.style.display = 'none';
                formContenidoGratuito.reset();
            }
        }
    });

    // --- 6. FUNCIONALIDAD PARA EL MENÚ FIJO EN ESCRITORIO (Versión corregida) ---
    const navMenuSection = document.querySelector('.nav-menu-section');
    const menu = document.querySelector('.menu');

    if (navMenuSection && menu) {
        const menuOffsetTop = navMenuSection.offsetTop;
        let menuPlaceholder = null;

        function handleScrollAndResize() {
            if (window.innerWidth >= 1024) {
                if (window.scrollY >= menuOffsetTop) {
                    if (!menuPlaceholder) {
                        menuPlaceholder = document.createElement('div');
                        menuPlaceholder.style.height = navMenuSection.offsetHeight + 'px';
                        navMenuSection.parentNode.insertBefore(menuPlaceholder, navMenuSection);
                    }

                    // AUMENTAMOS EL Z-INDEX PARA QUE EL MENÚ APAREZCA ENCIMA
                    navMenuSection.style.position = 'fixed';
                    navMenuSection.style.top = '0';
                    navMenuSection.style.width = '100%';
                    navMenuSection.style.zIndex = '9999'; // <-- CAMBIO AQUÍ
                } else {
                    navMenuSection.style.position = 'static';
                    navMenuSection.style.top = '';
                    navMenuSection.style.width = '';
                    navMenuSection.style.zIndex = '';
                    
                    if (menuPlaceholder) {
                        navMenuSection.parentNode.removeChild(menuPlaceholder);
                        menuPlaceholder = null;
                    }
                }
            } else {
                navMenuSection.style.position = 'static';
                navMenuSection.style.top = '';
                navMenuSection.style.width = '';
                navMenuSection.style.zIndex = '';
                
                if (menuPlaceholder) {
                    navMenuSection.parentNode.removeChild(menuPlaceholder);
                    menuPlaceholder = null;
                }
            }
        }

        window.addEventListener('scroll', handleScrollAndResize);
        window.addEventListener('resize', handleScrollAndResize);
    }
}); // CIERRE FINAL DEL document.addEventListener('DOMContentLoaded')