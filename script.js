document.addEventListener('DOMContentLoaded', () => {

    // --- CHEIA API CENTRALIZATĂ ---
    // ATENȚIE: Înlocuiește cu propria ta cheie API de la Google AI Studio.
    const CHEIE_API_GEMINI = 'GEMINI API KEY';

    // =============================================
    // --- FUNCȚII GENERALE ȘI UTILITARE ---
    // =============================================

    /**
     * Adaugă un mesaj într-o fereastră de chat specifică și face scroll la final.
     * @param {string} text - Textul mesajului de adăugat.
     * @param {HTMLElement} elementFereastra - Elementul HTML al ferestrei de chat.
     * @param {...string} clase - O listă de clase CSS de adăugat la elementul de mesaj.
     * @returns {HTMLElement | null} - Elementul de mesaj creat sau null dacă fereastra nu există.
     */
    function adaugaMesajLaChat(text, elementFereastra, ...clase) {
        if (!elementFereastra) return null;
        const elementMesaj = document.createElement('div');
        elementMesaj.classList.add('chat-message', ...clase);
        elementMesaj.textContent = text;
        elementFereastra.appendChild(elementMesaj);
        elementFereastra.scrollTop = elementFereastra.scrollHeight;
        return elementMesaj;
    }

    /**
     * Obține un răspuns de la API-ul Google Gemini.
     * @param {string} mesajUtilizator - Mesajul curent trimis de utilizator.
     * @param {Array} istoricConversatie - Istoricul conversației.
     * @param {string} instructiuneSistem - Instrucțiunea de sistem pentru AI.
     * @returns {Promise<string>} - Răspunsul text de la AI.
     */
    async function obtineRaspunsDeLaAI(mesajUtilizator, istoricConversatie, instructiuneSistem) {
        if (CHEIE_API_GEMINI === 'CHEIA_TA_API_AICI') {
            return "Te rog, introdu o cheie API validă în fișierul script.js pentru a activa asistentul AI.";
        }
        
        const urlAPI = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${CHEIE_API_GEMINI}`;

        istoricConversatie.push({ role: 'user', content: mesajUtilizator });

        const continutFormatat = [
            { role: "user", parts: [{ text: `Instrucțiune de sistem: ${instructiuneSistem}` }] },
            { role: "model", parts: [{ text: "Am înțeles. Sunt pregătit." }] },
            ...istoricConversatie.map(msg => ({
                role: msg.role === 'ai' ? 'model' : 'user',
                parts: [{ text: msg.content }]
            }))
        ];

        try {
            const raspuns = await fetch(urlAPI, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: continutFormatat })
            });

            if (!raspuns.ok) {
                const dateEroare = await raspuns.json();
                throw new Error(`Eroare API: ${raspuns.status} - ${dateEroare.error?.message || 'Verifică cheia API'}`);
            }

            const date = await raspuns.json();
            const mesajAI = date.candidates?.[0]?.content?.parts?.[0]?.text || "Îmi pare rău, nu am putut genera un răspuns.";
            
            istoricConversatie.push({ role: 'ai', content: mesajAI });
            return mesajAI;

        } catch (error) {
            console.error("Eroare la obținerea răspunsului de la AI:", error);
            istoricConversatie.pop();
            return "Oops! A apărut o eroare. Verifică consola (F12) pentru detalii sau încearcă din nou.";
        }
    }

    // =======================================================
    // --- INIȚIALIZAREA COMPONENTELOR SPECIFICE PAGINII ---
    // =======================================================

    // --- Navigație Mobilă (Hamburger) ---
    const butonHamburger = document.getElementById('hamburger-menu');
    const meniuNavigare = document.querySelector('.main-nav');

    if (butonHamburger && meniuNavigare) {
        butonHamburger.addEventListener('click', () => {
            meniuNavigare.classList.toggle('active');
        });
    }

    // --- Carusel de Testimoniale (Pagina Principală) ---
    const caruselTestimonialeWrapper = document.querySelector('.testimonial-carousel-wrapper');
    if (caruselTestimonialeWrapper) {
        const carusel = document.getElementById('testimonial-carousel');
        const butonInapoi = document.getElementById('prev-btn');
        const butonInainte = document.getElementById('next-btn');
        let indexCurent = 1;

        function actualizeazaCarusel() {
            const decalaj = -indexCurent * 100;
            carusel.style.transform = `translateX(${decalaj}%)`;
        }

        butonInapoi.addEventListener('click', () => {
            indexCurent = (indexCurent > 0) ? indexCurent - 1 : carusel.children.length - 1;
            actualizeazaCarusel();
        });

        butonInainte.addEventListener('click', () => {
            indexCurent = (indexCurent < carusel.children.length - 1) ? indexCurent + 1 : 0;
            actualizeazaCarusel();
        });
    }

    // --- Animație Text la Derulare (Pagina Principală) ---
    const containerTextScroll = document.getElementById('scroll-text-container');
    if (containerTextScroll) {
        const elementeTextScroll = containerTextScroll.querySelectorAll('.scroll-text-reveal');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    elementeTextScroll.forEach((element, index) => {
                        setTimeout(() => element.classList.add('active'), index * 300);
                    });
                    observer.unobserve(entry.target);
                }
            });
        }, { rootMargin: '-200px', threshold: 0.1 });
        observer.observe(containerTextScroll);
    }

    // --- Chat de Testare (Pagina Principală) ---
    const formularChatTest = document.getElementById('chat-form');
    if (formularChatTest) {
        const fereastraChatTest = document.getElementById('chat-window');
        const inputUtilizatorTest = document.getElementById('user-input');
        const selectorContext = document.getElementById('ai-context');
        let istoricConversatieTest = [];

        const instructiuniContext = {
            general: "Ești un asistent general de ajutor. Fii concis și prietenos. Răspunde întotdeauna în limba română.",
            sales: "Ești un agent de vânzări imobiliare profesionist. Răspunde la întrebări despre proprietăți, programează vizionări și menționează facilități. Fii proactiv și încearcă să califici clientul. Răspunde întotdeauna în limba română.",
            travel: "Ești un agent de turism entuziast. Ajută utilizatorii să găsească pachete de vacanță, zboruri și hoteluri. Oferă alternative și sfaturi utile. Răspunde întotdeauna în limba română.",
            support: "Ești un specialist în suport tehnic IT. Fii răbdător și oferă instrucțiuni clare, pas cu pas. Pune întrebări pentru a diagnostica problema. Răspunde întotdeauna în limba română.",
            restaurant: "Ești managerul restaurantului 'Lingura de Aur'. Preia rezervări, oferă detalii despre meniu și evenimente speciale. Fii politicos și ospitalier. Răspunde întotdeauna în limba română."
        };

        formularChatTest.addEventListener('submit', async (e) => {
            e.preventDefault();
            const mesajUtilizator = inputUtilizatorTest.value.trim();
            if (!mesajUtilizator) return;

            adaugaMesajLaChat(mesajUtilizator, fereastraChatTest, 'user');
            inputUtilizatorTest.value = '';

            const elementIncarcare = adaugaMesajLaChat('...', fereastraChatTest, 'ai', 'loading');

            const instructiuneCurenta = instructiuniContext[selectorContext.value];
            const raspunsAI = await obtineRaspunsDeLaAI(mesajUtilizator, istoricConversatieTest, instructiuneCurenta);

            elementIncarcare.remove();
            adaugaMesajLaChat(raspunsAI, fereastraChatTest, 'ai');
        });

        selectorContext.addEventListener('change', () => {
            istoricConversatieTest = [];
            fereastraChatTest.innerHTML = '';
            adaugaMesajLaChat(`Super! Acum sunt ${selectorContext.options[selectorContext.selectedIndex].text}. Cu ce te pot ajuta?`, fereastraChatTest, 'ai');
        });
    }

    // --- Carusel "Cazuri de Utilizare" (Pagina Chat-Widget) ---
    const caruselCazuri = document.getElementById('use-cases-carousel');
    if (caruselCazuri) {
        const butonInapoi = document.getElementById('use-case-prev');
        const butonInainte = document.getElementById('use-case-next');
        const carduri = caruselCazuri.querySelectorAll('.use-case-card');
        let latimeCard = 0;
        let indexCurent = 0;
        let carduriVizibile = 3;

        function actualizeazaDimensiuniCarusel() {
            if (carduri.length === 0) return;
            latimeCard = carduri[0].offsetWidth + 20;
            if (window.innerWidth <= 992) carduriVizibile = 2;
            else if (window.innerWidth <= 768) carduriVizibile = 1.25;
            else carduriVizibile = 3;
        }

        function actualizeazaPozitieCarusel() {
            const maxIndex = Math.max(0, carduri.length - carduriVizibile);
            if (indexCurent > maxIndex) indexCurent = maxIndex;
            if (indexCurent < 0) indexCurent = 0;
            caruselCazuri.style.transform = `translateX(-${indexCurent * latimeCard}px)`;
        }
        
        actualizeazaDimensiuniCarusel();
        window.addEventListener('resize', () => {
            actualizeazaDimensiuniCarusel();
            actualizeazaPozitieCarusel();
        });

        butonInainte.addEventListener('click', () => {
            if (indexCurent < carduri.length - carduriVizibile) {
                indexCurent++;
                actualizeazaPozitieCarusel();
            }
        });

        butonInapoi.addEventListener('click', () => {
            if (indexCurent > 0) {
                indexCurent--;
                actualizeazaPozitieCarusel();
            }
        });
    }

    // --- Asistent de Site (Widget Global) ---
    const bulaChat = document.getElementById('chat-bubble');
    if (bulaChat) {
        const widgetChat = document.getElementById('chat-widget');
        const butonInchideWidget = document.getElementById('chat-widget-close');
        const formularWidget = document.getElementById('widget-chat-form');
        const inputWidget = document.getElementById('widget-user-input');
        const fereastraChatWidget = document.getElementById('widget-chat-window');
        let istoricConversatieWidget = [];
        const instructiuneSistemWidget = "Ești un asistent virtual prietenos pentru site-ul aichat.md. Misiunea ta este să ghidezi utilizatorii, să răspunzi la întrebări despre serviciile noastre (automatizare chat cu AI pentru Instagram, Facebook, Site, etc.) și să îi încurajeazi să încerce secțiunea de testare de pe pagina principală. Fii concis, profesionist și răspunde întotdeauna în limba română.";

        bulaChat.addEventListener('click', () => widgetChat.classList.toggle('active'));
        butonInchideWidget.addEventListener('click', () => widgetChat.classList.remove('active'));

        formularWidget.addEventListener('submit', async (e) => {
            e.preventDefault();
            const mesajUtilizator = inputWidget.value.trim();
            if (!mesajUtilizator) return;

            adaugaMesajLaChat(mesajUtilizator, fereastraChatWidget, 'user');
            inputWidget.value = '';

            const elementIncarcare = adaugaMesajLaChat('...', fereastraChatWidget, 'ai', 'loading');

            const raspunsAI = await obtineRaspunsDeLaAI(mesajUtilizator, istoricConversatieWidget, instructiuneSistemWidget);

            elementIncarcare.remove();
            adaugaMesajLaChat(raspunsAI, fereastraChatWidget, 'ai');
        });
    }
});