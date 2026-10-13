/**
 * Okini API Service Layer
 * Permite alternar fácilmente entre almacenamiento local (localStorage)
 * y un servidor backend real cambiando USE_SERVER a true y configurando SERVER_URL.
 */

const CONFIG = {
    USE_SERVER: false, // Cambiar a true cuando se conecte al servidor backend
    SERVER_URL: 'https://api.okinicafe.local/v1'
};

const CoffeeAPI = {
    // Catálogo de cafés disponibles en el local
    getCatalogue: async () => {
        const catalogue = [
            { id: 'espresso', name: 'Espresso Intenso', desc: 'Café corto, puro y con cuerpo robusto.', icon: 'fa-mug-hot' },
            { id: 'cappuccino', name: 'Cappuccino Clásico', desc: 'Espresso con leche texturizada y espuma cremosa.', icon: 'fa-mug-saucer' },
            { id: 'latte', name: 'Café Latte', desc: 'Suave combinación de espresso y abundante leche.', icon: 'fa-cup-hot' },
            { id: 'americano', name: 'Café Americano', desc: 'Espresso diluido con agua caliente, suave y aromático.', icon: 'fa-mug-hot' }
        ];

        if (CONFIG.USE_SERVER) {
            try {
                // Ejemplo de llamada real al servidor:
                // const res = await fetch(`${CONFIG.SERVER_URL}/catalogue`);
                // return await res.json();
            } catch (e) {
                console.error("Error conectando con el servidor, usando fallback local", e);
            }
        }
        return catalogue;
    },

    // Obtener todas las reservas guardadas
    getReservations: async () => {
        if (CONFIG.USE_SERVER) {
            try {
                // const res = await fetch(`${CONFIG.SERVER_URL}/reservations`);
                // return await res.json();
            } catch (e) {
                console.error("Error al obtener reservas del servidor", e);
            }
        }
        // Modo LocalStorage
        const data = localStorage.getItem('okini_reservations');
        return data ? JSON.parse(data) : [];
    },

    // Guardar una nueva reserva
    saveReservation: async (reservation) => {
        if (CONFIG.USE_SERVER) {
            try {
                /*
                const res = await fetch(`${CONFIG.SERVER_URL}/reservations`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(reservation)
                });
                return await res.json();
                */
            } catch (e) {
                console.error("Error guardando en servidor", e);
                throw e;
            }
        }

        // Modo LocalStorage con validación de límite de 2 tazas por día
        const reservations = await CoffeeAPI.getReservations();
        
        // Contar tazas para la fecha seleccionada
        const dateReservations = reservations.filter(r => r.date === reservation.date);
        const currentCount = dateReservations.reduce((acc, curr) => acc + (curr.quantity || 1), 0);

        if (currentCount + reservation.quantity > 2) {
            throw new Error(`Has superado el límite de 2 tazas diarias para la fecha ${reservation.date}. Actualmente tienes ${currentCount} taza(s) reservada(s).`);
        }

        reservations.unshift(reservation);
        localStorage.setItem('okini_reservations', JSON.stringify(reservations));
        return { success: true, message: 'Reserva guardada exitosamente en el local', reservation };
    },

    // Eliminar una reserva
    deleteReservation: async (id) => {
        if (CONFIG.USE_SERVER) {
            try {
                // await fetch(`${CONFIG.SERVER_URL}/reservations/${id}`, { method: 'DELETE' });
                // return { success: true };
            } catch (e) {
                console.error("Error eliminando en servidor", e);
            }
        }

        let reservations = await CoffeeAPI.getReservations();
        reservations = reservations.filter(r => r.id !== id);
        localStorage.setItem('okini_reservations', JSON.stringify(reservations));
        return { success: true };
    },

    // Limpiar historial completo
    clearAll: async () => {
        if (CONFIG.USE_SERVER) {
            // await fetch(`${CONFIG.SERVER_URL}/reservations`, { method: 'DELETE' });
        }
        localStorage.removeItem('okini_reservations');
        return { success: true };
    }
};
