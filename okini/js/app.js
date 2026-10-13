/**
 * Okini Café - Lógica de Interfaz, Validaciones y Eventos
 */

document.addEventListener('DOMContentLoaded', async () => {
    const dateInput = document.getElementById('reservation-date');
    const coffeeContainer = document.getElementById('coffee-options-container');
    const reservationForm = document.getElementById('reservation-form');
    const reservationsList = document.getElementById('reservations-list');
    const summaryDate = document.getElementById('summary-date');
    const summaryCount = document.getElementById('summary-count');
    const summaryProgress = document.getElementById('summary-progress');
    const dailyLimitText = document.getElementById('daily-limit-text');
    const limitWarning = document.getElementById('limit-warning');
    const dateStatus = document.getElementById('date-status');
    const clearHistoryBtn = document.getElementById('clear-history');
    const submitBtn = document.getElementById('submit-btn');

    // Inicializar fecha de hoy por defecto (formato YYYY-MM-DD)
    const todayStr = new Date().toISOString().split('T')[0];
    dateInput.value = todayStr;
    dateInput.min = todayStr; // No permitir fechas pasadas

    // Cargar catálogo de cafés
    let catalogue = [];
    try {
        catalogue = await CoffeeAPI.getCatalogue();
        renderCatalogue(catalogue);
    } catch (e) {
        showToast('Error al cargar el catálogo de cafés', 'error');
    }

    // Actualizar datos y resumen al cambiar la fecha
    dateInput.addEventListener('change', async () => {
        await updateDailySummary(dateInput.value);
    });

    // Cargar estado inicial y reservas
    await updateDailySummary(todayStr);
    await loadReservations();

    // Evento Form Submit (Crear reserva)
    reservationForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const selectedDate = dateInput.value;
        const selectedCoffeeRadio = document.querySelector('input[name="coffee-type"]:checked');
        const notes = document.getElementById('reservation-notes').value.trim();

        if (!selectedDate) {
            showToast('Por favor selecciona una fecha válida.', 'error');
            return;
        }

        if (!selectedCoffeeRadio) {
            showToast('Por favor selecciona un tipo de café.', 'error');
            return;
        }

        const coffeeId = selectedCoffeeRadio.value;
        const coffeeObj = catalogue.find(c => c.id === coffeeId);

        const newReservation = {
            id: 'OKI-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
            date: selectedDate,
            coffeeId: coffeeId,
            coffeeName: coffeeObj ? coffeeObj.name : coffeeId,
            quantity: 1, // 1 taza por reserva
            notes: notes || 'Sin notas especiales',
            createdAt: new Date().toISOString()
        };

        try {
            submitBtn.disabled = true;
            submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin mr-2"></i> Procesando...`;

            await CoffeeAPI.saveReservation(newReservation);
            
            showToast(`¡Reserva confirmada! Pasa por el local por tu ${coffeeObj.name}.`, 'success');
            reservationForm.reset();
            dateInput.value = selectedDate; // Mantener la fecha seleccionada
            
            await updateDailySummary(selectedDate);
            await loadReservations();
        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = `<i class="fa-solid fa-mug-hot"></i><span>Confirmar Reserva en Local</span>`;
        }
    });

    // Limpiar historial
    clearHistoryBtn.addEventListener('click', async () => {
        if (confirm('¿Estás seguro de eliminar todo el historial de reservas?')) {
            await CoffeeAPI.clearAll();
            await updateDailySummary(dateInput.value);
            await loadReservations();
            showToast('Historial limpiado correctamente.', 'success');
        }
    });

    // Funciones auxiliares

    function renderCatalogue(items) {
        coffeeContainer.innerHTML = items.map((item, index) => `
            <div>
                <input type="radio" id="coffee-${item.id}" name="coffee-type" value="${item.id}" class="hidden coffee-card-radio" ${index === 0 ? 'checked' : ''}>
                <label for="coffee-${item.id}" class="coffee-card-label flex flex-col p-4 rounded-xl border border-coffee-200 cursor-pointer transition hover:border-coffee-600 bg-white">
                    <div class="flex items-center justify-between mb-2">
                        <span class="font-bold text-coffee-900 text-sm flex items-center">
                            <i class="fa-solid ${item.icon} text-coffee-700 mr-2 text-base"></i> ${item.name}
                        </span>
                        <i class="fa-solid fa-circle-check text-coffee-700 opacity-0 transition check-icon"></i>
                    </div>
                    <p class="text-xs text-coffee-600">${item.desc}</p>
                </label>
            </div>
        `).join('');

        // Añadir estilos visuales para radio checked
        document.querySelectorAll('.coffee-card-radio').forEach(radio => {
            radio.addEventListener('change', () => {
                document.querySelectorAll('.coffee-card-label').forEach(l => l.classList.remove('border-coffee-800', 'bg-coffee-50'));
                if (radio.checked) {
                    radio.nextElementSibling.classList.add('border-coffee-800', 'bg-coffee-50');
                }
            });
        });
        // Activar el primero por defecto
        if(items.length > 0) {
            document.querySelector('.coffee-card-label').classList.add('border-coffee-800', 'bg-coffee-50');
        }
    }

    async function updateDailySummary(dateStr) {
        summaryDate.textContent = formatDate(dateStr);
        const reservations = await CoffeeAPI.getReservations();
        const dateRes = reservations.filter(r => r.date === dateStr);
        const totalCups = dateRes.reduce((acc, curr) => acc + (curr.quantity || 1), 0);

        summaryCount.textContent = `${totalCups} / 2`;
        dailyLimitText.textContent = `${totalCups} / 2 tazas`;
        
        const percentage = (totalCups / 2) * 100;
        summaryProgress.style.width = `${percentage}%`;

        if (totalCups >= 2) {
            limitWarning.classList.remove('hidden');
            dateStatus.textContent = "Límite diario alcanzado (2/2)";
            dateStatus.className = "text-xs text-amber-700 font-semibold mt-1";
        } else {
            limitWarning.classList.add('hidden');
            const remaining = 2 - totalCups;
            dateStatus.textContent = `Disponible: Puedes reservar ${remaining} taza(s) más para este día.`;
            dateStatus.className = "text-xs text-coffee-600 mt-1";
        }
    }

    async function loadReservations() {
        const reservations = await CoffeeAPI.getReservations();
        
        if (reservations.length === 0) {
            reservationsList.innerHTML = `
                <div class="text-center py-8 text-coffee-600 text-sm">
                    <i class="fa-solid fa-mug-saucer text-2xl mb-2 block opacity-40"></i>
                    No tienes reservas registradas aún.
                </div>
            `;
            return;
        }

        reservationsList.innerHTML = reservations.map(res => `
            <div class="p-3.5 rounded-xl border border-coffee-200 bg-coffee-50/50 flex flex-col space-y-2 text-xs">
                <div class="flex justify-between items-start">
                    <div>
                        <span class="font-bold text-coffee-900 text-sm block">${res.coffeeName}</span>
                        <span class="text-coffee-600"><i class="fa-regular fa-calendar mr-1"></i> ${formatDate(res.date)}</span>
                    </div>
                    <span class="bg-coffee-800 text-white font-mono px-2 py-0.5 rounded text-[10px]">${res.id}</span>
                </div>
                <p class="text-coffee-700 italic bg-white/60 p-2 rounded border border-coffee-100">"${res.notes}"</p>
                <div class="flex justify-between items-center pt-1 border-t border-coffee-200/60">
                    <span class="text-coffee-600 flex items-center"><i class="fa-solid fa-store mr-1 text-amber-600"></i> En local</span>
                    <button onclick="cancelReservation('${res.id}')" class="text-red-600 hover:text-red-800 font-medium flex items-center">
                        <i class="fa-solid fa-trash-can mr-1"></i> Cancelar
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Función global para cancelar reserva desde el botón generado
    window.cancelReservation = async (id) => {
        if (confirm('¿Deseas cancelar esta reserva?')) {
            await CoffeeAPI.deleteReservation(id);
            await updateDailySummary(dateInput.value);
            await loadReservations();
            showToast('Reserva cancelada correctamente.', 'success');
        }
    };

    function showToast(message, type = 'success') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        
        const bgClass = type === 'success' ? 'bg-coffee-900 text-white border-coffee-700' : 'bg-red-700 text-white border-red-600';
        const icon = type === 'success' ? 'fa-circle-check text-green-400' : 'fa-circle-exclamation text-amber-300';

        toast.className = `flex items-center space-x-3 px-4 py-3 rounded-xl shadow-lg border text-xs font-medium transform transition-all duration-300 translate-y-2 opacity-0 ${bgClass}`;
        toast.innerHTML = `
            <i class="fa-solid ${icon} text-base"></i>
            <span>${message}</span>
        `;

        container.appendChild(toast);

        // Animar entrada
        setTimeout(() => {
            toast.classList.remove('translate-y-2', 'opacity-0');
        }, 10);

        // Remover después de 3.5 segundos
        setTimeout(() => {
            toast.classList.add('translate-y-2', 'opacity-0');
            setTimeout(() => toast.remove(), 300);
        }, 3500);
    }

    function formatDate(dateString) {
        const [year, month, day] = dateString.split('-');
        const date = new Date(year, month - 1, day);
        return date.toLocaleDateString('es-ES', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
    }
});
